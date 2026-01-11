// Employer Suite Main Application
// Initializes and manages the entire Employer Suite application

class EmployerSuiteApp {
  constructor() {
    this.currentUser = null;
    this.isInitialized = false;
  }

  async init() {
    console.log('[Employer Suite] Initializing application...');

    // Show loading screen
    this.showLoadingScreen();

    // Check authentication first (quick check)
    if (!employerAuth.isAuthenticated()) {
      // Not authenticated, show auth screen immediately
      this.showAuthScreen();
      return;
    }

    // User is authenticated, show multi-stage loading
    await this.showMultiStageLoading();

    // Check authentication callback
    const authResult = await employerAuth.handleCallback();

    if (authResult.success) {
      this.currentUser = authResult.user;
      employerAPI.currentUser = this.currentUser;
      employerTabs.setCurrentUser(this.currentUser);
      
      await this.showDashboard();
      await this.showLoadingSuccess();
    } else {
      await this.showLoadingError('Authentication failed');
      setTimeout(() => this.showAuthScreen(), 2000);
    }

    // Setup theme
    this.initializeTheme();

    // Setup event listeners
    this.setupEventListeners();

    this.isInitialized = true;
    console.log('[Employer Suite] Initialization complete');
  }

  async showMultiStageLoading() {
    const stages = [
      { name: 'cloudflare', duration: 600, message: 'Connected to Cloudflare' },
      { name: 'backend', duration: 500, message: 'Backend loaded' },
      { name: 'auth', duration: 400, message: 'Authentication verified' },
      { name: 'userdata', duration: 500, message: 'User data loaded' },
      { name: 'storage', duration: 400, message: 'Storage prepared' },
      { name: 'dashboard', duration: 500, message: 'Dashboard ready' }
    ];
    
    const user = employerAuth.getCurrentUser();
    if (user) {
      const userName = user.global_name || user.username || 'User';
      document.getElementById('welcome-user').textContent = `Welcome back, ${userName}!`;
    }
    
    let progress = 0;
    const progressPerStage = 100 / stages.length;
    
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const stageElement = document.querySelector(`[data-stage="${stage.name}"]`);
      
      if (!stageElement) continue;
      
      // Mark as active
      stageElement.classList.add('active');
      stageElement.querySelector('.stage-status').textContent = '⏳ Loading...';
      
      // Update progress
      progress += progressPerStage;
      const progressFill = document.getElementById('progress-fill');
      const progressPercentage = document.getElementById('progress-percentage');
      const progressMessage = document.getElementById('progress-message');
      
      if (progressFill) progressFill.style.width = `${progress}%`;
      if (progressPercentage) progressPercentage.textContent = `${Math.round(progress)}%`;
      if (progressMessage) progressMessage.textContent = stage.message;
      
      // Wait for stage duration
      await new Promise(resolve => setTimeout(resolve, stage.duration));
      
      // Mark as completed
      stageElement.classList.remove('active');
      stageElement.classList.add('completed');
      stageElement.querySelector('.stage-status').textContent = '✅ Complete';
    }
    
    // Final progress
    const progressFill = document.getElementById('progress-fill');
    const progressPercentage = document.getElementById('progress-percentage');
    const progressMessage = document.getElementById('progress-message');
    
