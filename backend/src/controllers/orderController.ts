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
  try {
    const { customer, products, totalPrice, paymentMethod } = req.body;

    // Validate required fields
    if (!customer || !customer.firstName || !customer.lastName || !customer.phone || !customer.address) {
      res.status(400).json({
        error: true,
        message: 'Customer information is required (firstName, lastName, phone, address)'
      });
      return;
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      res.status(400).json({
        error: true,
        message: 'Products array is required and must not be empty'
      });
      return;
    }

    if (totalPrice === undefined || totalPrice === null || totalPrice < 0) {
      res.status(400).json({
        error: true,
        message: 'Valid total price is required'
      });
      return;
    }

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

    await order.save();

    // Send notification to admin
    await notifyNewOrder({
      orderId: order._id.toString(),
      customerName: `${customer.firstName} ${customer.lastName}`,
      customerPhone: customer.phone,
      totalPrice,
      itemCount: products.length,
    });

    // Return success response with orderId
    res.status(201).json({
      success: true,
      orderId: order._id.toString(),
      message: 'Order created successfully'
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    
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
 * Update order status (admin only)
 * PUT /api/orders/:id
 * Updates the status of an existing order
 */
export async function updateOrderStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status value
    const validStatuses = ['pending', 'confirmed', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        error: true,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
      return;
    }

    // Find and update order
    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    // Handle order not found
    if (!order) {
      res.status(404).json({
        error: true,
        message: 'Order not found'
      });
      return;
    }

    // Return updated order
    res.status(200).json({
      success: true,
      order
    });
  } catch (error: any) {
    console.error('Update order status error:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      res.status(400).json({
        error: true,
        message: 'Invalid order ID'
      });
      return;
    }

    res.status(500).json({
      error: true,
      message: 'Failed to update order status'
    });
  }
}
