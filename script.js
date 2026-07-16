// script.js - Organized Layout, Professional, No Initial Data, Refined Payment

// Data Structures - ALL SENSITIVE DATA NOW IN BACKEND
// No more hardcoded credentials visible in browser!
const COMPANIES = ['Cirkle Development', 'Aer Lingus', 'DevDen', 'Cirkle Group Careers', 'Cambridge Secondary School', 'RoIsland'];

const COMPANY_MEDIA = {
  'Cirkle Development': { logo: 'maincirklelogo.png', banner: 'ssmartpal2banner.png', channelId: '1473377571482894478', rolePing: '<@&1315065603178102794>', accent: '#5856d6' },
  'Aer Lingus': { logo: 'aerlinguslogo.jpg', banner: 'aerlingusbanner.png', channelId: '1395759805305716848', rolePing: '<@&1396248348595323163>', accent: '#00ff00' },
  'DevDen': { logo: 'devdenlogo.png', banner: 'Shannon%20Airport.png', channelId: '1473377571482894478', rolePing: '<@&1144662197335769089>', accent: '#ff6b6b' },
  'Cirkle Group Careers': { logo: 'cirklegoruplogo.jpg', banner: 'cirklepage.png', channelId: '1473377571482894478', rolePing: '<@&1315065603178102794>', accent: '#007aff' },
  'Cambridge Secondary School': { logo: 'NEW_CSS_LOGO_WTH_BACKROUNF.webp', banner: 'CB_NEW_GROUP.webp', channelId: '1524382280695676938', rolePing: '<@&1315065603178102794>', accent: '#2e8b57' },
  'RoIsland': { logo: 'IMG_4003.webp', banner: null, channelId: '1515533533114925126', rolePing: '<@&1315065603178102794>', accent: '#d97706' }
};

// Company logos - using permanent Discord CDN links (no expiry parameters)
const COMPANY_LOGOS = {
  'Cirkle Development': COMPANY_MEDIA['Cirkle Development'].logo,
  'Aer Lingus': COMPANY_MEDIA['Aer Lingus'].logo,
  'DevDen': COMPANY_MEDIA['DevDen'].logo,
  'Cirkle Group Careers': COMPANY_MEDIA['Cirkle Group Careers'].logo,
  'Cambridge Secondary School': COMPANY_MEDIA['Cambridge Secondary School'].logo,
  'RoIsland': COMPANY_MEDIA['RoIsland'].logo
};

const COMPANY_BANNERS = {
  'Cirkle Development': COMPANY_MEDIA['Cirkle Development'].banner,
  'Aer Lingus': COMPANY_MEDIA['Aer Lingus'].banner,
  'DevDen': COMPANY_MEDIA['DevDen'].banner,
  'Cirkle Group Careers': COMPANY_MEDIA['Cirkle Group Careers'].banner,
  'Cambridge Secondary School': COMPANY_MEDIA['Cambridge Secondary School'].banner,
  'RoIsland': COMPANY_MEDIA['RoIsland'].banner
};

const COMPANY_CHANNELS = {
  'Cirkle Development': COMPANY_MEDIA['Cirkle Development'].channelId,
  'Cirkle Group Careers': COMPANY_MEDIA['Cirkle Group Careers'].channelId,
  'Aer Lingus': COMPANY_MEDIA['Aer Lingus'].channelId,
  'DevDen': COMPANY_MEDIA['DevDen'].channelId,
  'Cambridge Secondary School': COMPANY_MEDIA['Cambridge Secondary School'].channelId,
  'RoIsland': COMPANY_MEDIA['RoIsland'].channelId
};

const COMPANY_ROLE_PINGS = {
  'Cirkle Development': COMPANY_MEDIA['Cirkle Development'].rolePing,
  'Cirkle Group Careers': COMPANY_MEDIA['Cirkle Group Careers'].rolePing,
  'Aer Lingus': COMPANY_MEDIA['Aer Lingus'].rolePing,
  'DevDen': COMPANY_MEDIA['DevDen'].rolePing,
  'Cambridge Secondary School': COMPANY_MEDIA['Cambridge Secondary School'].rolePing,
  'RoIsland': COMPANY_MEDIA['RoIsland'].rolePing
};

const STARTUP_LOADING_DURATION = 2000;
const INTERACTION_LOADING_DURATION = 800;

function getCompanyBanner(companyName) {
  return COMPANY_BANNERS[companyName] || null;
}

function getCompanyAccent(companyName) {
  return COMPANY_MEDIA[companyName]?.accent || '#007aff';
}

function showStartupLoadingScreen() {
  if (document.getElementById('startup-loading-screen')) return;
  const overlay = document.createElement('div');
  overlay.id = 'startup-loading-screen';
  overlay.innerHTML = '<div class="startup-loading-card"><img src="tlogo.png" alt="Loading" class="startup-loading-logo"></div>';
  document.body.appendChild(overlay);
}

function hideStartupLoadingScreen() {
  document.getElementById('startup-loading-screen')?.remove();
}

// Fallback function to get company logo with error handling
function getCompanyLogo(companyName) {
  const logo = COMPANY_LOGOS[companyName];
  if (!logo) {
    console.warn(`No logo found for company: ${companyName}`);
    // Return a placeholder with the company's first letter
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=007aff&color=fff&size=120&bold=true`;
  }
  return logo;
}

// Data will be loaded from backend - see backend-api.js
// let currentUser, jobs, applications, processed, chats, employers are defined in backend-api.js
let currentUser = null;
let editingJobId = null;

// Chat live functionality
var activeChatId = null;
let chatPollInterval = null;
let typingTimeout = null;

function isMarcusRay() {
  return (currentUser?.name || '').trim() === 'Marcus Ray' || currentUser?.id === '1088907566844739624';
}

async function logPortalEvent(title, description, fields = [], color = 0x007aff) {
  try {
    await fetch(`${BACKEND_URL}/api/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, fields, color })
    });
  } catch (error) {
    console.error('[LOGGING] Failed to write portal log:', error);
  }
}

async function fetchDiscordProfilePicture(discordId) {
  if (!discordId) return 'https://cdn.discordapp.com/embed/avatars/0.png';

  try {
    const response = await fetch(`${BACKEND_URL}/api/discord/user/${discordId}`);
    const result = await response.json();
    return result?.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png';
  } catch (error) {
    console.error('[Discord Profile] Failed to fetch avatar:', error);
    return 'https://cdn.discordapp.com/embed/avatars/0.png';
  }
}

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
  // Stop chat polling when popup closes
  if (typeof stopChatPolling !== 'undefined') {
    stopChatPolling();
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

function setVacancyMetadata(job) {
  if (!job) return;

  const title = `${job.title} at ${job.company} | Cirkle Careers`;
  const description = (job.description || '').replace(/\s+/g, ' ').trim().slice(0, 180) || `Apply for ${job.title} at ${job.company}.`;
  const companyLogo = getCompanyLogo(job.company || 'Cirkle Development');

  document.title = title;

  const setMeta = (selector, value, attr = 'content') => {
    let meta = document.querySelector(selector);
    if (!meta) {
      meta = document.createElement('meta');
      const isProperty = selector.includes('property=');
      const key = isProperty ? 'property' : 'name';
      const match = selector.match(/\[(?:property|name)="([^"]+)"\]/);
      if (match) meta.setAttribute(key, match[1]);
      document.head.appendChild(meta);
    }
    meta.setAttribute(attr, value);
  };

  setMeta('meta[property="og:title"]', title);
  setMeta('meta[property="og:description"]', description);
  setMeta('meta[property="og:image"]', companyLogo);
  setMeta('meta[name="twitter:title"]', title);
  setMeta('meta[name="twitter:description"]', description);
  setMeta('meta[name="twitter:image"]', companyLogo);
  setMeta('meta[name="description"]', description);
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
  showStartupLoadingScreen();
  setTimeout(() => hideStartupLoadingScreen(), STARTUP_LOADING_DURATION);

  // Update header immediately on load to prevent flash
  updateHeader();
  
  // Check for existing session
  const savedUser = sessionStorage.getItem('currentUser');
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      // If user was logged in, restore their session
      if (currentUser && window.location.hash.includes('employerportal')) {
        updateHeader(); // Update header again after user is loaded
        renderPage();
        return;
      }
    } catch (e) {
      sessionStorage.removeItem('currentUser');
    }
  }
  
  // Dark mode toggle
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('theme') || 'light';
  
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    if (themeToggle) themeToggle.textContent = '🌙';
  }
  
  themeToggle?.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.textContent = isDark ? '🌙' : '☀️';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Add rotation animation
    themeToggle.style.transform = 'rotate(360deg)';
    setTimeout(() => {
      themeToggle.style.transform = 'rotate(0deg)';
    }, 600);
  });
  
  // Employer login dropdown
  document.getElementById('employer-login-btn')?.addEventListener('click', () => {
    document.getElementById('login-dropdown')?.classList.toggle('hidden');
  });
  document.getElementById('login-submit')?.addEventListener('click', login);
  
  // Navigation buttons
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
  setTimeout(() => renderPage(), STARTUP_LOADING_DURATION);
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
        // Save session to sessionStorage
        sessionStorage.setItem('currentUser', JSON.stringify(result.user));
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
        // Clear session storage
        sessionStorage.removeItem('currentUser');
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
    if (!isBackendReady && !hash.startsWith('apply/')) {
      main.innerHTML = '<div class="box"><p style="text-align:center; padding:2rem; color:#6e6e73;">Loading portal data...</p></div>';
      return;
    }

    // Add page transition animation
    const animations = ['page-transition-fade', 'page-transition-slide-left', 'page-transition-slide-right', 'page-transition-slide-up', 'page-transition-scale', 'page-transition-rotate'];
    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
    
    // Clear previous animations
    main.className = '';
    
    // Fade out
    main.style.opacity = '0';
    main.style.transform = 'translateY(20px)';
    main.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
    
    setTimeout(() => {
      main.innerHTML = '';
      
      if (hash.startsWith('employerportal/')) {
        if (!currentUser) return navigate('home');
        const subpage = hash.split('/')[1];
        renderEmployerPage(subpage);
      } else if (hash.startsWith('apply/')) {
        const jobId = parseInt(hash.split('/')[1]);
        showLoading();
        setTimeout(() => renderApplicationPage(jobId), INTERACTION_LOADING_DURATION);
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
        main.style.transition = 'opacity 0.35s ease-out, transform 0.35s ease-out';
        main.style.opacity = '1';
        main.style.transform = 'translateY(0)';
      }, 50);
    }, 120);
  }
}

