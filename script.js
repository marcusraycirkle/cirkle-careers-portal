// script.js - Organized Layout, Professional, No Initial Data, Refined Payment

// Data Structures (LocalStorage)
const USERS = {
  '926568979747713095': { pin: '071025', role: 'Assistant Director', name: 'Teejay', pfp: 'https://via.placeholder.com/50?text=TJ' },
  '1088907566844739624': { pin: '061025', role: 'Board of Directors', name: 'Marcus', pfp: 'https://via.placeholder.com/50?text=M' },
  '1187751127039615086': { pin: '051025', role: 'Managing Director', name: 'Sam', pfp: 'https://via.placeholder.com/50?text=S' }
};
const COMPANIES = ['Cirkle Development', 'Aer Lingus', 'DevDen', 'Cirkle Group Careers'];
let currentUser = null;
let jobs = JSON.parse(localStorage.getItem('jobs')) || [];
let applications = JSON.parse(localStorage.getItem('applications')) || [];
let processed = JSON.parse(localStorage.getItem('processed')) || [];
let chats = JSON.parse(localStorage.getItem('chats')) || {};
const faqs = [
  { q: 'What is Cirkle?', a: 'A company.' },
  { q: 'How to apply?', a: 'Click apply.' },
  { q: 'Benefits?', a: 'Many.' },
  { q: 'Contact?', a: 'Email us.' }
];

// Utility Functions
function saveData() {
  localStorage.setItem('jobs', JSON.stringify(jobs));
  localStorage.setItem('applications', JSON.stringify(applications));
  localStorage.setItem('processed', JSON.stringify(processed));
  localStorage.setItem('chats', JSON.stringify(chats));
}

function generatePin() {
  return Math.random().toString(36).substr(2, 12).toUpperCase();
}

function playSuccessSound() {
  document.getElementById('success-sound')?.play();
}

function showNotification(msg) {
  const notif = document.getElementById('notification');
  if (notif) {
    notif.textContent = msg;
    notif.classList.remove('hidden');
    setTimeout(() => notif.classList.add('hidden'), 3000);
  }
}

function showPopup(content, fullScreen = false) {
  const overlay = document.getElementById('popup-overlay');
  const popup = document.getElementById('popup');
  if (overlay && popup) {
    popup.innerHTML = content + '<button class="close-popup" style="position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:1.5rem;cursor:pointer;">×</button>';
    if (fullScreen) popup.style.maxWidth = '100%';
    overlay.classList.remove('hidden');
    popup.classList.remove('hidden');
    document.querySelector('.close-popup')?.addEventListener('click', hidePopup);
  }
}

function hidePopup() {
  const overlay = document.getElementById('popup-overlay');
  const popup = document.getElementById('popup');
  if (overlay && popup) {
    overlay.classList.add('hidden');
    popup.classList.add('hidden');
  }
}

function showLoading() {
  const overlay = document.getElementById('popup-overlay');
  if (overlay) {
    overlay.innerHTML = '<div class="loading-overlay"><div style="border:4px solid #f3f3f3;border-top:4px solid #3498db;border-radius:50%;width:40px;height:40px;animation:spin 2s linear infinite;"></div></style><style>@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style></div>';
    overlay.classList.remove('hidden');
  }
}

// Routing
function navigate(hash) {
  window.location.hash = hash;
  renderPage();
}

window.addEventListener('hashchange', renderPage);
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('employer-login-btn')?.addEventListener('click', () => {
    document.getElementById('login-dropdown')?.classList.toggle('hidden');
  });
  document.getElementById('login-submit')?.addEventListener('click', login);
  document.querySelectorAll('[data-nav]')?.forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.nav));
  });
  // Home Background Fade
  const images = ['https://via.placeholder.com/1400x300?text=Professional+Img1', 'https://via.placeholder.com/1400x300?text=Professional+Img2'];
  let idx = 0;
  setInterval(() => {
    const imgs = document.querySelectorAll('.background-images img');
    if (imgs.length) {
      imgs[idx].classList.remove('active');
      idx = (idx + 1) % images.length;
      imgs[idx].classList.add('active');
    }
  }, 2000);
  renderPage();
});

