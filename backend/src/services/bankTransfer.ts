/**
 * Instant bank transfer (a discount, see TRANSFER_DISCOUNT_PERCENT in bundles.ts).
 *
 * The RIBs live only in the server's environment (Railway variables), never in
 * the website's code or the repository: the website is only told which banks
 * are available, and an account is given out only to a customer who has just
 * placed a transfer order (on their order page and in their WhatsApp message).
 *
 * Customers save the account under the brand name (BANK_BENEFICIARY, default
 * "L7IT"); the transfer itself goes by the RIB.
 */

const BANKS = [
  { bank: 'CIH Bank', env: 'BANK_CIH_RIB' },
  { bank: 'Banque Populaire (BCP)', env: 'BANK_BCP_RIB' },
];

const digits = (value: string) => value.replace(/\D/g, '');

/** "230780123456789012345678" → "230 780 1234567890123456 78" (bank, city, account, key). */
export function formatRib(rib: string): string {
  const d = digits(rib);
  return d.length === 24 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 22)} ${d.slice(22)}` : rib.trim();
}

/** Accounts with a full 24-digit RIB set on the server. */
export function bankAccounts(): Array<{ bank: string; rib: string }> {
  return BANKS
    .map(({ bank, env }) => ({ bank, rib: digits(process.env[env] || '') }))
    .filter((a) => a.rib.length === 24);
}

export const transferEnabled = () => bankAccounts().length > 0;

export const beneficiary = () => (process.env.BANK_BENEFICIARY || '').trim() || 'L7IT';

/** What the customer writes as the transfer reason, e.g. "L7IT-123", so each payment matches its order. */
export const transferReference = (orderNumber?: number) => (orderNumber ? `L7IT-${orderNumber}` : 'L7IT');

/** What a customer needs to pay one order. */
export function transferDetails(order: { orderNumber?: number; totalPrice: number }) {
  return {
    beneficiary: beneficiary(),
    reference: transferReference(order.orderNumber),
    amount: order.totalPrice,
    accounts: bankAccounts().map((a) => ({ bank: a.bank, rib: formatRib(a.rib) })),
  };
}

/** The accounts on one line, for the WhatsApp message (template values can't hold line breaks). */
export const accountsLine = () => bankAccounts().map((a) => `${a.bank}: ${formatRib(a.rib)}`).join(' | ');
