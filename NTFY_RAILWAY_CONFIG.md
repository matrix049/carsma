# 🚂 Railway Configuration for Ntfy

## ✅ Your Ntfy Topic
```
carsma2026
```

## 🔧 Add to Railway Backend

Go to your Railway backend service → Variables tab → Add these:

```bash
NTFY_TOPIC=carsma2026
NTFY_SERVER=https://ntfy.sh
```

## 📱 Subscribe in App

1. Open ntfy app
2. Tap "+" button
3. Enter topic: `carsma2026`
4. Subscribe

## 🧪 Test Results

✅ All 4 test notifications sent successfully:
- Basic test notification
- Order notification
- Custom order notification  
- Contact message notification

**Check your phone - you should have received all 4 notifications!**

## 🎯 What Happens Next

Once deployed to Railway with these environment variables, you'll automatically receive push notifications for:

- 🛒 **Every new order** - Customer name, total, item count
- 🎨 **Every custom design request** - Customer name, car details
- 📧 **Every contact message** - Customer name, email, message preview

## 🔒 Security Note

⚠️ **Important:** Your topic `carsma2026` is public. Anyone who knows this name can subscribe to your notifications.

**For better security, consider changing it to something more unique:**

```bash
# Generate a secure topic name
node -e "console.log('carsma-' + Math.random().toString(36).substring(2, 15))"

# Example output: carsma-7k2m9x4p
```

Then update:
1. Railway environment variable
2. Your ntfy app subscription

## 📊 Notification Examples

### New Order:
```
🛒 New Order Received!
John Doe placed an order for 450 MAD (3 items)
[Click to open admin dashboard]
```

### Custom Request:
```
🎨 New Custom Design Request!
Jane Smith requested: BMW M3 Competition (2023)
[Click to open custom orders page]
```

### Contact Message:
```
📧 New Contact Message
From Alice (alice@example.com): I have a question about...
[Click to open contact messages]
```

---

**You're all set!** 🚀 Deploy to Railway and start receiving notifications!
