// Jeu de glissement de blocs inspiré de la grille fournie
// Jouable à la souris ou au toucher

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

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
  }
}

function onPointerMove(e) {
  if (!selectedPiece) return;
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / CELL_SIZE) - offsetX;
  const y = Math.floor((e.clientY - rect.top) / CELL_SIZE) - offsetY;
  const nx = Math.max(0, Math.min(grid - selectedPiece.w, x));
  const ny = Math.max(0, Math.min(grid - selectedPiece.h, y));

  // Collision simple
  if (!pieces.some(p => p !== selectedPiece &&
    nx < p.x + p.w && nx + selectedPiece.w > p.x &&
    ny < p.y + p.h && ny + selectedPiece.h > p.y)) {
    selectedPiece.x = nx;
    selectedPiece.y = ny;
  }
  draw();
}

function onPointerUp() {
  selectedPiece = null;
  // Condition de victoire : H atteint le haut de la colonne 3 (y = 0, x = 2)
  const h = pieces.find(p => p.id === "H");
  if (h.x === 2 && h.y === 0) {
    alert("Bravo ! Vous avez gagné !");
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
