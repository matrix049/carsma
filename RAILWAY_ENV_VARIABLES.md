# 🔐 Railway Environment Variables - Complete List

## 📋 Backend Service Variables

Copy these into Railway → Backend Service → Variables tab:

```bash
# Node Environment
NODE_ENV=production

# Server Port (Railway auto-assigns, but good to have)
PORT=5000

# Frontend URL (IMPORTANT: Replace with your actual Railway frontend URL)
FRONTEND_URL=https://your-frontend-service.railway.app

# MongoDB Connection (IMPORTANT: Change password!)
MONGODB_URI=mongodb+srv://matrix049:YOUR_NEW_PASSWORD@ac-8tp99le-shard-00-00.4uyeow4.mongodb.net:27017,ac-8tp99le-shard-00-01.4uyeow4.mongodb.net:27017,ac-8tp99le-shard-00-02.4uyeow4.mongodb.net:27017/cars?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=cars

# JWT Configuration (IMPORTANT: Generate secure secret)
JWT_SECRET=YOUR_SECURE_RANDOM_SECRET_HERE
JWT_EXPIRES_IN=7d

# Admin Credentials (for seeding/login)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=YOUR_SECURE_ADMIN_PASSWORD

# Ntfy Push Notifications (Optional)
NTFY_TOPIC=carsma2026
NTFY_SERVER=https://ntfy.sh
```

### 🔑 How to Generate Secure Values:

**JWT_SECRET** (Run in terminal):
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**ADMIN_PASSWORD**: Use a strong password (min 12 characters, mix of letters, numbers, symbols)

---

## 📋 Frontend Service Variables

Copy these into Railway → Frontend Service → Variables tab:

```bash
# Backend API URL (IMPORTANT: Replace with your actual Railway backend URL)
NEXT_PUBLIC_API_URL=https://your-backend-service.railway.app
```

**That's it!** Frontend only needs one variable.

---

## ✅ Step-by-Step Setup

### 1. Deploy Backend First

1. Go to Railway → Backend Service
2. Click **Variables** tab
3. Add all backend variables above
4. **Important**: Replace these placeholders:
   - `YOUR_NEW_PASSWORD` - New MongoDB password
   - `YOUR_SECURE_RANDOM_SECRET_HERE` - Generated JWT secret
   - `YOUR_SECURE_ADMIN_PASSWORD` - Strong admin password
   - `https://your-frontend-service.railway.app` - Will update after frontend deploys
5. Click **Deploy** or wait for auto-deploy
6. **Copy the backend URL** (e.g., `https://carsma-backend-production.railway.app`)

### 2. Deploy Frontend Second

1. Go to Railway → Frontend Service
2. Click **Variables** tab
3. Add frontend variable:
   ```bash
   NEXT_PUBLIC_API_URL=https://your-backend-url-from-step-1.railway.app
   ```
4. Click **Deploy** or wait for auto-deploy
5. **Copy the frontend URL** (e.g., `https://carsma-frontend-production.railway.app`)

### 3. Update Backend FRONTEND_URL

1. Go back to Railway → Backend Service → Variables
2. Update `FRONTEND_URL` with the actual frontend URL from step 2
3. Redeploy backend

---

## 🧪 Verification Checklist

After both services are deployed:

### Backend Health Check:
```bash
curl https://your-backend-url.railway.app/health
```
Expected response:
```json
{"status":"ok","message":"Server is running"}
```

### Frontend Check:
1. Visit your frontend URL in browser
2. Open browser console (F12)
3. Check for any CORS errors (should be none)
4. Try loading products page
5. Try placing a test order

### CORS Verification:
- No "CORS policy" errors in browser console
- API requests complete successfully
- Admin login works

---

## 🔒 Security Checklist

- [ ] Changed MongoDB password from exposed one
- [ ] Generated secure JWT_SECRET (64+ characters)
- [ ] Set strong ADMIN_PASSWORD
- [ ] FRONTEND_URL matches actual frontend URL
- [ ] NEXT_PUBLIC_API_URL matches actual backend URL
- [ ] Both services show "Online" status in Railway
- [ ] No CORS errors in browser console

---

## 📝 Quick Reference

| Variable | Service | Required | Example |
|----------|---------|----------|---------|
| `NODE_ENV` | Backend | Yes | `production` |
| `PORT` | Backend | Optional | `5000` |
| `FRONTEND_URL` | Backend | Yes | `https://frontend.railway.app` |
| `MONGODB_URI` | Backend | Yes | `mongodb+srv://...` |
| `JWT_SECRET` | Backend | Yes | `<64-char-hex-string>` |
| `JWT_EXPIRES_IN` | Backend | Yes | `7d` |
| `ADMIN_EMAIL` | Backend | Yes | `admin@example.com` |
| `ADMIN_PASSWORD` | Backend | Yes | `<strong-password>` |
| `NTFY_TOPIC` | Backend | Optional | `carsma2026` |
| `NTFY_SERVER` | Backend | Optional | `https://ntfy.sh` |
| `NEXT_PUBLIC_API_URL` | Frontend | Yes | `https://backend.railway.app` |

---

## 🆘 Troubleshooting

### CORS Errors:
- Verify `FRONTEND_URL` in backend matches actual frontend URL exactly
- Check for trailing slashes (should not have them)
- Redeploy backend after changing FRONTEND_URL

### API Connection Fails:
- Verify `NEXT_PUBLIC_API_URL` in frontend matches backend URL exactly
- Check backend is "Online" in Railway
- Test backend health endpoint directly

### MongoDB Connection Fails:
- Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Check MONGODB_URI is correct
- Ensure password doesn't contain special characters that need URL encoding

---

**Copy these variables to Railway and your services will communicate securely!** 🚀
