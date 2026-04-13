# 🚂 Railway Simple Fix - DO THIS

## ✅ Backend Service Settings

### In Railway Dashboard → Backend Service → Settings:

**Root Directory:**
```
backend
```

**Build Command:** (LEAVE EMPTY - let Railway auto-detect)
```

```

**Start Command:**
```
npm start
```

**That's it!** Railway will automatically:
1. Detect it's a Node.js project
2. Run `npm install`
3. Run `npm run build` (if it exists)
4. Run `npm start`

---

## 🔄 If That Doesn't Work, Try This:

**Build Command:**
```
npm run build
```

**Start Command:**
```
npm start
```

Railway will handle `npm install` automatically before the build command.

---

## 📋 Environment Variables (Don't Forget!)

```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://matrix049:NEW_PASSWORD@...
JWT_SECRET=<generate-secure-secret>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-url.railway.app
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<secure-password>
NTFY_TOPIC=carsma2026
NTFY_SERVER=https://ntfy.sh
```

---

## 🎯 Summary

1. Set **Root Directory** to `backend`
2. **Leave Build Command EMPTY** (or use `npm run build`)
3. Set **Start Command** to `npm start`
4. Add environment variables
5. Deploy

**Done!** 🚀
