'use client';

import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import gsap from 'gsap';

const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const SESSION_KEY = 'l7it_intro_v2';

/**
 * IntroOverlay — Oil Stain Lab–inspired brutalist cinematic.
 *
 * Layering (z-index):
 *   - Grid texture / vignette ── z-0   (ambient)
 *   - "DRIVEN BY ART" + speed lines + meta bar ── z-10  (background)
 *   - Porsche 911 ── z-20  (foreground — drives OVER the text)
 *   - Strobe flash ── z-30  (above everything within the overlay)
 *
 * Centring strategy: the car uses a TWO-DIV setup so GSAP can't fight CSS.
 *   Outer wrapper handles static centering via `top:50%; left:50%;
 *   transform: translate(-50%, -50%)` (set as inline style — GSAP doesn't
 *   touch it). The inner wrapper (`carRef`) is what GSAP animates with
 *   xPercent / scale / rotation / filter — those transforms compose on top
 *   of the centred outer box and slide the car around it.
 *
 * Timeline (~2.55s total):
 *   0.00s  black overlay drops in. Speed lines whip past, "DRIVEN BY ART"
 *          parallaxes in slowly, industrial meta bar fades in.
 *   0.00s  car streaks in from off-screen left under blur(20px) → blur(2px),
 *          opacity 0.6 → 1, scale 1.15 → 1.05, ease power3.out.
 *   0.85s  drift: rotation 0 → -5°, scale 1.05 → 1, blur clears completely,
 *          container shake (mechanical pixel jitter).
 *   1.20s  HOLD for 0.45s — sharp, full opacity, no blur, the art reads.
 *   1.65s  exit: car flies hard right, rotation -10°, blur 15px, opacity 0.5.
 *          Bg text drifts the opposite way, meta bar fades out.
 *   2.10s  strobe — four fast white flashes (40ms each).
 *   2.30s  overlay fades to opacity 0, page revealed underneath.
 *
 * Plays once per session via sessionStorage. prefers-reduced-motion path
 * sets phase 'done' synchronously inside useLayoutEffect so subsequent
 * loads never flash the overlay.
 */
