#!/bin/bash

# TimeClock Backend Deployment Script
# This script helps you deploy the TimeClock backend with proper configuration

echo "🚀 TimeClock Backend Deployment"
echo "================================"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found!"
    echo "Install with: npm install -g wrangler"
    exit 1
fi

echo "✅ Wrangler CLI found"

# Check if logged in
if ! wrangler whoami &> /dev/null; then
    echo "⚠️  Not logged in to Cloudflare"
    echo "Run: wrangler login"
    exit 1
fi

echo "✅ Logged in to Cloudflare"
echo ""

# Ask if KV namespace is created
echo "📦 KV Namespace Setup"
echo "--------------------"
read -p "Have you created the KV namespace? (y/n): " kv_created

if [ "$kv_created" != "y" ]; then
    echo ""
    echo "Creating KV namespace..."
    wrangler kv:namespace create "TIMECLOCK_KV" --config wrangler-timeclock.toml
    echo ""
    echo "📝 Copy the 'id' from above and update wrangler-timeclock.toml"
    echo "Then run this script again."
    exit 0
fi

# Check if KV ID is set in wrangler.toml
if grep -q "YOUR_KV_NAMESPACE_ID_HERE" wrangler-timeclock.toml; then
    echo "❌ KV Namespace ID not set in wrangler-timeclock.toml!"
    echo "Please update the file with your KV namespace ID."
    exit 1
fi

echo "✅ KV Namespace configured"
echo ""

# Ask about Discord Bot Token
echo "🤖 Discord Bot Token"
echo "-------------------"
read -p "Have you set the DISCORD_BOT_TOKEN secret? (y/n): " token_set

if [ "$token_set" != "y" ]; then
    echo ""
    echo "Setting Discord Bot Token..."
    wrangler secret put DISCORD_BOT_TOKEN --config wrangler-timeclock.toml
fi

echo "✅ Discord Bot Token configured"
echo ""

# Deploy
echo "🚀 Deploying TimeClock Backend..."
echo "-------------------------------"
wrangler deploy --config wrangler-timeclock.toml

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🔗 Your worker URL:"
    echo "   https://timeclock-backend.YOUR_SUBDOMAIN.workers.dev"
    echo ""
    echo "🧪 Test with:"
    echo "   curl https://timeclock-backend.YOUR_SUBDOMAIN.workers.dev/health"
    echo ""
else
    echo ""
    echo "❌ Deployment failed!"
    echo "Check the error messages above."
    exit 1
fi