function renderHome() {
  const main = document.getElementById('main-content');
  if (main) {
    main.innerHTML = `
      <div style="text-align:center; padding:2rem 0;">
        <h1 id="animated-title" style="font-size:3rem; font-weight:800; margin-bottom:1rem; transition: color 0.8s ease-in-out;">Cirkle Development Careers</h1>
        <p style="font-size:1.2rem; color:#6e6e73; max-width:700px; margin:0 auto 2rem; line-height:1.8;">Join our growing family of ${COMPANIES.length} innovative companies and talented professionals</p>
      </div>
      
      <img src="https://cdn.discordapp.com/attachments/1404157487799861332/1432846309362237480/image.png" alt="Cirkle Careers Banner" style="width:100%; border-radius:20px; margin-bottom:3rem; box-shadow:0 8px 24px rgba(0,0,0,0.12);" onerror="this.style.display='none';">
      
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
      <p style="text-align:center; font-size:1.1rem; color:#6e6e73; margin-bottom:2rem;">Explore opportunities across our family of ${COMPANIES.length} companies</p>
      <img src="https://cdn.discordapp.com/attachments/1404157487799861332/1432846309362237480/image.png" alt="Vacancies Banner" style="border-radius:20px; margin-bottom:2.5rem; width:100%; box-shadow:0 8px 24px rgba(0,0,0,0.12);" onerror="this.style.display='none';">
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1.5rem;">
    `;
    
    COMPANIES.forEach(company => {
      // Normalize company name for comparison (trim whitespace)
      const normalizedCompany = company.trim();
      const count = jobs.filter(j => {
        const jobCompany = (j.company || '').toString().trim();
        return jobCompany === normalizedCompany && j.active;
      }).length;
      
      const logo = getCompanyLogo(company);
      const banner = getCompanyBanner(company);
      const accent = getCompanyAccent(company);
      
      main.innerHTML += `
        <div class="company-card" onclick="navigate('company/${encodeURIComponent(company)}')" style="cursor:pointer; overflow:hidden; background:#fff; border-radius:20px; box-shadow:0 8px 24px rgba(0,0,0,0.08); transition:transform 0.28s ease, box-shadow 0.28s ease;">
          <div style="position:relative; min-height:180px; background:${banner ? '#111' : `linear-gradient(135deg, ${accent} 0%, #111827 100%)`};">
            ${banner ? `<img src="${banner}" alt="${company} banner" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none';">` : ''}
            <div style="position:absolute; inset:0; background:linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.72) 100%);"></div>
            <div style="position:absolute; left:1rem; right:1rem; bottom:1rem; display:flex; align-items:center; gap:0.9rem; z-index:1;">
              <img src="${logo}" alt="${company}" style="width:58px; height:58px; border-radius:14px; object-fit:cover; background:#fff; box-shadow:0 4px 14px rgba(0,0,0,0.22);" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(company)}&background=007aff&color=fff&size=80&bold=true';">
              <div style="min-width:0; flex:1; color:#fff;">
                <h3 style="font-size:1.2rem; font-weight:800; margin:0 0 0.2rem; line-height:1.1;">${company}</h3>
                <p style="font-size:0.9rem; opacity:0.9; margin:0;">Tap to view current openings</p>
              </div>
              <div style="background:${count > 0 ? '#34c759' : 'rgba(255,255,255,0.16)'}; color:#fff; padding:0.45rem 0.8rem; border-radius:999px; font-weight:800; font-size:1rem; min-width:58px; text-align:center; backdrop-filter:blur(10px);">
                ${count}
              </div>
            </div>
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
    const logo = getCompanyLogo(company);
    const banner = getCompanyBanner(company);
    const accent = getCompanyAccent(company);
    
    // Normalize company name for comparison
    const normalizedCompany = company.trim();
    const list = jobs.filter(j => {
      const jobCompany = (j.company || '').toString().trim();
      const isMatch = jobCompany === normalizedCompany && j.active;
      console.log(`[JOB FILTER] Checking job "${j.title}": company="${jobCompany}", target="${normalizedCompany}", active=${j.active}, match=${isMatch}`);
      return isMatch;
    });
    
    console.log(`[COMPANY JOBS] Rendering ${list.length} jobs for company: "${company}"`);
    console.log(`[COMPANY JOBS] All jobs:`, jobs.map(j => ({ title: j.title, company: j.company, active: j.active })));
    
    main.innerHTML = `
      <div style="text-align:center; margin-bottom:2rem;">
        <div style="position:relative; overflow:hidden; min-height:220px; border-radius:24px; background:${banner ? '#111' : `linear-gradient(135deg, ${accent} 0%, #111827 100%)`}; box-shadow:0 10px 30px rgba(0,0,0,0.12); margin-bottom:1rem;">
          ${banner ? `<img src="${banner}" alt="${company} banner" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none';">` : ''}
          <div style="position:absolute; inset:0; background:linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.76) 100%);"></div>
          <div style="position:absolute; left:1.25rem; right:1.25rem; bottom:1.25rem; display:flex; align-items:center; gap:1rem; z-index:1; text-align:left;">
            <img src="${logo}" alt="${company}" style="width:84px; height:84px; border-radius:18px; object-fit:cover; background:#fff; box-shadow:0 6px 20px rgba(0,0,0,0.24);" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(company)}&background=007aff&color=fff&size=120&bold=true';">
            <div style="color:#fff; min-width:0;">
              <h1 style="font-size:2rem; font-weight:900; margin:0 0 0.25rem; line-height:1.05;">${company}</h1>
              <p style="font-size:1rem; opacity:0.9; margin:0;">${list.length} active position${list.length !== 1 ? 's' : ''} available</p>
            </div>
          </div>
        </div>
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
    showLoading();
    setTimeout(() => {
      showPopup(`
        <h2 style="font-size:2rem; font-weight:600; margin-bottom:1rem;">${job.title}</h2>
        <p style="margin-bottom:1rem; line-height:1.6; white-space:pre-wrap;">${job.description}</p>
        ${job.requirements ? `<div style="margin-bottom:1rem;"><strong>Requirements:</strong><p style="line-height:1.6; white-space:pre-wrap; margin-top:0.5rem;">${job.requirements}</p></div>` : ''}
        <p style="font-weight:600; margin-bottom:1.5rem;">Payment: ${job.payment}</p>
        <button class="big" onclick="navigate('apply/${job.id}'); hidePopup();" style="width:100%;">Apply Now</button>
      `, false);
    }, INTERACTION_LOADING_DURATION);
  }
}

function renderApplicationPage(jobId) {
  const job = jobs.find(j => j.id === jobId);
  const main = document.getElementById('main-content');
  if (!job || !main) {
    hidePopup();
    navigate('home');
    return;
  }

  hidePopup();
  setVacancyMetadata(job);
  
  main.style.padding = '2rem';
  let content = `
    <div style="max-width:800px; margin:0 auto;">
      <h1 style="font-size:2.5rem; font-weight:700; margin-bottom:1rem;">${job.title}</h1>
      <p style="font-size:1.1rem; margin-bottom:2rem; line-height:1.6; white-space:pre-wrap;">${job.description}</p>
      ${job.requirements ? `<div style="margin-bottom:2rem;"><strong style="font-size:1.2rem;">Requirements:</strong><p style="font-size:1rem; line-height:1.6; white-space:pre-wrap; margin-top:0.5rem;">${job.requirements}</p></div>` : ''}
      <p style="font-weight:600; margin-bottom:2rem;">Payment: ${job.payment}</p>
      <div style="background:#fff; padding:2rem; border-radius:20px; box-shadow:0 4px 16px rgba(0,0,0,0.08);">`;
  
  if (job.options.name) content += '<label style="display:block; font-weight:600; margin-bottom:0.5rem;">Full Name *</label><input type="text" id="app-name" placeholder="Enter your full name" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:1.5rem; transition:border 0.3s;"><br>';
  
  if (job.options.email) content += '<label style="display:block; font-weight:600; margin-bottom:0.5rem;">Email Address *</label><input type="email" id="app-email" placeholder="Enter your email" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:1.5rem; transition:border 0.3s;"><br>';
  
  if (job.options.discord) content += '<label style="display:block; font-weight:600; margin-bottom:0.5rem;">Discord ID *</label><p style="font-size:0.9rem; color:#6e6e73; margin-bottom:0.8rem; line-height:1.5;">Please enter your Discord User ID. <strong>NOT YOUR USERNAME.</strong> This is a mandatory field. Please make sure there are no spaces either. This is to ensure you receive Discord DMs from allCareers Bot.</p><input type="text" id="app-discord" placeholder="Enter your Discord User ID (e.g., 1234567890123456789)" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:1.5rem; transition:border 0.3s;" required><br>';
  
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
  
  // Generate unique ID immediately (not inside setTimeout)
  const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
  const pin = generatePin();
  
  setTimeout(async () => {
    let applicationCompleted = false;
    const app = { 
      id: uniqueId, 
      jobId, 
      data: {}, 
      pin: pin, 
      status: 'Processing', 
      handler: '',
      appliedDate: new Date().toISOString()
    };
    try {
      console.log(`[APP DEBUG] Generated PIN for application: ${pin}, ID: ${uniqueId}`);

      const job = jobs.find(j => j.id === jobId);
      if (!job) {
        showNotification('Application failed to load. Please try again.');
        return;
      }

      const jobOptions = job.options || {};
      const jobQuestions = Array.isArray(job.questions) ? job.questions : [];
      const companyKey = (job.company || '').toString().trim();

      console.log(`[APP DEBUG] Submitting application for job: ${job.title} (Company: ${job.company})`);
      app.job = job.title;

      if (jobOptions.name) app.data.name = document.getElementById('app-name')?.value || '';
      if (jobOptions.email) app.data.email = document.getElementById('app-email')?.value || '';
      if (jobOptions.discord) {
        app.data.discord = document.getElementById('app-discord')?.value || '';
        app.data.discordPfp = await fetchDiscordProfilePicture(app.data.discord);
      }
      if (jobOptions.roblox) {
        app.data.roblox = document.getElementById('app-roblox')?.value || '';
        app.data.robloxAvatar = 'https://via.placeholder.com/48?text=R';
      }
      if (jobOptions.cv) {
        const cvFile = document.getElementById('app-cv')?.files?.[0];
        app.data.cv = cvFile ? `📎 ${cvFile.name} (${(cvFile.size / 1024).toFixed(1)} KB)` : '';
      }
      if (jobOptions.experience) app.data.experience = document.getElementById('app-experience')?.value || '';

      app.data.answers = {};
      jobQuestions.forEach((question, index) => {
        const sanitizedKey = (question.title || `Question ${index + 1}`).replace(/[.$#\[\]\/:?*]/g, '_');

        if (question.type === 'short' || question.type === 'paragraph') {
          app.data.answers[sanitizedKey] = document.getElementById(`q-${index}`)?.value || '';
        } else if (question.type === 'multiple' || question.type === 'multi') {
          const selected = document.querySelectorAll(`input[name="q-${index}"]:checked`);
          app.data.answers[sanitizedKey] = Array.from(selected).map(input => input.value).join(', ');
        }
      });

      job.submissions = (job.submissions || 0) + 1;
      await saveJob(job);

      console.log(`[APP DEBUG] Saving application with PIN: ${app.pin}`);
      console.log(`[APP DEBUG] Full application data being saved:`, app);

      const saveResult = await saveApplication(app);
      if (saveResult && saveResult.error) {
        throw new Error(`Firebase error: ${saveResult.error}`);
      }

      saveChat(app.id, []);

      setTimeout(async () => {
        await loadApplications();
        const savedApp = applications.find(a => a.pin === app.pin);
        if (!savedApp) {
          showNotification('⚠️ Application may not have saved properly. Please contact support with PIN: ' + app.pin);
        }
      }, 2000);

      if (job.assigned && Array.isArray(job.assigned) && typeof fetch === 'function') {
        (async () => {
          for (const assignedName of job.assigned) {
            try {
              const employer = (employers || []).find(e => (e.name || '').toString().trim() === (assignedName || '').toString().trim());
              if (!employer?.id) continue;

              await fetch(`${BACKEND_URL}/api/discord/dm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: employer.id,
                  message: {
                    embeds: [{
                      title: '🔔 New Assigned Application',
                      description: 'An application that you have been assigned to has been submitted.',
                      color: 0x007AFF,
                      fields: [
                        { name: 'Application', value: job.title, inline: true },
                        { name: 'Submitted', value: new Date(app.appliedDate).toLocaleString(), inline: true },
                        { name: '🔑 Candidate PIN', value: `\`${app.pin}\``, inline: true },
                        { name: '\u200b', value: 'Log on to your employer dashboard to manage this application.', inline: false }
                      ],
                      timestamp: new Date().toISOString()
                    }]
                  }
                })
              });
            } catch (err) {
              console.error('Failed to notify assigned employer:', assignedName, err);
            }
          }
        })();
      }

      if (app.data.discord) {
        try {
          const companyLogo = getCompanyLogo(companyKey);

          await fetch(`${BACKEND_URL}/api/discord/dm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: app.data.discord,
              message: {
                embeds: [{
                  title: '✅ Application Received',
                  description: `**RE: ${job.title}**`,
                  color: 0x007AFF,
                  thumbnail: { url: companyLogo },
                  fields: [
                    {
                      name: '\u200b',
                      value: `Dear Candidate,\n\nThank you for submitting your application for the **${job.title}** position at **${job.company}**.\n\nYour application has been received and is currently under review. Please keep an eye on this bot's DM for further updates. Your status is: **🔃 Processing** .\n\nPlease keep your Application PIN safe for future reference. \n\nKind Regards,\nallCareers Department`,
                      inline: false
                    },
                    { name: '🏢 Company', value: job.company, inline: true },
                    { name: '🔑 Application PIN', value: `\`${app.pin}\``, inline: true },
                    { name: '📅 Submitted', value: new Date(app.appliedDate).toLocaleDateString(), inline: true }
                  ],
                  footer: {
                    text: 'allCareers • Cirkle Development Group',
                    icon_url: 'https://media.discordapp.net/attachments/1315278404009988107/1425166771413057578/Eco_Clean.png.jpg'
                  },
                  timestamp: new Date().toISOString()
                }]
              }
            })
          });
        } catch (error) {
          console.error('Error sending Discord DM:', error);
        }
      }

      const CHANNEL_ID = COMPANY_CHANNELS[companyKey] || COMPANY_CHANNELS['Cirkle Development'];
      const ROLE_PING = COMPANY_ROLE_PINGS[companyKey] || COMPANY_ROLE_PINGS['Cirkle Development'];

      if (CHANNEL_ID) {
        try {
          const embed = {
            title: `🆕 New Application: ${job.title}`,
            color: 0x007AFF,
            description: `${ROLE_PING}`,
            fields: [
              { name: '📋 Position', value: job.title, inline: true },
              { name: '🏢 Company', value: job.company, inline: true },
              { name: '📅 Applied', value: new Date(app.appliedDate).toLocaleString(), inline: false }
            ],
            timestamp: new Date().toISOString(),
            footer: { text: '🛡️ SENTINEL Security Protected' }
          };

          if (app.data.name) embed.fields.push({ name: '👤 Name', value: app.data.name, inline: true });
          if (app.data.email) embed.fields.push({ name: '📧 Email', value: app.data.email, inline: true });
          if (app.data.discord) embed.fields.push({ name: '💬 Discord ID', value: app.data.discord, inline: true });
          if (app.data.roblox) embed.fields.push({ name: '🎮 Roblox ID', value: app.data.roblox, inline: true });
          if (app.data.cv) embed.fields.push({ name: '📄 CV', value: app.data.cv, inline: false });
          if (app.data.experience) embed.fields.push({ name: '💼 Experience', value: app.data.experience.substring(0, 1000), inline: false });

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

          await fetch(`${BACKEND_URL}/api/discord/channel-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              channelId: CHANNEL_ID,
              content: ROLE_PING,
              embeds: [embed]
            })
          });

          console.log('[SENTINEL] ✅ Application notification sent via secure channel');
        } catch (e) {
          console.error('[SENTINEL] ❌ Channel notification failed:', e);
        }
      }

      applicationCompleted = true;
      hidePopup();
      playSuccessSound();
      showSuccessScreen('Successfully Applied!', app.pin, true);
    } catch (error) {
      console.error('[APP DEBUG] Application submission failed unexpectedly:', error);
      showNotification('Application failed to load. Please try again.');
    } finally {
      if (!applicationCompleted) {
        hidePopup();
      }
    }
  }, INTERACTION_LOADING_DURATION);
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
  console.log(`[PIN DEBUG] Checking status for PIN: ${pin}`);
  if (pin) {
    console.log(`[PIN DEBUG] Searching in ${applications.length} applications and ${processed.length} processed`);
    applications.forEach((a, i) => console.log(`[PIN DEBUG] App ${i}: PIN="${a.pin}"`));
    
    const app = applications.find(a => a.pin === pin) || processed.find(h => h.pin === pin);
    if (app) {
      console.log(`[PIN DEBUG] Found application:`, app);
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
      console.error(`[PIN DEBUG] No application found with PIN: ${pin}`);
      showNotification('Invalid PIN. Please check and try again.');
    }
  } else {
    console.warn(`[PIN DEBUG] No PIN entered`);
  }
}

// ============================
// ANNOUNCEMENT FUNCTIONS
// ============================

function openAnnouncementModal() {
  const modalContent = `
    <div style="max-width:600px; margin:auto;">
      <h2 style="font-size:1.8rem; font-weight:700; margin-bottom:1.5rem;">📢 Broadcast Announcement</h2>
      
      <div style="margin-bottom:1.5rem;">
        <label style="display:block; font-weight:600; margin-bottom:0.5rem;">Announcement Title</label>
        <input type="text" id="announcement-title" placeholder="e.g., Important Update About Your Application" 
          style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; font-size:1rem; box-sizing:border-box;">
      </div>
      
      <div style="margin-bottom:1.5rem;">
        <label style="display:block; font-weight:600; margin-bottom:0.5rem;">Announcement Message</label>
        <textarea id="announcement-content" placeholder="Enter your announcement message here..." 
          style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; font-size:1rem; min-height:200px; resize:vertical; font-family:inherit; box-sizing:border-box;"></textarea>
        <p style="font-size:0.85rem; color:#6e6e73; margin-top:0.5rem;">This message will be sent via Discord DM to all pending candidates.</p>
      </div>
      
      <div style="background:#f5f5f7; padding:1rem; border-radius:8px; margin-bottom:1.5rem;">
        <p style="font-weight:600; margin-bottom:0.5rem;">Preview:</p>
        <div id="announcement-preview" style="background:#fff; padding:0.75rem; border-radius:6px; color:#6e6e73; font-size:0.9rem; min-height:100px;">
          <p style="color:#999; text-align:center; padding:1rem;">Your message preview will appear here...</p>
        </div>
      </div>
      
      <div style="display:flex; gap:1rem; justify-content:flex-end;">
        <button class="btn btn-secondary" onclick="hidePopup()">Cancel</button>
        <button class="big" id="publish-btn" onclick="broadcastAnnouncement()" style="background:#5856d6;">Publish to Pending Candidates</button>
      </div>
    </div>
  `;
  
  showPopup(modalContent);
  
  // Add real-time preview
  const titleInput = document.getElementById('announcement-title');
  const contentInput = document.getElementById('announcement-content');
  const preview = document.getElementById('announcement-preview');
  
  const updatePreview = () => {
    const title = titleInput?.value || 'Announcement Title';
    const content = contentInput?.value || 'Your message will appear here...';
    preview.innerHTML = `<p style="font-weight:600; margin-bottom:0.5rem; color:#000;">${title}</p><p>${content}</p>`;
  };
  
  titleInput?.addEventListener('input', updatePreview);
  contentInput?.addEventListener('input', updatePreview);
}

async function broadcastAnnouncement() {
  const title = document.getElementById('announcement-title')?.value;
  const content = document.getElementById('announcement-content')?.value;
  const publishBtn = document.getElementById('publish-btn');
  
  if (!title || !content) {
    showNotification('Please fill in both title and message');
    return;
  }
  
  if (!currentUser) {
    showNotification('Error: User not authenticated');
    return;
  }
  
  // Disable button and show loading state
  publishBtn.disabled = true;
  publishBtn.textContent = '⏳ Publishing...';
  
  try {
    // Count pending candidates
    const currentUserFirstName = (currentUser.name || '').split(' ')[0].trim();
    const pendingCandidates = applications.filter(app => {
      const job = jobs.find(j => j.id === app.jobId);
      if (!job || !job.assigned) return false;
      return job.assigned.some(assignedName => {
        const trimmedAssigned = (assignedName || '').toString().trim();
        const assignedFirstName = trimmedAssigned.split(' ')[0];
        return trimmedAssigned === (currentUser.name || '').toString().trim() || 
               assignedFirstName === currentUserFirstName;
      });
    });
    
    const recipientCount = pendingCandidates.length;
    
    // Prepare announcement data
    const announcementData = {
      title,
      content,
      senderName: currentUser.name || currentUser.username || 'Unknown',
      senderId: currentUser.id,
      sentAt: new Date().toISOString(),
      recipientCount,
      candidates: pendingCandidates.map(app => ({
        id: app.id,
        name: app.data?.name || 'Unknown',
        discordId: app.data?.discord,
        email: app.data?.email
      }))
    };
    
    // Call API endpoint
    const response = await fetch(`${BACKEND_URL}/api/broadcast-announcement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(announcementData)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Log to Discord
    await logAnnouncementToChannel(title, content, recipientCount, currentUser.name);
    
    // Show success message
    hidePopup();
    showPopup(`
      <div class="success-screen">
        <div class="tick">✓</div>
        <h2 style="font-size:1.8rem; font-weight:700; margin-bottom:1rem;">Announcement Published!</h2>
        <p style="font-size:1rem; color:#6e6e73; margin-bottom:1.5rem;">Your announcement has been sent to <strong>${recipientCount} pending candidate${recipientCount !== 1 ? 's' : ''}</strong></p>
        <p style="font-size:0.95rem; color:#6e6e73; margin-bottom:2rem;">A log of this announcement has been posted to the announcements channel.</p>
        <button class="big" onclick="hidePopup()" style="padding:1rem 2rem;">Close</button>
      </div>
    `);
  } catch (error) {
    console.error('Error broadcasting announcement:', error);
    showNotification(`Failed to publish announcement: ${error.message}`);
    publishBtn.disabled = false;
    publishBtn.textContent = 'Publish to Pending Candidates';
  }
}

async function logAnnouncementToChannel(title, content, recipientCount, senderName) {
  try {
    const logChannelId = '1473734843618558006';
    
    const embed = {
      title: `📢 Announcement Broadcast Log`,
      description: `An announcement has been published to pending candidates.`,
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
          value: `${recipientCount} candidate${recipientCount !== 1 ? 's' : ''}`,
          inline: true
        },
        {
          name: '⏰ Time',
          value: new Date().toLocaleString(),
          inline: true
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: '🛡️ Announcement logged by system'
      }
    };
    
    // Call Discord logging endpoint
    await fetch(`${BACKEND_URL}/api/discord/channel-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channelId: logChannelId,
        message: { embeds: [embed] }
      })
    });
    
    console.log('Announcement logged to Discord channel');
  } catch (error) {
    console.error('Error logging announcement to Discord:', error);
    // Don't throw - logging failure shouldn't block the announcement
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
    
    // Add banner after FAQs
    main.innerHTML += `
      <div style="max-width:900px; margin:3rem auto 0; text-align:center;">
        <img src="https://cdn.discordapp.com/attachments/1419317839269073016/1433857051699712081/allcareersbanner.png" 
             alt="allCareers Banner" 
             style="width:100%; max-width:800px; border-radius:16px; box-shadow:0 4px 12px rgba(0,0,0,0.08); transition:transform 0.3s;" 
             onmouseover="this.style.transform='scale(1.02)'" 
             onmouseout="this.style.transform='scale(1)'"
             onerror="this.style.display='none';">
      </div>
    `;
    
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
          <img src="${currentUser.pfp}" alt="${currentUser.name}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=007aff&color=fff&size=80'">
          <h3 style="margin-top:0.75rem; font-size:1.1rem;">${currentUser.name}</h3>
          <p style="color:#6e6e73; font-size:0.9rem;">${currentUser.role}</p>
        </div>
        <button data-emp="dashboard" class="menu-btn">Dashboard</button>
        <button data-emp="candidatemanagement" class="menu-btn">Candidate Management</button>
        <button data-emp="joblistings" class="menu-btn">Job Listings</button>
        ${isMarcusRay() ? '<button data-emp="employers" class="menu-btn">Employers</button>' : ''}
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
      const currentUserFirstName = (currentUser.name || '').split(' ')[0].trim();
      subContent = `
        <h2 style="font-size:2rem; font-weight:700; margin-bottom:2rem;">Dashboard</h2>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:1.5rem;">
          <div class="box">
            <h3>Assigned Applications</h3>
            <p style="font-size:2.5rem; font-weight:700; color:#007aff; margin:1rem 0;">${applications.filter(a => {
              const job = jobs.find(j => j.id === a.jobId);
              if (!job || !job.assigned) return false;
              return job.assigned.some(assignedName => {
                const trimmedAssigned = (assignedName || '').toString().trim();
                const assignedFirstName = trimmedAssigned.split(' ')[0];
                return trimmedAssigned === (currentUser.name || '').toString().trim() || 
                       assignedFirstName === currentUserFirstName;
              });
            }).length}</p>
          </div>
          <div class="box">
              <h3>Total Job Listings</h3>
              <p style="font-size:2.5rem; font-weight:700; color:#34c759; margin:1rem 0;">${jobs.filter(j => j.createdBy === currentUser.name).length}</p>
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
        const currentUserFirstName = (currentUser.name || '').split(' ')[0].trim();
        const pending = applications.filter(a => {
          const job = jobs.find(j => j.id === a.jobId);
          if (!job || !job.assigned) return false;
          return job.assigned.some(assignedName => {
            const trimmedAssigned = (assignedName || '').toString().trim();
            const assignedFirstName = trimmedAssigned.split(' ')[0];
            return trimmedAssigned === (currentUser.name || '').toString().trim() || 
                   assignedFirstName === currentUserFirstName;
          });
        }).length;
        
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
              <span style="color:#6e6e73; font-size:0.85rem; margin-right:1rem;">Assigned: ${(job.assigned || []).length ? job.assigned.join(', ') : 'Unassigned'}</span>
              <span style="color:#6e6e73; font-size:0.85rem; margin-right:1rem;">Created: ${new Date(job.creationDate).toLocaleDateString()}</span>
              <span style="color:#6e6e73; font-size:0.85rem; margin-right:1rem;">By: ${job.createdBy}</span>
              <span style="color:#6e6e73; font-size:0.85rem; margin-right:1rem;">Submissions: ${job.submissions}</span>
              <span class="trash" onclick="event.stopPropagation(); editJob(${job.id})" style="margin-right:0.75rem; cursor:pointer; font-size:1rem;">✎</span>
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

    case 'employers':
      if (!isMarcusRay()) {
        contentArea.innerHTML = '<div class="box"><p style="text-align:center; padding:2rem; color:#6e6e73;">You do not have access to this section.</p></div>';
        break;
      }

      contentArea.innerHTML = `
        <h2 style="font-size:2rem; font-weight:700; margin-bottom:1rem;">Employers</h2>
        <p style="color:#6e6e73; margin-bottom:1.5rem;">Manage who can access the employer portal.</p>
        <button class="big" onclick="openAddEmployerModal()" style="margin-bottom:1.5rem;">+ Add Employer</button>
        <div id="employers-list" class="box"></div>
      `;

      renderEmployerDirectory();
      break;
      
    case 'candidatemanagement':
      const tabs = ['processing', 'hired', 'rejected'];
      const currentTab = 'processing';
      
      // Count applications assigned to current user (check both full name and first name)
      const userAppsCount = applications.filter(app => {
        const job = jobs.find(j => j.id === app.jobId);
        if (!job || !job.assigned) return false;
        const currentUserFirstName = (currentUser.name || '').split(' ')[0].trim();
        return job.assigned.some(assignedName => {
          const trimmedAssigned = (assignedName || '').toString().trim();
          const assignedFirstName = trimmedAssigned.split(' ')[0];
          return trimmedAssigned === (currentUser.name || '').toString().trim() || 
                 assignedFirstName === currentUserFirstName;
        });
      }).length;
      
      const userProcessed = processed.filter(p => {
        const job = jobs.find(j => j.id === p.jobId);
        if (!job || !job.assigned) return false;
        const currentUserFirstName = (currentUser.name || '').split(' ')[0].trim();
        return job.assigned.some(assignedName => {
          const trimmedAssigned = (assignedName || '').toString().trim();
          const assignedFirstName = trimmedAssigned.split(' ')[0];
          return trimmedAssigned === (currentUser.name || '').toString().trim() || 
                 assignedFirstName === currentUserFirstName;
        });
      });
      
      const hiredCount = userProcessed.filter(p => p.status === 'Hired').length;
      const rejectedCount = userProcessed.filter(p => p.status === 'Rejected').length;
      
      subContent = `
        <h2 style="font-size:2rem; font-weight:700; margin-bottom:1.5rem;">Candidate Management</h2>
        <div style="display:flex; align-items:center; gap:1rem; margin-bottom:2rem; flex-wrap:wrap;">
          <div class="tab-buttons">
            <button class="tab-btn active" data-tab="processing">Processing (${userAppsCount})</button>
            <button class="tab-btn" data-tab="hired">Hired (${hiredCount})</button>
            <button class="tab-btn" data-tab="rejected">Rejected (${rejectedCount})</button>
          </div>
          <button class="big" onclick="openAnnouncementModal()" style="padding:0.6rem 1.2rem; font-size:0.95rem; background:#5856d6; margin-left:auto;">📢 Broadcast Announcement</button>
        </div>
        <div id="candidates-content"></div>
      `;
      
      contentArea.innerHTML = subContent;
      
      function renderCandidatesTab(tab) {
        const content = document.getElementById('candidates-content');
        if (!content) return;
        
        let html = '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:1.5rem;">';
        
        if (tab === 'processing') {
          // Filter applications assigned to current user (check both full name and first name)
          const currentUserFirstName = (currentUser.name || '').split(' ')[0].trim();
          const userApplications = applications.filter(app => {
            const job = jobs.find(j => j.id === app.jobId);
            if (!job || !job.assigned) return false;
            // Check if current user is assigned to this job
            return job.assigned.some(assignedName => {
              const trimmedAssigned = (assignedName || '').toString().trim();
              const assignedFirstName = trimmedAssigned.split(' ')[0];
              return trimmedAssigned === (currentUser.name || '').toString().trim() || 
                     assignedFirstName === currentUserFirstName;
            });
          });
          
          if (userApplications.length === 0) {
            html = '<div class="box"><p style="text-align:center; color:#6e6e73; padding:2rem 0;">No pending applications assigned to you</p></div>';
          } else {
            userApplications.forEach(app => {
              const job = jobs.find(j => j.id === app.jobId);
              html += `
                <div class="card" onclick="viewApplicationDetails(${app.id})" style="text-align:left; padding:1.5rem;">
                  <div style="display:flex; gap:0.75rem; margin-bottom:1rem;">
                    <img src="${app.data.discordPfp || 'https://via.placeholder.com/56'}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(app.data.name || 'User')}&background=007aff&color=fff&size=56'" style="width:56px; height:56px; border-radius:50%; border:3px solid #007aff;">
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
          // Filter processed apps assigned to current user (check both full name and first name)
          const currentUserFirstName = (currentUser.name || '').split(' ')[0].trim();
          const userProcessed = processed.filter(p => {
            const job = jobs.find(j => j.id === p.jobId);
            if (!job || !job.assigned) return false;
            return job.assigned.some(assignedName => {
              const trimmedAssigned = (assignedName || '').toString().trim();
              const assignedFirstName = trimmedAssigned.split(' ')[0];
              return trimmedAssigned === (currentUser.name || '').toString().trim() || 
                     assignedFirstName === currentUserFirstName;
            });
          });
          
          const hiredApps = userProcessed.filter(p => p.status === 'Hired');
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
          // Filter processed apps assigned to current user (check both full name and first name)
          const currentUserFirstName = (currentUser.name || '').split(' ')[0].trim();
          const userProcessed = processed.filter(p => {
            const job = jobs.find(j => j.id === p.jobId);
            if (!job || !job.assigned) return false;
            return job.assigned.some(assignedName => {
              const trimmedAssigned = (assignedName || '').toString().trim();
              const assignedFirstName = trimmedAssigned.split(' ')[0];
              return trimmedAssigned === (currentUser.name || '').toString().trim() || 
                     assignedFirstName === currentUserFirstName;
            });
          });
          
          const rejectedApps = userProcessed.filter(p => p.status === 'Rejected');
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

function createJob(job = null) {
  editingJobId = job?.id || null;
  questionCount = 0;

  let content = `
    <h2 style="font-size:2rem; font-weight:600; margin-bottom:1.5rem;">${job ? 'Edit Job Listing' : 'Create New Job Listing'}</h2>
    <label style="display:block; font-weight:500; margin-bottom:0.5rem;">Job Title</label>
    <input type="text" id="job-title" placeholder="e.g. Finance Manager" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:1.5rem;">
    <label style="display:block; font-weight:500; margin-bottom:0.5rem;">Job Description</label>
    <textarea id="job-desc" placeholder="Describe the role..." style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; height:150px; margin-bottom:1.5rem;"></textarea>
    <label style="display:block; font-weight:500; margin-bottom:0.5rem;">Requirements *</label>
    <textarea id="job-requirements" placeholder="List the job requirements (line breaks supported)..." style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; height:150px; margin-bottom:1.5rem;"></textarea>
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
      <label><input type="checkbox" id="opt-discord" checked disabled> Include Discord ID <span style="color:#ff3b30; font-weight:600;">(Required)</span></label>
      <label><input type="checkbox" id="opt-roblox"> Include Roblox ID</label>
      <label><input type="checkbox" id="opt-cv"> Include CV Upload</label>
      <label><input type="checkbox" id="opt-experience"> Include Past Experience</label>
    </div>
    <label style="display:block; font-weight:500; margin-bottom:0.5rem;">Extra Questions (Optional)</label>
    <div id="questions-container" style="margin-bottom:1rem;"></div>
    <button onclick="addQuestion()" style="background:none; color:#007aff; border:none; cursor:pointer; font-weight:500; margin-bottom:1.5rem;">+ Add Extra Question</button>
    <label style="display:block; font-weight:500; margin-bottom:0.5rem;">Assign Director(s)</label>
    <select id="assigned" multiple style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:1.5rem;">
      ${employers && employers.length > 0 ? employers.map(e => `<option>${e.name}</option>`).join('') : '<option>Sam</option><option>Marcus</option><option>Teejay</option><option>Magic</option><option>Chase Johnson</option><option>Carter</option>'}
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
    <button class="big" onclick="submitJob()" style="width:100%;">${job ? 'Save Changes' : 'Create Listing'}</button>
  `;
  showPopup(content, true);

  if (job) {
    const setValue = (id, value) => {
      const element = document.getElementById(id);
      if (element) element.value = value ?? '';
    };

    setValue('job-title', job.title);
    setValue('job-desc', job.description);
    setValue('job-requirements', job.requirements);
    setValue('payment-type', job.payment?.toLowerCase().startsWith('biweekly') ? 'biweekly' : job.payment?.toLowerCase().startsWith('set') ? 'set' : job.payment?.toLowerCase().startsWith('explained') ? 'explained' : 'notPayable');
    setValue('company', job.company);

    const assignedSelect = document.getElementById('assigned');
    if (assignedSelect && Array.isArray(job.assigned)) {
      Array.from(assignedSelect.options).forEach(option => {
        option.selected = job.assigned.includes(option.value);
      });
    }

    const statusOption = document.querySelector(`input[name="status"][value="${job.active ? 'open' : 'closed'}"]`);
    if (statusOption) statusOption.checked = true;

    const optionChecks = {
      'opt-name': !!job.options?.name,
      'opt-email': !!job.options?.email,
      'opt-discord': !!job.options?.discord,
      'opt-roblox': !!job.options?.roblox,
      'opt-cv': !!job.options?.cv,
      'opt-experience': !!job.options?.experience
    };
    Object.entries(optionChecks).forEach(([id, checked]) => {
      const element = document.getElementById(id);
      if (element) element.checked = checked;
    });

    if (Array.isArray(job.questions)) {
      job.questions.forEach(question => addQuestion(question));
    }
  }

  const paymentSelect = document.getElementById('payment-type');
  if (paymentSelect) {
    paymentSelect.addEventListener('change', updatePaymentDetails);
    updatePaymentDetails();
    if (job) {
      const paymentDetailInput = document.getElementById('payment-detail');
      if (paymentDetailInput) {
        paymentDetailInput.value = job.payment?.includes(':') ? job.payment.split(':').slice(1).join(':').trim() : '';
      }
    }
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

function addQuestionOption(questionId, value = '') {
  const optionList = document.getElementById(`q-option-list-${questionId}`);
  if (!optionList) return;

  const optionRow = document.createElement('div');
  optionRow.style.display = 'flex';
  optionRow.style.gap = '0.5rem';
  optionRow.style.alignItems = 'center';
  optionRow.style.marginBottom = '0.75rem';

  optionRow.innerHTML = `
    <input type="text" placeholder="Option" style="flex:1; width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6;">
    <button type="button" class="remove-option-btn" style="padding:0.8rem 1rem; border:none; border-radius:8px; background:#ff3b30; color:#fff; cursor:pointer;">Remove</button>
  `;

  optionRow.querySelector('input').value = value;
  optionRow.querySelector('.remove-option-btn').addEventListener('click', () => optionRow.remove());
  optionList.appendChild(optionRow);
}

function renderQuestionOptions(questionId, questionData = {}) {
  const optsDiv = document.getElementById(`q-options-${questionId}`);
  if (!optsDiv) return;

  const initialOptions = Array.isArray(questionData.options) && questionData.options.length > 0 ? questionData.options : ['', ''];
  optsDiv.innerHTML = `
    <label style="display:block; font-weight:500; margin-bottom:0.5rem;">Options</label>
    <div id="q-option-list-${questionId}"></div>
    <button type="button" class="add-option-btn" style="background:none; color:#007aff; border:none; cursor:pointer; font-weight:500; margin-top:0.25rem;">+ Add Option</button>
  `;

  initialOptions.forEach(option => addQuestionOption(questionId, option));
  optsDiv.querySelector('.add-option-btn')?.addEventListener('click', () => addQuestionOption(questionId));
}

function addQuestion(questionData = {}) {
  const container = document.getElementById('questions-container');
  if (container) {
    const id = questionCount++;
    const inputStyle = 'width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:0.75rem;';
    const questionCard = document.createElement('div');
    questionCard.className = 'question-editor';
    questionCard.dataset.questionId = id;
    questionCard.style.background = '#f2f2f7';
    questionCard.style.padding = '1rem';
    questionCard.style.borderRadius = '12px';
    questionCard.style.marginBottom = '1rem';
    questionCard.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; gap:1rem; margin-bottom:0.5rem;">
        <strong>Question ${id + 1}</strong>
        <button type="button" class="remove-question-btn" style="border:none; background:none; color:#ff3b30; cursor:pointer; font-weight:600;">Remove</button>
      </div>
      <input type="text" data-question-field="title" placeholder="Question Title" style="${inputStyle}">
      <textarea data-question-field="desc" placeholder="Optional Description" style="${inputStyle} height:80px;"></textarea>
      <select data-question-field="type" style="${inputStyle}">
        <option value="short">Short Text</option>
        <option value="paragraph">Paragraph</option>
        <option value="multiple">Multiple Choice</option>
        <option value="multi">Multi Select</option>
      </select>
      <div id="q-options-${id}" style="margin-top:0.75rem;"></div>
    `;

    questionCard.querySelector('.remove-question-btn').addEventListener('click', () => questionCard.remove());
    container.appendChild(questionCard);

    questionCard.querySelector('[data-question-field="title"]').value = questionData.title || '';
    questionCard.querySelector('[data-question-field="desc"]').value = questionData.desc || '';
    questionCard.querySelector('[data-question-field="type"]').value = questionData.type || 'short';

    const select = questionCard.querySelector('[data-question-field="type"]');
    if (select) {
      select.addEventListener('change', (e) => {
        const optsDiv = document.getElementById(`q-options-${id}`);
        if (!optsDiv) return;

        if (e.target.value === 'multiple' || e.target.value === 'multi') {
          renderQuestionOptions(id);
        } else {
          optsDiv.innerHTML = '';
        }
      });
    }

    if (questionData.type === 'multiple' || questionData.type === 'multi') {
      renderQuestionOptions(id, questionData);
    }
  }
}

function editJob(id) {
  const job = jobs.find(j => j.id === id || j.firebaseKey === id || j.firebaseKey === String(id));
  if (job) {
    createJob(job);
  }
}

async function renderEmployerDirectory() {
  const list = document.getElementById('employers-list');
  if (!list) return;

  if (!Array.isArray(employers) || employers.length === 0) {
    list.innerHTML = '<p style="text-align:center; color:#6e6e73; padding:2rem 0;">No employer accounts have been created yet.</p>';
    return;
  }

  list.innerHTML = employers.map(employer => {
    const employerId = employer.discordId || employer.id;
    const employerPfp = employer.pfp || `https://ui-avatars.com/api/?name=${encodeURIComponent(employer.name || 'Employer')}&background=007aff&color=fff&size=80`;
    return `
      <div class="row" style="padding:1rem; margin-bottom:0.75rem; display:flex; align-items:center; gap:1rem;">
        <img src="${employerPfp}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(employer.name || 'Employer')}&background=007aff&color=fff&size=80'" style="width:52px; height:52px; border-radius:50%; object-fit:cover;">
        <div style="flex:1; min-width:0;">
          <h3 style="font-size:1.1rem; margin-bottom:0.25rem;">${employer.name || 'Unknown Employer'}</h3>
          <p style="font-size:0.9rem; color:#6e6e73; margin-bottom:0.15rem;">${employer.role || 'No role set'}</p>
          <p style="font-size:0.85rem; color:#6e6e73;">Discord ID: ${employerId}</p>
        </div>
        <button class="big" onclick="deleteEmployerAccount('${employerId}')" style="background:#ff3b30; margin:0;">Remove</button>
      </div>
    `;
  }).join('');
}

function openAddEmployerModal() {
  if (!isMarcusRay()) return;

  showPopup(`
    <h2 style="font-size:2rem; font-weight:700; margin-bottom:1rem;">Add Employer</h2>
    <label style="display:block; font-weight:500; margin-bottom:0.5rem;">Discord ID</label>
    <input type="text" id="new-employer-id" placeholder="Discord user ID" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:1rem;">
    <label style="display:block; font-weight:500; margin-bottom:0.5rem;">Discord PIN</label>
    <input type="text" id="new-employer-pin" placeholder="PIN for portal login" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:1rem;">
    <label style="display:block; font-weight:500; margin-bottom:0.5rem;">Username</label>
    <input type="text" id="new-employer-name" placeholder="Username" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:1rem;">
    <label style="display:block; font-weight:500; margin-bottom:0.5rem;">Role</label>
    <input type="text" id="new-employer-role" placeholder="Role title" style="width:100%; padding:0.8rem; border-radius:8px; border:1px solid #d1d1d6; margin-bottom:1.5rem;">
    <div class="confirm-actions">
      <button class="big" onclick="saveEmployerAccount()" style="background:#34c759;">Publish</button>
      <button class="big" onclick="hidePopup()" style="background:#8e8e93;">Cancel</button>
    </div>
  `, true);
}

async function saveEmployerAccount() {
  const discordId = document.getElementById('new-employer-id')?.value?.trim();
  const pin = document.getElementById('new-employer-pin')?.value?.trim();
  const name = document.getElementById('new-employer-name')?.value?.trim();
  const role = document.getElementById('new-employer-role')?.value?.trim();

  if (!discordId || !pin || !name || !role) {
    showNotification('Please fill out all employer fields.');
    return;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/employers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discordId, pin, name, role })
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Unable to create employer account');
    }

    await loadEmployers();
    await renderEmployerDirectory();
    hidePopup();
    showNotification(`Employer account created for ${name}`);
  } catch (error) {
    console.error('Error creating employer account:', error);
    showNotification('Failed to create employer account.');
  }
}

function deleteEmployerAccount(discordId) {
  if (!discordId) return;

  showPopup(`
    <h2 style="font-size:1.8rem; font-weight:700; margin-bottom:1rem; color:#ff3b30;">Remove Employer</h2>
    <p style="margin-bottom:1.5rem;">Are you sure you want to remove this employer account?</p>
    <div class="confirm-actions">
      <button class="big" onclick="confirmDeleteEmployer('${discordId}')" style="background:#ff3b30;">Yes, Remove</button>
      <button class="big" onclick="hidePopup()" style="background:#8e8e93;">No, Cancel</button>
    </div>
  `);
}

async function confirmDeleteEmployer(discordId) {
  try {
    await fetch(`${BACKEND_URL}/api/employers/${discordId}`, { method: 'DELETE' });
    await loadEmployers();
    await renderEmployerDirectory();
    hidePopup();
    showNotification('Employer account removed.');
  } catch (error) {
    console.error('Error removing employer account:', error);
    showNotification('Failed to remove employer account.');
  }
}

async function submitJob() {
  const paymentType = document.getElementById('payment-type')?.value;
  const paymentDetail = document.getElementById('payment-detail')?.value || '';
  const requirements = document.getElementById('job-requirements')?.value;
  
  if (paymentType && document.getElementById('job-title')?.value && document.getElementById('job-desc')?.value && requirements) {
    const questionCards = Array.from(document.querySelectorAll('.question-editor'));
    const questions = questionCards.map(card => {
      const questionId = card.dataset.questionId;
      const title = card.querySelector('[data-question-field="title"]')?.value?.trim();
      const desc = card.querySelector('[data-question-field="desc"]')?.value?.trim() || '';
      const type = card.querySelector('[data-question-field="type"]')?.value || 'short';
      const options = type === 'multiple' || type === 'multi'
        ? Array.from(card.querySelectorAll(`#q-option-list-${questionId} input`)).map(input => input.value.trim()).filter(Boolean)
        : [];

      return title ? { title, desc, type, options } : null;
    }).filter(Boolean);

    const existingJob = editingJobId ? jobs.find(j => j.id === editingJobId || j.firebaseKey === editingJobId || j.firebaseKey === String(editingJobId)) : null;
    const newJob = {
      id: existingJob?.id || Date.now(),
      title: document.getElementById('job-title').value,
      description: document.getElementById('job-desc').value,
      requirements: requirements,
      payment: paymentDetail ? `${paymentType.charAt(0).toUpperCase() + paymentType.slice(1)}: ${paymentDetail}` : `${paymentType.charAt(0).toUpperCase() + paymentType.slice(1)}`,
      active: document.querySelector('[name="status"]:checked')?.value === 'open',
      createdBy: existingJob?.createdBy || currentUser.name,
      creationDate: existingJob?.creationDate || new Date().toISOString(),
      lastOpen: existingJob?.lastOpen || new Date().toISOString(),
      clicks: existingJob?.clicks || 0,
      submissions: existingJob?.submissions || 0,
      assigned: Array.from(document.getElementById('assigned')?.selectedOptions || []).map(o => o.value),
      options: {
        name: document.getElementById('opt-name')?.checked || false,
        email: document.getElementById('opt-email')?.checked || false,
        discord: document.getElementById('opt-discord')?.checked || false,
        roblox: document.getElementById('opt-roblox')?.checked || false,
        cv: document.getElementById('opt-cv')?.checked || false,
        experience: document.getElementById('opt-experience')?.checked || false
      },
      questions,
      company: document.getElementById('company')?.value,
      firebaseKey: existingJob?.firebaseKey || editingJobId || undefined
    };

    saveJob(newJob); // Firebase
    
    // Send Discord DMs to assigned employers
    if (newJob.assigned && newJob.assigned.length > 0) {
      newJob.assigned.forEach(async (employerName) => {
        const employer = employers.find(e => e.name === employerName);
        if (employer && employer.discordId) {
          try {
            await fetch(`${BACKEND_URL}/api/discord/dm`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: employer.discordId,
                embeds: [{
                  title: '📋 New Job Listing Assignment',
                  description: `You have been assigned to a new job listing!`,
                  color: 0x007AFF,
                  fields: [
                    { name: '🏢 Company', value: newJob.company, inline: true },
                    { name: '💼 Position', value: newJob.title, inline: true },
                    { name: '👤 Created By', value: newJob.createdBy, inline: false },
                    { name: '📝 Description', value: newJob.description.substring(0, 200) + (newJob.description.length > 200 ? '...' : ''), inline: false },
                    { name: 'ℹ️', value: `If this assignment is a mistake, please contact **${newJob.createdBy}** immediately.`, inline: false }
                  ],
                  footer: { text: 'Cirkle Careers Portal' },
                  timestamp: new Date().toISOString()
                }]
              })
            });
          } catch (error) {
            console.error(`Error sending Discord DM to ${employerName}:`, error);
          }
        }
      });
    }
    
    playSuccessSound();
    showNotification(editingJobId ? `Successfully updated listing: ${newJob.title}` : `Successfully created new listing: ${newJob.title}`);
    if (newJob.assigned.includes(currentUser.name)) showNotification(`You have been assigned to listing: ${newJob.title}`);
    logPortalEvent(
      editingJobId ? 'Job Listing Updated' : 'Job Listing Created',
      `${newJob.title} was ${editingJobId ? 'updated' : 'created'} by ${currentUser.name}.`,
      [
        { name: 'Company', value: newJob.company || 'N/A', inline: true },
        { name: 'Assigned', value: newJob.assigned.length ? newJob.assigned.join(', ') : 'Unassigned', inline: false }
      ],
      0x007aff
    );
    hidePopup();
    editingJobId = null;
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
        <p style="line-height:1.6; color:#000; white-space:pre-wrap;">${job.description}</p>
      </div>
      
      ${job.requirements ? `
      <div class="box" style="margin-bottom:1.5rem;">
        <h3>Requirements</h3>
        <p style="line-height:1.6; color:#000; white-space:pre-wrap;">${job.requirements}</p>
      </div>
      ` : ''}
      
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
        <p><strong>Assigned to:</strong> ${(job.assigned || []).length ? job.assigned.join(', ') : 'Unassigned'}</p>
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
      <div class="box" style="margin-bottom:1.5rem; display:flex; gap:1rem; flex-wrap:wrap;">
        <button class="big" onclick="createJob(jobs.find(j => j.id === ${job.id}))" style="flex:1;">Edit Listing</button>
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
            <img src="${app.data.discordPfp || 'https://via.placeholder.com/80'}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(app.data.name || 'User')}&background=007aff&color=fff&size=80'" style="width:80px; height:80px; border-radius:50%; border:3px solid #007aff;">
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
            ${job.questions.map((q, i) => {
              const sanitizedKey = q.title.replace(/[.$#\[\]\/:?*]/g, '_');
              return `
              <div style="padding:1rem; background:#f9f9fb; border-radius:12px; margin-bottom:1rem;">
                <h4 style="font-size:1.1rem; font-weight:600; margin-bottom:0.5rem;">${q.title}</h4>
                ${q.desc ? `<p style="color:#6e6e73; font-size:0.9rem; margin-bottom:0.5rem;">${q.desc}</p>` : ''}
                <p style="margin-top:0.75rem; padding:0.75rem; background:#fff; border-radius:8px;"><strong>Answer:</strong> ${app.data.answers?.[sanitizedKey] || 'No answer provided'}</p>
              </div>
            `}).join('')}
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
      <div class="confirm-actions">
        <button onclick="confirmHire(${appId})" class="big" style="flex:1; background:#34c759;">Yes, Hire</button>
        <button onclick="hidePopup()" class="big" style="flex:1; background:#8e8e93;">No, Cancel</button>
      </div>
    `);
  } else if (action === 'reject') {
    showPopup(`
      <h2 style="font-size:1.8rem; font-weight:700; margin-bottom:1rem;">Reject Application</h2>
      <p style="margin-bottom:1rem; font-size:1.1rem;">Please provide a reason for rejection:</p>
      <textarea id="reject-reason-input" placeholder="Enter reason..." style="width:100%; padding:1rem; border-radius:12px; border:1px solid #d1d1d6; min-height:120px; margin-bottom:1.5rem; font-family:inherit;"></textarea>
      <div class="confirm-actions">
        <button onclick="confirmReject(${appId})" class="big" style="flex:1; background:#ff3b30;">Submit Rejection</button>
        <button onclick="hidePopup()" class="big" style="flex:1; background:#8e8e93;">Cancel</button>
      </div>
    `);
  } else if (action === 'extratime') {
    const appIndex = applications.findIndex(a => a.id === appId);
    if (appIndex !== -1) {
      const app = applications[appIndex];
      app.status = 'Extra Time';
      
      // Send Discord DM to candidate with professional embed
      if (app.data.discord) {
        (async () => {
          try {
            const job = jobs.find(j => j.title === app.job);
            const companyLogo = job ? getCompanyLogo((job.company || '').toString().trim()) : getCompanyLogo('Cirkle Development Group');
            
            await fetch(`${BACKEND_URL}/api/discord/dm`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: app.data.discord,
                message: {
                  embeds: [{
                    title: '⏳ Application Under Review',
                    description: `**RE: ${app.job}**`,
                    color: 0xFF9500,
                    thumbnail: { url: companyLogo },
                    fields: [
                      {
                        name: '\u200b',
                        value: `Dear Candidate,\n\nThank you for your patience. We wish to inform you that your application is currently under review and requires **additional processing time**. Your new status is: **⌛ Extra Time**.\n\nWe appreciate your understanding and will update you as soon as possible.\n\nKind Regards,\nallCareers Department`,
                        inline: false
                      },
                      {
                        name: '🏢 Company',
                        value: `${job ? job.company : 'Cirkle Development Group'}`,
                        inline: true
                      },
                      {
                        name: '🔑 Application PIN',
                        value: `\`${app.pin}\``,
                        inline: true
                      }
                    ],
                    footer: {
                      text: `allCareers • Cirkle Development Group`,
                      icon_url: 'https://media.discordapp.net/attachments/1315278404009988107/1425166771413057578/Eco_Clean.png.jpg'
                    },
                    timestamp: new Date().toISOString()
                  }]
                }
              })
            });
          } catch (error) {
            console.error('Error sending Discord DM:', error);
          }
        })();
      }
      
      saveApplication(app); // Firebase
      hidePopup();
      showNotification('Application status updated to Extra Time');
      setTimeout(() => renderEmployerSubPage('candidatemanagement'), 500);
    }
  }
}

