/**
 * Shared brand styling — keeps every CTA button and heading on the customer
 * pages reading the same. Import these instead of duplicating className strings.
 *
 * Showroom look: graphite surfaces, brushed-platinum primary buttons, wide
 * Anybody type, and a xenon accent reserved for focus and tiny highlights.
 */

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xenon focus-visible:ring-offset-2 focus-visible:ring-offset-asphalt';

const baseBtn = `group relative inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-3.5 font-display text-[12px] font-semibold uppercase tracking-[0.16em] stretch-125 transition-[background-color,color,box-shadow,transform] duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 ${focusRing}`;

/** Brushed platinum, graphite text — THE call to action. */
export const btnPrimary = `${baseBtn} bg-[linear-gradient(180deg,#FFFFFF_0%,#D5D9DF_100%)] text-asphalt shadow-[inset_0_-1px_0_rgba(0,0,0,0.18),0_10px_30px_-14px_rgba(255,255,255,0.45)] hover:bg-[linear-gradient(180deg,#FFFFFF_0%,#E9ECEF_100%)]`;

/** Alias of the primary CTA. */
export const btnDark = btnPrimary;

/** Alias of the primary CTA (kept for pages that import it). */
export const btnAccent = btnPrimary;

/** Glass outline — secondary CTA on dark backgrounds. */
export const btnGhostDark = `${baseBtn} bg-white/[0.04] text-chalk ring-1 ring-inset ring-white/20 backdrop-blur-sm hover:bg-white/[0.08] hover:ring-white/40`;

/** Same outline treatment — the whole storefront is dark. */
export const btnGhostLight = btnGhostDark;

/* ------------------------------------------------------------------ *
 * Compact button — smaller padding for inline / card-level CTAs.
 * ------------------------------------------------------------------ */

const baseBtnCompact = `group inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.14em] stretch-125 transition-colors duration-200 disabled:pointer-events-none disabled:opacity-40 ${focusRing}`;

export const btnCompactDark = `${baseBtnCompact} bg-chalk text-asphalt hover:bg-white`;
export const btnCompactAccent = btnCompactDark;
export const btnCompactGhost = `${baseBtnCompact} bg-white/[0.04] text-chalk ring-1 ring-inset ring-white/20 hover:ring-white/50`;

/* ------------------------------------------------------------------ *
 * Typography helpers — apply consistently across pages.
 * ------------------------------------------------------------------ */

/** Big page title — Anybody, wide and calm. Compose with size classes. */
export const h1Display = 'font-display font-semibold uppercase leading-[0.95] tracking-[-0.01em] stretch-125';

/** Section title. */
export const h2Display = 'font-display font-semibold uppercase leading-[1] tracking-[-0.01em] stretch-125';

/** Small kicker label: mono, silver, tracked out. */
export const kickerLabel = 'font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-silver';

/** Darija / Arabic line — Changa. */
export const arabicText = 'font-ar';

/** Shared text-field look for storefront forms. */
export const inputField =
  'w-full rounded-xl bg-carbon-2 px-4 py-3.5 text-base text-chalk ring-1 ring-inset ring-white/10 transition-shadow placeholder:text-smoke/70 focus:outline-none focus:ring-2 focus:ring-xenon/70 sm:text-sm';

/** Field label above an input. */
export const fieldLabel = 'flex items-baseline justify-between gap-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-silver';

/** WhatsApp number used for orders, reservations and support. */
export const WHATSAPP_NUMBER = '212765810304';

export const whatsappLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
