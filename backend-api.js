// Backend API Helper - Calls Cloudflare Worker instead of Firebase directly
// Replace this URL with your actual Cloudflare Worker URL after deployment
const BACKEND_URL = 'https://YOUR-WORKER-NAME.YOUR-SUBDOMAIN.workers.dev';

// Global data cache (synced with backend)
let jobs = [];
let applications = [];
let processed = [];
let chats = {};
let isBackendReady = false;

// Initialize backend data
async function initBackend() {
  console.log('Loading data from backend...');
  
  try {
    // Load all data
    await Promise.all([
      loadJobs(),
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
      await loadApplications();
      await loadProcessed();
      await loadChats();
    }, 5000);
    
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
    chats = data || {};
    console.log('Chats loaded');
  } catch (error) {
    console.error('Error loading chats:', error);
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
    const app = applications.find(a => a.pin === pin);
    if (app && app.firebaseKey) {
      await fetch(`${BACKEND_URL}/api/applications/${app.firebaseKey}`, {
        method: 'DELETE'
      });
      await loadApplications(); // Refresh applications
    }
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

// Legacy saveData function (no longer needed)
function saveData() {
  console.log('saveData() called - using backend API now');
}

// Initialize on load
initBackend();
