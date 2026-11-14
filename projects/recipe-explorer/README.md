# Recipe Explorer

Search for a meal or discover a random recipe, with ingredients and step-by-step instructions.

## Use

Serve the repository root with `node scripts/serve.mjs`, then open [the app](index.html). Search by meal name, then choose View recipe to read ingredients and instructions. Close recipe returns focus to its card. Surprise me shows only the full random recipe, without a duplicate result card below it.

## Data and dependencies

Recipes and images come from [TheMealDB](https://www.themealdb.com/api.php), using its educational test key. Search terms are sent to the service; no recipes or searches are saved. Ingredients and instructions are provider content.

## Files

- `index.html`: semantic interface and shared page shell.
- `style.css`: app-specific styles, scoped to `.recipe-explorer`.
- `script.js`: behavior, with browser modules and safe text rendering.

The app shares the collection theme and navigation.




