# 🛡️ SENTINEL Security v2.0 Deployment Guide

## 🚀 Quick Start (Bringing Systems Back Online)

### Step 1: Install Dependencies

```bash
npm install
```

This installs Discord.js v14 and WebSocket support.

### Step 2: Configure Environment Variables

#### For the Discord Bot:
Create a `.env` file in the root directory:

```bash
DISCORD_BOT_TOKEN=your_actual_bot_token_here
CIRKLE_CHANNEL_ID=1473377571482894478
AER_LINGUS_CHANNEL_ID=1395759805305716848
SENTINEL_MODE=enabled
```

#### For Cloudflare Worker:
Set secrets via Wrangler CLI:

```bash
# Navigate to your project directory
cd /path/to/cirkle-careers-portal

# Set Firebase credentials
npx wrangler secret put FIREBASE_API_KEY
# Paste your Firebase API key when prompted

wrangler secret put FIREBASE_DATABASE_URL
# Paste your Firebase database URL when prompted

npx wrangler secret put FIREBASE_PROJECT_ID
# Paste: cirkle-careers

# Set Discord bot token
npx wrangler secret put DISCORD_BOT_TOKEN
# Paste your Discord bot token
```

### Step 3: Deploy Cloudflare Worker

```bash
npx wrangler deploy cloudflare-worker.js --name cirkle-careers-api
```

### Step 4: Start the Discord Bot

#### Local Development:
```bash
npm start
```

#### Production (with PM2):
```bash
pm2 start bot-sentinel.js --name cirkle-bot-sentinel
pm2 save
```

#### Railway Deployment:
1. Push code to GitHub
2. Connect repository to Railway
3. Add environment variables in Railway dashboard
4. Deploy automatically

### Step 5: Verify Everything is Working

1. **Check Bot Status:**
   - Bot should appear online in Discord
   - Status should rotate showing "Protected by SENTINEL"

2. **Test Application Submission:**
   - Go to https://careers.cirkledevelopment.co.uk
   - Apply to a test position
   - Check that notification appears in correct Discord channel

3. **Verify Security Badge:**
   - Website header should show "Protected by SENTINEL Security™" with green shield icon
   - Footer should show version number

4. **Test Worker Health:**
   ```bash
   curl https://cirkle-careers-api.marcusray.workers.dev/api/health
   ```
   Should return: `{"status":"healthy","sentinel":"active","version":"2.0.0"}`

---

## 🛡️ Security Features Implemented

### 1. Credential Protection
- ✅ All credentials moved to environment variables
- ✅ No hardcoded secrets in source files
- ✅ Firebase config hidden from client
- ✅ Discord tokens never exposed to frontend

### 2. Rate Limiting
- ✅ 100 requests per minute per IP
- ✅ Automatic 429 response when limit exceeded
- ✅ 60-second retry window

### 3. Input Validation
- ✅ Discord ID format validation
- ✅ XSS prevention via script tag removal
- ✅ Input sanitization on all endpoints
- ✅ Maximum input length enforcement

### 4. Secure Headers
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ X-XSS-Protection enabled
- ✅ Strict-Transport-Security (HSTS)
- ✅ Custom X-Powered-By: SENTINEL Security

### 5. Bot-Based Notifications
- ✅ Replaced webhooks with Discord bot channel posting
- ✅ Channels: Cirkle (1473377571482894478), Aer Lingus (1395759805305716848)
- ✅ Role pings preserved
- ✅ Embedded rich notifications

### 6. Error Handling
- ✅ Graceful error responses
- ✅ Detailed logging for debugging
- ✅ SENTINEL tag on all responses
- ✅ Failed attempt logging

---

## 🔧 Configuration Files

### Modified Files:
- `cloudflare-worker.js` - Secure backend with SENTINEL Security
- `bot-sentinel.js` - New Discord bot with channel posting
- `script.js` - Updated to use secure channel posting
- `index.html` - Added SENTINEL Security badge
- `package.json` - Added Discord.js dependency
- `SENTINEL_SECURITY.md` - Complete security documentation

