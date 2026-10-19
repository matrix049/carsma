/**
 * Shared brand styling — keeps every CTA button and heading on the customer
 * pages reading the same. Import these instead of duplicating className strings.
 *
 * Gallery look: square-ish corners, ink / ivory / brass, quiet hover
 * (colour shift + arrow nudge, no scaling), focus-visible ring in brass.
 */

const baseBtn =
  'group inline-flex items-center justify-center gap-3 rounded-sm px-9 py-4 text-[13px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-ivory';

/** Ivory bg, ink text — primary CTA on dark surfaces. */
export const btnPrimary = `${baseBtn} bg-ivory text-ink hover:bg-white`;

/** Ink bg — primary CTA on light surfaces. */
export const btnDark = `${baseBtn} bg-ink text-ivory hover:bg-brass`;

/** Brass, white text — accent CTA. */
export const btnAccent = `${baseBtn} bg-brass text-white hover:bg-ink`;

/** Outlined on dark surfaces — secondary CTA on dark backgrounds. */
export const btnGhostDark = `${baseBtn} border border-ivory/30 text-ivory hover:border-ivory hover:bg-ivory/[0.06]`;

/** Outlined on light surfaces. */
export const btnGhostLight = `${baseBtn} border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-ivory`;

/* ------------------------------------------------------------------ *
 * Compact button — smaller padding for inline / card-level CTAs.
 * ------------------------------------------------------------------ */

const baseBtnCompact =
  'group inline-flex items-center justify-center gap-2 rounded-sm px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors duration-300 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass';

export const btnCompactDark = `${baseBtnCompact} bg-ink text-ivory hover:bg-brass`;
export const btnCompactAccent = `${baseBtnCompact} bg-brass text-white hover:bg-ink`;
export const btnCompactGhost = `${baseBtnCompact} border border-ink/20 text-ink hover:border-ink`;

/* ------------------------------------------------------------------ *
 * Typography helpers — apply consistently across pages.
 * ------------------------------------------------------------------ */

/** Big page title — gallery serif (`font-display`). Compose with size classes. */
export const h1Display = 'font-display font-medium leading-[0.95] tracking-tight';

/** Section title — slightly looser line-height for two-line headings. */
export const h2Display = 'font-display font-medium leading-[1.02] tracking-tight';

/** Small kicker / pre-headline label. */
export const kickerLabel = 'text-[11px] font-semibold tracking-[0.28em] uppercase text-brass';

/** Darija / Arabic line — right-to-left, Naskh face. */
export const arabicText = 'font-ar';

/** WhatsApp number used for orders, reservations and support. */
export const WHATSAPP_NUMBER = '212765810304';

export const whatsappLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
