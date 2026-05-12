import { Response } from 'express';
import Order from '../models/Order';
import { AuthRequest } from '../middleware/auth';
import { notifyNewOrder } from '../services/notificationService';

/**
 * Create new order
 * POST /api/orders
 * Creates a new order from customer checkout
 */
export async function createOrder(req: AuthRequest, res: Response): Promise<void> {
  console.log('🚀 ===== NEW ORDER REQUEST RECEIVED =====');
  console.log('🌍 Request Origin:', req.get('origin') || 'No origin header');
  console.log('🌍 User Agent:', req.get('user-agent') || 'No user agent');
  console.log('🌍 Request IP:', req.ip || req.connection.remoteAddress || 'Unknown IP');
  console.log('📦 Request Body Keys:', Object.keys(req.body));
  
  try {
    const { customer, products, totalPrice, paymentMethod } = req.body;

    console.log('✅ Request validation starting...');
    console.log('👤 Customer data received:', customer ? 'YES' : 'NO');
    console.log('📦 Products data received:', products ? `YES (${products?.length} items)` : 'NO');
    console.log('💰 Total price received:', totalPrice);

    // Validate required fields
    if (!customer || !customer.firstName || !customer.lastName || !customer.phone || !customer.address) {
      console.log('❌ Customer validation failed');
      res.status(400).json({
        error: true,
        message: 'Customer information is required (firstName, lastName, phone, address)'
      });
      return;
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      console.log('❌ Products validation failed');
      res.status(400).json({
        error: true,
        message: 'Products array is required and must not be empty'
      });
      return;
    }

    if (totalPrice === undefined || totalPrice === null || totalPrice < 0) {
      console.log('❌ Price validation failed');
      res.status(400).json({
        error: true,
        message: 'Valid total price is required'
      });
      return;
    }

    console.log('✅ All validations passed, creating order...');

    // Create new order in database
    const order = new Order({
      customer: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        address: customer.address
      },
      products,
      totalPrice,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      status: 'pending'
    });

    console.log('💾 Saving order to database...');
    await order.save();
    console.log('📦 ===== ORDER CREATED SUCCESSFULLY =====');
    console.log('📦 Order ID:', order._id.toString());
    console.log('📦 Order Number:', order.orderNumber);
    console.log('📦 Customer:', `${customer.firstName} ${customer.lastName}`);
    console.log('📦 Phone:', customer.phone);
    console.log('📦 Total Price:', totalPrice, 'MAD');
    console.log('📦 Items Count:', products.length);
    console.log('📦 Payment Method:', paymentMethod || 'Cash on Delivery');
    console.log('📦 ===== STARTING NOTIFICATION PROCESS =====');

    // Send notification to admin
    try {
      console.log('🔔 Calling notifyNewOrder function...');
      console.log('🔔 Environment check:');
      console.log('   - NTFY_TOPIC:', process.env.NTFY_TOPIC ? 'SET' : 'NOT SET');
      console.log('   - NTFY_SERVER:', process.env.NTFY_SERVER || 'DEFAULT');
      console.log('   - FRONTEND_URL:', process.env.FRONTEND_URL || 'NOT SET');
      
      await notifyNewOrder({
        orderId: order._id.toString(),
        customerName: `${customer.firstName} ${customer.lastName}`,
        customerPhone: customer.phone,
        totalPrice,
        itemCount: products.length,
      });
      console.log('✅ ===== NOTIFICATION PROCESS COMPLETED =====');
    } catch (notificationError) {
      console.error('❌ ===== NOTIFICATION PROCESS FAILED =====');
      console.error('❌ Notification error:', notificationError);
      console.error('❌ Error type:', notificationError instanceof Error ? notificationError.constructor.name : typeof notificationError);
      console.error('❌ Error message:', notificationError instanceof Error ? notificationError.message : String(notificationError));
      console.error('❌ Stack trace:', notificationError instanceof Error ? notificationError.stack : 'No stack trace');
      // Don't fail the order creation if notification fails
    }

    console.log('📤 Sending success response to client...');
    // Return success response with orderId
    res.status(201).json({
      success: true,
      orderId: order._id.toString(),
      message: 'Order created successfully'
    });
    console.log('✅ ===== ORDER CREATION FLOW COMPLETED =====');
  } catch (error: any) {
    console.error('❌ ===== ORDER CREATION FAILED =====');
    console.error('❌ Create order error:', error);
    console.error('❌ Error type:', error?.constructor?.name || typeof error);
    console.error('❌ Error message:', error?.message || String(error));
    console.error('❌ Stack trace:', error?.stack || 'No stack trace');
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      res.status(400).json({
        error: true,
        message: 'Invalid order data',
        details: error.message
      });
      return;
    }

    res.status(500).json({
      error: true,
      message: 'Failed to create order'
    });
  }
}

