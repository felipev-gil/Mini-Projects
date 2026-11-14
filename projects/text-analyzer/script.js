import { $, element, status, copyText } from "../../shared/project-utils.js";

import { analyzeText, changeCase } from "./logic.mjs";
function render() {
  const counts = analyzeText($("#text").value);
  $("#counts").replaceChildren(...Object.entries(counts).map(([label, value]) => element("span", value + " " + label, "tag")));
  $("#preview").textContent = $("#text").value;
  const limit = Number($("#limit").value);
  $("#remaining").textContent = limit > 0 ? (limit - counts.characters) + " characters remaining against your target." : "";
}
$("#text").addEventListener("input", render);
$("#limit").addEventListener("input", render);
document.querySelectorAll("[data-case]").forEach(button => button.addEventListener("click", () => {
  $("#text").value = changeCase($("#text").value, button.dataset.case); render();
}));
document.querySelectorAll("[data-format]").forEach(button => button.addEventListener("click", () => {
  const enabled = button.getAttribute("aria-pressed") !== "true";
  button.setAttribute("aria-pressed", String(enabled));
  $("#preview").classList.toggle(button.dataset.format, enabled);
}));
$("#clear").addEventListener("click", () => { $("#text").value = ""; render(); $("#text").focus(); status("Text cleared."); });
$("#copy").addEventListener("click", () => copyText($("#text").value));
render();


