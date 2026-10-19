import React from 'react';

interface PlateProps {
  /** Left block — the "number" on a real plate. */
  left: React.ReactNode;
  /** Middle block — the Arabic letter. */
  letter: React.ReactNode;
  /** Right block — the region code. */
  right: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  'aria-label'?: string;
}

const SIZES = {
  sm: 'text-[11px] [&>span]:px-1.5 [&>span]:py-0.5 border-[1.5px] rounded-[4px]',
  md: 'text-base [&>span]:px-2.5 [&>span]:py-1 border-2 rounded-[6px]',
  lg: 'text-2xl sm:text-3xl [&>span]:px-3.5 [&>span]:py-1.5 border-[3px] rounded-[8px]',
};

/**
 * A Moroccan number plate — "12345 | ب | 6" — white, black border, bar
 * separators. Used for prices and brand stamps; every Moroccan driver reads
 * it instantly.
 */
export default function Plate({ left, letter, right, size = 'md', className = '', ...rest }: PlateProps) {
  return (
    <span
      role={rest['aria-label'] ? 'img' : undefined}
      aria-label={rest['aria-label']}
      dir="ltr"
      className={`inline-flex items-stretch overflow-hidden border-asphalt bg-white font-mono font-bold leading-none text-asphalt shadow-[0_3px_0_rgba(0,0,0,0.45)] ${SIZES[size]} ${className}`}
    >
      <span className="flex items-center tabular-nums">{left}</span>
      <span className="flex items-center border-x-2 border-asphalt font-ar font-bold">{letter}</span>
      <span className="flex items-center tabular-nums">{right}</span>
    </span>
  );
}
