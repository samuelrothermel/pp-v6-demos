# Railway Deployment Guide

This guide will help you deploy your PayPal Callbacks demo app to Railway.

## Prerequisites

- A GitHub account
- A Railway account (sign up at https://railway.app)
- PayPal Sandbox credentials

## Step 1: Prepare Your Repository

1. Make sure your code is committed to a Git repository
2. Push your repository to GitHub

```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

## Step 2: Deploy to Railway

### Option A: Deploy via Railway Dashboard

1. Go to [Railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub account
5. Select your repository: `pp-v6-demos`
6. Railway will automatically detect your Node.js app and start deploying

### Option B: Deploy via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

## Step 3: Configure Environment Variables

In the Railway dashboard, go to your project > **Variables** tab and add:

```
PAYPAL_SANDBOX_CLIENT_ID=your_actual_client_id
PAYPAL_SANDBOX_CLIENT_SECRET=your_actual_client_secret
PUBLIC_BASE_URL=https://your-app-name.up.railway.app
PORT=8080
```

**Important:** After deployment, Railway will provide you with a public URL like:
`https://pp-web-v6-callbacks-production.up.railway.app`

Copy this URL and set it as your `PUBLIC_BASE_URL` environment variable.

## Step 4: Get Your Railway Public URL

1. In Railway dashboard, go to your project
2. Click on **Settings** > **Domains**
3. Railway will show your generated domain (e.g., `your-app.up.railway.app`)
4. Copy this URL
5. Go back to **Variables** tab
6. Update `PUBLIC_BASE_URL` with your Railway URL (include `https://`)

## Step 5: Update Your Local .env (Optional)

For testing against your production Railway deployment:

```env
RAILWAY_PUBLIC_URL=https://your-app-name.up.railway.app
PUBLIC_BASE_URL=https://your-app-name.up.railway.app
```

## Step 6: Test Your Deployment

1. Visit your Railway URL: `https://your-app-name.up.railway.app/paypal-payments`
2. Click on **"Server-Side Callbacks Demo"**
3. Create a PayPal order
4. PayPal will now send callbacks to: `https://your-app-name.up.railway.app/paypal-callbacks/shipping`

## Callback Endpoint

Your public callback endpoint will be:

```
https://your-app-name.up.railway.app/paypal-callbacks/shipping
```

This URL is automatically used when creating PayPal orders, so no manual configuration needed!

## Viewing Logs

To view your Railway logs:

### Via Dashboard:

1. Go to your project in Railway
2. Click on **"Deployments"**
3. Select your latest deployment
4. View the logs to see callback activity

### Via CLI:

```bash
railway logs
```

## Troubleshooting

### App not starting?

- Check that `PORT` environment variable is set to `8080`
- Verify your PayPal credentials are correct
- Check Railway logs for errors

### Callbacks not working?

- Ensure `PUBLIC_BASE_URL` is set to your Railway URL
- Verify the URL includes `https://` (not `http://`)
- Check Railway logs for incoming callback requests

### Need to redeploy?

```bash
git add .
git commit -m "Update"
git push origin main
```

Railway will automatically redeploy on push.

## Environment Variables Reference

| Variable                       | Required         | Description                                   | Example                           |
| ------------------------------ | ---------------- | --------------------------------------------- | --------------------------------- |
| `PAYPAL_SANDBOX_CLIENT_ID`     | Yes              | Your PayPal Sandbox Client ID                 | `AYP7XDoBBuuwe...`                |
| `PAYPAL_SANDBOX_CLIENT_SECRET` | Yes              | Your PayPal Sandbox Client Secret             | `EGLsDSi7rb7O...`                 |
| `PUBLIC_BASE_URL`              | Yes (Production) | Your Railway public URL                       | `https://your-app.up.railway.app` |
| `PORT`                         | No               | Server port (Railway auto-assigns if not set) | `8080`                            |
| `RAILWAY_PUBLIC_URL`           | No               | Auto-detected Railway URL                     | Auto-set by Railway               |

## Success! 🎉

Your PayPal server-side callbacks demo is now live and accessible publicly. PayPal can now send real-time callbacks to your Railway-hosted endpoint!
