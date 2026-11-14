import { $, status } from "../../shared/project-utils.js";

let timeout, shownAt = 0, state = "idle", best = Infinity;
function cancel() { clearTimeout(timeout); $("#target").hidden = true; state = "idle"; }
$("#start").addEventListener("click", () => {
 cancel(); state = "waiting"; status("Wait for the target…");
 timeout = setTimeout(() => {
  const arena = $("#arena"), target = $("#target");
  target.hidden = false; target.style.left = Math.random() * Math.max(0, arena.clientWidth - 68) + "px";
  target.style.top = Math.random() * Math.max(0, arena.clientHeight - 68) + "px";
  shownAt = performance.now(); state = "ready"; target.focus({ preventScroll: true }); status("Catch the target!");
 }, 1200 + Math.random() * 2300);
});
$("#arena").addEventListener("click", event => {
 if (state === "waiting") { cancel(); status("Too soon! Start another round.", "error"); $("#start").focus(); }
 else if (state === "ready" && event.target === $("#target")) {
  const elapsed = Math.round(performance.now() - shownAt); best = Math.min(best, elapsed);
  $("#last").textContent = "Last result: " + elapsed + " ms"; $("#best").textContent = "Best this visit: " + best + " ms";
  cancel(); status("Caught in " + elapsed + " milliseconds."); $("#start").focus();
 }
});
document.addEventListener("visibilitychange", () => { if (document.hidden && state !== "idle") { cancel(); status("Round canceled while the page was hidden. Start again when ready."); } });


