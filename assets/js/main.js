/* Main Controller: Core state management, fallback templates, web audio synth, and component loader */

window.rainbowState = {
  stars: 0,
  mascot: 'rabbit',
  completedTasks: [],
  audioCtx: null
};

const FALLBACK_TEMPLATES = {
  navbar: `
    <nav class="header-nav">
      <div class="container nav-container">
        <a href="index.html" class="logo">
          <div class="logo-icon-wrapper">
            <img src="assets/images/hero/rainbow.png" alt="Rainbow Kids logo">
          </div>
          <span>Rainbow Kids</span>
        </a>
        <ul class="nav-menu" id="nav-menu">
          <li class="nav-item" data-page="index"><a href="index.html">Home</a></li>
          <li class="nav-item" data-page="about"><a href="about.html">About Us</a></li>
          <li class="nav-item" data-page="programs"><a href="programs.html">Programs</a></li>
          <li class="nav-item" data-page="gallery"><a href="gallery.html">Gallery</a></li>
          <li class="nav-item" data-page="activities"><a href="activities.html">Activities</a></li>
          <li class="nav-item" data-page="admission"><a href="admission.html">Admission</a></li>
          <li class="nav-item" data-page="contact"><a href="contact.html">Contact</a></li>
        </ul>
        <div style="display: flex; align-items: center; gap: 15px;">
          <div class="rewards-nav-badge" id="rewards-badge">
            <span class="star-icon">⭐</span>
            <span class="text-label">Stars:</span>
            <span id="star-count">0</span>
          </div>
          <button class="nav-toggle" id="nav-toggle" aria-label="Toggle Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  `,
  footer: `
    <footer class="footer">
      <div class="footer-wave">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="shape-fill"></path>
        </svg>
      </div>
      <div class="container footer-grid">
        <div class="footer-col footer-about">
          <div class="footer-logo">
            <img src="assets/images/hero/rainbow.png" alt="Rainbow logo">
            <span>Rainbow Kids</span>
          </div>
          <p>Nurturing young minds through creative play, safety-first policies, and a comprehensive early learning curriculum.</p>
          <div class="social-links">
            <a href="#" class="social-btn"><span class="fab-icon">FB</span></a>
            <a href="#" class="social-btn"><span class="fab-icon">IG</span></a>
            <a href="#" class="social-btn"><span class="fab-icon">YT</span></a>
            <a href="#" class="social-btn"><span class="fab-icon">TW</span></a>
          </div>
        </div>
        <div class="footer-col">
          <h3>Quick Links</h3>
          <ul class="footer-links">
            <li><a href="index.html">Home</a></li>
            <li><a href="about.html">About School</a></li>
            <li><a href="programs.html">Our Programs</a></li>
            <li><a href="activities.html">Play Activities</a></li>
            <li><a href="admission.html">Admissions</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h3>Programs</h3>
          <ul class="footer-links">
            <li><a href="programs.html#nursery">Nursery Class</a></li>
            <li><a href="programs.html#lkg">LKG Class</a></li>
            <li><a href="programs.html#ukg">UKG Class</a></li>
            <li><a href="activities.html">Bubble Game</a></li>
            <li><a href="activities.html">Drawing Easel</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h3>Contact Us</h3>
          <div class="footer-contact-item">
            <span class="icon">📍</span>
            <p>123 Rainbow Lane, Play City, PC 54321</p>
          </div>
          <div class="footer-contact-item">
            <span class="icon">📞</span>
            <p>+1 (555) 123-4567</p>
          </div>
          <div class="footer-contact-item">
            <span class="icon">✉️</span>
            <p>hello@rainbowkids.edu</p>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 Rainbow Kids Playschool. All rights reserved.</p>
        <p>Made with ❤️ for a brighter future. Play & Learn!</p>
      </div>
    </footer>
  `,
  mascot: `
    <div class="mascot-widget" id="mascot-widget">
      <div class="mascot-speech-bubble pop-in" id="mascot-bubble" style="display: none;">
        <p id="mascot-text">Hello! I'm Barnaby the Bunny. Click me to talk!</p>
        <button class="mascot-close-speech" id="mascot-bubble-close">×</button>
      </div>
      <div class="mascot-interactive" id="mascot-interactive-area">
        <img src="assets/images/mascots/rabbit.png" id="mascot-img" class="mascot-bounce-idle" alt="School Mascot">
      </div>
      <div class="mascot-selector-popover" id="mascot-selector" style="display: none;">
        <h4>Choose Mascot:</h4>
        <div class="mascot-options">
          <div class="mascot-opt active" data-mascot="rabbit">
            <img src="assets/images/mascots/rabbit.png" alt="Rabbit">
            <span>Barnaby</span>
          </div>
          <div class="mascot-opt" data-mascot="panda">
            <img src="assets/images/mascots/panda.png" alt="Panda">
            <span>Penny</span>
          </div>
          <div class="mascot-opt" data-mascot="elephant">
            <img src="assets/images/mascots/elephant.png" alt="Elephant">
            <span>Elly</span>
          </div>
        </div>
      </div>
      <button class="mascot-toggle-selector" id="mascot-sel-btn" title="Change Mascot">🎨</button>
    </div>
  `,
  rewards: `
    <div class="rewards-modal-overlay" id="rewards-modal" style="display: none;">
      <div class="rewards-modal-card pop-in">
        <button class="rewards-close-btn" id="rewards-modal-close">×</button>
        <h3 class="rewards-title">🌟 My Achievements 🌟</h3>
        <p class="rewards-subtitle">Collect stars by playing games, reading, and exploring the site!</p>
        <div class="rewards-star-display">
          <span class="big-star">⭐</span>
          <span class="total-stars-val" id="total-stars-val">0</span>
          <span class="stars-label">collected!</span>
        </div>
        <div class="badges-grid">
          <div class="badge-item locked" id="badge-welcome">
            <span class="badge-icon">🐣</span>
            <h4>Welcome Cadet</h4>
            <p>Visit Rainbow School</p>
          </div>
          <div class="badge-item locked" id="badge-explorer">
            <span class="badge-icon">🧭</span>
            <h4>Curious Explorer</h4>
            <p>Read about our timeline</p>
          </div>
          <div class="badge-item locked" id="badge-artist">
            <span class="badge-icon">🎨</span>
            <h4>Young Artist</h4>
            <p>Save a drawing easel masterpiece</p>
          </div>
          <div class="badge-item locked" id="badge-popper">
            <span class="badge-icon">🧼</span>
            <h4>Bubble Master</h4>
            <p>Pop 30 bubbles in the sandbox</p>
          </div>
          <div class="badge-item locked" id="badge-applicant">
            <span class="badge-icon">📜</span>
            <h4>Future Student</h4>
            <p>Fill out the admission form</p>
          </div>
        </div>
      </div>
    </div>
  `
};

