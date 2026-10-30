import Product from '../models/Product';
import { IOrder } from '../models/Order';

/** Orders in these states have their pieces spoken for. */
const HOLDING_STATUSES = ['confirmed', 'delivered'];

interface StockLine {
  productId: unknown;
  quantity: number;
}

/** Stock couldn't cover the order; the message is shown to the admin as is. */
export class StockError extends Error {}

export interface StockMove {
  held: boolean;
  taken: Array<{ productId: string; quantity: number }>;
  /** Puts stock back as it was, for when the order then fails to save. */
  undo: () => Promise<void>;
}

function countByProduct(lines: StockLine[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const line of lines) {
    const id = String(line.productId);
    counts.set(id, (counts.get(id) || 0) + line.quantity);
  }
  return counts;
}

/** What the order should hold once saved; `held: false` means nothing at all. */
function piecesWanted(order: IOrder, nextStatus: string, nextProducts: StockLine[]): { held: boolean; lines: StockLine[] } {
  if (!HOLDING_STATUSES.includes(nextStatus)) return { held: false, lines: [] };
  // Confirmed before stock was counted: nothing was taken, so nothing changes.
  if (HOLDING_STATUSES.includes(order.status) && !order.stockHeld) return { held: false, lines: [] };
  return { held: true, lines: nextProducts };
}

/**
 * Moves stock to match an order's next status and items, by the difference
 * from what the order already holds — so re-confirming takes nothing twice,
 * cancelling gives everything back, and editing a confirmed order only moves
 * the change. Products without a stockQuantity aren't counted and are skipped.
 *
 * Throws StockError, with stock left untouched, if there aren't enough pieces.
 */
export async function moveOrderStock(order: IOrder, nextStatus: string, nextProducts: StockLine[]): Promise<StockMove> {
  const { held, lines } = piecesWanted(order, nextStatus, nextProducts);
  const before = countByProduct(order.stockTaken || []);
  const wanted = countByProduct(lines);
  const after = new Map(before);
  const moved: Array<[string, number]> = []; // product id, pieces taken (negative = given back)

  const change = (id: string, pieces: number) =>
    Product.updateOne(
      { _id: id, stockQuantity: { $gte: Math.max(0, pieces) } },
      { $inc: { stockQuantity: -pieces } },
    );

  const undo = async () => {
    for (const [id, pieces] of moved.splice(0).reverse()) await change(id, -pieces);
  };

  try {
    // Taking can fail, so it goes first.
    for (const [id, count] of wanted) {
      const pieces = count - (before.get(id) || 0);
      if (pieces <= 0) continue;
      const result = await change(id, pieces);
      if (result.modifiedCount === 1) {
        moved.push([id, pieces]);
        after.set(id, count);
        continue;
      }
      const product = await Product.findById(id, 'name stockQuantity').lean();
      if (typeof product?.stockQuantity === 'number') {
        throw new StockError(`Not enough stock for ${product.name}: ${product.stockQuantity} left, this needs ${pieces} more.`);
      }
    }
    for (const [id, count] of before) {
      const pieces = count - (wanted.get(id) || 0);
      if (pieces <= 0) continue;
      await change(id, -pieces);
      moved.push([id, -pieces]);
      const left = count - pieces;
      if (left > 0) after.set(id, left);
      else after.delete(id);
    }
  } catch (error) {
    await undo();
    throw error;
  }

  return {
    held,
    taken: Array.from(after, ([productId, quantity]) => ({ productId, quantity })),
    undo,
  };
}
