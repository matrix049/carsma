'use client';

import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import gsap from 'gsap';
import PorscheCar from '@/components/PorscheCar';

const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const SESSION_KEY = 'l7it_intro_v2';

/**
 * Asset chain — first valid src wins. Falls back to /porsche-911.png and
 * finally to the SVG silhouette so the intro never renders an empty frame.
 */
const SOURCE_CHAIN = ['/911.png', '/porsche-911.png'];

/**
 * IntroOverlay — Oil Stain Lab–inspired brutalist cinematic.
 *
 * Timeline (~2.55s total):
 *   0.00s  black screen, off-screen car, "DRIVEN BY ART" parked off-screen
 *   0.00s  speed lines whip past, bg text starts a slow parallax drift
 *   0.00s  car streaks in from the left under heavy motion blur (power3.out)
 *   0.95s  hits centre — drift: -5° rotation, blur clears, container shake
 *   1.35s  hold for 0.2s
 *   1.55s  car exits hard right (-10° rotation, blur returns), bg text drifts
 *   2.05s  white strobe (4 quick flashes)
 *   2.30s  overlay fades, page underneath revealed
 *
 * Plays once per session (sessionStorage). Skipped entirely for users who
 * prefer reduced motion. Locks body scroll while running.
 */
export default function IntroOverlay() {
  const [phase, setPhase] = useState<'init' | 'playing' | 'done'>('init');
  const [srcIndex, setSrcIndex] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);

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

    // Skip path: reduced motion or already played this session.
    // Setting phase synchronously inside useLayoutEffect means the next
    // render runs before paint, so subsequent loads never flash the overlay.
    if (reduced || played) {
      setPhase('done');
      return;
    }

    sessionStorage.setItem(SESSION_KEY, '1');
    setPhase('playing');

    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const ctx = gsap.context(() => {
      // ── Initial states (applied before first paint) ─────────────────
      gsap.set(carRef.current, {
        xPercent: -160,
        scale: 1.15,
        rotation: 0,
        filter: 'blur(20px)',
        opacity: 0.5,
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

      // ── Phase 1: Entry (0 → 0.95s) ──────────────────────────────────
      // Speed lines whip past
      if (lines && lines.length) {
        tl.to(
          lines,
          {
            xPercent: -130,
            opacity: 1,
            duration: 0.5,
            stagger: 0.04,
            ease: 'power2.in',
          },
          0,
        ).to(
          lines,
          { opacity: 0, duration: 0.2 },
          0.55,
        );
      }

      // Background text — slow parallax in
      tl.to(
        bgTextRef.current,
        {
          xPercent: 0,
          opacity: 1,
          duration: 1.5,
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

      // Car streaks in
      tl.to(
        carRef.current,
        {
          xPercent: 0,
          scale: 1.05,
          filter: 'blur(3px)',
          opacity: 1,
          duration: 0.95,
          ease: 'power3.out',
        },
        0,
      );

      // ── Phase 2: Drift + camera shake (0.95 → 1.35s) ────────────────
      tl.to(carRef.current, {
        rotation: -5,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.4,
        ease: 'expo.out',
      });

      // Container jitter — read as harsh mechanical shake.
      // Keyframes are tiny pixel offsets sampled non-monotonically.
      tl.to(
        containerRef.current,
        {
          keyframes: {
            x: [0, -6, 7, -5, 6, -4, 5, -3, 4, -2, 0],
            y: [0, 4, -5, 3, -4, 2, -3, 2, -2, 1, 0],
          },
          duration: 0.4,
          ease: 'none',
        },
        '<',
      );

      // ── Phase 3: Hold (1.35 → 1.55s) ───────────────────────────────
      tl.to({}, { duration: 0.2 });

      // ── Phase 4: Exit (1.55 → 2.05s) ───────────────────────────────
      tl.to(carRef.current, {
        xPercent: 180,
        rotation: -10,
        scale: 1.15,
        filter: 'blur(15px)',
        opacity: 0.4,
        duration: 0.5,
        ease: 'power3.in',
      });
      // BG text drifts off in the opposite direction
      tl.to(
        bgTextRef.current,
        {
          xPercent: -30,
          opacity: 0,
          duration: 0.5,
          ease: 'power2.in',
        },
        '<',
      );
      tl.to(
        metaBarRef.current,
        { opacity: 0, duration: 0.3, ease: 'power2.in' },
        '<',
      );

      // ── Phase 5: Strobe (2.05 → 2.30s) ─────────────────────────────
      // Hard white/black flicker. Short durations sell the "shutter" feel.
      tl.to(flashRef.current, { opacity: 1, duration: 0.04 })
        .to(flashRef.current, { opacity: 0, duration: 0.04 })
        .to(flashRef.current, { opacity: 1, duration: 0.04 })
        .to(flashRef.current, { opacity: 0, duration: 0.04 })
        .to(flashRef.current, { opacity: 0.9, duration: 0.04 });

      // ── Phase 6: Reveal (2.30 → 2.55s) ─────────────────────────────
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

  const handleImgError = () => {
    if (srcIndex + 1 < SOURCE_CHAIN.length) {
      setSrcIndex((i) => i + 1);
    } else {
      setImgFailed(true);
    }
  };

  // Once finished, unmount entirely
  if (phase === 'done') return null;

  return (
    <div
      ref={overlayRef}
      className="pointer-events-none fixed inset-0 z-[200] overflow-hidden bg-black"
      aria-hidden="true"
    >
      {/* Industrial blueprint grid texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.05,
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.85)_100%)]" />

      <div
        ref={containerRef}
        className="relative h-full w-full will-change-transform"
      >
        {/* Background "DRIVEN BY ART" — large, low-contrast, parallax-slow */}
        <div
          ref={bgTextRef}
          className="absolute top-1/2 left-0 right-0 flex -translate-y-1/2 justify-center will-change-transform"
        >
          <span className="select-none whitespace-nowrap font-display text-[clamp(4rem,22vw,22rem)] uppercase leading-none tracking-tighter text-white/[0.07]">
            DRIVEN BY ART
          </span>
        </div>

        {/* Speed lines streaking left */}
        <div
          ref={speedLinesRef}
          className="pointer-events-none absolute inset-0"
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

        {/* The car — wrapper takes the GSAP transforms; image rides inside */}
        <div
          ref={carRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform"
        >
          {imgFailed ? (
            <div className="w-[80vw] max-w-[280px] sm:max-w-md md:max-w-2xl lg:max-w-3xl">
              <PorscheCar />
            </div>
          ) : (
            <img
              src={SOURCE_CHAIN[srcIndex]}
              onError={handleImgError}
              alt=""
              draggable={false}
              loading="eager"
              className="block h-auto w-[80vw] max-w-[280px] select-none object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)] sm:max-w-md md:max-w-2xl lg:max-w-3xl"
            />
          )}
        </div>

        {/* Industrial bottom meta bar */}
        <div
          ref={metaBarRef}
          className="absolute bottom-8 left-6 right-6 flex items-center justify-between text-white/40 will-change-[opacity] lg:bottom-12 lg:left-12 lg:right-12"
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

      {/* Strobe flash overlay — sits above everything inside the overlay */}
      <div
        ref={flashRef}
        className="pointer-events-none absolute inset-0 bg-white"
      />
    </div>
  );
}
