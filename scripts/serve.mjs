// Optional local preview using only Node.js built-ins. No packages or build step.
import { createServer } from "node:http";
import { readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = await realpath(fileURLToPath(new URL("../", import.meta.url)));
const port = Number(process.env.PORT || 4173);
const base = process.env.BASE_PATH || "";
if (base && !/^\/[a-zA-Z0-9_-]+$/.test(base)) throw new Error("BASE_PATH must be empty or a single /folder-name.");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".ico": "image/x-icon", ".svg": "image/svg+xml", ".webp": "image/webp", ".md": "text/plain; charset=utf-8" };
const allowedRootFiles = new Set(["index.html", "style.css", "script.js", "projects.json", "README.md", "LICENSE"]);
const allowedDirectories = new Set(["assets", "shared", "projects", "docs", "tests"]);
const server = createServer(async (request, response) => {
  const send = (code, body) => { response.writeHead(code, { "Content-Type": "text/plain; charset=utf-8" }); response.end(body); };
  if (!["GET", "HEAD"].includes(request.method)) return send(405, "Method not allowed");
  try {
    let pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (base) {
      if (pathname === base) { response.writeHead(302, { Location: `${base}/` }); response.end(); return; }
      if (!pathname.startsWith(`${base}/`)) return send(404, "Not found");
      pathname = pathname.slice(base.length);
    }
    const parts = pathname.split("/").filter(Boolean);
    if (parts.some((part) => part.startsWith(".") || part.includes("\\") || part.includes(":"))) return send(404, "Not found");
    if (!parts.length) parts.push("index.html");
    if (!allowedRootFiles.has(parts[0]) && !allowedDirectories.has(parts[0])) return send(404, "Not found");
    let file = path.resolve(root, ...parts);
    if ((await stat(file)).isDirectory()) {
      if (!pathname.endsWith("/")) { response.writeHead(302, { Location: `${base}${pathname}/` }); response.end(); return; }
      file = path.join(file, "index.html");
    }
    file = await realpath(file);
    if (!file.startsWith(root + path.sep)) return send(404, "Not found");
    const data = await readFile(file);
    response.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
    response.end(request.method === "HEAD" ? undefined : data);
  } catch { send(404, "Not found"); }
});
server.listen(port, "127.0.0.1", () => console.log(`Mini Projects: http://127.0.0.1:${port}${base}/`));
server.on("error", (error) => { console.error(error.message); process.exitCode = 1; });
