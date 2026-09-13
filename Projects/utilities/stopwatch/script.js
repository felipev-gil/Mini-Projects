(() => {
  "use strict";
  const { $, status } = Mini;

  let interval = null,
    started = 0,
    elapsed = 0;
  function render() {
    const total = Math.floor(
      elapsed + (interval !== null ? performance.now() - started : 0),
    );
    $("timer").textContent =
      String(Math.floor(total / 60000)).padStart(2, "0") +
      ":" +
      String(Math.floor(total / 1000) % 60).padStart(2, "0") +
      "." +
      String(total % 1000).padStart(3, "0");
  }
  function pause() {
    if (interval === null) return;
    elapsed += performance.now() - started;
    clearInterval(interval);
    interval = null;
    $("start").disabled = false;
    $("stop").disabled = true;
    render();
  }
  $("start").addEventListener("click", () => {
    if (interval !== null) return;
    started = performance.now();
    interval = setInterval(render, 31);
    $("start").disabled = true;
    $("stop").disabled = false;
    status("Stopwatch running.");
  });
  $("stop").addEventListener("click", () => {
    pause();
    status("Stopwatch paused.");
  });
  $("reset").addEventListener("click", () => {
    pause();
    elapsed = 0;
    render();
    status("Stopwatch reset.");
  });
  window.addEventListener("pagehide", pause);
})();