async function confirmHire(appId) {
  const appIndex = applications.findIndex(a => a.id === appId);
  if (appIndex !== -1) {
    const app = applications[appIndex];
    app.status = 'Hired';
    app.handler = currentUser.name;
    
    // Send Discord DM to candidate with professional embed
    if (app.data.discord) {
      try {
        const job = jobs.find(j => j.title === app.job);
        const companyLogo = job ? getCompanyLogo((job.company || '').toString().trim()) : getCompanyLogo('Cirkle Development Group');
        
        await fetch(`${BACKEND_URL}/api/discord/dm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: app.data.discord,
            message: {
              embeds: [{
                title: '🎉 Application Successful',
                description: `**RE: ${app.job}**`,
                color: 0x34C759,
                thumbnail: { url: companyLogo },
                fields: [
                  {
                    name: '\u200b',
                    value: `Dear Candidate,\n\nWe wish to inform you that you have been **successful** in your application and your candidate status has been marked as: **✅ Hired**.\n\nYou will be sent a welcome email shortly to **${app.data.email || 'your registered email'}**. Please contact your employer for more details. \n\nKind Regards,\nallCareers Department`,
                    inline: false
                  },
                  {
                    name: '👤 Employer',
                    value: `**${currentUser.name}**\n*${currentUser.role}*`,
                    inline: true
                  },
                  {
                    name: '🏢 Company',
                    value: `${job ? job.company : 'Cirkle Development Group'}`,
                    inline: true
                  },
                  {
                    name: '🔑 Application PIN',
                    value: `\`${app.pin}\``,
                    inline: true
                  }
                ],
                footer: {
                  text: `allCareers • Cirkle Development Group`,
                  icon_url: 'https://media.discordapp.net/attachments/1315278404009988107/1425166771413057578/Eco_Clean.png.jpg'
                },
                timestamp: new Date().toISOString()
              }]
            }
          })
        });
      } catch (error) {
        console.error('Error sending Discord DM:', error);
      }
    }

    logPortalEvent(
      'Application Approved',
      `${app.data.name || 'Candidate'} was hired for ${app.job}.`,
      [
        { name: 'Handler', value: currentUser.name || 'Unknown', inline: true },
        { name: 'PIN', value: `\`${app.pin}\``, inline: true },
        { name: 'Company', value: jobs.find(j => j.title === app.job)?.company || 'N/A', inline: false }
      ],
      0x34c759
    );
    
    // Firebase: Delete from applications, add to processed
    deleteApplication(app.pin);
    saveProcessed(app);
    
    playSuccessSound();
    const overlay = document.getElementById('popup-overlay');
    overlay.innerHTML = `
      <div class="success-screen">
        <div class="tick">✓</div>
        <h2 style="font-size:1.8rem; font-weight:700; margin-bottom:1rem;">Candidate Hired Successfully!</h2>
        <p style="font-size:1rem; color:#6e6e73; margin-bottom:2rem;">The candidate has been moved to the Hired tab${app.data.discord ? ' and notified via Discord DM' : ''}.</p>
        <button class="big" onclick="hidePopup(); renderEmployerSubPage('candidatemanagement');" style="padding:1rem 2rem;">Close</button>
      </div>
    `;
  }
}

