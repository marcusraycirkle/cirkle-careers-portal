ss# Discord OAuth Setup - Quick Guide

## YES - You Need Discord Client ID & Secret! 🔑

**Why?** The Employer Suite uses Discord OAuth for secure authentication. Without these credentials, users cannot log in.

---

## Getting Your Discord OAuth Credentials (5 minutes)

### Step 1: Go to Discord Developer Portal
1. Visit: https://discord.com/developers/applications
2. Log in with your Discord account
3. Select your existing application (the one with your bot)

### Step 2: Get Client ID
1. Click on **"OAuth2"** in the left sidebar
2. You'll see **"CLIENT ID"** at the top
3. Click **"Copy"** next to it
4. Save it somewhere safe

### Step 3: Get Client Secret
1. Still on the OAuth2 page
2. Under **"CLIENT SECRET"**, click **"Reset Secret"**
3. Confirm the reset
4. Click **"Copy"** immediately (you can't see it again!)
5. Save it somewhere VERY safe (treat it like a password)

### Step 4: Add Redirect URL
1. Scroll down to **"Redirects"**
2. Click **"Add Redirect"**
3. Enter exactly: `https://allcareers.cirkledevelopment.co.uk/employersuit.html`
4. Click **"Add"**
5. Click **"Save Changes"** at the bottom

---

## Adding Credentials to Wrangler

Run these commands (replace with your actual values):

```bash
# Add Discord Client ID
echo "YOUR_CLIENT_ID_HERE" | wrangler secret put DISCORD_CLIENT_ID

# Add Discord Client Secret
echo "YOUR_CLIENT_SECRET_HERE" | wrangler secret put DISCORD_CLIENT_SECRET
```

**Example:**
```bash
echo "1433880685551665212" | wrangler secret put DISCORD_CLIENT_ID
echo "abcd1234_xxxxxxxxxxxxxxx" | wrangler secret put DISCORD_CLIENT_SECRET
```

---

## What's New - One-Time Login & Multi-Stage Loading ✨

### Persistent Sessions (24 Hours)
- Users log in once and stay logged in for 24 hours
- Sessions persist across browser tabs
- Sessions persist across devices (same browser profile)
- Automatic re-authentication if session expires

### Multi-Stage Loading Screen
When users return to the dashboard, they see:

```
Welcome back, [Username]!
Please wait whilst we load everything for you

☁️ Connecting to Cloudflare     ✅ Complete
🔧 Loading Backend               ✅ Complete
🔐 Verifying Authentication      ✅ Complete
👤 Loading User Data             ✅ Complete
💾 Preparing Storage             ✅ Complete
📊 Building Dashboard            ✅ Complete

[Progress Bar: 100%]
All systems ready!

🎉 Everything loaded successfully!
```

### Features:
- **Beautiful gradient background** with animated colors
- **Stage-by-stage loading** with icons and status
- **Real-time progress bar** showing completion percentage
- **Smooth animations** for each stage
- **Success celebration** when complete
- **Error handling** if something fails

### How It Works:
1. User visits dashboard URL
2. System checks for existing session (instant)
3. If authenticated → Show animated loading sequence
4. Load dashboard in background
5. Celebrate success with green gradient
6. Smooth transition to dashboard

### No More Repeated Logins!
- First visit: Log in with Discord
- Next 24 hours: Instant access with cool loading animation
- After 24 hours: Simple re-authentication

---

## Testing After Deployment

### 1. First Login Test
```
1. Go to: https://allcareers.cirkledevelopment.co.uk/employersuit/dash
2. Should see purple gradient auth screen
3. Click "Continue with Discord"
4. Authorize on Discord
5. See multi-stage loading animation
6. Land on dashboard
```

### 2. Persistence Test
```
1. After logging in, close the tab
2. Open new tab, go back to dashboard URL
3. Should see loading animation (NO login prompt)
4. Should land directly on dashboard
```

### 3. Multi-Device Test
```
1. Log in on Computer A
2. Open same URL on Computer B (same browser profile)
3. Should automatically sync (if using browser sync)
4. Different browsers require separate logins
```

### 4. Expiry Test
```
1. Log in
2. Wait 24+ hours (or manually clear localStorage)
3. Return to dashboard
4. Should see auth screen again
5. Log in, starts new 24-hour session
```

---

## Security Features

✅ **24-hour session expiry** - Auto-logout after 24 hours
✅ **Secure token storage** - Encrypted localStorage
✅ **Device tracking** - Each device gets unique ID
✅ **Server-side validation** - Tokens verified by backend
✅ **HTTPS only** - All communication encrypted
✅ **CORS protection** - Only your domain allowed

---

## Troubleshooting

### "Unauthorized" or Login Doesn't Work

**Check:**
1. Discord Client ID is correct in Wrangler secrets
2. Discord Client Secret is correct in Wrangler secrets
3. Redirect URL in Discord matches exactly:
   `https://allcareers.cirkledevelopment.co.uk/employersuit.html`
4. Cloudflare Worker is deployed
5. No typos in the URL

**Fix:**
```bash
# Re-add secrets
wrangler secret delete DISCORD_CLIENT_ID
wrangler secret delete DISCORD_CLIENT_SECRET
echo "CORRECT_CLIENT_ID" | wrangler secret put DISCORD_CLIENT_ID
echo "CORRECT_CLIENT_SECRET" | wrangler secret put DISCORD_CLIENT_SECRET
wrangler deploy
```

### Loading Screen Stuck

**Check:**
1. Open browser console (F12)
2. Look for JavaScript errors
3. Check network tab for failed API calls

**Fix:**
- Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- Clear cache and reload
- Check Cloudflare Worker logs: `wrangler tail`

### Session Not Persisting

**Check:**
1. Browser allows localStorage
2. Not in private/incognito mode
3. Browser isn't clearing storage on exit

**Fix:**
- Use normal browser window
- Check browser privacy settings
- Allow cookies/storage for your domain

---

## Quick Deploy Checklist

Before deploying:
- [ ] Get Discord Client ID from Discord Developer Portal
- [ ] Get Discord Client Secret from Discord Developer Portal  
- [ ] Add redirect URL in Discord Developer Portal
- [ ] Add DISCORD_CLIENT_ID to Wrangler secrets
- [ ] Add DISCORD_CLIENT_SECRET to Wrangler secrets
- [ ] Deploy Cloudflare Worker: `wrangler deploy`
- [ ] Upload frontend files to web server
- [ ] Test login flow
- [ ] Test session persistence

---

## Summary

**TLDR:**
1. **YES, you need Discord OAuth credentials**
2. Get them from: https://discord.com/developers/applications  
3. Add redirect: `https://allcareers.cirkledevelopment.co.uk/employersuit.html`
4. Set Wrangler secrets with Client ID & Secret
5. Users get one-time login with 24-hour sessions
6. Cool loading animation shows loading stages
7. Sessions persist across tabs/devices

**Time to set up:** ~5-10 minutes  
**User experience:** Login once, enjoy for 24 hours with beautiful animations! 🚀
