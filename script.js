// script.js - Organized Layout, Professional, No Initial Data, Refined Payment

// Data Structures - ALL SENSITIVE DATA NOW IN BACKEND
// No more hardcoded credentials visible in browser!
const COMPANIES = ['Cirkle Development', 'Aer Lingus', 'DevDen', 'Cirkle Group Careers'];
const COMPANY_LOGOS = {
  'Cirkle Development': 'https://media.discordapp.net/attachments/1315278404009988107/1315278406300209222/Utilities_-_3.png?ex=69049cf8&is=69034b78&hm=ce6329199383544d49ce52979847ebc540a956a41a7c54bb57ad3d5c7d570465&=&format=webp&quality=lossless',
  'Aer Lingus': 'https://media.discordapp.net/attachments/1315278404009988107/1425166770922328174/Eco_Clean.jpg?ex=6904ebfc&is=69039a7c&hm=90fbca7874d5267dbbb82446f85aa58bdb8a3e6184e56fbd0d8383643b7a9be2&=&format=webp',
  'DevDen': 'https://media.discordapp.net/attachments/1315278404009988107/1426979098328174634/image.png?ex=6904ec59&is=69039ad9&hm=7099577485c5d023c79be9078f97d46618acb741231ec90540b88b8305526f71&=&format=webp&quality=lossless',
  'Cirkle Group Careers': 'https://media.discordapp.net/attachments/1315278404009988107/1425166771413057578/Eco_Clean.png.jpg?ex=6904ebfc&is=69039a7c&hm=97a11f1d64abb2febeb26a5af51cdd7d4d7f074ffe353bce1efd4f6ba4db08da&=&format=webp'
};

// Data will be loaded from backend - see backend-api.js
// let currentUser, jobs, applications, processed, chats, employers are defined in backend-api.js
let currentUser = null;
let employers = []; // Loaded from backend

const faqs = [
  { q: 'What is Cirkle Development Group?', a: 'The Cirkle Development Group (Cirkle Dev Group) is the parent organization established to own, manage, and provide strategic direction for all descendant companies under its corporate umbrella, including the original Cirkle Development. We are structured as a holding group dedicated to maximizing the efficiency and growth of our portfolio businesses. Our existence ensures that each subsidiary can focus entirely on its core mission and operations while benefiting from the financial stability, centralized resources, and clear legal framework provided by the Group. We are building a coherent, synergistic network where stability and strategic oversight drive collective success. You can view more by visiting https://group.cirkledevelopment.co.uk/' },
  { q: 'How do I apply?', a: 'To apply for a job, go to the "vacancies" tab, select the company you wish to apply to and view the list of available applications. Click on your selected application and fill out the details! You will be presented with a 12 digit PIN- keep this safe as it can be used to track your application status. Once your application has been approved, you will be marked as "Hired", sent a welcome email from "careers@cirkledevelopment.co.uk" and will be DMed from your assigned employer. It is as easy as that!' },
  { q: 'What are the benefits?', a: 'Each company offers a variety of benefits. At [Cirkle Development], you get a staff discount to 40% off every product, You get to learn new ways to create, collaborate and manage workspace flow, you get to see behind the scenes information and leaks to products and some positions are paid! Please contact a relative representative for other groups to see the benefits. This can be done by opening a ticket in the correct server.' },
  { q: 'Contact Us', a: 'If you wish to contact us in any way, you can shoot an email to careers@cirkledevelopment.co.uk for career guidance. General enquiries are sent to info@cirkledevelopment.co.uk.' }
];

// Utility Functions
// saveData() is now handled by Firebase - see firebase-helpers.js

function generatePin() {
  return Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
}

function playSuccessSound() {
  document.getElementById('success-sound')?.play();
}

function showNotification(msg) {
  const notif = document.getElementById('notification');
  if (notif) {
    notif.textContent = msg;
    notif.classList.remove('hidden');
    document.getElementById('notification-sound')?.play();
    setTimeout(() => notif.classList.add('hidden'), 3000);
  }
}

function showPopup(content, fullScreen = false, onClose = null) {
  const overlay = document.getElementById('popup-overlay');
  const popup = document.getElementById('popup');
  if (overlay && popup) {
    popup.innerHTML = content + '<button class="close-popup" style="position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:1.5rem;cursor:pointer;color:#000;font-weight:700;">×</button>';
    if (fullScreen) {
      popup.style.maxWidth = '95%';
      popup.style.maxHeight = '95vh';
      popup.style.width = '95%';
    } else {
      popup.style.maxWidth = '600px';
      popup.style.width = 'auto';
    }
    overlay.classList.remove('hidden');
    popup.classList.remove('hidden');
    document.querySelector('.close-popup')?.addEventListener('click', () => {
      hidePopup();
      if (onClose) onClose();
    });
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
  const popup = document.getElementById('popup');
  if (overlay && popup) {
    popup.classList.add('hidden');
    overlay.innerHTML = '<div class="loading-overlay"><div class="spinner"></div></div>';
    overlay.classList.remove('hidden');
  }
}

function showSuccessScreen(message, pin = null, requireButton = false) {
  const overlay = document.getElementById('popup-overlay');
  const popup = document.getElementById('popup');
  if (overlay && popup) {
    popup.classList.add('hidden');
    let content = `
      <div class="success-screen">
        <div class="tick">✓</div>
        <h2 style="font-size:1.8rem; font-weight:700; margin-bottom:1rem;">${message}</h2>`;
    if (pin) {
      content += `
        <p style="font-size:1.1rem; margin-bottom:0.5rem;">Here is your candidate PIN to view your status:</p>
        <p style="font-size:1.5rem; font-weight:700; color:#007aff; margin-bottom:1rem;">${pin}</p>
        <p style="font-size:0.9rem; color:#6e6e73; max-width:400px; margin:0 auto; margin-bottom:1.5rem;">We recommend checking everyday for an update. Please only use this on this current device as this website is stored locally.</p>`;
    }
    if (requireButton) {
      content += '<button class="big" onclick="navigate(\'home\'); hidePopup();" style="padding:1rem 2rem; font-size:1.1rem;">Finished</button>';
    }
    content += '</div>';
    overlay.innerHTML = content;
    overlay.classList.remove('hidden');
    if (!requireButton) {
      setTimeout(() => {
        hidePopup();
      }, 5000);
    }
  }
}

// Routing
function navigate(hash) {
  window.location.hash = hash;
}

function updateHeader() {
  const header = document.getElementById('public-header');
  const footer = document.getElementById('footer');
  const hash = window.location.hash.slice(1) || 'home';
  
  if (hash.startsWith('employerportal/') || hash.startsWith('apply/')) {
    header?.classList.add('hidden');
    footer?.classList.add('hidden');
  } else {
    header?.classList.remove('hidden');
    footer?.classList.remove('hidden');
  }
}

window.addEventListener('hashchange', () => {
  updateHeader();
  renderPage();
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('employer-login-btn')?.addEventListener('click', () => {
    document.getElementById('login-dropdown')?.classList.toggle('hidden');
  });
  document.getElementById('login-submit')?.addEventListener('click', login);
  document.querySelectorAll('[data-nav]')?.forEach(btn => {
    btn.addEventListener('click', () => {
      // If it's candidate-status, show popup instead of navigating
      if (btn.dataset.nav === 'candidate-status') {
        renderCandidateStatus();
      } else {
        navigate(btn.dataset.nav);
      }
    });
  });
  updateHeader();
  renderPage();
});

async function login() {
  const id = document.getElementById('discord-id')?.value;
  const pin = document.getElementById('pin')?.value;
  const loading = document.getElementById('login-loading');
  if (loading) {
    loading.classList.remove('hidden');
    
    try {
      // Call backend API for authentication
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discordId: id, pin })
      });
      
      const result = await response.json();
      
      if (result.success) {
        currentUser = result.user;
        loading.textContent = 'Profile fetched!';
        setTimeout(() => navigate('employerportal/dashboard'), 1000);
      } else {
        alert('Invalid credentials');
        loading.classList.add('hidden');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed - check backend connection');
      loading.classList.add('hidden');
    }
  }
}

