# Pokémon Explorer

Look up a Pokémon by name or number, or meet a random member of the original 151.

## Use

Serve the repository root with `node scripts/serve.mjs`, then open [the app](index.html). Search by an English Pokémon name or number. Random Pokémon selects from the original 151. The result includes artwork, types, dimensions, and base stats.

## Data and dependencies

Names, stats, and images come from [PokéAPI](https://pokeapi.co/). Searches are sent to that service and are not saved here. Pokémon names and artwork belong to their respective rights holders; this is an unofficial educational demo.

## Files

- `index.html`: semantic interface and shared page shell.
- `style.css`: app-specific styles, scoped to `.pokemon-explorer`.
- `script.js`: behavior, with browser modules and safe text rendering.

The app shares the collection theme and navigation.



