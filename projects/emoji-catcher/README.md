# Emoji Catcher

Catch as many smiling faces as you can in a 30-second round.

## Use

Serve the repository root with `node scripts/serve.mjs`, then open [the app](index.html). Choose Relaxed (1.2 seconds), Quick (0.8 seconds), or Fast (0.4 seconds), then Start round. Stop round ends the current round, keeps the results visible, and unlocks the pace selector. Choose another pace and start a fresh round when ready. Select the smiling face to score during the 30-second round. The counters show caught faces, total faces shown, missed faces, and wrong clicks. A wrong click counts as a miss and immediately moves the face. Faces that expire or remain when the round ends, including when you select Stop, count as missed. During play, the total includes the current face; after the round, caught plus missed equals the total. Keyboard users can move between cells with arrow keys and catch with Enter or Space. Restart round begins again at zero.

## Data and dependencies

The game starts only when you choose Start round. Scores are not saved. The round ends using elapsed time, including time in background tabs.

## Files

- `index.html`: semantic interface and shared page shell.
- `style.css`: app-specific styles, scoped to `.emoji-catcher`.
- `script.js`: behavior, with browser modules and safe text rendering.

The app shares the collection theme and navigation.
