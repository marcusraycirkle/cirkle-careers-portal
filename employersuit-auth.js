// Employer Suite Authentication Handler
// Manages Discord OAuth flow with persistent sessions

class EmployerAuth {
  constructor() {
    // Discord Client ID will be fetched from backend or set via environment
    // DO NOT hardcode sensitive credentials here
    this.discordClientId = '1433850061363875942'; // This is safe - it's public
    this.redirectUri = encodeURIComponent(window.location.origin + '/employersuit.html');
    this.scopes = ['identify', 'guilds', 'guilds.members.read'];
    this.sessionKey = 'employersuit_session';
    this.tokenKey = 'employersuit_token';
    this.userKey = 'employersuit_user';
  }

  initiateDiscordLogin() {
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${this.discordClientId}&redirect_uri=${this.redirectUri}&response_type=code&scope=${this.scopes.join('%20')}`;
    window.location.href = authUrl;
  }

  // Check if user is already authenticated (persistent session)
  isAuthenticated() {
    const session = this.getSession();
    if (!session) return false;
    
    // Check if session is expired (24 hours)
    const expiryTime = session.expiresAt || 0;
    if (Date.now() > expiryTime) {
      this.clearSession();
      return false;
    }
    
    return !!(session.token && session.user);
  }
  
  // Get current session (works across tabs/devices)
  getSession() {
    try {
      const sessionStr = localStorage.getItem(this.sessionKey);
      return sessionStr ? JSON.parse(sessionStr) : null;
    } catch {
      return null;
    }
  }
  
  // Save session (persists across devices when using same browser profile)
  saveSession(token, user) {
    const session = {
      token,
      user,
      timestamp: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      deviceId: this.getDeviceId()
    };
    
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }
  
  // Clear session
  clearSession() {
    localStorage.removeItem(this.sessionKey);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    // Keep old keys for compatibility
    localStorage.removeItem('es_auth_token');
    localStorage.removeItem('es_user');
  }
  
  // Get device ID (for tracking multi-device sessions)
  getDeviceId() {
    let deviceId = localStorage.getItem('employersuit_device_id');
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('employersuit_device_id', deviceId);
    }
    return deviceId;
  }
  
  // Get current user
  getCurrentUser() {
    const session = this.getSession();
    return session ? session.user : null;
  }

  async handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      // Exchange code for access token (this should be done through your backend)
      const result = await this.exchangeCodeForToken(code);
      
      if (result.success) {
        // Store user data with persistent session
        this.saveSession(result.access_token, result.user);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        return {
          success: true,
          user: result.user
        };
      }
    }

    // Check existing session
    if (this.isAuthenticated()) {
      return {
        success: true,
        user: this.getCurrentUser()
      };
    }

    return { success: false };
  }

  async exchangeCodeForToken(code) {
    try {
      // This should call your backend to exchange the code securely
      const response = await fetch('https://cirkle-careers-api.marcusray.workers.dev/api/employersuit/auth/discord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          redirect_uri: decodeURIComponent(this.redirectUri)
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      return { success: false, error: error.message };
    }
  }

  logout() {
    this.clearSession();
    window.location.reload();
  }
}

// Create global instance
const employerAuth = new EmployerAuth();
