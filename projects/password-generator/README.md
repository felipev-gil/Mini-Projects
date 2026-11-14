# Password Generator

Generate random passwords locally with the browser's Web Crypto API.

## How to use

1. Choose a length from 8 to 44 characters (16 by default).
2. Select uppercase letters, lowercase letters, numbers, and/or symbols. At least one group must be selected.
3. Select **Generate password**. Every selected group is guaranteed to appear at least once.
4. Select **Copy**. If browser clipboard access fails, the password is selected for manual copying.

Changing options clears the existing output so it cannot be mistaken for a password made with the new settings.

## Features and concepts

`crypto.getRandomValues()` supplies randomness. Rejection sampling avoids modulo bias; whole candidate passwords are also rejected if a required group is missing. This gives equal probability to valid strings for the chosen options. There is no `Math.random()` fallback.

The strength label is a rough length-and-variety estimate. It is not a breach check, cracking-time prediction, or security guarantee.

## Data and dependencies

No external API or library is used. Passwords are not saved or transmitted by the app. Selecting Copy writes the generated value to the system clipboard.

## Limitations

Automatic copying requires HTTPS or localhost and browser permission. Some websites restrict allowed characters; choose compatible options. The password is displayed on screen, and clipboard contents remain under the operating system's control. Use a unique password for every account.

Run from the repository's web server. See the [collection README](../../README.md).

