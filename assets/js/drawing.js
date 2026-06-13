/**
 * @file drawing.js
 * @description Interactive canvas drawing manager featuring shape-tracing challenges, checkpoints, collision validation, and visual hints.
 */

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("drawing-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const challengeBadge = document.getElementById("easel-challenge");
  const brushSizeInput = document.getElementById("brush-size");
  const clearBtn = document.getElementById("tool-clear");
  const eraserBtn = document.getElementById("tool-eraser");
  const skipBtn = document.getElementById("tool-skip");
  const hintBtn = document.getElementById("tool-hint");
  const swatches = document.querySelectorAll(".color-swatch");

  let drawing = false;
  let currentColor = "#FF4B72";
  let brushSize = parseInt(brushSizeInput.value, 10);
  let shapeIndex = 0;
  let activeCheckpoints = [];
  let cx = 0;
  let cy = 0;
  let lastX = null;
  let lastY = null;

  /**
   * Computes the shortest distance from point p to the line segment defined by endpoints v and w.
   * Utilized to verify if user stroke passed near the drawing guide checkpoint.
   * @param {Object} p - The point to test {x, y}.
   * @param {Object} v - Start endpoint of the line segment {x, y}.
   * @param {Object} w - End endpoint of the line segment {x, y}.
   * @returns {number} Distance from point p to segment vw.
   */
  function distToSegment(p, v, w) {
    const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
    if (l2 === 0) return Math.sqrt((p.x - v.x) ** 2 + (p.y - v.y) ** 2);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projection = {
      x: v.x + t * (w.x - v.x),
      y: v.y + t * (w.y - v.y)
    };
    return Math.sqrt((p.x - projection.x) ** 2 + (p.y - projection.y) ** 2);
  }

  /* ==========================================================================
     Shape Templates & Checkpoint Outlines
     ========================================================================== */
  const shapes = [
    {
      name: "Circle",
      getPoints: (x, y) => {
        const pts = [];
        const r = 80;
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          pts.push({ x: x + r * Math.cos(angle), y: y + r * Math.sin(angle), hit: false });
        }
        return pts;
      },
      drawFaintGuide: (ctx, x, y) => {
        ctx.beginPath();
        ctx.arc(x, y, 80, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 75, 114, 0.12)";
        ctx.setLineDash([6, 12]);
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.setLineDash([]);
      },
      drawFullDrawing: (ctx, x, y) => {
        ctx.beginPath();
        ctx.arc(x, y, 80, 0, Math.PI * 2);
        ctx.strokeStyle = "#FF4B72";
        ctx.lineWidth = 6;
        ctx.stroke();
      }
    },
    {
      name: "Square",
      getPoints: (x, y) => {
        const h = 60;
        return [
          { x: x - h, y: y - h, hit: false },
          { x: x, y: y - h, hit: false },
          { x: x + h, y: y - h, hit: false },
          { x: x + h, y: y, hit: false },
          { x: x + h, y: y + h, hit: false },
          { x: x, y: y + h, hit: false },
          { x: x - h, y: y + h, hit: false },
          { x: x - h, y: y, hit: false }
        ];
      },
      drawFaintGuide: (ctx, x, y) => {
        const h = 60;
        ctx.strokeStyle = "rgba(0, 162, 232, 0.12)";
        ctx.setLineDash([6, 12]);
        ctx.lineWidth = 3;
        ctx.strokeRect(x - h, y - h, 120, 120);
        ctx.setLineDash([]);
      },
      drawFullDrawing: (ctx, x, y) => {
        const h = 60;
        ctx.strokeStyle = "#00A2E8";
        ctx.lineWidth = 6;
        ctx.strokeRect(x - h, y - h, 120, 120);
      }
    },
    {
      name: "Triangle",
      getPoints: (x, y) => {
        const h = 120;
        const w = 140;
        return [
          { x: x, y: y - h/2, hit: false },
          { x: x + w/4, y: y, hit: false },
          { x: x + w/2, y: y + h/2, hit: false },
          { x: x, y: y + h/2, hit: false },
          { x: x - w/2, y: y + h/2, hit: false },
          { x: x - w/4, y: y, hit: false }
        ];
      },
      drawFaintGuide: (ctx, x, y) => {
        const h = 120;
        const w = 140;
        ctx.strokeStyle = "rgba(138, 43, 226, 0.12)";
        ctx.setLineDash([6, 12]);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y - h/2);
        ctx.lineTo(x + w/2, y + h/2);
        ctx.lineTo(x - w/2, y + h/2);
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);
      },
      drawFullDrawing: (ctx, x, y) => {
        const h = 120;
        const w = 140;
        ctx.strokeStyle = "#8A2BE2";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x, y - h/2);
        ctx.lineTo(x + w/2, y + h/2);
        ctx.lineTo(x - w/2, y + h/2);
        ctx.closePath();
        ctx.stroke();
      }
    },
    {
      name: "Rectangle",
      getPoints: (x, y) => {
        const w = 150;
        const h = 80;
        const wh = w / 2;
        const hh = h / 2;
        return [
          { x: x - wh, y: y - hh, hit: false },
          { x: x, y: y - hh, hit: false },
          { x: x + wh, y: y - hh, hit: false },
          { x: x + wh, y: y, hit: false },
          { x: x + wh, y: y + hh, hit: false },
          { x: x, y: y + hh, hit: false },
          { x: x - wh, y: y + hh, hit: false },
          { x: x - wh, y: y, hit: false }
        ];
      },
      drawFaintGuide: (ctx, x, y) => {
        const w = 150;
        const h = 80;
        ctx.strokeStyle = "rgba(20, 201, 151, 0.12)";
        ctx.setLineDash([6, 12]);
        ctx.lineWidth = 3;
        ctx.strokeRect(x - w/2, y - h/2, w, h);
        ctx.setLineDash([]);
      },
      drawFullDrawing: (ctx, x, y) => {
        const w = 150;
        const h = 80;
        ctx.strokeStyle = "#20C997";
        ctx.lineWidth = 6;
        ctx.strokeRect(x - w/2, y - h/2, w, h);
      }
    },
    {
      name: "Diamond",
      getPoints: (x, y) => {
        const w = 130;
        const h = 130;
        return [
          { x: x, y: y - h/2, hit: false },
          { x: x + w/4, y: y - h/4, hit: false },
          { x: x + w/2, y: y, hit: false },
          { x: x + w/4, y: y + h/4, hit: false },
          { x: x, y: y + h/2, hit: false },
          { x: x - w/4, y: y + h/4, hit: false },
          { x: x - w/2, y: y, hit: false },
          { x: x - w/4, y: y - h/4, hit: false }
        ];
      },
      drawFaintGuide: (ctx, x, y) => {
        const w = 130;
        const h = 130;
        ctx.strokeStyle = "rgba(255, 193, 7, 0.12)";
        ctx.setLineDash([6, 12]);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y - h/2);
        ctx.lineTo(x + w/2, y);
        ctx.lineTo(x, y + h/2);
        ctx.lineTo(x - w/2, y);
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);
      },
      drawFullDrawing: (ctx, x, y) => {
        const w = 130;
        const h = 130;
        ctx.strokeStyle = "#FFC107";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x, y - h/2);
        ctx.lineTo(x + w/2, y);
        ctx.lineTo(x, y + h/2);
        ctx.lineTo(x - w/2, y);
        ctx.closePath();
        ctx.stroke();
      }
    },
    {
      name: "Star",
      getPoints: (x, y) => {
        const pts = [];
        for (let i = 0; i < 10; i++) {
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          const rad = i % 2 === 0 ? 80 : 35;
          pts.push({ x: x + rad * Math.cos(angle), y: y + rad * Math.sin(angle), hit: false });
        }
        return pts;
      },
      drawFaintGuide: (ctx, x, y) => {
        ctx.strokeStyle = "rgba(255, 107, 139, 0.12)";
        ctx.setLineDash([6, 12]);
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          const rad = i % 2 === 0 ? 80 : 35;
          if (i === 0) ctx.moveTo(x + rad * Math.cos(angle), y + rad * Math.sin(angle));
          else ctx.lineTo(x + rad * Math.cos(angle), y + rad * Math.sin(angle));
        }
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);
      },
      drawFullDrawing: (ctx, x, y) => {
        ctx.strokeStyle = "#FF4B72";
        ctx.lineWidth = 6;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          const rad = i % 2 === 0 ? 80 : 35;
          if (i === 0) ctx.moveTo(x + rad * Math.cos(angle), y + rad * Math.sin(angle));
          else ctx.lineTo(x + rad * Math.cos(angle), y + rad * Math.sin(angle));
        }
        ctx.closePath();
        ctx.stroke();
      }
    },
    {
      name: "Heart",
      getPoints: (x, y) => {
        const pts = [];
        for (let i = 0; i < 10; i++) {
          const t = (i * 2 * Math.PI) / 10;
          const xVal = 4 * 16 * Math.pow(Math.sin(t), 3);
          const yVal = -4 * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
          pts.push({ x: x + xVal, y: y + yVal - 10, hit: false });
        }
        return pts;
      },
      drawFaintGuide: (ctx, x, y) => {
        ctx.strokeStyle = "rgba(255, 75, 114, 0.12)";
        ctx.setLineDash([6, 12]);
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i <= 60; i++) {
          const t = (i * 2 * Math.PI) / 60;
          const xVal = 4 * 16 * Math.pow(Math.sin(t), 3);
          const yVal = -4 * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
          if (i === 0) ctx.moveTo(x + xVal, y + yVal - 10);
          else ctx.lineTo(x + xVal, y + yVal - 10);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      },
      drawFullDrawing: (ctx, x, y) => {
        ctx.strokeStyle = "#FF4B72";
        ctx.lineWidth = 6;
        ctx.beginPath();
        for (let i = 0; i <= 60; i++) {
          const t = (i * 2 * Math.PI) / 60;
          const xVal = 4 * 16 * Math.pow(Math.sin(t), 3);
          const yVal = -4 * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
          if (i === 0) ctx.moveTo(x + xVal, y + yVal - 10);
          else ctx.lineTo(x + xVal, y + yVal - 10);
        }
        ctx.stroke();
      }
    },
    {
      name: "Moon",
      getPoints: (x, y) => {
        const pts = [];
        for (let i = 0; i < 5; i++) {
          const a = -Math.PI/2 + (i * Math.PI) / 4;
          pts.push({ x: x + 70 * Math.cos(a) - 15, y: y + 70 * Math.sin(a), hit: false });
        }
        for (let i = 1; i < 4; i++) {
          const a = Math.PI/2 - (i * Math.PI) / 4;
          pts.push({ x: x + 50 * Math.cos(a) + 5, y: y + 50 * Math.sin(a), hit: false });
        }
        return pts;
      },
      drawFaintGuide: (ctx, x, y) => {
        ctx.strokeStyle = "rgba(0, 162, 232, 0.12)";
        ctx.setLineDash([6, 12]);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x - 15, y, 70, -Math.PI/2, Math.PI/2);
        ctx.arc(x + 5, y, 50, Math.PI/2, -Math.PI/2, true);
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);
      },
      drawFullDrawing: (ctx, x, y) => {
        ctx.strokeStyle = "#00A2E8";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(x - 15, y, 70, -Math.PI/2, Math.PI/2);
        ctx.arc(x + 5, y, 50, Math.PI/2, -Math.PI/2, true);
        ctx.closePath();
        ctx.stroke();
      }
    },
    {
      name: "House",
      getPoints: (x, y) => {
        return [
          { x: x - 45, y: y + 45, hit: false },
          { x: x + 45, y: y + 45, hit: false },
          { x: x + 45, y: y - 10, hit: false },
          { x: x - 45, y: y - 10, hit: false },
          { x: x, y: y - 55, hit: false },
          { x: x - 45, y: y + 15, hit: false },
          { x: x + 45, y: y + 15, hit: false },
          { x: x - 22, y: y - 32, hit: false },
          { x: x + 22, y: y - 32, hit: false }
        ];
      },
      drawFaintGuide: (ctx, x, y) => {
        ctx.strokeStyle = "rgba(138, 43, 226, 0.12)";
        ctx.setLineDash([6, 12]);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.strokeRect(x - 45, y - 10, 90, 55);
        ctx.beginPath();
        ctx.moveTo(x - 45, y - 10);
        ctx.lineTo(x, y - 55);
        ctx.lineTo(x + 45, y - 10);
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);
      },
      drawFullDrawing: (ctx, x, y) => {
        ctx.strokeStyle = "#8A2BE2";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.strokeRect(x - 45, y - 10, 90, 55);
        ctx.beginPath();
        ctx.moveTo(x - 45, y - 10);
        ctx.lineTo(x, y - 55);
        ctx.lineTo(x + 45, y - 10);
        ctx.closePath();
        ctx.stroke();
      }
    },
    {
      name: "Kite",
      getPoints: (x, y) => {
        return [
          { x: x, y: y - 60, hit: false },
          { x: x + 45, y: y - 10, hit: false },
          { x: x, y: y + 45, hit: false },
          { x: x - 45, y: y - 10, hit: false },
          { x: x, y: y - 10, hit: false },
          { x: x, y: y + 75, hit: false },
          { x: x - 22, y: y - 35, hit: false },
          { x: x + 22, y: y - 35, hit: false }
        ];
      },
      drawFaintGuide: (ctx, x, y) => {
        ctx.strokeStyle = "rgba(255, 193, 7, 0.12)";
        ctx.setLineDash([6, 12]);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y - 60);
        ctx.lineTo(x + 45, y - 10);
        ctx.lineTo(x, y + 45);
        ctx.lineTo(x - 45, y - 10);
        ctx.closePath();
        ctx.moveTo(x - 45, y - 10);
        ctx.lineTo(x + 45, y - 10);
        ctx.moveTo(x, y - 60);
        ctx.lineTo(x, y + 75);
        ctx.stroke();
        ctx.setLineDash([]);
      },
      drawFullDrawing: (ctx, x, y) => {
        ctx.strokeStyle = "#FFC107";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x, y - 60);
        ctx.lineTo(x + 45, y - 10);
        ctx.lineTo(x, y + 45);
        ctx.lineTo(x - 45, y - 10);
        ctx.closePath();
        ctx.moveTo(x - 45, y - 10);
        ctx.lineTo(x + 45, y - 10);
        ctx.moveTo(x, y - 60);
        ctx.lineTo(x, y + 75);
        ctx.stroke();
      }
    },
    {
      name: "Leaf",
      getPoints: (x, y) => {
        return [
          { x: x, y: y - 65, hit: false },
          { x: x + 35, y: y - 10, hit: false },
          { x: x, y: y + 50, hit: false },
          { x: x - 35, y: y - 10, hit: false },
          { x: x, y: y - 10, hit: false },
          { x: x, y: y + 70, hit: false },
          { x: x - 18, y: y - 38, hit: false },
          { x: x + 18, y: y - 38, hit: false }
        ];
      },
      drawFaintGuide: (ctx, x, y) => {
        ctx.strokeStyle = "rgba(32, 201, 151, 0.12)";
        ctx.setLineDash([6, 12]);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y + 50);
        ctx.quadraticCurveTo(x - 45, y - 10, x, y - 65);
        ctx.quadraticCurveTo(x + 45, y - 10, x, y + 50);
        ctx.moveTo(x, y - 65);
        ctx.lineTo(x, y + 70);
        ctx.stroke();
        ctx.setLineDash([]);
      },
      drawFullDrawing: (ctx, x, y) => {
        ctx.strokeStyle = "#20C997";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x, y + 50);
        ctx.quadraticCurveTo(x - 45, y - 10, x, y - 65);
        ctx.quadraticCurveTo(x + 45, y - 10, x, y + 50);
        ctx.moveTo(x, y - 65);
        ctx.lineTo(x, y + 70);
        ctx.stroke();
      }
    },
    {
      name: "Fish",
      getPoints: (x, y) => {
        return [
          { x: x - 65, y: y, hit: false },
          { x: x - 15, y: y - 35, hit: false },
          { x: x + 35, y: y, hit: false },
          { x: x - 15, y: y + 35, hit: false },
          { x: x + 60, y: y - 30, hit: false },
          { x: x + 60, y: y + 30, hit: false },
          { x: x - 40, y: y - 20, hit: false },
          { x: x - 40, y: y + 20, hit: false },
          { x: x + 10, y: y - 20, hit: false },
          { x: x + 10, y: y + 20, hit: false }
        ];
      },
      drawFaintGuide: (ctx, x, y) => {
        ctx.strokeStyle = "rgba(255, 75, 114, 0.12)";
        ctx.setLineDash([6, 12]);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x - 65, y);
        ctx.quadraticCurveTo(x - 15, y - 50, x + 35, y);
        ctx.quadraticCurveTo(x - 15, y + 50, x - 65, y);
        ctx.moveTo(x + 35, y);
        ctx.lineTo(x + 60, y - 30);
        ctx.lineTo(x + 60, y + 30);
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);
      },
      drawFullDrawing: (ctx, x, y) => {
        ctx.strokeStyle = "#FF4B72";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x - 65, y);
        ctx.quadraticCurveTo(x - 15, y - 50, x + 35, y);
        ctx.quadraticCurveTo(x - 15, y + 50, x - 65, y);
        ctx.moveTo(x + 35, y);
        ctx.lineTo(x + 60, y - 30);
        ctx.lineTo(x + 60, y + 30);
        ctx.closePath();
        ctx.stroke();
      }
    },
    {
      name: "Balloon",
      getPoints: (x, y) => {
        return [
          { x: x, y: y - 60, hit: false },
          { x: x - 35, y: y - 15, hit: false },
          { x: x + 35, y: y - 15, hit: false },
          { x: x, y: y + 40, hit: false },
          { x: x, y: y + 50, hit: false },
          { x: x - 10, y: y + 75, hit: false },
          { x: x - 22, y: y - 42, hit: false },
          { x: x + 22, y: y - 42, hit: false }
        ];
      },
      drawFaintGuide: (ctx, x, y) => {
        ctx.strokeStyle = "rgba(0, 162, 232, 0.12)";
        ctx.setLineDash([6, 12]);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y - 60);
        ctx.bezierCurveTo(x - 65, y - 60, x - 55, y + 40, x, y + 40);
        ctx.bezierCurveTo(x + 55, y + 40, x + 65, y - 60, x, y - 60);
        ctx.moveTo(x - 8, y + 40);
        ctx.lineTo(x + 8, y + 40);
        ctx.lineTo(x, y + 50);
        ctx.closePath();
        ctx.moveTo(x, y + 50);
        ctx.quadraticCurveTo(x - 15, y + 65, x - 10, y + 75);
        ctx.stroke();
        ctx.setLineDash([]);
      },
      drawFullDrawing: (ctx, x, y) => {
        ctx.strokeStyle = "#00A2E8";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x, y - 60);
        ctx.bezierCurveTo(x - 65, y - 60, x - 55, y + 40, x, y + 40);
        ctx.bezierCurveTo(x + 55, y + 40, x + 65, y - 60, x, y - 60);
        ctx.moveTo(x - 8, y + 40);
        ctx.lineTo(x + 8, y + 40);
        ctx.lineTo(x, y + 50);
        ctx.closePath();
        ctx.moveTo(x, y + 50);
        ctx.quadraticCurveTo(x - 15, y + 65, x - 10, y + 75);
        ctx.stroke();
      }
    }
  ];

  /**
   * Resizes the canvas context and updates shape constraints.
   */
  function resizeCanvas() {
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = 280;
    cx = canvas.width / 2;
    cy = canvas.height / 2;
    loadChallenge();
  }

  /**
   * Loads a challenge shape and sets active validation checkpoints.
   */
  function loadChallenge() {
    const challenge = shapes[shapeIndex];
    challengeBadge.textContent = "Challenge: Draw a " + challenge.name;
    activeCheckpoints = challenge.getPoints(cx, cy);
    redrawBoard();
  }

  /**
   * Redraws the board guides. Currently left empty to hide default helper lines.
   */
  function redrawBoard() {
  }

  /**
   * Clears the drawing canvas back to solid white.
   */
  function clearCanvas() {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    loadChallenge();
  }

  /**
   * Extract interaction coordinates from event context.
   */
  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function startDrawing(e) {
    drawing = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    lastX = pos.x;
    lastY = pos.y;
    checkCollision(pos.x, pos.y);
    e.preventDefault();
  }

  function draw(e) {
    if (!drawing) return;
    const pos = getPos(e);
    
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    
    checkCollision(pos.x, pos.y, lastX, lastY);
    lastX = pos.x;
    lastY = pos.y;
    e.preventDefault();
  }

  function stopDrawing() {
    drawing = false;
    ctx.beginPath();
    lastX = null;
    lastY = null;
  }

  /**
   * Validates if drawing path hits active challenge checkpoints.
   */
  function checkCollision(x, y, lx, ly) {
    let hitAny = false;
    activeCheckpoints.forEach(cp => {
      if (!cp.hit) {
        let dist;
        if (lx !== null && ly !== null && lx !== undefined && ly !== undefined) {
          dist = distToSegment({ x: cp.x, y: cp.y }, { x: lx, y: ly }, { x: x, y: y });
        } else {
          const dx = cp.x - x;
          const dy = cp.y - y;
          dist = Math.sqrt(dx * dx + dy * dy);
        }

        if (dist < 28) {
          cp.hit = true;
          hitAny = true;
          if (typeof playSynthSound === 'function') {
            playSynthSound('bubble');
          }
        }
      }
    });

    if (hitAny) {
      redrawBoard();
    }
  }

  /* ==========================================================================
     Tool Actions & Event Bindings
     ========================================================================== */

  swatches.forEach(swatch => {
    swatch.addEventListener("click", () => {
      swatches.forEach(s => s.classList.remove("active"));
      swatch.classList.add("active");
      currentColor = swatch.getAttribute("data-color");
      if (typeof playSynthSound === 'function') {
        playSynthSound('click');
      }
    });
  });

  brushSizeInput.addEventListener("input", () => {
    brushSize = parseInt(brushSizeInput.value, 10);
  });

  eraserBtn.addEventListener("click", () => {
    currentColor = "#FFFFFF";
    swatches.forEach(s => s.classList.remove("active"));
    if (typeof playSynthSound === 'function') {
      playSynthSound('click');
    }
  });

  clearBtn.addEventListener("click", () => {
    clearCanvas();
    resetSubmitButton();
    if (typeof playSynthSound === 'function') {
      playSynthSound('click');
    }
  });

  skipBtn.addEventListener("click", () => {
    shapeIndex = (shapeIndex + 1) % shapes.length;
    clearCanvas();
    resetSubmitButton();
    if (typeof playSynthSound === 'function') {
      playSynthSound('click');
    }
  });

  const submitBtn = document.getElementById("tool-submit");
  let isRetryState = false;

  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      if (isRetryState) {
        clearCanvas();
        resetSubmitButton();
        if (typeof playSynthSound === 'function') {
          playSynthSound('click');
        }
      } else {
        const hitCount = activeCheckpoints.filter(cp => cp.hit).length;
        const totalCount = activeCheckpoints.length;
        const ratio = hitCount / totalCount;

        if (ratio >= 0.7) {
          if (typeof playSynthSound === 'function') {
            playSynthSound('success');
          }
          if (typeof adjustStars === 'function') {
            adjustStars(10, 'painting');
          }

          ctx.fillStyle = "rgba(32, 201, 151, 0.15)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          submitBtn.innerHTML = 'Matched! <i class="fa-solid fa-circle-check ms-1"></i>';
          submitBtn.className = "btn btn-success btn-tool py-1";
          submitBtn.disabled = true;

          const originalText = challengeBadge.textContent;
          challengeBadge.textContent = "🏆 Matched! Loading new challenge...";
          challengeBadge.style.backgroundColor = "#20C997";
          challengeBadge.style.color = "#FFFFFF";

          setTimeout(() => {
            shapeIndex = (shapeIndex + 1) % shapes.length;
            clearCanvas();
            resetSubmitButton();
            submitBtn.disabled = false;
            challengeBadge.style.backgroundColor = "#FFC107";
            challengeBadge.style.color = "#2B2D42";
          }, 800);
        } else {
          if (typeof playSynthSound === 'function') {
            playSynthSound('click');
          }

          submitBtn.innerHTML = 'Retry Drawing <i class="fa-solid fa-rotate-left ms-1"></i>';
          submitBtn.className = "btn btn-danger btn-tool py-1";
          submitBtn.style.backgroundColor = "#DC3545";
          submitBtn.style.borderColor = "#DC3545";
          isRetryState = true;

          const originalText = challengeBadge.textContent;
          challengeBadge.textContent = "❌ Not Matched! Click Retry to try again.";
          challengeBadge.style.backgroundColor = "#DC3545";
          challengeBadge.style.color = "#FFFFFF";
          setTimeout(() => {
            challengeBadge.textContent = originalText;
            challengeBadge.style.backgroundColor = "#FFC107";
            challengeBadge.style.color = "#2B2D42";
          }, 3000);
        }
      }
    });
  }

  function resetSubmitButton() {
    isRetryState = false;
    if (submitBtn) {
      submitBtn.innerHTML = 'Submit Drawing <i class="fa-solid fa-check ms-1"></i>';
      submitBtn.className = "btn btn-success btn-tool py-1";
      submitBtn.style.backgroundColor = "#20C997";
      submitBtn.style.borderColor = "#20C997";
    }
  }

  if (hintBtn) {
    hintBtn.addEventListener("click", () => {
      const bubblesStars = parseInt(localStorage.getItem("stars-bubbles") || "0", 10);
      const paintingStars = parseInt(localStorage.getItem("stars-painting") || "0", 10);
      const totalStars = bubblesStars + paintingStars;

      if (totalStars >= 50) {
        if (typeof playSynthSound === 'function') {
          playSynthSound('success');
        }

        const savedState = ctx.getImageData(0, 0, canvas.width, canvas.height);
        shapes[shapeIndex].drawFullDrawing(ctx, cx, cy);

        const originalDrawing = drawing;
        drawing = false;

        const originalText = challengeBadge.textContent;
        challengeBadge.textContent = "🔍 Showing Full Hint Template...";
        challengeBadge.style.backgroundColor = "#20C997";
        challengeBadge.style.color = "#FFFFFF";

        setTimeout(() => {
          ctx.putImageData(savedState, 0, 0);
          challengeBadge.textContent = originalText;
          challengeBadge.style.backgroundColor = "#FFC107";
          challengeBadge.style.color = "#2B2D42";
        }, 2500);

      } else {
        if (typeof playSynthSound === 'function') {
          playSynthSound('click');
        }

        const savedState = ctx.getImageData(0, 0, canvas.width, canvas.height);
        shapes[shapeIndex].drawFaintGuide(ctx, cx, cy);

        const originalText = challengeBadge.textContent;
        challengeBadge.textContent = "💡 Need 50 Stars: Showing Tiny Hint...";
        challengeBadge.style.backgroundColor = "#FFC107";
        challengeBadge.style.color = "#2B2D42";

        setTimeout(() => {
          ctx.putImageData(savedState, 0, 0);
          challengeBadge.textContent = originalText;
          challengeBadge.style.backgroundColor = "#FFC107";
          challengeBadge.style.color = "#2B2D42";
        }, 1000);
      }
    });
  }

  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  window.addEventListener("mouseup", stopDrawing);

  canvas.addEventListener("touchstart", startDrawing, { passive: false });
  canvas.addEventListener("touchmove", draw, { passive: false });
  window.addEventListener("touchend", stopDrawing);

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
});