// Logout function
function logout() {
  const overlay = document.getElementById('popup-overlay');
  const popup = document.getElementById('popup');
  
  if (overlay && popup) {
    // Show loading animation
    popup.classList.add('hidden');
    overlay.innerHTML = '<div class="loading-overlay"><div class="spinner"></div></div>';
    overlay.classList.remove('hidden');
    
    setTimeout(() => {
      // Show goodbye message
      overlay.innerHTML = `
        <div class="success-screen">
          <div class="tick">👋</div>
          <h2 style="font-size:1.8rem; font-weight:700; margin-bottom:1rem;">Goodbye, ${currentUser.name}.</h2>
          <p style="font-size:1rem; color:#6e6e73;">Thank you for using the portal.</p>
        </div>
      `;
      
      setTimeout(() => {
        // Clear user and remove menu
        currentUser = null;
        const menu = document.querySelector('.side-menu');
        if (menu) menu.remove();
        
        // Hide overlay and navigate home
        overlay.classList.add('hidden');
        
        // Refresh and go to home
        window.location.hash = '';
        window.location.reload();
      }, 2000);
    }, 1500);
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
    // Add page transition animation
    const animations = ['page-transition-fade', 'page-transition-slide-left', 'page-transition-slide-right', 'page-transition-slide-up', 'page-transition-scale', 'page-transition-rotate'];
    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
    
    // Clear previous animations
    main.className = '';
    
    // Fade out
    main.style.opacity = '0';
    main.style.transform = 'translateY(20px)';
    main.style.transition = 'opacity 0.2s, transform 0.2s';
    
    setTimeout(() => {
      main.innerHTML = '';
      
      if (hash.startsWith('employerportal/')) {
        if (!currentUser) return navigate('home');
        const subpage = hash.split('/')[1];
        renderEmployerPage(subpage);
      } else if (hash.startsWith('apply/')) {
        const jobId = parseInt(hash.split('/')[1]);
        renderApplicationPage(jobId);
      } else {
        switch (hash) {
          case 'home': renderHome(); break;
          case 'vacancies': renderVacancies(); break;
          case 'information': renderInformation(); break;
          case 'candidate-status': 
            // Don't render as page, just show popup
            renderCandidateStatus(); 
            navigate('home');
            return;
          default: 
            if (hash.startsWith('company/')) {
              renderCompanyJobs(decodeURIComponent(hash.split('/')[1]));
            } else {
              renderHome();
            }
        }
      }
      
      // Fade in with animation
      main.style.transition = 'none';
      main.style.opacity = '0';
      main.style.transform = 'translateY(20px)';
      main.classList.add(randomAnimation);
      
      setTimeout(() => {
        main.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        main.style.opacity = '1';
        main.style.transform = 'translateY(0)';
      }, 50);
    }, 200);
  }
}

function renderHome() {
  const main = document.getElementById('main-content');
  if (main) {
    main.innerHTML = `
      <div style="text-align:center; padding:2rem 0;">
        <h1 id="animated-title" style="font-size:3rem; font-weight:800; margin-bottom:1rem; transition: color 0.8s ease-in-out;">Cirkle Development Careers</h1>
        <p style="font-size:1.2rem; color:#6e6e73; max-width:700px; margin:0 auto 2rem; line-height:1.8;">Join our growing family of innovative companies and talented professionals</p>
      </div>
      
      <img src="https://images-ext-1.discordapp.net/external/62yHoKp0AZjTT2rKgBjq8iQfstmkLlS8b5OcJzSEPck/https/pbs.twimg.com/media/GrBTqaRX0AEYnNZ.jpg%3Alarge?format=webp" alt="Cirkle Careers Banner" style="width:100%; border-radius:20px; margin-bottom:3rem; box-shadow:0 8px 24px rgba(0,0,0,0.12);">
      
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:2rem; margin-bottom:3rem;">
        <div style="background:#fff; padding:2rem; border-radius:16px; box-shadow:0 4px 16px rgba(0,0,0,0.08); text-align:center; transition:transform 0.3s;">
          <div style="font-size:3rem; margin-bottom:1rem;">🚀</div>
          <h3 style="font-size:1.3rem; font-weight:700; margin-bottom:0.75rem;">Innovative Work</h3>
          <p style="color:#6e6e73; line-height:1.6;">Work on cutting-edge projects that push boundaries and create real impact</p>
        </div>
        <div style="background:#fff; padding:2rem; border-radius:16px; box-shadow:0 4px 16px rgba(0,0,0,0.08); text-align:center; transition:transform 0.3s;">
          <div style="font-size:3rem; margin-bottom:1rem;">🤝</div>
          <h3 style="font-size:1.3rem; font-weight:700; margin-bottom:0.75rem;">Great Team</h3>
          <p style="color:#6e6e73; line-height:1.6;">Collaborate with talented professionals who are passionate about excellence</p>
        </div>
        <div style="background:#fff; padding:2rem; border-radius:16px; box-shadow:0 4px 16px rgba(0,0,0,0.08); text-align:center; transition:transform 0.3s;">
          <div style="font-size:3rem; margin-bottom:1rem;">📈</div>
          <h3 style="font-size:1.3rem; font-weight:700; margin-bottom:0.75rem;">Career Growth</h3>
          <p style="color:#6e6e73; line-height:1.6;">Advance your career with opportunities for learning and development</p>
        </div>
      </div>
      
      <div style="text-align:center;">
        <button class="big" onclick="navigate('vacancies')" style="padding:1.2rem 3rem; font-size:1.2rem; font-weight:700; background:linear-gradient(135deg, #007aff 0%, #5856d6 100%); box-shadow:0 8px 24px rgba(0,122,255,0.3);">🔍 Explore Opportunities</button>
      </div>
    `;
    
    // Start color animation
    const colors = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#00695c', '#007aff', '#5ac8fa', '#5856d6', '#ff2d55', '#8b4513'];
    let currentColorIndex = 0;
    
    const animateTitle = () => {
      const title = document.getElementById('animated-title');
      if (title) {
        currentColorIndex = (currentColorIndex + 1) % colors.length;
        title.style.color = colors[currentColorIndex];
      }
    };
    
    // Start animation immediately and repeat every 3 seconds
    setTimeout(() => {
      const title = document.getElementById('animated-title');
      if (title) {
        title.style.color = colors[0];
        setInterval(animateTitle, 3000);
      }
    }, 100);
  }
}

function renderVacancies() {
  const main = document.getElementById('main-content');
  if (main) {
    main.innerHTML = `
      <h2 style="font-size:2.5rem; font-weight:800; margin-bottom:1rem; text-align:center;">Available Vacancies</h2>
      <p style="text-align:center; font-size:1.1rem; color:#6e6e73; margin-bottom:2rem;">Explore opportunities across our family of companies</p>
      <img src="https://media.discordapp.net/attachments/1404157487799861332/1432846309362237480/image.png?ex=69052c9d&is=6903db1d&hm=50cfebeb97b22a11d36140505c74cbc060d282ad95e0686026e9e48d15e71c52&=&format=webp&quality=lossless" alt="Vacancies Banner" style="border-radius:20px; margin-bottom:2.5rem; width:100%; box-shadow:0 8px 24px rgba(0,0,0,0.12);">
      <div style="display:grid; gap:1.5rem;">
    `;
    
    COMPANIES.forEach(company => {
      const count = jobs.filter(j => j.company === company && j.active).length;
      const logo = COMPANY_LOGOS[company] || `https://via.placeholder.com/80?text=${company[0]}`;
      
      main.innerHTML += `
        <div class="row" onclick="navigate('company/${encodeURIComponent(company)}')" style="display:flex; align-items:center; padding:1.5rem; background:#fff; border-radius:16px; cursor:pointer; transition:all 0.3s; box-shadow:0 4px 12px rgba(0,0,0,0.08); gap:1.5rem;">
          <img src="${logo}" alt="${company}" style="width:80px; height:80px; border-radius:12px; object-fit:cover; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <div style="flex:1;">
            <h3 style="font-size:1.4rem; font-weight:700; margin-bottom:0.25rem; color:#1d1d1f;">${company}</h3>
            <p style="color:#6e6e73; font-size:0.95rem;">Explore positions in this company</p>
          </div>
          <div style="background:${count > 0 ? '#34c759' : '#8e8e93'}; color:#fff; padding:0.5rem 1rem; border-radius:20px; font-weight:700; font-size:1.1rem; min-width:60px; text-align:center;">
            ${count}
          </div>
        </div>
      `;
    });
    
    main.innerHTML += '</div>';
  }
}

