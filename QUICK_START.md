# 🚀 Quick Start Guide - SENTINEL Security v2.0.0

## ⚡ Fast Track to Get Everything Online

### 1️⃣ Set Environment Variables (CRITICAL - DO THIS FIRST!)

Create a `.env` file in the project root:

```bash
cat > .env << 'EOF'
DISCORD_BOT_TOKEN=YOUR_ACTUAL_BOT_TOKEN_HERE
CIRKLE_CHANNEL_ID=1364978443292377211
AER_LINGUS_CHANNEL_ID=1395759805305716848
SENTINEL_MODE=enabled
EOF
```

**Important:** Replace `YOUR_ACTUAL_BOT_TOKEN_HERE` with your real Discord bot token!

### 2️⃣ Configure Cloudflare Worker Secrets

```bash
# Set Firebase credentials
wrangler secret put FIREBASE_API_KEY
# When prompted, enter your Firebase API key

wrangler secret put FIREBASE_DATABASE_URL
# When prompted, enter your Firebase database URL

wrangler secret put FIREBASE_PROJECT_ID
# When prompted, enter your Firebase project ID
# When prompted, enter: cirkle-careers

# Set Discord bot token (same as in .env)
wrangler secret put DISCORD_BOT_TOKEN
# When prompted, enter: YOUR_ACTUAL_BOT_TOKEN_HERE
```

### 3️⃣ Deploy Cloudflare Worker

```bash
npx wrangler deploy cloudflare-worker.js --name cirkle-careers-api
```

### 4️⃣ Start Discord Bot

**Option A: Local/Development**
```bash
npm start
```

**Option B: Production with PM2**
```bash
pm2 start bot-sentinel.js --name cirkle-bot-sentinel
pm2 save
pm2 startup
```

**Option C: Railway**
1. Push code to GitHub (already done ✅)
2. Go to Railway dashboard
3. Create new project from GitHub repo
4. Add environment variables in Railway settings:
   - `DISCORD_BOT_TOKEN`
   - `CIRKLE_CHANNEL_ID=1364978443292377211`
   - `AER_LINGUS_CHANNEL_ID=1395759805305716848`
   - `SENTINEL_MODE=enabled`
5. Deploy!

### 5️⃣ Verify Everything Works

**Check Bot Status:**
```bash
# Bot should be online in Discord with rotating status
```

**Test Worker Health:**
```bash
curl https://cirkle-careers-api.marcusray.workers.dev/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "sentinel": "active",
  "version": "2.0.0",
  "timestamp": "2025-11-25T..."
}
```

**Check Website:**
- Go to https://careers.cirkledevelopment.co.uk
- You should see "Protected by SENTINEL Security™" badge in header and footer
- Try submitting a test application
- Notification should appear in Discord channel

---

## ✅ What's Been Fixed/Improved

### Security (SENTINEL):
- ✅ All credentials moved to environment variables
- ✅ Rate limiting (100 req/min per IP)
- ✅ Input validation and XSS protection
- ✅ Secure headers (HSTS, frame-deny, etc.)
- ✅ No secrets in public repository

### Discord Notifications:
- ✅ Replaced webhooks with bot channel posting
- ✅ Notifications go to:
  - **Cirkle Development & Cirkle Group Careers:** Channel `1364978443292377211`
  - **Aer Lingus:** Channel `1395759805305716848`
- ✅ Role pings preserved
- ✅ Rich embeds with all application details

### Bot:
- ✅ New `bot-sentinel.js` with Discord.js v14
- ✅ Rotating status messages with SENTINEL branding
- ✅ Graceful error handling
- ✅ Automatic reconnection
- ✅ Environment-based suspend flags

### Frontend:
- ✅ SENTINEL Security badge in header/footer
- ✅ Site restored from maintenance mode
- ✅ CV upload working
- ✅ Multi-choice questions working
- ✅ All images loading correctly

### Documentation:
- ✅ `SENTINEL_SECURITY.md` - Complete security docs
- ✅ `DEPLOYMENT.md` - Full deployment guide
- ✅ `QUICK_START.md` - This file (fast track)
- ✅ `.env.example` - Environment template

---

## 🆘 Quick Troubleshooting

**Bot won't start?**
```bash
# Check your .env file
cat .env
# Make sure DISCORD_BOT_TOKEN is set correctly
```

**Notifications not appearing?**
- Verify bot has permissions in Discord channels
- Check channel IDs are correct
- Review bot logs: `pm2 logs cirkle-bot-sentinel`

**Worker errors?**
- Ensure all Wrangler secrets are set
- Test health endpoint
- Check Cloudflare dashboard for errors

**Need to suspend everything quickly?**
```bash
# Set in .env:
echo "SUSPEND_BOTS=true" >> .env
pm2 restart cirkle-bot-sentinel
```

---

## 📞 Need Help?

- Email: info@cirkledevelopment.co.uk
- Careers: careers@cirkledevelopment.co.uk
- See full docs: `DEPLOYMENT.md`

---

**🛡️ Protected by SENTINEL Security™ v2.0.0**
