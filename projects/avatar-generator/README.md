# Avatar Generator

Turn a nickname into a repeatable illustrated avatar, with three styles to explore.

## Use

Serve the repository root with `node scripts/serve.mjs`, then open [the app](index.html). Enter a custom username, or leave it blank to generate a fresh readable username and avatar on every click. The generated username appears above its avatar. Choose Lorelei, Bottts, or Pixel Art, then Generate avatar. The same custom username and style reproduce the image. Clear the custom username field to return to random generation with the same Generate avatar button. Open avatar image opens the SVG in a new tab.

## Data and dependencies

Avatars load from [DiceBear](https://www.dicebear.com/); the nickname is sent as a seed, so avoid personal information. Lorelei by Lisa Wischofsky and Pixel Art by DiceBear use CC0; Bottts by Pablo Stanley is free for personal and commercial use. See [credits and style licenses](../../docs/credits.md). Nothing is saved here.

## Files

- `index.html`: semantic interface and shared page shell.
- `style.css`: app-specific styles, scoped to `.avatar-generator`.
- `script.js`: behavior, with browser modules and safe text rendering.

The app shares the collection theme and navigation.
