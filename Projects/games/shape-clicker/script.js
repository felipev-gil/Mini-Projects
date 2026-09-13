(() => {
  "use strict";
  const { $, status } = Mini;

  let timeout = null,
    shown = 0,
    running = false;
  function schedule() {
    clearTimeout(timeout);
    $("shape").hidden = true;
    timeout = setTimeout(show, 500 + Math.random() * 2000);
  }
  function show() {
    if (!running) return;
    const arena = $("arena");
    const size = 44 + Math.floor(Math.random() * 40);
    const shape = $("shape");
    shape.style.width = size + "px";
    shape.style.height = size + "px";
    shape.style.left =
      Math.floor(Math.random() * Math.max(0, arena.clientWidth - size)) + "px";
    shape.style.top =
      Math.floor(Math.random() * Math.max(0, arena.clientHeight - size)) + "px";
    shape.style.borderRadius = Math.random() < 0.5 ? "50%" : "8px";
    shape.hidden = false;
    shown = performance.now();
  }
  function stop() {
    running = false;
    clearTimeout(timeout);
    $("shape").hidden = true;
    $("stop").disabled = true;
  }
  $("start").addEventListener("click", () => {
    stop();
    running = true;
    $("stop").disabled = false;
    $("reaction").textContent = "Wait for the shape…";
    schedule();
  });
  $("shape").addEventListener("click", () => {
    if (!running || $("shape").hidden) return;
    $("reaction").textContent =
      "Reaction time: " +
      ((performance.now() - shown) / 1000).toFixed(3) +
      " seconds. Wait for the next shape…";
    schedule();
  });
  $("stop").addEventListener("click", () => {
    stop();
    status("Stopped. Press Start for a new round.");
  });
  window.addEventListener("resize", () => {
    if (running) schedule();
  });
  window.addEventListener("pagehide", stop);
})();
