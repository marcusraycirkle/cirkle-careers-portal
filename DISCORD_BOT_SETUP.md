# Discord Bot Setup for Candidate DM Notifications

## Overview
This feature allows automatic Discord DMs to candidates when their application status changes (Hired/Rejected).

---

## Step 1: Create a Discord Bot

1. Go to https://discord.com/developers/applications
2. Click **"New Application"**
3. Name it: `Cirkle Careers Bot`
4. Click **"Create"**

---

## Step 2: Configure Bot Settings

1. Click **"Bot"** in the left sidebar
2. Click **"Add Bot"** → Confirm
3. Under **"Privileged Gateway Intents"**, enable:
   - ✅ **Message Content Intent**
4. Click **"Reset Token"** and copy the bot token
5. **Save this token securely!**

---

## Step 3: Update Cloudflare Worker

1. Open `cloudflare-worker.js`
2. Find this line:
   ```javascript
   const DISCORD_BOT_TOKEN = 'YOUR_DISCORD_BOT_TOKEN_HERE';
   ```
3. Replace with your actual bot token:
   ```javascript
   const DISCORD_BOT_TOKEN = 'YOUR_ACTUAL_BOT_TOKEN';
   ```

---

## Step 4: Invite Bot to Server (Optional)

If you want the bot in your Discord server:

1. Go to **"OAuth2"** → **"URL Generator"**
2. Select scopes:
   - ✅ **bot**
3. Select permissions:
   - ✅ **Send Messages**
4. Copy the generated URL and open it in browser
5. Select your server and authorize

**Note:** The bot doesn't need to be in a server to send DMs!

---

## Step 5: Deploy Updated Worker

```bash
cd /workspaces/cirkle-careers-portal
wrangler deploy
```

---

## How It Works

### When You Hire a Candidate:
1. Click "✓ Hire" on an application
2. Candidate receives a Discord DM:
   ```
   🎉 Congratulations! 🎉

   Your application for [Job Title] has been ACCEPTED!

   Handler: [Your Name]
   Company: [Company Name]

   We will contact you shortly with next steps. Welcome to the team!

   Application PIN: [PIN]
   ```

### When You Reject a Candidate:
1. Click "✗ Reject" and provide a reason
2. Candidate receives a Discord DM:
   ```
   📋 Application Update 📋

   Thank you for your interest in [Job Title].

   Unfortunately, we have decided not to move forward with your application at this time.

   Reason: [Your Reason]
   Handler: [Your Name]

   We encourage you to apply for future positions. Thank you for your time and interest!

   Application PIN: [PIN]
   ```

---

## Requirements

- Candidate must have provided their Discord ID when applying
- Bot token must be configured in Cloudflare Worker
- Bot doesn't need to share a server with the candidate

---

## Testing

1. Apply to a test job with your Discord ID
2. Log in as employer
3. Hire or reject the test application
4. Check your Discord DMs!

---

## Troubleshooting

**"Discord bot not configured" error:**
- Make sure you replaced `YOUR_DISCORD_BOT_TOKEN_HERE` with your actual token
- Redeploy the Cloudflare Worker with `wrangler deploy`

**Not receiving DMs:**
- Check if candidate provided their Discord ID in the application
- Verify the Discord ID is correct (right-click user → Copy ID in Discord)
- Make sure candidate has DMs enabled from server members

**Bot token invalid:**
- Regenerate the token in Discord Developer Portal
- Update the token in `cloudflare-worker.js`
- Redeploy the worker

---

## Security Notes

✅ Bot token is stored in Cloudflare Worker (server-side)  
✅ Never visible in browser or frontend code  
✅ Only accessible through secure backend API  
✅ Token never sent to client  

---

**Your candidates will now be automatically notified of their application status!** 🎉