function renderCompanyJobs(company) {
  const main = document.getElementById('main-content');
  if (main) {
    const logo = COMPANY_LOGOS[company] || `https://via.placeholder.com/120?text=${company[0]}`;
    const list = jobs.filter(j => j.company === company && j.active);
    
    main.innerHTML = `
      <div style="text-align:center; margin-bottom:2rem;">
        <img src="${logo}" alt="${company}" style="width:120px; height:120px; border-radius:20px; margin-bottom:1rem; box-shadow:0 4px 16px rgba(0,0,0,0.12); object-fit:cover;">
        <h1 style="font-size:2.8rem; font-weight:800; margin-bottom:0.5rem;">${company}</h1>
        <p style="font-size:1.1rem; color:#6e6e73;">${list.length} active position${list.length !== 1 ? 's' : ''} available</p>
      </div>
    `;
    
    if (list.length === 0) {
      main.innerHTML += `
        <div style="text-align:center; padding:4rem 2rem; background:#f9f9fb; border-radius:20px; margin-top:2rem;">
          <div style="font-size:4rem; margin-bottom:1rem;">📭</div>
          <h3 style="font-size:1.5rem; font-weight:700; margin-bottom:0.75rem;">No Openings Available</h3>
          <p style="font-size:1.1rem; color:#6e6e73; margin-bottom:2rem;">There are currently no active positions at ${company}. Check back soon!</p>
          <button class="big" onclick="navigate('vacancies')" style="background:#8e8e93;">← Back to All Companies</button>
        </div>
      `;
    } else {
      main.innerHTML += '<div style="display:grid; gap:1.25rem;">';
      list.forEach(job => {
        main.innerHTML += `
          <div class="row" onclick="showJobPopup(jobs.find(j => j.id === ${job.id}))" style="cursor:pointer; padding:1.5rem; background:#fff; border-radius:16px; transition:all 0.3s; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            <div style="flex:1;">
              <h3 style="font-size:1.3rem; font-weight:700; margin-bottom:0.5rem; color:#1d1d1f;">${job.title}</h3>
              <p style="color:#6e6e73; font-size:0.95rem; margin-bottom:0.5rem;">${job.description.substring(0, 120)}${job.description.length > 120 ? '...' : ''}</p>
              <div style="display:flex; gap:1rem; flex-wrap:wrap; margin-top:0.75rem;">
                <span style="background:#f2f2f7; padding:0.4rem 0.9rem; border-radius:12px; font-size:0.85rem; font-weight:600; color:#007aff;">💰 ${job.payment.split(':')[0]}</span>
                <span style="background:#f2f2f7; padding:0.4rem 0.9rem; border-radius:12px; font-size:0.85rem; font-weight:600; color:#34c759;">📝 ${job.submissions} applications</span>
              </div>
            </div>
            <div style="display:flex; align-items:center; color:#007aff; font-size:1.5rem; font-weight:700;">→</div>
          </div>
        `;
      });
      main.innerHTML += '</div>';
    }
  }
}

function showJobPopup(job) {
  if (job) {
    job.clicks++;
    saveData();
    showPopup(`
      <h2 style="font-size:2rem; font-weight:600; margin-bottom:1rem;">${job.title}</h2>
      <p style="margin-bottom:1rem; line-height:1.6;">${job.description}</p>
      <p style="font-weight:600; margin-bottom:1.5rem;">Payment: ${job.payment}</p>
      <button class="big" onclick="navigate('apply/${job.id}'); hidePopup();" style="width:100%;">Apply Now</button>
    `, false);
  }
}

function renderApplicationPage(jobId) {
  const job = jobs.find(j => j.id === jobId);
  const main = document.getElementById('main-content');
  if (!job || !main) {
    navigate('home');
    return;
  }
  
  main.style.padding = '2rem';
  let content = `
    <div style="max-width:800px; margin:0 auto;">
      <h1 style="font-size:2.5rem; font-weight:700; margin-bottom:1rem;">${job.title}</h1>
      <p style="font-size:1.1rem; margin-bottom:2rem; line-height:1.6;">${job.description}</p>
      <p style="font-weight:600; margin-bottom:2rem;">Payment: ${job.payment}</p>
      <div style="background:#fff; padding:2rem; border-radius:20px; box-shadow:0 4px 16px rgba(0,0,0,0.08);">`;
  
  if (job.options.name) content += '<label style="display:block; font-weight:600; margin-bottom:0.5rem;">Full Name *</label><input type="text" id="app-name" placeholder="Enter your full name" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:1.5rem; transition:border 0.3s;"><br>';
  
  if (job.options.email) content += '<label style="display:block; font-weight:600; margin-bottom:0.5rem;">Email Address *</label><input type="email" id="app-email" placeholder="Enter your email" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:1.5rem; transition:border 0.3s;"><br>';
  
  if (job.options.discord) content += '<label style="display:block; font-weight:600; margin-bottom:0.5rem;">Discord ID *</label><input type="text" id="app-discord" placeholder="Enter your Discord ID" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:1.5rem; transition:border 0.3s;"><br>';
  
  if (job.options.roblox) content += '<label style="display:block; font-weight:600; margin-bottom:0.5rem;">Roblox ID *</label><input type="text" id="app-roblox" placeholder="Enter your Roblox ID" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:1.5rem; transition:border 0.3s;"><br>';
  
  if (job.options.cv) content += '<label style="display:block; font-weight:600; margin-bottom:0.5rem;">Upload CV (Optional)</label><input type="file" id="app-cv" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:1.5rem;"><br>';
  
  if (job.options.experience) content += '<label style="display:block; font-weight:600; margin-bottom:0.5rem;">Past Experience *</label><textarea id="app-experience" placeholder="Describe your relevant experience (max 3000 chars)" maxlength="3000" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:1.5rem; height:150px; resize:vertical; transition:border 0.3s;"></textarea><br>';
  
  if (job.questions.length > 0) {
    content += '<div style="margin-top:2rem; padding-top:2rem; border-top:2px solid #f2f2f7;">';
    content += '<h3 style="font-size:1.5rem; font-weight:600; margin-bottom:1.5rem;">Additional Questions</h3>';
    
    job.questions.forEach((q, i) => {
      content += `<div style="margin-bottom:2rem;">`;
      content += `<h4 style="font-size:1.2rem; font-weight:600; margin-bottom:0.5rem;">${q.title}</h4>`;
      if (q.desc) content += `<p style="color:#6e6e73; margin-bottom:0.75rem; font-size:0.95rem;">${q.desc}</p>`;
      
      if (q.type === 'short') {
        content += `<input type="text" id="q-${i}" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; transition:border 0.3s;">`;
      } else if (q.type === 'paragraph') {
        content += `<textarea id="q-${i}" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; height:120px; resize:vertical; transition:border 0.3s;"></textarea>`;
      } else if (q.type === 'multiple') {
        q.options.forEach(opt => {
          content += `<label style="display:block; margin-bottom:0.75rem; padding:0.75rem; background:#f9f9fb; border-radius:8px; cursor:pointer; transition:background 0.3s;">
            <input type="radio" name="q-${i}" value="${opt}" style="margin-right:0.5rem;"> ${opt}
          </label>`;
        });
      } else if (q.type === 'multi') {
        q.options.forEach(opt => {
          content += `<label style="display:block; margin-bottom:0.75rem; padding:0.75rem; background:#f9f9fb; border-radius:8px; cursor:pointer; transition:background 0.3s;">
            <input type="checkbox" name="q-${i}" value="${opt}" style="margin-right:0.5rem;"> ${opt}
          </label>`;
        });
      }
      content += '</div>';
    });
    content += '</div>';
  }
  
  content += '<button class="big" onclick="submitApplication(' + jobId + ')" style="width:100%; margin-top:2rem; padding:1.2rem; font-size:1.2rem;">Submit Application</button>';
  content += '</div></div>';
  
  main.innerHTML = content;
}

