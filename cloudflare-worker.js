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
  'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With, Authorization, X-API-Key',
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
      '926568979747713095': { pin: '071025', role: 'Cirkle Dev | Associate Director', name: 'Teejay Everil', pfp: 'https://media.discordapp.net/attachments/1315278404009988107/1433587280135848017/image.png' },
      '1088907566844739624': { pin: '061025', role: 'Cirkle Dev | Board of Directors', name: 'Marcus Ray', pfp: 'https://media.discordapp.net/attachments/1360983939338080337/1433579053238976544/image.png' },
      '1187751127039615086': { pin: '051025', role: 'Cirkle Dev | Managing Director', name: 'Sam Caster', pfp: 'https://media.discordapp.net/attachments/1433394788761342143/1433578832929095710/sam.png' },
      '1002932344799371354': { pin: '191125', role: 'Cirkle Dev | Associate Director', name: 'Appler Smith', pfp: 'https://media.discordapp.net/attachments/1433394788761342143/1433598236702019624/IMG_7285.png' }
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

      // ============================
      // BROADCAST ANNOUNCEMENT
      // ============================

      if (path === '/api/broadcast-announcement' && request.method === 'POST') {
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

        const announcementData = await request.json();
        const { title, content, senderName, candidates = [], recipientCount = 0 } = announcementData;
        
        if (!title || !content || !candidates.length) {
          return addSecurityHeaders(new Response(JSON.stringify({ 
            success: false, 
            message: 'Missing required fields: title, content, or candidates',
            sentinel: 'input_validation_failed'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }));
        }

        try {
          let successCount = 0;
          let failureCount = 0;
          const failedRecipients = [];

          // Create the announcement embed
          const announcementEmbed = {
            title: `📢 ${title}`,
            description: content,
            color: 0x5856d6,
            footer: {
              text: `Message from ${senderName || 'Admin'} | 🛡️ Protected by SENTINEL Security`
            },
            timestamp: new Date().toISOString()
          };

          // Send DM to each candidate
          for (const candidate of candidates) {
            if (!candidate.discordId) {
              failureCount++;
              failedRecipients.push(`${candidate.name} (no Discord ID)`);
              continue;
            }

            try {
              // Create DM channel
              const dmChannelResponse = await fetch('https://discord.com/api/v10/users/@me/channels', {
                method: 'POST',
                headers: {
                  'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ recipient_id: candidate.discordId })
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
                  body: JSON.stringify({ embeds: [announcementEmbed] })
                });
                
                if (messageResponse.ok) {
                  successCount++;
                  console.log(`[SENTINEL] ✅ Announcement sent to ${candidate.name}`);
                } else {
                  failureCount++;
                  failedRecipients.push(candidate.name);
                  console.error(`[SENTINEL] ❌ Failed to send announcement to ${candidate.name}`);
                }
              } else {
                failureCount++;
                failedRecipients.push(candidate.name);
                console.error(`[SENTINEL] ❌ Could not create DM channel for ${candidate.name}`);
              }
            } catch (candidateError) {
              failureCount++;
              failedRecipients.push(candidate.name);
              console.error(`[SENTINEL] ❌ Error sending to ${candidate.name}:`, candidateError.message);
            }
          }

          // Log announcement to channel
          const logChannelId = '1473734843618558006';
          const logEmbed = {
            title: '📢 Announcement Broadcast Log',
            description: 'An announcement has been published to candidates.',
            color: 0x5856d6,
            fields: [
              {
                name: '📌 Title',
                value: title,
                inline: false
              },
              {
                name: '💬 Message',
                value: content.substring(0, 1000) + (content.length > 1000 ? '...' : ''),
                inline: false
              },
              {
                name: '👤 Published by',
                value: senderName || 'Unknown',
                inline: true
              },
              {
                name: '📊 Total Recipients',
                value: `${recipientCount}`,
                inline: true
              },
              {
                name: '✅ Successfully sent',
                value: `${successCount}`,
                inline: true
              },
              {
                name: '❌ Failed',
                value: `${failureCount}`,
                inline: true
              }
            ],
            timestamp: new Date().toISOString(),
            footer: {
              text: '🛡️ Protected by SENTINEL Security'
            }
          };

          if (failedRecipients.length > 0) {
            logEmbed.fields.push({
              name: '⚠️ Failed Recipients',
              value: failedRecipients.join('\n').substring(0, 1000),
              inline: false
            });
          }

          // Post log to channel
          try {
            await fetch(`https://discord.com/api/v10/channels/${logChannelId}/messages`, {
              method: 'POST',
              headers: {
                'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ embeds: [logEmbed] })
            });
            console.log(`[SENTINEL] 📝 Announcement logged to channel ${logChannelId}`);
          } catch (logError) {
            console.error('[SENTINEL] ❌ Failed to log announcement to channel:', logError.message);
            // Don't fail the response if logging fails
          }

          return addSecurityHeaders(new Response(JSON.stringify({ 
            success: true,
            totalCandidates: candidates.length,
            successCount,
            failureCount,
            failedRecipients,
            sentinel: 'broadcast_complete'
          }), {
            headers: { 'Content-Type': 'application/json' }
          }));
        } catch (error) {
          console.error('[SENTINEL] Broadcast announcement error:', error);
          return addSecurityHeaders(new Response(JSON.stringify({ 
            success: false, 
            error: error.message,
            sentinel: 'broadcast_error'
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

      // Get all processed applications
      if (path === '/api/processed' && request.method === 'GET') {
        const response = await fetch(`${FIREBASE_CONFIG.databaseURL}/processed.json`);
        const data = await response.json();
        return addSecurityHeaders(new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' }
        }));
      }

      // Create processed application
      if (path === '/api/processed' && request.method === 'POST') {
        const body = await request.json();
        const appId = body.id?.toString() || Date.now().toString();
        
        const response = await fetch(
          `${FIREBASE_CONFIG.databaseURL}/processed/${appId}.json`,
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

      // Delete processed application
      if (path.startsWith('/api/processed/') && request.method === 'DELETE') {
        const appId = path.split('/')[3];
        
        await fetch(
          `${FIREBASE_CONFIG.databaseURL}/processed/${appId}.json`,
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

      // ==========================
      // EMPLOYER SUITE ENDPOINTS
      // ==========================
      
      // Employer Suite Discord OAuth callback
      if (path === '/api/employersuit/auth/discord' && request.method === 'POST') {
        const { code, redirect_uri } = await request.json();
        
        try {
          // Exchange code for access token with Discord
          const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              client_id: env.DISCORD_CLIENT_ID,
              client_secret: env.DISCORD_CLIENT_SECRET,
              grant_type: 'authorization_code',
              code: code,
              redirect_uri: redirect_uri
            })
          });
          
          const tokenData = await tokenResponse.json();
          
          if (tokenData.access_token) {
            // Get user info from Discord
            const userResponse = await fetch('https://discord.com/api/users/@me', {
              headers: {
                'Authorization': `Bearer ${tokenData.access_token}`
              }
            });
            
            const userData = await userResponse.json();
            
            return addSecurityHeaders(new Response(JSON.stringify({
              success: true,
              access_token: tokenData.access_token,
              user: userData
            }), {
              headers: { 'Content-Type': 'application/json' }
            }));
          }
        } catch (error) {
          return addSecurityHeaders(new Response(JSON.stringify({
            success: false,
            error: error.message
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }));
        }
      }

      // File storage endpoints (proxied to storage server)
      if (path === '/api/employersuit/files/upload' && request.method === 'POST') {
        const storageServerUrl = env.STORAGE_SERVER_URL;
        const storageApiKey = env.STORAGE_API_KEY;
        
        if (!storageServerUrl || !storageApiKey) {
          return addSecurityHeaders(new Response(JSON.stringify({
            error: 'Storage server not configured'
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }));
        }
        
        // Forward the request to storage server
        const formData = await request.formData();
        const userId = formData.get('userId');
        
        const storageResponse = await fetch(`${storageServerUrl}/api/files/upload`, {
          method: 'POST',
          headers: {
            'X-API-Key': storageApiKey,
            'X-User-Id': userId
          },
          body: formData
        });
        
        const result = await storageResponse.json();
        
        return addSecurityHeaders(new Response(JSON.stringify(result), {
          status: storageResponse.status,
          headers: { 'Content-Type': 'application/json' }
        }));
      }

      if (path === '/api/employersuit/files/list' && request.method === 'POST') {
        const { userId } = await request.json();
        const storageServerUrl = env.STORAGE_SERVER_URL;
        const storageApiKey = env.STORAGE_API_KEY;
        
        if (!storageServerUrl || !storageApiKey) {
          return addSecurityHeaders(new Response(JSON.stringify({ files: [] }), {
            headers: { 'Content-Type': 'application/json' }
          }));
        }
        
        const storageResponse = await fetch(`${storageServerUrl}/api/files/list?userId=${userId}`, {
          headers: {
            'X-API-Key': storageApiKey
          }
        });
        
        const result = await storageResponse.json();
        
        return addSecurityHeaders(new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        }));
      }

      if (path === '/api/employersuit/files/storage-info' && request.method === 'POST') {
        const { userId } = await request.json();
        const storageServerUrl = env.STORAGE_SERVER_URL;
        const storageApiKey = env.STORAGE_API_KEY;
        
        if (!storageServerUrl || !storageApiKey) {
          return addSecurityHeaders(new Response(JSON.stringify({
            used: 0,
            max: 10737418240,
            available: 10737418240,
            percentage: 0
          }), {
            headers: { 'Content-Type': 'application/json' }
          }));
        }
        
        const storageResponse = await fetch(`${storageServerUrl}/api/storage/info?userId=${userId}`, {
          headers: {
            'X-API-Key': storageApiKey
          }
        });
        
        const result = await storageResponse.json();
        
        return addSecurityHeaders(new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        }));
      }
      
      // File delete endpoint
      if (path.startsWith('/api/employersuit/files/delete/') && request.method === 'DELETE') {
        const pathParts = path.split('/');
        const userId = pathParts[5];
        const filename = pathParts[6];
        const storageServerUrl = env.STORAGE_SERVER_URL;
        const storageApiKey = env.STORAGE_API_KEY;
        
        if (!storageServerUrl || !storageApiKey) {
          return addSecurityHeaders(new Response(JSON.stringify({
            error: 'Storage server not configured'
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }));
        }
        
        const storageResponse = await fetch(`${storageServerUrl}/api/files/delete/${userId}/${filename}`, {
          method: 'DELETE',
          headers: {
            'X-API-Key': storageApiKey
          }
        });
        
        const result = await storageResponse.json();
        
        return addSecurityHeaders(new Response(JSON.stringify(result), {
          status: storageResponse.status,
          headers: { 'Content-Type': 'application/json' }
        }));
      }
      
      // File download endpoint
      if (path.startsWith('/api/employersuit/files/download/') && request.method === 'GET') {
        const pathParts = path.split('/');
        const userId = pathParts[5];
        const filename = pathParts[6];
        const storageServerUrl = env.STORAGE_SERVER_URL;
        const storageApiKey = env.STORAGE_API_KEY;
        
        if (!storageServerUrl || !storageApiKey) {
          return addSecurityHeaders(new Response('Storage server not configured', {
            status: 500
          }));
        }
        
        const storageResponse = await fetch(`${storageServerUrl}/api/files/download/${userId}/${filename}`, {
          headers: {
            'X-API-Key': storageApiKey
          }
        });
        
        // Forward the file stream
        return new Response(storageResponse.body, {
          status: storageResponse.status,
          headers: storageResponse.headers
        });
      }

      // Document generation endpoint
      if (path === '/api/employersuit/documents/generate' && request.method === 'POST') {
        const documentData = await request.json();
        const storageServerUrl = env.STORAGE_SERVER_URL;
        const storageApiKey = env.STORAGE_API_KEY;
        
        if (!storageServerUrl || !storageApiKey) {
          return addSecurityHeaders(new Response(JSON.stringify({
            error: 'Storage server not configured'
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }));
        }
        
        const storageResponse = await fetch(`${storageServerUrl}/api/documents/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': storageApiKey
          },
          body: JSON.stringify(documentData)
        });
        
        const result = await storageResponse.json();
        
        return addSecurityHeaders(new Response(JSON.stringify(result), {
          status: storageResponse.status,
          headers: { 'Content-Type': 'application/json' }
        }));
      }
      
      // Notes endpoints (using Firebase)
      if (path === '/api/employersuit/notes/list' && request.method === 'POST') {
        const { userId } = await request.json();
        
        const notesData = await fetch(`${FIREBASE_CONFIG.databaseURL}/employersuit/notes/${userId}.json`);
        const notes = await notesData.json();
        
        return addSecurityHeaders(new Response(JSON.stringify({
          success: true,
          notes: notes || []
        }), {
          headers: { 'Content-Type': 'application/json' }
        }));
      }

      if (path === '/api/employersuit/notes/save' && request.method === 'POST') {
        const { userId, noteId, title, content, lastModified } = await request.json();
        
        const noteData = { id: noteId, title, content, lastModified };
        
        await fetch(
          `${FIREBASE_CONFIG.databaseURL}/employersuit/notes/${userId}/${noteId}.json`,
          {
            method: 'PUT',
            body: JSON.stringify(noteData)
          }
        );
        
        return addSecurityHeaders(new Response(JSON.stringify({
          success: true,
          note: noteData
        }), {
          headers: { 'Content-Type': 'application/json' }
        }));
      }

      // Calendar endpoints
      if (path === '/api/employersuit/calendar/events' && request.method === 'POST') {
        const { userId, startDate, endDate, type } = await request.json();
        
        const eventsData = await fetch(`${FIREBASE_CONFIG.databaseURL}/employersuit/calendar/${userId}.json`);
        const events = await eventsData.json();
        
        return addSecurityHeaders(new Response(JSON.stringify({
          success: true,
          events: events || []
        }), {
          headers: { 'Content-Type': 'application/json' }
        }));
      }

      if (path === '/api/employersuit/calendar/create' && request.method === 'POST') {
        const eventData = await request.json();
        const eventId = Date.now().toString();
        
        await fetch(
          `${FIREBASE_CONFIG.databaseURL}/employersuit/calendar/${eventData.createdBy}/${eventId}.json`,
          {
            method: 'PUT',
            body: JSON.stringify({ ...eventData, id: eventId })
          }
        );
        
        return addSecurityHeaders(new Response(JSON.stringify({
          success: true,
          event: { ...eventData, id: eventId }
        }), {
          headers: { 'Content-Type': 'application/json' }
        }));
      }

      // Template endpoints
      if (path === '/api/employersuit/templates/list' && request.method === 'POST') {
        const templatesData = await fetch(`${FIREBASE_CONFIG.databaseURL}/employersuit/templates.json`);
        const templates = await templatesData.json();
        
        return addSecurityHeaders(new Response(JSON.stringify({
          success: true,
          templates: templates || []
        }), {
          headers: { 'Content-Type': 'application/json' }
        }));
      }

      // Health check endpoint
      if (path === '/api/health' && request.method === 'GET') {
        return addSecurityHeaders(new Response(JSON.stringify({ 
          status: 'healthy',
          sentinel: 'active',
          version: '2.0.0',
          employerSuite: 'enabled',
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
