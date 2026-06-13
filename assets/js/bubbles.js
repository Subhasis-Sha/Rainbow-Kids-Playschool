/**
 * @file bubbles.js
 * @description Interactive bubble-popping game logic. Handles spawning, animation, click/touch interaction, audio integration, and score/reward milestones.
 */

document.addEventListener("DOMContentLoaded", () => {
  const playArea = document.getElementById("bubble-play-area");
  if (!playArea) return;

  const startBtn = document.getElementById("bubble-start-btn");
  const overlay = document.getElementById("bubble-overlay");
  const scoreCurrentEl = document.getElementById("bubble-score-current");
  const scoreTotalEl = document.getElementById("bubble-score-total");

  let currentPops = 0;
  let totalPops = 0;
  let spawnInterval = null;
  let isGameActive = false;

  const characters = ["A", "B", "C", "1", "2", "3", "🐰", "🐘", "🐼", "⭐", "🎈"];

  startBtn.addEventListener("click", () => {
    overlay.style.display = "none";
    currentPops = 0;
    totalPops = 0;
    updateScores();
    isGameActive = true;
    
    if (typeof playSynthSound === 'function') {
      playSynthSound('success');
    }
    
    startGame();
  });

  /**
   * Spawns bubbles at regular intervals.
   */
  function startGame() {
    if (spawnInterval) clearInterval(spawnInterval);
    spawnInterval = setInterval(spawnBubble, 800);
  }

  /**
   * Generates a new bubble element with random properties and attaches interactions.
   */
  function spawnBubble() {
    if (!isGameActive) return;

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    
    const randomChar = characters[Math.floor(Math.random() * characters.length)];
    bubble.textContent = randomChar;

    const size = Math.floor(Math.random() * 30) + 50; 
    const leftOffset = Math.floor(Math.random() * 80) + 5; 
    const duration = Math.random() * 2 + 3.5; 

    bubble.style.width = size + "px";
    bubble.style.height = size + "px";
    bubble.style.left = leftOffset + "%";
    bubble.style.bottom = "-100px";
    bubble.style.fontSize = (size * 0.4) + "px";
    bubble.style.animation = `bubble-float-up-anim ${duration}s linear forwards`;

    bubble.addEventListener("mousedown", (e) => {
      popBubble(bubble);
      e.stopPropagation();
    });

    bubble.addEventListener("touchstart", (e) => {
      popBubble(bubble);
      e.stopPropagation();
      e.preventDefault();
    }, { passive: false });

    bubble.addEventListener("animationend", () => {
      if (bubble.parentElement) {
        bubble.remove();
      }
    });

    playArea.appendChild(bubble);
  }

  /**
   * Processes bubble popping: triggers audio, increments score, rewards stars, and removes the element.
   * @param {HTMLElement} bubble - The bubble DOM element popped.
   */
  function popBubble(bubble) {
    if (bubble.classList.contains("popping")) return;
    bubble.classList.add("popping");

    if (typeof playSynthSound === 'function') {
      playSynthSound('bubble');
    }

    currentPops++;
    totalPops++;
    
    if (currentPops >= 10) {
      currentPops = 0;
      if (typeof playSynthSound === 'function') {
        playSynthSound('success');
      }
      if (typeof adjustStars === 'function') {
        adjustStars(5, 'bubbles');
      }
    }

    updateScores();

    setTimeout(() => {
      if (bubble.parentElement) {
        bubble.remove();
      }
    }, 150);
  }

  /**
   * Syncs internal score tracking to the DOM UI.
   */
  function updateScores() {
    scoreCurrentEl.textContent = `${currentPops} / 10`;
    scoreTotalEl.textContent = totalPops;
  }
});