async function searchDiscord() {
  // Removed as requested
}

async function searchRoblox() {
  // Removed as requested
}

async function submitApplication(jobId) {
  showLoading();
  setTimeout(async () => {
    const app = { 
      id: Date.now(), 
      jobId, 
      data: {}, 
      pin: generatePin(), 
      status: 'Processing', 
      handler: '',
      appliedDate: new Date().toISOString()
    };
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      if (job.options.name) app.data.name = document.getElementById('app-name')?.value || '';
      if (job.options.email) app.data.email = document.getElementById('app-email')?.value || '';
      if (job.options.discord) {
        const discordId = document.getElementById('app-discord')?.value || '';
        app.data.discord = discordId;
        app.data.discordPfp = `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 6)}.png`;
      }
      if (job.options.roblox) {
        const robloxId = document.getElementById('app-roblox')?.value || '';
        app.data.roblox = robloxId;
        app.data.robloxAvatar = `https://via.placeholder.com/48?text=R`;
      }
      if (job.options.cv) app.data.cv = document.getElementById('app-cv')?.files[0] ? 'CV attached' : '';
      if (job.options.experience) app.data.experience = document.getElementById('app-experience')?.value || '';
      
      app.data.answers = {};
      job.questions.forEach((q, i) => {
        if (q.type === 'short' || q.type === 'paragraph') {
          app.data.answers[q.title] = document.getElementById(`q-${i}`)?.value || '';
        } else if (q.type === 'multiple' || q.type === 'multi') {
          const selected = document.querySelectorAll(`input[name="q-${i}"]:checked`);
          app.data.answers[q.title] = Array.from(selected).map(input => input.value).join(', ');
        }
      });
      
      job.submissions++;
      saveJob(job); // Firebase - update job
      saveApplication(app); // Firebase - save new application
      saveChat(app.id, []); // Firebase - initialize empty chat
      
      // Send to Discord webhook (optional - add your webhook URL)
      const WEBHOOK_URL = 'https://discord.com/api/webhooks/1433584396585271338/CjTLEfQmEPMbkeo-RLPB0lMN_gDwrOus0Pam3dGnvnwATN5pl9cItE-AyuK4a9cJRXAA'; // Add your Discord webhook URL here
      if (WEBHOOK_URL) {
        try {
          const embed = {
            title: `🆕 New Application: ${job.title}`,
            color: 0x007AFF,
            fields: [
              { name: '📋 Position', value: job.title, inline: true },
              { name: '🏢 Company', value: job.company, inline: true },
              { name: '📅 Applied', value: new Date(app.appliedDate).toLocaleString(), inline: false },
            ],
            timestamp: new Date().toISOString()
          };
          
          // Add applicant info
          if (app.data.name) embed.fields.push({ name: '👤 Name', value: app.data.name, inline: true });
          if (app.data.email) embed.fields.push({ name: '📧 Email', value: app.data.email, inline: true });
          if (app.data.discord) embed.fields.push({ name: '💬 Discord ID', value: app.data.discord, inline: true });
          if (app.data.roblox) embed.fields.push({ name: '🎮 Roblox ID', value: app.data.roblox, inline: true });
          if (app.data.experience) embed.fields.push({ name: '💼 Experience', value: app.data.experience.substring(0, 1000), inline: false });
          
          // Add answers to extra questions
          if (Object.keys(app.data.answers).length > 0) {
            Object.keys(app.data.answers).forEach(question => {
              embed.fields.push({ 
                name: `❓ ${question}`, 
                value: app.data.answers[question] || 'No answer', 
                inline: false 
              });
            });
          }
          
          embed.fields.push({ name: '🔑 Candidate PIN', value: `\`${app.pin}\``, inline: false });
          
          await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
          });
        } catch (e) {
          console.log('Webhook failed:', e);
        }
      }
      
      playSuccessSound();
      showSuccessScreen('Successfully Applied!', app.pin, true);
    }
  }, 2000);
}

function renderCandidateStatus() {
  showPopup(`
    <h2 style="font-size:2rem; font-weight:600; margin-bottom:1rem;">Check Application Status</h2>
    <input type="text" id="status-pin" placeholder="Enter your 12-digit PIN" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:1rem;">
    <button class="big" onclick="checkStatus()" style="width:100%;">Check Status</button>
  `);
}

function checkStatus() {
  const pin = document.getElementById('status-pin')?.value;
  if (pin) {
    const app = applications.find(a => a.pin === pin) || processed.find(h => h.pin === pin);
    if (app) {
      const job = jobs.find(j => j.id === app.jobId);
      let msg = `<h2 style="font-size:2rem; font-weight:600; margin-bottom:1rem;">Application Status</h2>`;
      msg += `<p style="font-size:1rem; color:#6e6e73; margin-bottom:1.5rem;"><strong>Position:</strong> ${job?.title || 'N/A'}</p>`;
      
      if (app.status === 'Rejected') {
        msg += `<p style="font-size:1.2rem; margin-bottom:1rem;">You have been <span style="background:#ff3b30; color:#fff; padding:0.25rem 0.75rem; border-radius:6px; font-weight:600;">rejected</span>.</p>`;
        msg += `<p style="font-size:1rem; margin-bottom:0.5rem;"><strong>Reason:</strong> ${app.reason || 'Not provided'}</p>`;
        msg += `<p style="font-size:1rem; margin-bottom:0.5rem;"><strong>Handled by:</strong> ${app.handler || 'Unknown'}</p>`;
        msg += `<p style="font-size:0.9rem; color:#6e6e73; margin-top:1rem;">Contact us if you have further concerns.</p>`;
      } else if (app.status === 'Hired') {
        msg += `<p style="font-size:1.2rem; margin-bottom:1rem;">You have been <span style="background:#34c759; color:#fff; padding:0.25rem 0.75rem; border-radius:6px; font-weight:600;">hired</span>! 🎉</p>`;
        msg += `<p style="font-size:1rem; margin-bottom:0.5rem;"><strong>Hired by:</strong> ${app.handler || 'Unknown'}</p>`;
        msg += `<p style="font-size:1rem; color:#6e6e73; margin-top:1rem;">Please check your emails and Discord DMs for next steps.</p>`;
      } else if (app.status === 'Extra Time') {
        msg += `<p style="font-size:1.2rem; margin-bottom:1rem;">Status: <span style="background:#ffcc00; color:#000; padding:0.25rem 0.75rem; border-radius:6px; font-weight:600;">Extra Time</span></p>`;
        msg += `<p style="font-size:0.9rem; color:#6e6e73; margin-top:0.5rem;">Your application is being reviewed. Please check back later.</p>`;
      } else {
        msg += `<p style="font-size:1.2rem; margin-bottom:1rem;">Status: <span style="background:#007aff; color:#fff; padding:0.25rem 0.75rem; border-radius:6px; font-weight:600;">${app.status}</span></p>`;
        msg += `<p style="font-size:0.9rem; color:#6e6e73; margin-top:0.5rem;">Your application is being processed.</p>`;
      }
      
      showPopup(msg);
    } else {
      showNotification('Invalid PIN. Please check and try again.');
    }
  }
}

