/**
 * Phone helpers for the admin: tap-to-call and WhatsApp links from whatever
 * the customer typed ("06 12 34 56 78", "+212 6…", "00212…").
 */

/** Digits in international form without "+", e.g. "212612345678". Empty if unusable. */
export function internationalDigits(phone: string): string {
  let digits = (phone || '').replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  // "+212 06…": the trunk 0 doesn't belong after the country code
  if (digits.length === 13 && digits.startsWith('2120')) digits = `212${digits.slice(4)}`;
  // Moroccan local format: 0 + 9 digits → 212 + 9 digits
  if (digits.length === 10 && digits.startsWith('0')) digits = `212${digits.slice(1)}`;
  // 9 digits starting with 5/6/7 (leading 0 dropped)
  if (digits.length === 9 && /^[567]/.test(digits)) digits = `212${digits}`;
  return digits.length >= 8 ? digits : '';
}

export function telHref(phone: string): string {
  const digits = internationalDigits(phone);
  return digits ? `tel:+${digits}` : `tel:${(phone || '').replace(/[^\d+]/g, '')}`;
}

export function whatsappHref(phone: string, text?: string): string | null {
  const digits = internationalDigits(phone);
  if (!digits) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}
