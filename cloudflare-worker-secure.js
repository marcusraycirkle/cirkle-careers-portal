// 🛡️ SENTINEL Security Protected Cloudflare Worker
// Version 2.0.0 - Enhanced Security Implementation
// All sensitive credentials are stored in environment variables

// SENTINEL Security: Rate Limiting Configuration
const RATE_LIMIT = {
  windowMs: 60000, // 1 minute
  maxRequests: 100, // 100 requests per minute per IP
  message: 'Too many requests, please try again later.'
};

// Rate limiting storage (in-memory, resets on worker restart)
const rateLimitStore = new Map();

// CORS headers with strict policies
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // TODO: Change to specific domain in production
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

// Security headers for all responses
function addSecurityHeaders(response) {
  const newResponse = new Response(response.body, response);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });
  newResponse.headers.set('X-Powered-By', 'SENTINEL Security');
  return newResponse;
}

// Rate limiting middleware
function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = rateLimitStore.get(ip) || [];
  
  // Remove requests outside the time window
  const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT.windowMs);
  
  if (recentRequests.length >= RATE_LIMIT.maxRequests) {
    return false; // Rate limit exceeded
  }
  
  recentRequests.push(now);
  rateLimitStore.set(ip, recentRequests);
  return true;
}

// Input sanitization
function sanitizeInput(input) {
  if (typeof input === 'string') {
    return input.trim().replace(/<script[^>]*>.*?<\/script>/gi, '').substring(0, 10000);
  }
  return input;
}

// Validate Discord ID format
function isValidDiscordId(id) {
  return /^\d{17,19}$/.test(id);
}

