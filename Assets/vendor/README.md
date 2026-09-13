# QRCode.js

Vendored from https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js.

Author: David Shim (davidshimjs). Upstream: https://github.com/davidshimjs/qrcodejs. License: [MIT](qrcode.LICENSE.txt).

Original downloaded SHA-256: c541ef06327885a8415bca8df6071e14189b4855336def4f36db54bde8484f36.

Local change: the byte-mode encoder uses TextEncoder instead of encoding UTF-16 surrogate halves separately, so non-BMP characters (such as emoji) produce valid UTF-8. The portfolio adds a white quiet zone outside the generated symbol. No other library behavior was changed.
