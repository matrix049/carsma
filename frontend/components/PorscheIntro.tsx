'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SESSION_KEY = 'l7it_intro_played_v1';

/**
 * PorscheIntro — first-load cinematic.
 *
 * Timeline (~1.8s):
 *   0.00s  black overlay drops in, horizon line draws across center
 *   0.20s  L7it stamp fades in
 *   0.45s  Porsche silhouette enters from right, accelerates across-frame
 *          with motion blur, headlight beam, speed streaks, tire smoke
 *   1.15s  white flash at car's exit point
 *   1.30s  black curtain swipes upward to reveal the page
 *   1.80s  unmounts
 *
 * Plays once per session via sessionStorage. Respects prefers-reduced-motion.
 */
export default function PorscheIntro() {
  const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle');
  const scrollRestoreRef = useRef<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const alreadyPlayed = sessionStorage.getItem(SESSION_KEY);

    if (reduced || alreadyPlayed) {
      setPhase('done');
      return;
    }

    sessionStorage.setItem(SESSION_KEY, '1');
    setPhase('playing');

    // Lock scroll while the intro plays
    scrollRestoreRef.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const t = window.setTimeout(() => {
      setPhase('done');
      document.body.style.overflow = scrollRestoreRef.current;
    }, 1800);

    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = scrollRestoreRef.current;
    };
  }, []);

  return (
    <AnimatePresence>
      {phase === 'playing' && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[200] overflow-hidden bg-black"
          aria-hidden="true"
        >
          {/* Subtle vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.7)_100%)]" />

          {/* Horizon line draws across */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: [0, 0.6, 0.4] }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: 'center' }}
            className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/70 to-transparent"
          />

          {/* L7it stamp */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: [0, 1, 1, 0], y: 0 }}
            transition={{ duration: 1.3, times: [0, 0.18, 0.7, 1], ease: 'easeOut' }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center"
          >
            <div className="font-anton text-[clamp(4rem,18vw,12rem)] leading-none tracking-tight text-white">
              L7IT<span className="text-blue-600">.</span>
            </div>
            <div className="mt-3 font-mono text-[10px] tracking-[0.5em] uppercase text-white/40">
              Wall art / Made in Rabat
            </div>
          </motion.div>

          {/* Speed streaks (horizontal lines whipping past) */}
          {Array.from({ length: 14 }).map((_, i) => {
            const top = 28 + ((i * 53) % 44);
            const length = 80 + ((i * 37) % 220);
            const delay = 0.42 + i * 0.025;
            const duration = 0.35 + ((i * 13) % 30) / 100;
            return (
              <motion.div
                key={i}
                initial={{ x: '110vw', opacity: 0 }}
                animate={{ x: '-30vw', opacity: [0, 1, 1, 0] }}
                transition={{
                  duration,
                  delay,
                  ease: [0.4, 0, 0.6, 1],
                  times: [0, 0.15, 0.85, 1],
                }}
                className="absolute h-[1.5px] rounded-full bg-gradient-to-r from-transparent via-white/80 to-transparent"
                style={{
                  top: `${top}%`,
                  width: `${length}px`,
                }}
              />
            );
          })}

          {/* Headlight beam (precedes the car for a frame, sells the speed) */}
          <motion.div
            initial={{ x: '105vw', opacity: 0, scaleX: 1 }}
            animate={{
              x: '-30vw',
              opacity: [0, 0.85, 0],
              scaleX: [1, 1.6, 0.8],
            }}
            transition={{
              duration: 0.8,
              delay: 0.42,
              ease: [0.4, 0, 0.6, 1],
              times: [0, 0.5, 1],
            }}
            className="pointer-events-none absolute top-1/2 z-20 -translate-y-1/2"
            style={{
              width: '60vw',
              height: '14px',
              background:
                'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(160,200,255,0.85) 60%, rgba(255,255,255,1) 88%, rgba(255,255,255,0) 100%)',
              filter: 'blur(6px)',
              transform: 'translateY(-50%)',
              transformOrigin: 'right center',
            }}
          />

          {/* The car itself */}
          <motion.div
            initial={{ x: '110vw' }}
            animate={{ x: '-130vw' }}
            transition={{
              duration: 0.85,
              delay: 0.5,
              ease: [0.42, 0, 0.58, 1],
            }}
            className="absolute top-1/2 z-20 -translate-y-1/2 will-change-transform"
            style={{
              filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.7))',
            }}
          >
            <PorscheSilhouette />
          </motion.div>

          {/* Tire smoke trail behind the car */}
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={`smoke-${i}`}
              initial={{ x: '105vw', opacity: 0, scale: 0.4 }}
              animate={{
                x: '-30vw',
                opacity: [0, 0.35, 0],
                scale: [0.4, 1.2, 1.8],
              }}
              transition={{
                duration: 0.9 + i * 0.05,
                delay: 0.55 + i * 0.05,
                ease: 'easeOut',
              }}
              className="absolute z-[19] h-16 w-16 rounded-full bg-zinc-300 blur-2xl"
              style={{
                top: 'calc(50% + 28px)',
              }}
            />
          ))}

          {/* White flash at exit */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.55, 0] }}
            transition={{ duration: 0.35, delay: 1.15, times: [0, 0.4, 1] }}
            className="absolute inset-0 z-30 bg-white"
          />

          {/* Black curtain swipes up to reveal page */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: '-101%' }}
            transition={{ duration: 0.55, delay: 1.25, ease: [0.83, 0, 0.17, 1] }}
            className="absolute inset-0 z-40 bg-black"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ----------------------------------------------------------------------------
 * Porsche 911 silhouette — left-facing (front on the left for a right→left run).
 * Drawn in pure SVG. Iconic 911 cues kept: long sloping rear, fastback roofline,
 * round wheel arches, flush headlight, low ground clearance.
 * --------------------------------------------------------------------------*/
