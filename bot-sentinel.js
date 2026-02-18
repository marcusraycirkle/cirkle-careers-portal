// 🛡️ SENTINEL Security Protected Discord Bot
// Version 2.0.0 - Bot-based channel posting (replaces webhooks)
// All credentials loaded from environment variables

// Load environment variables
require('dotenv').config();

// SENTINEL Security Check
if (process.env.DISABLE_BOTS === 'true' || process.env.SUSPEND_BOTS === 'true') {
  console.log('[SENTINEL] Bot suspended via environment flag (DISABLE_BOTS/SUSPEND_BOTS). Exiting.');
  process.exit(0);
}

// Load Discord.js library
const { Client, GatewayIntentBits, EmbedBuilder, ActivityType } = require('discord.js');

// Configuration from environment variables (SECURE)
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CIRKLE_CHANNEL_ID = process.env.CIRKLE_CHANNEL_ID || '1473377571482894478';
const AER_LINGUS_CHANNEL_ID = process.env.AER_LINGUS_CHANNEL_ID || '1395759805305716848';

// Debug logging
console.log('[SENTINEL] 🔍 Environment check:');
console.log(`[SENTINEL]   - Token exists: ${!!DISCORD_BOT_TOKEN}`);
console.log(`[SENTINEL]   - Token length: ${DISCORD_BOT_TOKEN ? DISCORD_BOT_TOKEN.length : 0}`);
console.log(`[SENTINEL]   - Token starts with: ${DISCORD_BOT_TOKEN ? DISCORD_BOT_TOKEN.substring(0, 10) + '...' : 'N/A'}`);

// Validation
if (!DISCORD_BOT_TOKEN || DISCORD_BOT_TOKEN === 'YOUR_DISCORD_BOT_TOKEN_HERE') {
  console.error('[SENTINEL] ❌ Discord bot token not configured. Set DISCORD_BOT_TOKEN environment variable.');
  process.exit(1);
}

// Initialize Discord client with minimal intents for security
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

// Status messages rotation
const statuses = [
  { name: '🛡️ Protected by SENTINEL', type: ActivityType.Watching },
  { name: '🧐 Reading Applications', type: ActivityType.Watching },
  { name: '🌐 careers.cirkledevelopment.co.uk', type: ActivityType.Watching },
  { name: '🏠 Currently Serving 4 Companies', type: ActivityType.Watching }
];

let currentStatusIndex = 0;

// Bot ready event
client.once('ready', () => {
  console.log('[SENTINEL] ✅ Bot is now ONLINE and SECURED!');
  console.log(`[SENTINEL] Logged in as: ${client.user.tag}`);
  console.log('[SENTINEL] 🛡️ SENTINEL Security: ACTIVE');
  console.log(`[SENTINEL] Channel IDs configured:`);
  console.log(`[SENTINEL]   - Cirkle Development: ${CIRKLE_CHANNEL_ID}`);
  console.log(`[SENTINEL]   - Aer Lingus: ${AER_LINGUS_CHANNEL_ID}`);
  
  // Set initial status
  updateStatus();
  
  // Rotate status every 15 seconds
  setInterval(updateStatus, 15000);
});

// Handle interactions (select menus, buttons, etc.)
client.on('interactionCreate', async (interaction) => {
  try {
    if (!interaction.isStringSelectMenu()) return;

    console.log(`[SENTINEL] 🎯 Select menu interaction: ${interaction.customId} by ${interaction.user.tag}`);

    // Acknowledge the interaction immediately (required within 3 seconds)
    await interaction.deferUpdate();

    // Handle different select menu types
    // This is a placeholder - you'll need to implement the actual logic
    // based on what your select menus are supposed to do
    
    console.log(`[SENTINEL] ✅ Interaction handled for ${interaction.customId}`);
    
  } catch (error) {
    console.error('[SENTINEL] ❌ Error handling interaction:', error);
    
    // Try to respond with an error message if possible
    try {
      if (interaction.deferred) {
        await interaction.editReply({ content: '❌ An error occurred processing your selection.', ephemeral: true });
      } else if (!interaction.replied) {
        await interaction.reply({ content: '❌ An error occurred processing your selection.', ephemeral: true });
      }
    } catch (replyError) {
      console.error('[SENTINEL] ❌ Could not send error message:', replyError);
    }
  }
});

// Update bot status
function updateStatus() {
  const status = statuses[currentStatusIndex];
  client.user.setPresence({
    activities: [{ name: status.name, type: status.type }],
    status: 'online'
  });
  currentStatusIndex = (currentStatusIndex + 1) % statuses.length;
  console.log(`[SENTINEL] Status updated: ${status.name}`);
}

