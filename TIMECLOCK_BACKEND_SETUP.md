# TimeClock Backend Setup Guide

## Overview

The TimeClock Backend is a Cloudflare Worker that manages:
- Staff database (via Discord API)
- Payslips
- Disciplinary actions
- Reports
- Requests & Absences
- User management (suspend/dismiss)
- Dashboard statistics

## Prerequisites

- Cloudflare account
- Discord Bot Token (with proper permissions)
- Wrangler CLI installed

## Step 1: Create KV Namespace

Create a KV namespace to store data:

```bash
wrangler kv:namespace create "TIMECLOCK_KV"
```

This will output something like:
```
{ binding = "TIMECLOCK_KV", id = "abc123..." }
```

Copy the `id` value for the next step.

## Step 2: Configure Wrangler

Create or update `wrangler.toml`:

```toml
name = "timeclock-backend"
main = "timeclock-backend.js"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "TIMECLOCK_KV"
id = "YOUR_KV_NAMESPACE_ID"  # Replace with ID from Step 1

[vars]
# Public variables (safe to commit)
```

## Step 3: Set Secrets

Set your Discord Bot Token as a secret:

```bash
wrangler secret put DISCORD_BOT_TOKEN
```

When prompted, paste your Discord bot token.

### Getting a Discord Bot Token

1. Go to https://discord.com/developers/applications
2. Select your application (or create one)
3. Go to "Bot" section
4. Click "Reset Token" or "Copy" to get your token
5. **Important**: Enable these Privileged Gateway Intents:
   - Server Members Intent
   - Message Content Intent (optional)

### Bot Permissions Required

Your bot needs these permissions in your Discord server:
- View Server Members
- Read Messages/View Channels

Invite URL template:
```
https://discord.com/oauth2/authorize?client_id=YOUR_BOT_CLIENT_ID&permissions=1024&scope=bot
```

## Step 4: Deploy

Deploy the worker to Cloudflare:

```bash
wrangler deploy timeclock-backend.js --name timeclock-backend
```

After deployment, you'll get a URL like:
```
https://timeclock-backend.YOUR_SUBDOMAIN.workers.dev
```

## Step 5: Test Health Check

Test that the worker is running:

```bash
curl https://timeclock-backend.YOUR_SUBDOMAIN.workers.dev/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "TimeClock Backend",
  "version": "1.0.0",
  "timestamp": "2026-01-12T..."
}
```

## Step 6: Test Staff List

Test fetching staff from your Discord server:

```bash
curl -X POST https://timeclock-backend.YOUR_SUBDOMAIN.workers.dev/api/employers/staff/list \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-test-token" \
  -d '{"guildId":"YOUR_GUILD_ID","includeDetails":true}'
```

Replace `YOUR_GUILD_ID` with your Discord server ID (from employersuit-api.js: `1310656642672627752`)

## API Endpoints

### Staff Management
- `POST /api/employers/staff/list` - Get all staff members
- `POST /api/employers/staff/{userId}` - Get specific staff member

### Payslips
- `POST /api/employers/payslips/list` - List payslips
- `POST /api/employers/payslips/add` - Add new payslip

### Disciplinary
- `POST /api/employers/disciplinaries/list` - List disciplinary records
- `POST /api/employers/disciplinaries/issue` - Issue new disciplinary

### Reports
- `POST /api/employers/reports/list` - List reports
- `POST /api/employers/reports/submit` - Submit new report

### Requests
- `POST /api/employers/requests/list` - List requests
- `POST /api/employers/requests/approve` - Approve request
- `POST /api/employers/requests/reject` - Reject request

### Absences
- `POST /api/employers/absences/list` - List absences
- `POST /api/employers/absences/approve` - Approve absence
- `POST /api/employers/absences/reject` - Reject absence

### User Management
- `POST /api/employers/users/suspend` - Suspend user
- `POST /api/employers/users/unsuspend` - Unsuspend user
- `POST /api/employers/users/dismiss` - Dismiss user
- `POST /api/employers/users/dismissed-list` - List dismissed users

### Dashboard
- `POST /api/employers/dashboard/stats` - Get dashboard statistics

## Data Storage

All data is stored in Cloudflare KV with these key patterns:

- `payslips:{userId}` - User payslips
- `disciplinaries:{userId}` - User disciplinary records
- `reports:all` - All reports
- `requests:all` - All requests
- `absences:all` - All absences
- `suspension:{userId}` - User suspension data
- `dismissals:all` - All dismissals
- `user:{userId}:history` - User history

## Monitoring

### View Worker Logs
```bash
wrangler tail timeclock-backend
```

### Check KV Usage
```bash
wrangler kv:key list --namespace-id YOUR_KV_NAMESPACE_ID
```

### View Specific Key
```bash
wrangler kv:key get "payslips:123456789" --namespace-id YOUR_KV_NAMESPACE_ID
```

## Security Notes

1. **Never commit secrets** - Use `wrangler secret put` for sensitive data
2. **CORS is enabled** - Currently set to `*`, consider restricting in production
3. **Authentication** - The worker expects `Authorization: Bearer {token}` header
4. **Rate Limiting** - Consider adding rate limiting in production

## Troubleshooting

### "DISCORD_BOT_TOKEN not configured"
- Run: `wrangler secret put DISCORD_BOT_TOKEN`
- Make sure you're deploying to the correct worker

### "Failed to fetch guild members"
- Check bot token is valid
- Verify bot has "Server Members Intent" enabled
- Ensure bot is in the Discord server
- Check Guild ID is correct

### "KV storage not configured"
- Verify KV namespace is created
- Check `wrangler.toml` has correct KV binding
- Redeploy the worker after KV configuration

### 404 Errors
- Check endpoint URL matches exactly
- Verify request method is POST (not GET)
- Check Content-Type header is set

## Updating the Backend

After making changes to `timeclock-backend.js`:

```bash
wrangler deploy timeclock-backend.js --name timeclock-backend
```

The changes will be live immediately (no downtime).

## Cost Estimate

Cloudflare Workers Free Tier includes:
- 100,000 requests/day
- 10ms CPU time per request
- 1GB KV storage
- 1,000 KV writes/day
- 100,000 KV reads/day

For most small-to-medium operations, this should remain free.

## Support

For issues:
1. Check worker logs: `wrangler tail timeclock-backend`
2. Test health endpoint
3. Verify secrets are set correctly
4. Check Discord bot permissions

---

**Version**: 1.0.0  
**Last Updated**: January 12, 2026