function PorscheSilhouette() {
  return (
    <svg
      width="420"
      height="130"
      viewBox="0 0 420 130"
      xmlns="http://www.w3.org/2000/svg"
      className="block"
    >
      <defs>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1f2937" />
          <stop offset="60%" stopColor="#0a0a0a" />
          <stop offset="100%" stopColor="#000" />
        </linearGradient>
        <linearGradient id="windowGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id="headlight" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="60%" stopColor="#bfdbfe" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Body — front on left (x≈0), rear on right (x≈420) */}
      <path
        d="
          M 8 90
          L 18 78
          Q 32 72 60 70
          L 90 65
          Q 110 56 140 50
          Q 175 32 230 32
          Q 290 32 330 50
          Q 360 62 380 70
          Q 395 75 405 80
          L 412 90
          L 412 96
          L 395 96
          Q 388 88 372 88
          Q 356 88 350 96
          L 80 96
          Q 74 88 58 88
          Q 42 88 36 96
          L 14 96
          Z
        "
        fill="url(#bodyGrad)"
      />

      {/* Greenhouse / roof underline highlight (subtle metallic edge) */}
      <path
        d="
          M 90 65
          Q 110 56 140 50
          Q 175 32 230 32
          Q 290 32 330 50
        "
        fill="none"
        stroke="#374151"
        strokeWidth="1.2"
        opacity="0.9"
      />

      {/* Windows */}
      <path
        d="
          M 145 53
          Q 175 38 225 38
          Q 275 38 315 52
          L 305 56
          Q 270 46 225 46
          Q 180 46 152 58
          Z
        "
        fill="url(#windowGrad)"
      />

      {/* Door cut */}
      <path
        d="M 215 56 L 215 88"
        stroke="#1f2937"
        strokeWidth="0.8"
        opacity="0.7"
      />

      {/* Wheel wells (cut-outs) */}
      <ellipse cx="62" cy="92" rx="22" ry="14" fill="#000" />
      <ellipse cx="358" cy="92" rx="22" ry="14" fill="#000" />

      {/* Front wheel */}
      <g transform="translate(62 92)">
        <circle r="14" fill="#000" />
        <circle r="11" fill="#1f2937" />
        <circle r="7" fill="#0a0a0a" />
        {/* spokes */}
        {[0, 60, 120, 180, 240, 300].map((d) => (
          <line
            key={d}
            x1="0"
            y1="0"
            x2={Math.cos((d * Math.PI) / 180) * 10}
            y2={Math.sin((d * Math.PI) / 180) * 10}
            stroke="#374151"
            strokeWidth="1.2"
          />
        ))}
        <circle r="2.5" fill="#9ca3af" />
      </g>

      {/* Rear wheel */}
      <g transform="translate(358 92)">
        <circle r="14" fill="#000" />
        <circle r="11" fill="#1f2937" />
        <circle r="7" fill="#0a0a0a" />
        {[0, 60, 120, 180, 240, 300].map((d) => (
          <line
            key={d}
            x1="0"
            y1="0"
            x2={Math.cos((d * Math.PI) / 180) * 10}
            y2={Math.sin((d * Math.PI) / 180) * 10}
            stroke="#374151"
            strokeWidth="1.2"
          />
        ))}
        <circle r="2.5" fill="#9ca3af" />
      </g>

      {/* Rear ducktail spoiler hint */}
      <path
        d="M 380 70 Q 395 68 408 76 L 408 80 Q 395 75 378 76 Z"
        fill="#0a0a0a"
        opacity="0.95"
      />

      {/* Headlight on the front (left side) */}
      <ellipse cx="20" cy="84" rx="9" ry="5" fill="url(#headlight)" />
      <ellipse cx="20" cy="84" rx="3.5" ry="2" fill="#ffffff" />

      {/* Headlight beam (short, from headlight forward) */}
      <ellipse
        cx="-2"
        cy="84"
        rx="40"
        ry="8"
        fill="#ffffff"
        opacity="0.25"
        style={{ filter: 'blur(6px)' as React.CSSProperties['filter'] }}
      />

      {/* Brake light hint */}
      <rect x="402" y="78" width="4" height="6" rx="1" fill="#ef4444" opacity="0.85" />
    </svg>
  );
}
