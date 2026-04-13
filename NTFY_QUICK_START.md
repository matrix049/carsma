# 📱 Ntfy Quick Start - 3 Steps

## 1️⃣ Install App (2 min)

**Android:** [Google Play Store](https://play.google.com/store/apps/details?id=io.heckel.ntfy)  
**iOS:** [App Store](https://apps.apple.com/us/app/ntfy/id1625396347)

## 2️⃣ Create Topic (1 min)

1. Open ntfy app
2. Tap **"+"** button
3. Enter a unique topic name:
   ```
   carsma-orders-abc123xyz
   ```
   (Make it unique and hard to guess!)
4. Subscribe

## 3️⃣ Add to Railway (2 min)

In your Railway backend service, add these environment variables:

```bash
NTFY_TOPIC=carsma-orders-abc123xyz
NTFY_SERVER=https://ntfy.sh
```

**Done!** 🎉 You'll now get push notifications for:
- 🛒 New orders
- 🎨 Custom design requests  
- 📧 Contact messages

---

## 🧪 Test It

Place a test order on your website → You should get a notification!

---

## 🔒 Security Tip

Generate a secure topic name:
```bash
node -e "console.log('carsma-orders-' + Math.random().toString(36).substring(2, 15))"
```

---

## 📚 Full Guide

See `NTFY_SETUP_GUIDE.md` for detailed instructions, troubleshooting, and advanced features.
