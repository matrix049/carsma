# 🚂 Railway Monorepo Fix - STEP BY STEP

## 🎯 The Problem

Railway is running commands from the ROOT directory (where your workspace is), not from the `backend` folder!

```
❌ Railway is here: /app/
✅ Should be here: /app/backend/
```

---

## ✅ SOLUTION: Set Root Directory

### Step 1: Go to Railway Dashboard

1. Open your backend service
2. Click **Settings** tab

### Step 2: Find Root Directory Setting

Scroll down to the **Build & Deploy** section

### Step 3: Set Root Directory

In the **Root Directory** field, enter:
```
backend
```

### Step 4: Verify Build Commands

Make sure these are set:

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm start
```

### Step 5: Save & Redeploy

1. Click **Save** (if there's a save button)
2. Go to **Deployments** tab
3. Click **Redeploy** on the latest deployment

---

## 🔄 Alternative: If Root Directory Doesn't Work

Some Railway versions might ignore Root Directory. If that happens:

### Use Workspace Commands Instead:

**Root Directory:** (leave empty)

**Build Command:**
```
npm install && npm run build --workspace=backend
```

**Start Command:**
```
npm run start --workspace=backend
```

---

## 📋 Complete Backend Configuration

```
Service: Backend
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start

Environment Variables:
- NODE_ENV=production
- MONGODB_URI=mongodb+srv://...
- JWT_SECRET=<your-secret>
- JWT_EXPIRES_IN=7d
- FRONTEND_URL=https://your-frontend.railway.app
- ADMIN_EMAIL=admin@example.com
- ADMIN_PASSWORD=<secure-password>
- NTFY_TOPIC=carsma2026
- NTFY_SERVER=https://ntfy.sh
```

---

## 📋 Complete Frontend Configuration

```
Service: Frontend
Root Directory: frontend
Build Command: npm install && npm run build
Start Command: npm start

Environment Variables:
- NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

---

## ✅ What Should Happen

After setting Root Directory to `backend`, Railway will:

1. Navigate to `/app/backend/`
2. Run `npm install` (installs backend dependencies)
3. Run `npm run build` (compiles TypeScript)
4. Run `npm start` (starts the server)

**Build logs should show:**
```
✓ Successfully compiled TypeScript
✓ MongoDB connected successfully
Server running on port 5000
```

---

## 🐛 Still Not Working?

### Check These:

1. **Root Directory is set to `backend`** (not `./backend` or `/backend`)
2. **Build command includes `npm install`**
3. **No typos in commands**
4. **Railway has pulled latest code from GitHub**

### Force Fresh Deploy:

1. Go to Settings
2. Scroll to bottom
3. Click **"Restart Deployment"** or **"Redeploy"**

---

## 💡 Pro Tip: Check Build Logs

In Railway, click on a deployment to see detailed logs. Look for:

```
✓ Running in directory: /app/backend
✓ Installing dependencies...
✓ Building TypeScript...
✓ Build successful!
```

If you see `/app/` instead of `/app/backend/`, the Root Directory isn't set correctly.

---

**Set Root Directory to `backend` and redeploy!** 🚀
