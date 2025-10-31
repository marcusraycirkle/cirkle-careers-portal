// Simple Bot Status Updater - Updates status via REST API
// This is simpler but the bot will appear offline between updates
// For a bot that stays online, use bot-status.js with WebSocket

const DISCORD_BOT_TOKEN = 'YOUR_DISCORD_BOT_TOKEN_HERE';

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
setInterval(updateStatus, 15000);
updateStatus();

console.log('Status updater started (REST API mode)');
console.log('For persistent online status, use: node bot-status.js');