async function confirmReject(appId) {
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
    
    // Send Discord DM to candidate with professional embed
    if (app.data.discord) {
      try {
        const job = jobs.find(j => j.title === app.job);
        const companyLogo = job ? getCompanyLogo((job.company || '').toString().trim()) : getCompanyLogo('Cirkle Development Group');
        
        await fetch(`${BACKEND_URL}/api/discord/dm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: app.data.discord,
            message: {
              embeds: [{
                title: '📋 Application Status Update',
                description: `**RE: ${app.job}** • ${job ? job.company : 'Cirkle Development Group'}`,
                color: 0xFF3B30,
                thumbnail: { url: companyLogo },
                fields: [
                  {
                    name: '📢 Status Update',
                    value: 'Dear Candidate,\n\nThank you for your interest in the above-mentioned position and for taking the time to submit your application.\n\nAfter careful consideration, we regret to inform you that we will not be proceeding with your application at this time. \n\n We apologise for the inconvenience and appreciate your understanding. Your new status is: **❌ Rejected** \n\n Kind Regards,\nallCareers Department',
                    inline: false
                  },
                  {
                    name: '💬 Feedback',
                    value: reason,
                    inline: false
                  },
                  {
                    name: '👤 Reviewed By',
                    value: `**${currentUser.name}**\n${currentUser.role}`,
                    inline: true
                  },
                  {
                    name: '🔑 Application PIN',
                    value: `\`${app.pin}\``,
                    inline: true
                  },
                  {
                    name: '🌟 Future Opportunities',
                    value: 'We encourage you to keep an eye on our careers portal for future positions that may align with your skills and experience. We wish you the best of luck in your job search.',
                    inline: false
                  }
                ],
                footer: {
                  text: `allCareers • Cirkle Development Group`,
                  icon_url: 'https://media.discordapp.net/attachments/1315278404009988107/1425166771413057578/Eco_Clean.png.jpg'
                },
                timestamp: new Date().toISOString()
              }]
            }
          })
        });
      } catch (error) {
        console.error('Error sending Discord DM:', error);
      }
    }

    logPortalEvent(
      'Application Denied',
      `${app.data.name || 'Candidate'} was rejected for ${app.job}.`,
      [
        { name: 'Handler', value: currentUser.name || 'Unknown', inline: true },
        { name: 'PIN', value: `\`${app.pin}\``, inline: true },
        { name: 'Reason', value: reason, inline: false }
      ],
      0xff3b30
    );
    
    // Firebase: Delete from applications, add to processed
    deleteApplication(app.pin);
    saveProcessed(app);
    
    const overlay = document.getElementById('popup-overlay');
    overlay.innerHTML = `
      <div class="success-screen">
        <div class="tick" style="background:#ff3b30;">✗</div>
        <h2 style="font-size:1.8rem; font-weight:700; margin-bottom:1rem;">Application Rejected</h2>
        <p style="font-size:1rem; color:#6e6e73; margin-bottom:2rem;">The candidate has been notified${app.data.discord ? ' via Discord DM' : ''} and moved to the Rejected tab.</p>
        <button class="big" onclick="hidePopup(); renderEmployerSubPage('candidatemanagement');" style="padding:1rem 2rem; background:#ff3b30;">Close</button>
      </div>
    `;
  }
}

