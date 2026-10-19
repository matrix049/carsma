'use client';

import React, { useEffect, useRef } from 'react';

/** Hairline under the navbar that fills as the page scrolls — a fuel gauge, not a light show. */
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      el.style.transform = `scaleX(${p.toFixed(4)})`;
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
    <div aria-hidden="true" className="h-px w-full overflow-hidden">
      <div
        ref={ref}
        className="h-full w-full origin-left bg-gradient-to-r from-silver-dark/40 via-silver to-xenon"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
}
