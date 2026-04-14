# Seed Database via API

## Overview
This guide explains how to seed your production database using the API endpoint.

## Why Use API Seeding?
- Your local IP might not be whitelisted in MongoDB Atlas
- Easier to seed production database from anywhere
- No need to run scripts locally

## Steps to Seed Production Database

### 1. Make sure your backend is deployed and running

Your backend should be accessible at your production URL (e.g., `https://your-backend.railway.app`)

### 2. Set the SEED_SECRET_KEY environment variable

In your Railway/deployment platform:
- Add environment variable: `SEED_SECRET_KEY=your-secret-seed-key-change-this`
- Redeploy if necessary

### 3. Call the seed endpoint

Use curl, Postman, or any HTTP client:

```bash
curl -X POST https://your-backend-url.railway.app/api/seed-database \
  -H "Content-Type: application/json" \
  -d '{"secretKey": "your-secret-seed-key-change-this"}'
```

**Replace:**
- `https://your-backend-url.railway.app` with your actual backend URL
- `your-secret-seed-key-change-this` with your actual secret key

### 4. Verify the response

Success response:
```json
{
  "success": true,
  "message": "Database seeded successfully",
  "data": {
    "productsCreated": 8,
    "adminCreated": 1,
    "adminEmail": "admin@example.com"
  }
}
```

## What Gets Seeded

### Products (8 items)
1. Audi Wall Art - $49.99
2. BMW Wall Art - $54.99
3. Mercedes Wall Art - $59.99
4. Porsche Wall Art - $64.99
5. Ferrari Wall Art - $69.99
6. Lamborghini Wall Art - $74.99
7. Tesla Wall Art - $59.99
8. Bugatti Wall Art - $79.99

### Admin User
- Email: From `ADMIN_EMAIL` env variable
- Password: From `ADMIN_PASSWORD` env variable

## Security Notes

⚠️ **Important:**
- Keep your `SEED_SECRET_KEY` secret
- Don't commit it to version control
- Change it from the default value
- Consider removing this endpoint after initial seeding
- Or add IP restrictions in production

## Troubleshooting

### 403 Forbidden
- Check that your `secretKey` matches the `SEED_SECRET_KEY` environment variable
- Ensure the environment variable is set in your deployment

### 500 Internal Server Error
- Check your MongoDB connection string
- Verify MongoDB Atlas network access settings
- Check backend logs for detailed error messages

### Products not showing on frontend
- Clear browser cache
- Check that frontend is pointing to correct backend URL
- Verify API endpoint: `GET https://your-backend-url/api/products`

## After Seeding

1. Visit your website
2. Products should now appear on the home page and shop page
3. Login to admin panel with the seeded credentials
4. You can add more products through the admin interface

## Alternative: Whitelist Your IP in MongoDB Atlas

If you prefer to seed locally:
1. Go to MongoDB Atlas dashboard
2. Network Access → Add IP Address
3. Add your current IP or use `0.0.0.0/0` (allow from anywhere - less secure)
4. Run `npm run seed` from backend directory