function deleteJob(id) {
  showPopup(`
    <h2 style="font-size:1.8rem; font-weight:700; margin-bottom:1rem; color:#ff3b30;">Delete Job Listing</h2>
    <p style="margin-bottom:1.5rem;">Are you sure you want to delete this position?</p>
    <div class="confirm-actions">
      <button class="big" onclick="confirmDeleteJob(${id})" style="background:#ff3b30;">Yes</button>
      <button class="big" onclick="hidePopup()" style="background:#8e8e93;">No</button>
    </div>
  `);
}

async function confirmDeleteJob(id) {
  hidePopup();
  const popup = document.getElementById('popup');
  if (popup) {
    showPopup('<p style="text-align:center; font-size:1.2rem;">Deleting...</p>');
    
    // Actually delete the job from backend
    let job = jobs.find(j => j.id === id || j.firebaseKey === id || j.firebaseKey === String(id));
    if (!job) {
      await loadJobs();
      job = jobs.find(j => j.id === id || j.firebaseKey === id || j.firebaseKey === String(id));
    }

    const deleteKey = job?.firebaseKey || job?.id || id;
    if (deleteKey) {
      await fetch(`${BACKEND_URL}/api/jobs/${deleteKey}`, {
        method: 'DELETE'
      });
      await loadJobs(); // Refresh jobs from backend
    }
    
    setTimeout(() => {
      hidePopup();
      playSuccessSound();
      showNotification('Job listing deleted successfully');
      logPortalEvent('Job Listing Deleted', `Job listing ${id} was deleted by ${currentUser?.name || 'Unknown'}.`, [{ name: 'Job ID', value: `\`${id}\``, inline: true }], 0xff3b30);
      renderEmployerSubPage('joblistings');
    }, 1000);
  }
}

