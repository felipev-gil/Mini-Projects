export const $ = (selector) => document.querySelector(selector);
export function element(tag, text = "", className = "") {
  const node = document.createElement(tag);
  node.textContent = String(text ?? "");
  node.className = className;
  return node;
}
export function status(message, tone = "") {
  const node = $("#status");
  node.textContent = message;
  node.dataset.tone = tone;
}
export function safeURL(value) {
  try { const url = new URL(value); return url.protocol === "https:" ? url.href : null; }
  catch { return null; }
}
export function link(label, url) {
  const href = safeURL(url);
  const node = element(href ? "a" : "span", label);
  if (href) { node.href = href; node.target = "_blank"; node.rel = "noopener noreferrer"; }
  return node;
}
export function image(url, alt, className = "media") {
  const node = document.createElement("img");
  node.alt = alt;
  node.className = className;
  node.loading = "lazy";
  node.referrerPolicy = "no-referrer";
  const href = safeURL(url);
  node.addEventListener("error", () => node.replaceWith(element("p", "Image unavailable: " + alt, "help-text")), { once: true });
  if (href) node.src = href;
  else return element("p", "Image unavailable: " + alt, "help-text");
  return node;
}
// Each app owns a request runner. Replaced requests cannot overwrite newer results.
export function requestJSON() {
  let controller, version = 0;
  return async (url, render, emptyMessage = "No results found. Try a different search.") => {
    controller?.abort();
    controller = new AbortController();
    const signal = controller.signal;
    const current = ++version;
    const target = $("#result");
    target?.replaceChildren();
    target?.setAttribute("aria-busy", "true");
    status("Loading…");
    const controllerForRequest = controller;
    const timer = setTimeout(() => controllerForRequest.abort(), 12000);
    try {
      const response = await fetch(url, { signal, referrerPolicy: "no-referrer" });
      if (current !== version) return;
      if (response.status === 404) throw new Error(emptyMessage);
      if (response.status === 403 || response.status === 429) throw new Error("The service is limiting requests. Please try again later.");
      if (!response.ok) throw new Error("The service is unavailable. Please try again.");
      const data = await response.json();
      if (current !== version) return;
      status("");
      render(data);
    } catch (error) {
      if (current !== version) return;
      target?.replaceChildren();
      status(signal.aborted ? "The request timed out. Please try again." : (error instanceof TypeError ? "Could not connect. Check your connection and try again." : error.message), "error");
    } finally {
      clearTimeout(timer);
      if (current === version) target?.setAttribute("aria-busy", "false");
    }
  };
}
export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); status("Copied to clipboard.", "success"); }
  catch { status("Clipboard access is unavailable. Select the text and copy it manually.", "error"); }
}



