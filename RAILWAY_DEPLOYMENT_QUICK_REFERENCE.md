# 🚂 Railway Deployment - Quick Reference

## Backend Service

### Settings
```
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start
```

### Environment Variables
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=<generate-secure-random-string>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-url.vercel.app
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<secure-password>
```

---

## Frontend Service

### Settings
```
Root Directory: frontend
Build Command: npm install && npm run build
Start Command: npm start
```

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

---

## 🔑 Generate Secure JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## ✅ Deployment Order
1. Deploy Backend first → Get backend URL
2. Deploy Frontend with backend URL in env vars
3. Update Backend's FRONTEND_URL with frontend URL
4. Test everything!

---

## 🧪 Test Commands
```bash
# Test backend
curl https://your-backend-url.railway.app/api/products

# Test frontend
# Visit in browser and check console for errors
```
