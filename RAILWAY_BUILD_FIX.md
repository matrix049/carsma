# 🚂 Railway Build Configuration - CORRECT SETTINGS

## 🎯 The Issue

Railway detected your monorepo workspace and is running commands from the ROOT directory, not the backend folder!

---

## ✅ SOLUTION 1: Use Root Directory Setting (RECOMMENDED)

### Backend Service Settings:

**Root Directory:**
```
backend
```

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm start
```

This tells Railway to work INSIDE the backend folder, not the root.

---

## ✅ SOLUTION 2: Use Workspace Commands (Alternative)

If Railway ignores Root Directory setting, use workspace commands:

**Root Directory:** (leave empty or set to `.`)

**Build Command:**
```
npm install && npm run build --workspace=backend
```

**Start Command:**
```
npm run start --workspace=backend
```

---

## 🔧 How to Set Root Directory in Railway

1. Go to your backend service
2. Click **Settings** tab
3. Scroll to **Build & Deploy** section
4. Find **Root Directory** field
5. Enter: `backend`
6. Click **Save**
7. Redeploy

---

### For Frontend Service:

**Root Directory:**
```
frontend
```

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm start
```

---

## 🔧 Alternative: Let Railway Auto-Detect

If you're using Railway's Nixpacks (default), you can also:

1. **Leave Build Command EMPTY**
2. Railway will automatically run:
   - `npm install`
   - `npm run build`

3. **Only set Start Command:**
   - Backend: `npm start`
   - Frontend: `npm start`

---

## 📋 Step-by-Step Railway Setup

### Backend:

1. Create new service
2. Connect GitHub repo
3. Set these in Settings:
   ```
   Root Directory: backend
   Build Command: npm install && npm run build
   Start Command: npm start
   ```
4. Add environment variables (see DEPLOYMENT_GUIDE.md)
5. Deploy

### Frontend:

1. Create new service
2. Connect GitHub repo
3. Set these in Settings:
   ```
   Root Directory: frontend
   Build Command: npm install && npm run build
   Start Command: npm start
   ```
4. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   ```
5. Deploy

---

## 🐛 If Build Still Fails

### Check Railway Logs for:

1. **TypeScript errors** - Check build logs
2. **Missing dependencies** - Verify package.json
3. **Wrong Node version** - Railway uses Node 18+ by default

### Force Rebuild:

1. Go to Deployments
2. Click "..." on latest deployment
3. Click "Redeploy"

---

## 💡 Pro Tip: Use Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy from CLI
railway up
```

---

## ✅ Verification

After successful build, you should see in logs:

**Backend:**
```
✓ Compiled successfully
✓ MongoDB connected successfully
Server running on port 5000
```

**Frontend:**
```
✓ Compiled successfully
ready - started server on 0.0.0.0:3000
```

---

**Use the correct build command and your deployment will work!** 🚀
