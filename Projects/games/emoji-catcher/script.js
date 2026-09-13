(() => {
  "use strict";
  const { $, status } = Mini;

  const targets = [...document.querySelectorAll(".target")];
  let timer = null,
    end = 0,
    score = 0,
    target = -1,
    nextMove = 0;
  function move() {
    targets.forEach((button, i) => {
      button.textContent = "";
      button.setAttribute("aria-label", "Position " + (i + 1) + ", empty");
    });
    target = Math.floor(Math.random() * targets.length);
    targets[target].textContent = "😃";
    targets[target].setAttribute(
      "aria-label",
      "Position " + (target + 1) + ", catch emoji",
    );
  }
  function stop() {
    clearInterval(timer);
    timer = null;
    target = -1;
    targets.forEach((b) => {
      b.disabled = true;
      b.textContent = "";
    });
    $("stop").disabled = true;
    status("Round finished. Score: " + score + ".");
  }
  function tick() {
    const now = performance.now();
    $("time").textContent = Math.max(0, Math.ceil((end - now) / 1000));
    if (now >= end) {
      stop();
      return;
    }
    if (now >= nextMove) {
      move();
      nextMove = now + 700;
    }
  }
  $("start").addEventListener("click", () => {
    clearInterval(timer);
    score = 0;
    $("score").textContent = "0";
    end = performance.now() + 60000;
    nextMove = 0;
    targets.forEach((b) => (b.disabled = false));
    $("stop").disabled = false;
    status("Round running. Catch the emoji!");
    tick();
    timer = setInterval(tick, 50);
  });
  targets.forEach((button, i) =>
    button.addEventListener("click", () => {
      if (timer === null || performance.now() >= end || target !== i) return;
      score++;
      $("score").textContent = score;
      target = -1;
      button.textContent = "";
      button.setAttribute("aria-label", "Position " + (i + 1) + ", caught");
    }),
  );
  $("stop").addEventListener("click", stop);
  window.addEventListener("pagehide", () => clearInterval(timer));
})();
