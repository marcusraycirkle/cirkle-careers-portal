#!/bin/bash

# Quick deployment script for Employer Suite
# Run this after setting up all secrets

echo "╔════════════════════════════════════════════════════╗"
echo "║   Employer Suite - Quick Deploy                   ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Check if logged in
echo "🔐 Checking Wrangler authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "❌ Not logged in to Wrangler"
    echo "Please set: export CLOUDFLARE_API_TOKEN=your_token"
    exit 1
fi
echo "✅ Authenticated"
echo ""

# Show current secrets
echo "📋 Current Wrangler secrets:"
wrangler secret list
echo ""

# Check for required secrets
echo "🔍 Checking required secrets..."
SECRETS=$(wrangler secret list | grep -E "DISCORD_CLIENT_ID|DISCORD_CLIENT_SECRET|FIREBASE_API_KEY|DISCORD_BOT_TOKEN")

if echo "$SECRETS" | grep -q "DISCORD_CLIENT_ID"; then
    echo "✅ DISCORD_CLIENT_ID configured"
else
    echo "⚠️  DISCORD_CLIENT_ID not set"
    read -p "Enter Discord Client ID (or press Enter to skip): " client_id
    if [ ! -z "$client_id" ]; then
        echo "$client_id" | wrangler secret put DISCORD_CLIENT_ID
    fi
fi

if echo "$SECRETS" | grep -q "DISCORD_CLIENT_SECRET"; then
    echo "✅ DISCORD_CLIENT_SECRET configured"
else
    echo "⚠️  DISCORD_CLIENT_SECRET not set"
    read -p "Enter Discord Client Secret (or press Enter to skip): " client_secret
    if [ ! -z "$client_secret" ]; then
        echo "$client_secret" | wrangler secret put DISCORD_CLIENT_SECRET
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Deploying Cloudflare Worker..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

wrangler deploy

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔗 Worker URL: https://cirkle-careers-api.marcusray.workers.dev"
echo ""
echo "📝 Next steps:"
echo "   1. Test health endpoint: curl https://cirkle-careers-api.marcusray.workers.dev/health"
echo "   2. Upload frontend files to your web server"
echo "   3. Test login at: https://allcareers.cirkledevelopment.co.uk/employersuit/dash"
echo ""
echo "📊 View logs: wrangler tail"
echo ""
