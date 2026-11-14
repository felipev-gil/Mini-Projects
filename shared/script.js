(() => {
  "use strict";
  const sharedUrl = new URL(".", document.currentScript.src);
  const homeUrl = new URL("../index.html", sharedUrl);
  const storageKey = "mini-projects:theme:v1";
  const preference = window.matchMedia("(prefers-color-scheme: dark)");
  let explicitTheme = false;
  let themeButton;
  try {
    const saved = localStorage.getItem(storageKey) || localStorage.getItem("theme");
    explicitTheme = saved === "light" || saved === "dark";
    document.documentElement.dataset.theme = explicitTheme ? saved : preference.matches ? "dark" : "light";
  } catch {
    document.documentElement.dataset.theme = preference.matches ? "dark" : "light";
  }
  function updateThemeButton() {
    if (!themeButton) return;
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    themeButton.textContent = next === "light" ? "☀ Light mode" : "☾ Dark mode";
    themeButton.setAttribute("aria-label", `Switch to ${next} mode`);
  }
  preference.addEventListener("change", () => {
    if (!explicitTheme) {
      document.documentElement.dataset.theme = preference.matches ? "dark" : "light";
      updateThemeButton();
    }
  });
  async function loadComponent(file, id) {
    const container = document.getElementById(id);
    if (!container) return false;
    const controller = new AbortController();
    const deadline = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(new URL(file, sharedUrl), { signal: controller.signal });
      if (!response.ok) throw new Error(`Could not load ${file}`);
      const template = document.createElement("template");
      template.innerHTML = await response.text(); // Trusted, local HTML fragments only.
      template.content.querySelectorAll("[href], [src]").forEach((element) => {
        for (const attribute of ["href", "src"]) {
          const value = element.getAttribute(attribute);
          if (value && !value.startsWith("#")) element.setAttribute(attribute, new URL(value, sharedUrl).href);
        }
      });
      container.replaceChildren(template.content);
      return true;
    } catch (error) {
      console.warn(error.message); // Preserve the useful static fallback.
      return false;
    } finally { clearTimeout(deadline); }
  }
  async function initialize() {
    await Promise.all([
      loadComponent("header.html", "header-component").then((loaded) => {
        if (!loaded) return;
        const nav = document.querySelector(".site-nav");
        if (document.body.dataset.page === "project") {
          const back = document.createElement("a");
          back.href = `${homeUrl.href}#projects`;
          back.textContent = "← All projects";
          nav.replaceChildren(back);
        }
        themeButton = document.getElementById("theme-toggle");
        updateThemeButton();
        themeButton.addEventListener("click", () => {
          explicitTheme = true;
          const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
          document.documentElement.dataset.theme = theme;
          try { localStorage.setItem(storageKey, theme); } catch { /* Still works for this page. */ }
          updateThemeButton();
        });
        const header = document.getElementById("header-component");
        const measure = () => document.documentElement.style.setProperty("--header-height", `${header.offsetHeight}px`);
        measure();
        new ResizeObserver(measure).observe(header);
      }),
      loadComponent("footer.html", "footer-component").then(() => {
        const year = document.getElementById("year");
        if (year) year.textContent = new Date().getFullYear();
      }),
    ]);
    if (location.hash) {
      try { document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ behavior: "instant" }); }
      catch { /* Invalid fragments must not prevent navigation. */ }
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