export default function IntroOverlay() {
  const [phase, setPhase] = useState<'init' | 'playing' | 'done'>('init');

  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const bgTextRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const speedLinesRef = useRef<HTMLDivElement>(null);
  const metaBarRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const played = sessionStorage.getItem(SESSION_KEY);

    if (reduced || played) {
      setPhase('done');
      return;
    }

    sessionStorage.setItem(SESSION_KEY, '1');
    setPhase('playing');

    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const ctx = gsap.context(() => {
      // ── Initial states (applied before first paint) ───────────────
      gsap.set(carRef.current, {
        xPercent: -160,
        scale: 1.15,
        rotation: 0,
        filter: 'blur(20px)',
        opacity: 0.6,
      });
      gsap.set(bgTextRef.current, { xPercent: 80, opacity: 0 });
      gsap.set(flashRef.current, { opacity: 0 });
      gsap.set(metaBarRef.current, { opacity: 0 });

      const lines =
        speedLinesRef.current?.querySelectorAll<HTMLElement>('.speed-line');
      if (lines && lines.length) {
        gsap.set(lines, { xPercent: 110, opacity: 0 });
      }

      const tl = gsap.timeline({
        onComplete: () => {
          setPhase('done');
          document.body.style.overflow = origOverflow;
        },
      });

      // ── Phase 1: Entry (0 → 0.85s) ────────────────────────────────
      // Speed lines streaking past
      if (lines && lines.length) {
        tl.to(
          lines,
          {
            xPercent: -130,
            opacity: 1,
            duration: 0.45,
            stagger: 0.04,
            ease: 'power2.in',
          },
          0,
        ).to(lines, { opacity: 0, duration: 0.2 }, 0.5);
      }

      // Background text — parallax in slowly (slower than the car)
      tl.to(
        bgTextRef.current,
        {
          xPercent: 0,
          opacity: 1,
          duration: 1.4,
          ease: 'power3.out',
        },
        0,
      );

      // Industrial meta bar fades in
      tl.to(
        metaBarRef.current,
        { opacity: 1, duration: 0.4, ease: 'power2.out' },
        0.2,
      );

      // Car streaks in — heavy blur on the way in for the speed feel
      tl.to(
        carRef.current,
        {
          xPercent: 0,
          scale: 1.05,
          filter: 'blur(2px)',
          opacity: 1,
          duration: 0.85,
          ease: 'power3.out',
        },
        0,
      );

      // ── Phase 2: Drift (0.85 → 1.20s) ─────────────────────────────
      // Harsh deceleration into a -5° drift pose. Blur clears completely.
      tl.to(carRef.current, {
        rotation: -5,
        scale: 1,
        filter: 'blur(0px)',
        opacity: 1,
        duration: 0.35,
        ease: 'expo.out',
      });

      // Container jitter shake — mechanical, not smooth
      tl.to(
        containerRef.current,
        {
          keyframes: {
            x: [0, -6, 7, -5, 6, -4, 5, -3, 4, -2, 0],
            y: [0, 4, -5, 3, -4, 2, -3, 2, -2, 1, 0],
          },
          duration: 0.35,
          ease: 'none',
        },
        '<',
      );

      // ── Phase 3: HOLD (1.20 → 1.65s) ──────────────────────────────
      // Force filter completely off so no GPU residue lingers, then dwell.
      tl.set(carRef.current, { filter: 'none' });
      tl.to({}, { duration: 0.45 });

      // ── Phase 4: Exit (1.65 → 2.10s) ──────────────────────────────
      tl.to(carRef.current, {
        xPercent: 180,
        rotation: -10,
        scale: 1.15,
        filter: 'blur(15px)',
        opacity: 0.5,
        duration: 0.45,
        ease: 'power3.in',
      });
      tl.to(
        bgTextRef.current,
        {
          xPercent: -30,
          opacity: 0,
          duration: 0.45,
          ease: 'power2.in',
        },
        '<',
      );
      tl.to(
        metaBarRef.current,
        { opacity: 0, duration: 0.3, ease: 'power2.in' },
        '<',
      );

      // ── Phase 5: Strobe (2.10 → 2.30s) ────────────────────────────
      tl.to(flashRef.current, { opacity: 1, duration: 0.04 })
        .to(flashRef.current, { opacity: 0, duration: 0.04 })
        .to(flashRef.current, { opacity: 1, duration: 0.04 })
        .to(flashRef.current, { opacity: 0, duration: 0.04 })
        .to(flashRef.current, { opacity: 0.9, duration: 0.04 });

      // ── Phase 6: Reveal (2.30 → 2.55s) ────────────────────────────
      tl.to(overlayRef.current, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.out',
      });
    }, overlayRef);

    return () => {
      ctx.revert();
      document.body.style.overflow = origOverflow;
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      ref={overlayRef}
      className="pointer-events-none fixed inset-0 z-[200] overflow-hidden bg-black"
      aria-hidden="true"
    >
      {/* Industrial blueprint grid — ambient, behind everything */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.05,
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.85)_100%)]" />

      <div
        ref={containerRef}
        className="relative h-full w-full will-change-transform"
      >
        {/* "DRIVEN BY ART" — z-10 (BACKGROUND) */}
        <div
          ref={bgTextRef}
          className="absolute inset-0 z-10 flex items-center justify-center will-change-transform"
        >
          <span className="select-none whitespace-nowrap font-display text-[clamp(4rem,22vw,22rem)] uppercase leading-none tracking-tighter text-white/[0.07]">
            DRIVEN BY ART
          </span>
        </div>

        {/* Speed lines — z-10 (still background, behind the car) */}
        <div
          ref={speedLinesRef}
          className="pointer-events-none absolute inset-0 z-10"
        >
          {Array.from({ length: 8 }).map((_, i) => {
            const top = 22 + i * 7;
            const width = 30 + ((i * 11) % 25);
            return (
              <div
                key={i}
                className="speed-line absolute h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent will-change-transform"
                style={{
                  top: `${top}%`,
                  left: 0,
                  width: `${width}%`,
                }}
              />
            );
          })}
        </div>

        {/*
          The Porsche — z-20 (FOREGROUND, drives OVER the bg text).
          OUTER wrapper: static centering only (top/left 50%, translate-50%).
          INNER wrapper (carRef): GSAP transforms (slide / rotate / blur).
          GSAP can't fight the CSS centering because they're on different
          elements.
        */}
        <div
          className="absolute z-20"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div ref={carRef} className="will-change-transform">
            <img
              src="/911.png"
              alt=""
              draggable={false}
              loading="eager"
              className="block h-auto w-[95vw] max-w-none object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)] md:w-[70vw] lg:w-[62vw] xl:w-[55vw]"
            />
          </div>
        </div>

        {/* Industrial meta bar — z-10 */}
        <div
          ref={metaBarRef}
          className="absolute bottom-8 left-6 right-6 z-10 flex items-center justify-between text-white/40 will-change-[opacity] lg:bottom-12 lg:left-12 lg:right-12"
        >
          <div className="flex items-center gap-3">
            <div className="h-px w-10 bg-white/40" />
            <span className="font-mono text-[10px] uppercase tracking-[0.4em]">
              L7it Studio / 001
            </span>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <span className="font-mono text-[10px] uppercase tracking-[0.4em]">
              Driven by art
            </span>
            <div className="h-px w-10 bg-white/40" />
          </div>
        </div>
      </div>

      {/* Strobe flash — z-30, above everything inside the overlay */}
      <div
        ref={flashRef}
        className="pointer-events-none absolute inset-0 z-30 bg-white"
      />
    </div>
  );
}
