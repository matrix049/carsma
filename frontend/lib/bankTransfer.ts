/**
 * Paying by instant bank transfer (virement instantané), next to cash on delivery.
 * The customer transfers, screenshots it and sends it on WhatsApp; the team checks it
 * before shipping.
 *
 * Fill in each account exactly as on the RIB paper. The site offers transfer only once
 * an account has a holder name and a full 24-digit RIB, so empty ones stay hidden.
 */
export interface BankAccount {
  bank: string;
  holder: string;
  rib: string;
}

export const BANK_ACCOUNTS: BankAccount[] = [
  { bank: 'CIH Bank', holder: '', rib: '' },
  { bank: 'Banque Populaire (BCP)', holder: '', rib: '' },
];

/** Stored on the order as its paymentMethod. */
export const PAYMENT_TRANSFER = 'bank_transfer';

const digits = (rib: string) => rib.replace(/\D/g, '');

/** Accounts ready to show: a holder and a 24-digit RIB. */
export function readyAccounts(accounts: BankAccount[] = BANK_ACCOUNTS): BankAccount[] {
  return accounts.filter((a) => a.holder.trim() !== '' && digits(a.rib).length === 24);
}

export const transferEnabled = readyAccounts().length > 0;

/** "230780123456789012345678" → "230 780 1234567890123456 78" (bank, city, account, key). */
export function formatRib(rib: string): string {
  const d = digits(rib);
  return d.length === 24 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 22)} ${d.slice(22)}` : rib.trim();
}

/** The WhatsApp message the customer sends along with the screenshot. */
export function transferMessage(orderNumber: number | undefined, total: number): string {
  const ref = orderNumber ? ` #${orderNumber}` : '';
  return `Salam L7IT, hada screenshot dyal tahwil (virement) dyal commande${ref} — ${total} DH.`;
}
