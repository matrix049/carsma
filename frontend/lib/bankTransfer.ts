/**
 * Paying by instant bank transfer (virement instantané) — 10% off — next to cash
 * on delivery. The customer transfers, screenshots it and sends it on WhatsApp;
 * the team checks the money arrived before shipping.
 *
 * The RIBs stay on the server (backend services/bankTransfer.ts): this site is only
 * told which banks are open, and gets the accounts back in the response to a
 * transfer order, so they're never in the site's code. Customers save the account
 * under the brand name (e.g. "L7IT").
 */
import { fetchPaymentOptions, TransferDetails } from './apiServices';

export type { TransferDetails };

/** Stored on the order as its paymentMethod. */
export const PAYMENT_TRANSFER = 'bank_transfer';

/**
 * Each bank's official logo file in public/banks/ (e.g. '/banks/cih.png').
 * Until one is set, the bank's name is shown instead.
 */
export const BANK_LOGOS: Record<string, string> = {
  'CIH Bank': '',
  'Banque Populaire (BCP)': '',
};

let banks: string[] = [];
let loading: Promise<string[]> | null = null;

/** Banks open for transfer, as last told by the server (empty: transfer isn't offered). */
export const transferBanks = () => banks;

/** Asks the server once per page load; if it can't be reached, transfer just isn't offered. */
export function loadTransferBanks(): Promise<string[]> {
  if (!loading) {
    // Started inside .then so even a call that throws straight away ends up in .catch.
    loading = Promise.resolve()
      .then(() => fetchPaymentOptions())
      .then((options) => (banks = options?.transfer?.banks ?? []))
      .catch(() => (banks = []));
  }
  return loading;
}

/** The WhatsApp message the customer sends along with the screenshot. */
export function transferMessage(reference: string, total: number): string {
  return `Salam L7IT, hada screenshot dyal tahwil (virement) dyal commande ${reference} — ${total} DH.`;
}
