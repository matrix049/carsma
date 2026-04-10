# Cart Context

This directory contains the Cart Context implementation for managing shopping cart state across the application.

## CartContext

The `CartContext` provides cart state management with the following features:

### Features

- **Add to Cart**: Add products to the cart with automatic quantity management
- **Remove from Cart**: Remove products completely from the cart
- **Update Quantity**: Change the quantity of items in the cart
- **Clear Cart**: Empty the entire cart
- **Calculate Total**: Get the total price of all items in the cart
- **Item Count**: Get the total number of items in the cart
- **localStorage Persistence**: Cart state is automatically saved and restored from localStorage

### Usage

```tsx
import { useCart } from '@/contexts/CartContext';

function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <button onClick={() => addToCart(product)}>
      Add to Cart
    </button>
  );
}

function CartPage() {
  const { cart, removeFromCart, calculateTotal, itemCount } = useCart();

  return (
    <div>
      <h1>Cart ({itemCount} items)</h1>
      {cart.map(item => (
        <div key={item._id}>
          <span>{item.name} x {item.quantity}</span>
          <button onClick={() => removeFromCart(item._id)}>Remove</button>
        </div>
      ))}
      <p>Total: ${calculateTotal()}</p>
    </div>
  );
}
```

### API

#### `useCart()`

Returns the cart context with the following properties and methods:

- `cart: CartItem[]` - Array of items in the cart
- `addToCart(product: Product)` - Add a product to the cart (increments quantity if already exists)
- `removeFromCart(productId: string)` - Remove a product from the cart
- `updateQuantity(productId: string, quantity: number)` - Update the quantity of a product
- `clearCart()` - Remove all items from the cart
- `calculateTotal()` - Calculate the total price of all items
- `itemCount: number` - Total number of items in the cart

### Types

```typescript
interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}
```

### localStorage

The cart state is automatically persisted to localStorage under the key `wall-decoration-cart`. This ensures that the cart contents are preserved across page refreshes and browser sessions.
