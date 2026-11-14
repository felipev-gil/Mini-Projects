import { $, element, status } from "../../shared/project-utils.js";

import { createCollectionStore } from "../../shared/collection-store.mjs";
import { readStored, writeStored } from "../../shared/storage.js";
import { normalizeCards, columns } from "./logic.mjs";
const key = "mini-projects:kanban:v1";
const stored = readStored(key);
let cards = [], recovered = false;
try {
 const parsed = JSON.parse(stored.value);
 cards = normalizeCards(parsed);
 recovered = stored.value !== null && (!Array.isArray(parsed) || cards.length !== parsed.length);
} catch { recovered = true; }
let storageMessage = '';
const store = createCollectionStore({ key, initial: cards, normalize: normalizeCards, read: readStored, write: writeStored,
 lock: navigator.locks ? (name, action) => navigator.locks.request(name, action) : null,
 onChange: value => { cards = value; render(); }, onStatus: message => { storageMessage = message; if (message) status(message); }
});
window.addEventListener('storage', event => store.sync(event.key));
async function save(change, message) {
 try { await store.update(change); status(message + (storageMessage ? ' ' + storageMessage : ''), storageMessage ? 'error' : 'success'); }
 catch (error) { status(error.message, 'error'); }
}
async function move(id, destination) {
 const card = cards.find(item => item.id === id);
 if (!card || !columns.includes(destination) || card.column === destination) return;
 await save(latest => latest.map(item => item.id === id ? { ...item, column: destination } : item), "Task moved to " + destination + ".");
 document.getElementById("move-" + id)?.focus();
}
function render() {
 $("#board").replaceChildren(...columns.map(column => {
  const section = element("section", "", "panel stack");
  const heading = element("h2", column + " (" + cards.filter(card => card.column === column).length + ")");
  section.append(heading);
  section.addEventListener("dragover", event => event.preventDefault());
  section.addEventListener("drop", event => { event.preventDefault(); move(event.dataTransfer.getData("text/plain"), column); });
  for (const item of cards.filter(card => card.column === column)) {
   const card = element("article", "", "kanban-card stack"); card.draggable = true;
   card.addEventListener("dragstart", event => event.dataTransfer.setData("text/plain", item.id));
   card.append(element("p", item.text));
   const label = element("label", "Move to", "field"), select = element("select");
   select.id = "move-" + item.id; select.setAttribute("aria-label", "Move task: " + item.text);
   columns.forEach(name => { const option = element("option", name); option.value = name; select.append(option); });
   select.value = column;
   select.addEventListener("change", () => move(item.id, select.value));
   label.append(select);
   const remove = element("button", "Delete"); remove.setAttribute("aria-label", "Delete task: " + item.text);
   remove.addEventListener("click", async () => { await save(latest => latest.filter(card => card.id !== item.id), "Task deleted."); $("#task").focus(); });
   card.append(label, remove); section.append(card);
  }
  return section;
 }));
}
$("#add-form").addEventListener("submit", async event => {
 event.preventDefault(); const text = $("#task").value.trim();
 if (!text) return status("Enter a task before adding it.", "error");
 if (cards.length >= 200) return status("This board supports up to 200 tasks. Delete a task before adding another.", "error");
 const card = { id: crypto.randomUUID(), text, column: columns[0] };
 await save(latest => { if (latest.length >= 200) throw new Error("This board supports up to 200 tasks."); return [...latest, card]; }, "Task added.");
 $("#task").value = ""; $("#task").focus();
});
render();
if (!stored.available) status("Storage is unavailable; the board will work for this visit.", "error");


else if (recovered) status("Some saved board data could not be read. Valid tasks were restored; new changes will replace the unreadable data.", "error");


