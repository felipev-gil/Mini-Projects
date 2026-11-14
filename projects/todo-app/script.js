import { normalizeTodos, filterTodos, toggleTodo, deleteTodo } from "./logic.mjs";
import { createCollectionStore } from "../../shared/collection-store.mjs";
import { readStored, writeStored } from "../../shared/storage.js";

const input = document.getElementById("task-input");
const list = document.getElementById("todos-list");
const empty = document.getElementById("empty-state");
const count = document.getElementById("items-left");
const status = document.getElementById("task-status");
const storageStatus = document.getElementById("storage-status");
const clear = document.getElementById("clear-completed");
const filters = document.querySelectorAll("[data-filter]");
const key = "mini-projects:todo:v1";
let todos = [];
let currentFilter = "all";
let idCounter = 0;
const createId = () => `${Date.now().toString(36)}-${(++idCounter).toString(36)}-${Array.from(crypto.getRandomValues(new Uint32Array(2)), (n) => n.toString(36)).join("")}`;
const saved = readStored(key);
const legacy = saved.value === null && saved.available ? readStored("todos") : { value: null };
if (!saved.available) storageStatus.textContent = "Storage is unavailable. Tasks will last until you leave this page.";
try {
  const raw = saved.value ?? legacy.value;
  if (raw !== null) {
    todos = normalizeTodos(JSON.parse(raw), createId);

  }
} catch {
  storageStatus.textContent = "Saved tasks could not be read. You can start a new list; your next change will replace the unreadable saved list.";
}

const store = createCollectionStore({ key, initial: todos, normalize: value => normalizeTodos(value, createId), read: readStored, write: writeStored,
  lock: navigator.locks ? (name, action) => navigator.locks.request(name, action) : null,
  onChange: value => { todos = value; render(); }, onStatus: message => { storageStatus.textContent = message; }
});
window.addEventListener("storage", event => store.sync(event.key));
async function persist(change) {
  try { await store.update(change); return true; }
  catch (error) { storageStatus.textContent = error.message; return false; }
}
if (legacy.value !== null) void persist(value => value);
function render(focusId, focusAction = "toggle") {
  const visible = filterTodos(todos, currentFilter);
  const fragment = document.createDocumentFragment();
  for (const todo of visible) {
    const item = document.createElement("li");
    item.className = `todo-item${todo.completed ? " completed" : ""}`;
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.dataset.id = todo.id;
    checkbox.dataset.action = "toggle";
    const text = document.createElement("span");
    text.textContent = todo.text;
    label.append(checkbox, text);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "delete-task";
    remove.textContent = "Delete";
    remove.setAttribute("aria-label", `Delete task: ${todo.text}`);
    remove.dataset.id = todo.id;
    remove.dataset.action = "delete";
    item.append(label, remove);
    fragment.append(item);
  }
  list.replaceChildren(fragment);
  empty.hidden = visible.length !== 0;
  empty.textContent = currentFilter === "active" ? "No active tasks. You’re all caught up." : currentFilter === "completed" ? "No completed tasks yet." : "Your list is clear. Add a task to get started.";
  const remaining = todos.filter((todo) => !todo.completed).length;
  count.textContent = `${remaining} task${remaining === 1 ? "" : "s"} left`;
  clear.disabled = !todos.some((todo) => todo.completed);
  filters.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.filter === currentFilter)));
  if (focusId) {
    const target = Array.from(list.querySelectorAll("[data-action]")).find((node) => node.dataset.id === focusId && node.dataset.action === focusAction);
    (target || input).focus();
  }
}
document.getElementById("task-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) { status.textContent = "Enter a task before adding it."; input.focus(); return; }
  const task = { id: createId(), text: text.slice(0, 300), completed: false };
  if (!(await persist(latest => [...latest, task]))) return;
  render();
  input.value = "";
  input.focus();
  status.textContent = currentFilter === "completed" ? "Task added. Select All or Active to see it." : "Task added.";
});
list.addEventListener("change", async (event) => {
  if (event.target.dataset.action !== "toggle") return;
  const id = event.target.dataset.id;
  if (!(await persist(latest => toggleTodo(latest, id)))) return;
  render(id);
  status.textContent = `${count.textContent}.`;
});
list.addEventListener("click", async (event) => {
  const button = event.target.closest('[data-action="delete"]');
  if (!button) return;
  const visible = filterTodos(todos, currentFilter);
  const index = visible.findIndex((todo) => todo.id === button.dataset.id);
  const nextId = visible[index + 1]?.id || visible[index - 1]?.id;
  if (!(await persist(latest => deleteTodo(latest, button.dataset.id)))) return;
  render(nextId, "delete");
  if (!nextId) input.focus();
  status.textContent = "Task deleted.";
});
filters.forEach((button) => button.addEventListener("click", () => {
  currentFilter = button.dataset.filter;
  render();
  status.textContent = `${filterTodos(todos, currentFilter).length} ${currentFilter === "all" ? "total" : currentFilter} tasks shown.`;
}));
clear.addEventListener("click", async () => {
  const removed = todos.filter((todo) => todo.completed).length;
  if (!(await persist(latest => latest.filter(todo => !todo.completed)))) return;
  render(); input.focus();
  status.textContent = `${removed} completed task${removed === 1 ? "" : "s"} cleared.`;
});
render();