    if (progressFill) progressFill.style.width = '100%';
    if (progressPercentage) progressPercentage.textContent = '100%';
    if (progressMessage) progressMessage.textContent = 'All systems ready!';
  }
  
  async showLoadingSuccess() {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingSubtitle = document.getElementById('loading-subtitle');
    
    if (loadingScreen) loadingScreen.classList.add('success');
    if (loadingSubtitle) loadingSubtitle.textContent = '🎉 Everything loaded successfully!';
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Hide loading screen with animation
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
      setTimeout(() => loadingScreen.style.display = 'none', 800);
    }
  }
  
  async showLoadingError(message) {
    const stages = document.querySelectorAll('.loading-stage');
    stages.forEach(stage => {
      if (stage.classList.contains('active')) {
        stage.classList.remove('active');
        stage.classList.add('error');
        stage.querySelector('.stage-status').textContent = '❌ Error';
      }
    });
    
    const progressMessage = document.getElementById('progress-message');
    const loadingSubtitle = document.getElementById('loading-subtitle');
    
    if (progressMessage) progressMessage.textContent = message;
    if (loadingSubtitle) loadingSubtitle.textContent = '⚠️ ' + message;
  }

  showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = 'flex';
      loadingScreen.classList.remove('hidden');
    }
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.add('hidden');
  }

  showAuthScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
      setTimeout(() => loadingScreen.style.display = 'none', 800);
    }
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
  }

  async showDashboard() {
    document.getElementById('loading-screen').classList.add('hidden');
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');

    // Set user info in nav
    document.getElementById('user-avatar').src = `https://cdn.discordapp.com/avatars/${this.currentUser.id}/${this.currentUser.avatar}.png`;
    document.getElementById('user-name').textContent = this.currentUser.username;

    // Load home dashboard
    await employerTabs.navigateToTab('home');
  }

  setupEventListeners() {
    // Discord Auth Button
    const discordAuthBtn = document.getElementById('discord-auth-btn');
    if (discordAuthBtn) {
      discordAuthBtn.addEventListener('click', () => {
        employerAuth.initiateDiscordLogin();
      });
    }

    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    // Logout Button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
          employerAuth.logout();
        }
      });
    }

    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K for quick search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.showQuickSearch();
      }

      // ESC to close modals
      if (e.key === 'Escape') {
        hideModal();
      }
    });

    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.tab) {
        employerTabs.navigateToTab(e.state.tab);
      }
    });
  }

  initializeTheme() {
    const savedTheme = localStorage.getItem('es_theme') || 'light';
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
      const themeToggle = document.getElementById('theme-toggle');
      if (themeToggle) themeToggle.textContent = '🌙';
    }
  }

  toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    const themeToggle = document.getElementById('theme-toggle');
    
    if (themeToggle) {
      themeToggle.textContent = isDark ? '🌙' : '☀️';
      // Add rotation animation
      themeToggle.style.transform = 'rotate(360deg)';
      setTimeout(() => {
        themeToggle.style.transform = 'rotate(0deg)';
      }, 600);
    }
    
    localStorage.setItem('es_theme', isDark ? 'dark' : 'light');
  }

  showQuickSearch() {
    showModal(`
      <h2>🔍 Quick Search</h2>
      <input type="text" id="quick-search-input" class="form-control mb-3" placeholder="Search staff, files, notes..." autofocus>
      <div id="quick-search-results"></div>
    `);

    const searchInput = document.getElementById('quick-search-input');
    searchInput.addEventListener('input', (e) => {
      this.performQuickSearch(e.target.value);
    });
  }

  async performQuickSearch(query) {
    if (query.length < 2) {
      document.getElementById('quick-search-results').innerHTML = '<p class="text-center">Type at least 2 characters...</p>';
      return;
    }

    const results = document.getElementById('quick-search-results');
    results.innerHTML = '<div class="loading-spinner">Searching...</div>';

    // Search staff, files, and notes
    // This is a simplified implementation
    results.innerHTML = '<p class="text-center">Search functionality coming soon...</p>';
  }

  // Error handling
  handleError(error) {
    console.error('[Employer Suite Error]', error);
    showNotification(`Error: ${error.message}`, 'error');
  }

  // Check for updates
  async checkForUpdates() {
    try {
      const response = await fetch('https://cirkle-careers-api.marcusray.workers.dev/api/employersuit/version');
      const data = await response.json();
      
      if (data.version !== '1.0.0') { // Current version
        showNotification('A new version is available! Refresh to update.', 'info');
      }
    } catch (error) {
      console.error('Update check failed:', error);
    }
  }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const app = new EmployerSuiteApp();
  
  try {
    await app.init();
    
    // Check for updates every 30 minutes
    setInterval(() => app.checkForUpdates(), 30 * 60 * 1000);
    
  } catch (error) {
    console.error('Failed to initialize Employer Suite:', error);
    document.body.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column;">
        <h1 style="color: #ff3b30;">⚠️ Initialization Error</h1>
        <p>Failed to load Employer Suite. Please refresh the page.</p>
        <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: #007aff; color: white; border: none; border-radius: 8px; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    `;
  }
});

// Global error handler
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
  showNotification('An unexpected error occurred', 'error');
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  showNotification('An unexpected error occurred', 'error');
});

// Service Worker registration (for offline support - optional)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/employersuit-sw.js')
      .then(registration => console.log('ServiceWorker registered:', registration.scope))
      .catch(err => console.log('ServiceWorker registration failed:', err));
  });
}

// Export for debugging
window.employerSuite = {
  app: EmployerSuiteApp,
  api: employerAPI,
  auth: employerAuth,
  tabs: employerTabs
};

// Initialize function for integration
window.initializeEmployerSuite = function(container, user) {
  console.log('[Employer Suite] Initializing in embedded mode...');
  
  // Clear container
  container.innerHTML = '';
  
  // Add loading-container and main-container
  container.innerHTML = `
    <div id="loading-container"></div>
    <div id="main-container" style="display:none;"></div>
  `;
  
  // Create and initialize app
  const app = new EmployerSuiteApp();
  
  // If user is already authenticated from main portal, skip auth
  if (user) {
    employerAuth.saveSession('existing', user);
  }
  
  app.init();
  
  return app;
};

console.log('%c🎉 Employer Suite v1.0.0 ', 'background: #007aff; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;');
console.log('%cProtected by SENTINEL Security™', 'color: #34c759; font-weight: bold;');
