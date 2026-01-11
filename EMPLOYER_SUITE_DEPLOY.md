# Employer Suite - Quick Deployment Guide

This guide will help you deploy the Employer Suite with Discord authentication.

## Prerequisites

✅ Wrangler authenticated (DONE)
✅ Discord Bot Token already set in Wrangler secrets (DONE)
✅ Firebase configuration already set (DONE)

---

## Step 1: Get Discord OAuth Credentials

1. Go to https://discord.com/developers/applications
2. Select your application (the one with the bot)
3. Click **"OAuth2"** in the left sidebar
4. Under **"Client information"**:
   - Copy the **Client ID**
   - Click **"Reset Secret"** and copy the **Client Secret** (save this!)

5. Add Redirect URL:
   - Click **"Add Redirect"**
   - Add: `https://allcareers.cirkledevelopment.co.uk/employersuit/callback`
   - Click **"Save Changes"**

---

## Step 2: Set Wrangler Secrets

Run these commands (replace with your actual values):

```bash
# Discord OAuth Client ID
echo "YOUR_CLIENT_ID" | wrangler secret put DISCORD_CLIENT_ID

# Discord OAuth Client Secret
echo "YOUR_CLIENT_SECRET" | wrangler secret put DISCORD_CLIENT_SECRET
```

**For storage server (can skip for now, add later):**
```bash
# Storage server URL (e.g., http://YOUR_LUBUNTU_IP:3100)
echo "http://localhost:3100" | wrangler secret put STORAGE_SERVER_URL

# Storage API key (use the one from storage-server.env)
echo "7d8888e85e799b9efa7cfa5763959694c68fd4b88bfd93bffd87a5e52b4deb2d" | wrangler secret put STORAGE_API_KEY
```

---

## Step 3: Verify Secrets

```bash
wrangler secret list
```

You should see:
- ✅ DISCORD_BOT_TOKEN
- ✅ FIREBASE_API_KEY
- ✅ FIREBASE_DATABASE_URL
- ✅ FIREBASE_PROJECT_ID
- ✅ DISCORD_CLIENT_ID (new)
- ✅ DISCORD_CLIENT_SECRET (new)
- ⚠️ STORAGE_SERVER_URL (optional)
- ⚠️ STORAGE_API_KEY (optional)

---

## Step 4: Deploy Cloudflare Worker

```bash
wrangler deploy
```

This will deploy your worker to:
- `https://cirkle-careers-api.marcusray.workers.dev`

---

## Step 5: Test the Deployment

### Test 1: Health Check
```bash
curl https://cirkle-careers-api.marcusray.workers.dev/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "sentinel": "active",
  "employerSuite": "enabled"
}
```

### Test 2: Employer Suite Files Endpoint
```bash
curl -X POST https://cirkle-careers-api.marcusray.workers.dev/api/employersuit/files/list \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-123"}'
```

---

## Step 6: Upload Employer Suite Files to Server

The Employer Suite frontend files need to be accessible at:
`https://allcareers.cirkledevelopment.co.uk/employersuit/dash`

**Option A: Add to existing static hosting**

Copy these files to your web server:
- `employersuit.html` → `/employersuit/dash/index.html`
- `employersuit-styles.css` → `/employersuit/dash/employersuit-styles.css`
- `employersuit-api.js` → `/employersuit/dash/employersuit-api.js`
- `employersuit-auth.js` → `/employersuit/dash/employersuit-auth.js`
- `employersuit-tabs.js` → `/employersuit/dash/employersuit-tabs.js`
- `employersuit-main.js` → `/employersuit/dash/employersuit-main.js`

**Option B: Use Cloudflare Pages (recommended)**

```bash
# Install Wrangler Pages CLI
npm install -g wrangler

# Create a directory for the pages
mkdir -p employersuit-pages/employersuit/dash

# Copy files
cp employersuit.html employersuit-pages/employersuit/dash/index.html
cp employersuit-*.css employersuit-pages/employersuit/dash/
cp employersuit-*.js employersuit-pages/employersuit/dash/

# Deploy to Cloudflare Pages
cd employersuit-pages
wrangler pages deploy . --project-name=cirkle-employer-suite
```

---

## Step 7: Update API Endpoint in Frontend

Edit `employersuit-api.js` line 3 to use the correct API URL:

```javascript
this.apiUrl = 'https://cirkle-careers-api.marcusray.workers.dev';
```

---

## Step 8: Test Authentication Flow

1. Open: `https://allcareers.cirkledevelopment.co.uk/employersuit/dash`
2. Click **"Login with Discord"**
3. Authorize the application
4. You should be redirected back to the dashboard

---

## Troubleshooting

### Issue: "Unauthorized" error

**Check:**
- Discord Client ID/Secret are set correctly in Wrangler secrets
- Redirect URI matches exactly in Discord Developer Portal
- User clicking "Authorize" in Discord OAuth flow

### Issue: "Storage server not configured"

**Solution:**
- This is expected if you haven't set up the storage server yet
- Files tab will show placeholder data
- Follow STORAGE_SERVER_SETUP.md to configure storage server on Lubuntu

### Issue: "CORS error"

**Check:**
- Cloudflare Worker is deployed
- API URL in frontend matches worker URL
- Worker has correct CORS headers (already configured)

### Issue: Discord OAuth redirect doesn't work

**Check:**
1. Discord Developer Portal > OAuth2 > Redirects includes:
   `https://allcareers.cirkledevelopment.co.uk/employersuit/callback`
2. Frontend is served over HTTPS
3. Callback URL matches exactly (no trailing slash)

---

## Current Status

### ✅ Ready to Deploy
- Cloudflare Worker with all endpoints
- Frontend files (HTML, CSS, JS)
- Discord OAuth integration
- Calendar, Notepad, Database functionality

### ⚠️ Needs Configuration
- Discord OAuth Client ID/Secret (Step 2)
- Frontend deployment (Step 6)
- Storage server on Lubuntu (optional, can do tomorrow)

### ❌ Not Yet Implemented
- Document templates (waiting for template files)
- Storage server physical setup on Lubuntu

---

## Next Steps After Deployment

1. **Test all tabs:**
   - Home dashboard ✓
   - Docs (will show "awaiting templates")
   - My Files (will work once storage server is set up)
   - Notepad ✓
   - Calendar ✓
   - Database ✓

2. **Add document templates:**
   - Provide template files (payslips, contracts, etc.)
   - Update template generation logic

3. **Set up storage server:**
   - Follow STORAGE_SERVER_SETUP.md
   - Configure Lubuntu machine
   - Update STORAGE_SERVER_URL secret

4. **Monitor and optimize:**
   - Check Cloudflare Worker logs
   - Monitor API usage
   - Add analytics if needed

---

## Commands Reference

```bash
# Deploy worker
wrangler deploy

# View logs
wrangler tail

# List secrets
wrangler secret list

# Add secret
echo "value" | wrangler secret put SECRET_NAME

# Delete secret
wrangler secret delete SECRET_NAME

# Check worker status
curl https://cirkle-careers-api.marcusray.workers.dev/health
```

---

## Support

If you encounter any issues:
1. Check Cloudflare Worker logs: `wrangler tail`
2. Check browser console for frontend errors
3. Verify all secrets are set: `wrangler secret list`
4. Test API endpoints with curl commands above