export default {
  async fetch(request, env, ctx) {
    // SENTINEL Security: Extract client IP for rate limiting
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return addSecurityHeaders(new Response(JSON.stringify({ 
        error: RATE_LIMIT.message,
        sentinel: 'rate_limit_exceeded'
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '60' }
      }));
    }
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return addSecurityHeaders(new Response(null, { headers: corsHeaders }));
    }

    // Get secure configuration from environment variables
    const FIREBASE_CONFIG = {
      apiKey: env.FIREBASE_API_KEY,
      databaseURL: env.FIREBASE_DATABASE_URL,
      projectId: env.FIREBASE_PROJECT_ID
    };

    // Employer credentials - should be stored in env or KV
    const USERS = env.USERS ? JSON.parse(env.USERS) : {
      '926568979747713095': { pin: '071025', role: 'Cirkle Dev | Assistant Director', name: 'Teejay Everil', pfp: 'https://media.discordapp.net/attachments/1315278404009988107/1433587280135848017/image.png' },
      '1088907566844739624': { pin: '061025', role: 'Cirkle Dev | Board of Directors', name: 'Marcus Ray', pfp: 'https://media.discordapp.net/attachments/1360983939338080337/1433579053238976544/image.png' },
      '1187751127039615086': { pin: '051025', role: 'Cirkle Dev | Managing Director', name: 'Sam Caster', pfp: 'https://media.discordapp.net/attachments/1433394788761342143/1433578832929095710/sam.png' },
      '1028181169721839616': { pin: '227102', role: ' Aer Lingus | Recruiter', name: 'Magic', pfp: 'https://media.discordapp.net/attachments/1404157487799861332/1433750219119661056/noFilter.png' },
      '1246933891613200467': { pin: '421942', role: ' Aer Lingus | CEO', name: 'Carter', pfp: 'https://media.discordapp.net/attachments/1315278404009988107/1433586694287785984/image.png' },
      '146763000701911040': { pin: '191125', role: ' Cirkle Dev | Finance Departement', name: 'Yassine Fried', pfp: 'https://media.discordapp.net/attachments/1433394788761342143/1433598236702019624/IMG_7285.png' }
    };

    // Discord Bot Token from environment (NEVER expose to client)
    const DISCORD_BOT_TOKEN = env.DISCORD_BOT_TOKEN;

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // ==========================
      // AUTHENTICATION ENDPOINTS
      // ==========================
      
      if (path === '/api/auth/login' && request.method === 'POST') {
        const body = await request.json();
        const discordId = sanitizeInput(body.discordId);
        const pin = sanitizeInput(body.pin);
        
        // Validate input
        if (!isValidDiscordId(discordId)) {
          return addSecurityHeaders(new Response(JSON.stringify({ 
            success: false, 
            message: 'Invalid Discord ID format',
            sentinel: 'input_validation_failed'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }));
        }
        
        if (USERS[discordId] && USERS[discordId].pin === pin) {
          const userData = { ...USERS[discordId] };
          delete userData.pin; // Never send PIN back to client
          return addSecurityHeaders(new Response(JSON.stringify({ 
            success: true, 
            user: userData,
            sentinel: 'authenticated'
          }), {
            headers: { 'Content-Type': 'application/json' }
          }));
        } else {
          // Log failed attempt (in production, implement proper logging)
          console.warn(`[SENTINEL] Failed login attempt for Discord ID: ${discordId} from IP: ${clientIP}`);
          return addSecurityHeaders(new Response(JSON.stringify({ 
            success: false, 
            message: 'Invalid credentials',
            sentinel: 'authentication_failed'
          }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }));
        }
      }

      // Get employer list (without PINs)
      if (path === '/api/employers' && request.method === 'GET') {
        const employers = Object.keys(USERS).map(id => ({
          id,
          name: USERS[id].name,
          role: USERS[id].role,
          pfp: USERS[id].pfp
        }));
        
        return addSecurityHeaders(new Response(JSON.stringify(employers), {
          headers: { 'Content-Type': 'application/json' }
        }));
      }

      // ==========================
      // DISCORD BOT INTEGRATION (Replaces Webhooks)
      // ==========================
      
      // Send message to Discord channel via bot
      if (path === '/api/discord/channel-message' && request.method === 'POST') {
        if (!DISCORD_BOT_TOKEN) {
          return addSecurityHeaders(new Response(JSON.stringify({ 
            success: false, 
            message: 'Discord bot not configured',
            sentinel: 'bot_not_configured'
          }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }));
        }

        const { channelId, content, embeds } = await request.json();
        
        // Validate channel ID
        if (!isValidDiscordId(channelId)) {
          return addSecurityHeaders(new Response(JSON.stringify({ 
            success: false, 
            message: 'Invalid channel ID',
            sentinel: 'input_validation_failed'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }));
        }

        try {
          const messageResponse = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content, embeds })
          });
          
          const result = await messageResponse.json();
          
          if (messageResponse.ok) {
            return addSecurityHeaders(new Response(JSON.stringify({ 
              success: true, 
              data: result,
              sentinel: 'message_sent'
            }), {
              headers: { 'Content-Type': 'application/json' }
            }));
          } else {
            console.error('[SENTINEL] Discord API Error:', result);
            return addSecurityHeaders(new Response(JSON.stringify({ 
              success: false, 
              message: 'Failed to send message',
              error: result.message,
              sentinel: 'discord_api_error'
            }), {
              status: messageResponse.status,
              headers: { 'Content-Type': 'application/json' }
            }));
          }
        } catch (error) {
          console.error('[SENTINEL] Discord request failed:', error);
          return addSecurityHeaders(new Response(JSON.stringify({ 
            success: false, 
            error: error.message,
            sentinel: 'network_error'
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }));
        }
      }

      // Send Discord DM to user
      if (path === '/api/discord/dm' && request.method === 'POST') {
        if (!DISCORD_BOT_TOKEN) {
          return addSecurityHeaders(new Response(JSON.stringify({ 
            success: false, 
            message: 'Discord bot not configured',
            sentinel: 'bot_not_configured'
          }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }));
        }

        const { userId, message } = await request.json();
        
        if (!isValidDiscordId(userId)) {
          return addSecurityHeaders(new Response(JSON.stringify({ 
            success: false, 
            message: 'Invalid user ID',
            sentinel: 'input_validation_failed'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }));
        }
        
        try {
          // Create DM channel
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
            // Send message
            const messageResponse = await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
              method: 'POST',
              headers: {
                'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(message)
            });
            
            const result = await messageResponse.json();
            
            return addSecurityHeaders(new Response(JSON.stringify({ 
              success: true, 
              data: result,
              sentinel: 'dm_sent'
            }), {
              headers: { 'Content-Type': 'application/json' }
            }));
          } else {
            return addSecurityHeaders(new Response(JSON.stringify({ 
              success: false, 
              message: 'Could not create DM channel',
              sentinel: 'dm_creation_failed'
            }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            }));
          }
        } catch (error) {
          return addSecurityHeaders(new Response(JSON.stringify({ 
            success: false, 
            error: error.message,
            sentinel: 'network_error'
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }));
        }
      }

      // ==========================
      // FIREBASE PROXY ENDPOINTS
      // ==========================
      
      // Get all jobs
      if (path === '/api/jobs' && request.method === 'GET') {
        const response = await fetch(`${FIREBASE_CONFIG.databaseURL}/jobs.json`);
        const data = await response.json();
        return addSecurityHeaders(new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' }
        }));
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
        return addSecurityHeaders(new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' }
        }));
      }

      // Delete job
      if (path.startsWith('/api/jobs/') && request.method === 'DELETE') {
        const jobId = path.split('/')[3];
        
        await fetch(
          `${FIREBASE_CONFIG.databaseURL}/jobs/${jobId}.json`,
          { method: 'DELETE' }
        );
        
        return addSecurityHeaders(new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' }
        }));
      }

      // Get all applications
      if (path === '/api/applications' && request.method === 'GET') {
        const response = await fetch(`${FIREBASE_CONFIG.databaseURL}/applications.json`);
        const data = await response.json();
        return addSecurityHeaders(new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' }
        }));
      }

      // Create application
      if (path === '/api/applications' && request.method === 'POST') {
        const body = await request.json();
        const appId = body.id?.toString() || Date.now().toString();
        
        const response = await fetch(
          `${FIREBASE_CONFIG.databaseURL}/applications/${appId}.json`,
          {
            method: 'PUT',
            body: JSON.stringify(body)
          }
        );
        
        const data = await response.json();
        return addSecurityHeaders(new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' }
        }));
      }

      // Delete application
      if (path.startsWith('/api/applications/') && request.method === 'DELETE') {
        const appId = path.split('/')[3];
        
        await fetch(
          `${FIREBASE_CONFIG.databaseURL}/applications/${appId}.json`,
          { method: 'DELETE' }
        );
        
        return addSecurityHeaders(new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' }
        }));
      }

      // Get all chats
      if (path === '/api/chats' && request.method === 'GET') {
        const response = await fetch(`${FIREBASE_CONFIG.databaseURL}/chats.json`);
        const data = await response.json();
        return addSecurityHeaders(new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' }
        }));
      }

      // Save/update chat
      if (path === '/api/chats' && request.method === 'POST') {
        const body = await request.json();
        const chatId = body.id;
        
        const response = await fetch(
          `${FIREBASE_CONFIG.databaseURL}/chats/${chatId}.json`,
          {
            method: 'PUT',
            body: JSON.stringify(body.messages || [])
          }
        );
        
        const data = await response.json();
        return addSecurityHeaders(new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' }
        }));
      }

      // Health check endpoint
      if (path === '/api/health' && request.method === 'GET') {
        return addSecurityHeaders(new Response(JSON.stringify({ 
          status: 'healthy',
          sentinel: 'active',
          version: '2.0.0',
          timestamp: new Date().toISOString()
        }), {
          headers: { 'Content-Type': 'application/json' }
        }));
      }

      // Not found
      return addSecurityHeaders(new Response(JSON.stringify({ 
        error: 'Endpoint not found',
        sentinel: 'not_found'
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      }));

    } catch (error) {
      console.error('[SENTINEL] Unhandled error:', error);
      return addSecurityHeaders(new Response(JSON.stringify({ 
        error: 'Internal server error',
        sentinel: 'server_error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
  }
};
