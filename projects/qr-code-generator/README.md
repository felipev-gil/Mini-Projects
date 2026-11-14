# QR Code Generator

Create a QR code for short text or a URL entirely on your device.

## Use

Serve the repository root with `node scripts/serve.mjs`, then open [the app](index.html). Enter short text or a URL, then Generate QR code. Download PNG saves the image with a white quiet zone around it. Editing the input clears the old code so it cannot be confused with the new text. The limit is 250 UTF-8 bytes, which can be fewer than 250 characters.

## Data and dependencies

Codes are generated locally using the bundled [QRCode.js 1.0.0](https://github.com/davidshimjs/qrcodejs) library (MIT). Text is never sent to an external service or saved. The code uses black on white with a quiet border; scan the downloaded image to verify its contents before sharing.

## Files

- `index.html`: semantic interface and shared page shell.
- `style.css`: app-specific styles, scoped to `.qr-code-generator`.
- `script.js`: behavior, with browser modules and safe text rendering.

The app shares the collection theme and navigation.


The bundled library retains its [MIT license](vendor/LICENSE).


A small [local UTF-8 patch](vendor/PATCHES.md) corrects accented, mixed-width, and emoji text encoding in the original library.


