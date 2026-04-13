# ✅ Production Deployment Checklist

## 🎯 Summary of Configuration

All 4 tasks completed:

### ✅ Task 1: CORS Configuration
- Enhanced CORS in `backend/src/server.ts`
- Supports multiple origins (production + local dev)
- Allows credentials and proper HTTP methods
- Validates origin before allowing requests

### ✅ Task 2: API Connection
- Frontend uses `process.env.NEXT_PUBLIC_API_URL`
- No hardcoded URLs in production code
- Fallback to localhost for local development
- All API calls go through centralized `apiRequest()` function

### ✅ Task 3: Production Scripts
- Backend: `npm start` → `node dist/server.js` ✅
- Frontend: `npm start` → `next start` ✅
- No dev tools (nodemon, ts-node-dev) in production
- TypeScript compiled to JavaScript before deployment

### ✅ Task 4: Environment Variables
- Complete list in `RAILWAY_ENV_VARIABLES.md`
- Backend: 10 variables (8 required, 2 optional)
- Frontend: 1 variable (required)

---

## 📋 Backend Environment Variables

```bash
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend.railway.app
MONGODB_URI=mongodb+srv://username:password@...
JWT_SECRET=<generate-with-crypto>
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<secure-password>
NTFY_TOPIC=carsma2026
NTFY_SERVER=https://ntfy.sh
```

## 📋 Frontend Environment Variables

```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

---

## 🚀 Deployment Order

1. **Deploy Backend** → Get backend URL
2. **Deploy Frontend** with backend URL → Get frontend URL
3. **Update Backend** `FRONTEND_URL` with frontend URL
4. **Test Everything**

---

## 🔒 Security Actions Required

Before going live, you MUST:

- [ ] **Change MongoDB password** (currently exposed)
- [ ] **Generate JWT_SECRET** using crypto
- [ ] **Set strong ADMIN_PASSWORD**
- [ ] **Update FRONTEND_URL** with actual URL
- [ ] **Update NEXT_PUBLIC_API_URL** with actual URL

### Generate Secure JWT Secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🧪 Testing Checklist

### Backend Tests:
```bash
# Health check
curl https://your-backend.railway.app/health

# Products endpoint
curl https://your-backend.railway.app/api/products
```

### Frontend Tests:
- [ ] Homepage loads
- [ ] Products display correctly
- [ ] Cart functionality works
- [ ] Checkout process completes
- [ ] Admin login works
- [ ] No CORS errors in console

### Integration Tests:
- [ ] Frontend can fetch products from backend
- [ ] Orders can be created
- [ ] Custom requests can be submitted
- [ ] Contact form works
- [ ] Admin dashboard loads orders
- [ ] Ntfy notifications work (if configured)

---

## 📁 Files Modified/Created

### Modified:
- `backend/src/server.ts` - Enhanced CORS configuration
- `backend/tsconfig.json` - Fixed TypeScript deprecation
- `backend/package.json` - Added Node 18 requirement

### Created:
- `backend/.nvmrc` - Node version specification
- `backend/nixpacks.toml` - Railway build configuration
- `RAILWAY_ENV_VARIABLES.md` - Complete env vars guide
- `PRODUCTION_CHECKLIST.md` - This file

### Already Configured:
- `frontend/lib/api.ts` - Uses environment variables ✅
- `backend/package.json` - Production start script ✅
- `frontend/package.json` - Production start script ✅

---

## 🎉 You're Ready to Deploy!

All code is configured for production. Just:

1. Add environment variables to Railway
2. Deploy both services
3. Update URLs
4. Test

**See `RAILWAY_ENV_VARIABLES.md` for detailed deployment steps.**

---

## 📚 Documentation Reference

- `RAILWAY_ENV_VARIABLES.md` - Environment variables guide
- `RAILWAY_SIMPLE_FIX.md` - Railway configuration
- `DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `NTFY_SETUP_GUIDE.md` - Push notifications setup

---

**Your project is production-ready!** 🚀
