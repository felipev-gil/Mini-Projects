# Country Explorer

Search countries and territories by name or country code, and explore capitals, languages, and currencies.

## Use

Serve the repository root with `node scripts/serve.mjs`, then open [the app](index.html). Enter a country or territory name, or a two-letter code such as CO, then Search. All matching entries appear, including available capitals, languages, and currencies. Accents and letter case do not affect name matching.

## Data and dependencies

Search runs locally against a bundled snapshot of [mledoze/countries](https://github.com/mledoze/countries) (November 9, 2026), licensed under [ODbL 1.0](./data/LICENSE). It includes countries and territories. Values are reference data, not live updates; no search text is sent to an external service.

## Files

- `index.html`: semantic interface and shared page shell.
- `style.css`: app-specific styles, scoped to `.country-explorer`.
- `script.js`: behavior, with browser modules and safe text rendering.

The app shares the collection theme and navigation.


See [dataset provenance and license](data/README.md).


