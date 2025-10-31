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
  '1028181169721839616': { pin: '227102', role: ' Aer Lingus | Recruiter', name: 'Magic', pfp: 'https://media.discordapp.net/attachments/1315278404009988107/1433586693922885692/image.png?ex=69053b26&is=6903e9a6&hm=94b6ccd2419d4c4ce18e88713264c95f258a8c9556f8b536aff3a2808a95846f&=&format=webp&quality=lossless' },
  '1246933891613200467': { pin: '421942', role: ' Aer Lingus | CEO', name: 'Carter', pfp: 'https://media.discordapp.net/attachments/1315278404009988107/1433586694287785984/image.png?ex=69053b26&is=6903e9a6&hm=45eec1ce305b323ec8d7b9a7743acf3080d4ae557ce772db764e15c6030d3d90&=&format=webp&quality=lossless' },
  '146763000701911040': { pin: '311025', role: ' Cirkle Dev | Finance Departement', name: 'Chase Johnson', pfp: 'https://media.discordapp.net/attachments/1433394788761342143/1433598236702019624/IMG_7285.png?ex=690545e6&is=6903f466&hm=b27fd08540e8ea5fcab711111096d9ac4ed4587fc5a3e35762717b0c79231ac0&=&format=webp&quality=lossless&width=620&height=960' }
};

// Discord webhook (HIDDEN from frontend)
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1433584396585271338/CjTLEfQmEPMbkeo-RLPB0lMN_gDwrOus0Pam3dGnvnwATN5pl9cItE-AyuK4a9cJRXAA';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
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
        const appId = body.firebaseKey || Date.now().toString();
        
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

      // Get all processed applications
      if (path === '/api/processed' && request.method === 'GET') {
        const response = await fetch(`${FIREBASE_CONFIG.databaseURL}/processed.json`);
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Create/Update processed application
      if (path === '/api/processed' && request.method === 'POST') {
        const body = await request.json();
        const appId = body.firebaseKey || Date.now().toString();
        
        const response = await fetch(
          `${FIREBASE_CONFIG.databaseURL}/processed/${appId}.json`,
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

      // Delete processed application
      if (path.startsWith('/api/processed/') && request.method === 'DELETE') {
        const appId = path.split('/')[3];
        
        const response = await fetch(
          `${FIREBASE_CONFIG.databaseURL}/processed/${appId}.json`,
          { method: 'DELETE' }
        );
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get all chats
      if (path === '/api/chats' && request.method === 'GET') {
        const response = await fetch(`${FIREBASE_CONFIG.databaseURL}/chats.json`);
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Update chat
      if (path.startsWith('/api/chats/') && request.method === 'POST') {
        const chatId = path.split('/')[3];
        const body = await request.json();
        
        const response = await fetch(
          `${FIREBASE_CONFIG.databaseURL}/chats/${chatId}.json`,
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
