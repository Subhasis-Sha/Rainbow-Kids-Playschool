/* Rewards Engine: Star points validation, modal callbacks, and achievement unlock handlers */

const STARS_STORAGE_KEY = 'rainbow_school_stars';
const TASKS_STORAGE_KEY = 'rainbow_school_tasks';

function initializeRewards() {
  
  const savedStars = localStorage.getItem(STARS_STORAGE_KEY);
  window.rainbowState.stars = savedStars ? parseInt(savedStars) : 0;
  
  
  const savedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
  window.rainbowState.completedTasks = savedTasks ? JSON.parse(savedTasks) : [];
  
  
  if (!window.rainbowState.completedTasks.includes('welcome')) {
    setTimeout(() => {
      addStars(10, 'welcome');
    }, 1500);
  }
  
  updateStarsUI();
  updateAchievementsList();
  
  
  setupRewardsListeners();
}

function setupRewardsListeners() {
  const badge = document.getElementById("rewards-badge");
  const closeBtn = document.getElementById("rewards-modal-close");
  const modal = document.getElementById("rewards-modal");
  
  if (badge) {
    badge.addEventListener("click", () => {
      toggleRewardsModal();
    });
  }
  
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      toggleRewardsModal();
    });
  }
  
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        toggleRewardsModal();
      }
    });
  }
}

function toggleRewardsModal() {
  const modal = document.getElementById("rewards-modal");
  if (!modal) return;
  
  if (modal.style.display === "none" || modal.style.display === "") {
    
    if (typeof playSynthSound === "function") playSynthSound('click');
    
    
    const totalVal = document.getElementById("total-stars-val");
    if (totalVal) totalVal.textContent = window.rainbowState.stars;
    
    updateAchievementsList();
    
    modal.style.display = "flex";
  } else {
    if (typeof playSynthSound === "function") playSynthSound('click');
    modal.style.display = "none";
  }
}

function addStars(count, reasonKey) {
  
  if (reasonKey && window.rainbowState.completedTasks.includes(reasonKey)) {
    return;
  }
  
  window.rainbowState.stars += count;
  localStorage.setItem(STARS_STORAGE_KEY, window.rainbowState.stars);
  
  
  if (reasonKey) {
    window.rainbowState.completedTasks.push(reasonKey);
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(window.rainbowState.completedTasks));
    showAchievementToast(reasonKey);
  }
  
  
  updateStarsUI();
  if (typeof playSynthSound === "function") playSynthSound('star');
  
  
  createStarExplosion(window.innerWidth / 2, window.innerHeight / 3, 10);
}

function updateStarsUI() {
  const counter = document.getElementById("star-count");
  const badge = document.getElementById("rewards-badge");
  
  if (counter) {
    counter.textContent = window.rainbowState.stars;
  }
  
  if (badge) {
    
    badge.classList.remove("star-bounce");
    void badge.offsetWidth; 
    badge.classList.add("star-bounce");
    setTimeout(() => {
      badge.classList.remove("star-bounce");
    }, 600);
  }
}

function updateAchievementsList() {
  const tasks = window.rainbowState.completedTasks;
  const badges = {
    welcome: document.getElementById("badge-welcome"),
    explorer: document.getElementById("badge-explorer"),
    artist: document.getElementById("badge-artist"),
    popper: document.getElementById("badge-popper"),
    applicant: document.getElementById("badge-applicant")
  };
  
  for (const [key, element] of Object.entries(badges)) {
    if (element) {
      if (tasks.includes(key)) {
        element.classList.remove("locked");
        element.classList.add("unlocked");
      } else {
        element.classList.remove("unlocked");
        element.classList.add("locked");
      }
    }
  }
}

function showAchievementToast(reasonKey) {
  const titles = {
    welcome: "Welcome Cadet 🐣",
    explorer: "Curious Explorer 🧭",
    artist: "Young Artist 🎨",
    popper: "Bubble Master 🧼",
    applicant: "Future Student 📜"
  };
  
  const toast = document.createElement("div");
  toast.className = "achievement-toast pop-in";
  toast.innerHTML = `
    <div style="font-size: 1.5rem; margin-right: 12px;">🏆</div>
    <div>
      <h4 style="margin: 0; color: #FFF; font-family: 'Fredoka', sans-serif;">Badge Unlocked!</h4>
      <p style="margin: 2px 0 0; color: #FFFDF0; font-size: 0.9rem;">${titles[reasonKey] || "Achievement Complete!"}</p>
    </div>
  `;
  
  
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "30px",
    left: "30px",
    background: "linear-gradient(135deg, #FF6B8B, #9D4EDD)",
    border: "3px solid #FFD166",
    borderRadius: "16px",
    padding: "15px 25px",
    color: "#FFF",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    display: "flex",
    alignItems: "center",
    zIndex: "9999",
    pointerEvents: "none"
  });
  
  document.body.appendChild(toast);
  
  if (typeof playSynthSound === "function") playSynthSound('success');
  
  setTimeout(() => {
    toast.style.animation = "pop-in-anim 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) reverse forwards";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

function createStarExplosion(startX, startY, particleCount) {
  const container = document.body;
  
  for (let i = 0; i < particleCount; i++) {
    const star = document.createElement("div");
    star.className = "star-particle";
    star.style.left = startX + "px";
    star.style.top = startY + "px";
    
    
    const angle = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * 150;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    
    
    star.style.setProperty("--tx", tx + "px");
    star.style.setProperty("--ty", ty + "px");
    
    
    const size = 15 + Math.random() * 15;
    star.style.width = size + "px";
    star.style.height = size + "px";
    
    
    star.style.animationDelay = (Math.random() * 0.15) + "s";
    
    container.appendChild(star);
    
    
    setTimeout(() => {
      star.remove();
    }, 1000);
  }
}
