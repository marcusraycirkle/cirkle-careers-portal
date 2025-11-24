# Bot Status Setup

This guide explains how to keep the allCareers Discord bot online with rotating status messages.

## Status Messages
The bot rotates through these statuses every 15 seconds:
- 🧐 Reading Applications
- 🌐 allcareers.cirkledevelopment.co.uk
- 🏠 Currently Serving 4 Companies

## Option 1: WebSocket (Recommended - Bot Stays Online)

This keeps the bot persistently online with proper Discord Gateway connection.

### Requirements
```bash
npm install ws
```

### Setup
1. Open `bot-status.js`
2. Replace `YOUR_DISCORD_BOT_TOKEN_HERE` with your actual bot token (line 4)
3. Run the script:
```bash
node bot-status.js
```

### Keep Running
To keep it running permanently:

**Option A: Using PM2 (Recommended)**
```bash
npm install -g pm2
pm2 start bot-status.js --name "allCareers-bot"
pm2 save
pm2 startup
```

**Option B: Using nohup**
```bash
nohup node bot-status.js &
```

**Option C: Using screen**
```bash
screen -S allcareers-bot
node bot-status.js
# Press Ctrl+A then D to detach
```

## Option 2: Simple REST (Bot Shows Offline)

This is simpler but the bot will appear offline since it doesn't maintain a WebSocket connection.

### Setup
1. Open `bot-status-simple.js`
2. Replace `YOUR_DISCORD_BOT_TOKEN_HERE` with your actual bot token
3. Run:
```bash
node bot-status-simple.js
```

## Features

### WebSocket Version (`bot-status.js`)
✅ Bot appears online
✅ Rotating status every 15 seconds
✅ Automatic reconnection on disconnect
✅ Session resumption support
✅ Proper heartbeat handling

### Simple Version (`bot-status-simple.js`)
✅ Rotating status every 15 seconds
❌ Bot appears offline (no Gateway connection)
✅ Easier to set up
✅ No dependencies

## Troubleshooting

### Bot not appearing online
If you need to immediately suspend the bot (emergency):

- If the bot is run with `pm2`:
	- `pm2 stop allCareers-bot` or `pm2 stop bot-status.js`
	- `pm2 delete allCareers-bot` to remove the process
- If the bot is run with `systemd` or a service manager, stop the service: `sudo systemctl stop allcareers-bot.service`
- If started with `nohup` or in the background, find and kill the process:
	- `ps aux | grep bot-status` to find PIDs
	- `kill <PID>` or `kill -9 <PID>` if needed
- Alternatively, on the host set the environment variable `DISABLE_BOTS=true` (or `SUSPEND_BOTS=true`) for the running environment and restart the process manager (preferred when using container/orchestrator environments).

Security steps to follow after suspension:

- Immediately rotate/revoke the Discord bot token in the Discord Developer Portal.
- Regenerate any webhooks and do not re-enable them until credentials are rotated and verified.
- Remove any bot tokens from source files and use environment variables or a secret store instead.

To re-enable the bot later:

- Ensure the token is stored securely (e.g., environment variable `DISCORD_BOT_TOKEN`) and set `DISABLE_BOTS`/`SUSPEND_BOTS` to `false` or unset the variable.
- Start the process again with `pm2 start bot-status.js --name allCareers-bot` or your preferred supervisor.

### Status not updating
- Check the console for errors
- Verify the bot token has correct permissions
- Make sure the script is still running

### Connection lost
- The WebSocket version automatically reconnects
- Check your internet connection
- Verify Discord's status at https://discordstatus.com

## Running on a Server

### Cloudflare Workers (Not Supported)
⚠️ WebSocket connections are not supported in Cloudflare Workers. You need a traditional server or VPS.

### Recommended Hosting
- **VPS**: DigitalOcean, Linode, AWS EC2
- **Free Options**: Render, Railway, Heroku (limited)
- **Local Machine**: Can run 24/7 if computer stays on

## Integration with Careers Portal

The bot is already integrated with the careers portal for:
- ✅ Sending DMs when candidate status changes
- ✅ Professional embeds with company logos
- ✅ Application confirmations

The status updater is **separate** and just keeps the bot appearing online with rotating status messages.

## Security Notes

⚠️ **Never commit bot-status.js with your real bot token to GitHub**
- The file is in `.gitignore` by default
- Keep your bot token secure
- Regenerate token if exposed

## Commands

Start bot:
```bash
node bot-status.js
```

Stop bot (if using PM2):
```bash
pm2 stop allCareers-bot
```

View logs (PM2):
```bash
pm2 logs allCareers-bot
```

Restart bot (PM2):
```bash
pm2 restart allCareers-bot
```
