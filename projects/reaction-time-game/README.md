# Reaction Time Game

Wait for the target, then select it as quickly as you can.

## Use

Serve the repository root with `node scripts/serve.mjs`, then open [the app](index.html). Select Start round and wait for the target. Click or tap it, or press Enter after it receives focus. Clicking the arena early ends that round. The best result lasts for this visit; hiding the page cancels an active round.

## Data and dependencies

Results use the browser clock and include input and display latency. They are a playful estimate, not a scientific measurement. Scores last only for this visit.

## Files

- `index.html`: semantic interface and shared page shell.
- `style.css`: app-specific styles, scoped to `.reaction-time-game`.
- `script.js`: behavior, with browser modules and safe text rendering.

The app shares the collection theme and navigation.



