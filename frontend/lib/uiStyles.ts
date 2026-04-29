/**
 * Shared brand styling — keeps every CTA button and heading on the customer
 * pages reading the same. Import these instead of duplicating className strings.
 *
 * Buttons share the same shape: rounded-md, large padding, premium hover
 * (scale 1.04 + opacity/bg shift), focus-visible ring. Pick the variant
 * that fits the surface contrast.
 */

const baseBtn =
  'group inline-flex items-center justify-center gap-3 rounded-md px-12 py-5 text-sm font-bold uppercase tracking-[0.18em] transition-all duration-300 hover:scale-[1.04] active:scale-[1.00] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black';

/** White bg, black text — use as primary CTA on dark surfaces. */
export const btnPrimary = `${baseBtn} bg-white text-black hover:opacity-95`;

/** Black bg (auto-flips in dark mode) — primary CTA on light surfaces. */
export const btnDark = `${baseBtn} bg-zinc-900 text-white dark:bg-white dark:text-black hover:opacity-95`;

/** Brand blue, white text — universal accent CTA. */
export const btnAccent = `${baseBtn} bg-blue-600 text-white hover:bg-blue-500`;

/** Outlined on dark surfaces — secondary CTA on dark backgrounds. */
export const btnGhostDark = `${baseBtn} border border-white/30 text-white hover:border-white/60 hover:bg-white/[0.04]`;

/** Outlined on light surfaces (theme-aware). */
export const btnGhostLight = `${baseBtn} border border-zinc-300 text-zinc-900 hover:border-zinc-500 hover:bg-zinc-50 dark:border-white/30 dark:text-white dark:hover:border-white/60 dark:hover:bg-white/[0.04]`;

/* ------------------------------------------------------------------ *
 * Compact button — smaller padding for inline / card-level CTAs.
 * ------------------------------------------------------------------ */

const baseBtnCompact =
  'group inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 hover:scale-[1.04] active:scale-[1.00] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

export const btnCompactDark = `${baseBtnCompact} bg-zinc-900 text-white dark:bg-white dark:text-black hover:opacity-95`;
export const btnCompactAccent = `${baseBtnCompact} bg-blue-600 text-white hover:bg-blue-500`;
export const btnCompactGhost = `${baseBtnCompact} border border-zinc-300 text-zinc-900 hover:border-zinc-500 hover:bg-zinc-50 dark:border-white/20 dark:text-white dark:hover:border-white/40 dark:hover:bg-white/[0.04]`;

/* ------------------------------------------------------------------ *
 * Typography helpers — apply consistently across pages.
 * ------------------------------------------------------------------ */

/** Big page title — use Anton (`font-display`). Compose with size classes. */
export const h1Display = 'font-display uppercase leading-[0.85] tracking-tight';

/** Section title — slightly looser line-height for two-line headings. */
export const h2Display = 'font-display uppercase leading-[0.9] tracking-tight';

/** Small kicker / pre-headline label — JetBrains Mono via `font-mono`. */
export const kickerLabel = 'font-mono text-[10px] tracking-[0.4em] uppercase';
