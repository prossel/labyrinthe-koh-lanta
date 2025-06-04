// Jeu de glissement de blocs inspiré de la grille fournie
// Jouable à la souris ou au toucher

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

// Create stats container
const statsContainer = document.createElement("div");
statsContainer.style.margin = "10px 0";
statsContainer.style.fontFamily = "Arial, sans-serif";
statsContainer.style.fontSize = "16px";
statsContainer.style.fontWeight = "bold";
statsContainer.style.padding = "5px";
statsContainer.style.backgroundColor = "#f0f0f0";
statsContainer.style.borderRadius = "5px";
statsContainer.style.border = "1px solid #ccc";
document.body.insertBefore(statsContainer, canvas);

// Create move counter display
const moveCounter = document.createElement("div");
moveCounter.textContent = "Mouvements: 0";
moveCounter.style.marginBottom = "5px";
statsContainer.appendChild(moveCounter);

// Create timer display
const timerDisplay = document.createElement("div");
timerDisplay.textContent = "Temps: 00:00";
statsContainer.appendChild(timerDisplay);

// Add some extra space for the exit indicator and frame
canvas.width = 360;
canvas.height = 420; // Added 60px for the exit indicator
canvas.style.border = "none"; // Remove default border if any
canvas.style.backgroundColor = "#e0e0e0"; // Light gray background
canvas.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)"; // Add subtle shadow
const CELL_SIZE = 60;
const BOARD_OFFSET_Y = 60; // Consistent offset for the board

// Structure des pièces : id, couleur, x, y, largeur, hauteur
const pieces = [
  { id: "A", color: "blue", x: 1, y: 0, w: 3, h: 1 },
  { id: "B", color: "blue", x: 0, y: 2, w: 3, h: 1 },
  { id: "C", color: "blue", x: 3, y: 3, w: 3, h: 1 },
  { id: "D", color: "green", x: 3, y: 1, w: 1, h: 2 },
  { id: "E", color: "green", x: 5, y: 1, w: 1, h: 2 },
  { id: "F", color: "green", x: 0, y: 4, w: 1, h: 2 },
  { id: "G", color: "green", x: 4, y: 5, w: 2, h: 1 },
  { id: "H", color: "pink", x: 2, y: 3, w: 1, h: 2 } // Rose des vents
];

const grid = 6;
let selectedPiece = null;
let offsetX = 0;
let offsetY = 0;

// Game stats
let moveCount = 0;
let startTime = null;
let timerInterval = null;

function startTimer() {
  if (!startTime) {
    startTime = new Date();
    timerInterval = setInterval(updateTimer, 1000);
  }
}

