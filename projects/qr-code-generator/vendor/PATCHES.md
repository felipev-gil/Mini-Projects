# Local QRCode.js patch

Upstream: QRCode.js 1.0.0 by davidshimjs, distributed through cdnjs. The [MIT license](LICENSE) is retained.

The original downloaded file was verified with SHA-512:
CNgIRecGo7nphbeZ04Sc13ka07paqdeTu0WR1IM4kNcpmBAUSHSQX0FslNhTDadL4O5SAGapGt4FodqL8My0mA==

## UTF-8 byte encoding

The byte-mode constructor at the beginning of qrcode.min.js now uses the browser's TextEncoder. The original encoder processed UTF-16 code units separately, mishandled supplementary characters such as emoji, and reused a temporary byte array between characters. The patch preserves the original byte-order-mark behavior for non-ASCII text and leaves QR matrix generation and rendering unchanged.

The source file is therefore locally modified and no longer has the upstream integrity hash. Regression tests decode the actual vendored encoder output for accented text, emoji, mixed-width characters, and encoding boundaries.

