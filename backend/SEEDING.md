# Database Seeding Guide

## Overview

This guide explains how to seed the database with initial data for the wall decoration e-commerce platform.

## What Gets Seeded

The seed script (`src/scripts/seed.ts`) populates the database with:

### Products (3 items)
1. **Audi Wall Art** - $49.99
2. **BMW Wall Art** - $54.99
3. **Mercedes Wall Art** - $59.99

### Admin User (1 user)
- Email: Configured via `ADMIN_EMAIL` environment variable (default: `admin@example.com`)
- Password: Configured via `ADMIN_PASSWORD` environment variable (default: `admin123`)

## Prerequisites

Before running the seed script, ensure:

1. **MongoDB is running**
   - For local MongoDB: Start the MongoDB service
   - For MongoDB Atlas: Ensure your connection string is in `.env`

2. **Environment variables are configured**
   - Copy `.env.example` to `.env` if not already done
   - Update `MONGODB_URI` with your database connection string
   - Optionally customize `ADMIN_EMAIL` and `ADMIN_PASSWORD`

## Running the Seed Script

### Option 1: Using npm script (Recommended)

```bash
cd backend
npm run seed
```

### Option 2: Using ts-node directly

```bash
cd backend
npx ts-node src/scripts/seed.ts
```

## Expected Output

When the seed script runs successfully, you should see:

```
🌱 Starting database seed...

✓ MongoDB connected successfully
Clearing existing data...
✓ Existing data cleared

Seeding products...
✓ Created 3 products

Seeding admin user...
✓ Created admin user: admin@example.com

📊 Seed Summary:
================
Products: 3
Admin users: 1

✅ Database seeding completed successfully!
MongoDB connection closed
```

## Troubleshooting

### MongoDB Connection Error

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions:**
- **Local MongoDB:** Ensure MongoDB service is running
  - Windows: `net start MongoDB` or start MongoDB Compass
  - macOS: `brew services start mongodb-community`
  - Linux: `sudo systemctl start mongod`
  
- **MongoDB Atlas:** 
  - Verify your connection string in `.env`
  - Check network access settings in Atlas dashboard
  - Ensure your IP address is whitelisted

### Authentication Error

**Error:** `MongoServerError: Authentication failed`

**Solution:** Verify your MongoDB credentials in the connection string

### Duplicate Key Error

**Error:** `E11000 duplicate key error`

**Solution:** The seed script clears existing data first, but if you encounter this:
1. Manually clear the collections in MongoDB
2. Or drop the database and re-run the seed script

## Verifying Seeded Data

### Quick Verification (Recommended)

Run the verification script to check if seeding was successful:

```bash
npm run verify-seed
```

Expected output:
```
🔍 Verifying database seed...

✓ MongoDB connected successfully
Checking products...
Found 3 products:
  1. Audi Wall Art - $49.99 (Audi)
  2. BMW Wall Art - $54.99 (BMW)
  3. Mercedes Wall Art - $59.99 (Mercedes)

Checking admin users...
Found 1 admin user(s):
  1. admin@example.com

📊 Verification Summary:
========================
Products: 3/3 ✅
Admin users: 1/1 ✅

✅ Database is properly seeded!
```

### Using MongoDB Compass
1. Connect to your database
2. Navigate to the `wall-decoration-ecommerce` database
3. Check the `products` collection (should have 3 documents)
4. Check the `admins` collection (should have 1 document)

### Using MongoDB Shell
```bash
mongosh
use wall-decoration-ecommerce
db.products.find()
db.admins.find()
```

### Using the API
Once the backend server is running:

**Get Products:**
```bash
curl http://localhost:5000/api/products
```

**Test Admin Login:**
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## Re-seeding the Database

The seed script is **idempotent** - it clears existing data before seeding. You can safely run it multiple times:

```bash
npm run seed
```

This is useful when:
- You want to reset the database to initial state
- You've modified the seed data and want to update
- You're testing and need fresh data

## Customizing Seed Data

To modify the seeded products or admin credentials:

1. **Products:** Edit the `products` array in `src/scripts/seed.ts`
2. **Admin:** Update `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`

## Production Considerations

⚠️ **Important:** 
- Change the default admin password before deploying to production
- Use strong, unique passwords for production admin accounts
- Consider using environment-specific seed scripts
- Never commit production credentials to version control

## Next Steps

After seeding:
1. Start the backend server: `npm run dev`
2. Verify the API endpoints are working
3. Test the admin login with seeded credentials
4. Proceed with frontend development
