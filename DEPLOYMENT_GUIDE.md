# 🚀 Deployment Guide

## Project Structure
This is a monorepo with two separate applications:
- `/backend` - Node.js/Express API
- `/frontend` - Next.js application

## 🔐 Security Checklist

### ✅ Completed
- [x] `.env` files are in `.gitignore`
- [x] API URLs use environment variables
- [x] No hardcoded credentials in code
- [x] `.env.example` files created for documentation

### ⚠️ CRITICAL ACTION REQUIRED
**🚨 CHANGE YOUR MONGODB PASSWORD IMMEDIATELY!**

Your MongoDB credentials were exposed in `backend/.env`. You must:
1. Go to MongoDB Atlas (https://cloud.mongodb.com)
2. Navigate to Database Access
3. Change the password for user `matrix049`
4. Update the `MONGODB_URI` in Railway environment variables
5. **Never commit `.env` files to Git again**

---

## 📦 Backend Deployment (Railway)

### Configuration
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Port**: Railway will auto-assign (uses `PORT` env variable)

### Environment Variables (Set in Railway Dashboard)
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:NEW_PASSWORD@cluster.mongodb.net/dbname?retryWrites=true&w=majority
JWT_SECRET=generate-a-strong-random-secret-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-url.vercel.app
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-secure-password
```

### Generate Secure JWT Secret
Run this command to generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🎨 Frontend Deployment (Railway/Vercel)

### For Railway:
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Port**: Railway will auto-assign

### For Vercel (Recommended for Next.js):
- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

**Important**: The `NEXT_PUBLIC_` prefix is required for Next.js to expose the variable to the browser.

---

## 🔄 Deployment Steps

### 1. Backend First
1. Create a new Railway project for backend
2. Connect your GitHub repository
3. Set Root Directory to `backend`
4. Add all environment variables
5. Deploy and note the backend URL

### 2. Frontend Second
1. Create a new Vercel/Railway project for frontend
2. Connect your GitHub repository
3. Set Root Directory to `frontend`
4. Add environment variable: `NEXT_PUBLIC_API_URL=<your-backend-url>`
5. Deploy

### 3. Update Backend CORS
After frontend is deployed, update backend's `FRONTEND_URL` environment variable with the actual frontend URL.

---

## 🧪 Testing Deployment

### Backend Health Check
```bash
curl https://your-backend-url.railway.app/api/products
```

### Frontend Check
Visit your frontend URL and test:
- [ ] Homepage loads
- [ ] Products display
- [ ] Cart functionality works
- [ ] Checkout process works
- [ ] Admin login works

---

## 📝 Post-Deployment Checklist

- [ ] Changed MongoDB password
- [ ] Updated MONGODB_URI with new password
- [ ] Generated and set secure JWT_SECRET
- [ ] Verified backend is running
- [ ] Verified frontend is running
- [ ] Tested API connection between frontend and backend
- [ ] Tested admin login
- [ ] Tested order creation
- [ ] Set up custom domain (optional)

---

## 🐛 Troubleshooting

### Frontend can't connect to backend
- Check `NEXT_PUBLIC_API_URL` is set correctly
- Verify backend URL is accessible
- Check CORS settings in backend

### Backend database connection fails
- Verify MongoDB URI is correct
- Check MongoDB Atlas network access (allow all IPs: 0.0.0.0/0)
- Ensure database user has correct permissions

### Build fails
- Check all dependencies are in `package.json`
- Verify Node.js version compatibility
- Check build logs for specific errors

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)
