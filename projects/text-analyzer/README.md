# Text Analyzer

Count words and characters, change letter case, and preview simple text formatting.

## Use

Serve the repository root with `node scripts/serve.mjs`, then open [the app](index.html). Type or paste text to update counts and the preview. Optionally set a character target. The controls are grouped into Change letter case, Style the preview, and Copy/Clear actions. Use the case buttons to change the text, and Bold, Italic, or Underline to style only the preview. Copy text exports plain text; Clear empties the editor.

## Data and dependencies

Text stays on your device and is not saved. Words use English word segmentation when supported; the fallback counts whitespace-separated tokens. Characters count Unicode code points, so combined emoji may count as several characters. Copy exports plain text; formatting affects the preview only.

## Files

- `index.html`: semantic interface and shared page shell.
- `style.css`: app-specific styles, scoped to `.text-analyzer`.
- `script.js`: behavior, with browser modules and safe text rendering.

The app shares the collection theme and navigation.




