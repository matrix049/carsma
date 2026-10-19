/**
 * Shared brand styling — keeps every CTA button and heading on the customer
 * pages reading the same. Import these instead of duplicating className strings.
 *
 * Night-drive look: chamfered "race-part" corners, heavy Anybody type, redline
 * accent. Focus is an inset ring because clip-path would cut an outer one off.
 */

const baseBtn =
  'chamfer group relative inline-flex items-center justify-center gap-3 px-8 py-4 font-display text-[13px] font-extrabold uppercase tracking-[0.14em] stretch-125 transition-[background-color,color,transform] duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:[box-shadow:inset_0_0_0_2px_#F4F4F0]';

/** Redline, white text — THE call to action. */
export const btnPrimary = `${baseBtn} bg-redline text-white hover:bg-redline-hot`;

/** Chalk-white, asphalt text — strong secondary CTA. */
export const btnDark = `${baseBtn} bg-chalk text-asphalt hover:bg-white focus-visible:[box-shadow:inset_0_0_0_2px_#E5200C]`;

/** Alias of the primary red CTA (kept for pages that import it). */
export const btnAccent = btnPrimary;

/** Outlined — secondary CTA on dark backgrounds. */
export const btnGhostDark = `${baseBtn} bg-white/[0.04] text-chalk shadow-[inset_0_0_0_1px_rgba(244,244,240,0.25)] hover:bg-white/[0.08] hover:shadow-[inset_0_0_0_1px_rgba(244,244,240,0.6)]`;

/** Same outline treatment — the whole storefront is dark now. */
export const btnGhostLight = btnGhostDark;

/* ------------------------------------------------------------------ *
 * Compact button — smaller padding for inline / card-level CTAs.
 * ------------------------------------------------------------------ */

const baseBtnCompact =
  'chamfer-sm group inline-flex items-center justify-center gap-2 px-5 py-2.5 font-display text-[11px] font-extrabold uppercase tracking-[0.12em] stretch-125 transition-colors duration-200 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:[box-shadow:inset_0_0_0_2px_#F4F4F0]';

export const btnCompactDark = `${baseBtnCompact} bg-chalk text-asphalt hover:bg-white`;
export const btnCompactAccent = `${baseBtnCompact} bg-redline text-white hover:bg-redline-hot`;
export const btnCompactGhost = `${baseBtnCompact} bg-white/[0.04] text-chalk shadow-[inset_0_0_0_1px_rgba(244,244,240,0.22)] hover:shadow-[inset_0_0_0_1px_rgba(244,244,240,0.6)]`;

/* ------------------------------------------------------------------ *
 * Typography helpers — apply consistently across pages.
 * ------------------------------------------------------------------ */

/** Big page title — Anybody black, stretched wide. Compose with size classes. */
export const h1Display = 'font-display font-black uppercase leading-[0.86] tracking-[-0.01em] stretch-125';

/** Section title. */
export const h2Display = 'font-display font-black uppercase leading-[0.9] tracking-[-0.01em] stretch-125';

/** Telemetry-style kicker label: mono, red, tracked out. */
export const kickerLabel = 'font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-redline-hot';

/** Darija / Arabic line — Changa. */
export const arabicText = 'font-ar';

/** WhatsApp number used for orders, reservations and support. */
export const WHATSAPP_NUMBER = '212765810304';

export const whatsappLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