function renderInformation() {
  const main = document.getElementById('main-content');
  if (main) {
    main.innerHTML = `
      <div style="text-align:center; margin-bottom:3rem;">
        <h2 style="font-size:2.5rem; font-weight:800; margin-bottom:1rem;">Information & FAQs</h2>
        <p style="font-size:1.1rem; color:#6e6e73;">Find answers to common questions about careers with us</p>
      </div>
      <div style="max-width:900px; margin:0 auto; display:grid; gap:1.25rem;">
    `;
    
    faqs.forEach((faq, index) => {
      const icons = ['❓', '📝', '✨', '📧'];
      const colors = ['#007aff', '#34c759', '#ff9500', '#ff3b30'];
      const icon = icons[index % icons.length];
      const color = colors[index % colors.length];
      
      main.innerHTML += `
        <div class="faq-row" style="background:#fff; border-radius:16px; padding:1.5rem; box-shadow:0 4px 12px rgba(0,0,0,0.08); cursor:pointer; transition:all 0.3s;">
          <div style="display:flex; align-items:center; gap:1rem;">
            <span style="font-size:2rem; min-width:40px; text-align:center;">${icon}</span>
            <span style="font-weight:700; font-size:1.15rem; flex:1; color:#1d1d1f;">${faq.q}</span>
            <span class="arrow" style="font-size:1.5rem; color:${color}; transition:transform 0.3s;">⌄</span>
          </div>
          <div class="dropdown-content hidden" style="margin-top:1rem; padding-top:1rem; border-top:2px solid #f2f2f7; color:#6e6e73; line-height:1.8; font-size:1rem;">${faq.a}</div>
        </div>
      `;
    });
    
    main.innerHTML += '</div>';
    
    // Add event listeners
    setTimeout(() => {
      document.querySelectorAll('.faq-row').forEach(row => {
        row.addEventListener('click', () => {
          const content = row.querySelector('.dropdown-content');
          const arrow = row.querySelector('.arrow');
          content.classList.toggle('hidden');
          if (content.classList.contains('hidden')) {
            arrow.style.transform = 'rotate(0deg)';
          } else {
            arrow.style.transform = 'rotate(180deg)';
          }
        });
      });
    }, 100);
  }
}

// Employer
function renderEmployerPage(page) {
  const main = document.getElementById('main-content');
  if (main) {
    main.id = 'employer-main';
    
    // Create side menu if it doesn't exist
    if (!document.querySelector('.side-menu')) {
      const menu = document.createElement('div');
      menu.classList.add('side-menu', 'open');
      menu.innerHTML = `
        <div class="pfp">
          <img src="${currentUser.pfp}" alt="${currentUser.name}">
          <h3 style="margin-top:0.75rem; font-size:1.1rem;">${currentUser.name}</h3>
          <p style="color:#6e6e73; font-size:0.9rem;">${currentUser.role}</p>
        </div>
        <button data-emp="dashboard" class="menu-btn">Dashboard</button>
        <button data-emp="candidatemanagement" class="menu-btn">Candidate Management</button>
        <button data-emp="joblistings" class="menu-btn">Job Listings</button>
        <button class="logout" onclick="logout()">Log Out</button>
      `;
      document.body.appendChild(menu);
    }
    
    // Update active states
    document.querySelectorAll('.menu-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.emp === page) {
        btn.classList.add('active');
      }
    });
    
    // Attach click handlers
    document.querySelectorAll('.menu-btn').forEach(btn => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
    });
    
    document.querySelectorAll('.menu-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        console.log('Clicked:', this.dataset.emp);
        const targetPage = this.dataset.emp;
        
        // Update active states immediately
        document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        // Render the subpage directly
        renderEmployerSubPage(targetPage);
        
        // Update hash without triggering hashchange
        history.replaceState(null, '', `#employerportal/${targetPage}`);
      });
    });
    
    renderEmployerSubPage(page || 'dashboard');
  }
}

