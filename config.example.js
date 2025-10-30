// config.example.js - Template for config.js
// Copy this file to config.js and fill in your actual credentials

const CONFIG = {
  // Employer credentials (Discord ID -> PIN mapping)
  USERS: {
    'YOUR_DISCORD_ID_1': { pin: 'YOUR_PIN_1', role: 'Role Name', name: 'Full Name', pfp: 'Profile Picture URL' },
    'YOUR_DISCORD_ID_2': { pin: 'YOUR_PIN_2', role: 'Role Name', name: 'Full Name', pfp: 'Profile Picture URL' },
    // Add more employers as needed
  },
  
  // Discord webhook URL (optional - for application notifications)
  DISCORD_WEBHOOK: '', // Add your webhook URL here if you want notifications
  
  // Company information (public data)
  COMPANIES: ['Cirkle Development', 'Aer Lingus', 'DevDen', 'Cirkle Group Careers'],
  
  COMPANY_LOGOS: {
    'Cirkle Development': 'https://your-logo-url.png',
    'Aer Lingus': 'https://your-logo-url.png',
    'DevDen': 'https://your-logo-url.png',
    'Cirkle Group Careers': 'https://your-logo-url.png'
  }
};
