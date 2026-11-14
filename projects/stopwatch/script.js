import { $, element, status } from "../../shared/project-utils.js";

import { formatTime } from "./logic.mjs";
let running = false, started = 0, elapsed = 0, frame;
const total = () => elapsed + (running ? performance.now() - started : 0);
function paint() { $("#clock").textContent = formatTime(total()); if (running) frame = requestAnimationFrame(paint); }
function controls() { $("#start").disabled = running; $("#pause").disabled = !running; $("#lap").disabled = !running; }
$("#start").addEventListener("click", () => { if (running) return; started = performance.now(); running = true; controls(); paint(); status("Stopwatch running."); });
$("#pause").addEventListener("click", () => { elapsed = total(); running = false; cancelAnimationFrame(frame); controls(); paint(); status("Paused at " + formatTime(elapsed)); });
$("#lap").addEventListener("click", () => {
  if ($("#laps").children.length >= 100) return status("You have reached the 100-lap limit.");
  const value = formatTime(total()); $("#laps").append(element("li", "Lap " + ($("#laps").children.length + 1) + ": " + value)); status("Lap recorded: " + value);
});
$("#reset").addEventListener("click", () => { running = false; elapsed = 0; cancelAnimationFrame(frame); controls(); paint(); $("#laps").replaceChildren(); status("Stopwatch reset."); });


