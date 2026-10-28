/**
 * Stock helpers. Most pieces aren't counted (made to order); the limited 3D
 * editions have a `stockQuantity` set by the admin.
 */
interface Stocked {
  inStock?: boolean;
  stockQuantity?: number | null;
}

/** Pieces left, or undefined when the product's stock isn't tracked. */
export function piecesLeft(product: Stocked | null | undefined): number | undefined {
  const q = product?.stockQuantity;
  return typeof q === 'number' && q >= 0 ? q : undefined;
}

/** Can it be ordered right now? */
export function isAvailable(product: Stocked | null | undefined): boolean {
  if (!product || product.inStock === false) return false;
  return piecesLeft(product) !== 0;
}
