// Read-only static checks. Run with: node tools/audit.cjs
const fs = require("node:fs");
const path = require("node:path");
const cp = require("node:child_process");
const root = path.resolve(__dirname, "..");
const projects = JSON.parse(
  fs.readFileSync(path.join(root, "projects.json"), "utf8"),
);
const errors = [];
const categories = [
  "Utilities",
  "Data Persistence",
  "Games",
  "API Integration",
];
const urls = new Set();
function exactFile(relative) {
  let current = root;
  for (const part of relative.split(/[\\/]/)) {
    if (!part || part === ".") continue;
    if (
      !fs.existsSync(current) ||
      !fs.statSync(current).isDirectory() ||
      !fs.readdirSync(current).includes(part)
    )
      return false;
    current = path.join(current, part);
  }
  return fs.existsSync(current);
}
for (const p of projects) {
  if (
    !p.title ||
    !p.description ||
    !categories.includes(p.category) ||
    !Array.isArray(p.tags) ||
    typeof p.favorite !== "boolean"
  )
    errors.push("Invalid metadata: " + p.title);
  if (
    !/^Projects\/[a-z-]+\/[a-z-]+\/index\.html$/.test(p.url) ||
    !exactFile(p.url)
  )
    errors.push("Invalid/case-mismatched URL: " + p.url);
  if (urls.has(p.url)) errors.push("Duplicate URL: " + p.url);
  urls.add(p.url);
}
const htmlFiles = ["index.html", ...projects.map((p) => p.url)];
let links = 0;
for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  if (new Set(ids).size !== ids.length) errors.push("Duplicate IDs: " + file);
  for (const [, value] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    if (/^(?:[a-z]+:|#|\/\/)/i.test(value)) continue;
    const url = new URL(value, "https://local.invalid/" + file);
    const relative = decodeURIComponent(url.pathname).slice(1);
    links++;
    if (!exactFile(relative))
      errors.push("Missing or case-mismatched link in " + file + ": " + value);
  }
}
const scripts = [
  "script.js",
  "Shared/script.js",
  "Shared/project.js",
  ...projects.map((p) => p.url.replace("index.html", "script.js")),
];
for (const file of scripts) {
  const check = cp.spawnSync(
    process.execPath,
    ["--check", path.join(root, file)],
    { encoding: "utf8" },
  );
  if (check.status !== 0)
    errors.push("Syntax error: " + file + " " + check.stderr);
}
const originalDiff = cp.spawnSync(
  "git",
  ["diff", "--exit-code", "--", "Projects Examples"],
  { cwd: root, encoding: "utf8" },
);
if (originalDiff.status !== 0)
  errors.push(
    "Original examples changed (or Git unavailable). Review preservation before publishing.",
  );
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `PASS: ${projects.length} catalog entries; ${htmlFiles.length} HTML pages; ${links} exact-case local links; ${scripts.length} JavaScript syntax checks; original examples unchanged.`,
  );