function updateTimer() {
  const currentTime = new Date();
  const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  timerDisplay.textContent = `Temps: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
}

function incrementMoveCount() {
  moveCount++;
  moveCounter.textContent = `Mouvements: ${moveCount}`;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw the board background
  ctx.fillStyle = "#f8f8f8";
  ctx.fillRect(0, BOARD_OFFSET_Y, grid * CELL_SIZE, grid * CELL_SIZE);
  
  // Draw grid lines for better visual guidance
  ctx.strokeStyle = "#ddd";
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= grid; i++) {
    // Vertical lines
    ctx.beginPath();
    ctx.moveTo(i * CELL_SIZE, BOARD_OFFSET_Y);
    ctx.lineTo(i * CELL_SIZE, grid * CELL_SIZE + BOARD_OFFSET_Y);
    ctx.stroke();
    
    // Horizontal lines
    ctx.beginPath();
    ctx.moveTo(0, i * CELL_SIZE + BOARD_OFFSET_Y);
    ctx.lineTo(grid * CELL_SIZE, i * CELL_SIZE + BOARD_OFFSET_Y);
    ctx.stroke();
  }
  
  // Draw the target position for the pink piece (H)
  ctx.fillStyle = "rgba(255, 192, 203, 0.3)"; // Light pink with transparency
  ctx.fillRect(2 * CELL_SIZE, BOARD_OFFSET_Y, CELL_SIZE, CELL_SIZE);
  
  // Add a pulsing effect to the target
  const pulseIntensity = 0.5 + 0.2 * Math.sin(Date.now() / 300);
  ctx.fillStyle = `rgba(255, 192, 203, ${pulseIntensity})`;
  ctx.fillRect(2 * CELL_SIZE + 10, BOARD_OFFSET_Y + 10, CELL_SIZE - 20, CELL_SIZE - 20);
  
  // Draw arrow pointing to exit
  ctx.fillStyle = "rgba(255, 0, 0, 0.7)";
  ctx.beginPath();
  ctx.moveTo(2 * CELL_SIZE + CELL_SIZE/2, 30);
  ctx.lineTo(2 * CELL_SIZE + CELL_SIZE/4, 45);
  ctx.lineTo(2 * CELL_SIZE + 3*CELL_SIZE/4, 45);
  ctx.closePath();
  ctx.fill();
  
  // Draw "EXIT" text above the target
  ctx.fillStyle = "red";
  ctx.font = "bold 16px Arial";
  ctx.fillText("EXIT", 2 * CELL_SIZE + 10, 20);
  
  // Draw the game pieces with the offset
  pieces.forEach(p => {
    // Draw shadow for 3D effect
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(p.x * CELL_SIZE + 2, p.y * CELL_SIZE + BOARD_OFFSET_Y + 2, p.w * CELL_SIZE, p.h * CELL_SIZE);
    
    // Draw piece with gradient for better look
    const gradient = ctx.createLinearGradient(
      p.x * CELL_SIZE, 
      p.y * CELL_SIZE + BOARD_OFFSET_Y,
      p.x * CELL_SIZE + p.w * CELL_SIZE,
      p.y * CELL_SIZE + p.h * CELL_SIZE + BOARD_OFFSET_Y
    );
    
    // Create gradient based on piece color
    if (p.color === "blue") {
      gradient.addColorStop(0, "#4a80f5");
      gradient.addColorStop(1, "#1e56cc");
    } else if (p.color === "green") {
      gradient.addColorStop(0, "#4cd964");
      gradient.addColorStop(1, "#2ab149");
    } else if (p.color === "pink") {
      gradient.addColorStop(0, "#ff6b8b");
      gradient.addColorStop(1, "#ff2d5d");
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(p.x * CELL_SIZE, p.y * CELL_SIZE + BOARD_OFFSET_Y, p.w * CELL_SIZE, p.h * CELL_SIZE);
    
    // Draw piece border
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(p.x * CELL_SIZE, p.y * CELL_SIZE + BOARD_OFFSET_Y, p.w * CELL_SIZE, p.h * CELL_SIZE);
    
    // Draw piece ID
    // ctx.fillStyle = "white";
    // ctx.font = "bold 14px Arial";
    // ctx.fillText(p.id, p.x * CELL_SIZE + p.w * CELL_SIZE / 2 - 5, p.y * CELL_SIZE + BOARD_OFFSET_Y + p.h * CELL_SIZE / 2 + 5);
  });
  
  // Highlight the target piece (H) with a special border if it's not at the exit
  const targetPiece = pieces.find(p => p.id === "H");
  if (!(targetPiece.x === 2 && targetPiece.y === 0)) {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.strokeRect(
      targetPiece.x * CELL_SIZE - 2, 
      targetPiece.y * CELL_SIZE + BOARD_OFFSET_Y - 2, 
      targetPiece.w * CELL_SIZE + 4, 
      targetPiece.h * CELL_SIZE + 4
    );
    ctx.setLineDash([]);
  }
  
  // Draw the frame around the board
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 8;
  
  // Draw left frame
  ctx.beginPath();
  ctx.moveTo(0, BOARD_OFFSET_Y);
  ctx.lineTo(0, grid * CELL_SIZE + BOARD_OFFSET_Y);
  ctx.stroke();
  
  // Draw right frame
  ctx.beginPath();
  ctx.moveTo(grid * CELL_SIZE, BOARD_OFFSET_Y);
  ctx.lineTo(grid * CELL_SIZE, grid * CELL_SIZE + BOARD_OFFSET_Y);
  ctx.stroke();
  
  // Draw bottom frame
  ctx.beginPath();
  ctx.moveTo(0, grid * CELL_SIZE + BOARD_OFFSET_Y);
  ctx.lineTo(grid * CELL_SIZE, grid * CELL_SIZE + BOARD_OFFSET_Y);
  ctx.stroke();
  
  // Draw top frame with gap for exit (at position x=2)
  ctx.lineWidth /= 2; // Thinner line for the top frame
  ctx.beginPath();
  ctx.moveTo(0, BOARD_OFFSET_Y);
  ctx.lineTo(2 * CELL_SIZE, BOARD_OFFSET_Y);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(3 * CELL_SIZE, BOARD_OFFSET_Y);
  ctx.lineTo(grid * CELL_SIZE, BOARD_OFFSET_Y);
  ctx.stroke();
  
  // Reset line width for future drawing
  ctx.lineWidth = 1;
}

function getPieceAt(x, y) {
  return pieces.find(p => x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h);
}

function onPointerDown(e) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
  const y = Math.floor((e.clientY - rect.top - BOARD_OFFSET_Y) / CELL_SIZE);
  
  // Only select pieces if click is within game board area
  if (y >= 0 && y < grid) {
    selectedPiece = getPieceAt(x, y);
    if (selectedPiece) {
      offsetX = x - selectedPiece.x;
      offsetY = y - selectedPiece.y;
      
      // Store initial position to track if a move was made
      selectedPiece.initialX = selectedPiece.x;
      selectedPiece.initialY = selectedPiece.y;
    }
  }
}

function onPointerMove(e) {
  if (!selectedPiece) return;
  
  // Start the timer when the first move begins
  if (startTime === null) {
    startTimer();
  }
  
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / CELL_SIZE) - offsetX;
  const y = Math.floor((e.clientY - rect.top - BOARD_OFFSET_Y) / CELL_SIZE) - offsetY;

  const isHorizontal = selectedPiece.w > selectedPiece.h;
  let nx = isHorizontal ? Math.max(0, Math.min(grid - selectedPiece.w, x)) : selectedPiece.x;
  let ny = isHorizontal ? selectedPiece.y : Math.max(0, Math.min(grid - selectedPiece.h, y));

  // Store original position to detect if a move was made
  const originalX = selectedPiece.x;
  const originalY = selectedPiece.y;

  if (!pieces.some(p => p !== selectedPiece &&
    nx < p.x + p.w && nx + selectedPiece.w > p.x &&
    ny < p.y + p.h && ny + selectedPiece.h > p.y)) {
    // Only consider it a move if the position actually changed
    if (selectedPiece.x !== nx || selectedPiece.y !== ny) {
      selectedPiece.x = nx;
      selectedPiece.y = ny;
    }
  }
  draw();
}

function onPointerUp() {
  if (selectedPiece) {
    // Only count as a move if the piece position has changed
    if (selectedPiece.initialX !== undefined && 
        selectedPiece.initialY !== undefined && 
        (selectedPiece.initialX !== selectedPiece.x || selectedPiece.initialY !== selectedPiece.y)) {
      incrementMoveCount();
    }
    
    // Clean up temporary properties
    delete selectedPiece.initialX;
    delete selectedPiece.initialY;
    
    selectedPiece = null;
    
    // Condition de victoire : H atteint le haut de la colonne 3 (y = 0, x = 2)
    const h = pieces.find(p => p.id === "H");
    if (h.x === 2 && h.y === 0) {
      stopTimer();
      const timeString = timerDisplay.textContent.replace('Temps: ', '');
      setTimeout(() => alert(`Bravo ! Vous avez gagné en ${moveCount} mouvements et ${timeString} !`), 100);
    }
  } else {
    selectedPiece = null;
  }
}

canvas.addEventListener("mousedown", onPointerDown);
canvas.addEventListener("mousemove", onPointerMove);
canvas.addEventListener("mouseup", onPointerUp);

canvas.addEventListener("touchstart", e => onPointerDown(e.touches[0]));
canvas.addEventListener("touchmove", e => {
  onPointerMove(e.touches[0]);
  e.preventDefault();
});
canvas.addEventListener("touchend", onPointerUp);

// Start the animation loop
requestAnimationFrame(draw);
