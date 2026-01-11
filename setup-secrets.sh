#!/bin/bash

# Employer Suite - Cloudflare Worker Secrets Setup
# This script helps you set up all required secrets for the Employer Suite

echo "╔════════════════════════════════════════════════════╗"
echo "║   Employer Suite - Secrets Setup                  ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

echo "📋 Current secrets:"
wrangler secret list
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Required secrets for Employer Suite:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. DISCORD_CLIENT_ID - Discord OAuth Client ID"
echo "2. DISCORD_CLIENT_SECRET - Discord OAuth Client Secret"
echo "3. STORAGE_SERVER_URL - URL of your storage server (optional for now)"
echo "4. STORAGE_API_KEY - API key for storage server (optional for now)"
echo ""

read -p "Do you want to add Discord OAuth secrets now? (y/n): " add_discord

if [ "$add_discord" = "y" ]; then
    echo ""
    echo "🔐 Setting up Discord OAuth..."
    echo ""
    echo "Get these from: https://discord.com/developers/applications"
    echo "Select your application > OAuth2 > Copy Client ID and Client Secret"
    echo ""
    
    read -p "Enter Discord Client ID: " client_id
    if [ ! -z "$client_id" ]; then
        echo "$client_id" | wrangler secret put DISCORD_CLIENT_ID
        echo "✅ DISCORD_CLIENT_ID set"
    fi
    
    echo ""
    read -p "Enter Discord Client Secret: " client_secret
    if [ ! -z "$client_secret" ]; then
        echo "$client_secret" | wrangler secret put DISCORD_CLIENT_SECRET
        echo "✅ DISCORD_CLIENT_SECRET set"
    fi
fi

echo ""
read -p "Do you want to add Storage Server configuration? (y/n): " add_storage

if [ "$add_storage" = "y" ]; then
    echo ""
    echo "📦 Setting up Storage Server..."
    echo ""
    
    read -p "Enter Storage Server URL (e.g., http://localhost:3100): " storage_url
    if [ ! -z "$storage_url" ]; then
        echo "$storage_url" | wrangler secret put STORAGE_SERVER_URL
        echo "✅ STORAGE_SERVER_URL set"
    fi
    
    echo ""
    echo "Use this API key: 7d8888e85e799b9efa7cfa5763959694c68fd4b88bfd93bffd87a5e52b4deb2d"
    read -p "Enter Storage API Key: " storage_key
    if [ ! -z "$storage_key" ]; then
        echo "$storage_key" | wrangler secret put STORAGE_API_KEY
        echo "✅ STORAGE_API_KEY set"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Secret setup complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Final secrets list:"
wrangler secret list
echo ""
echo "🚀 Ready to deploy! Run: wrangler deploy"