// Function to send application notification to appropriate channel
async function sendApplicationNotification(application, channelId) {
  try {
    const channel = await client.channels.fetch(channelId);
    
    if (!channel) {
      console.error(`[SENTINEL] ❌ Channel ${channelId} not found`);
      return { success: false, error: 'Channel not found' };
    }

    // Determine company color
    const companyColors = {
      'Cirkle Development': 0x5856d6,
      'Aer Lingus': 0x00ff00,
      'DevDen': 0xff6b6b,
      'Cirkle Group Careers': 0x007aff
    };

    const embed = new EmbedBuilder()
      .setTitle(`📝 New Application: ${application.job}`)
      .setColor(companyColors[application.company] || 0x5856d6)
      .setDescription(`**${application.name}** has applied for **${application.job}** at **${application.company}**`)
      .addFields(
        { name: '👤 Candidate', value: application.name, inline: true },
        { name: '📧 Email', value: application.email, inline: true },
        { name: '🆔 Discord', value: application.discord || 'Not provided', inline: true },
        { name: '💼 Position', value: application.job, inline: true },
        { name: '🏢 Company', value: application.company, inline: true },
        { name: '🔑 PIN', value: `\`${application.pin}\``, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: '🛡️ Protected by SENTINEL Security' });

    // Add CV info if present
    if (application.cv) {
      embed.addFields({ name: '📄 CV', value: application.cv, inline: false });
    }

    // Add custom answers if present
    if (application.answers && Object.keys(application.answers).length > 0) {
      const answersText = Object.entries(application.answers)
        .map(([q, a]) => `**Q:** ${q}\n**A:** ${a}`)
        .join('\n\n')
        .substring(0, 1000); // Discord field limit
      
      embed.addFields({ name: '📋 Responses', value: answersText || 'No responses', inline: false });
    }

    await channel.send({ embeds: [embed] });
    console.log(`[SENTINEL] ✅ Application notification sent to channel ${channelId}`);
    return { success: true };

  } catch (error) {
    console.error(`[SENTINEL] ❌ Failed to send notification:`, error);
    return { success: false, error: error.message };
  }
}

// Function to send DM to user
async function sendDM(userId, messageContent) {
  try {
    const user = await client.users.fetch(userId);
    
    if (typeof messageContent === 'string') {
      await user.send(messageContent);
    } else {
      // Support for embeds
      await user.send(messageContent);
    }
    
    console.log(`[SENTINEL] ✅ DM sent to user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error(`[SENTINEL] ❌ Failed to send DM:`, error);
    return { success: false, error: error.message };
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('[SENTINEL] 🛑 Shutting down bot gracefully...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('[SENTINEL] 🛑 Shutting down bot gracefully...');
  client.destroy();
  process.exit(0);
});

// Error handling
client.on('error', (error) => {
  console.error('[SENTINEL] ❌ Bot error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('[SENTINEL] ❌ Unhandled promise rejection:', error);
});

// Login to Discord
console.log('[SENTINEL] 🚀 Starting bot with SENTINEL Security...');
client.login(DISCORD_BOT_TOKEN).catch(err => {
  console.error('[SENTINEL] ❌ Failed to login:', err.message);
  process.exit(1);
});

// Function to broadcast announcement to multiple users
async function broadcastAnnouncement(announcementData, logChannelId = '1473734843618558006') {
  try {
    const { title, content, senderName, candidates = [] } = announcementData;
    let successCount = 0;
    let failureCount = 0;
    const failedRecipients = [];

    console.log(`[SENTINEL] 📢 Broadcasting announcement: "${title}" to ${candidates.length} candidates`);

    // Send DM to each candidate
    for (const candidate of candidates) {
      try {
        if (!candidate.discordId) {
          console.warn(`[SENTINEL] ⚠️ Candidate ${candidate.name} has no Discord ID, skipping`);
          failureCount++;
          failedRecipients.push(`${candidate.name} (no Discord ID)`);
          continue;
        }

        const user = await client.users.fetch(candidate.discordId);
        
        const embed = {
          title: `📢 ${title}`,
          description: content,
          color: 0x5856d6,
          footer: {
            text: `Message from ${senderName} | 🛡️ Protected by SENTINEL Security`,
            icon_url: client.user?.displayAvatarURL() || undefined
          },
          timestamp: new Date().toISOString()
        };

        await user.send({ embeds: [embed] });
        successCount++;
        console.log(`[SENTINEL] ✅ Announcement sent to ${candidate.name} (${candidate.discordId})`);
      } catch (error) {
        failureCount++;
        failedRecipients.push(candidate.name);
        console.error(`[SENTINEL] ❌ Failed to send announcement to ${candidate.name}:`, error.message);
      }
    }

    // Log announcement to channel
    const logChannel = await client.channels.fetch(logChannelId);
    if (logChannel) {
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
            name: '📊 Recipients',
            value: `${candidates.length} candidates`,
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

      await logChannel.send({ embeds: [logEmbed] });
      console.log(`[SENTINEL] 📝 Announcement logged to channel ${logChannelId}`);
    }

    return {
      success: true,
      totalCandidates: candidates.length,
      successCount,
      failureCount,
      failedRecipients
    };
  } catch (error) {
    console.error('[SENTINEL] ❌ Error broadcasting announcement:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export functions for external use (if needed)
module.exports = {
  sendApplicationNotification,
  sendDM,
  broadcastAnnouncement,
  CIRKLE_CHANNEL_ID,
  AER_LINGUS_CHANNEL_ID
};
