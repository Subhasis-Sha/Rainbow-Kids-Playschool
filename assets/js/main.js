/**
 * GVIT-Playschool - Main Scripts (For GitHub Portfolio)
 * Controls sound synthesizer, persistent scoreboard metrics, day/night mode toggles, and scroll-to-top buttons.
 */

let audioCtx = null;

// Initialize Web Audio context upon first interaction
function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Play kid-themed synthesizer sound effects
function playSynthSound(soundType) {
  try {
    initAudioContext();
    const now = audioCtx.currentTime;
    
    switch(soundType) {
      case 'bubble': {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }
      case 'click': {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
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
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
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
    }
  } catch(e) {
    console.error("Audio Synthesis failed", e);
  }
}

document.addEventListener("click", initAudioContext, { once: true });
document.addEventListener("touchstart", initAudioContext, { once: true });

// Update Scoreboard metrics in navigation and modal UI
function updateStarDisplay() {
  const starCountEl = document.getElementById("star-count");
  let bubblesStars = parseInt(localStorage.getItem("stars-bubbles") || "0", 10);
  let paintingStars = parseInt(localStorage.getItem("stars-painting") || "0", 10);
  
  if (starCountEl) {
    starCountEl.textContent = (bubblesStars + paintingStars).toString();
  }
  
  const bubbleStarsModalEl = document.getElementById("achieve-bubble-stars");
  if (bubbleStarsModalEl) {
    bubbleStarsModalEl.textContent = bubblesStars.toString();
  }
  
  const paintStarsModalEl = document.getElementById("achieve-paint-stars");
  if (paintStarsModalEl) {
    paintStarsModalEl.textContent = paintingStars.toString();
  }
}

// Adjust star counts persistently inside localStorage
function adjustStars(amount, gameType) {
  if (gameType === 'bubbles') {
    let stars = parseInt(localStorage.getItem("stars-bubbles") || "0", 10);
    stars = Math.max(0, stars + amount);
    localStorage.setItem("stars-bubbles", stars.toString());
  } else if (gameType === 'painting') {
    let stars = parseInt(localStorage.getItem("stars-painting") || "0", 10);
    stars = Math.max(0, stars + amount);
    localStorage.setItem("stars-painting", stars.toString());
  }
  updateStarDisplay();
}

// Reset collected star metrics
function resetStars() {
  localStorage.setItem("stars-bubbles", "0");
  localStorage.setItem("stars-painting", "0");
  updateStarDisplay();
  playSynthSound('click');
}

// Manage Day/Night Cozy Theme switching UI and icon transitions
function initTheme() {
  const themeToggleBtn = document.getElementById("theme-toggle");
  if (!themeToggleBtn) return;
  
  const updateIcon = (theme) => {
    const icon = themeToggleBtn.querySelector("i");
    if (icon) {
      if (theme === "dark") {
        icon.className = "fa-solid fa-sun";
      } else {
        icon.className = "fa-solid fa-moon";
      }
    }
  };

  const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
  updateIcon(currentTheme);

  themeToggleBtn.addEventListener("click", () => {
    const activeTheme = document.documentElement.getAttribute("data-theme") || "light";
    const targetTheme = activeTheme === "light" ? "dark" : "light";
    
    document.documentElement.setAttribute("data-theme", targetTheme);
    localStorage.setItem("theme", targetTheme);
    updateIcon(targetTheme);
  });
}

// Floating back-to-top scroll button logic
function initBackToTop() {
  const backToTopBtn = document.getElementById("back-to-top");
  if (!backToTopBtn) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add("visible");
    } else {
      backToTopBtn.classList.remove("visible");
    }
  });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

// Run initializers on content load
document.addEventListener("DOMContentLoaded", () => {
  updateStarDisplay();
  initTheme();
  initBackToTop();

  const navbarContent = document.getElementById("navbarContent");
  const togglerBtn = document.querySelector(".navbar-toggler");
  if (navbarContent && togglerBtn) {
    navbarContent.addEventListener("show.bs.collapse", () => {
      togglerBtn.classList.add("open");
    });
    navbarContent.addEventListener("hide.bs.collapse", () => {
      togglerBtn.classList.remove("open");
    });
  }
});

