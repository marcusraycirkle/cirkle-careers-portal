# Employer Suite Storage Server Setup Guide

This guide will help you set up your Lubuntu machine as a storage server for the Employer Suite My Files feature.

## Architecture Overview

```
[Employer Suite Frontend] 
    ↓
[Cloudflare Worker API] 
    ↓ (HTTPS)
[Storage Server on Lubuntu] 
    ↓
[Local Disk Storage /var/employersuit/storage/]
```

## Prerequisites

- Lubuntu machine with Node.js 16+ installed
- Static IP or dynamic DNS for your Lubuntu machine
- Port 3100 available (or configure different port)
- At least 100GB free disk space

---

## Step 1: Install Dependencies on Lubuntu

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js if not already installed
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Verify installations
node --version
npm --version
pm2 --version
```

---

## Step 2: Set Up Storage Directory

```bash
# Create storage directory
sudo mkdir -p /var/employersuit/storage
sudo mkdir -p /var/employersuit/logs

# Set permissions (replace 'your-username' with your actual username)
sudo chown -R $USER:$USER /var/employersuit
chmod 755 /var/employersuit/storage
```

---

## Step 3: Generate API Key for Security

```bash
# Generate a secure API key
openssl rand -hex 32
```

**Save this API key** - you'll need it for both the storage server and Cloudflare Worker.

---

## Step 4: Configure Storage Server

The storage server files will be created in your repository. After deployment:

```bash
cd /workspaces/cirkle-careers-portal

# Create .env file for storage server
cat > storage-server.env << 'EOF'
PORT=3100
STORAGE_PATH=/var/employersuit/storage
API_KEY=YOUR_GENERATED_API_KEY_HERE
MAX_FILE_SIZE=104857600
CORS_ORIGIN=https://allcareers.cirkledevelopment.co.uk
NODE_ENV=production
EOF

# Replace YOUR_GENERATED_API_KEY_HERE with the key from Step 3
nano storage-server.env
```

---

## Step 5: Install Storage Server Dependencies

```bash
cd /workspaces/cirkle-careers-portal
npm install express multer cors helmet rate-limiter-flexible morgan
```

---

## Step 6: Start Storage Server

```bash
# Start with PM2
pm2 start storage-server.js --name "employersuit-storage" --env production

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
# Follow the command output instructions
```

---

## Step 7: Configure Firewall (Optional but Recommended)

```bash
# Allow port 3100
sudo ufw allow 3100/tcp

# Check firewall status
sudo ufw status
```

---

## Step 8: Set Up SSL Certificate (Production)

For production, use Let's Encrypt with a reverse proxy:

```bash
# Install Nginx
sudo apt install -y nginx certbot python3-certbot-nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/employersuit-storage
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name storage.yourdomain.com;

    location / {
        proxy_pass http://localhost:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Increase timeouts for large file uploads
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        client_max_body_size 100M;
    }
}
```

Enable the site and get SSL certificate:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/employersuit-storage /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d storage.yourdomain.com
```

---

## Step 9: Configure Cloudflare Worker Secrets

```bash
# Set the storage server URL
wrangler secret put STORAGE_SERVER_URL
# Enter: https://storage.yourdomain.com (or http://YOUR_IP:3100 for testing)

# Set the storage API key (same as from Step 3)
wrangler secret put STORAGE_API_KEY
# Enter: [your generated API key]

# Set Discord OAuth credentials (if not already set)
wrangler secret put DISCORD_CLIENT_ID
# Enter: [your Discord client ID]

wrangler secret put DISCORD_CLIENT_SECRET
# Enter: [your Discord client secret]

# Set Discord bot token (if not already set)
wrangler secret put DISCORD_BOT_TOKEN
# Enter: [your Discord bot token]
```

---

## Step 10: Test the Storage Server

```bash
# Check if server is running
pm2 status

# View logs
pm2 logs employersuit-storage

# Test health endpoint
curl http://localhost:3100/health

# Test with API key
curl -H "X-API-Key: YOUR_API_KEY" http://localhost:3100/api/storage/info
```

---

## Step 11: Deploy Cloudflare Worker

```bash
cd /workspaces/cirkle-careers-portal
wrangler deploy
```

---

## Step 12: Test End-to-End

1. Open your browser and navigate to:
   ```
   https://allcareers.cirkledevelopment.co.uk/employersuit/dash
   ```

2. Authenticate with Discord

3. Go to "My Files" tab

4. Try uploading a test file

5. Verify file appears in `/var/employersuit/storage/[your-discord-id]/`

---

## Monitoring & Maintenance

### View Storage Usage

```bash
# Check total storage usage
du -sh /var/employersuit/storage

# Check per-user storage
du -sh /var/employersuit/storage/*
```

### View Logs

```bash
# PM2 logs
pm2 logs employersuit-storage

# System logs
tail -f /var/employersuit/logs/storage-server.log
```

### Restart Server

```bash
# Restart with PM2
pm2 restart employersuit-storage

# Check status
pm2 status
```

### Backup Storage

```bash
# Create backup script
sudo nano /usr/local/bin/backup-employersuit.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/backup/employersuit"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/storage_$DATE.tar.gz /var/employersuit/storage
find $BACKUP_DIR -name "storage_*.tar.gz" -mtime +7 -delete
```

Make executable and add to cron:

```bash
sudo chmod +x /usr/local/bin/backup-employersuit.sh
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-employersuit.sh
```

---

## Troubleshooting

### Server Won't Start

```bash
# Check for port conflicts
sudo lsof -i :3100

# Check logs
pm2 logs employersuit-storage --err

# Verify permissions
ls -la /var/employersuit/storage
```

### Cannot Upload Files

1. Check storage server logs: `pm2 logs employersuit-storage`
2. Verify API key is correct in both storage server and Cloudflare Worker
3. Check disk space: `df -h`
4. Verify firewall allows connections: `sudo ufw status`

### Files Not Accessible

1. Check file permissions: `ls -la /var/employersuit/storage/[user-id]/`
2. Verify storage path in storage-server.env
3. Check Nginx logs if using reverse proxy: `sudo tail -f /var/log/nginx/error.log`

---

## Security Considerations

1. **Always use HTTPS in production** - Set up SSL certificate with Let's Encrypt
2. **Keep API key secret** - Never commit to Git
3. **Regular backups** - Set up automated backups
4. **Monitor disk usage** - Set up alerts when approaching capacity
5. **Update regularly** - Keep Node.js and dependencies updated
6. **Rate limiting** - The storage server includes built-in rate limiting
7. **File scanning** - Consider adding antivirus scanning for uploaded files

---

## Performance Optimization

### For Better Performance:

```bash
# Increase file descriptor limits
sudo nano /etc/security/limits.conf
```

Add:

```
* soft nofile 65536
* hard nofile 65536
```

### Use SSD Storage:

If possible, mount an SSD at `/var/employersuit/storage` for better I/O performance.

---

## Next Steps

After setup is complete:

1. ✅ Test file upload/download
2. ✅ Test with multiple users
3. ✅ Verify storage quotas work correctly
4. ✅ Test file sharing functionality
5. ✅ Monitor performance and logs
6. ✅ Set up automated backups
7. ✅ Configure monitoring/alerts
