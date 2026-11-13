import { loadTransferBanks } from './bankTransfer';
import { topicAnswer } from './chatbot';

jest.mock('./apiServices', () => ({
  fetchPaymentOptions: jest.fn(async () => ({ transfer: { banks: ['CIH Bank', 'Banque Populaire (BCP)'], discountRate: 0.05 } })),
}));

describe('chat payment answer', () => {
  it('mentions transfer, its banks and the discount once the server says it is open', async () => {
    expect(topicAnswer('en', 'payment')).not.toContain('transfer');
    await loadTransferBanks();
    const answer = topicAnswer('en', 'payment');
    expect(answer).toContain('instant bank transfer (CIH Bank / Banque Populaire (BCP)) for 5% off');
    expect(topicAnswer('darija', 'payment')).toContain('تخفيض 5%');
  });
});
