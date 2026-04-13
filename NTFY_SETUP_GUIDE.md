# 📱 Ntfy Push Notifications Setup Guide

Get instant push notifications on your phone whenever you receive:
- 🛒 New orders
- 🎨 Custom design requests
- 📧 Contact messages

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Ntfy App

**Android:**
- Download from [Google Play Store](https://play.google.com/store/apps/details?id=io.heckel.ntfy)
- Or get the APK from [GitHub Releases](https://github.com/binwiederhier/ntfy/releases)

**iOS:**
- Download from [App Store](https://apps.apple.com/us/app/ntfy/id1625396347)

**Desktop (Optional):**
- Web: Visit https://ntfy.sh
- Progressive Web App: Install from browser
- Desktop app: Available on GitHub

### Step 2: Create Your Unique Topic

1. Open the ntfy app
2. Tap the **"+"** button
3. Create a unique topic name (this is like a private channel)
   - Example: `carsma-orders-abc123xyz`
   - Make it unique and hard to guess!
   - **Important:** Anyone with this topic name can see your notifications

4. Subscribe to your topic in the app

### Step 3: Configure Backend

Add these environment variables to your Railway backend:

```bash
NTFY_TOPIC=carsma-orders-abc123xyz
NTFY_SERVER=https://ntfy.sh
```

**In Railway Dashboard:**
1. Go to your backend service
2. Click "Variables" tab
3. Add new variables:
   - `NTFY_TOPIC` = your unique topic name
   - `NTFY_SERVER` = `https://ntfy.sh`
4. Redeploy your backend

### Step 4: Test It!

1. Place a test order on your website
2. You should receive a push notification instantly! 🎉

---

## 📋 What You'll Get Notified About

### 🛒 New Orders
```
Title: 🛒 New Order Received!
Message: John Doe placed an order for 450 MAD (3 items)
Priority: High
Click: Opens admin dashboard
```

### 🎨 Custom Design Requests
```
Title: 🎨 New Custom Design Request!
Message: Jane Smith requested: BMW M3 (2023)
Priority: High
Click: Opens custom orders page
```

### 📧 Contact Messages
```
Title: 📧 New Contact Message
Message: From Alice (alice@email.com): I have a question about...
Priority: Default
Click: Opens contact messages page
```

---

## 🔒 Security Best Practices

### Make Your Topic Unique
❌ Bad: `carsma-orders`
✅ Good: `carsma-orders-7k2m9x4p`

**Why?** Anyone who knows your topic name can subscribe to it!

### Generate a Secure Topic Name
```bash
# Option 1: Random string
node -e "console.log('carsma-orders-' + Math.random().toString(36).substring(2, 15))"

# Option 2: UUID
node -e "console.log('carsma-orders-' + require('crypto').randomUUID())"
```

### Use Access Tokens (Advanced)
For extra security, you can use ntfy.sh with authentication:

1. Create an account on https://ntfy.sh
2. Generate an access token
3. Add to Railway:
   ```bash
   NTFY_TOKEN=tk_your_token_here
   ```
4. Update notification service to use token

---

## 🎨 Customization

### Change Notification Priority

Edit `backend/src/services/notificationService.ts`:

```typescript
// For urgent orders
priority: 'urgent'  // Makes phone vibrate/ring

// For normal notifications
priority: 'high'    // Default for orders

// For low priority
priority: 'default' // For contact messages
```

### Add Custom Emojis/Tags

```typescript
tags: ['shopping_cart', 'money_with_wings', 'fire']
```

Available tags: https://ntfy.sh/docs/emojis/

### Customize Click Actions

```typescript
click: 'https://your-admin-panel.com/orders/123'
```

---

## 🧪 Testing Notifications

### Test from Command Line
```bash
curl -d "Test notification from carsma!" https://ntfy.sh/your-topic-name
```

### Test from Backend
Create a test endpoint (development only):

```typescript
// backend/src/routes/test.ts
import { Router } from 'express';
import { sendNotification } from '../services/notificationService';

const router = Router();

router.post('/test-notification', async (req, res) => {
  await sendNotification({
    title: '🧪 Test Notification',
    message: 'If you see this, ntfy is working!',
    priority: 'high',
    tags: ['white_check_mark'],
  });
  res.json({ success: true });
});

export default router;
```

---

## 🔧 Troubleshooting

### Not Receiving Notifications?

1. **Check topic name matches exactly**
   - Railway env var = App subscription
   - Case sensitive!

2. **Verify backend is deployed**
   - Check Railway logs for "✓ Notification sent"

3. **Check app permissions**
   - Android: Allow notifications in settings
   - iOS: Enable notifications for ntfy

4. **Test with curl**
   ```bash
   curl -d "Test" https://ntfy.sh/your-topic-name
   ```

### Notifications Too Frequent?

Add rate limiting in notification service:

```typescript
// Only notify for orders > 100 MAD
if (orderData.totalPrice > 100) {
  await sendNotification({...});
}
```

### Want to Disable Notifications?

Simply remove `NTFY_TOPIC` from Railway environment variables. The app will skip notifications gracefully.

---

## 🌟 Advanced Features

### Multiple Notification Channels

Create different topics for different notification types:

```bash
NTFY_TOPIC_ORDERS=carsma-orders-abc123
NTFY_TOPIC_CUSTOM=carsma-custom-xyz789
NTFY_TOPIC_CONTACT=carsma-contact-def456
```

### Scheduled Notifications

Add daily summary notifications:

```typescript
// Send daily sales summary at 8 PM
cron.schedule('0 20 * * *', async () => {
  const todayOrders = await getTodayOrders();
  await sendNotification({
    title: '📊 Daily Summary',
    message: `Today: ${todayOrders.count} orders, ${todayOrders.total} MAD`,
    priority: 'default',
  });
});
```

### Rich Notifications with Actions

```typescript
await sendNotification({
  title: '🛒 New Order',
  message: 'Order #123 - 450 MAD',
  actions: [
    { action: 'view', label: 'View Order', url: 'https://...' },
    { action: 'http', label: 'Confirm', url: 'https://api.../confirm' },
  ],
});
```

---

## 📚 Resources

- [Ntfy Documentation](https://ntfy.sh/docs/)
- [Ntfy GitHub](https://github.com/binwiederhier/ntfy)
- [Emoji Tags List](https://ntfy.sh/docs/emojis/)
- [API Reference](https://ntfy.sh/docs/publish/)

---

## ✅ Setup Checklist

- [ ] Installed ntfy app on phone
- [ ] Created unique topic name
- [ ] Subscribed to topic in app
- [ ] Added `NTFY_TOPIC` to Railway
- [ ] Added `NTFY_SERVER` to Railway
- [ ] Redeployed backend
- [ ] Tested with a real order
- [ ] Received notification successfully! 🎉

**You're all set! You'll now get instant notifications for all important events.** 📱✨
