import { Request, Response } from 'express';
import ContactMessage from '../models/ContactMessage';
import { notifyNewContactMessage } from '../services/notificationService';

/**
 * Create a new contact message
 * POST /api/contact
 */
export async function createContactMessage(req: Request, res: Response): Promise<void> {
  try {
    // Accept `phone` (primary) — fall back to legacy `email` if any older
    // client is still posting that key, just so we don't 400 mid-deploy.
    const { name, phone, email, message } = req.body;
    const contactValue: string | undefined = phone || email;

    if (!name || !contactValue || !message) {
      res.status(400).json({
        error: true,
        message: 'Name, phone number, and message are required'
      });
      return;
    }

    // Create contact message with status "unread"
    const newContactMessage = await ContactMessage.create({
      customer: { name, phone: contactValue },
      message,
      status: 'unread'
    });

    // Send notification to admin
    await notifyNewContactMessage({
      customerName: name,
      phone: contactValue,
      messagePreview: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
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
