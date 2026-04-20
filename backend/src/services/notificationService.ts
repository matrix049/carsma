/**
 * Notification Service using ntfy.sh
 * Sends push notifications for important events (orders, custom requests, etc.)
 */

interface NotificationOptions {
  title: string;
  message: string;
  priority?: 'min' | 'low' | 'default' | 'high' | 'urgent';
  tags?: string[];
  click?: string; // URL to open when notification is clicked
}

/**
 * Notification Service using ntfy.sh
 * Sends push notifications for important events (orders, custom requests, etc.)
 */

interface NotificationOptions {
  title: string;
  message: string;
  priority?: 'min' | 'low' | 'default' | 'high' | 'urgent';
  tags?: string[];
  click?: string; // URL to open when notification is clicked
}

/**
 * Send notification via ntfy.sh
 * @param options - Notification configuration
 */
export async function sendNotification(options: NotificationOptions): Promise<void> {
  const ntfyTopic = process.env.NTFY_TOPIC;
  const ntfyServer = process.env.NTFY_SERVER || 'https://ntfy.sh';

  console.log('🔔 ===== NOTIFICATION ATTEMPT =====');
  console.log('📋 Ntfy Config:', {
    topic: ntfyTopic ? `${ntfyTopic.substring(0, 5)}...` : 'NOT SET',
    server: ntfyServer,
    title: options.title,
    timestamp: new Date().toISOString()
  });

  // Skip if ntfy is not configured
  if (!ntfyTopic) {
    console.log('⚠️  NTFY_TOPIC not configured. Skipping notification:', options.title);
    console.log('💡 To enable notifications:');
    console.log('   1. Set NTFY_TOPIC in your .env file');
    console.log('   2. Subscribe to the same topic in the ntfy app');
    console.log('🔔 ===== NOTIFICATION SKIPPED =====');
    return;
  }

  const ntfyUrl = `${ntfyServer}/${ntfyTopic}`;
  console.log('🌐 Sending to URL:', ntfyUrl);

  try {
    const payload = {
      topic: ntfyTopic,
      title: options.title,
      message: options.message,
      priority: options.priority || 'high',
      tags: options.tags || [],
      ...(options.click && { click: options.click }),
    };

    console.log('📦 Full Payload:', JSON.stringify(payload, null, 2));
    console.log('🚀 Making HTTP POST request...');

    const response = await fetch(ntfyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'L7IT-Backend/1.0',
      },
      body: JSON.stringify(payload),
    });

    console.log('📡 Response received:');
    console.log('   Status:', response.status, response.statusText);
    console.log('   Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ NOTIFICATION FAILED:');
      console.error('   Status:', response.status, response.statusText);
      console.error('   Response Body:', errorText);
      
      // Log common issues
      if (response.status === 404) {
        console.error('💡 Possible issue: Topic URL might be incorrect');
        console.error('   Expected format: https://ntfy.sh/your-topic-name');
        console.error('   Current URL:', ntfyUrl);
      } else if (response.status === 400) {
        console.error('💡 Possible issue: Invalid payload format');
        console.error('   Payload sent:', JSON.stringify(payload));
      } else if (response.status === 429) {
        console.error('💡 Rate limited - too many requests');
      } else if (response.status >= 500) {
        console.error('💡 Server error on ntfy.sh side');
      }
      console.log('🔔 ===== NOTIFICATION FAILED =====');
    } else {
      const responseText = await response.text();
      console.log('✅ NOTIFICATION SENT SUCCESSFULLY!');
      console.log('📱 Response Body:', responseText);
      console.log('🎯 Check your ntfy app for the notification');
      console.log('📱 Topic to check:', ntfyTopic);
      console.log('🔔 ===== NOTIFICATION SUCCESS =====');
    }
  } catch (error) {
    console.error('❌ NETWORK ERROR sending ntfy notification:');
    console.error('   Error:', error);
    console.error('   Error Type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('   Error Message:', error instanceof Error ? error.message : String(error));
    console.error('💡 Possible issues:');
    console.error('   - Network connectivity problems');
    console.error('   - DNS resolution failure');
    console.error('   - Invalid NTFY_SERVER URL:', ntfyServer);
    console.error('   - Firewall blocking outbound HTTPS requests');
    console.error('   - SSL/TLS certificate issues');
    console.log('🔔 ===== NOTIFICATION ERROR =====');
  }
}

/**
 * Send notification for new order
 */
export async function notifyNewOrder(orderData: {
  orderId: string;
  customerName: string;
  customerPhone: string;
  totalPrice: number;
  itemCount: number;
}): Promise<void> {
  const adminUrl = process.env.FRONTEND_URL 
    ? `${process.env.FRONTEND_URL}/admin/orders`
    : undefined;

  await sendNotification({
    title: '🛒 طلب جديد! New Order!',
    message: `👤 ${orderData.customerName}\n📞 ${orderData.customerPhone}\n💰 ${orderData.totalPrice} MAD (${orderData.itemCount} items)`,
    priority: 'urgent',
    tags: ['shopping_cart', 'money_with_wings'],
    click: adminUrl,
  });
}

/**
 * Send notification for new custom order request
 */
export async function notifyNewCustomOrder(customOrderData: {
  customerName: string;
  carName: string;
  model: string;
  year: string;
}): Promise<void> {
  const adminUrl = process.env.FRONTEND_URL 
    ? `${process.env.FRONTEND_URL}/admin/custom-orders`
    : undefined;

  await sendNotification({
    title: '🎨 New Custom Design Request!',
    message: `${customOrderData.customerName} requested: ${customOrderData.carName} ${customOrderData.model} (${customOrderData.year})`,
    priority: 'high',
    tags: ['art', 'car'],
    click: adminUrl,
  });
}

/**
 * Send notification for new contact message
 */
export async function notifyNewContactMessage(contactData: {
  customerName: string;
  email: string;
  messagePreview: string;
}): Promise<void> {
  const adminUrl = process.env.FRONTEND_URL 
    ? `${process.env.FRONTEND_URL}/admin/contact-messages`
    : undefined;

  await sendNotification({
    title: '📧 New Contact Message',
    message: `From ${contactData.customerName} (${contactData.email}): ${contactData.messagePreview}`,
    priority: 'default',
    tags: ['email', 'speech_balloon'],
    click: adminUrl,
  });
}
