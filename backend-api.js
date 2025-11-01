// Backend API Helper - Calls Cloudflare Worker instead of Firebase directly
// Replace this URL with your actual Cloudflare Worker URL after deployment
const BACKEND_URL = 'https://cirkle-careers-api.marcusray.workers.dev';

// Global data cache (synced with backend)
let jobs = [];
let applications = [];
let processed = [];
let chats = {};
let employers = []; // loaded from backend (discordId, name, role, pfp)
let isBackendReady = false;

// Initialize backend data
async function initBackend() {
  console.log('Loading data from backend...');
  
  try {
    // Load all data
    await Promise.all([
      loadJobs(),
      loadEmployers(),
      loadApplications(),
      loadProcessed(),
      loadChats()
    ]);
    
    isBackendReady = true;
    console.log('Backend data loaded successfully');
    
    // Trigger initial render
    if (window.location.hash) {
      renderPage();
    }
    
    // Poll for updates every 5 seconds
    setInterval(async () => {
      await loadJobs();
      await loadEmployers();
      await loadApplications();
      await loadProcessed();
      await loadChats();
    }, 5000);
    
    // Check for stale applications every hour
    setInterval(async () => {
      await checkStaleApplications();
    }, 60 * 60 * 1000); // Every 1 hour
    
  } catch (error) {
    console.error('Failed to load backend data:', error);
  }
}

// Load jobs
async function loadJobs() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/jobs`);
    const data = await response.json();
    
    jobs = [];
    if (data) {
      Object.keys(data).forEach(key => {
        jobs.push({ ...data[key], firebaseKey: key });
      });
    }
    console.log('Jobs loaded:', jobs.length);
  } catch (error) {
    console.error('Error loading jobs:', error);
  }
}

// Load applications
async function loadApplications() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/applications`);
    const data = await response.json();
    
    applications = [];
    if (data) {
      Object.keys(data).forEach(key => {
        applications.push({ ...data[key], firebaseKey: key });
      });
    }
    console.log('Applications loaded:', applications.length);
  } catch (error) {
    console.error('Error loading applications:', error);
  }
}

// Load processed applications
async function loadProcessed() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/processed`);
    const data = await response.json();
    
    processed = [];
    if (data) {
      Object.keys(data).forEach(key => {
        processed.push({ ...data[key], firebaseKey: key });
      });
    }
    console.log('Processed loaded:', processed.length);
  } catch (error) {
    console.error('Error loading processed:', error);
  }
}

// Load chats
async function loadChats() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/chats`);
    const data = await response.json();
    const oldChatCount = Object.keys(chats).length;
    chats = data || {};
    const newChatCount = Object.keys(chats).length;
    console.log(`[CHAT DEBUG] Chats loaded: ${newChatCount} chats (was ${oldChatCount})`);
    if (activeChatId && chats[activeChatId]) {
      console.log(`[CHAT DEBUG] Active chat ${activeChatId} has ${chats[activeChatId].length} messages`);
    }
  } catch (error) {
    console.error('Error loading chats:', error);
  }
}

// Load employers (from worker USERS mapping)
async function loadEmployers() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/employers`);
    const data = await response.json();
    employers = data || [];
    console.log('Employers loaded:', employers.length);
  } catch (error) {
    console.error('Error loading employers:', error);
  }
}

// Save job to backend
async function saveJob(job) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job)
    });
    
    await loadJobs(); // Refresh jobs
    return await response.json();
  } catch (error) {
    console.error('Error saving job:', error);
  }
}

// Delete job from backend
async function deleteJob(jobId) {
  try {
    const job = jobs.find(j => j.id === jobId);
    if (job && job.firebaseKey) {
      await fetch(`${BACKEND_URL}/api/jobs/${job.firebaseKey}`, {
        method: 'DELETE'
      });
      await loadJobs(); // Refresh jobs
    }
  } catch (error) {
    console.error('Error deleting job:', error);
  }
}

// Save application to backend
async function saveApplication(app) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(app)
    });
    
    await loadApplications(); // Refresh applications
    return await response.json();
  } catch (error) {
    console.error('Error saving application:', error);
  }
}

// Delete application from backend
async function deleteApplication(pin) {
  try {
    // Try to find the application locally first
    let app = applications.find(a => a.pin === pin);

    // If we didn't find it (or firebaseKey is missing), reload applications and try again
    if (!app || !app.firebaseKey) {
      await loadApplications();
      app = applications.find(a => a.pin === pin);
    }

    // If still not found, fetch raw data from backend and search keys to delete by key
    if (!app || !app.firebaseKey) {
      const resp = await fetch(`${BACKEND_URL}/api/applications`);
      const data = await resp.json();
      if (data) {
        for (const key of Object.keys(data)) {
          try {
            if (data[key] && data[key].pin === pin) {
              await fetch(`${BACKEND_URL}/api/applications/${key}`, { method: 'DELETE' });
              await loadApplications();
              return;
            }
          } catch (e) { /* continue searching */ }
        }
      }
      // nothing to delete
      return;
    }

    // Delete by firebaseKey
    await fetch(`${BACKEND_URL}/api/applications/${app.firebaseKey}`, {
      method: 'DELETE'
    });
    await loadApplications(); // Refresh applications
  } catch (error) {
    console.error('Error deleting application:', error);
  }
}

// Save processed application to backend
async function saveProcessed(app) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/processed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(app)
    });
    
    await loadProcessed(); // Refresh processed
    return await response.json();
  } catch (error) {
    console.error('Error saving processed:', error);
  }
}

// Delete processed application from backend
async function deleteProcessed(pin) {
  try {
    const app = processed.find(a => a.pin === pin);
    if (app && app.firebaseKey) {
      await fetch(`${BACKEND_URL}/api/processed/${app.firebaseKey}`, {
        method: 'DELETE'
      });
      await loadProcessed(); // Refresh processed
    }
  } catch (error) {
    console.error('Error deleting processed:', error);
  }
}

// Save chat to backend
async function saveChat(chatId, messages) {
  try {
    await fetch(`${BACKEND_URL}/api/chats/${chatId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages)
    });
    
    await loadChats(); // Refresh chats
  } catch (error) {
    console.error('Error saving chat:', error);
  }
}

// Check for stale applications and send reminders
async function checkStaleApplications() {
  try {
    console.log('Checking for stale applications...');
    const response = await fetch(`${BACKEND_URL}/api/check-stale-applications`, {
      method: 'POST'
    });
    const result = await response.json();
    console.log('Stale application check result:', result);
  } catch (error) {
    console.error('Error checking stale applications:', error);
  }
}

// Legacy saveData function (no longer needed)
function saveData() {
  console.log('saveData() called - using backend API now');
}

// Initialize on load
initBackend();
