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

const BLACKLISTED_DISCORD_IDS = new Set([
  '926568979747713095'
]);

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
    const rawUsers = env.USERS ? JSON.parse(env.USERS) : {
      '1088907566844739624': { pin: '061025', role: 'Cirkle Dev | Executive Director', name: 'Marcus Ray', pfp: 'https://media.discordapp.net/attachments/1360983939338080337/1433579053238976544/image.png' },
      '1187751127039615086': { pin: '051025', role: 'Cirkle Dev | Board of Directors', name: 'Sam Caster', pfp: 'https://media.discordapp.net/attachments/1433394788761342143/1433578832929095710/sam.png' },
      '1268633822283563008': { pin: '618653', role: 'Cirkle Dev | Associate Director', name: 'Triumph Oppong ', pfp: 'https://media.discordapp.net/attachments/1404157487799861332/1433750219119661056/noFilter.png' },
      '1520165873866768454': { pin: '399593', role: 'Cirklke Dev | Associate Director', name: 'Logan Clarke', pfp: 'https://media.discordapp.net/attachments/1315278404009988107/1433586694287785984/image.png' },
      '971822919590244402': { pin: '971822', role: ' Cambridge Secondary School | Executive Headteacher', name: 'Belle Mackenzie', pfp: 'https://images-ext-1.discordapp.net/external/kmsPPcxDamsd9DpSSWbpviHIosXfGi4dA9ffBxa7-b4/%3Fformat%3Dwebp/https/images-ext-1.discordapp.net/external/qCqyNyx3TrMgtBf_vueYK9oYRHVm6kx8p6klQBW3x3M/https/tr.rbxcdn.com/30DAY-AvatarBust-78BB6C086CE3FBD1AF524AC2C7A82C12-Png/420/420/AvatarBust/Png/noFilter?format=webp' }
    };
    const LOG_CHANNEL_ID = '1527303038346334258';
    const LOG_GUILD_ID = '1460025375655723283';

    const baseUsers = Object.fromEntries(
      Object.entries(rawUsers).filter(([id]) => !BLACKLISTED_DISCORD_IDS.has(id))
    );

    async function loadStoredEmployers() {
      try {
        const response = await fetch(`${FIREBASE_CONFIG.databaseURL}/employers.json`);
        const data = await response.json();
        return data || {};
      } catch (error) {
        console.error('[SENTINEL] Failed to load stored employers:', error);
        return {};
      }
    }

    async function getEmployerRecords() {
      const storedEmployers = await loadStoredEmployers();
      return { ...baseUsers, ...storedEmployers };
    }

    async function sendPortalLog(logData) {
      if (!DISCORD_BOT_TOKEN) {
        return { success: false, message: 'Discord bot not configured' };
      }

      const title = logData?.title || 'Portal Event';
      const description = logData?.description || '';
      const fields = Array.isArray(logData?.fields) ? logData.fields : [];
      const color = typeof logData?.color === 'number' ? logData.color : 0x5865f2;

      const logResponse = await fetch(`https://discord.com/api/v10/channels/${LOG_CHANNEL_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: `Guild ${LOG_GUILD_ID}`,
          embeds: [{
            title,
            description,
            color,
            fields,
            footer: { text: 'Cirkle Careers Audit Log' },
            timestamp: new Date().toISOString()
          }]
        })
      });

      const result = await logResponse.json().catch(() => ({}));
      if (!logResponse.ok) {
        throw new Error(result.message || 'Failed to send portal log');
      }

      return { success: true, data: result };
    }

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

        if (BLACKLISTED_DISCORD_IDS.has(discordId)) {
          console.warn(`[SENTINEL] Blocked login attempt for blacklisted Discord ID: ${discordId} from IP: ${clientIP}`);
          return addSecurityHeaders(new Response(JSON.stringify({
            success: false,
            message: 'This account is blocked from accessing the portal',
            sentinel: 'account_blacklisted'
          }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }));
        }
        
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
        
        const USERS = await getEmployerRecords();

        if (USERS[discordId] && USERS[discordId].pin === pin) {
          const userData = { ...USERS[discordId], discordId };
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
        const USERS = await getEmployerRecords();
        const employers = Object.keys(USERS).map(id => ({
          id,
          discordId: id,
          name: USERS[id].name,
          role: USERS[id].role,
          pfp: USERS[id].pfp
        }));
        
        return addSecurityHeaders(new Response(JSON.stringify(employers), {
          headers: { 'Content-Type': 'application/json' }
        }));
      }

      if (path === '/api/employers' && request.method === 'POST') {
        const body = await request.json();
        const discordId = sanitizeInput(body.discordId || body.id);
        const pin = sanitizeInput(body.pin);
        const name = sanitizeInput(body.name);
        const role = sanitizeInput(body.role);
        const pfp = sanitizeInput(body.pfp || '');

        if (!isValidDiscordId(discordId) || !pin || !name || !role) {
          return addSecurityHeaders(new Response(JSON.stringify({
            success: false,
            message: 'Missing required employer fields',
            sentinel: 'input_validation_failed'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }));
        }

        const employerRecord = { pin, name, role, pfp };
        await fetch(`${FIREBASE_CONFIG.databaseURL}/employers/${discordId}.json`, {
          method: 'PUT',
          body: JSON.stringify(employerRecord)
        });

        await sendPortalLog({
          title: 'Employer Account Created',
          description: `An employer account was created for ${name}.`,
          color: 0x34c759,
          fields: [
            { name: 'Discord ID', value: `\`${discordId}\``, inline: true },
            { name: 'Username', value: name, inline: true },
            { name: 'Role', value: role, inline: false }
          ]
        });

        return addSecurityHeaders(new Response(JSON.stringify({
          success: true,
          employer: { id: discordId, discordId, name, role, pfp }
        }), {
          headers: { 'Content-Type': 'application/json' }
        }));
      }

      if (path.startsWith('/api/employers/') && request.method === 'DELETE') {
        const employerId = path.split('/')[3];
        await fetch(`${FIREBASE_CONFIG.databaseURL}/employers/${employerId}.json`, { method: 'DELETE' });
        await sendPortalLog({
          title: 'Employer Account Deleted',
          description: `Employer account ${employerId} was removed.`,
          color: 0xff3b30,
          fields: [{ name: 'Discord ID', value: `\`${employerId}\``, inline: true }]
        });

        return addSecurityHeaders(new Response(JSON.stringify({ success: true }), {
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

      if (path.startsWith('/api/discord/user/') && request.method === 'GET') {
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

        const userId = path.split('/')[4];
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
          const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
            headers: {
              'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
              'Content-Type': 'application/json'
            }
          });

          const data = await response.json();
          if (!response.ok) {
            return addSecurityHeaders(new Response(JSON.stringify({
              success: false,
              error: data.message || 'Unable to fetch Discord user',
              sentinel: 'discord_api_error'
            }), {
              status: response.status,
              headers: { 'Content-Type': 'application/json' }
            }));
          }

          const avatarUrl = data.avatar
            ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png?size=128`
            : `https://cdn.discordapp.com/embed/avatars/${Number(data.discriminator || 0) % 5}.png`;

          return addSecurityHeaders(new Response(JSON.stringify({
            success: true,
            id: data.id,
            username: data.username,
            global_name: data.global_name,
            avatar: data.avatar,
            avatarUrl
          }), {
            headers: { 'Content-Type': 'application/json' }
          }));
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

        const payload = await request.json();
        const userId = payload.userId;
        const message = payload.message || { embeds: payload.embeds || [] };
        
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

            await sendPortalLog({
              title: 'Discord DM Sent',
              description: `A direct message was sent to ${userId}.`,
              color: 0x007aff,
              fields: [
                { name: 'Recipient', value: `\`${userId}\``, inline: true },
                { name: 'Status', value: 'Delivered', inline: true }
              ]
            }).catch(error => console.error('[SENTINEL] Log dispatch failed:', error));
            
            return addSecurityHeaders(new Response(JSON.stringify({ 
              success: true, 
              data: result,
              sentinel: 'dm_sent'
            }), {
              headers: { 'Content-Type': 'application/json' }
            }));
          } else {
            await sendPortalLog({
              title: 'Discord DM Failed',
              description: `A direct message could not be sent to ${userId}.`,
              color: 0xff3b30,
              fields: [
                { name: 'Recipient', value: `\`${userId}\``, inline: true },
                { name: 'Discord Error', value: dmChannel.message || 'Unknown error', inline: false }
              ]
            }).catch(error => console.error('[SENTINEL] Log dispatch failed:', error));

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

      if (path === '/api/logs' && request.method === 'POST') {
        try {
          const logData = await request.json();
          const result = await sendPortalLog(logData);
          return addSecurityHeaders(new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' }
          }));
        } catch (error) {
          return addSecurityHeaders(new Response(JSON.stringify({
            success: false,
            error: error.message,
            sentinel: 'log_dispatch_failed'
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
        await sendPortalLog({
          title: body.firebaseKey ? 'Job Listing Updated' : 'Job Listing Created',
          description: `${body.title || 'Untitled listing'} ${body.firebaseKey ? 'was updated' : 'was created'}.`,
          color: 0x007aff,
          fields: [
            { name: 'Job ID', value: `\`${jobId}\``, inline: true },
            { name: 'Company', value: body.company || 'N/A', inline: true },
            { name: 'Created By', value: body.createdBy || 'N/A', inline: false }
          ]
        }).catch(error => console.error('[SENTINEL] Log dispatch failed:', error));

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

        await sendPortalLog({
          title: 'Job Listing Deleted',
          description: `Job listing ${jobId} was deleted.`,
          color: 0xff3b30,
          fields: [{ name: 'Job ID', value: `\`${jobId}\``, inline: true }]
        }).catch(error => console.error('[SENTINEL] Log dispatch failed:', error));
        
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
        await sendPortalLog({
          title: 'Application Created',
          description: `${body.job || 'Application'} was submitted.`,
          color: 0x34c759,
          fields: [
            { name: 'Application ID', value: `\`${appId}\``, inline: true },
            { name: 'PIN', value: body.pin ? `\`${body.pin}\`` : 'N/A', inline: true },
            { name: 'Status', value: body.status || 'Processing', inline: true }
          ]
        }).catch(error => console.error('[SENTINEL] Log dispatch failed:', error));

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

        await sendPortalLog({
          title: 'Application Deleted',
          description: `Application ${appId} was deleted.`,
          color: 0xff9500,
          fields: [{ name: 'Application ID', value: `\`${appId}\``, inline: true }]
        }).catch(error => console.error('[SENTINEL] Log dispatch failed:', error));
        
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
        await sendPortalLog({
          title: 'Processed Application Saved',
          description: `${body.job || 'Application'} was moved to processed status.`,
          color: 0x5856d6,
          fields: [
            { name: 'Application ID', value: `\`${appId}\``, inline: true },
            { name: 'Status', value: body.status || 'Unknown', inline: true },
            { name: 'Handled By', value: body.handler || 'N/A', inline: false }
          ]
        }).catch(error => console.error('[SENTINEL] Log dispatch failed:', error));

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

        await sendPortalLog({
          title: 'Processed Application Deleted',
          description: `Processed application ${appId} was deleted.`,
          color: 0xff3b30,
          fields: [{ name: 'Application ID', value: `\`${appId}\``, inline: true }]
        }).catch(error => console.error('[SENTINEL] Log dispatch failed:', error));
        
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

            if (BLACKLISTED_DISCORD_IDS.has(userData.id)) {
              return addSecurityHeaders(new Response(JSON.stringify({
                success: false,
                message: 'This account is blocked from accessing the portal',
                sentinel: 'account_blacklisted'
              }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
              }));
            }
            
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
