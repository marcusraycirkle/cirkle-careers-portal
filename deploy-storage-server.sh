#!/bin/bash

echo "🚀 Employer Suite Storage Server Deployment Script"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running on Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo -e "${RED}❌ This script must run on Linux (Lubuntu)${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Install with: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node --version)${NC}"

# Check if npm dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependencies not installed. Installing...${NC}"
    npm install
fi

# Check if storage-server.env exists
if [ ! -f "storage-server.env" ]; then
    echo -e "${YELLOW}⚠️  storage-server.env not found${NC}"
    echo "Creating from example..."
    cp storage-server.env.example storage-server.env
    
    # Generate API key
    API_KEY=$(openssl rand -hex 32)
    sed -i "s/your-generated-api-key-here/$API_KEY/" storage-server.env
    
    echo -e "${GREEN}✅ Created storage-server.env with generated API key${NC}"
    echo -e "${YELLOW}📋 Your API Key: $API_KEY${NC}"
    echo ""
    echo "⚠️  SAVE THIS API KEY - You'll need it for Cloudflare Worker secrets!"
    echo ""
fi

# Create storage directory if it doesn't exist
STORAGE_PATH="/var/employersuit/storage"
if [ ! -d "$STORAGE_PATH" ]; then
    echo -e "${YELLOW}Creating storage directory at $STORAGE_PATH${NC}"
    sudo mkdir -p $STORAGE_PATH
    sudo mkdir -p /var/employersuit/logs
    sudo chown -R $USER:$USER /var/employersuit
    chmod 755 $STORAGE_PATH
    echo -e "${GREEN}✅ Storage directory created${NC}"
fi

# Test if server can start
echo ""
echo "Testing storage server..."
timeout 5 node storage-server.js &
SERVER_PID=$!
sleep 3

if ps -p $SERVER_PID > /dev/null; then
    echo -e "${GREEN}✅ Server test successful${NC}"
    kill $SERVER_PID 2>/dev/null
else
    echo -e "${RED}❌ Server failed to start${NC}"
    echo "Check the error messages above"
    exit 1
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo ""
    echo -e "${YELLOW}PM2 not installed. Install with: sudo npm install -g pm2${NC}"
    echo "For now, you can run manually with: node storage-server.js"
    exit 0
fi

echo -e "${GREEN}✅ PM2 is installed${NC}"

# Ask user if they want to start with PM2
echo ""
read -p "Start storage server with PM2? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Stop if already running
    pm2 delete employersuit-storage 2>/dev/null || true
    
    # Start with PM2
    pm2 start storage-server.js --name "employersuit-storage"
    pm2 save
    
    echo ""
    echo -e "${GREEN}✅ Storage server started with PM2${NC}"
    echo ""
    echo "Useful commands:"
    echo "  pm2 status              - View server status"
    echo "  pm2 logs employersuit-storage - View logs"
    echo "  pm2 restart employersuit-storage - Restart server"
    echo "  pm2 stop employersuit-storage - Stop server"
    echo ""
    echo "Test the server:"
    echo "  curl http://localhost:3100/health"
    echo ""
    
    # Show the API key again
    API_KEY=$(grep "^API_KEY=" storage-server.env | cut -d '=' -f2)
    echo -e "${YELLOW}================================================${NC}"
    echo -e "${YELLOW}📋 Your Storage API Key: $API_KEY${NC}"
    echo -e "${YELLOW}================================================${NC}"
    echo ""
    echo "Add this to Cloudflare Worker secrets:"
    echo "  wrangler secret put STORAGE_API_KEY"
    echo "  wrangler secret put STORAGE_SERVER_URL"
    echo "  (Use: http://YOUR_IP:3100 or https://storage.yourdomain.com)"
else
    echo ""
    echo "To start manually, run: node storage-server.js"
fi

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
