'use client';

import React, { useEffect, useRef } from 'react';

const LEDS = 15;

/** F1 steering-wheel pattern: 5 green, 5 red, 5 blue. */
function ledColor(i: number) {
  if (i < 5) return '#2BD96B';
  if (i < 10) return '#E5200C';
  return '#3B82F6';
}

/**
 * Scroll-progress bar styled as F1 shift lights. LEDs light up as the page
 * scrolls; at the bottom they all blink — time to shift.
 */
export default function ShiftLights() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const leds = Array.from(el.children) as HTMLElement[];
    let raf = 0;

    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const lit = Math.round(p * LEDS);
      leds.forEach((led, i) => {
        led.dataset.on = i < lit ? '1' : '0';
      });
      el.dataset.shift = lit >= LEDS ? '1' : '0';
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // Page height changes when products load or the route changes.
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-shift="0"
      className="group/shift flex h-[3px] gap-[3px] bg-asphalt px-[3px]"
    >
      {Array.from({ length: LEDS }, (_, i) => (
        <span
          key={i}
          data-on="0"
          style={{ '--c': ledColor(i) } as React.CSSProperties}
          className="h-full flex-1 rounded-full bg-white/[0.07] transition-[background-color,box-shadow] duration-150 data-[on='1']:bg-[var(--c)] data-[on='1']:shadow-[0_0_8px_var(--c)] group-data-[shift='1']/shift:animate-pulse-led group-data-[shift='1']/shift:bg-[#3B82F6] group-data-[shift='1']/shift:shadow-[0_0_10px_#3B82F6]"
        />
      ))}
    </div>
  );
}
