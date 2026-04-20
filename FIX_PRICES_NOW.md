# 🚀 Fix Product Prices to 200 MAD - Quick Start

## TL;DR - Do This Now! ⚡

Your products are showing 50 MAD but should show 200 MAD. The code is fixed, but the database needs updating.

---

## ⭐ EASIEST METHOD - Use the HTML Tool

### Step 1: Open the Tool
Double-click `update-prices.html` in this folder to open it in your browser.

### Step 2: Login to Admin
Go to https://l7it.art/admin and login:
- Email: `admin@l7it.com`
- Password: `bo3bola2026`

### Step 3: Get Your Token
1. Press F12 to open DevTools
2. Click "Console" tab
3. Type: `localStorage.getItem('token')`
4. Press Enter
5. Copy the token (the long text in quotes)

### Step 4: Update Prices
1. Go back to the `update-prices.html` page
2. Paste your token in the input box
3. Click "Update All Prices to 200 MAD"
4. Wait for success message

### Step 5: Verify
Go to https://l7it.art/shop - all products should now show 200 MAD!

---

## 🎯 Alternative: Use Browser Console

If the HTML tool doesn't work, use this method:

1. Login to https://l7it.art/admin
2. Press F12 → Console tab
3. Get token: `localStorage.getItem('token')`
4. Copy the token (without quotes)
5. Run this (replace YOUR_TOKEN_HERE with your actual token):

```javascript
fetch('https://l7it.art/api/admin-tools/update-prices', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE',
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ SUCCESS!');
  console.log('Updated products:', data.products);
  alert('Prices updated! Check the shop page.');
})
.catch(err => {
  console.error('❌ ERROR:', err);
  alert('Failed to update. Check console for details.');
});
```

---

## 📋 What Was Fixed

### ✅ Frontend (Already Done)
- Removed +150 MAD size modifier
- Now displays database price directly
- Fixed size to Medium (120cm x 35cm)
- All cart calculations use correct prices

### ✅ Backend (Already Done)
- Updated seed script to use 200 MAD
- Created API endpoint to update prices
- Created update script
- MongoDB connection configured

### ⏳ Database (Needs Your Action)
- Products still have old prices (~50 MAD)
- Need to update to 200 MAD
- Use one of the methods above

---

## 🔍 Verification Checklist

After updating, check these:

- [ ] Shop page shows 200 MAD for all products
- [ ] Product detail page shows 200 MAD
- [ ] Adding to cart shows 200 MAD
- [ ] Cart total is correct (200 × quantity)
- [ ] Checkout shows correct total

---

## ❓ Troubleshooting

**"Token is invalid"**
→ Logout and login again, get a fresh token

**"Not allowed by CORS"**
→ Make sure you're logged in at l7it.art/admin first

**"Failed to fetch"**
→ Check if Railway backend is running at l7it.art/api

**Prices still show 50 MAD**
→ Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

**Can't login to admin**
→ Email: admin@l7it.com, Password: bo3bola2026

---

## 📞 Need More Help?

Read these detailed guides:
1. `PRICING_FIX_SUMMARY.md` - Complete overview
2. `PRICE_UPDATE_GUIDE.md` - Step-by-step instructions
3. `update-prices.html` - Interactive tool

---

## 🎉 Expected Result

After the update:
- **Audi Wall Art**: 200 MAD ✅
- **BMW Wall Art**: 200 MAD ✅
- **Mercedes Wall Art**: 200 MAD ✅

All products will show:
- Price: 200 MAD
- Size: Standard Size (120cm x 35cm)
- No size modifiers
- Correct cart totals
