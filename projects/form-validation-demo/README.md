# Form Validation Demo

Explore inline form validation and password requirements without creating an account.

## Use

Serve the repository root with `node scripts/serve.mjs`, then open [the app](index.html). Enter made-up display-name, email, and password values. The practice password needs 12 characters, a letter, a number, an uppercase letter, and a special character (punctuation or a symbol; whitespace does not count). Confirm it, then select Validate demo form. Errors appear beside the fields; passing validation creates no account.

## Data and dependencies

This is a client-side validation exercise, not authentication. Matching character requirements does not prove a password is strong or uncompromised. No account is created and no form data is sent or saved.

## Files

- `index.html`: semantic interface and shared page shell.
- `style.css`: app-specific styles, scoped to `.form-validation-demo`.
- `script.js`: behavior, with browser modules and safe text rendering.

The app shares the collection theme and navigation.




