# GitHub Profile Finder

Explore a public GitHub profile and its six most recently updated repositories.

## Use

Serve the repository root with `node scripts/serve.mjs`, then open [the app](index.html). Enter a GitHub username and Search. The app shows public profile details and up to six recently updated repositories. Profile and repository links open new tabs. Search again to retry a failed request.

## Data and dependencies

Public profiles and repositories come from the [GitHub REST API](https://docs.github.com/en/rest). Usernames are sent to GitHub. Unauthenticated requests have a rate limit; no token or account is required and searches are not saved.

## Files

- `index.html`: semantic interface and shared page shell.
- `style.css`: app-specific styles, scoped to `.github-profile-finder`.
- `script.js`: behavior, with browser modules and safe text rendering.

The app shares the collection theme and navigation.



