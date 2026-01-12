#!/bin/bash

# Complete TimeClock Backend Setup
# This script helps you add the Discord Bot Token to the TimeClock backend

echo "🔐 TimeClock Backend - Final Setup Step"
echo "========================================"
echo ""
echo "The TimeClock backend is deployed and healthy!"
echo "URL: https://timeclock-backend.marcusray.workers.dev"
echo ""
echo "⚠️  One more step needed: Add Discord Bot Token"
echo ""
echo "The DISCORD_BOT_TOKEN exists in your main worker (cirkle-careers-api)."
echo "We need to copy it to the timeclock-backend worker."
echo ""
echo "To do this, you need to:"
echo "1. Get your Discord Bot Token from https://discord.com/developers/applications"
echo "2. Run the command below and paste your token when prompted"
echo ""
echo "Command:"
echo "  wrangler secret put DISCORD_BOT_TOKEN --config wrangler-timeclock.toml"
echo ""
echo "After setting the secret, test the staff endpoint:"
echo "  curl -X POST https://timeclock-backend.marcusray.workers.dev/api/employers/staff/list \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -H 'Authorization: Bearer test' \\"
echo "    -d '{\"guildId\":\"1310656642672627752\",\"includeDetails\":true}'"
echo ""
read -p "Press Enter to set the DISCORD_BOT_TOKEN now, or Ctrl+C to exit..."
echo ""

wrangler secret put DISCORD_BOT_TOKEN --config wrangler-timeclock.toml

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Secret set successfully!"
    echo ""
    echo "Testing the backend..."
    echo ""
    
    response=$(curl -s -X POST https://timeclock-backend.marcusray.workers.dev/api/employers/staff/list \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer test" \
      -d '{"guildId":"1310656642672627752","includeDetails":true}')
    
    echo "Response:"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    echo ""
    
    if echo "$response" | grep -q '"success":true'; then
        echo "🎉 TimeClock Backend is fully operational!"
        echo ""
        echo "The Employer Suite will now be able to:"
        echo "  ✅ View staff database"
        echo "  ✅ Manage payslips"
        echo "  ✅ Issue disciplinary actions"
        echo "  ✅ Handle requests and absences"
        echo "  ✅ Suspend and dismiss users"
        echo ""
        echo "Visit https://allcareers.cirkledevelopment.co.uk and check the Staff Database tab!"
    else
        echo "⚠️  Backend responded but check if bot token is valid"
        echo "Make sure your bot is in the Discord server!"
    fi
else
    echo "❌ Failed to set secret"
fi
