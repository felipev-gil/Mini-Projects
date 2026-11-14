import { evaluateBoard } from "./logic.mjs";

const cells = Array.from(document.querySelectorAll(".cell"));
const status = document.getElementById("game-status");
let board = Array(9).fill(null);
let player = "X";
let finished = false;

function render(outcome = null) {
  cells.forEach((cell, index) => {
    cell.textContent = board[index] || "";
    cell.dataset.player = board[index] || "";
    cell.classList.toggle("winning", Boolean(outcome?.line.includes(index)));
    // Keep cells focusable so keyboard users can inspect the completed board.
    cell.setAttribute("aria-disabled", String(finished || Boolean(board[index])));
    cell.setAttribute("aria-label", `Row ${Math.floor(index / 3) + 1}, column ${index % 3 + 1}: ${board[index] || "empty"}${outcome?.line.includes(index) ? ", winning cell" : ""}`);
  });
  status.textContent = outcome ? outcome.winner === "draw" ? "It’s a draw! Start a new game to play again." : `Player ${outcome.winner} wins! Three in a row.` : `Player ${player}’s turn.`;
}
cells.forEach((cell, index) => {
  cell.addEventListener("click", () => {
    if (finished || board[index]) return;
    board[index] = player;
    const outcome = evaluateBoard(board);
    finished = Boolean(outcome);
    if (!finished) player = player === "X" ? "O" : "X";
    render(outcome);
  });
  cell.addEventListener("keydown", (event) => {
    const row = Math.floor(index / 3), column = index % 3;
    const positions = { ArrowRight: row * 3 + (column + 1) % 3, ArrowLeft: row * 3 + (column + 2) % 3, ArrowDown: ((row + 1) % 3) * 3 + column, ArrowUp: ((row + 2) % 3) * 3 + column };
    if (event.key in positions) { event.preventDefault(); cells[positions[event.key]].focus(); }
  });
});
document.getElementById("reset").addEventListener("click", () => {
  board = Array(9).fill(null); player = "X"; finished = false; render(); cells[0].focus();
});
render();
