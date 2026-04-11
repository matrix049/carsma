import { Request, Response } from 'express';
import ContactMessage from '../models/ContactMessage';

/**
 * Create a new contact message
 * POST /api/contact
 */
export async function createContactMessage(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      res.status(400).json({
        error: true,
        message: 'Name, email, and message are required'
      });
      return;
    }

    // Create contact message with status "unread"
    const newContactMessage = await ContactMessage.create({
      customer: { name, email },
      message,
      status: 'unread'
    });

    res.status(201).json({
      success: true,
      message: 'Contact message submitted successfully',
      messageId: newContactMessage._id
    });
  } catch (error: any) {
    console.error('Create contact message error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors)
        .map((err: any) => err.message)
        .join(', ');
      
      res.status(400).json({
        error: true,
        message: validationErrors
      });
      return;
    }

    res.status(500).json({
      error: true,
      message: error.message || 'Failed to submit contact message'
    });
  }
}

/**
 * Get all contact messages (Admin only)
 * GET /api/contact
 */
export async function getContactMessages(req: Request, res: Response): Promise<void> {
  try {
    const contactMessages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      contactMessages
    });
  } catch (error: any) {
    console.error('Get contact messages error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve contact messages'
    });
  }
}

/**
 * Update contact message status (Admin only)
 * PUT /api/contact/:id
 */
export async function updateMessageStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status value
    const allowedStatuses = ['unread', 'read', 'resolved', 'archived'];
    if (!status || !allowedStatuses.includes(status)) {
      res.status(400).json({
        error: true,
        message: 'Invalid status. Must be one of: unread, read, resolved, archived'
      });
      return;
    }

    const updatedMessage = await ContactMessage.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedMessage) {
      res.status(404).json({
        error: true,
        message: 'Message not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      contactMessage: updatedMessage
    });
  } catch (error: any) {
    console.error('Update message status error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to update message status'
    });
  }
}
