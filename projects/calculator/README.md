# Calculator

A simple arithmetic calculator with decimals, parentheses, keyboard support, and standard operator precedence.

## Use

Serve the repository root with `node scripts/serve.mjs`, then open [the app](index.html). Select the keys or type a calculation. Press Enter to calculate, Escape to clear, and Backspace to remove the last character. Use AC to clear the full expression.

The calculator runs in your browser. It does not save calculations or send them online.

## Files

- `index.html`: accessible calculator interface and shared page shell.
- `style.css`: responsive calculator layout, scoped to `.calculator`.
- `script.js`: input handling, keyboard support, and arithmetic parsing without `eval`.

The app uses the collection's shared theme, navigation, and controls. It needs no external services or additional dependencies.
