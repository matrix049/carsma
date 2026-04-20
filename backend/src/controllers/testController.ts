import { Request, Response } from 'express';
import { sendNotification, notifyNewOrder } from '../services/notificationService';

/**
 * Test notification endpoint
 * POST /api/test/notification
 * Manually trigger a test notification
 */
export async function testNotification(req: Request, res: Response): Promise<void> {
  try {
    console.log('🧪 Manual notification test triggered');
    
    // Send a basic test notification
    await sendNotification({
      title: '🧪 Test Notification',
      message: 'If you see this, ntfy is working correctly! 🎉',
      priority: 'high',
      tags: ['white_check_mark', 'tada'],
    });

    res.status(200).json({
      success: true,
      message: 'Test notification sent! Check your ntfy app.',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Test notification failed:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to send test notification',
      details: error.message
    });
  }
}

/**
 * Test order notification endpoint
 * POST /api/test/order-notification
 * Manually trigger a test order notification
 */
export async function testOrderNotification(req: Request, res: Response): Promise<void> {
  try {
    console.log('🧪 Manual order notification test triggered');
    
    // Send a test order notification
    await notifyNewOrder({
      orderId: 'TEST-' + Date.now(),
      customerName: 'John Doe (Test)',
      customerPhone: '+212600000000',
      totalPrice: 299,
      itemCount: 2,
    });

    res.status(200).json({
      success: true,
      message: 'Test order notification sent! Check your ntfy app.',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Test order notification failed:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to send test order notification',
      details: error.message
    });
  }
}

/**
 * Check ntfy configuration
 * GET /api/test/ntfy-config
 * Display current ntfy configuration (without sensitive data)
 */
export async function checkNtfyConfig(req: Request, res: Response): Promise<void> {
  const ntfyTopic = process.env.NTFY_TOPIC;
  const ntfyServer = process.env.NTFY_SERVER || 'https://ntfy.sh';
  const frontendUrl = process.env.FRONTEND_URL;

  res.status(200).json({
    ntfy: {
      configured: !!ntfyTopic,
      topic: ntfyTopic ? `${ntfyTopic.substring(0, 5)}...` : 'NOT SET',
      server: ntfyServer,
      fullUrl: ntfyTopic ? `${ntfyServer}/${ntfyTopic}` : 'NOT CONFIGURED'
    },
    frontend: {
      url: frontendUrl || 'NOT SET'
    },
    instructions: ntfyTopic ? [
      'Configuration looks good!',
      `Make sure you're subscribed to topic: ${ntfyTopic}`,
      'Use the test endpoints to verify notifications work'
    ] : [
      'NTFY_TOPIC is not configured',
      'Add NTFY_TOPIC=your-unique-topic-name to your .env file',
      'Subscribe to the same topic in the ntfy app',
      'Restart the server after updating .env'
    ]
  });
}