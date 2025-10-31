// Firebase Helper Functions - Replace localStorage with Firebase

// Global data cache (synced with Firebase)
let jobs = [];
let applications = [];
let processed = [];
let chats = {};
let isFirebaseReady = false;

// Initialize Firebase listeners
function initFirebase() {
  console.log('Initializing Firebase...');
  
  // Listen for jobs changes
  jobsRef.on('value', (snapshot) => {
    jobs = [];
    const data = snapshot.val();
    if (data) {
      Object.keys(data).forEach(key => {
        jobs.push({ ...data[key], firebaseKey: key });
      });
    }
    console.log('Jobs loaded from Firebase:', jobs.length);
    isFirebaseReady = true;
    // Trigger re-render if on relevant page
    if (window.location.hash.includes('employer') || window.location.hash.includes('vacancies') || window.location.hash.includes('company-jobs')) {
      renderPage();
    }
  });

  // Listen for applications changes
  applicationsRef.on('value', (snapshot) => {
    applications = [];
    const data = snapshot.val();
    if (data) {
      Object.keys(data).forEach(key => {
        applications.push({ ...data[key], firebaseKey: key });
      });
    }
    console.log('Applications loaded from Firebase:', applications.length);
    // Trigger re-render if on employer page
    if (window.location.hash.includes('employer')) {
      renderPage();
    }
  });

  // Listen for processed changes
  processedRef.on('value', (snapshot) => {
    processed = [];
    const data = snapshot.val();
    if (data) {
      Object.keys(data).forEach(key => {
        processed.push({ ...data[key], firebaseKey: key });
      });
    }
    console.log('Processed applications loaded from Firebase:', processed.length);
  });

  // Listen for chats changes
  chatsRef.on('value', (snapshot) => {
    chats = snapshot.val() || {};
    console.log('Chats loaded from Firebase');
  });
}

// Save job to Firebase
function saveJob(job) {
  if (job.firebaseKey) {
    // Update existing job
    jobsRef.child(job.firebaseKey).set({
      id: job.id,
      title: job.title,
      company: job.company,
      description: job.description,
      requirements: job.requirements,
      benefits: job.benefits,
      assignees: job.assignees,
      options: job.options,
      customQuestions: job.customQuestions,
      createdAt: job.createdAt || Date.now()
    });
  } else {
    // Create new job
    const newJobRef = jobsRef.push();
    newJobRef.set({
      id: job.id,
      title: job.title,
      company: job.company,
      description: job.description,
      requirements: job.requirements,
      benefits: job.benefits,
      assignees: job.assignees,
      options: job.options,
      customQuestions: job.customQuestions,
      createdAt: Date.now()
    });
  }
}

// Delete job from Firebase
function deleteJob(jobId) {
  const job = jobs.find(j => j.id === jobId);
  if (job && job.firebaseKey) {
    jobsRef.child(job.firebaseKey).remove();
  }
}

// Save application to Firebase
function saveApplication(app) {
  if (app.firebaseKey) {
    // Update existing application
    applicationsRef.child(app.firebaseKey).set(app);
  } else {
    // Create new application
    applicationsRef.push(app);
  }
}

// Delete application from Firebase
function deleteApplication(pin) {
  const app = applications.find(a => a.pin === pin);
  if (app && app.firebaseKey) {
    applicationsRef.child(app.firebaseKey).remove();
  }
}

// Save processed application to Firebase
function saveProcessed(app) {
  if (app.firebaseKey) {
    processedRef.child(app.firebaseKey).set(app);
  } else {
    processedRef.push(app);
  }
}

// Delete processed application from Firebase
function deleteProcessed(pin) {
  const app = processed.find(a => a.pin === pin);
  if (app && app.firebaseKey) {
    processedRef.child(app.firebaseKey).remove();
  }
}

// Save chat to Firebase
function saveChat(pin, messages) {
  chatsRef.child(pin).set(messages);
}

// Legacy localStorage functions (for backward compatibility)
function saveData() {
  // No longer needed - Firebase auto-saves
  console.log('saveData() called - using Firebase now');
}

// Initialize on load
if (typeof firebase !== 'undefined') {
  initFirebase();
} else {
  console.error('Firebase not loaded! Please check firebase-config.js');
}
