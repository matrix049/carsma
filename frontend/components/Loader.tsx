import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Screen-reader text. */
  label?: string;
}

const LEDS = 8;

const SIZES = {
  sm: 'h-[3px] w-2 gap-[3px]',
  md: 'h-1 w-3 gap-1',
  lg: 'h-1.5 w-4 gap-1.5',
};

/**
 * Sequential LED sweep — the lit row is revealed segment by segment (like a
 * dynamic indicator or a welcome-light animation), holds, then fades out
 * together. Lit colour follows `currentColor` (xenon by default).
 */
export default function Loader({ size = 'md', className = '', label = 'Loading' }: LoaderProps) {
  const [h, w, gap] = SIZES[size].split(' ');
  const row = (lit: boolean) => (
    <span className={`flex ${gap}`}>
      {Array.from({ length: LEDS }, (_, i) => (
        <span
          key={i}
          className={`${h} ${w} rounded-full ${lit ? 'bg-current shadow-[0_0_10px_currentColor]' : 'bg-white/10'}`}
        />
      ))}
    </span>
  );

  return (
    <span role="status" className={`relative inline-flex ${/\btext-/.test(className) ? '' : 'text-xenon '}${className}`}>
      <span className="sr-only">{label}</span>
      <span aria-hidden="true">{row(false)}</span>
      <span aria-hidden="true" className="led-sweep absolute inset-0">
        {row(true)}
      </span>
    </span>
  );
}

/** Placeholder with the same footprint as a ProductCard. */
export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-carbon ring-1 ring-white/[0.06]">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
      </div>
      <div className="mt-3 h-4 w-3/4 rounded-full bg-carbon-2" />
      <div className="mt-2 h-6 w-24 rounded-md bg-carbon-2" />
    </div>
  );
}
