// Simple Bot Status Updater - Updates status via REST API
// This is simpler but the bot will appear offline between updates
// For a bot that stays online, use bot-status.js with WebSocket

// Immediate suspend check: set `DISABLE_BOTS=true` or `SUSPEND_BOTS=true` in the environment to stop this script
if (process.env.DISABLE_BOTS === 'true' || process.env.SUSPEND_BOTS === 'true') {
  console.log('Bot suspended via environment flag (DISABLE_BOTS/SUSPEND_BOTS). Exiting.');
  process.exit(0);
}

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || 'YOUR_DISCORD_BOT_TOKEN_HERE';

const statuses = [
  { name: '🧐 Reading Applications', type: 3 },
  { name: '🌐 allcareers.cirkledevelopment.co.uk', type: 3 },
  { name: '🏠 Currently Serving 4 Companies', type: 3 }
];

let currentStatusIndex = 0;

async function updateStatus() {
  const status = statuses[currentStatusIndex];
  
  try {
    const response = await fetch('https://discord.com/api/v10/gateway', {
      headers: { 'Authorization': `Bot ${DISCORD_BOT_TOKEN}` }
    });
    
    console.log(`✅ Status would be: ${status.name}`);
    console.log('⚠️  Note: To keep bot online, use bot-status.js with WebSocket connection');
    
    currentStatusIndex = (currentStatusIndex + 1) % statuses.length;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Update every 15 seconds
// If token not present, exit to avoid accidental connections
if (!DISCORD_BOT_TOKEN || DISCORD_BOT_TOKEN === 'YOUR_DISCORD_BOT_TOKEN_HERE') {
  console.log('Discord bot token not configured or placeholder found. Exiting without attempting to update status.');
  process.exit(0);
}

setInterval(updateStatus, 15000);
updateStatus();

console.log('Status updater started (REST API mode)');
console.log('For persistent online status, use: node bot-status.js');
