# Deployment Checklist for L7IT.art

## Your Deployment URLs
- **Frontend**: https://l7it.art
- **Backend**: https://api.l7it.art

## ✅ Backend Environment Variables (Railway)

Set these in your **backend** Railway project:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://matrix049:Abdo741@cars.4uyeow4.mongodb.net/?appName=cars
JWT_SECRET=your-production-jwt-secret-change-this
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://l7it.art
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
SEED_SECRET_KEY=your-secret-seed-key-change-this
```

**⚠️ Important:**
- Change `JWT_SECRET` to a strong random string
- Change `ADMIN_PASSWORD` after first login
- Change `SEED_SECRET_KEY` to a secure value

## ✅ Frontend Environment Variables (Railway)

Set these in your **frontend** Railway project:

```env
NEXT_PUBLIC_API_URL=https://api.l7it.art
```

## 🚀 Deployment Steps

### 1. Backend Setup
- [x] Deploy backend to Railway
- [x] Set custom domain: api.l7it.art
- [ ] Add all environment variables listed above
- [ ] Verify deployment is successful
- [ ] Test API endpoint: `https://api.l7it.art/api/products`

### 2. Frontend Setup
- [x] Deploy frontend to Railway
- [x] Set custom domain: l7it.art
- [ ] Add `NEXT_PUBLIC_API_URL` environment variable
- [ ] Redeploy after adding variable
- [ ] Verify products appear on homepage

### 3. Database Setup
- [x] MongoDB Atlas cluster created
- [x] Database seeded with products
- [x] Admin user created
- [ ] Verify connection from Railway

### 4. Testing
- [ ] Visit https://l7it.art
- [ ] Check products load on homepage
- [ ] Check shop page shows products
- [ ] Test admin login at https://l7it.art/admin/login
  - Email: admin@example.com
  - Password: admin123
- [ ] Verify admin dashboard loads
- [ ] Test creating an order
- [ ] Test contact form submission

## 🔧 Troubleshooting

### Products not showing?
1. Check backend logs in Railway
2. Verify MongoDB connection
3. Test API directly: `curl https://api.l7it.art/api/products`
4. Check if database was seeded

### Admin login not working?
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_API_URL` is set correctly
3. Check Network tab - requests should go to api.l7it.art
4. Verify CORS is configured correctly in backend

### CORS errors?
1. Ensure `FRONTEND_URL=https://l7it.art` in backend
2. Check backend CORS configuration in server.ts
3. Redeploy backend after changing CORS settings

## 🔒 Security Checklist

- [ ] Change default admin password
- [ ] Update JWT_SECRET to strong random value
- [ ] Update SEED_SECRET_KEY
- [ ] Enable MongoDB IP whitelist (or use 0.0.0.0/0 for Railway)
- [ ] Review and remove seed endpoint after initial setup
- [ ] Set up environment-specific configs
- [ ] Enable HTTPS only (Railway does this automatically)

## 📝 Post-Deployment

1. **Change Admin Password**
   - Login to admin panel
   - Go to settings (if available)
   - Or manually update in database

2. **Add More Products**
   - Login to admin panel
   - Navigate to products section
   - Add your actual products with real images

3. **Test All Features**
   - Browse products
   - Add to cart
   - Checkout process
   - Admin order management
   - Contact form
   - Custom orders

4. **Monitor**
   - Check Railway logs regularly
   - Monitor MongoDB usage
   - Watch for errors

## 🎯 Quick Commands

### Test Backend API
```bash
# Get products
curl https://api.l7it.art/api/products

# Test admin login
curl -X POST https://api.l7it.art/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### Seed Database via API (if needed)
```bash
curl -X POST https://api.l7it.art/api/seed-database \
  -H "Content-Type: application/json" \
  -d '{"secretKey":"your-secret-seed-key-change-this"}'
```

## 📞 Support

If you encounter issues:
1. Check Railway logs (both frontend and backend)
2. Check browser console for frontend errors
3. Verify all environment variables are set
4. Test API endpoints directly
5. Check MongoDB Atlas connection

---

**Last Updated**: After deployment to l7it.art and api.l7it.art
