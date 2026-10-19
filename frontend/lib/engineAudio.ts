'use client';

/**
 * Synthesised engine note for the launch-control button — no audio files.
 *
 * A straight-six fires 3 times per crank revolution, so the fundamental is
 * rpm / 20 Hz (50 Hz at idle, ~425 Hz at the 8500 rpm limiter). Two detuned
 * saws + a square sub an octave down go through a soft-clip waveshaper and a
 * low-pass whose cutoff opens with revs, then a compressor so it never gets
 * harsh. Exhaust "pops" on lift-off are short band-passed noise bursts.
 */

import { useSyncExternalStore } from 'react';

/* ------------------------------------------------------------------ *
 * Sound on/off preference — shared by the navbar toggle and the button.
 * ------------------------------------------------------------------ */

const SOUND_KEY = 'l7it_engine_sound';
const listeners = new Set<() => void>();

function readSoundOn(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setSoundOn(on: boolean) {
  try {
    localStorage.setItem(SOUND_KEY, on ? 'on' : 'off');
  } catch {
    /* private mode — preference just won't persist */
  }
  listeners.forEach((l) => l());
}

export function isSoundOn(): boolean {
  return typeof window !== 'undefined' && readSoundOn();
}

export function useSoundOn(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    readSoundOn,
    () => true,
  );
}

/* ------------------------------------------------------------------ *
 * Engine
 * ------------------------------------------------------------------ */

let sharedCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!sharedCtx) sharedCtx = new AC();
  if (sharedCtx.state === 'suspended') void sharedCtx.resume();
  return sharedCtx;
}

function softClipCurve(amount: number) {
  const n = 1024;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((1 + amount) * x) / (1 + amount * Math.abs(x));
  }
  return curve;
}

export interface Engine {
  /** rpm 800–8500, throttle 0–1 */
  set(rpm: number, throttle: number): void;
  /** A burst of exhaust crackles. */
  pops(count?: number): void;
  /** Fade out and release the nodes. */
  stop(): void;
}

export function startEngine(): Engine | null {
  const ctx = getContext();
  if (!ctx) return null;

  const t0 = ctx.currentTime;
  const out = ctx.createDynamicsCompressor();
  out.threshold.value = -18;
  out.ratio.value = 6;
  out.connect(ctx.destination);

  const master = ctx.createGain();
  master.gain.setValueAtTime(0, t0);
  master.gain.linearRampToValueAtTime(0.16, t0 + 0.08);
  master.connect(out);

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 500;
  lowpass.Q.value = 3;
  lowpass.connect(master);

  const shaper = ctx.createWaveShaper();
  shaper.curve = softClipCurve(6);
  shaper.connect(lowpass);

  const sawA = ctx.createOscillator();
  sawA.type = 'sawtooth';
  const sawB = ctx.createOscillator();
  sawB.type = 'sawtooth';
  sawB.detune.value = 14;
  const sub = ctx.createOscillator();
  sub.type = 'square';
  const subGain = ctx.createGain();
  subGain.gain.value = 0.45;

  sawA.connect(shaper);
  sawB.connect(shaper);
  sub.connect(subGain).connect(shaper);

  const oscillators = [sawA, sawB, sub];
  oscillators.forEach((o) => o.start(t0));

  let stopped = false;

  const engine: Engine = {
    set(rpm, throttle) {
      if (stopped) return;
      const t = ctx.currentTime;
      const f = Math.max(30, rpm / 20);
      sawA.frequency.setTargetAtTime(f, t, 0.025);
      sawB.frequency.setTargetAtTime(f * 1.003, t, 0.025);
      sub.frequency.setTargetAtTime(f / 2, t, 0.025);
      lowpass.frequency.setTargetAtTime(350 + rpm * 0.55 + throttle * 900, t, 0.04);
      master.gain.setTargetAtTime(0.1 + throttle * 0.12, t, 0.05);
    },
    pops(count = 3) {
      if (stopped) return;
      const len = Math.floor(ctx.sampleRate * 0.05);
      const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      for (let k = 0; k < count; k++) {
        const at = ctx.currentTime + 0.05 + k * (0.07 + Math.random() * 0.06);
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const band = ctx.createBiquadFilter();
        band.type = 'bandpass';
        band.frequency.value = 900 + Math.random() * 700;
        band.Q.value = 1.2;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.5, at);
        g.gain.exponentialRampToValueAtTime(0.001, at + 0.05);
        src.connect(band).connect(g).connect(out);
        src.start(at);
      }
    },
    stop() {
      if (stopped) return;
      stopped = true;
      const t = ctx.currentTime;
      oscillators.forEach((o) => o.frequency.setTargetAtTime(30, t, 0.18));
      master.gain.setTargetAtTime(0, t, 0.12);
      oscillators.forEach((o) => o.stop(t + 0.9));
      window.setTimeout(() => out.disconnect(), 1200);
    },
  };

  engine.set(900, 0);
  return engine;
}