function deleteProcessedApplication(appId) {
  const app = processed.find(p => p.id === appId);
  const isAccepted = app && app.status === 'Hired';
  
  if (isAccepted) {
    showPopup(`
      <h2 style="font-size:1.8rem; font-weight:700; margin-bottom:1rem; color:#ff3b30;">⚠️ Delete Accepted Application</h2>
      <p style="font-size:1.1rem; margin-bottom:1.5rem; line-height:1.6;">This is an accepted application. Please choose how to proceed:</p>
      <div style="margin-bottom:2rem;">
        <label style="display:flex; align-items:center; gap:0.75rem; padding:1rem; background:#f2f2f7; border-radius:12px; cursor:pointer; margin-bottom:1rem;">
          <input type="radio" name="delete-option" value="void" id="void-option" checked style="width:20px; height:20px;">
          <div>
            <div style="font-weight:600; margin-bottom:0.25rem;">🚫 Void this user</div>
            <div style="font-size:0.9rem; color:#6e6e73;">Candidate will be notified via Discord DM that their application has been voided</div>
          </div>
        </label>
        <label style="display:flex; align-items:center; gap:0.75rem; padding:1rem; background:#f2f2f7; border-radius:12px; cursor:pointer;">
          <input type="radio" name="delete-option" value="silent" id="silent-option" style="width:20px; height:20px;">
          <div>
            <div style="font-weight:600; margin-bottom:0.25rem;">🗑️ Delete from database only</div>
            <div style="font-size:0.9rem; color:#6e6e73;">Silently remove without notifying the candidate</div>
          </div>
        </label>
      </div>
      <div class="confirm-actions">
        <button onclick="confirmDeleteProcessedApplication(${appId}, document.querySelector('[name=\\'delete-option\\']:checked')?.value === 'void')" class="big" style="flex:1; background:#ff3b30;">Confirm Delete</button>
        <button onclick="hidePopup()" class="big" style="flex:1; background:#8e8e93;">Cancel</button>
      </div>
    `);
  } else {
    showPopup(`
      <h2 style="font-size:1.8rem; font-weight:700; margin-bottom:1rem; color:#ff3b30;">⚠️ Delete Application</h2>
      <p style="font-size:1.1rem; margin-bottom:2rem; line-height:1.6;">Are you sure you want to permanently delete this application? It can't be retrieved.</p>
      <div class="confirm-actions">
        <button onclick="confirmDeleteProcessedApplication(${appId}, false)" class="big" style="flex:1; background:#ff3b30;">Yes, Delete</button>
        <button onclick="hidePopup()" class="big" style="flex:1; background:#8e8e93;">No, Cancel</button>
      </div>
    `);
  }
}

