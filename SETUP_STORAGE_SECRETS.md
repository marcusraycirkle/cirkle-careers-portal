# Storage Server Wrangler Secrets Setup

## Prerequisites
✅ Storage server running on your Linux machine (localhost:3100)
✅ API key generated and configured in storage-server.env

## Step 1: Get Your API Key
On your Linux machine where storage server is running:
```bash
grep API_KEY storage-server.env
```
Copy the API key value (the long hex string after `API_KEY=`)

## Step 2: Set Wrangler Secrets

### Option A: Using Wrangler CLI (if you have browser access)
```bash
# Set storage server URL
wrangler secret put STORAGE_SERVER_URL
# When prompted, enter: http://YOUR_LINUX_IP:3100

# Set storage API key
wrangler secret put STORAGE_API_KEY
# When prompted, paste the API key from Step 1
```

### Option B: Using Cloudflare Dashboard
1. Go to: https://dash.cloudflare.com
2. Click "Workers & Pages"
3. Select "cirkle-careers-api"
4. Go to "Settings" → "Variables and Secrets"
5. Click "Add variable" for each:
   - Variable name: `STORAGE_SERVER_URL`
     - Value: `http://YOUR_LINUX_IP:3100` (or your server's public URL)
   - Variable name: `STORAGE_API_KEY`
     - Value: (paste the API key from Step 1)
6. Make sure to select "Encrypt" for STORAGE_API_KEY
7. Click "Save and deploy"

## Step 3: Deploy Worker
```bash
wrangler deploy
```

## Step 4: Verify
Test the connection:
```bash
curl https://cirkle-careers-api.marcusray.workers.dev/api/health
```

You should see `"employerSuite": "enabled"` in the response.

## Important Notes

### Using Public IP vs localhost
- If your Linux machine has a public IP: Use `http://PUBLIC_IP:3100`
- If using localhost: The Cloudflare Worker won't be able to reach it from the internet
- **Recommended**: Use a service like ngrok or expose the port through your router

### Using ngrok (Recommended for testing)
On your Linux machine:
```bash
# Install ngrok (if not installed)
# Then run:
ngrok http 3100
```

This will give you a public URL like `https://abc123.ngrok.io`
Use this as your STORAGE_SERVER_URL in Wrangler secrets.

### Production Deployment
For production, set up:
1. Nginx reverse proxy with SSL
2. Proper firewall rules
3. Domain name pointing to your Linux machine
4. Use HTTPS instead of HTTP

Example production URL: `https://storage.cirkledevelopment.co.uk`

## Troubleshooting

### Files not loading?
1. Check storage server is running: `curl http://localhost:3100/health`
2. Check Wrangler secrets are set: Go to Cloudflare dashboard → Settings
3. Check Cloudflare Worker logs for errors
4. Verify API key matches between storage-server.env and Wrangler secret

### CORS errors?
Update `CORS_ORIGIN` in storage-server.env:
```env
CORS_ORIGIN=https://allcareers.cirkledevelopment.co.uk
```

### Connection refused?
- Storage server might not be running: `./start-storage-server.sh`
- Firewall blocking port 3100: `sudo ufw allow 3100`
- Wrong IP address in STORAGE_SERVER_URL

## Next Steps
Once secrets are configured:
1. Go to https://allcareers.cirkledevelopment.co.uk
2. Log into employer portal
3. Click "Employer Suite"
4. Go to "My Files" tab
5. Try uploading a file - it should work! 🎉
