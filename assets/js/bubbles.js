/* Bubble Pop Game: Infinite floating bubble loop, popping collisions, and score tracking */

let bubbleSpawnInterval = null;
let gameActive = false;
let score = 0;
let highscore = 0;
let bubbleSpeedFactor = 1.0;

const BUBBLE_EMOJIS = ["A", "B", "C", "D", "1", "2", "3", "4", "🍎", "🎈", "🐱", "🐶", "🦁", "🐰", "⭐", "🧩", "🎨", "🎵"];
const BUBBLE_COLORS = [
  "rgba(255, 107, 139, 0.45)",  
  "rgba(78, 168, 222, 0.45)",   
  "rgba(255, 209, 102, 0.45)",  
  "rgba(6, 214, 160, 0.45)",    
  "rgba(157, 78, 221, 0.45)",   
  "rgba(244, 162, 97, 0.45)"    
];

function initBubbleGame() {
  const startBtn = document.getElementById("bubble-start-btn");
  const playArea = document.getElementById("bubble-play-area");
  
  
  const savedHigh = localStorage.getItem("bubble_highscore");
  highscore = savedHigh ? parseInt(savedHigh) : 0;
  updateBubbleScoreUI();
  
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      startBubbleGame();
    });
  }
}

function startBubbleGame() {
  if (gameActive) return;
  
  if (typeof playSynthSound === "function") playSynthSound('success');
  
  gameActive = true;
  score = 0;
  bubbleSpeedFactor = 1.0;
  updateBubbleScoreUI();
  
  
  const overlay = document.getElementById("bubble-overlay");
  if (overlay) overlay.style.display = "none";
  
  
  bubbleSpawnInterval = setInterval(spawnBubble, 1100);
}

function stopBubbleGame() {
  gameActive = false;
  clearInterval(bubbleSpawnInterval);
  
  
  const playArea = document.getElementById("bubble-play-area");
  if (playArea) {
    const bubbles = playArea.querySelectorAll(".bubble");
    bubbles.forEach(b => b.remove());
  }
  
  
  if (score > highscore) {
    highscore = score;
    localStorage.setItem("bubble_highscore", highscore);
  }
  
  
  const overlay = document.getElementById("bubble-overlay");
  const overlayTitle = document.getElementById("bubble-overlay-title");
  const overlayText = document.getElementById("bubble-overlay-text");
  const startBtn = document.getElementById("bubble-start-btn");
  
  if (overlay) {
    if (overlayTitle) overlayTitle.textContent = "Game Over! 🎉";
    if (overlayText) overlayText.textContent = `You popped ${score} bubbles! High score: ${highscore}`;
    if (startBtn) startBtn.textContent = "Play Again";
    overlay.style.display = "flex";
  }
}

function spawnBubble() {
  const playArea = document.getElementById("bubble-play-area");
  if (!playArea || !gameActive) return;
  
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  
  
  const size = 55 + Math.floor(Math.random() * 40);
  bubble.style.width = size + "px";
  bubble.style.height = size + "px";
  
  
  const color = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
  bubble.style.backgroundColor = color;
  
  
  bubble.textContent = BUBBLE_EMOJIS[Math.floor(Math.random() * BUBBLE_EMOJIS.length)];
  
  
  const leftPos = 5 + Math.random() * 80;
  bubble.style.left = leftPos + "%";
  bubble.style.bottom = "-100px";
  
  playArea.appendChild(bubble);
  
  
  const floatDuration = Math.max(2.5, 6.0 - (score * 0.1));
  bubble.style.transition = `bottom ${floatDuration}s linear`;
  
  
  void bubble.offsetWidth;
  bubble.style.bottom = (playArea.offsetHeight + 50) + "px";
  
  
  bubble.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    popBubble(bubble, e);
  });
  
  bubble.addEventListener("touchstart", (e) => {
    e.stopPropagation();
    e.preventDefault();
    popBubble(bubble, e.touches[0]);
  }, { passive: false });
  
  
  setTimeout(() => {
    if (bubble && bubble.parentNode) {
      bubble.remove();
      
      
      
      
    }
  }, floatDuration * 1000);
}

function popBubble(bubble, event) {
  if (bubble.classList.contains("popping")) return;
  
  bubble.classList.add("popping");
  score++;
  updateBubbleScoreUI();
  
  
  if (typeof playSynthSound === "function") playSynthSound('bubble');
  
  
  if (typeof createStarExplosion === "function") {
    createStarExplosion(event.clientX, event.clientY, 4);
  }
  
  
  if (score % 10 === 0) {
    if (typeof addStars === "function") addStars(5);
  }
  
  
  if (score >= 30) {
    if (typeof addStars === "function") addStars(15, 'popper');
  }
  
  
  if (score % 5 === 0) {
    clearInterval(bubbleSpawnInterval);
    const speed = Math.max(450, 1100 - (score * 15));
    bubbleSpawnInterval = setInterval(spawnBubble, speed);
  }
  
  
  setTimeout(() => {
    bubble.remove();
  }, 150);
}

function updateBubbleScoreUI() {
  const currentScoreElem = document.getElementById("bubble-score-current");
  const highScoreElem = document.getElementById("bubble-score-high");
  
  if (currentScoreElem) currentScoreElem.textContent = score;
  if (highScoreElem) highScoreElem.textContent = highscore;
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    if (document.getElementById("bubble-play-area")) {
      initBubbleGame();
    }
  }, 800); 
});
