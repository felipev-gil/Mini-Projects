// Development-only static server. No application backend or dependencies.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const mime = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".md": "text/plain",
};
http
  .createServer((req, res) => {
    let relative;
    try {
      relative = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      ).replace(/^\/Mini-Projects(?=\/|$)/, "");
    } catch {
      res.writeHead(400).end();
      return;
    }
    let file = path.resolve(root, "." + relative);
    if (!file.startsWith(root + path.sep) && file !== root) {
      res.writeHead(403).end();
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory())
      file = path.join(file, "index.html");
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404).end("Not found");
        return;
      }
      res.writeHead(200, {
        "Content-Type": mime[path.extname(file)] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.end(data);
    });
  })
  .listen(4173, "127.0.0.1", () =>
    console.log("Static portfolio: http://127.0.0.1:4173/Mini-Projects/"),
  );