async function confirmDeleteProcessedApplication(appId, shouldVoidUser = false) {
  showLoading();
  
  try {
    // Find the processed application
    const app = processed.find(p => p.id === appId);
    
    if (app) {
      // If voiding user and they have Discord ID, send DM
      if (shouldVoidUser && app.data && app.data.discord) {
        try {
          const jobInfo = app.job ? `for **${app.job.title}** at **${app.job.company}**` : '';
          await fetch(`${BACKEND_URL}/api/discord/dm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: app.data.discord,
              embeds: [{
                title: '❌ Application Voided',
                description: `Your accepted application ${jobInfo} has been voided.`,
                color: 0xFF3B30,
                fields: [
                  { name: '📋 Application Details', value: `**Name:** ${app.data.name || 'N/A'}\n**Status:** ${app.status}\n**Handler:** ${app.handler || 'N/A'}`, inline: false },
                  { name: 'ℹ️ Next Steps', value: 'If you believe this is a mistake, please contact the hiring manager for more information.', inline: false }
                ],
                footer: { text: 'Cirkle Careers Portal' },
                timestamp: new Date().toISOString()
              }]
            })
          });
        } catch (error) {
          console.error('Error sending void notification DM:', error);
        }
      }

      logPortalEvent(
        shouldVoidUser ? 'Application Voided' : 'Application Deleted',
        shouldVoidUser ? `A hired application was voided for ${app.data.name || 'Unknown candidate'}.` : `A processed application was deleted for ${app.data.name || 'Unknown candidate'}.`,
        [
          { name: 'Handler', value: currentUser.name || 'Unknown', inline: true },
          { name: 'PIN', value: app.pin ? `\`${app.pin}\`` : 'N/A', inline: true },
          { name: 'Status', value: app.status || 'Unknown', inline: true }
        ],
        shouldVoidUser ? 0xff9500 : 0xff3b30
      );
      
      // Delete from processed in backend using firebaseKey or by searching
      if (app.firebaseKey) {
        await fetch(`${BACKEND_URL}/api/processed/${app.firebaseKey}`, {
          method: 'DELETE'
        });
      } else {
        // Fallback: fetch all processed and find by ID
        const resp = await fetch(`${BACKEND_URL}/api/processed`);
        const data = await resp.json();
        if (data) {
          for (const key of Object.keys(data)) {
            if (data[key] && data[key].id === appId) {
              await fetch(`${BACKEND_URL}/api/processed/${key}`, {
                method: 'DELETE'
              });
              break;
            }
          }
        }
      }
      
      // Also delete from regular applications if it exists there
      if (app.pin) {
        await deleteApplication(app.pin);
      }
      
      // Reload processed applications from backend
      await loadProcessed();
      
      playSuccessSound();
      const overlay = document.getElementById('popup-overlay');
      const message = shouldVoidUser ? 'Application voided and candidate has been notified.' : 'The application has been permanently removed.';
      overlay.innerHTML = `
        <div class="success-screen">
          <div class="tick">✓</div>
          <h2 style="font-size:1.8rem; font-weight:700; margin-bottom:1rem;">Application Deleted</h2>
          <p style="font-size:1rem; color:#6e6e73;">${message}</p>
        </div>
      `;
      
      setTimeout(() => {
        hidePopup();
        renderEmployerSubPage('candidatemanagement');
      }, 2000);
    }
  } catch (error) {
    showNotification('Failed to delete application. Please try again.');
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
      `<img src="${app.data.discordPfp || 'https://via.placeholder.com/56'}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(app.data.name || 'User')}&background=007aff&color=fff&size=56'" style="border-radius:50%; margin-right:1rem; width:56px; height:56px;">` +
      `<img src="${app.data.robloxAvatar || 'https://via.placeholder.com/56'}" onerror="this.src='https://via.placeholder.com/56?text=R'" style="border-radius:50%; width:56px; height:56px;">` +
      '</div>';
    content += `<p style="font-weight:500;">Name: ${app.data.name || 'N/A'}</p>`;
    if (app.data.email) content += `<p style="font-weight:500;">Email: ${app.data.email}</p>`;
    if (app.data.discord) content += `<p style="font-weight:500;">Discord: ${app.data.discord}</p>`;
    if (app.data.roblox) content += `<p style="font-weight:500;">Roblox: ${app.data.roblox}</p>`;
    if (app.data.cv) content += `<p style="font-weight:500;">CV: ${app.data.cv}</p>`;
    if (app.data.experience) content += `<p style="font-weight:500;">Experience: ${app.data.experience}</p>`;
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
    console.log(`[CHAT DEBUG] Sending message to chat ${appId}:`, msg);
    if (!chats[appId]) chats[appId] = [];
    const timestamp = Date.now();
    chats[appId].push({ user: currentUser.name, msg, timestamp });
    console.log(`[CHAT DEBUG] Chat now has ${chats[appId].length} messages`);
    saveChat(appId, chats[appId]); // Firebase
    
    // Clear typing indicator
    setTypingStatus(appId, false);
    
    // Update UI immediately
    const chatMsgs = document.getElementById('chat-msgs');
    if (chatMsgs) {
      chatMsgs.innerHTML = renderChatMessages(appId);
      chatMsgs.scrollTop = chatMsgs.scrollHeight;
      console.log(`[CHAT DEBUG] UI updated with new message`);
    }
    
    document.getElementById('chat-input').value = '';
  } else {
    console.warn(`[CHAT DEBUG] Cannot send - msg: ${msg}, currentUser: ${currentUser?.name}`);
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

// Live Chat Helper Functions
function renderChatMessages(chatId) {
  const messages = chats[chatId] || [];
  console.log(`Rendering ${messages.length} messages for chat ${chatId}`);
  return messages.map(m => `<p style="margin-bottom:0.5rem;"><strong>${m.user}:</strong> ${m.msg}</p>`).join('');
}

async function setTypingStatus(chatId, isTyping) {
  if (!currentUser) return;
  console.log(`Setting typing status for chat ${chatId}:`, isTyping);
  try {
    const response = await fetch(`${BACKEND_URL}/api/chats/${chatId}/typing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        user: currentUser.name, 
        isTyping,
        timestamp: Date.now()
      })
    });
    console.log('Typing status response:', await response.json());
  } catch (error) {
    console.error('Error updating typing status:', error);
  }
}

async function checkTypingStatus(chatId) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/chats/${chatId}/typing`);
    const data = await response.json();
    const typingIndicator = document.getElementById('typing-indicator');
    
    console.log('Typing status data:', data);
    
    if (typingIndicator && data && data.user && data.user !== currentUser.name) {
      // Only show if typing event is recent (within last 3 seconds)
      if (Date.now() - data.timestamp < 3000) {
        typingIndicator.textContent = `${data.user} is typing...`;
        typingIndicator.style.display = 'block';
        console.log('Showing typing indicator for:', data.user);
      } else {
        typingIndicator.style.display = 'none';
      }
    } else if (typingIndicator) {
      typingIndicator.style.display = 'none';
    }
  } catch (error) {
    console.error('Error checking typing status:', error);
  }
}

function startChatPolling(chatId) {
  // Clear any existing interval
  if (chatPollInterval) {
    clearInterval(chatPollInterval);
  }
  
  console.log(`[CHAT DEBUG] Starting chat polling for: ${chatId}`);
  
  // Poll every 2 seconds for new messages and typing status
  chatPollInterval = setInterval(async () => {
    if (activeChatId === chatId) {
      console.log(`[CHAT DEBUG] Polling chat updates for ${chatId}...`);
      await loadChats(); // Refresh chats
      const chatMsgs = document.getElementById('chat-msgs');
      if (chatMsgs) {
        const currentScroll = chatMsgs.scrollTop;
        const isScrolledToBottom = chatMsgs.scrollHeight - chatMsgs.clientHeight <= currentScroll + 50;
        
        chatMsgs.innerHTML = renderChatMessages(chatId);
        
        // Auto-scroll if user was at bottom
        if (isScrolledToBottom) {
          chatMsgs.scrollTop = chatMsgs.scrollHeight;
        }
        console.log(`[CHAT DEBUG] Chat UI refreshed, messages: ${chats[chatId]?.length || 0}`);
      } else {
        console.warn(`[CHAT DEBUG] chat-msgs element not found!`);
      }
      
      await checkTypingStatus(chatId);
    } else {
      console.log(`[CHAT DEBUG] Active chat changed (expected: ${chatId}, actual: ${activeChatId}), stopping polling`);
      stopChatPolling();
    }
  }, 2000);
}

function stopChatPolling() {
  if (chatPollInterval) {
    clearInterval(chatPollInterval);
    chatPollInterval = null;
  }
  if (activeChatId) {
    setTypingStatus(activeChatId, false);
  }
  activeChatId = null;
}

// ==========================================
// EMPLOYER SUITE INTEGRATION
// ==========================================

async function loadEmployerSuite() {
  const root = document.getElementById('employer-suite-root');
  if (!root) return;
  
  // Inject styles if not already present
  if (!document.getElementById('employer-suite-styles')) {
    const link = document.createElement('link');
    link.id = 'employer-suite-styles';
    link.rel = 'stylesheet';
    link.href = 'employersuit-styles.css';
    document.head.appendChild(link);
  }
  
  // Load scripts dynamically
  const scripts = [
    'employersuit-api.js',
    'employersuit-auth.js',
    'employersuit-tabs.js',
    'employersuit-main.js'
  ];
  
  for (const src of scripts) {
    if (!document.querySelector(`script[src="${src}"]`)) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    }
  }
  
  // Initialize Employer Suite
  if (window.initializeEmployerSuite) {
    window.initializeEmployerSuite(root, currentUser);
  } else {
    root.innerHTML = '<div class="box"><p style="text-align:center; padding:2rem;">Loading Employer Suite...</p></div>';
  }
}
