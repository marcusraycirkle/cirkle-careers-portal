# Cloudflare Worker Backend Setup Guide

## 🔒 Secure Backend with Cloudflare Workers

This setup hides your Firebase credentials in a Cloudflare Worker (serverless backend), so they're never visible in the browser!

---

## Step 1: Create Cloudflare Account

1. Go to https://dash.cloudflare.com/sign-up
2. Sign up for a **FREE** account
3. Verify your email

---

## Step 2: Install Wrangler CLI (Optional - or use dashboard)

If you want to deploy from command line:
```bash
npm install -g wrangler
wrangler login
```

**OR** just use the Cloudflare Dashboard (easier!)

---

## Step 3: Deploy Worker via Dashboard (Easiest Method)

### 3.1: Create Worker
1. Go to https://dash.cloudflare.com/
2. Click **"Workers & Pages"** in left sidebar
3. Click **"Create Application"**
4. Click **"Create Worker"**
5. Give it a name: `cirkle-careers-api`
6. Click **"Deploy"**

### 3.2: Edit Worker Code
1. After deployment, click **"Edit Code"**
2. **Delete all the default code**
3. Copy **ALL** the code from `cloudflare-worker.js` in your project
4. Paste it into the Cloudflare editor
5. Click **"Save and Deploy"**

### 3.3: Get Your Worker URL
1. After deploying, you'll see your worker URL:
   - Format: `https://cirkle-careers-api.YOUR-SUBDOMAIN.workers.dev`
2. **Copy this URL!**

---

## Step 4: Update Frontend

1. Open `backend-api.js` in your project
2. Find this line:
   ```javascript
   const BACKEND_URL = 'https://YOUR-WORKER-NAME.YOUR-SUBDOMAIN.workers.dev';
   ```
3. Replace it with your actual Worker URL:
   ```javascript
   const BACKEND_URL = 'https://cirkle-careers-api.YOUR-SUBDOMAIN.workers.dev';
   ```
4. Save the file

---

## Step 5: Deploy Your Website

```bash
git add -A
git commit -m "Switch to Cloudflare Worker backend for security"
git push origin main
```

Upload all files to your web host (allcareers.cirkledevelopment.co.uk)

---

## Step 6: Remove Firebase Config from GitHub

Now that your Firebase credentials are in the Cloudflare Worker, remove them from GitHub:

```bash
# Remove firebase files from repo
git rm firebase-config.js firebase-helpers.js
git commit -m "Remove Firebase credentials from frontend"
git push origin main
```

---

## What's Now Secure:

✅ **Firebase credentials** - Hidden in Cloudflare Worker (not in browser)  
✅ **API calls** - Go through your worker, not directly to Firebase  
✅ **No inspect element exposure** - Credentials never leave the backend  
✅ **100% Free** - Cloudflare Workers free tier: 100,000 requests/day  

---

## Testing:

1. Visit your website
2. Open browser DevTools → Network tab
3. Create a job listing
4. You'll see requests to `YOUR-WORKER.workers.dev/api/jobs` (NOT Firebase!)
5. Inspect element → No Firebase config visible! 🔒

---

## Cloudflare Worker Free Tier:

✅ **100,000 requests per day** (more than enough!)  
✅ **No credit card required**  
✅ **Unlimited workers** (up to 100)  
✅ **Fast global edge network**  

---

## Architecture:

```
Frontend (Browser)
    ↓
Cloudflare Worker (Backend API)
    ↓
Firebase Realtime Database
```

**Your users never see Firebase credentials!** 🎉

---

## Troubleshooting:

**"CORS error"?**
- The worker already has CORS headers configured
- Make sure you deployed the full worker code

**"Failed to fetch"?**
- Check you updated `BACKEND_URL` in `backend-api.js`
- Make sure worker URL is correct (no typos)
- Check Cloudflare Worker logs in dashboard

**Data not loading?**
- Check browser console for errors
- Verify Firebase credentials in the worker are correct
- Check Cloudflare Worker logs

---

**You're now 100% secure!** No credentials visible in browser! 🔒✨
