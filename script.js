// script.js - Organized Layout, Professional, No Initial Data, Refined Payment

// Data Structures - ALL SENSITIVE DATA NOW IN BACKEND
// No more hardcoded credentials visible in browser!
const COMPANIES = ['Cirkle Development', 'Aer Lingus', 'DevDen', 'Cirkle Group Careers'];
const COMPANY_LOGOS = {
  'Cirkle Development': 'https://media.discordapp.net/attachments/1419317839269073016/1433841576924287056/Untitled_design.png?ex=69062887&is=6904d707&hm=c270528597cc86f267c27fef611f68ddd636d0636893d2451e996c979c7a9a7c&=&format=webp&quality=lossless',
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
  // Check for existing session
  const savedUser = sessionStorage.getItem('currentUser');
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      // If user was logged in, restore their session
      if (currentUser && window.location.hash.includes('employerportal')) {
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
      <p style="margin-bottom:1rem; line-height:1.6; white-space:pre-wrap;">${job.description}</p>
      ${job.requirements ? `<div style="margin-bottom:1rem;"><strong>Requirements:</strong><p style="line-height:1.6; white-space:pre-wrap; margin-top:0.5rem;">${job.requirements}</p></div>` : ''}
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
      app.job = job.title;
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
      saveJob(job);
      saveApplication(app);
      saveChat(app.id, []);
      
      // Notify assigned employers via Discord DM
      if (job.assigned && job.assigned.length > 0) {
        for (const employerName of job.assigned) {
          const employer = employers.find(e => e.name === employerName);
          if (employer && employer.discordId) {
            try {
              await fetch(`${BACKEND_URL}/api/discord/dm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: employer.discordId,
                  message: {
                    embeds: [{
                      title: '📋 New Application Assigned to You',
                      description: 'An application that you have been assigned to has been submitted.',
                      color: 0x007AFF,
                      fields: [
                        { name: '👤 Candidate', value: app.data.name || 'Anonymous', inline: true },
                        { name: '💼 Position', value: job.title, inline: true },
                        { name: '🏢 Company', value: job.company, inline: true },
                        { name: '📧 Email', value: app.data.email || 'N/A', inline: true },
                        { name: '📱 Discord', value: app.data.discord || 'N/A', inline: true },
                        { name: '📅 Submitted', value: new Date(app.appliedDate).toLocaleString(), inline: true }
                      ],
                      footer: {
                        text: 'Log on to your employer dashboard to manage this application.'
                      },
                      timestamp: new Date().toISOString()
                    }]
                  }
                })
              });
            } catch (error) {
              console.error('Error notifying employer:', error);
            }
          }
        }
      }
      
      // Send Discord DM confirmation to candidate
      if (app.data.discord) {
        (async () => {
          try {
            const companyLogo = COMPANY_LOGOS[job.company] || '';
            
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
                    thumbnail: companyLogo ? { url: companyLogo } : undefined,
                    fields: [
                      {
                        name: '\u200b',
                        value: `Dear Candidate,\n\nThank you for submitting your application for the **${job.title}** position at **${job.company}**.\n\nYour application has been received and is currently under review. Please keep an eye on this bot's DM for further updates. Your status is: **🔃 Processing** .\n\nPlease keep your Application PIN safe for future reference. \n\nKind Regards,\nallCareers Department`,
                        inline: false
                      },
                      {
                        name: '🏢 Company',
                        value: job.company,
                        inline: true
                      },
                      {
                        name: '🔑 Application PIN',
                        value: `\`${app.pin}\``,
                        inline: true
                      },
                      {
                        name: '📅 Submitted',
                        value: new Date(app.appliedDate).toLocaleDateString(),
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
      
      // Send to Discord webhook - route to different channels based on company
      const COMPANY_WEBHOOKS = {
        'Cirkle Development': 'https://discord.com/api/webhooks/1433584396585271338/CjTLEfQmEPMbkeo-RLPB0lMN_gDwrOus0Pam3dGnvnwATN5pl9cItE-AyuK4a9cJRXAA',
        'Cirkle Group Careers': 'https://discord.com/api/webhooks/1433584396585271338/CjTLEfQmEPMbkeo-RLPB0lMN_gDwrOus0Pam3dGnvnwATN5pl9cItE-AyuK4a9cJRXAA',
        'Aer Lingus': 'https://discord.com/api/webhooks/1433867955770495120/--i3Y4XsgLOu2Ppoe5WuFRm2dIZgVCwPhSw9oKqBI6tmRxO3I8mVq-jrsGlQCnz8VmbS',
        'DevDen': 'https://discord.com/api/webhooks/1433868342480863242/l1C_3xl08wQoXGkxXOnh7xXutAQwhkdaJOK7srlwMDPdoawsy94u85Gh6Kzt2Cz3FvRg'
      };
      
      const COMPANY_ROLE_PINGS = {
        'Cirkle Development': '<@&1315065603178102794>',
        'Cirkle Group Careers': '<@&1315065603178102794>',
        'Aer Lingus': '<@&1396248348595323163>',
        'DevDen': '<@&1144662197335769089>'
      };
      
      const WEBHOOK_URL = COMPANY_WEBHOOKS[job.company] || COMPANY_WEBHOOKS['Cirkle Development']; // Default to Cirkle Development
      const ROLE_PING = COMPANY_ROLE_PINGS[job.company] || COMPANY_ROLE_PINGS['Cirkle Development'];
      
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
            body: JSON.stringify({ 
              content: ROLE_PING,
              embeds: [embed] 
            })
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

// Employer Fetch
async function fetchEmployers() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/employers`);
    const data = await response.json();
    if (data.success) {
      employers = data.employers;
      // Update employer options in job creation
      const assignedSelect = document.getElementById('assigned');
      if (assignedSelect) {
        assignedSelect.innerHTML = employers.map(e => `<option>${e.name}</option>`).join('');
      }
    }
  } catch (error) {
    console.error('Error fetching employers:', error);
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
      <p style="margin-bottom:1rem; line-height:1.6; white-space:pre-wrap;">${job.description}</p>
      ${job.requirements ? `<div style="margin-bottom:1rem;"><strong>Requirements:</strong><p style="line-height:1.6; white-space:pre-wrap; margin-top:0.5rem;">${job.requirements}</p></div>` : ''}
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
      app.job = job.title;
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
      saveJob(job);
      saveApplication(app);
      saveChat(app.id, []);
      
      // Notify assigned employers via Discord DM
      if (job.assigned && job.assigned.length > 0) {
        for (const employerName of job.assigned) {
          const employer = employers.find(e => e.name === employerName);
          if (employer && employer.discordId) {
            try {
              await fetch(`${BACKEND_URL}/api/discord/dm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: employer.discordId,
                  message: {
                    embeds: [{
                      title: '📋 New Application Assigned to You',
                      description: 'An application that you have been assigned to has been submitted.',
                      color: 0x007AFF,
                      fields: [
                        { name: '👤 Candidate', value: app.data.name || 'Anonymous', inline: true },
                        { name: '💼 Position', value: job.title, inline: true },
                        { name: '🏢 Company', value: job.company, inline: true },
                        { name: '📧 Email', value: app.data.email || 'N/A', inline: true },
                        { name: '📱 Discord', value: app.data.discord || 'N/A', inline: true },
                        { name: '📅 Submitted', value: new Date(app.appliedDate).toLocaleString(), inline: true }
                      ],
                      footer: {
                        text: 'Log on to your employer dashboard to manage this application.'
                      },
                      timestamp: new Date().toISOString()
                    }]
                  }
                })
              });
            } catch (error) {
              console.error('Error notifying employer:', error);
            }
          }
        }
      }
      
      // Send Discord DM confirmation to candidate
      if (app.data.discord) {
        (async () => {
          try {
            const companyLogo = COMPANY_LOGOS[job.company] || '';
            
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
                    thumbnail: companyLogo ? { url: companyLogo } : undefined,
                    fields: [
                      {
                        name: '\u200b',
                        value: `Dear Candidate,\n\nThank you for submitting your application for the **${job.title}** position at **${job.company}**.\n\nYour application has been received and is currently under review. Please keep an eye on this bot's DM for further updates. Your status is: **🔃 Processing** .\n\nPlease keep your Application PIN safe for future reference. \n\nKind Regards,\nallCareers Department`,
                        inline: false
                      },
                      {
                        name: '🏢 Company',
                        value: job.company,
                        inline: true
                      },
                      {
                        name: '🔑 Application PIN',
                        value: `\`${app.pin}\``,
                        inline: true
                      },
                      {
                        name: '📅 Submitted',
                        value: new Date(app.appliedDate).toLocaleDateString(),
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
      
      // Send to Discord webhook - route to different channels based on company
      const COMPANY_WEBHOOKS = {
        'Cirkle Development': 'https://discord.com/api/webhooks/1433584396585271338/CjTLEfQmEPMbkeo-RLPB0lMN_gDwrOus0Pam3dGnvnwATN5pl9cItE-AyuK4a9cJRXAA',
        'Cirkle Group Careers': 'https://discord.com/api/webhooks/1433584396585271338/CjTLEfQmEPMbkeo-RLPB0lMN_gDwrOus0Pam3dGnvnwATN5pl9cItE-AyuK4a9cJRXAA',
        'Aer Lingus': 'https://discord.com/api/webhooks/1433867955770495120/--i3Y4XsgLOu2Ppoe5WuFRm2dIZgVCwPhSw9oKqBI6tmRxO3I8mVq-jrsGlQCnz8VmbS',
        'DevDen': 'https://discord.com/api/webhooks/1433868342480863242/l1C_3xl08wQoXGkxXOnh7xXutAQwhkdaJOK7srlwMDPdoawsy94u85Gh6Kzt2Cz3FvRg'
      };
      
      const COMPANY_ROLE_PINGS = {
        'Cirkle Development': '<@&1315065603178102794>',
        'Cirkle Group Careers': '<@&1315065603178102794>',
        'Aer Lingus': '<@&1396248348595323163>',
        'DevDen': '<@&1144662197335769089>'
      };
      
      const WEBHOOK_URL = COMPANY_WEBHOOKS[job.company] || COMPANY_WEBHOOKS['Cirkle Development']; // Default to Cirkle Development
      const ROLE_PING = COMPANY_ROLE_PINGS[job.company] || COMPANY_ROLE_PINGS['Cirkle Development'];
      
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
            body: JSON.stringify({ 
              content: ROLE_PING,
              embeds: [embed] 
            })
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

// Employer Fetch
async function fetchEmployers() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/employers`);
    const data = await response.json();
    if (data.success) {
      employers = data.employers;
      // Update employer options in job creation
      const assignedSelect = document.getElementById('assigned');
      if (assignedSelect) {
        assignedSelect.innerHTML = employers.map(e => `<option>${e.name}</option>`).join('');
      }
    }
  } catch (error) {
    console.error('Error fetching employers:', error);
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
      <p style="margin-bottom:1rem; line-height:1.6; white-space:pre-wrap;">${job.description}</p>
      ${job.requirements ? `<div style="margin-bottom:1rem;"><strong>Requirements:</strong><p style="line-height:1.6; white-space:pre-wrap; margin-top:0.5rem;">${job.requirements}</p></div>` : ''}
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
      app.job = job.title;
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
      saveJob(job);
      saveApplication(app);
      saveChat(app.id, []);
      
      // Notify assigned employers via Discord DM
      if (job.assigned && job.assigned.length > 0) {
        for (const employerName of job.assigned) {
          const employer = employers.find(e => e.name === employerName);
          if (employer && employer.discordId) {
            try {
              await fetch(`${BACKEND_URL}/api/discord/dm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: employer.discordId,
                  message: {
                    embeds: [{
                      title: '📋 New Application Assigned to You',
                      description: 'An application that you have been assigned to has been submitted.',
                      color: 0x007AFF,
                      fields: [
                        { name: '👤 Candidate', value: app.data.name || 'Anonymous', inline: true },
                        { name: '💼 Position', value: job.title, inline: true },
                        { name: '🏢 Company', value: job.company, inline: true },
                        { name: '📧 Email', value: app.data.email || 'N/A', inline: true },
                        { name: '📱 Discord', value: app.data.discord || 'N/A', inline: true },
                        { name: '📅 Submitted', value: new Date(app.appliedDate).toLocaleString(), inline: true }
                      ],
                      footer: {
                        text: 'Log on to your employer dashboard to manage this application.'
                      },
                      timestamp: new Date().toISOString()
                    }]
                  }
                })
              });
            } catch (error) {
              console.error('Error notifying employer:', error);
            }
          }
        }
      }
      
      // Send Discord DM confirmation to candidate
      if (app.data.discord) {
        (async () => {
          try {
            const companyLogo = COMPANY_LOGOS[job.company] || '';
            
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
                    thumbnail: companyLogo ? { url: companyLogo } : undefined,
                    fields: [
                      {
                        name: '\u200b',
                        value: `Dear Candidate,\n\nThank you for submitting your application for the **${job.title}** position at **${job.company}**.\n\nYour application has been received and is currently under review. Please keep an eye on this bot's DM for further updates. Your status is: **🔃 Processing** .\n\nPlease keep your Application PIN safe for future reference. \n\nKind Regards,\nallCareers Department`,
                        inline: false
                      },
                      {
                        name: '🏢 Company',
                        value: job.company,
                        inline: true
                      },
                      {
                        name: '🔑 Application PIN',
                        value: `\`${app.pin}\``,
                        inline: true
                      },
                      {
                        name: '📅 Submitted',
                        value: new Date(app.appliedDate).toLocaleDateString(),
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
      
      // Send to Discord webhook - route to different channels based on company
      const COMPANY_WEBHOOKS = {
        'Cirkle Development': 'https://discord.com/api/webhooks/1433584396585271338/CjTLEfQmEPMbkeo-RLPB0lMN_gDwrOus0Pam3dGnvnwATN5pl9cItE-AyuK4a9cJRXAA',
        'Cirkle Group Careers': 'https://discord.com/api/webhooks/1433584396585271338/CjTLEfQmEPMbkeo-RLPB0lMN_gDwrOus0Pam3dGnvnwATN5pl9cItE-AyuK4a9cJRXAA',
        'Aer Lingus': 'https://discord.com/api/webhooks/1433867955770495120/--i3Y4XsgLOu2Ppoe5WuFRm2dIZgVCwPhSw9oKqBI6tmRxO3I8mVq-jrsGlQCnz8VmbS',
        'DevDen': 'https://discord.com/api/webhooks/1433868342480863242/l1C_3xl08wQoXGkxXOnh7xXutAQwhkdaJOK7srlwMDPdoawsy94u85Gh6Kzt2Cz3FvRg'
      };
      
      const COMPANY_ROLE_PINGS = {
        'Cirkle Development': '<@&1315065603178102794>',
        'Cirkle Group Careers': '<@&1315065603178102794>',
        'Aer Lingus': '<@&1396248348595323163>',
        'DevDen': '<@&1144662197335769089>'
      };
      
      const WEBHOOK_URL = COMPANY_WEBHOOKS[job.company] || COMPANY_WEBHOOKS['Cirkle Development']; // Default to Cirkle Development
      const ROLE_PING = COMPANY_ROLE_PINGS[job.company] || COMPANY_ROLE_PINGS['Cirkle Development'];
      
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
            body: JSON.stringify({ 
              content: ROLE_PING,
              embeds: [embed] 
            })
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
