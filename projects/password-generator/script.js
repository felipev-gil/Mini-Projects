import { generatePassword, estimateStrength } from "./logic.mjs";

const form = document.getElementById("password-form");
const password = document.getElementById("password");
const length = document.getElementById("length");
const output = document.getElementById("length-value");
const copy = document.getElementById("copy");
const status = document.getElementById("password-status");
const meter = document.getElementById("strength-meter");
const label = document.getElementById("strength-label");
const groups = Array.from(document.querySelectorAll('[name="group"]'));
let revision = 0;

function invalidate() {
  revision++;
  password.value = "";
  copy.disabled = true;
  meter.value = 0;
  label.textContent = "—";
  status.dataset.tone = "";
  status.textContent = "Options changed. Generate a new password to use them.";
}
length.addEventListener("input", () => { output.value = length.value; invalidate(); });
groups.forEach((checkbox) => checkbox.addEventListener("change", invalidate));

function generate() {
  revision++;
  try {
    password.value = generatePassword(Number(length.value), groups.filter((checkbox) => checkbox.checked).map((checkbox) => checkbox.value));
    const estimate = estimateStrength(password.value);
    meter.value = estimate.score;
    meter.textContent = String(estimate.score);
    label.textContent = estimate.label;
    copy.disabled = false;
    status.dataset.tone = "";
    status.textContent = "Password generated. Keep it somewhere safe.";
  } catch (error) {
    password.value = "";
    copy.disabled = true;
    meter.value = 0;
    label.textContent = "—";
    status.dataset.tone = "error";
    status.textContent = error.message;
  }
}
form.addEventListener("submit", (event) => { event.preventDefault(); generate(); });
copy.addEventListener("click", async () => {
  const value = password.value;
  const currentRevision = revision;
  if (!value) return;
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable.");
    await navigator.clipboard.writeText(value);
    if (revision !== currentRevision) return;
    status.dataset.tone = "success";
    status.textContent = "Password copied to the clipboard.";
  } catch {
    if (revision !== currentRevision) return;
    password.focus(); password.select();
    status.dataset.tone = "error";
    status.textContent = "Automatic copying is unavailable. The password is selected; copy it with your keyboard or device menu.";
  }
});
generate();
