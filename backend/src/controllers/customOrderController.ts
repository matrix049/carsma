import { Request, Response } from 'express';
import CustomOrder from '../models/CustomOrder';

/**
 * Submit a new custom order request
 * POST /api/custom-orders
 */
export async function createCustomOrder(req: Request, res: Response): Promise<void> {
  try {
    const { firstName, lastName, phone, email, carName, model, year, notes } = req.body;

    const newCustomOrder = await CustomOrder.create({
      customer: { firstName, lastName, phone, email },
      carDetails: { carName, model, year },
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Custom request submitted successfully',
      requestId: newCustomOrder._id
    });
  } catch (error: any) {
    console.error('Create custom order error:', error);
    res.status(500).json({
      error: true,
      message: error.message || 'Failed to submit custom request'
    });
  }
}

/**
 * Get all custom requests (Admin only)
 * GET /api/custom-orders
 */
export async function getCustomOrders(req: Request, res: Response): Promise<void> {
  try {
    const customOrders = await CustomOrder.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      customOrders
    });
  } catch (error: any) {
    console.error('Get custom orders error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve custom requests'
    });
  }
}

/**
 * Update custom order status (Admin only)
 * PUT /api/custom-orders/:id
 */
export async function updateCustomOrderStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await CustomOrder.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      res.status(404).json({
        error: true,
        message: 'Request not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      customOrder: updatedOrder
    });
  } catch (error: any) {
    console.error('Update custom order error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to update request'
    });
  }
}
