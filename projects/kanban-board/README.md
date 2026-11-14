# Kanban Board

Organize tasks into To do, In progress, and Done using drag and drop or simple move controls.

## Use

Serve the repository root with `node scripts/serve.mjs`, then open [the app](index.html). Add a task of up to 200 characters. Drag its card to another column, or use its Move to menu with touch or keyboard. Delete removes that task. The board supports up to 200 tasks and saves them locally when storage is available.

## Data and dependencies

Tasks are saved only in this browser under mini-projects:kanban:v1. There is no account or synchronization. If storage is blocked, the board still works for this visit. Drag and drop is optional; every task has keyboard and touch controls.

## Files

- `index.html`: semantic interface and shared page shell.
- `style.css`: app-specific styles, scoped to `.kanban-board`.
- `script.js`: behavior, with browser modules and safe text rendering.

The app shares the collection theme and navigation.



