# 🔧 MongoDB URI Fix

## ❌ Current (WRONG) Format

Your current MongoDB URI has this format:
```
mongodb://matrix049:password@host1:27017,host2:27017,host3:27017/cars?options
```

This is the **old MongoDB connection string format** and causes the error:
> "mongodb+srv URI cannot have multiple service names"

---

## ✅ Correct Format for MongoDB Atlas

MongoDB Atlas uses the `mongodb+srv://` protocol which automatically handles the cluster hosts.

### Correct URI Format:

```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE?retryWrites=true&w=majority
```

### Your Correct URI Should Be:

```
mongodb+srv://matrix049:NEW_PASSWORD@ac-8tp99le.4uyeow4.mongodb.net/cars?retryWrites=true&w=majority
```

**Key Changes:**
1. Use `mongodb+srv://` (not `mongodb://`)
2. Use only the **cluster hostname**: `ac-8tp99le.4uyeow4.mongodb.net`
3. Remove the individual shard hosts
4. Remove port numbers (`:27017`)
5. Remove `ssl=true&authSource=admin&appName=cars` (not needed with srv)

---

## 🔑 How to Get the Correct URI

### Option 1: From MongoDB Atlas Dashboard

1. Go to https://cloud.mongodb.com
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **"Node.js"** driver
5. Copy the connection string
6. Replace `<password>` with your actual password
7. Replace `<dbname>` with `cars`

### Option 2: Build It Manually

Format:
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER_HOST/DATABASE?retryWrites=true&w=majority
```

Your values:
- **USERNAME**: `matrix049`
- **PASSWORD**: `<your-new-password>` (change from exposed one!)
- **CLUSTER_HOST**: `ac-8tp99le.4uyeow4.mongodb.net`
- **DATABASE**: `cars`

Result:
```
mongodb+srv://matrix049:YOUR_NEW_PASSWORD@ac-8tp99le.4uyeow4.mongodb.net/cars?retryWrites=true&w=majority
```

---

## 🚀 Update Railway Environment Variable

1. Go to Railway → Backend Service → Variables
2. Find `MONGODB_URI`
3. Replace with the correct format:
   ```
   mongodb+srv://matrix049:YOUR_NEW_PASSWORD@ac-8tp99le.4uyeow4.mongodb.net/cars?retryWrites=true&w=majority
   ```
4. **Important**: Replace `YOUR_NEW_PASSWORD` with your actual new password
5. Save and redeploy

---

## ⚠️ Important Security Steps

1. **Change your MongoDB password first!**
   - Go to MongoDB Atlas → Database Access
   - Edit user `matrix049`
   - Set a new strong password
   - Copy the new password

2. **Update the URI with new password**
   - Use the new password in the connection string
   - Make sure there are no special characters that need URL encoding
   - If password has special chars, URL encode them:
     - `@` → `%40`
     - `:` → `%3A`
     - `/` → `%2F`
     - `?` → `%3F`
     - `#` → `%23`

---

## ✅ Verification

After updating, your backend logs should show:
```
✓ MongoDB connected successfully
Server running on port 5000
```

Instead of:
```
❌ MongoParseError: mongodb+srv URI cannot have multiple service names
```

---

## 📋 Complete Correct URI Examples

### Standard (no special chars in password):
```
mongodb+srv://matrix049:MyNewPass123@ac-8tp99le.4uyeow4.mongodb.net/cars?retryWrites=true&w=majority
```

### With special characters (URL encoded):
```
mongodb+srv://matrix049:MyP%40ss%23123@ac-8tp99le.4uyeow4.mongodb.net/cars?retryWrites=true&w=majority
```

---

**Fix the URI format in Railway and your backend will connect successfully!** 🚀