function renderEmployerSubPage(sub) {
  const contentArea = document.getElementById('employer-main');
  if (!contentArea) return;
  
  let subContent = '';
  
  switch (sub) {
    case 'dashboard':
      subContent = `
        <h2 style="font-size:2rem; font-weight:700; margin-bottom:2rem;">Dashboard</h2>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:1.5rem;">
          <div class="box">
            <h3>Assigned Applications</h3>
            <p style="font-size:2.5rem; font-weight:700; color:#007aff; margin:1rem 0;">${applications.filter(a => jobs.find(j => j.id === a.jobId)?.assigned.includes(currentUser.name)).length}</p>
          </div>
          <div class="box">
            <h3>Total Job Listings</h3>
            <p style="font-size:2.5rem; font-weight:700; color:#34c759; margin:1rem 0;">${jobs.length}</p>
          </div>
          <div class="box">
            <h3>Processed Applications</h3>
            <p style="font-size:2.5rem; font-weight:700; color:#ff3b30; margin:1rem 0;">${processed.filter(p => p.handler === currentUser.name).length}</p>
          </div>
        </div>
        <div class="box" style="margin-top:1.5rem;">
          <h3>Your Activity</h3>
          <canvas id="activity-chart" style="max-height:300px;"></canvas>
        </div>
      `;
      contentArea.innerHTML = subContent;
      
      setTimeout(() => {
        const accepted = processed.filter(p => p.status === 'Hired' && p.handler === currentUser.name).length;
        const declined = processed.filter(p => p.status === 'Rejected' && p.handler === currentUser.name).length;
        const pending = applications.filter(a => jobs.find(j => j.id === a.jobId)?.assigned.includes(currentUser.name)).length;
        
        new Chart(document.getElementById('activity-chart'), {
          type: 'doughnut',
          data: {
            labels: ['Hired', 'Rejected', 'Pending'],
            datasets: [{
              data: [accepted, declined, pending],
              backgroundColor: ['#34c759', '#ff3b30', '#ffcc00'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { padding: 20, font: { size: 14 } }
              }
            }
          }
        });
      }, 100);
      break;
      
    case 'joblistings':
      subContent = `
        <h2 style="font-size:2rem; font-weight:700; margin-bottom:1.5rem;">Job Listings</h2>
        <button class="big" onclick="createJob()" style="margin-bottom:2rem;">+ Create New Job Listing</button>
      `;
      
      if (jobs.length === 0) {
        subContent += '<div class="box"><p style="text-align:center; color:#6e6e73; padding:2rem 0;">No job listings yet. Create your first one above!</p></div>';
      } else {
        jobs.forEach(job => {
          subContent += `
            <div class="job-row" data-job-id="${job.id}" style="cursor:pointer;">
              <div class="indicator ${job.active ? 'green' : 'grey'}" onclick="event.stopPropagation(); toggleJobStatus(${job.id})"></div>
              <div style="flex:1;">
                <div style="font-size:1.2rem; font-weight:600; margin-bottom:0.25rem;">${job.title}</div>
                <div style="font-size:0.85rem; color:#6e6e73;">${job.company}</div>
              </div>
              <span style="color:#6e6e73; font-size:0.85rem; margin-right:1rem;">Created: ${new Date(job.creationDate).toLocaleDateString()}</span>
              <span style="color:#6e6e73; font-size:0.85rem; margin-right:1rem;">By: ${job.createdBy}</span>
              <span style="color:#6e6e73; font-size:0.85rem; margin-right:1rem;">Submissions: ${job.submissions}</span>
              <span class="trash" onclick="event.stopPropagation(); deleteJob(${job.id})">🗑</span>
            </div>
          `;
        });
      }
      
      contentArea.innerHTML = subContent;
      
      document.querySelectorAll('.job-row').forEach(row => {
        row.addEventListener('click', (e) => {
          if (!e.target.classList.contains('indicator') && !e.target.classList.contains('trash')) {
            const jobId = parseInt(row.dataset.jobId);
            viewJobDetails(jobId);
          }
        });
      });
      break;
      
    case 'candidatemanagement':
      const tabs = ['processing', 'hired', 'rejected'];
      const currentTab = 'processing';
      
      subContent = `
        <h2 style="font-size:2rem; font-weight:700; margin-bottom:1.5rem;">Candidate Management</h2>
        <div class="tab-buttons" style="margin-bottom:2rem;">
          <button class="tab-btn active" data-tab="processing">Processing (${applications.length})</button>
          <button class="tab-btn" data-tab="hired">Hired (${processed.filter(p => p.status === 'Hired').length})</button>
          <button class="tab-btn" data-tab="rejected">Rejected (${processed.filter(p => p.status === 'Rejected').length})</button>
        </div>
        <div id="candidates-content"></div>
      `;
      
      contentArea.innerHTML = subContent;
      
      function renderCandidatesTab(tab) {
        const content = document.getElementById('candidates-content');
        if (!content) return;
        
        let html = '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:1.5rem;">';
        
        if (tab === 'processing') {
          if (applications.length === 0) {
            html = '<div class="box"><p style="text-align:center; color:#6e6e73; padding:2rem 0;">No pending applications</p></div>';
          } else {
            applications.forEach(app => {
              const job = jobs.find(j => j.id === app.jobId);
              html += `
                <div class="card" onclick="viewApplicationDetails(${app.id})" style="text-align:left; padding:1.5rem;">
                  <div style="display:flex; gap:0.75rem; margin-bottom:1rem;">
                    <img src="${app.data.discordPfp || 'https://via.placeholder.com/56'}" style="width:56px; height:56px; border-radius:50%; border:3px solid #007aff;">
                  </div>
                  <h3 style="font-size:1.2rem; font-weight:600; margin-bottom:0.5rem;">${app.data.name || 'Anonymous'}</h3>
                  <p style="color:#6e6e73; font-size:0.9rem; margin-bottom:0.25rem;"><strong>Position:</strong> ${job?.title || 'N/A'}</p>
                  <p style="color:#6e6e73; font-size:0.9rem; margin-bottom:0.25rem;"><strong>Company:</strong> ${job?.company || 'N/A'}</p>
                  <p style="color:#6e6e73; font-size:0.85rem; margin-top:0.75rem;">Applied: ${new Date(app.appliedDate).toLocaleString()}</p>
                </div>
              `;
            });
          }
        } else if (tab === 'hired') {
          const hiredApps = processed.filter(p => p.status === 'Hired');
          if (hiredApps.length === 0) {
            html = '<div class="box"><p style="text-align:center; color:#6e6e73; padding:2rem 0;">No hired candidates</p></div>';
          } else {
            hiredApps.forEach(app => {
              const job = jobs.find(j => j.id === app.jobId);
              html += `
                <div class="card" style="text-align:left; padding:1.5rem; background:#eaffea; border:2px solid #34c759; position:relative;">
                  <span class="trash" onclick="event.stopPropagation(); deleteProcessedApplication(${app.id})" style="position:absolute; top:1rem; right:1rem; cursor:pointer; font-size:1.2rem; z-index:5;">🗑</span>
                  <h3 style="font-size:1.2rem; font-weight:600; margin-bottom:0.5rem;">${app.data.name || 'Anonymous'}</h3>
                  <p style="color:#6e6e73; font-size:0.9rem; margin-bottom:0.25rem;"><strong>Position:</strong> ${job?.title || 'N/A'}</p>
                  <p style="color:#6e6e73; font-size:0.9rem; margin-bottom:0.25rem;"><strong>Company:</strong> ${job?.company || 'N/A'}</p>
                  <p style="color:#34c759; font-size:0.9rem; font-weight:600; margin-top:0.75rem;">✓ Hired by ${app.handler}</p>
                </div>
              `;
            });
          }
        } else if (tab === 'rejected') {
          const rejectedApps = processed.filter(p => p.status === 'Rejected');
          if (rejectedApps.length === 0) {
            html = '<div class="box"><p style="text-align:center; color:#6e6e73; padding:2rem 0;">No rejected candidates</p></div>';
          } else {
            rejectedApps.forEach(app => {
              const job = jobs.find(j => j.id === app.jobId);
              html += `
                <div class="card" style="text-align:left; padding:1.5rem; background:#ffeaea; border:2px solid #ff3b30; position:relative;">
                  <span class="trash" onclick="event.stopPropagation(); deleteProcessedApplication(${app.id})" style="position:absolute; top:1rem; right:1rem; cursor:pointer; font-size:1.2rem; z-index:5;">🗑</span>
                  <h3 style="font-size:1.2rem; font-weight:600; margin-bottom:0.5rem;">${app.data.name || 'Anonymous'}</h3>
                  <p style="color:#6e6e73; font-size:0.9rem; margin-bottom:0.25rem;"><strong>Position:</strong> ${job?.title || 'N/A'}</p>
                  <p style="color:#6e6e73; font-size:0.9rem; margin-bottom:0.25rem;"><strong>Company:</strong> ${job?.company || 'N/A'}</p>
                  <p style="color:#ff3b30; font-size:0.9rem; font-weight:600; margin-top:0.75rem;">✗ Rejected by ${app.handler}</p>
                  <p style="color:#6e6e73; font-size:0.85rem; margin-top:0.5rem;">Reason: ${app.reason || 'N/A'}</p>
                </div>
              `;
            });
          }
        }
        
        html += '</div>';
        content.innerHTML = html;
      }
      
      renderCandidatesTab('processing');
      
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          renderCandidatesTab(btn.dataset.tab);
        });
      });
      break;
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
    saveJob(newJob); // Firebase
    playSuccessSound();
    showNotification(`Successfully created new listing: ${newJob.title}`);
    if (newJob.assigned.includes(currentUser.name)) showNotification(`You have been assigned to listing: ${newJob.title}`);
    hidePopup();
    renderEmployerSubPage('joblistings');
  } else {
    showNotification('Please fill all required fields.');
  }
}

function toggleJob(id) {
  const job = jobs.find(j => j.id === id);
  if (job) {
    job.active = !job.active;
    if (job.active) job.lastOpen = new Date().toISOString();
    saveJob(job); // Firebase
    playSuccessSound();
    showNotification(`Successfully updated status: ${job.active ? 'Open' : 'Closed'}`);
    renderEmployerSubPage('joblistings');
  }
}

function toggleJobStatus(id) {
  toggleJob(id);
}

