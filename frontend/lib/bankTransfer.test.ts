import { formatRib, readyAccounts, transferMessage } from './bankTransfer';

describe('bank transfer', () => {
  const full = '230780123456789012345678';

  it('only offers accounts with a holder and a full 24-digit RIB', () => {
    expect(readyAccounts([{ bank: 'CIH Bank', holder: '', rib: '' }])).toEqual([]);
    expect(readyAccounts([{ bank: 'CIH Bank', holder: 'L7IT', rib: '2307801234' }])).toEqual([]);
    expect(readyAccounts([{ bank: 'CIH Bank', holder: '', rib: full }])).toEqual([]);
    expect(readyAccounts([{ bank: 'CIH Bank', holder: 'L7IT', rib: '230 780 1234567890123456 78' }])).toHaveLength(1);
  });

  it('groups a RIB the way it is printed', () => {
    expect(formatRib(full)).toBe('230 780 1234567890123456 78');
    expect(formatRib('230-780-1234567890123456-78')).toBe('230 780 1234567890123456 78');
  });

  it('puts the order number and amount in the WhatsApp message', () => {
    expect(transferMessage(123, 699)).toBe('Salam L7IT, hada screenshot dyal tahwil (virement) dyal commande #123 — 699 DH.');
    expect(transferMessage(undefined, 349)).toContain('commande — 349 DH');
  });
});
