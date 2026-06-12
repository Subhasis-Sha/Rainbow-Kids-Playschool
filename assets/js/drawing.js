/* Drawing Easel: HTML5 canvas drawing listeners, brush adjustments, and masterpiece download */

let canvas = null;
let ctx = null;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let brushColor = '#FF6B8B'; 
let brushSize = 8;
let isEraser = false;

function initDrawingBoard() {
  canvas = document.getElementById("drawing-canvas");
  if (!canvas) return;
  
  ctx = canvas.getContext("2d");
  
  
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  
  
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  
  
  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);
  canvas.addEventListener("mouseout", stopDrawing);
  
  
  canvas.addEventListener("touchstart", startDrawingTouch, { passive: false });
  canvas.addEventListener("touchmove", drawTouch, { passive: false });
  canvas.addEventListener("touchend", stopDrawing);
  
  
  const swatches = document.querySelectorAll(".color-swatch");
  swatches.forEach(swatch => {
    swatch.addEventListener("click", () => {
      
      isEraser = false;
      
      swatches.forEach(s => s.classList.remove("active"));
      swatch.classList.add("active");
      
      
      brushColor = swatch.getAttribute("data-color");
      
      if (typeof playSynthSound === "function") playSynthSound('click');
    });
  });
  
  
  const sizeSlider = document.getElementById("brush-size");
  if (sizeSlider) {
    sizeSlider.addEventListener("input", (e) => {
      brushSize = parseInt(e.target.value);
    });
  }
  
  
  const eraserBtn = document.getElementById("tool-eraser");
  if (eraserBtn) {
    eraserBtn.addEventListener("click", () => {
      isEraser = !isEraser;
      if (typeof playSynthSound === "function") playSynthSound('click');
      
      if (isEraser) {
        eraserBtn.textContent = "✏️ Draw Mode";
        eraserBtn.classList.add("btn-sky");
        eraserBtn.classList.remove("btn-outline");
      } else {
        eraserBtn.textContent = "🧼 Eraser";
        eraserBtn.classList.remove("btn-sky");
        eraserBtn.classList.add("btn-outline");
      }
    });
  }
  
  
  const clearBtn = document.getElementById("tool-clear");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Do you want to clear your beautiful drawing?")) {
        clearCanvas();
        if (typeof playSynthSound === "function") playSynthSound('click');
      }
    });
  }
  
  
  const saveBtn = document.getElementById("tool-save");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      saveMasterpiece();
    });
  }
}

function resizeCanvas() {
  if (!canvas) return;
  
  
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext("2d");
  tempCtx.drawImage(canvas, 0, 0);
  
  
  const container = canvas.parentElement;
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  
  
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  
  
  ctx.drawImage(tempCanvas, 0, 0);
}

function startDrawing(e) {
  isDrawing = true;
  [lastX, lastY] = [e.offsetX, e.offsetY];
  if (typeof playSynthSound === "function") playSynthSound('bubble');
}

function startDrawingTouch(e) {
  e.preventDefault();
  isDrawing = true;
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  [lastX, lastY] = [touch.clientX - rect.left, touch.clientY - rect.top];
  if (typeof playSynthSound === "function") playSynthSound('bubble');
}

function draw(e) {
  if (!isDrawing) return;
  
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(e.offsetX, e.offsetY);
  
  ctx.strokeStyle = isEraser ? '#FFFFFF' : brushColor;
  ctx.lineWidth = brushSize;
  ctx.stroke();
  
  [lastX, lastY] = [e.offsetX, e.offsetY];
}

function drawTouch(e) {
  if (!isDrawing) return;
  e.preventDefault();
  
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const currentX = touch.clientX - rect.left;
  const currentY = touch.clientY - rect.top;
  
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(currentX, currentY);
  
  ctx.strokeStyle = isEraser ? '#FFFFFF' : brushColor;
  ctx.lineWidth = brushSize;
  ctx.stroke();
  
  [lastX, lastY] = [currentX, currentY];
}

function stopDrawing() {
  isDrawing = false;
}

function clearCanvas() {
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function saveMasterpiece() {
  
  const dataURL = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = `rainbow-kids-masterpiece-${Date.now()}.png`;
  link.href = dataURL;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  
  if (typeof addStars === "function") {
    addStars(15, 'artist');
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    if (document.getElementById("drawing-canvas")) {
      initDrawingBoard();
    }
  }, 800); 
});