async function login() {
  const id = document.getElementById('discord-id')?.value;
  const pin = document.getElementById('pin')?.value;
  const loading = document.getElementById('login-loading');
  if (loading) {
    loading.classList.remove('hidden');
    setTimeout(async () => {
      if (USERS[id] && USERS[id].pin === pin) {
        currentUser = USERS[id];
        loading.textContent = 'Profile fetched!';
        setTimeout(() => navigate('employerportal/home'), 1000);
      } else {
        alert('Invalid credentials');
        loading.classList.add('hidden');
      }
    }, 3000);
  }
}

// Roblox Fetch
async function fetchRoblox(id) {
  try {
    return { username: 'DemoUser', avatar: 'https://via.placeholder.com/50' };
  } catch (e) {
    return { username: id, avatar: 'https://via.placeholder.com/50?text=R' };
  }
}

// Render Pages
function renderPage() {
  const hash = window.location.hash.slice(1) || 'home';
  const main = document.getElementById('main-content');
  if (main) {
    main.innerHTML = '';
    main.style.animation = 'fadeIn 0.5s ease-in';
    if (hash.startsWith('employerportal/')) {
      if (!currentUser) return navigate('home');
      renderEmployerPage(hash.split('/')[1]);
    } else {
      switch (hash) {
        case 'home': renderHome(); break;
        case 'vacancies': renderVacancies(); break;
        case 'information': renderInformation(); break;
        case 'candidate-status': renderCandidateStatus(); break;
        default: renderHome();
      }
    }
  }
}

function renderHome() {
  const main = document.getElementById('main-content');
  if (main) {
    main.innerHTML = `
      <h1 style="font-size:2.5rem; font-weight:700; margin-bottom:1rem;">Cirkle Development Careers</h1>
      <div class="background-images">
        <img src="https://via.placeholder.com/1400x300?text=Img1" class="active">
        <img src="https://via.placeholder.com/1400x300?text=Img2">
      </div>
      <p style="font-size:1.1rem; max-width:800px; margin:0 auto 1.5rem;">Welcome to the official career portal for Cirkle Development and its subsidiaries. Explore job listings and more!</p>
      <button class="big" onclick="navigate('vacancies')">View Openings</button>
    `;
  }
}

function renderVacancies() {
  const main = document.getElementById('main-content');
  if (main) {
    main.innerHTML = `<h2 style="font-size:2rem; font-weight:600; margin-bottom:1rem;">Available Vacancies</h2>
      <img src="https://via.placeholder.com/1400x200?text=Banner" alt="Banner" style="border-radius:16px; margin-bottom:1.5rem; width:100%;">`;
    COMPANIES.forEach(company => {
      const count = jobs.filter(j => j.company === company && j.active).length;
      const row = document.createElement('div');
      row.classList.add('row');
      row.innerHTML = `<img src="https://via.placeholder.com/56?text=${company[0]}" alt="${company}">
        <span class="name">${company}</span>
        <span class="count">${count}</span>`;
      row.addEventListener('click', () => renderCompanyJobs(company));
      main.appendChild(row);
    });
  }
}

function renderCompanyJobs(company) {
  const main = document.getElementById('main-content');
  if (main) {
    main.innerHTML = `<h1 style="font-size:2.5rem; font-weight:700;">${company}</h1><img src="https://via.placeholder.com/1400x200?text=${company}+Banner" alt="Banner" style="border-radius:16px; width:100%; margin-bottom:1.5rem;">`;
    const list = jobs.filter(j => j.company === company && j.active);
    if (list.length === 0) {
      main.innerHTML += '<p style="font-size:1.1rem; color:#6e6e73;">No openings available.</p>';
    }
    list.forEach(job => {
      const item = document.createElement('div');
      item.classList.add('row');
      item.innerHTML = `<span class="name">${job.title}</span>`;
      item.addEventListener('click', () => showJobPopup(job));
      main.appendChild(item);
    });
  }
}

function showJobPopup(job) {
  if (job) {
    job.clicks++;
    saveData();
    showPopup(`
      <h2 style="font-size:2rem; font-weight:600;">${job.title}</h2>
      <p>${job.description}</p>
      <p>Payment: ${job.payment}</p>
      <button class="big" onclick="applyForJob(${job.id})" style="width:100%;">Apply Now!</button>
    `);
  }
}

