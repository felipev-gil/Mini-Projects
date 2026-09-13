(() => {
  "use strict";
  const { $, element, status } = Mini;

  let dataUrl = "";
  $("generate").addEventListener("click", () => {
    dataUrl = "";
    $("download").disabled = true;
    $("qr").replaceChildren();
    const text = $("text").value.trim();
    if (!text) {
      status("Enter text or a URL first.");
      return;
    }
    if (new TextEncoder().encode(text).length > 500) {
      status("Use at most 500 UTF-8 bytes; emoji can use several bytes each.");
      return;
    }
    if (typeof QRCode === "undefined") {
      status(
        "The local QRCode.js library could not load. Refresh and try again.",
      );
      return;
    }
    try {
      const size = Number($("size").value);
      new QRCode($("qr"), {
        text,
        width: size,
        height: size,
        correctLevel: QRCode.CorrectLevel.H,
      });
      const source = $("qr").querySelector("canvas");
      if (!source) throw Error();
      const canvas = document.createElement("canvas");
      const margin = Math.ceil(size * 0.12);
      canvas.width = canvas.height = size + margin * 2;
      const context = canvas.getContext("2d");
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(source, margin, margin);
      dataUrl = canvas.toDataURL("image/png");
      $("qr").replaceChildren(canvas);
      $("download").disabled = false;
      status("QR code ready. Scan to check it before sharing.");
    } catch {
      status("This text could not be encoded. Try a shorter message.");
    }
  });
  $("download").addEventListener("click", () => {
    if (!dataUrl) return;
    const link = element("a");
    link.href = dataUrl;
    link.download = "qrcode.png";
    link.click();
  });
  $("text").addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter")
      $("generate").click();
  });
})();
