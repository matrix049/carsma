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

  // Skip if ntfy is not configured
  if (!ntfyTopic) {
    console.log('⚠️  Ntfy not configured. Skipping notification:', options.title);
    return;
  }

  try {
    const response = await fetch(`${ntfyServer}/${ntfyTopic}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: ntfyTopic,
        title: options.title,
        message: options.message,
        priority: options.priority || 'high',
        tags: options.tags || [],
        click: options.click,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send ntfy notification:', response.statusText);
    } else {
      console.log('✓ Notification sent:', options.title);
    }
  } catch (error) {
    console.error('Error sending ntfy notification:', error);
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
