import { $, element, status } from "../../shared/project-utils.js";

let active = false, target = -1, score = 0, total = 0, missed = 0, bad = 0;
let deadline = 0, nextMove = 0, timer;
const cells = Array.from({ length: 9 }, (_, index) => {
  const button = element("button", "·");
  button.setAttribute("aria-label", "Cell " + (index + 1) + ", empty");
  button.addEventListener("click", () => {
    if (!active) return;
    const now = performance.now();
    if (now >= deadline) return finish();
    if (target < 0) return;
    if (index === target) {
      score++;
      status("Face caught!");
    } else {
      missed++;
      bad++;
      status("Wrong box. That face was missed; try the new one.");
    }
    spawn(now);
  });
  button.addEventListener("keydown", event => {
    const offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 };
    if (!(event.key in offsets)) return;
    event.preventDefault();
    cells[(index + offsets[event.key] + 9) % 9].focus();
  });
  $("#grid").append(button);
  return button;
});
function paint() {
  cells.forEach((button, index) => {
    button.textContent = index === target ? "☺" : "·";
    button.setAttribute("aria-label", "Cell " + (index + 1) + (index === target ? ", smiling face" : ", empty"));
  });
  $("#score").textContent = score;
  $("#total").textContent = total;
  $("#missed").textContent = missed;
  $("#bad").textContent = bad;
}
function spawn(now) {
  // Always move to a different cell, including after an incorrect click.
  const previous = target;
  target = previous < 0 ? Math.floor(Math.random() * 9)
    : (previous + 1 + Math.floor(Math.random() * 8)) % 9;
  total++;
  nextMove = now + Number($("#pace").value);
  paint();
}
function finish(stopped = false) {
  if (!active) return;
  if (target >= 0) missed++;
  active = false;
  target = -1;
  clearInterval(timer);
  $("#time").textContent = stopped ? Math.max(0, Math.ceil((deadline - performance.now()) / 1000)) : "0";
  $("#pace").disabled = false;
  $("#stop").disabled = true;
  $("#start").textContent = "Play again";
  paint();
  status((stopped ? "Round stopped. Change the pace and start again. " : "Round complete. ") + score + " caught out of " + total + " faces; " + missed + " missed and " + bad + " wrong clicks.");
}
function tick() {
  const now = performance.now();
  $("#time").textContent = Math.max(0, Math.ceil((deadline - now) / 1000));
  if (now >= deadline) return finish();
  if (now >= nextMove) {
    if (target >= 0) missed++;
    spawn(now);
  }
}
$("#start").addEventListener("click", () => {
  clearInterval(timer);
  active = true;
  score = total = missed = bad = 0;
  target = -1;
  deadline = performance.now() + 30000;
  nextMove = 0;
  $("#pace").disabled = true;
  $("#stop").disabled = false;
  $("#start").textContent = "Restart round";
  status("Round started.");
  tick();
  timer = setInterval(tick, 75);
  cells[0].focus();
});


$("#stop").addEventListener("click", () => {
  finish(true);
  $("#pace").focus();
});
