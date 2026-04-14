# Frontend Environment Setup

## Issue: Admin Login Not Working on Deployed Website

The admin login isn't working because your frontend is trying to connect to `localhost:5000` instead of your deployed backend.

## Solution

### For Deployed Frontend (Railway/Vercel/etc.)

Add this environment variable in your deployment platform:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

**Replace `https://your-backend-url.railway.app` with your actual backend URL**

### Steps for Railway:
1. Go to your frontend project in Railway
2. Click on "Variables" tab
3. Add new variable:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: Your backend URL (e.g., `https://carsma-backend.up.railway.app`)
4. Redeploy your frontend

### Steps for Vercel:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: Your backend URL
4. Redeploy

## Testing Locally

Your local `.env.local` file already has:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

This is correct for local development.

## How to Find Your Backend URL

### Railway:
1. Go to your backend project
2. Click on "Settings"
3. Look for "Domains" section
4. Copy the generated domain (e.g., `carsma-backend.up.railway.app`)
5. Add `https://` prefix

### Vercel/Other:
- Check your deployment dashboard
- Look for the backend service URL
- It should be something like `https://your-app.vercel.app` or similar

## Verify It's Working

After setting the environment variable and redeploying:

1. Open browser console (F12)
2. Go to your deployed website
3. Try to login
4. Check the Network tab
5. You should see requests going to your backend URL (not localhost)

## Admin Credentials

After seeding the database:
- **Email**: admin@example.com
- **Password**: admin123

⚠️ **Important**: Change these credentials in production!

## Troubleshooting

### Still seeing localhost in requests?
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check that environment variable is set correctly
- Verify you redeployed after adding the variable

### CORS errors?
- Make sure your backend has CORS configured
- Check that `FRONTEND_URL` in backend `.env` matches your frontend URL

### 401 Unauthorized?
- Verify admin user was seeded (run `npm run verify-seed` in backend)
- Check that email and password are correct
- Try resetting the database and reseeding

## Next Steps

1. Set `NEXT_PUBLIC_API_URL` in your deployment
2. Redeploy frontend
3. Test admin login
4. If it works, change the default admin password!
