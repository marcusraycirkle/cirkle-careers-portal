# Railway.com Deployment Guide

Deploy the allCareers Discord bot to Railway for 24/7 uptime.

## Prerequisites
- GitHub account (you already have this)
- Railway account (free tier works great)

## Step-by-Step Setup

### 1. Create Railway Account
1. Go to https://railway.app
2. Click "Login" and sign in with GitHub
3. Authorize Railway to access your GitHub

### 2. Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository: `cirkle-careers-portal`
4. Railway will detect it's a Node.js project

### 3. Configure Environment Variable
After the project is created:

1. Click on your project
2. Go to "Variables" tab
3. Click "New Variable"
4. Add:
   - **Name:** `DISCORD_BOT_TOKEN`
   - **Value:** Your Discord bot token from Developer Portal
5. Click "Add"

### 4. Configure Start Command
1. Go to "Settings" tab
2. Find "Deploy" section
3. Set **Start Command** to: `node bot-status.js`
4. Click "Save"

### 5. Deploy
1. Railway will automatically deploy after you save settings
2. Click "Deployments" tab to see progress
3. Wait for "Success" status (takes ~30 seconds)

### 6. Verify Bot is Online
1. Go to your Discord server
2. Check that `allcareersbycirkle` bot shows as **Online** (green dot)
3. Status should be rotating:
   - 🧐 Reading Applications
   - 🌐 allcareers.cirkledevelopment.co.uk
   - 🏠 Currently Serving 4 Companies

## Viewing Logs

To see bot status updates:
1. Go to Railway project
2. Click "Deployments" tab
3. Click on latest deployment
4. Click "View Logs"

You should see:
```
Starting allCareers bot...
✅ Connected to Discord Gateway
✅ Bot is now ONLINE!
Logged in as: allcareersbycirkle#5238
Status updated: 🌐 allcareers.cirkledevelopment.co.uk
```

## Managing the Bot

### Restart Bot
1. Go to Railway project
2. Click "Deployments"
3. Click "⋯" menu → "Restart"

### Stop Bot
1. Go to project Settings
2. Scroll to bottom
3. Click "Pause Project"

### View Metrics
Railway shows:
- CPU usage
- Memory usage
- Network traffic
- Uptime

## Cost

**Free Tier:**
- $5 free credit per month
- Bot uses ~0.01 CPU and ~50MB RAM
- Should cost less than $1/month
- **Plenty for this bot!**

## Troubleshooting

### Bot not appearing online
- Check Environment Variable is set correctly
- Check logs for connection errors
- Verify Discord token hasn't expired

### "Build failed"
- Make sure `package.json` exists in repo
- Check that `ws` is in dependencies
- View build logs for specific error

### "Deployment crashed"
- Check logs for error messages
- Verify `node bot-status.js` works locally
- Check bot token is valid

## Automatic Deploys

Railway automatically redeploys when you push to GitHub:
1. Make changes to bot code
2. Commit and push to GitHub
3. Railway detects changes
4. Automatically redeploys bot
5. Bot reconnects with new code

## Alternative: Use Railway CLI (Optional)

Install Railway CLI:
```bash
npm install -g @railway/cli
railway login
railway link
railway up
```

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check Railway status: https://status.railway.app

---

## Quick Summary

1. Sign up at https://railway.app with GitHub
2. Create new project from `cirkle-careers-portal` repo
3. Add environment variable: `DISCORD_BOT_TOKEN`
4. Set start command: `node bot-status.js`
5. Deploy and check Discord for online bot! ✅