function viewJobDetails(id) {
  const job = jobs.find(j => j.id === id);
  if (!job) return;
  
  let content = `
    <div style="max-width:900px;">
      <h2 style="font-size:2.5rem; font-weight:700; margin-bottom:1rem;">${job.title}</h2>
      <div style="display:inline-block; padding:0.5rem 1rem; background:${job.active ? '#34c759' : '#8e8e93'}; color:#fff; border-radius:20px; font-size:0.9rem; font-weight:600; margin-bottom:1.5rem;">
        ${job.active ? '● Open' : '● Closed'}
      </div>
      
      <div class="box" style="margin-bottom:1.5rem;">
        <h3>Description</h3>
        <p style="line-height:1.6; color:#000;">${job.description}</p>
      </div>
      
      <div class="box" style="margin-bottom:1.5rem;">
        <h3>Payment Information</h3>
        <p style="font-size:1.1rem; color:#000;">${job.payment}</p>
      </div>
      
      <div class="box" style="margin-bottom:1.5rem;">
        <h3>Job Details</h3>
        <p><strong>Company:</strong> ${job.company}</p>
        <p><strong>Created by:</strong> ${job.createdBy}</p>
        <p><strong>Created on:</strong> ${new Date(job.creationDate).toLocaleString()}</p>
        <p><strong>Last opened:</strong> ${new Date(job.lastOpen).toLocaleString()}</p>
        <p><strong>Total clicks:</strong> ${job.clicks}</p>
        <p><strong>Total submissions:</strong> ${job.submissions}</p>
      </div>
      
      <div class="box" style="margin-bottom:1.5rem;">
        <h3>Application Requirements</h3>
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:0.75rem;">
          ${Object.keys(job.options).map(opt => `
            <div style="padding:0.75rem; background:#f9f9fb; border-radius:8px;">
              ${job.options[opt] ? '<span style="color:#34c759; font-size:1.2rem;">✓</span>' : '<span style="color:#ff3b30; font-size:1.2rem;">✗</span>'}
              <strong style="margin-left:0.5rem;">${opt.charAt(0).toUpperCase() + opt.slice(1)}</strong>
            </div>
          `).join('')}
        </div>
      </div>
      
      ${job.questions.length > 0 ? `
        <div class="box">
          <h3>Extra Questions (${job.questions.length})</h3>
          ${job.questions.map((q, i) => `
            <div style="padding:1rem; background:#f9f9fb; border-radius:12px; margin-bottom:1rem;">
              <h4 style="font-size:1.1rem; font-weight:600; margin-bottom:0.5rem;">${i + 1}. ${q.title}</h4>
              ${q.desc ? `<p style="color:#6e6e73; font-size:0.9rem; margin-bottom:0.5rem;">${q.desc}</p>` : ''}
              <p style="font-size:0.85rem; color:#007aff; font-weight:600;">Type: ${q.type.charAt(0).toUpperCase() + q.type.slice(1)}</p>
              ${q.options && q.options.length > 0 ? `
                <div style="margin-top:0.75rem;">
                  <p style="font-size:0.9rem; font-weight:600; margin-bottom:0.5rem;">Options:</p>
                  ${q.options.map(opt => `<span style="display:inline-block; padding:0.25rem 0.75rem; background:#fff; border-radius:12px; margin-right:0.5rem; margin-bottom:0.5rem; font-size:0.85rem;">${opt}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
  
  showPopup(content, true);
}

function viewApplicationDetails(id) {
  const app = applications.find(a => a.id === id);
  if (!app) return;
  
  const job = jobs.find(j => j.id === app.jobId);
  
  let content = `
    <div style="max-width:1200px; display:flex; gap:2rem;">
      <div style="flex:2;">
        <h2 style="font-size:2rem; font-weight:700; margin-bottom:1.5rem;">Application for ${job?.title || 'N/A'}</h2>
        
        <div class="box" style="margin-bottom:1.5rem;">
          <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem;">
            <img src="${app.data.discordPfp || 'https://via.placeholder.com/80'}" style="width:80px; height:80px; border-radius:50%; border:3px solid #007aff;">
            <div>
              <h3 style="font-size:1.5rem; margin-bottom:0.25rem;">${app.data.name || 'Anonymous'}</h3>
              <p style="color:#6e6e73;">Applied: ${new Date(app.appliedDate).toLocaleString()}</p>
            </div>
          </div>
          
          <div style="display:grid; gap:0.75rem;">
            ${app.data.email ? `<p><strong>Email:</strong> ${app.data.email}</p>` : ''}
            ${app.data.discord ? `<p><strong>Discord ID:</strong> ${app.data.discord}</p>` : ''}
            ${app.data.roblox ? `<p><strong>Roblox ID:</strong> ${app.data.roblox}</p>` : ''}
            ${app.data.cv ? `<p><strong>CV:</strong> ${app.data.cv}</p>` : ''}
          </div>
        </div>
        
        ${app.data.experience ? `
          <div class="box" style="margin-bottom:1.5rem;">
            <h3>Past Experience</h3>
            <p style="line-height:1.6; white-space:pre-wrap;">${app.data.experience}</p>
          </div>
        ` : ''}
        
        ${job && job.questions.length > 0 ? `
          <div class="box" style="margin-bottom:1.5rem;">
            <h3>Extra Questions (${job.questions.length})</h3>
            ${job.questions.map((q, i) => `
              <div style="padding:1rem; background:#f9f9fb; border-radius:12px; margin-bottom:1rem;">
                <h4 style="font-size:1.1rem; font-weight:600; margin-bottom:0.5rem;">${q.title}</h4>
                ${q.desc ? `<p style="color:#6e6e73; font-size:0.9rem; margin-bottom:0.5rem;">${q.desc}</p>` : ''}
                <p style="margin-top:0.75rem; padding:0.75rem; background:#fff; border-radius:8px;"><strong>Answer:</strong> ${app.data.answers?.[q.title] || 'No answer provided'}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        <div class="box">
          <h3>Feedback Process</h3>
          <div style="position:relative; display:inline-block; width:100%;">
            <button id="feedback-btn" style="width:100%; padding:1rem; background:#8e8e93; color:#fff; border:none; border-radius:12px; font-weight:600; cursor:pointer; transition:all 0.3s;">
              Select Action ▼
            </button>
            <div id="feedback-dropdown" class="hidden" style="position:absolute; top:100%; left:0; right:0; background:#fff; border-radius:12px; box-shadow:0 4px 16px rgba(0,0,0,0.15); margin-top:0.5rem; overflow:hidden; z-index:10;">
              <button onclick="processFeedback(${app.id}, 'hire')" style="width:100%; padding:1rem; background:none; border:none; text-align:left; cursor:pointer; transition:background 0.3s; font-weight:600; color:#34c759;">✓ Hire</button>
              <button onclick="processFeedback(${app.id}, 'reject')" style="width:100%; padding:1rem; background:none; border:none; text-align:left; cursor:pointer; transition:background 0.3s; font-weight:600; color:#ff3b30;">✗ Reject</button>
              <button onclick="processFeedback(${app.id}, 'extratime')" style="width:100%; padding:1rem; background:none; border:none; text-align:left; cursor:pointer; transition:background 0.3s; font-weight:600; color:#ffcc00;">⏱ Extra Time</button>
            </div>
          </div>
        </div>
      </div>
      
      <div style="flex:1;">
        <div class="box" style="position:sticky; top:2rem;">
          <h3>Discussion Chat</h3>
          <div id="chat-msgs" style="max-height:300px; overflow-y:auto; margin-bottom:1rem; padding:0.5rem;">
            ${(chats[app.id] || []).map(m => `
              <div style="margin-bottom:0.75rem; padding:0.75rem; background:${m.user === currentUser.name ? '#007aff' : '#f2f2f7'}; color:${m.user === currentUser.name ? '#fff' : '#000'}; border-radius:12px;">
                <strong style="font-size:0.85rem;">${m.user}</strong>
                <p style="margin-top:0.25rem;">${m.msg}</p>
              </div>
            `).join('')}
          </div>
          <input id="chat-input" placeholder="Type your message..." style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:0.75rem;">
          <button onclick="sendChatMessage(${app.id})" class="big" style="width:100%; background:#34c759; margin:0;">Send</button>
        </div>
      </div>
    </div>
  `;
  
  showPopup(content, true);
  
  document.getElementById('feedback-btn')?.addEventListener('click', () => {
    document.getElementById('feedback-dropdown')?.classList.toggle('hidden');
  });
}

function sendChatMessage(appId) {
  const input = document.getElementById('chat-input');
  const msg = input?.value;
  if (msg && currentUser) {
    if (!chats[appId]) chats[appId] = [];
    chats[appId].push({ user: currentUser.name, msg });
    saveChat(appId, chats[appId]); // Firebase
    
    const chatMsgs = document.getElementById('chat-msgs');
    if (chatMsgs) {
      chatMsgs.innerHTML += `
        <div style="margin-bottom:0.75rem; padding:0.75rem; background:#007aff; color:#fff; border-radius:12px;">
          <strong style="font-size:0.85rem;">${currentUser.name}</strong>
          <p style="margin-top:0.25rem;">${msg}</p>
        </div>
      `;
      chatMsgs.scrollTop = chatMsgs.scrollHeight;
    }
    
    input.value = '';
  }
}

function processFeedback(appId, action) {
  if (action === 'hire') {
    showPopup(`
      <h2 style="font-size:1.8rem; font-weight:700; margin-bottom:1rem;">Confirm Hire</h2>
      <p style="margin-bottom:2rem; font-size:1.1rem;">Are you sure you want to hire this person? This cannot be undone.</p>
      <div style="display:flex; gap:1rem;">
        <button onclick="confirmHire(${appId})" class="big" style="flex:1; background:#34c759;">Yes, Hire</button>
        <button onclick="hidePopup()" class="big" style="flex:1; background:#8e8e93;">No, Cancel</button>
      </div>
    `);
  } else if (action === 'reject') {
    showPopup(`
      <h2 style="font-size:1.8rem; font-weight:700; margin-bottom:1rem;">Reject Application</h2>
      <p style="margin-bottom:1rem; font-size:1.1rem;">Please provide a reason for rejection:</p>
      <textarea id="reject-reason-input" placeholder="Enter reason..." style="width:100%; padding:1rem; border-radius:12px; border:1px solid #d1d1d6; min-height:120px; margin-bottom:1.5rem; font-family:inherit;"></textarea>
      <div style="display:flex; gap:1rem;">
        <button onclick="confirmReject(${appId})" class="big" style="flex:1; background:#ff3b30;">Submit Rejection</button>
        <button onclick="hidePopup()" class="big" style="flex:1; background:#8e8e93;">Cancel</button>
      </div>
    `);
  } else if (action === 'extratime') {
    const appIndex = applications.findIndex(a => a.id === appId);
    if (appIndex !== -1) {
      applications[appIndex].status = 'Extra Time';
      saveApplication(applications[appIndex]); // Firebase
      hidePopup();
      showNotification('Application status updated to Extra Time');
      setTimeout(() => renderEmployerSubPage('candidatemanagement'), 500);
    }
  }
}

function confirmHire(appId) {
  const appIndex = applications.findIndex(a => a.id === appId);
  if (appIndex !== -1) {
    const app = applications[appIndex];
    app.status = 'Hired';
    app.handler = currentUser.name;
    
    // Firebase: Delete from applications, add to processed
    deleteApplication(app.pin);
    saveProcessed(app);
    
    playSuccessSound();
    const overlay = document.getElementById('popup-overlay');
    overlay.innerHTML = `
      <div class="success-screen">
        <div class="tick">✓</div>
        <h2 style="font-size:1.8rem; font-weight:700; margin-bottom:1rem;">Candidate Hired Successfully!</h2>
        <p style="font-size:1rem; color:#6e6e73; margin-bottom:2rem;">The candidate has been moved to the Hired tab.</p>
        <button class="big" onclick="hidePopup(); renderEmployerSubPage('candidatemanagement');" style="padding:1rem 2rem;">Close</button>
      </div>
    `;
  }
}

function confirmReject(appId) {
  const reason = document.getElementById('reject-reason-input')?.value;
  if (!reason || reason.trim() === '') {
    showNotification('Please provide a reason for rejection');
    return;
  }
  
  const appIndex = applications.findIndex(a => a.id === appId);
  if (appIndex !== -1) {
    const app = applications[appIndex];
    app.status = 'Rejected';
    app.handler = currentUser.name;
    app.reason = reason;
    
    // Firebase: Delete from applications, add to processed
    deleteApplication(app.pin);
    saveProcessed(app);
    
    const overlay = document.getElementById('popup-overlay');
    overlay.innerHTML = `
      <div class="success-screen">
        <div class="tick" style="background:#ff3b30;">✗</div>
        <h2 style="font-size:1.8rem; font-weight:700; margin-bottom:1rem;">Application Rejected</h2>
        <p style="font-size:1rem; color:#6e6e73; margin-bottom:2rem;">The candidate has been notified and moved to the Rejected tab.</p>
        <button class="big" onclick="hidePopup(); renderEmployerSubPage('candidatemanagement');" style="padding:1rem 2rem; background:#ff3b30;">Close</button>
      </div>
    `;
  }
}

function deleteJob(id) {
  showPopup(`Are you sure you want to delete this position? <button class="big" onclick="confirmDelete(${id})" style="margin-right:1rem;">Yes</button><button class="big" onclick="hidePopup()" style="background:#ff3b30;">No</button>`);
}

function confirmDelete(id) {
  deleteJob(id); // Firebase
  hidePopup();
  const popup = document.getElementById('popup');
  if (popup) {
    popup.innerHTML = '<p style="text-align:center; font-size:1.2rem;">Deleting...</p>';
    setTimeout(() => {
      hidePopup();
      renderEmployerSubPage('joblistings');
    }, 1000);
  }
}

function deleteProcessedApplication(appId) {
  showPopup(`
    <h2 style="font-size:1.8rem; font-weight:700; margin-bottom:1rem; color:#ff3b30;">⚠️ Delete Application</h2>
    <p style="font-size:1.1rem; margin-bottom:2rem; line-height:1.6;">Are you sure you want to permanently delete this application? It can't be retrieved.</p>
    <div style="display:flex; gap:1rem;">
      <button onclick="confirmDeleteProcessedApplication(${appId})" class="big" style="flex:1; background:#ff3b30;">Yes, Delete</button>
      <button onclick="hidePopup()" class="big" style="flex:1; background:#8e8e93;">No, Cancel</button>
    </div>
  `);
}

function confirmDeleteProcessedApplication(appId) {
  showLoading();
  setTimeout(() => {
    processed = processed.filter(p => p.id !== appId);
    saveData();
    playSuccessSound();
    
    const overlay = document.getElementById('popup-overlay');
    overlay.innerHTML = `
      <div class="success-screen">
        <div class="tick">✓</div>
        <h2 style="font-size:1.8rem; font-weight:700; margin-bottom:1rem;">Application Deleted</h2>
        <p style="font-size:1rem; color:#6e6e73;">The application has been permanently removed.</p>
      </div>
    `;
    
    setTimeout(() => {
      hidePopup();
      renderEmployerSubPage('candidatemanagement');
    }, 2000);
  }, 1500);
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
    saveChat(appId, chats[appId]); // Firebase
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
      deleteApplication(app.pin); // Firebase
      saveProcessed(app); // Firebase
      hidePopup();
      showNotification(`Application ${status} successfully.`);
      setTimeout(() => renderEmployerSubPage('candidates'), 3000);
    } else {
      saveApplication(app); // Firebase
      showNotification('Application status updated to Pending.');
    }
  }
}

// Reset All Data Function
function confirmResetData() {
  showPopup(`
    <h2 style="font-size:1.8rem; font-weight:700; margin-bottom:1rem; color:#ff3b30;">⚠️ Reset All Data</h2>
    <p style="font-size:1.1rem; margin-bottom:2rem; line-height:1.6;">Are you sure you want to permanently delete all job listings, applications, and processed data? This action cannot be undone.</p>
    <div style="display:flex; gap:1rem;">
      <button onclick="resetAllData()" class="big" style="flex:1; background:#ff3b30;">Yes, Reset Everything</button>
      <button onclick="hidePopup()" class="big" style="flex:1; background:#8e8e93;">No, Cancel</button>
    </div>
  `);
}

function resetAllData() {
  const overlay = document.getElementById('popup-overlay');
  const popup = document.getElementById('popup');
  
  if (overlay && popup) {
    // Show erasing message with loading
    popup.classList.add('hidden');
    overlay.innerHTML = '<div class="loading-overlay"><div class="spinner"></div><p style="color:#fff; margin-top:2rem; font-size:1.2rem; font-weight:600;">Permanently erasing your data. Please wait...</p></div>';
    overlay.classList.remove('hidden');
    
    setTimeout(() => {
      // Clear all data from Firebase
      jobsRef.remove();
      applicationsRef.remove();
      processedRef.remove();
      chatsRef.remove();
      
      // Reset in-memory data (will be cleared by Firebase listeners)
      jobs = [];
      applications = [];
      processed = [];
      chats = {};
      
      playSuccessSound();
      
      // Show success message
      overlay.innerHTML = `
        <div class="success-screen">
          <div class="tick">✓</div>
          <h2 style="font-size:1.8rem; font-weight:700; margin-bottom:1rem;">Data Reset Complete!</h2>
          <p style="font-size:1rem; color:#6e6e73; margin-bottom:1.5rem;">All job listings, applications, and processed data have been permanently erased.</p>
          <button class="big" onclick="hidePopup(); renderEmployerSubPage('dashboard');" style="padding:1rem 2rem;">Continue</button>
        </div>
      `;
    }, 2000);
  }
}