### New Files:
- `.env.example` - Environment variable template
- `DEPLOYMENT.md` - This file
- `cloudflare-worker-secure.js` - Backup of secure worker

---

## 📝 Post-Deployment Checklist

- [ ] Verify bot is online in Discord
- [ ] Test application submission flow
- [ ] Confirm notifications arrive in correct channels
- [ ] Check SENTINEL badge displays on website
- [ ] Verify worker health endpoint responds
- [ ] Test rate limiting (send 100+ requests)
- [ ] Confirm CV file uploads work
- [ ] Test employer login functionality
- [ ] Verify candidate status lookup works
- [ ] Check that images and icons display correctly
- [ ] Review browser console for errors
- [ ] Test on mobile devices

---

## 🔄 Rotating Credentials (Security Best Practice)

### Discord Bot Token:
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Navigate to "Bot" section
4. Click "Reset Token"
5. Update environment variables everywhere:
   - `.env` file (local)
   - Railway/hosting environment variables
   - Cloudflare Worker secrets: `npx wrangler secret put DISCORD_BOT_TOKEN`

### Firebase Credentials:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Project Settings → Service Accounts
3. Generate new private key
4. Update Cloudflare Worker secrets

---

## 🚨 Emergency Procedures

### If Security Breach Detected:

1. **Immediate Actions:**
   ```bash
   # Set environment variable to suspend bot
   export SUSPEND_BOTS=true
   
   # Or edit cloudflare-worker.js and redeploy
   # Set MAINTENANCE_MODE = true at line 36
   ```

2. **Rotate All Credentials:**
   - Reset Discord bot token
   - Regenerate Firebase API keys
   - Update all environment variables

3. **Deploy Maintenance Mode:**
   ```bash
   # Edit cloudflare-worker.js, set MAINTENANCE_MODE=true
   npx wrangler deploy cloudflare-worker.js --name cirkle-careers-api
   ```

4. **Review Logs:**
   - Check Cloudflare Worker logs for suspicious activity
   - Review Discord bot logs
   - Check Railway logs if hosted there

5. **Contact Team:**
   - Notify all employers via Discord DM
   - Post announcement in company channels

---

## 📊 Monitoring

### Cloudflare Worker Metrics:
- Dashboard: https://dash.cloudflare.com/
- View request rates, errors, and response times
- Set up alerts for high error rates

### Bot Monitoring:
```bash
# Check PM2 status
pm2 status

# View bot logs
pm2 logs cirkle-bot-sentinel

# Restart if needed
pm2 restart cirkle-bot-sentinel
```

### Health Check Endpoint:
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

---

## 🆘 Troubleshooting

### Bot Won't Start:
- Check `DISCORD_BOT_TOKEN` is set correctly
- Verify token hasn't been reset/revoked
- Check bot has necessary permissions in Discord server
- Review error logs: `pm2 logs cirkle-bot-sentinel`

### Notifications Not Appearing:
- Verify channel IDs are correct
- Check bot has permission to post in channels
- Review worker logs for API errors
- Test health endpoint

### Images Not Loading:
- Check Discord CDN URLs haven't expired
- Verify `COMPANY_LOGOS` object in `script.js`
- Check browser console for CORS errors

### Worker Errors:
- Verify all secrets are set in Cloudflare
- Check Firebase database rules allow access
- Review rate limiting settings
- Test with `curl` commands

---

## 📞 Support

For issues or questions:
- Email: info@cirkledevelopment.co.uk
- Careers: careers@cirkledevelopment.co.uk
- Emergency: Contact Marcus Ray or team lead via Discord

---

**🛡️ Protected by SENTINEL Security™ v2.0.0**  
*Developed by Cirkle Development Group*