function applyForJob(jobId) {
  const job = jobs.find(j => j.id === jobId);
  if (job) {
    let content = `<h2 style="font-size:2rem; font-weight:600;">Apply for ${job.title}</h2><p>${job.description}</p>`;
    if (job.options.name) content += '<input type="text" id="app-name" placeholder="Your Name" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:1rem;"><br>';
    if (job.options.email) content += '<input type="email" id="app-email" placeholder="Your Email" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:1rem;"><br>';
    if (job.options.discord) content += '<input type="text" id="app-discord" placeholder="Discord ID" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:0.5rem;"><button onclick="searchDiscord()" style="width:100%; margin-bottom:1rem;">Search Profile</button><br>';
    if (job.options.roblox) content += '<input type="text" id="app-roblox" placeholder="Roblox ID" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:0.5rem;"><button onclick="searchRoblox()" style="width:100%; margin-bottom:1rem;">Search Profile</button><br>';
    if (job.options.cv) content += '<label for="app-cv" style="display:block; margin-bottom:0.5rem;">Upload CV</label><input type="file" id="app-cv" style="width:100%; margin-bottom:1rem;"><br>';
    if (job.options.experience) content += '<textarea id="app-experience" placeholder="Past Experience (max 3000 chars)" maxlength="3000" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:1rem; height:150px;"></textarea><br>';
    job.questions.forEach((q, i) => {
      content += `<h3 style="font-size:1.3rem; font-weight:600; margin-top:1.5rem;">${q.title}</h3><p style="color:#6e6e73;">${q.desc || ''}</p>`;
      if (q.type === 'short') content += `<input type="text" id="q-${i}" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:1rem;"><br>`;
      if (q.type === 'paragraph') content += `<textarea id="q-${i}" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:1rem; height:120px;"></textarea><br>`;
      if (q.type === 'multiple' || q.type === 'multi') {
        q.options.forEach(opt => {
          content += `<label style="display:block; margin-bottom:0.5rem;"><input type="${q.type === 'multiple' ? 'radio' : 'checkbox'}" name="q-${i}" value="${opt}">${opt}</label>`;
        });
        content += '<br>';
      }
    });
    content += '<button class="big" onclick="submitApplication(' + jobId + ')" style="width:100%;">Submit Application</button>';
    showPopup(content, true);
  }
}

async function searchDiscord() {
  const id = document.getElementById('app-discord')?.value;
  if (id) showNotification(`Fetched Discord profile for ID: ${id}`);
}

async function searchRoblox() {
  const id = document.getElementById('app-roblox')?.value;
  if (id) {
    const data = await fetchRoblox(id);
    showNotification(`Fetched Roblox profile: ${data.username}`);
  }
}

function submitApplication(jobId) {
  showLoading();
  setTimeout(() => {
    const app = { id: Date.now(), jobId, data: {}, pin: generatePin(), status: 'Pending', handler: '' };
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      if (job.options.name) app.data.name = document.getElementById('app-name')?.value || '';
      if (job.options.email) app.data.email = document.getElementById('app-email')?.value || '';
      if (job.options.discord) app.data.discord = document.getElementById('app-discord')?.value || '';
      if (job.options.roblox) app.data.roblox = document.getElementById('app-roblox')?.value || '';
      if (job.options.cv) app.data.cv = document.getElementById('app-cv')?.files[0] ? 'CV attached' : '';
      if (job.options.experience) app.data.experience = document.getElementById('app-experience')?.value || '';
      job.questions.forEach((q, i) => {
        if (q.type === 'short' || q.type === 'paragraph') app.data[q.title] = document.getElementById(`q-${i}`)?.value || '';
        else if (q.type === 'multiple' || q.type === 'multi') {
          const selected = document.querySelectorAll(`input[name="q-${i}"]:checked`);
          app.data[q.title] = Array.from(selected).map(input => input.value).join(', ');
        }
      });
      job.submissions++;
      applications.push(app);
      saveData();
      hidePopup();
      showPopup(`Successfully submitted. Your PIN: ${app.pin}. Keep it safe to check status.`, false);
    }
  }, 2000);
}

function renderCandidateStatus() {
  showPopup('<input type="text" id="status-pin" placeholder="Enter your 12-digit PIN" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:1rem;"><button class="big" onclick="checkStatus()" style="width:100%;">Check Status</button>');
}

function checkStatus() {
  const pin = document.getElementById('status-pin')?.value;
  if (pin) {
    const app = applications.find(a => a.pin === pin) || processed.find(h => h.pin === pin);
    if (app) {
      let msg = `<h2>Application Status</h2><p>Status: ${app.status}</p>`;
      if (app.status === 'Rejected') msg += `<p>Reason: ${app.reason || 'Not provided'}</p>`;
      if (app.status === 'Hired') msg += '<p>Congratulations!</p>';
      showPopup(msg);
    } else {
      alert('Invalid PIN');
    }
  }
}

