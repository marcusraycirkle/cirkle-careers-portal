// Cloudflare Worker - Firebase Proxy Backend
// This worker acts as a secure backend between your frontend and Firebase

// Your Firebase credentials (HIDDEN from frontend)
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD00-6EWTN4RsskroJ8G0FOHZzbSIYTy4s",
  databaseURL: "https://cirkle-careers-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "cirkle-careers"
};

// Employer credentials (HIDDEN from frontend - stored securely in worker)
const USERS = {
  '926568979747713095': { pin: '071025', role: 'Cirkle Dev | Assistant Director', name: 'Teejay Everil', pfp: 'https://media.discordapp.net/attachments/1315278404009988107/1433587280135848017/image.png?ex=69053bb2&is=6903ea32&hm=d8b44af330e8902aa0956a58820eae731272f474651ead5164c5b31eb2216100&=&format=webp&quality=lossless' },
  '1088907566844739624': { pin: '061025', role: 'Cirkle Dev | Board of Directors', name: 'Marcus Ray', pfp: 'https://media.discordapp.net/attachments/1360983939338080337/1433579053238976544/image.png?ex=69053408&is=6903e288&hm=ddb0faa805dc0daf59f7ebe922a39011ff1063a9d621c3a4580ea433221249b4&=&format=webp&quality=lossless' },
  '1187751127039615086': { pin: '051025', role: 'Cirkle Dev | Managing Director', name: 'Sam Caster', pfp: 'https://media.discordapp.net/attachments/1433394788761342143/1433578832929095710/sam.png?ex=690533d4&is=6903e254&hm=74b4a63f5c32ca4a2b01417f549f26b16c58c8ed95d732585e7de24508fbd103&=&format=webp&quality=lossless' },
  '1028181169721839616': { pin: '227102', role: ' Aer Lingus | Recruiter', name: 'Magic', pfp: 'https://media.discordapp.net/attachments/1404157487799861332/1433750219119661056/noFilter.png?ex=6905d372&is=690481f2&hm=25a7aa29daf19680ed95583c470263cb342b7dd1035830a87353d2d827ea5abd&=&format=webp&quality=lossless' },
  '1246933891613200467': { pin: '421942', role: ' Aer Lingus | CEO', name: 'Carter', pfp: 'https://media.discordapp.net/attachments/1315278404009988107/1433586694287785984/image.png?ex=69053b26&is=6903e9a6&hm=45eec1ce305b323ec8d7b9a7743acf3080d4ae557ce772db764e15c6030d3d90&=&format=webp&quality=lossless' },
  '146763000701911040': { pin: '191125', role: ' Cirkle Dev | Finance Departement', name: 'Yassine Fried', pfp: 'https://media.discordapp.net/attachments/1433394788761342143/1433598236702019624/IMG_7285.png?ex=690545e6&is=6903f466&hm=b27fd08540e8ea5fcab711111096d9ac4ed4587fc5a3e35762717b0c79231ac0&=&format=webp&quality=lossless&width=620&height=960' }
};

// Discord webhook (HIDDEN from frontend) - DISABLED FOR SECURITY
const DISCORD_WEBHOOK = null;

// Discord Bot Token (HIDDEN from frontend) - DISABLED FOR SECURITY
const DISCORD_BOT_TOKEN = null;

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// EMERGENCY MAINTENANCE MODE - ENABLED
const MAINTENANCE_MODE = true;

