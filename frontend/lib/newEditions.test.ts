import { editionOf, isNewEdition, twoDVersionOf } from './newEditions';
import { dimensionsOf } from './dimensions';
import { isAvailable, piecesLeft } from './stock';

// Names as they are in the live catalogue.
const catalog = [
  { name: 'G Class Amg g63', price: 259, inStock: true },
  { name: '911 GT3 RS', price: 249, inStock: true },
  { name: '1994 911 (964) Carrera', price: 249, inStock: true },
  { name: 'G-Class AMG G63 3D', price: 549, inStock: true },
  { name: '911 GT3 RS 3D', price: 449, inStock: true },
];

describe('3D editions', () => {
  it('recognises the 3D editions but not their 2D versions', () => {
    expect(isNewEdition('G-Class AMG G63 3D')).toBe(true);
    expect(isNewEdition('911 GT3 RS 3D')).toBe(true);
    expect(isNewEdition('G Class Amg g63')).toBe(false);
    expect(isNewEdition('911 GT3 RS')).toBe(false);
  });

  it('suggests the 2D version of the same car', () => {
    expect(twoDVersionOf(catalog, 'G-Class AMG G63 3D')?.name).toBe('G Class Amg g63');
    expect(twoDVersionOf(catalog, '911 GT3 RS 3D')?.name).toBe('911 GT3 RS');
    expect(twoDVersionOf(catalog, '911 GT3 RS')).toBeUndefined();
  });

  it('skips a 2D version that is out of stock', () => {
    const list = catalog.map((p) => (p.name === '911 GT3 RS' ? { ...p, inStock: false } : p));
    expect(twoDVersionOf(list, '911 GT3 RS 3D')).toBeUndefined();
  });

  it('uses the edition size unless the admin set a different one', () => {
    expect(dimensionsOf({ name: 'G-Class AMG G63 3D' })).toBe('120cm x 75cm');
    expect(dimensionsOf({ name: 'G-Class AMG G63 3D', dimensions: '120cm x 35cm' })).toBe('120cm x 75cm');
    expect(dimensionsOf({ name: '911 GT3 RS 3D', dimensions: '' })).toBe('120cm x 50cm');
    expect(dimensionsOf({ name: '911 GT3 RS 3D', dimensions: '120cm x 60cm' })).toBe('120cm x 60cm');
    expect(dimensionsOf({ name: 'G Class Amg g63', dimensions: '120cm x 50cm' })).toBe('120cm x 50cm');
    expect(editionOf('911 GT3 RS 3D')?.title).toBe('911 3D');
  });
});

describe('stock', () => {
  it('counts pieces only when tracked', () => {
    expect(piecesLeft({ stockQuantity: 6 })).toBe(6);
    expect(piecesLeft({ stockQuantity: null })).toBeUndefined();
    expect(piecesLeft({})).toBeUndefined();
  });

  it('is unavailable when sold out or switched off', () => {
    expect(isAvailable({ inStock: true, stockQuantity: 6 })).toBe(true);
    expect(isAvailable({ inStock: true })).toBe(true);
    expect(isAvailable({ inStock: true, stockQuantity: 0 })).toBe(false);
    expect(isAvailable({ inStock: false, stockQuantity: 6 })).toBe(false);
  });
});