function renderInformation() {
  const main = document.getElementById('main-content');
  if (main) {
    main.innerHTML = '<h2 style="font-size:2rem; font-weight:600; margin-bottom:1.5rem;">Information & FAQs</h2>';
    faqs.forEach(faq => {
      const row = document.createElement('div');
      row.classList.add('faq-row');
      row.innerHTML = `<span style="margin-right:1.25rem; font-size:1.4rem; color:#007aff;">?</span> <span style="font-weight:600;">${faq.q}</span> <span class="arrow">⌄</span>
        <div class="dropdown-content hidden">${faq.a}</div>`;
      row.addEventListener('click', () => {
        row.classList.toggle('expanded');
        row.querySelector('.dropdown-content').classList.toggle('hidden');
      });
      main.appendChild(row);
    });
  }
}

// Employer
function renderEmployerPage(page) {
  const main = document.getElementById('main-content');
  if (main) {
    main.id = 'employer-dashboard';
    main.innerHTML = `
      <div style="display:flex; align-items:center; margin-bottom:2rem;">
        <img src="${currentUser.pfp}" alt="PFP" style="border-radius:50%; width:56px; height:56px; margin-right:1rem;">
        <div>
          <h2 style="font-size:2rem; font-weight:600; margin:0;">Welcome, ${currentUser.name}</h2>
          <p style="font-size:1rem; color:#6e6e73; margin:0;">${currentUser.role}</p>
        </div>
      </div>`;
    if (!document.querySelector('.side-menu')) {
      const menu = document.createElement('div');
      menu.classList.add('side-menu');
      menu.innerHTML = `
        <button data-emp="dashboard">Dashboard</button>
        <button data-emp="candidates">Candidate Management</button>
        <button data-emp="jobs">Job Listings</button>`;
      document.body.appendChild(menu);
      setTimeout(() => menu.classList.add('open'), 100);
    }
    document.querySelectorAll('[data-emp]')?.forEach(btn => {
      btn.addEventListener('click', () => renderEmployerSubPage(btn.dataset.emp));
    });
    renderEmployerSubPage(page || 'dashboard');
  }
}

