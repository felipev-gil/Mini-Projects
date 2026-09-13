(() => {
  "use strict";
  const { $ } = Mini;

  const cells = [...document.querySelectorAll(".cell")];
  const wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  let board, player, over;
  function reset() {
    board = Array(9).fill("");
    player = "X";
    over = false;
    $("turn").textContent = "X’s turn";
    cells.forEach((c, i) => {
      c.textContent = "";
      c.disabled = false;
      c.classList.remove("win");
      c.setAttribute("aria-label", "Cell " + (i + 1) + ", empty");
    });
  }
  cells.forEach((cell, i) =>
    cell.addEventListener("click", () => {
      if (over || board[i]) return;
      board[i] = player;
      cell.textContent = player;
      cell.setAttribute("aria-label", "Cell " + (i + 1) + ", " + player);
      cell.disabled = true;
      const win = wins.find((line) => line.every((n) => board[n] === player));
      if (win || board.every(Boolean)) {
        over = true;
        cells.forEach((c) => (c.disabled = true));
        if (win) win.forEach((n) => cells[n].classList.add("win"));
        $("turn").textContent = win ? player + " wins!" : "It’s a draw!";
      } else {
        player = player === "X" ? "O" : "X";
        $("turn").textContent = player + "’s turn";
      }
    }),
  );
  $("reset").addEventListener("click", reset);
  reset();
})();
