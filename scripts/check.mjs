// Source checks for the published collection. No third-party packages required.
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
const root = fileURLToPath(new URL("../", import.meta.url));
const issues = [];
const catalog = JSON.parse(await readFile(path.join(root, "projects.json"), "utf8"));
const files = ["index.html", "style.css", "script.js"];
async function collect(directory) {
  for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
    const relative = path.join(directory, entry.name);
    if (entry.isDirectory()) await collect(relative);
    else files.push(relative);
  }
}
for (const directory of ["shared", "projects", "scripts", "tests", "docs"]) await collect(directory);
const ids = new Set();
for (const project of catalog) {
  if (typeof project.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.id) || ids.has(project.id)) issues.push(`Invalid or duplicate project ID: ${project.id}`);
  ids.add(project.id);
  if (![project.title, project.description, project.category].every((value) => typeof value === "string" && value.trim())) issues.push(`Missing project text: ${project.id}`);
  if (!Array.isArray(project.tags) || !project.tags.every((tag) => typeof tag === "string") || typeof project.featured !== "boolean") issues.push(`Invalid metadata: ${project.id}`);
  for (const name of ["index.html", "script.js", "README.md"]) {
    try { await stat(path.join(root, "projects", project.id, name)); }
    catch { issues.push(`Missing projects/${project.id}/${name}`); }
  }
}
async function checkReference(source, reference) {
  if (!reference || /^(?:[a-z]+:|#|\/\/)/i.test(reference)) return;
  const clean = decodeURIComponent(reference.split(/[?#]/)[0]);
  const destination = path.resolve(root, path.dirname(source), clean);
  if (!destination.startsWith(root)) { issues.push(`${source}: reference leaves repository: ${reference}`); return; }
  try {
    await stat(destination);
    let current = root;
    for (const part of path.relative(root, destination).split(path.sep).filter(Boolean)) {
      if (!(await readdir(current)).includes(part)) { issues.push(`${source}: capitalization mismatch: ${reference}`); break; }
      current = path.join(current, part);
    }
  } catch { issues.push(`${source}: missing reference: ${reference}`); }
}
for (const file of files) {
  const content = await readFile(path.join(root, file), "utf8");
  if (/\.(?:js|mjs)$/.test(file)) {
    const result = spawnSync(process.execPath, ["--check", path.join(root, file)], { encoding: "utf8" });
    if (result.status !== 0) issues.push(`${file}: ${result.stderr || result.error}`);
    for (const match of content.matchAll(/\bfrom\s+["']([^"']+)["']/g)) if (match[1].startsWith(".")) await checkReference(file, match[1]);
  }
  if (file.endsWith(".html")) {
    const html = content.replace(/<!--[\s\S]*?-->/g, "");
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    if (new Set(ids).size !== ids.length) issues.push(`${file}: duplicate HTML IDs`);
    for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) await checkReference(file, match[1]);
    if (!file.startsWith("shared")) {
      if ((html.match(/<h1\b/g) || []).length !== 1) issues.push(`${file}: expected one main heading`);
      if (!/<!doctype html>/i.test(html) || !/lang="en"/.test(html)) issues.push(`${file}: missing document metadata`);
      const cssFiles = [...html.matchAll(/href="([^"]+\.css)"/g)].map((match) => path.resolve(root, path.dirname(file), match[1]));
      let css = "";
      for (const cssFile of cssFiles) { try { css += await readFile(cssFile, "utf8"); } catch {} }
      const definitions = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1]));
      for (const variable of new Set([...css.matchAll(/var\((--[\w-]+)/g)].map((match) => match[1]))) if (!definitions.has(variable)) issues.push(`${file}: undefined CSS variable ${variable}`);
    }
  }
}
const readme = await readFile(path.join(root, "README.md"), "utf8");
for (const project of catalog) if (!readme.includes(`projects/${project.id}/`)) issues.push(`README does not list ${project.id}`);
if (issues.length) { console.error(issues.join("\n")); process.exitCode = 1; }
else console.log(`Checked ${catalog.length} projects and ${files.length} public/support files: paths, capitalization, imports, metadata, CSS variables, and JavaScript syntax passed.`);