/**
 * Get all orders (admin only)
 * GET /api/orders
 * Returns all orders sorted by creation date (newest first)
 */
export async function getOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    // Query all orders from database, sorted by createdAt descending
    const orders = await Order.find().sort({ createdAt: -1 });

    // Return orders array
    res.status(200).json({
      orders
    });
  } catch (error: any) {
    console.error('Get orders error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve orders'
    });
  }
}

/**
 * Update an order (admin only)
 * PUT /api/orders/:id
 *
 * Accepts a partial update — any combination of:
 *   - `status`   : 'pending' | 'confirmed' | 'delivered' | 'cancelled'
 *   - `finish`   : 'brilliant' | 'matte' | null
 *   - `products` : full replacement of the line items
 *                  (server recalculates `totalPrice` server-side so the
 *                  total can't drift out of sync with the items).
 *
 * Only the fields present in the body are touched; missing fields stay
 * as they were.
 */
export async function updateOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status, finish, products } = req.body as {
      status?: string;
      finish?: 'brilliant' | 'matte' | null;
      products?: Array<{
        productId: string;
        name: string;
        price: number;
        quantity: number;
      }>;
    };

    const updates: Record<string, unknown> = {};

    if (status !== undefined) {
      const validStatuses = ['pending', 'confirmed', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          error: true,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
        return;
      }
      updates.status = status;
    }

    if (finish !== undefined) {
      const validFinishes = ['brilliant', 'matte', null];
      if (!validFinishes.includes(finish as 'brilliant' | 'matte' | null)) {
        res.status(400).json({
          error: true,
          message: `Invalid finish. Must be one of: brilliant, matte, null`
        });
        return;
      }
      updates.finish = finish;
    }

    if (products !== undefined) {
      if (!Array.isArray(products) || products.length === 0) {
        res.status(400).json({
          error: true,
          message: 'Products must be a non-empty array'
        });
        return;
      }
      for (const p of products) {
        if (
          !p || typeof p !== 'object' ||
          !p.productId ||
          typeof p.name !== 'string' || !p.name.trim() ||
          typeof p.price !== 'number' || p.price < 0 ||
          typeof p.quantity !== 'number' || p.quantity < 1 || !Number.isFinite(p.quantity)
        ) {
          res.status(400).json({
            error: true,
            message: 'Each product needs productId, name, non-negative price, and integer quantity >= 1'
          });
          return;
        }
      }
      updates.products = products;
      // Recalculate total so it can't drift from the items.
      updates.totalPrice = products.reduce(
        (sum, p) => sum + p.price * p.quantity,
        0,
      );
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({
        error: true,
        message: 'No updatable fields provided'
      });
      return;
    }

    const order = await Order.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!order) {
      res.status(404).json({
        error: true,
        message: 'Order not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error: any) {
    console.error('Update order error:', error);

    if (error.name === 'CastError') {
      res.status(400).json({
        error: true,
        message: 'Invalid order ID'
      });
      return;
    }

    res.status(500).json({
      error: true,
      message: 'Failed to update order'
    });
  }
}

// Legacy alias — the route used to bind only this name. New code should
// import `updateOrder` directly.
export const updateOrderStatus = updateOrder;
