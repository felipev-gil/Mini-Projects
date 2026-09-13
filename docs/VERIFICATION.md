# Verification record

Checked locally on September 12, 2026, using Chromium through agent-browser and a static server. Public services were tested from the browser origin, without private credentials.

## Results

- **25 catalog entries**, including all four prior integrations and all 21 examples. Country Lookup has an explicit live-service blocker; nothing was omitted.
- **202 exact-case local HTML links**, 26 active HTML pages and 28 application JavaScript files passed the static audit. All 25 catalog URLs returned HTTP 200 under `/Mini-Projects/`.
- Original files under `Projects Examples` are unchanged, confirmed with Git.
- **364 layout combinations** passed: 26 pages × 7 widths (360, 480, 640, 768, 960, 1100, 1280) × 2 themes. No horizontal page overflow, header/content overlap or duplicate IDs was found in initial page states. These measurements do not substitute for checking unusual user-generated content.
- **126 form/button controls** had accessible names. Visible buttons met the 44px height target at 360px. All 16 primary/secondary/accent text versus background/card theme pairs exceeded 4.5:1; the lowest measured ratio was 5.88:1. Controls have separate, stronger border colors and visible focus outlines.
- Catalog checks passed: shared card rendering, curated favorite count, two password search results, intersecting search/category filters, selected button states, independent favorites, four games, theme persistence and explicit subpath links.
- Foundation and batch checks passed: Todo migration/toggle/delete/reload/empty states, game scoring/reset/expiry, counter/formatter/stopwatch behavior, native Kanban moves, QR failures, safe API text, encoded values, error recovery, recipe details and focus restoration. See [the per-project inventory](INVENTORY.md).
- Generated QR PNGs decoded back to the exact URL, accented/emoji text, and literal markup input using an independent decoder. A local UTF-8 repair to QRCode.js is documented in its vendor directory.
- Additional edge checks passed for stable/duplicate Todo IDs, checkbox focus after toggling, corrupt and denied storage, currency swap/loading/failure, 500-character unbroken Todo/formatter text, and a 400px QR at a 360px viewport. Keyboard Tab reached the visible Skip to content link and Enter navigated to the main content. Reduced-motion emulation removed the Like Button transition.
- Live requests succeeded for ExchangeRate-API, PokéAPI, GitHub profile and repositories, Lorem Picsum, The Cat API, TheMealDB search/random/details, Random User Generator, and a DiceBear avatar image. REST Countries v3.1 failed to fetch; [the blocker](INVENTORY.md#external-blocker-country-lookup) is disclosed in the catalog and project page.

## Repeatable checks

Run the dependency-free audit:

```powershell
node tools/audit.cjs
```

The automated browser checks used during development are summarized above without being included in the published portfolio. Live API availability can change independently of this code, so repeat the manual checks after deployment.

## Short manual checklist

- Open the home page at approximately 360px, 768px and 1280px. Toggle both themes; check header, wrapped filters, cards and footer without sideways scrolling.
- Tab from the address bar: use Skip to content, navigation, theme, search and filter buttons. Confirm focus stays visible and selected filters are announced.
- Search for “password,” choose Games (no results), then clear the search. Favorites should remain unchanged. Open a card and use Back to Portfolio.
- Add two Todo tasks, toggle/delete only one, switch filters and reload. Try an empty or whitespace-only task.
- Start, stop and restart each game/timer. Try controls with touch and keyboard; no score should change after a round ends.
- Enter literal `<b>hello</b>` in text tools; it should remain text. Generate a password with different groups and with no groups. Generate and scan a QR PNG, including emoji text.
- Try an API success, nonsense search and offline failure. Restore connectivity and retry. Check a recipe’s details and Back button. Country Lookup should explain its service blocker.
- After deployment, repeat navigation and an API request at the real repository subpath, check the favicon at browser-tab size, and add the verified public URL to the README.

## Practical limits

Keyboard interaction and viewport emulation are browser checks, not a full screen-reader audit or tests on physical phones. Animated effects honor `prefers-reduced-motion`. Original examples are retained learning references and intentionally were not repaired in place. No deployment or Git push was performed as part of this verification.
