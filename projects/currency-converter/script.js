import { CURRENCIES, MAX_AMOUNT, parseAmount, readRate } from "./logic.mjs";
import { readStored, writeStored } from "../../shared/storage.js";

const form = document.getElementById("converter-form");
const amount = document.getElementById("amount");
const from = document.getElementById("from");
const to = document.getElementById("to");
const convert = document.getElementById("convert");
const result = document.getElementById("result");
const details = document.getElementById("rate-details");
const storageStatus = document.getElementById("storage-status");
const key = "mini-projects:currency:v1";
let controller;
let requestId = 0;
amount.max = String(MAX_AMOUNT);
for (const [code, name] of CURRENCIES) {
  from.add(new Option(`${code} — ${name}`, code));
  to.add(new Option(`${code} — ${name}`, code));
}
from.value = "USD";
to.value = "COP";
const stored = readStored(key);
if (!stored.available) storageStatus.textContent = "Currency preferences cannot be saved in this browser.";
try {
  const saved = stored.value ? JSON.parse(stored.value) : { from: readStored("currency-from").value, to: readStored("currency-to").value };
  if (CURRENCIES.some(([code]) => code === saved?.from)) from.value = saved.from;
  if (CURRENCIES.some(([code]) => code === saved?.to)) to.value = saved.to;
} catch { storageStatus.textContent = "Saved preferences could not be read. Default currencies are selected."; }

function savePreferences() {
  if (!writeStored(key, JSON.stringify({ from: from.value, to: to.value }))) {
    storageStatus.textContent = "Your selection works, but cannot be saved in this browser.";
  }
}
function setBusy(busy) {
  convert.disabled = busy;
  convert.textContent = busy ? "Converting…" : "Convert amount";
  form.setAttribute("aria-busy", String(busy));
}
function invalidateResult() {
  requestId++;
  controller?.abort();
  setBusy(false);
  amount.removeAttribute("aria-invalid");
  result.dataset.tone = "";
  result.textContent = "Select Convert amount to update your result.";
  details.textContent = "";
}
amount.addEventListener("input", invalidateResult);
for (const select of [from, to]) select.addEventListener("change", () => { invalidateResult(); savePreferences(); });
document.getElementById("swap").addEventListener("click", () => {
  [from.value, to.value] = [to.value, from.value];
  invalidateResult();
  savePreferences();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  controller?.abort();
  const id = ++requestId;
  let input;
  try { input = parseAmount(amount.value); }
  catch (error) {
    setBusy(false);
    amount.setAttribute("aria-invalid", "true");
    result.dataset.tone = "error";
    result.textContent = error.message;
    details.textContent = "";
    amount.focus();
    return;
  }
  amount.removeAttribute("aria-invalid");
  const base = from.value;
  const target = to.value;
  savePreferences();
  result.dataset.tone = "";
  details.textContent = "";
  if (base === target) {
    setBusy(false);
    result.textContent = `${formatMoney(input, base)} = ${formatMoney(input, target)}`;
    details.textContent = "The currencies match. No exchange rate is needed.";
    return;
  }
  controller = new AbortController();
  const currentController = controller;
  const timeout = setTimeout(() => currentController.abort(), 12000);
  setBusy(true);
  result.textContent = "Fetching the latest published rate…";
  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`, { signal: currentController.signal });
    if (!response.ok) throw new Error(response.status === 429 ? "The rate service is busy. Please wait and try again." : "Unable to retrieve rates. Please try again.");
    const data = await response.json();
    const rate = readRate(data, base, target);
    if (id !== requestId) return;
    result.textContent = `${formatMoney(input, base)} = ${formatMoney(input * rate, target)}`;
    const updated = new Date(data.time_last_update_utc);
    const timestamp = Number.isNaN(updated.getTime()) ? "Update time unavailable." : `Rates updated ${updated.toLocaleString()}.`;
    details.textContent = `1 ${base} = ${new Intl.NumberFormat(undefined, { maximumSignificantDigits: 6 }).format(rate)} ${target}. ${timestamp}`;
  } catch (error) {
    if (id !== requestId) return;
    result.dataset.tone = "error";
    result.textContent = error.name === "AbortError" ? "The request timed out. Please try again." : error instanceof TypeError ? "Could not connect to the rate provider. Check your connection and try again." : error.message;
  } finally {
    clearTimeout(timeout);
    if (id === requestId) setBusy(false);
  }
});
function formatMoney(value, currency) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency, currencyDisplay: "code" }).format(value);
}
