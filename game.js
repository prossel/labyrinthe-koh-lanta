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

canvas.width = 360;
canvas.height = 360;
const CELL_SIZE = 60;

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
  pieces.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x * CELL_SIZE, p.y * CELL_SIZE, p.w * CELL_SIZE, p.h * CELL_SIZE);
    ctx.strokeStyle = "black";
    ctx.strokeRect(p.x * CELL_SIZE, p.y * CELL_SIZE, p.w * CELL_SIZE, p.h * CELL_SIZE);
    ctx.fillStyle = "white";
    ctx.fillText(p.id, p.x * CELL_SIZE + 5, p.y * CELL_SIZE + 15);
  });
}

function getPieceAt(x, y) {
  return pieces.find(p => x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h);
}

function onPointerDown(e) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
  const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
  selectedPiece = getPieceAt(x, y);
  if (selectedPiece) {
    offsetX = x - selectedPiece.x;
    offsetY = y - selectedPiece.y;
    
    // Store initial position to track if a move was made
    selectedPiece.initialX = selectedPiece.x;
    selectedPiece.initialY = selectedPiece.y;
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
  const y = Math.floor((e.clientY - rect.top) / CELL_SIZE) - offsetY;

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

draw();
