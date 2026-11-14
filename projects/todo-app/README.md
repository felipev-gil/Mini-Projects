# Todo App

A small task list that remembers your tasks in the current browser.

## How to use

1. Enter a task (up to 300 characters) and select **Add task**, or press Enter.
2. Use its checkbox to mark it complete or active.
3. Select **All**, **Active**, or **Completed** to filter the list.
4. Select **Delete** to remove one task, or **Clear completed** to remove finished tasks. These actions have no undo.

## Features and concepts

Stable task IDs, accessible native controls, safe text rendering, event delegation, filter state, local persistence, and validation of stored data. The count always shows the number of active tasks across the whole list.

## Data and dependencies

No API or external library is used. Tasks are stored under `mini-projects:todo:v1`. Older saved tasks are imported when the new storage key is absent, including assigning IDs to old tasks that had none. The original legacy key is not deleted.

## Limitations

Tasks are not synced across devices or tabs. If multiple tabs edit the list, the most recent save wins. Clearing site data removes tasks. If storage is blocked or full, tasks remain usable for the current page session and a message explains that changes are not saved. Unreadable saved data is not overwritten until a new list change is made.

Run from the repository's web server. See the [collection README](../../README.md).