async function loadComponent(elementId, componentPath, fallbackKey) {
  const container = document.getElementById(elementId);
  if (!container) return;

  try {
    const response = await fetch(componentPath);
    if (response.ok) {
      const html = await response.text();
      container.innerHTML = html;
    } else {
      throw new Error(`Server returned status: ${response.status}`);
    }
  } catch (error) {
    console.warn(`Fetch components failed for path ${componentPath}. Bypassing with fallback layouts.`, error);
    container.innerHTML = FALLBACK_TEMPLATES[fallbackKey];
  }
}

function highlightActiveLink() {
  const path = window.location.pathname;
  let page = path.split("/").pop().replace(".html", "");
  if (page === "" || page === "index") page = "index";
  
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(item => {
    if (item.getAttribute("data-page") === page) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

function setupMobileMenu() {
  const toggleBtn = document.getElementById("nav-toggle");
  const menu = document.getElementById("nav-menu");
  
  if (toggleBtn && menu) {
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleBtn.classList.toggle("open");
      menu.classList.toggle("open");
    });
    
    
    document.addEventListener("click", () => {
      toggleBtn.classList.remove("open");
      menu.classList.remove("open");
    });
    
    menu.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }
}

function initAudioContext() {
  if (!window.rainbowState.audioCtx) {
    window.rainbowState.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (window.rainbowState.audioCtx.state === 'suspended') {
    window.rainbowState.audioCtx.resume();
  }
}

function playSynthSound(soundType) {
  try {
    initAudioContext();
    const ctx = window.rainbowState.audioCtx;
    const now = ctx.currentTime;
    
    switch(soundType) {
      case 'bubble': {
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }
      case 'star': {
        
        const frequencies = [523.25, 659.25, 783.99, 1046.50]; 
        frequencies.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = 'triangle';
          osc.frequency.value = freq;
          
          const delay = index * 0.08;
          gain.gain.setValueAtTime(0, now + delay);
          gain.gain.linearRampToValueAtTime(0.12, now + delay + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.4);
          
          osc.start(now + delay);
          osc.stop(now + delay + 0.4);
        });
        break;
      }
      case 'click': {
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
        
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
      case 'success': {
        
        const notes = [392.00, 523.25, 659.25, 783.99]; 
        notes.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = 'sine';
          osc.frequency.value = freq;
          
          const delay = index * 0.05;
          gain.gain.setValueAtTime(0, now + delay);
          gain.gain.linearRampToValueAtTime(0.1, now + delay + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.35);
          
          osc.start(now + delay);
          osc.stop(now + delay + 0.35);
        });
        break;
      }
      case 'lion': {
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.6);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.6);
        
        osc.start(now);
        osc.stop(now + 0.6);
        break;
      }
      case 'dog': {
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.25);
        
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }
      case 'cow': {
        
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        
        osc1.type = 'triangle';
        osc2.type = 'sawtooth';
        
        osc1.frequency.setValueAtTime(150, now);
        osc1.frequency.linearRampToValueAtTime(120, now + 0.8);
        
        osc2.frequency.setValueAtTime(153, now);
        osc2.frequency.linearRampToValueAtTime(122, now + 0.8);
        
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.8);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.8);
        osc2.stop(now + 0.8);
        break;
      }
    }
  } catch(e) {
    console.error("Audio Synthesis error", e);
  }
}

document.addEventListener("click", initAudioContext, { once: true });
document.addEventListener("touchstart", initAudioContext, { once: true });

window.addEventListener("scroll", () => {
  const header = document.querySelector(".header-nav");
  if (header) {
    if (window.scrollY > 40) {
      header.classList.add("scroll-scrolled");
    } else {
      header.classList.remove("scroll-scrolled");
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  
  Promise.all([
    loadComponent("navbar-placeholder", "components/navbar.html", "navbar"),
    loadComponent("footer-placeholder", "components/footer.html", "footer"),
    loadComponent("mascot-placeholder", "components/mascot.html", "mascot"),
    loadComponent("rewards-placeholder", "components/rewards.html", "rewards")
  ]).then(() => {
    
    highlightActiveLink();
    setupMobileMenu();
    
    
    if (typeof initializeRewards === "function") initializeRewards();
    if (typeof initializeMascot === "function") initializeMascot();
  });
});
