import { duoDiscount, duoPricing, orderPricing, DUO_PRICE } from './bundles';

const g = { name: 'G-Class AMG G63 3D', price: 399 };
const p = { name: '911 GT3 RS 3D', price: 349 };

describe('3D duo offer', () => {
  it('takes the difference off a complete pair', () => {
    expect(duoDiscount([{ ...g, quantity: 1 }, { ...p, quantity: 1 }])).toEqual({ pairs: 1, amount: 399 + 349 - DUO_PRICE });
  });

  it('needs both editions', () => {
    expect(duoDiscount([{ ...g, quantity: 2 }]).amount).toBe(0);
    expect(duoDiscount([{ ...p, quantity: 1 }, { name: '911 GT3 RS 2D', price: 249, quantity: 1 }]).amount).toBe(0);
  });

  it('counts only complete pairs', () => {
    expect(duoDiscount([{ ...g, quantity: 3 }, { ...p, quantity: 2 }])).toEqual({ pairs: 2, amount: 2 * (748 - DUO_PRICE) });
  });

  it('never adds money', () => {
    expect(duoDiscount([{ ...g, price: 300, quantity: 1 }, { ...p, price: 300, quantity: 1 }]).amount).toBe(0);
  });

  it('prices one of each', () => {
    expect(duoPricing([g, p])).toEqual({ full: 748, saving: 748 - DUO_PRICE });
  });
});

describe('order pricing', () => {
  const pack = [{ ...g, quantity: 1 }, { ...p, quantity: 1 }];

  it('cash on delivery: duo offer only', () => {
    expect(orderPricing(pack, 'cod')).toEqual({ subtotal: 748, duo: 49, transfer: 0, total: 699 });
  });

  it('instant transfer: 10% off what is left after the duo, in whole dirhams', () => {
    expect(orderPricing(pack, 'bank_transfer')).toEqual({ subtotal: 748, duo: 49, transfer: 70, total: 629 });
    expect(orderPricing([{ ...p, quantity: 1 }], 'bank_transfer').total).toBe(314);
    expect(orderPricing([{ ...g, quantity: 1 }], 'bank_transfer').total).toBe(359);
  });

  it('no payment method or an old one: full price', () => {
    expect(orderPricing([{ ...g, quantity: 1 }]).total).toBe(399);
    expect(orderPricing([{ ...g, quantity: 1 }], 'Cash on Delivery').total).toBe(399);
  });
});
