# Stopwatch

Measure elapsed time, pause and resume, and record laps.

## Use

Serve the repository root with `node scripts/serve.mjs`, then open [the app](index.html). Choose Start, then Record lap as needed. Pause freezes the display; Start resumes from the accumulated time. Reset stops the clock and removes laps. Up to 100 laps are retained during the visit.

## Data and dependencies

Timing uses a monotonic clock and includes time spent in background tabs. Display refreshes may slow in the background. Laps and elapsed time are not saved after leaving the page.

## Files

- `index.html`: semantic interface and shared page shell.
- `style.css`: app-specific styles, scoped to `.stopwatch`.
- `script.js`: behavior, with browser modules and safe text rendering.

The app shares the collection theme and navigation.



