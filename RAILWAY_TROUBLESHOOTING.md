# Railway Deployment Troubleshooting

## Current Issues
- ❌ Products page keeps loading
- ❌ Admin login keeps loading
- ❌ Backend API returns: `{"error":true,"message":"Failed to retrieve products"}`

## Root Cause
Your Railway backend cannot connect to MongoDB Atlas.

## Solution Steps

### 1. Fix MongoDB Atlas IP Whitelist

**Option A: Allow All IPs (Easiest for Railway)**
1. Go to MongoDB Atlas dashboard
2. Click "Network Access" in left sidebar
3. Click "Add IP Address"
4. Click "Allow Access from Anywhere"
5. Enter `0.0.0.0/0` in the IP Address field
6. Click "Confirm"

**Option B: Whitelist Railway IPs (More Secure)**
Railway uses dynamic IPs, so Option A is recommended.

### 2. Verify Railway Environment Variables

**Backend Project (api.l7it.art):**
Go to Railway → Your Backend Project → Variables tab

Ensure these are set:
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://matrix049:Abdo741@cars.4uyeow4.mongodb.net/?appName=cars
JWT_SECRET=your-strong-secret-key-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://l7it.art
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
SEED_SECRET_KEY=your-seed-secret-here
```

**Frontend Project (l7it.art):**
Go to Railway → Your Frontend Project → Variables tab

Ensure this is set:
```
NEXT_PUBLIC_API_URL=https://api.l7it.art
```

### 3. Check Backend Health

After fixing MongoDB access, test your backend:

```bash
curl https://api.l7it.art/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "environment": "production",
  "database": {
    "connected": true,
    "state": "connected",
    "productCount": 3,
    "canQuery": true
  }
}
```

If you see `"connected": false`, MongoDB connection is still failing.

### 4. Test Products API

```bash
curl https://api.l7it.art/api/products
```

Expected response:
```json
{
  "products": [
    {
      "_id": "...",
      "name": "Audi Wall Art",
      "price": 49.99,
      "image": "/images/car1.jpg",
      ...
    }
  ]
}
```

### 5. Test Admin Login

```bash
curl -X POST https://api.l7it.art/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "...",
    "email": "admin@example.com"
  }
}
```

## Common Errors and Solutions

### Error: "MongooseServerSelectionError"
**Cause**: MongoDB Atlas IP not whitelisted
**Solution**: Add `0.0.0.0/0` to MongoDB Atlas Network Access

### Error: "Authentication failed"
**Cause**: Wrong MongoDB credentials
**Solution**: Check MONGODB_URI in Railway variables

### Error: "CORS policy"
**Cause**: Frontend URL not whitelisted in backend
**Solution**: Set `FRONTEND_URL=https://l7it.art` in backend Railway variables

### Products/Login keeps loading forever
**Cause**: Frontend can't reach backend API
**Solution**: 
1. Set `NEXT_PUBLIC_API_URL=https://api.l7it.art` in frontend Railway
2. Redeploy frontend
3. Clear browser cache (Ctrl+Shift+R)

## Verification Checklist

After making changes:

- [ ] MongoDB Atlas allows `0.0.0.0/0` access
- [ ] All backend environment variables are set in Railway
- [ ] `NEXT_PUBLIC_API_URL` is set in frontend Railway
- [ ] Both projects redeployed
- [ ] `curl https://api.l7it.art/api/health` returns `"connected": true`
- [ ] `curl https://api.l7it.art/api/products` returns products array
- [ ] Visit https://l7it.art - products appear
- [ ] Admin login works at https://l7it.art/admin/login

## Quick Debug Commands

### Check if backend is running
```bash
curl https://api.l7it.art/api/health
```

### Check if products exist in database
Run locally:
```bash
cd backend
node src/scripts/check-db.js
```

### Check Railway logs
1. Go to Railway dashboard
2. Click on your backend project
3. Click "Deployments" tab
4. Click on latest deployment
5. View logs for errors

## Still Not Working?

### Check Railway Logs
Look for these errors in backend logs:
- `MongooseServerSelectionError` → MongoDB connection issue
- `ECONNREFUSED` → Backend can't start
- `CORS` → Frontend URL not whitelisted

### Check Browser Console
1. Open https://l7it.art
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Look for errors
5. Go to Network tab
6. Check if requests to api.l7it.art are failing

### MongoDB Atlas Dashboard
1. Go to MongoDB Atlas
2. Click "Database" → "Browse Collections"
3. Select your database
4. Check "products" collection has 3 items
5. Check "admins" collection has 1 item

## Contact Support

If still having issues:
1. Share Railway backend logs
2. Share browser console errors
3. Share result of `curl https://api.l7it.art/api/health`
4. Share MongoDB Atlas network access settings screenshot
