import React from 'react';
import { Brand, findBrand } from '@/lib/brands';

interface BrandLogoProps {
  /** A brand (from brandOf) or a raw brand/category label. */
  brand: Brand | string | null | undefined;
  className?: string;
  /** Decorative by default; pass true when the logo stands alone. */
  labelled?: boolean;
}

/**
 * Monochrome brand mark (inherits text colour). Unknown brands get a round
 * monogram so every filter chip and card still has a badge.
 */
export default function BrandLogo({ brand, className = 'h-5 w-5', labelled = false }: BrandLogoProps) {
  const resolved = typeof brand === 'string' ? findBrand(brand) : brand;
  const label = resolved?.name ?? (typeof brand === 'string' ? brand : '');
  const a11y = labelled ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true as const };

  if (resolved) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={`shrink-0 ${className}`} {...a11y}>
        <path d={resolved.path} fillRule={resolved.evenOdd ? 'evenodd' : undefined} />
      </svg>
    );
  }

  const initials = label
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '•';

  return (
    <svg viewBox="0 0 24 24" className={`shrink-0 ${className}`} {...a11y}>
      <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <text
        x="12"
        y="12"
        dominantBaseline="central"
        textAnchor="middle"
        fill="currentColor"
        fontSize={initials.length > 1 ? 8.5 : 11}
        fontWeight="700"
        fontFamily="var(--font-anybody), Arial, sans-serif"
      >
        {initials}
      </text>
    </svg>
  );
}
