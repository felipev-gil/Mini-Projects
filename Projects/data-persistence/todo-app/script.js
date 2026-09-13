(() => {
  "use strict";
  const { $, element, status } = Mini;

  let todos = [],
    filter = "all";
  function save() {
    try {
      localStorage.setItem("todos", JSON.stringify(todos));
    } catch {
      status(
        "Storage is unavailable. Tasks will last only until this page closes.",
      );
    }
  }
  function render() {
    const visible = todos.filter(
      (t) =>
        filter === "all" ||
        (filter === "completed" ? t.completed : !t.completed),
    );
    $("todos-list").replaceChildren();
    visible.forEach((todo) => {
      const li = element(
        "li",
        undefined,
        "task" + (todo.completed ? " completed" : ""),
      );
      const label = element("label"),
        checkbox = element("input");
      li.id = "todo-" + todo.id;
      checkbox.type = "checkbox";
      checkbox.checked = todo.completed;
      checkbox.addEventListener("change", () => {
        todo.completed = checkbox.checked;
        save();
        render();
        const nextCheckbox = $("todo-" + todo.id)?.querySelector("input");
        (nextCheckbox || $("task-input")).focus();
      });
      label.append(checkbox, element("span", todo.text));
      const remove = element("button", "Delete");
      remove.setAttribute("aria-label", "Delete task: " + todo.text);
      remove.addEventListener("click", () => {
        todos = todos.filter((t) => t.id !== todo.id);
        save();
        render();
        $("task-input").focus();
      });
      li.append(label, remove);
      $("todos-list").append(li);
    });
    $("empty-state").textContent = visible.length
      ? ""
      : filter === "all"
        ? "No tasks yet. Add your first task above."
        : "No " + filter + " tasks.";
    const left = todos.filter((t) => !t.completed).length;
    $("items-left").textContent =
      left + (left === 1 ? " task left" : " tasks left");
    $("clear-completed").disabled = !todos.some((t) => t.completed);
  }
  try {
    const stored = JSON.parse(localStorage.getItem("todos") || "[]");
    if (!Array.isArray(stored)) throw new Error();
    // Keep valid IDs stable; repair missing or duplicate IDs from older versions.
    const usedIds = new Set();
    todos = stored
      .filter((t) => t && typeof t.text === "string")
      .map((t) => {
        const id =
          typeof t.id === "string" && t.id && !usedIds.has(t.id)
            ? t.id
            : crypto.randomUUID();
        usedIds.add(id);
        return { id, text: t.text, completed: t.completed === true };
      });
  } catch {
    status("Saved tasks could not be read. You can start a new list.");
  }
  $("add-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const text = $("task-input").value.trim();
    if (!text) {
      status("Enter a task first.");
      return;
    }
    todos.push({ id: crypto.randomUUID(), text, completed: false });
    save();
    render();
    $("task-input").value = "";
    $("task-input").focus();
  });
  $("task-filters").addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    filter = button.dataset.filter;
    for (const child of $("task-filters").children)
      child.setAttribute("aria-pressed", child === button);
    render();
  });
  $("clear-completed").addEventListener("click", () => {
    todos = todos.filter((t) => !t.completed);
    save();
    render();
  });
  render();
})();
