// Bot Status Updater - Keeps the allCareers bot online with rotating status
// This script needs to run continuously (e.g., on a server or your local machine)

const DISCORD_BOT_TOKEN = 'YOUR_DISCORD_BOT_TOKEN_HERE';

const statuses = [
  { name: '🧐 Reading Applications', type: 3 }, // Type 3 = Watching
  { name: '🌐 allcareers.cirkledevelopment.co.uk', type: 3 },
  { name: '🏠 Currently Serving 4 Companies', type: 3 }
];

let currentStatusIndex = 0;

// WebSocket connection to Discord Gateway
const WebSocket = require('ws');

function connectBot() {
  let ws;
  let heartbeatInterval;
  let sessionId = null;
  let resumeGatewayUrl = null;
  let sequence = null;

  async function connect() {
    // Get Gateway URL
    const gatewayResponse = await fetch('https://discord.com/api/v10/gateway/bot', {
      headers: { 'Authorization': `Bot ${DISCORD_BOT_TOKEN}` }
    });
    const gatewayData = await gatewayResponse.json();
    const gatewayUrl = gatewayData.url;

    console.log('Connecting to Discord Gateway...');
    ws = new WebSocket(`${gatewayUrl}?v=10&encoding=json`);

    ws.on('open', () => {
      console.log('✅ Connected to Discord Gateway');
    });

    ws.on('message', (data) => {
      const payload = JSON.parse(data);
      const { op, d, s, t } = payload;

      // Store sequence number
      if (s) sequence = s;

      // Handle different opcodes
      switch (op) {
        case 10: // Hello - start heartbeat
          const heartbeatInterval = d.heartbeat_interval;
          startHeartbeat(heartbeatInterval);
          
          if (sessionId && resumeGatewayUrl) {
            // Resume session
            console.log('Resuming session...');
            ws.send(JSON.stringify({
              op: 6,
              d: {
                token: DISCORD_BOT_TOKEN,
                session_id: sessionId,
                seq: sequence
              }
            }));
          } else {
            // Identify
            console.log('Identifying...');
            ws.send(JSON.stringify({
              op: 2,
              d: {
                token: DISCORD_BOT_TOKEN,
                intents: 0, // No intents needed for status only
                properties: {
                  os: 'linux',
                  browser: 'allCareers',
                  device: 'allCareers'
                },
                presence: {
                  activities: [statuses[0]],
                  status: 'online',
                  afk: false
                }
              }
            }));
          }
          break;

        case 0: // Dispatch
          if (t === 'READY') {
            sessionId = d.session_id;
            resumeGatewayUrl = d.resume_gateway_url;
            console.log('✅ Bot is now ONLINE!');
            console.log(`Logged in as: ${d.user.username}#${d.user.discriminator}`);
            
            // Start rotating status every 15 seconds
            setInterval(updateStatus, 15000);
          }
          break;

        case 11: // Heartbeat ACK
          // Heartbeat acknowledged
          break;

        case 7: // Reconnect
          console.log('Reconnecting...');
          ws.close();
          setTimeout(connect, 1000);
          break;

        case 9: // Invalid Session
          console.log('Invalid session, reconnecting...');
          sessionId = null;
          sequence = null;
          ws.close();
          setTimeout(connect, 1000);
          break;
      }
    });

    ws.on('close', (code) => {
      console.log(`❌ Connection closed with code ${code}`);
      clearInterval(heartbeatInterval);
      
      // Reconnect after 5 seconds
      setTimeout(connect, 5000);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  function startHeartbeat(interval) {
    heartbeatInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          op: 1,
          d: sequence
        }));
      }
    }, interval);
  }

  function updateStatus() {
    currentStatusIndex = (currentStatusIndex + 1) % statuses.length;
    const status = statuses[currentStatusIndex];
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        op: 3,
        d: {
          since: null,
          activities: [status],
          status: 'online',
          afk: false
        }
      }));
      console.log(`Status updated: ${status.name}`);
    }
  }

  connect();
}

// Start the bot
console.log('Starting allCareers bot...');
connectBot();