function renderEmployerSubPage(sub) {
  const contentArea = document.getElementById('employer-dashboard') || document.getElementById('main-content');
  if (contentArea) {
    let subContent = '';
    switch (sub) {
      case 'dashboard':
        subContent += '<div class="box"><h3>Tasks Assigned to you:</h3><ul style="list-style:none; padding:0;">' + applications.filter(a => jobs.find(j => j.id === a.jobId)?.assigned.includes(currentUser.name)).map(a => `<li style="padding:0.5rem 0; border-bottom:1px solid #f2f2f7;">${jobs.find(j => j.id === a.jobId)?.title || 'Unknown'}</li>`).join('') + '</ul></div>';
        subContent += '<div class="box"><h3>Your Activity</h3><canvas id="activity-chart" style="height:200px;"></canvas></div>';
        contentArea.innerHTML = subContent;
        const accepted = processed.filter(p => p.status === 'Hired' && p.handler === currentUser.name).length;
        const declined = processed.filter(p => p.status === 'Rejected' && p.handler === currentUser.name).length;
        const noOpinion = applications.filter(a => jobs.find(j => j.id === a.jobId)?.assigned.includes(currentUser.name)).length;
        // Chart configuration
        const chartConfig = {
          type: 'pie',
          data: {
            labels: ['Accepted', 'Declined', 'No Opinion'],
            datasets: [{
              data: [accepted, declined, noOpinion],
              backgroundColor: ['#34c759', '#ff3b30', '#ffcc00']
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        };
        new Chart(document.getElementById('activity-chart'), chartConfig);
        break;
      case 'jobs':
        subContent += '<button class="big" onclick="createJob()" style="margin-bottom:2rem;">Create a Job Listing</button>';
        if (jobs.length === 0) subContent += '<p style="font-size:1.1rem; color:#6e6e73;">No job listings yet. Create one above.</p>';
        jobs.forEach(job => {
          subContent += `<div class="job-row">
            <div class="indicator ${job.active ? 'green' : 'grey'}" onclick="toggleJob(${job.id})"></div>
            <span style="flex:1; font-weight:600;">${job.title}</span>
            <span style="color:#6e6e73; margin-right:1rem;">Created: ${job.creationDate.slice(0,10)}</span>
            <span style="color:#6e6e73; margin-right:1rem;">By: ${job.createdBy}</span>
            <span style="color:#6e6e73; margin-right:1rem;">Last Open: ${job.lastOpen.slice(0,10)}</span>
            <span class="trash" onclick="deleteJob(${job.id})">🗑</span>
          </div>`;
        });
        contentArea.innerHTML = subContent;
        document.querySelectorAll('.job-row')?.forEach(row => {
          row.addEventListener('click', (e) => {
            if (!e.target.classList.contains('indicator') && !e.target.classList.contains('trash')) {
              viewJob(parseInt(row.querySelector('.indicator').getAttribute('onclick').match(/\d+/)[0]));
            }
          });
        });
        break;
      case 'candidates':
        subContent += '<h3 style="font-size:1.5rem; font-weight:600; margin-bottom:1rem;">Incoming Applications</h3><div class="grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:1.5rem;">';
        applications.forEach(app => {
          subContent += `<div class="box" style="cursor:pointer;" onclick="viewApplication(${app.id})">
            <div style="display:flex; align-items:center; margin-bottom:1rem;">
              <img src="${app.data.discordPfp || 'https://via.placeholder.com/48'}" style="border-radius:50%; margin-right:0.75rem; width:48px; height:48px;">
              <img src="${app.data.robloxAvatar || 'https://via.placeholder.com/48'}" style="border-radius:50%; width:48px; height:48px;">
            </div>
            <span style="font-weight:600;">${app.data.name || 'Anonymous'}</span>
            <span style="color:#6e6e73;">Position: ${jobs.find(j => j.id === app.jobId)?.title || 'N/A'}</span>
            <span style="color:#6e6e73;">Company: ${jobs.find(j => j.id === app.jobId)?.company || 'N/A'}</span>
          </div>`;
        });
        subContent += '</div><h3 style="font-size:1.5rem; font-weight:600; margin:2rem 0 1rem;">Processed Candidates</h3><div class="grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:1.5rem;">';
        processed.forEach(h => {
          subContent += `<div class="box" style="background:${h.status === 'Hired' ? '#eaffea' : '#ffeaea'};">
            <span style="font-weight:600;">${jobs.find(j => j.id === h.jobId)?.title || 'N/A'}</span>
            <span style="color:#6e6e73;">Status: ${h.status}</span>
          </div>`;
        });
        subContent += '</div>';
        contentArea.innerHTML = subContent;
        break;
    }
  }
}

function createJob() {
  let content = `
    <h2 style="font-size:2rem; font-weight:600; margin-bottom:1.5rem;">Create New Job Listing</h2>
    <label style="display:block; font-weight:500; margin-bottom:0.5rem;">Job Title</label>
    <input type="text" id="job-title" placeholder="e.g. Finance Manager" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:1.5rem;">
    <label style="display:block; font-weight:500; margin-bottom:0.5rem;">Job Description</label>
    <textarea id="job-desc" placeholder="Describe the role..." style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; height:150px; margin-bottom:1.5rem;"></textarea>
    <label style="display:block; font-weight:500; margin-bottom:0.5rem;">Payment Type</label>
    <select id="payment-type" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:1rem;">
      <option value="biweekly">Biweekly</option>
      <option value="set">Set</option>
      <option value="notPayable">Not Payable</option>
      <option value="explained">Explained</option>
    </select>
    <div id="payment-details" style="margin-bottom:1.5rem;"></div>
    <label style="display:block; font-weight:500; margin-bottom:0.5rem;">Application Options (Optional)</label>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.5rem;">
      <label><input type="checkbox" id="opt-name"> Include Name</label>
      <label><input type="checkbox" id="opt-email"> Include Email</label>
      <label><input type="checkbox" id="opt-discord"> Include Discord ID</label>
      <label><input type="checkbox" id="opt-roblox"> Include Roblox ID</label>
      <label><input type="checkbox" id="opt-cv"> Include CV Upload</label>
      <label><input type="checkbox" id="opt-experience"> Include Past Experience</label>
    </div>
    <label style="display:block; font-weight:500; margin-bottom:0.5rem;">Extra Questions (Optional)</label>
    <div id="questions-container" style="margin-bottom:1rem;"></div>
    <button onclick="addQuestion()" style="background:none; color:#007aff; border:none; cursor:pointer; font-weight:500; margin-bottom:1.5rem;">+ Add Extra Question</button>
    <label style="display:block; font-weight:500; margin-bottom:0.5rem;">Assign Director(s)</label>
    <select id="assigned" multiple style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:1.5rem;">
      <option>Sam</option><option>Marcus</option><option>Teejay</option>
    </select>
    <label style="display:block; font-weight:500; margin-bottom:0.5rem;">Status</label>
    <div style="margin-bottom:1.5rem;">
      <label style="margin-right:1rem;"><input type="radio" name="status" value="open"> Open</label>
      <label><input type="radio" name="status" value="closed" checked> Closed</label>
    </div>
    <label style="display:block; font-weight:500; margin-bottom:0.5rem;">Company</label>
    <select id="company" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:1.5rem;">
      ${COMPANIES.map(c => `<option>${c}</option>`).join('')}
    </select>
    <button class="big" onclick="submitJob()" style="width:100%;">Create Listing</button>
  `;
  showPopup(content, true);
  const paymentSelect = document.getElementById('payment-type');
  if (paymentSelect) {
    paymentSelect.addEventListener('change', updatePaymentDetails);
    updatePaymentDetails();
  }
}

function updatePaymentDetails() {
  const type = document.getElementById('payment-type')?.value;
  const details = document.getElementById('payment-details');
  if (details) {
    const inputStyle = 'width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6;';
    switch (type) {
      case 'biweekly':
        details.innerHTML = `<label style="display:block; font-weight:500; margin-bottom:0.5rem;">Payment Details</label><textarea id="payment-detail" placeholder="e.g. Paid every two weeks based on hours..." style="${inputStyle} height:100px;"></textarea>`;
        break;
      case 'set':
        details.innerHTML = `<label style="display:block; font-weight:500; margin-bottom:0.5rem;">Amount</label><input id="payment-detail" placeholder="e.g. $5000 per month" style="${inputStyle}">`;
        break;
      case 'explained':
        details.innerHTML = `<label style="display:block; font-weight:500; margin-bottom:0.5rem;">Explanation</label><textarea id="payment-detail" placeholder="e.g. Compensation structure..." style="${inputStyle} height:100px;"></textarea>`;
        break;
      case 'notPayable':
        details.innerHTML = '';
        break;
    }
  }
}

let questionCount = 0;
function addQuestion() {
  const container = document.getElementById('questions-container');
  if (container) {
    const id = questionCount++;
    const inputStyle = 'width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:0.75rem;';
    container.innerHTML += `
      <div style="background:#f2f2f7; padding:1rem; border-radius:12px; margin-bottom:1rem;">
        <input type="text" id="q-title-${id}" placeholder="Question Title" style="${inputStyle}">
        <textarea id="q-desc-${id}" placeholder="Optional Description" style="${inputStyle} height:80px;"></textarea>
        <select id="q-type-${id}" style="${inputStyle}">
          <option value="short">Short Text</option>
          <option value="paragraph">Paragraph</option>
          <option value="multiple">Multiple Choice</option>
          <option value="multi">Multi Select</option>
        </select>
        <div id="q-options-${id}" style="margin-top:0.75rem;"></div>
      </div>`;
    const select = document.getElementById(`q-type-${id}`);
    if (select) {
      select.addEventListener('change', (e) => {
        const optsDiv = document.getElementById(`q-options-${id}`);
        if (optsDiv) {
          if (e.target.value === 'multiple' || e.target.value === 'multi') {
            let opts = '<label style="display:block; font-weight:500; margin-bottom:0.5rem;">Options (up to 5)</label>';
            for (let i = 0; i < 5; i++) opts += `<input type="text" id="q-opt-${id}-${i}" placeholder="Option ${i+1}" style="${inputStyle}"><br>`;
            optsDiv.innerHTML = opts;
          } else {
            optsDiv.innerHTML = '';
          }
        }
      });
    }
  }
}

function submitJob() {
  const paymentType = document.getElementById('payment-type')?.value;
  const paymentDetail = document.getElementById('payment-detail')?.value || '';
  if (paymentType && document.getElementById('job-title')?.value && document.getElementById('job-desc')?.value) {
    const newJob = {
      id: Date.now(),
      title: document.getElementById('job-title').value,
      description: document.getElementById('job-desc').value,
      payment: paymentDetail ? `${paymentType.charAt(0).toUpperCase() + paymentType.slice(1)}: ${paymentDetail}` : `${paymentType.charAt(0).toUpperCase() + paymentType.slice(1)}`,
      active: document.querySelector('[name="status"]:checked')?.value === 'open',
      createdBy: currentUser.name,
      creationDate: new Date().toISOString(),
      lastOpen: new Date().toISOString(),
      clicks: 0,
      submissions: 0,
      assigned: Array.from(document.getElementById('assigned')?.selectedOptions || []).map(o => o.value),
      options: {
        name: document.getElementById('opt-name')?.checked || false,
        email: document.getElementById('opt-email')?.checked || false,
        discord: document.getElementById('opt-discord')?.checked || false,
        roblox: document.getElementById('opt-roblox')?.checked || false,
        cv: document.getElementById('opt-cv')?.checked || false,
        experience: document.getElementById('opt-experience')?.checked || false
      },
      questions: [],
      company: document.getElementById('company')?.value
    };
    for (let i = 0; i < questionCount; i++) {
      const title = document.getElementById(`q-title-${i}`)?.value;
      if (title) {
        const q = {
          title,
          desc: document.getElementById(`q-desc-${i}`)?.value || '',
          type: document.getElementById(`q-type-${i}`)?.value || 'short',
          options: []
        };
        const optInputs = document.querySelectorAll(`#q-options-${i} input`);
        optInputs.forEach((inp, idx) => { if (inp.value) q.options.push(inp.value); });
        newJob.questions.push(q);
      }
    }
    jobs.push(newJob);
    saveData();
    playSuccessSound();
    showNotification(`Successfully created new listing: ${newJob.title}`);
    if (newJob.assigned.includes(currentUser.name)) showNotification(`You have been assigned to listing: ${newJob.title}`);
    hidePopup();
    renderEmployerSubPage('jobs');
  } else {
    showNotification('Please fill all required fields.');
  }
}

function toggleJob(id) {
  const job = jobs.find(j => j.id === id);
  if (job) {
    job.active = !job.active;
    if (job.active) job.lastOpen = new Date().toISOString();
    saveData();
    playSuccessSound();
    showNotification(`Successfully updated status: ${job.active ? 'Open' : 'Closed'}`);
    renderEmployerSubPage('jobs');
  }
}

function deleteJob(id) {
  showPopup(`Are you sure you want to delete this position? <button class="big" onclick="confirmDelete(${id})" style="margin-right:1rem;">Yes</button><button class="big" onclick="hidePopup()" style="background:#ff3b30;">No</button>`);
}

function confirmDelete(id) {
  const popup = document.getElementById('popup');
  if (popup) {
    popup.innerHTML = '<p style="text-align:center; font-size:1.2rem;">Deleting...</p>';
    setTimeout(() => {
      jobs = jobs.filter(j => j.id !== id);
      saveData();
      hidePopup();
      renderEmployerSubPage('jobs');
    }, 2000);
  }
}

function viewJob(id) {
  const job = jobs.find(j => j.id === id);
  if (job) {
    let content = `<h2 style="font-size:2rem; font-weight:600;">${job.title}</h2><p style="margin-bottom:1rem;">${job.description}</p><p style="margin-bottom:1.5rem;">Payment: ${job.payment}</p>`;
    content += '<h3 style="font-size:1.3rem; font-weight:600; margin-bottom:0.75rem;">Application Options</h3>';
    Object.keys(job.options).forEach(opt => {
      content += `<p>${opt.charAt(0).toUpperCase() + opt.slice(1)}: ${job.options[opt] ? '<span style="color:#34c759;">✓</span>' : '<span style="color:#ff3b30;">✗</span>'}</p>`;
    });
    content += '<div class="questions-toggle" style="cursor:pointer; margin:1.5rem 0; font-weight:600;">Application Questions <span class="arrow">⌄</span></div><div class="dropdown-content hidden" style="background:#f2f2f7; padding:1rem; border-radius:12px;">' + job.questions.map(q => `<h4 style="font-size:1.2rem; font-weight:600;">${q.title}</h4><p style="color:#6e6e73;">${q.desc || ''}</p>`).join('') + '</div>';
    content += `<p style="font-size:0.9rem; color:#6e6e73; margin-top:1.5rem;">Creation Date: ${job.creationDate.slice(0,10)} | Created by: ${job.createdBy} | Total Clicks: ${job.clicks} | Total Submissions: ${job.submissions}</p>`;
    content += '<button class="big" onclick="hidePopup()" style="width:100%; margin-top:2rem;">Back</button>';
    showPopup(content);
    document.querySelector('.questions-toggle')?.addEventListener('click', () => {
      const contentDiv = document.querySelector('.dropdown-content');
      const arrow = document.querySelector('.questions-toggle .arrow');
      if (contentDiv && arrow) {
        contentDiv.classList.toggle('hidden');
        arrow.classList.toggle('expanded');
      }
    });
  }
}

function viewApplication(id) {
  const app = applications.find(a => a.id === id);
  if (app) {
    const job = jobs.find(j => j.id === app.jobId);
    let content = `<h2 style="font-size:2rem; font-weight:600; margin-bottom:1rem;">Application for ${job?.title || 'N/A'}</h2>`;
    content += '<div style="display:flex; align-items:center; margin-bottom:1.5rem;">' +
      `<img src="${app.data.discordPfp || 'https://via.placeholder.com/56'}" style="border-radius:50%; margin-right:1rem; width:56px; height:56px;">` +
      `<img src="${app.data.robloxAvatar || 'https://via.placeholder.com/56'}" style="border-radius:50%; width:56px; height:56px;">` +
      '</div>';
    content += `<p style="font-weight:500;">Name: ${app.data.name || 'N/A'}</p>`;
    if (app.data.email) content += `<p style="font-weight:500;">Email: ${app.data.email}</p>`;
    if (app.data.discord) content += `<p style="font-weight:500;">Discord: ${app.data.discord}</p>`;
    if (app.data.roblox) content += `<p style="font-weight:500;">Roblox: ${app.data.roblox}</p>`;
    if (app.data.cv) content += `<p style="font-weight:500;">CV: ${app.data.cv}</p>`;
    if (app.data.experience) content += `<p style="font-weight:500;">Experience: ${app.data.experience}</p>`;
    content += '<div class="chat-box" style="margin:1.5rem 0; background:#f2f2f7; padding:1.25rem; border-radius:12px;"><h3 style="font-size:1.3rem; font-weight:600; margin-bottom:1rem;">Discussion Chat</h3><div id="chat-msgs" style="margin-bottom:1rem;">' + (chats[app.id] || []).map(m => `<p style="margin-bottom:0.5rem;"><strong>${m.user}:</strong> ${m.msg}</p>`).join('') + '</div><input id="chat-input" placeholder="Type your message..." style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:0.75rem;"><button class="big" onclick="sendChat(${id})" style="width:100%; background:#34c759;">Send</button></div>';
    content += '<label style="display:block; font-weight:500; margin-bottom:0.5rem;">Process Application</label><select id="app-status" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:0.75rem;"><option value="pending">Pending</option><option value="hired">Hire</option><option value="rejected">Reject</option></select><input id="reject-reason" class="hidden" placeholder="Reason for rejection" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:1rem;"><button class="big" onclick="processApp(${id})" style="width:100%;">Process</button>';
    showPopup(content, true);
    document.getElementById('app-status')?.addEventListener('change', e => {
      document.getElementById('reject-reason')?.classList.toggle('hidden', e.target.value !== 'rejected');
    });
  }
}

function sendChat(appId) {
  const msg = document.getElementById('chat-input')?.value;
  if (msg && currentUser) {
    if (!chats[appId]) chats[appId] = [];
    chats[appId].push({ user: currentUser.name, msg });
    saveData();
    document.getElementById('chat-msgs').innerHTML += `<p style="margin-bottom:0.5rem;"><strong>${currentUser.name}:</strong> ${msg}</p>`;
    document.getElementById('chat-input').value = '';
  }
}

function processApp(id) {
  const status = document.getElementById('app-status')?.value;
  const appIndex = applications.findIndex(a => a.id === id);
  if (appIndex !== -1 && currentUser) {
    const app = applications[appIndex];
    app.status = status;
    app.handler = currentUser.name;
    if (status === 'rejected') app.reason = document.getElementById('reject-reason')?.value || 'Not provided';
    if (status === 'hired' || status === 'rejected') {
      processed.push(...applications.splice(appIndex, 1));
      saveData();
      hidePopup();
      showNotification(`Application ${status} successfully.`);
      setTimeout(() => renderEmployerSubPage('candidates'), 3000);
    } else {
      saveData();
      showNotification('Application status updated to Pending.');
    }
  }
}