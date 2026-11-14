export function normalizeTodos(value, createId) {
  if (!Array.isArray(value)) throw new Error("Saved tasks must be a list.");
  const ids = new Set();
  return value.map((todo) => {
    if (!todo || typeof todo.text !== "string" || !todo.text.trim() || typeof todo.completed !== "boolean") throw new Error("A saved task is invalid.");
    let id = typeof todo.id === "string" && todo.id && !ids.has(todo.id) ? todo.id : createId();
    while (ids.has(id)) id = createId();
    ids.add(id);
    return { id, text: todo.text.trim(), completed: todo.completed };
  });
}
export function filterTodos(todos, filter) {
  return todos.filter((todo) => filter === "active" ? !todo.completed : filter === "completed" ? todo.completed : true);
}
export function toggleTodo(todos, id) { return todos.map((todo) => todo.id === id ? { ...todo, completed: !todo.completed } : todo); }
export function deleteTodo(todos, id) { return todos.filter((todo) => todo.id !== id); }
