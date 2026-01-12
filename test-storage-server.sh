#!/bin/bash

echo "🧪 Testing Storage Server Setup"
echo "================================"
echo ""

# Check storage-server.env exists
if [ ! -f "storage-server.env" ]; then
    echo "❌ storage-server.env not found!"
    echo "Run ./deploy-storage-server.sh first"
    exit 1
fi

# Load API key
API_KEY=$(grep "^API_KEY=" storage-server.env | cut -d '=' -f2)

if [ -z "$API_KEY" ] || [ "$API_KEY" == "your-generated-api-key-here" ]; then
    echo "❌ API_KEY not set properly in storage-server.env"
    exit 1
fi

echo "✅ Configuration file found"
echo ""

# Test if server is running
echo "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:3100/health 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✅ Server is running!"
    echo "Response: $HEALTH_RESPONSE"
else
    echo "❌ Server is not responding on http://localhost:3100"
    echo ""
    echo "Start the server with:"
    echo "  node storage-server.js"
    echo "  OR"
    echo "  pm2 start storage-server.js --name employersuit-storage"
    exit 1
fi

echo ""
echo "Testing storage info endpoint with API key..."
STORAGE_INFO=$(curl -s -H "X-API-Key: $API_KEY" http://localhost:3100/api/storage/info 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✅ API authentication works!"
    echo "Response: $STORAGE_INFO"
else
    echo "❌ API request failed"
    exit 1
fi

echo ""
echo "================================"
echo "✅ All tests passed!"
echo ""
echo "Your storage server is ready!"
echo ""
echo "Next steps:"
echo "1. Add secrets to Cloudflare Worker:"
echo "   wrangler secret put STORAGE_API_KEY"
echo "   (Enter: $API_KEY)"
echo ""
echo "   wrangler secret put STORAGE_SERVER_URL"
echo "   (Enter: http://YOUR_IP:3100)"
echo ""
echo "2. Deploy Cloudflare Worker:"
echo "   wrangler deploy"
