import { $, status } from "../../shared/project-utils.js";

import { validQRText } from "./logic.mjs";

let downloadURL = "";
function clear() { $("#qr").replaceChildren(); $("#result").hidden = true; $("#download").disabled = true; downloadURL = ""; }
$("#text").addEventListener("input", () => { clear(); status(""); });
$("#qr-form").addEventListener("submit", event => {
 event.preventDefault(); clear(); const text = $("#text").value.trim();
 if (!validQRText(text)) return status("Enter text containing between 1 and 250 UTF-8 bytes.", "error");
 try {
  new window.QRCode($("#qr"), { text, width:256, height:256, colorDark:"#000000", colorLight:"#ffffff", correctLevel:window.QRCode.CorrectLevel.M });
  const canvas = $("#qr canvas");
  if (!canvas) throw new Error("Canvas is unavailable.");
  // Include a quiet zone in the downloadable image as well as the on-page preview.
  const output = document.createElement("canvas"); output.width = output.height = 320;
  const context = output.getContext("2d"); context.fillStyle = "#ffffff"; context.fillRect(0,0,320,320); context.drawImage(canvas,32,32);
  downloadURL = output.toDataURL("image/png"); $("#encoded").textContent = "Encoded text: " + text;
  $("#result").hidden = false; $("#download").disabled = false; status("QR code ready.", "success");
 } catch { clear(); status("The QR code could not be generated. Try shorter text or another browser.", "error"); }
});
$("#download").addEventListener("click", () => { if (!downloadURL) return; const anchor = document.createElement("a"); anchor.href = downloadURL; anchor.download = "mini-projects-qr.png"; anchor.click(); });



