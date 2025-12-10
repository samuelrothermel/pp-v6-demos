# Railway Deployment Summary

## ✅ What's Been Configured

Your app is now ready for Railway deployment with the following changes:

### 1. Environment Variables (.env)

- **RAILWAY_PUBLIC_URL**: Set this to your Railway-generated URL after deployment
- **PUBLIC_BASE_URL**: Set this to the same Railway URL for production
- Both can be left empty for local development

### 2. Dynamic Callback URLs

The app now automatically uses:

- **Production (Railway)**: `https://your-railway-url.up.railway.app/paypal-callbacks/shipping`
- **Local Development**: `http://localhost:8080/paypal-callbacks/shipping`

### 3. Files Created

- `railway.json` - Railway configuration
- `.env.example` - Template for environment variables
- `RAILWAY_DEPLOYMENT.md` - Complete deployment guide

### 4. Updated Code

- `src/paypalServerSdk.js` - Now uses dynamic base URL for callbacks
- `app.js` - Enhanced startup logging with Railway deployment info

## 🚀 Quick Deployment Steps

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Configure for Railway deployment"
   git push origin main
   ```

2. **Deploy on Railway**

   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway auto-detects and deploys

3. **Set Environment Variables in Railway Dashboard**

   ```
   PAYPAL_SANDBOX_CLIENT_ID=your_client_id
   PAYPAL_SANDBOX_CLIENT_SECRET=your_client_secret
   PUBLIC_BASE_URL=https://your-app.up.railway.app
   ```

4. **Get Your Railway URL**

   - Railway dashboard → Settings → Domains
   - Copy the generated URL (e.g., `your-app-production.up.railway.app`)
   - Update `PUBLIC_BASE_URL` with this URL

5. **Test**
   - Visit `https://your-app.up.railway.app/paypal-payments`
   - Create an order and PayPal will callback to your Railway endpoint!

## 📍 Important URLs

After deployment, your endpoints will be:

- **Main App**: `https://your-app.up.railway.app/paypal-payments`
- **Callback Endpoint**: `https://your-app.up.railway.app/paypal-callbacks/shipping`
- **Server Callbacks Demo**: `https://your-app.up.railway.app/paypal-payments/one-time/server-callbacks`

## 🔄 Local Development

Your app still works locally:

- Callback URL: `http://localhost:8080/paypal-callbacks/shipping`
- Demo page: `http://localhost:8080/paypal-payments/one-time/server-callbacks`

Note: PayPal callbacks won't reach your local server (they need a public URL).

## ✨ What Happens Automatically

1. Railway detects your Node.js app
2. Installs dependencies (`npm install`)
3. Starts your server (`npm start`)
4. Assigns a public URL
5. Your app uses that URL for PayPal callbacks
6. PayPal can now send real-time callbacks to your public endpoint!

## 🎯 Next Steps

1. Deploy to Railway following the steps above
2. Set your environment variables
3. Test creating a PayPal order
4. Watch the Railway logs to see callbacks coming in
5. Your callback handler will:
   - Validate the shipping address
   - Calculate state-specific taxes (NY: 8%, CA: 7.25%)
   - Return shipping options
   - Update order totals

That's it! Your app is ready for Railway deployment. 🚀
