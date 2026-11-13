import { transferMessage } from './bankTransfer';

describe('bank transfer', () => {
  it('puts the reference and amount in the WhatsApp message', () => {
    expect(transferMessage('L7IT-123', 629)).toBe('Salam L7IT, hada screenshot dyal tahwil (virement) dyal commande L7IT-123 — 629 DH.');
  });
});
