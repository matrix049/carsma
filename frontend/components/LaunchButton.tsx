'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { startEngine, isSoundOn, Engine } from '@/lib/engineAudio';

const IDLE_RPM = 900;
const LIMIT_RPM = 8500;
/** Full-throttle time from idle to the limiter. */
const REV_MS = 1300;
/** Time bouncing off the limiter before the launch fires. */
const LIMITER_MS = 420;
/** A press shorter than this is a normal tap → go straight away. */
const TAP_MS = 200;

/** Shift-light colours inside the button: 4 green, 4 amber, 2 blue. */
const LED_COLORS = ['#2BD96B', '#2BD96B', '#2BD96B', '#2BD96B', '#FFD60A', '#FFD60A', '#FFD60A', '#FFD60A', '#3B82F6', '#3B82F6'];

interface LaunchButtonProps {
  href: string;
  label: string;
  /** Small line under the button. */
  hint?: string;
  className?: string;
}

/**
 * Launch control. Tap = normal navigation. Press and hold = the revs climb
 * (with a synthesised engine note unless sound is off), bounce off the
 * limiter, and the page launches into `href` with a speed-streak flash.
 */
export default function LaunchButton({ href, label, hint = 'Hold for launch control', className = '' }: LaunchButtonProps) {
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rpmRef = useRef<HTMLSpanElement>(null);
  const [launching, setLaunching] = useState(false);
  const s = useRef({
    holding: false,
    pressedAt: 0,
    rpm: IDLE_RPM,
    last: 0,
    limiterSince: 0,
    raf: 0,
    launched: false,
    engine: null as Engine | null,
  });

  useEffect(() => {
    router.prefetch(href);
  }, [router, href]);

  useEffect(() => {
    const state = s.current;
    return () => {
      if (state.raf) cancelAnimationFrame(state.raf);
      state.engine?.stop();
    };
  }, []);

  const paint = (rpm: number) => {
    const rev = (rpm - IDLE_RPM) / (LIMIT_RPM - IDLE_RPM);
    buttonRef.current?.style.setProperty('--rev', Math.max(0, Math.min(1, rev)).toFixed(3));
    if (rpmRef.current) rpmRef.current.textContent = String(Math.round(rpm / 10) * 10).padStart(4, '0');
  };

  const launch = (quick: boolean) => {
    const state = s.current;
    if (state.launched) return;
    state.launched = true;
    state.holding = false;
    state.engine?.pops(quick ? 2 : 4);
    if ('vibrate' in navigator) navigator.vibrate?.([12, 40, 12]);
    setLaunching(true);
    window.setTimeout(() => router.push(href), quick ? 220 : 520);
    // Safety net if the route doesn't unmount us (e.g. same page).
    window.setTimeout(() => {
      setLaunching(false);
      state.launched = false;
    }, 2000);
  };

  const loop = (now: number) => {
    const state = s.current;
    const dt = Math.min(50, now - (state.last || now));
    state.last = now;

    if (state.holding) {
      if (!state.engine && now - state.pressedAt > TAP_MS && isSoundOn()) {
        state.engine = startEngine();
      }
      if (state.rpm < LIMIT_RPM) {
        // Torque curve: pulls hardest in the mid-range.
        const r = (state.rpm - IDLE_RPM) / (LIMIT_RPM - IDLE_RPM);
        state.rpm = Math.min(LIMIT_RPM, state.rpm + ((LIMIT_RPM - IDLE_RPM) * dt * (0.75 + Math.sin(r * Math.PI) * 0.6)) / REV_MS);
      } else {
        if (!state.limiterSince) state.limiterSince = now;
        if (now - state.limiterSince > LIMITER_MS) launch(false);
      }
    } else {
      state.rpm = Math.max(IDLE_RPM, state.rpm - ((LIMIT_RPM - IDLE_RPM) * dt) / 650);
    }

    // Bounce off the limiter.
    const shown = state.rpm >= LIMIT_RPM ? LIMIT_RPM - 260 * Math.abs(Math.sin(now / 38)) : state.rpm;
    state.engine?.set(shown, state.holding ? 1 : 0);
    paint(shown);

    if (state.holding || state.rpm > IDLE_RPM + 1) {
      state.raf = requestAnimationFrame(loop);
    } else {
      state.raf = 0;
      state.last = 0;
      state.engine?.stop();
      state.engine = null;
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 || s.current.launched) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const state = s.current;
    state.holding = true;
    state.pressedAt = performance.now();
    state.limiterSince = 0;
    if (!state.raf) state.raf = requestAnimationFrame(loop);
  };

  const release = (canLaunch: boolean) => {
    const state = s.current;
    if (!state.holding) return;
    state.holding = false;
    state.limiterSince = 0;
    if (state.launched) return;
    if (canLaunch && performance.now() - state.pressedAt < TAP_MS) {
      launch(true);
    } else {
      // Lifted off before the launch — crackle and fall back to idle.
      state.engine?.pops(3);
    }
  };

  return (
    <div className={`inline-flex flex-col gap-2 ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onPointerDown={onPointerDown}
        onPointerUp={() => release(true)}
        onPointerCancel={() => release(false)}
        onClick={(e) => {
          // Keyboard activation (Enter / Space) arrives as a click with detail 0.
          if (e.detail === 0) launch(true);
        }}
        onContextMenu={(e) => e.preventDefault()}
        style={{ '--rev': 0, touchAction: 'manipulation', WebkitTouchCallout: 'none' } as React.CSSProperties}
        className="chamfer group relative h-[68px] w-full min-w-[17rem] select-none overflow-hidden bg-redline px-8 text-white transition-transform duration-150 active:scale-[0.985] focus-visible:outline-none focus-visible:[box-shadow:inset_0_0_0_2px_#F4F4F0] sm:w-auto"
      >
        {/* Rev fill */}
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-redline-hot to-[#ff7a5c]"
          style={{ width: 'calc(var(--rev) * 100%)' }}
        />
        {/* Shift lights */}
        <span aria-hidden="true" className="absolute left-4 right-4 top-2.5 flex gap-1">
          {LED_COLORS.map((c, i) => (
            <span
              key={i}
              className="h-[3px] flex-1 rounded-full"
              style={{
                background: c,
                opacity: `clamp(0.18, calc(var(--rev) * 10 - ${i}), 1)`,
                boxShadow: `0 0 6px ${c}`,
              }}
            />
          ))}
        </span>
        <span className="relative z-10 flex items-center justify-center gap-3 pt-1.5 font-display text-[15px] font-black uppercase tracking-[0.12em] stretch-125">
          {label}
          <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M4 12h15" />
          </svg>
        </span>
      </button>
      <div className="flex items-center justify-between gap-4 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-smoke">
        <span>{hint}</span>
        <span aria-hidden="true">
          RPM <span ref={rpmRef} className="tabular-nums text-chalk">0900</span>
        </span>
      </div>

      {launching &&
        createPortal(
          <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[200] overflow-hidden">
            <div className="launch-streaks absolute inset-0" />
            <div className="launch-flash absolute inset-0" />
          </div>,
          document.body,
        )}
    </div>
  );
}
