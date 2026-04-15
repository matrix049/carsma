# 📊 How to View Your MongoDB Database

There are several ways to view and manage your MongoDB database data:

---

## Option 1: MongoDB Atlas Web Interface (Recommended)

This is the easiest way to view your data directly in your browser.

### Steps:
1. Go to https://cloud.mongodb.com
2. Log in with your MongoDB Atlas account
3. Click on your cluster (the one named `cars` or similar)
4. Click **"Browse Collections"** button
5. You'll see all your collections:
   - `products` - Your wall art products
   - `orders` - Customer orders
   - `customorders` - Custom design requests
   - `contactmessages` - Contact form submissions
   - `admins` - Admin users

### What You Can Do:
- ✅ View all documents in each collection
- ✅ Search and filter data
- ✅ Edit documents directly
- ✅ Delete documents
- ✅ Add new documents manually
- ✅ Export data to JSON/CSV

---

## Option 2: MongoDB Compass (Desktop App)

MongoDB Compass is a free GUI tool for exploring your database.

### Steps:
1. Download MongoDB Compass: https://www.mongodb.com/try/download/compass
2. Install and open it
3. Connect using your connection string:
   ```
   mongodb+srv://matrix049:YOUR_PASSWORD@ac-8tp99le.4uyeow4.mongodb.net/cars
   ```
4. Replace `YOUR_PASSWORD` with your actual MongoDB password
5. Click **"Connect"**

### What You Can Do:
- ✅ Visual query builder
- ✅ Schema analysis
- ✅ Performance insights
- ✅ Index management
- ✅ Aggregation pipeline builder

---

## Option 3: MongoDB Shell (mongosh)

For command-line users who prefer terminal access.

### Steps:
1. Install mongosh: https://www.mongodb.com/try/download/shell
2. Connect to your database:
   ```bash
   mongosh "mongodb+srv://matrix049:YOUR_PASSWORD@ac-8tp99le.4uyeow4.mongodb.net/cars"
   ```
3. Use these commands:

### Common Commands:
```javascript
// Show all collections
show collections

// View all products
db.products.find()

// View all orders
db.orders.find()

// Count products
db.products.countDocuments()

// Find specific product by name
db.products.findOne({ name: "Ferrari F40" })

// View recent orders (last 10)
db.orders.find().sort({ createdAt: -1 }).limit(10)

// View pending orders only
db.orders.find({ status: "pending" })

// Delete a product by ID
db.products.deleteOne({ _id: ObjectId("YOUR_PRODUCT_ID") })

// Update product price
db.products.updateOne(
  { name: "Ferrari F40" },
  { $set: { price: 350 } }
)
```

---

## Option 4: Through Your Admin Dashboard

You already have an admin panel at `/admin/products` where you can:
- ✅ View all products
- ✅ Add new products
- ✅ Delete products
- ✅ See product details

### Access:
1. Go to: `https://your-frontend-url.railway.app/admin/login`
2. Login with your admin credentials
3. Navigate to **Products** in the sidebar

---

## Quick Database Overview

### Your Collections:

| Collection | Description | Fields |
|------------|-------------|--------|
| `products` | Wall art products | name, price, image, description, category, inStock |
| `orders` | Customer orders | customer, products, totalPrice, status, paymentMethod |
| `customorders` | Custom design requests | customer, carDetails, status, notes |
| `contactmessages` | Contact form messages | customer (name, email), message, status |
| `admins` | Admin users | email, password (hashed) |

---

## Useful MongoDB Atlas Features

### 1. Data Explorer
- Browse all collections
- Filter and search documents
- Edit documents inline

### 2. Charts
- Create visual dashboards
- Track sales over time
- Monitor order status distribution

### 3. Triggers
- Set up automated actions
- Send notifications on new orders
- Auto-archive old data

### 4. Backup & Restore
- Automatic daily backups
- Point-in-time recovery
- Download backup snapshots

---

## Security Tips

⚠️ **Important:**
- Never share your MongoDB connection string publicly
- Change your password regularly
- Use IP whitelist in MongoDB Atlas (currently set to allow all: 0.0.0.0/0)
- Keep your admin credentials secure

---

## Need Help?

If you need to:
- Export all data → Use MongoDB Atlas "Export Collection"
- Backup database → Use MongoDB Atlas "Backup" feature
- Reset database → Drop collections and re-run seed script
- Add sample data → Use the seed script: `npm run seed` in backend folder

---

## Current Database Connection

**Cluster:** `ac-8tp99le.4uyeow4.mongodb.net`  
**Database:** `cars`  
**Username:** `matrix049`  
**Password:** `Abdo741` (⚠️ Change this!)

**Connection String:**
```
mongodb+srv://matrix049:Abdo741@ac-8tp99le.4uyeow4.mongodb.net/cars?retryWrites=true&w=majority
```

---

**Recommendation:** Use MongoDB Atlas Web Interface for quick viewing, and MongoDB Compass for detailed exploration and management.
