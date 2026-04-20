# Price Update Guide - Fix 100 MAD to 200 MAD

## Problem
Products are showing 50 MAD in the database, but should be 200 MAD. The frontend is correctly configured to display `product.price` directly.

## Solution Options

### Option 1: Use API Endpoint (Recommended - Fastest)

1. **Login to Admin Dashboard**
   - Go to: `https://l7it.art/admin`
   - Email: `admin@l7it.com`
   - Password: `bo3bola2026`

2. **Get Admin Token**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Type: `localStorage.getItem('token')`
   - Copy the token (without quotes)

3. **Call Price Update API**
   - Open a new tab in DevTools Console
   - Run this command (replace YOUR_TOKEN with the token from step 2):

```javascript
fetch('https://l7it.art/api/admin-tools/update-prices', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('✅ Prices updated:', data))
.catch(err => console.error('❌ Error:', err));
```

4. **Verify**
   - Refresh the shop page
   - All products should now show 200 MAD

---

### Option 2: Manual Update via Admin Panel

1. **Login to Admin Dashboard**
   - Go to: `https://l7it.art/admin/products`
   - Email: `admin@l7it.com`
   - Password: `bo3bola2026`

2. **Update Each Product**
   - Click "Edit" on each product
   - Change price to: `200`
   - Click "Save"
   - Repeat for all 3 products (Audi, BMW, Mercedes)

---

### Option 3: Re-seed Database (Nuclear Option)

⚠️ **WARNING**: This will delete ALL existing orders and data!

1. **Via Railway Dashboard**
   - Go to Railway project
   - Open backend service
   - Go to "Deployments" tab
   - Click on latest deployment
   - Open "Deploy Logs"

2. **Run Seed Command**
   - In Railway dashboard, go to "Settings"
   - Add a new "One-off Command": `npm run seed`
   - This will reset the database with fresh data at 200 MAD

---

## Verification Steps

After using any option above:

1. **Check Shop Page**
   - Go to: `https://l7it.art/shop`
   - All products should show 200 MAD

2. **Check Product Detail Page**
   - Click on any product
   - Price should show 200 MAD
   - No size modifiers (fixed at Standard Size)

3. **Check Cart**
   - Add product to cart
   - Cart should show 200 MAD per item

---

## Technical Details

### What Was Fixed
- ✅ Frontend: Removed +150 MAD size modifier
- ✅ Frontend: Set price to display `product.price` directly
- ✅ Backend: Updated seed script to use 200 MAD
- ✅ Backend: Created API endpoint for bulk price updates
- ⏳ Database: Still has old prices (~50 MAD) - needs update

### Files Modified
- `frontend/app/product/[id]/page.tsx` - Removed size price modifiers
- `frontend/components/ProductCard.tsx` - Fixed cart price
- `frontend/components/CompactProductCard.tsx` - Fixed display price
- `backend/src/scripts/seed.ts` - Updated seed prices to 200 MAD
- `backend/src/scripts/update-prices.ts` - Created price update script
- `backend/src/routes/admin-tools.ts` - Created API endpoint
- `backend/src/server.ts` - Registered admin-tools route

### MongoDB Connection
- URI: `mongodb+srv://matrix049:Abdo741@cars.4uyeow4.mongodb.net/cars?retryWrites=true&w=majority&appName=cars`
- Username: `matrix049`
- Password: `Abdo741`
- Database: `cars`

---

## Troubleshooting

### If API call fails:
1. Check if you're logged in as admin
2. Verify the token is correct (not expired)
3. Check Railway logs for errors
4. Try Option 2 (manual update) instead

### If prices still show 50 MAD:
1. Hard refresh the page (Ctrl+Shift+R)
2. Clear browser cache
3. Check if MongoDB URI is correct in Railway environment variables
4. Verify Railway backend is deployed and running

### If you see "ECONNREFUSED" error:
- This is normal for local development
- The fix needs to be applied on Railway (production)
- Local MongoDB connection is blocked by network/firewall

---

## Quick Command Reference

**Check current prices:**
```bash
curl https://l7it.art/api/admin-tools/prices \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Update all prices to 200 MAD:**
```bash
curl -X POST https://l7it.art/api/admin-tools/update-prices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```
