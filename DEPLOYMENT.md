# 🚀 Deploy to Render - Step by Step Guide

## Prerequisites
- A GitHub account
- Your code pushed to a GitHub repository

## Step 1: Prepare Your Repository

1. Make sure all files are committed:
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

## Step 2: Create Render Account

1. Go to [https://render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Sign up with your GitHub account
4. Authorize Render to access your repositories

## Step 3: Deploy Your App

### Option A: One-Click Deploy (Recommended)

1. Go to your Render dashboard
2. Click **"New +"** → **"Blueprint"**
3. Select your GitHub repository
4. Render will automatically detect the `render.yaml` file
5. Click **"Apply"**

### Option B: Manual Setup

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `kahoot-bot-flooder`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (or upgrade if needed)

## Step 4: Set Environment Variables

1. In your service dashboard, go to **"Environment"**
2. Add environment variables:
   - `PASSWORD` = `2010` (or your custom password)
   - `NODE_ENV` = `production`

## Step 5: Deploy!

1. Click **"Create Web Service"** or **"Deploy"**
2. Wait for the build to complete (2-5 minutes)
3. Your app will be live at: `https://kahoot-bot-flooder.onrender.com`

## Step 6: Access Your App

1. Visit your Render URL
2. Enter password: `2010` (or your custom password)
3. Start flooding! 🤖

## Important Notes

### Free Tier Limitations
- ⚠️ **Spins down after 15 minutes of inactivity**
- First request after sleep takes ~30 seconds to wake up
- 750 free hours per month
- Shared resources

### Upgrade Options
To keep your service always running:
- Upgrade to **Starter** ($7/month) or higher
- Service stays running 24/7
- Better performance

### Custom Domain (Optional)
1. Go to **"Settings"** → **"Custom Domain"**
2. Add your domain
3. Update DNS records as instructed

## Troubleshooting

### Build Failed?
- Check that all dependencies are in `package.json`
- Ensure Node version is 18 or higher
- Check build logs in Render dashboard

### Can't Connect?
- Wait 30 seconds if service was sleeping
- Check service logs for errors
- Verify environment variables are set

### Socket.io Not Working?
- Render automatically handles WebSocket connections
- No additional configuration needed

## Monitoring

- **Dashboard**: View logs, metrics, and events
- **Logs**: Real-time streaming of server logs
- **Metrics**: CPU, memory, and bandwidth usage

## Cost Estimate

- **Free**: $0/month (with limitations)
- **Starter**: $7/month (always running)
- **Standard**: $25/month (better performance)

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- [Render Status](https://status.render.com)

---

**Created by Kiril Tichomirov** 🔴