export default {
  async fetch(request, env) {
    // EMERGENCY LOCKDOWN - Return maintenance page for all requests
    if (MAINTENANCE_MODE) {
      const maintenanceHTML = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cirkle Development - Maintenance</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }

      .maintenance-container {
        background: white;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        padding: 60px 40px;
        max-width: 600px;
        width: 100%;
        text-align: center;
        animation: slideUp 0.6s ease-out;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .shield-icon {
        width: 120px;
        height: 120px;
        margin: 0 auto 30px;
        animation: pulse 2s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }

      h1 {
        font-size: 2.5em;
        color: #1a202c;
        margin-bottom: 20px;
        font-weight: 700;
      }

      .subtitle {
        font-size: 1.3em;
        color: #667eea;
        margin-bottom: 30px;
        font-weight: 600;
      }

      .message {
        font-size: 1.1em;
        color: #4a5568;
        line-height: 1.8;
        margin-bottom: 30px;
      }

      .status-badge {
        display: inline-block;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 30px;
        border-radius: 50px;
        font-weight: 600;
        font-size: 1em;
        margin-bottom: 30px;
        animation: glow 2s ease-in-out infinite;
      }

      @keyframes glow {
        0%, 100% {
          box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
        }
        50% {
          box-shadow: 0 0 40px rgba(102, 126, 234, 0.8);
        }
      }

      .info-box {
        background: #f7fafc;
        border-left: 4px solid #667eea;
        padding: 20px;
        border-radius: 8px;
        text-align: left;
        margin-top: 30px;
      }

      .info-box h3 {
        color: #2d3748;
        margin-bottom: 10px;
        font-size: 1.1em;
      }

      .info-box ul {
        list-style: none;
        padding-left: 0;
      }

      .info-box li {
        color: #4a5568;
        padding: 8px 0;
        padding-left: 25px;
        position: relative;
      }

      .info-box li:before {
        content: '🔒';
        position: absolute;
        left: 0;
      }

      footer {
        margin-top: 40px;
        color: #a0aec0;
        font-size: 0.9em;
      }

      @media (max-width: 768px) {
        .maintenance-container {
          padding: 40px 30px;
        }

        h1 {
          font-size: 2em;
        }

        .subtitle {
          font-size: 1.1em;
        }

        .message {
          font-size: 1em;
        }

        .shield-icon {
          width: 100px;
          height: 100px;
        }
      }
    </style>
  </head>
  <body>
    <div class="maintenance-container">
      <svg class="shield-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L3 6V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V6L12 2Z" 
            stroke="#667eea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="#e6eeff"/>
        <path d="M9 12L11 14L15 10" stroke="#667eea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>

      <h1>We'll Be Right Back</h1>
        
      <div class="subtitle">Enhancing Our Security Systems</div>

      <div class="status-badge">
        🛡️ SENTINEL Security Enhancement In Progress
      </div>

      <div class="message">
        <p>We're temporarily offline while we strengthen our security infrastructure to better protect your data and our systems.</p>
        <p style="margin-top: 15px;">We sincerely apologize for any inconvenience this may cause and appreciate your patience as we work to ensure a safer experience for everyone.</p>
      </div>

      <div class="info-box">
        <h3>What's Happening:</h3>
        <ul>
          <li>Implementing enhanced security protocols</li>
          <li>Upgrading our SENTINEL defense systems</li>
          <li>Strengthening access controls</li>
          <li>Verifying system integrity</li>
        </ul>
      </div>

      <footer>
        <p><strong>Cirkle Development</strong></p>
        <p>We'll be back online shortly. Thank you for your understanding.</p>
      </footer>
    </div>

    <script>
      // Disable right-click during maintenance
      document.addEventListener('contextmenu', e => e.preventDefault());
        
      // Check backend status every 30 seconds
      setInterval(async () => {
        try {
          const response = await fetch('https://timeclock-backend.marcusray.workers.dev/api/status');
          const data = await response.json();
          if (!data.offline) {
            window.location.reload();
          }
        } catch (e) {
          // Backend still offline
        }
      }, 30000);
    </script>
  </body>
  </html>`;

      return new Response(maintenanceHTML, {
      status: 503,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Retry-After': '3600'
      }
      });
    }
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Employer login authentication
      if (path === '/api/auth/login' && request.method === 'POST') {
        const { discordId, pin } = await request.json();
        
        if (USERS[discordId] && USERS[discordId].pin === pin) {
          // Return user data (without PIN)
          const userData = { ...USERS[discordId] };
          delete userData.pin;
          return new Response(JSON.stringify({ success: true, user: userData }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } else {
          return new Response(JSON.stringify({ success: false, message: 'Invalid credentials' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      // Get employer list (without PINs - just for display)
      if (path === '/api/employers' && request.method === 'GET') {
        const employers = Object.keys(USERS).map(id => ({
          id,
          name: USERS[id].name,
          role: USERS[id].role,
          pfp: USERS[id].pfp
        }));
        
        return new Response(JSON.stringify(employers), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Send Discord webhook notification
      if (path === '/api/webhook/discord' && request.method === 'POST') {
        const webhookData = await request.json();
        
        if (DISCORD_WEBHOOK) {
          try {
            await fetch(DISCORD_WEBHOOK, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(webhookData)
            });
            
            return new Response(JSON.stringify({ success: true }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          } catch (error) {
            return new Response(JSON.stringify({ success: false, error: error.message }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
        }
        
        return new Response(JSON.stringify({ success: false, message: 'Webhook not configured' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Send Discord DM to user
      if (path === '/api/discord/dm' && request.method === 'POST') {
        const { userId, message } = await request.json();
        
        if (!DISCORD_BOT_TOKEN || DISCORD_BOT_TOKEN === 'YOUR_DISCORD_BOT_TOKEN_HERE') {
          return new Response(JSON.stringify({ success: false, message: 'Discord bot not configured' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        try {
          // Create DM channel with user
          const dmChannelResponse = await fetch('https://discord.com/api/v10/users/@me/channels', {
            method: 'POST',
            headers: {
              'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ recipient_id: userId })
          });
          
          const dmChannel = await dmChannelResponse.json();
          
          if (dmChannel.id) {
            // Send message to DM channel
            const messageResponse = await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
              method: 'POST',
              headers: {
                'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(message)
            });
            
            const result = await messageResponse.json();
            
            return new Response(JSON.stringify({ success: true, data: result }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          } else {
            return new Response(JSON.stringify({ success: false, message: 'Could not create DM channel' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
        } catch (error) {
          return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      // Get all jobs
      if (path === '/api/jobs' && request.method === 'GET') {
        const response = await fetch(`${FIREBASE_CONFIG.databaseURL}/jobs.json`);
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Create/Update job
      if (path === '/api/jobs' && request.method === 'POST') {
        const body = await request.json();
        const jobId = body.firebaseKey || Date.now().toString();
        
        const response = await fetch(
          `${FIREBASE_CONFIG.databaseURL}/jobs/${jobId}.json`,
          {
            method: 'PUT',
            body: JSON.stringify(body)
          }
        );
        
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Delete job
      if (path.startsWith('/api/jobs/') && request.method === 'DELETE') {
        const jobId = path.split('/')[3];
        
        const response = await fetch(
          `${FIREBASE_CONFIG.databaseURL}/jobs/${jobId}.json`,
          { method: 'DELETE' }
        );
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get all applications
      if (path === '/api/applications' && request.method === 'GET') {
        const response = await fetch(`${FIREBASE_CONFIG.databaseURL}/applications.json`);
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Create application
      if (path === '/api/applications' && request.method === 'POST') {
        const body = await request.json();
        
        // Use app.id as the key (generated with Date.now() + random in frontend)
        // This ensures each application has a unique, predictable key
        const appId = body.id?.toString() || Date.now().toString();
        
        const response = await fetch(
          `${FIREBASE_CONFIG.databaseURL}/applications/${appId}.json`,
          {
            method: 'PUT',
            body: JSON.stringify(body)
          }
        );
        
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Delete application
      if (path.startsWith('/api/applications/') && request.method === 'DELETE') {
        const appId = path.split('/')[3];

        const response = await fetch(
          `${FIREBASE_CONFIG.databaseURL}/applications/${appId}.json`,
          { method: 'DELETE' }
        );

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Not found
      return new Response('Not Found', { 
        status: 404,
        headers: corsHeaders
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
