import { duoDiscount, duoPricing, DUO_PRICE } from './bundles';

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
