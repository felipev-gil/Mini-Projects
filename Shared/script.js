// ==================================================
// THEME
// ==================================================

function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark";

  document.documentElement.setAttribute("data-theme", savedTheme);

  updateThemeIcon(savedTheme);

  themeButton?.addEventListener("click", toggleTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");

  const newTheme = currentTheme === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", newTheme);

  localStorage.setItem("theme", newTheme);

  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  if (!themeButton) {
    return;
  }

  themeButton.textContent = theme === "dark" ? "☀️" : "🌙";
}

// ==================================================
// SHARED COMPONENT PATH
// ==================================================

const sharedComponentBaseUrl = (() => {
  const currentScript =
    document.currentScript ||
    document.querySelector('script[src$="Shared/script.js"]');
  if (!currentScript?.src) {
    return new URL(".", window.location.href).href;
  }
  return new URL(".", currentScript.src).href;
})();

function shouldRewriteUrl(value) {
  if (!value || value.startsWith("#") || value.startsWith("//")) {
    return false;
  }
  return !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value);
}

function rewriteComponentUrls(fragment, baseUrl) {
  const elements = fragment.querySelectorAll("[href], [src]");
  elements.forEach((element) => {
    ["href", "src"].forEach((attr) => {
      const value = element.getAttribute(attr);
      if (shouldRewriteUrl(value)) {
        element.setAttribute(attr, new URL(value, baseUrl).href);
      }
    });
  });
}

function renderHeaderNav() {
  const nav =
    document.querySelector("#header-component .nav") ||
    document.querySelector("header .nav");
  if (!nav) {
    return;
  }

  const isProjectPage = window.location.pathname.includes("/Projects/");
  if (isProjectPage) {
    nav.innerHTML = `<a href="${new URL("../index.html#projects", sharedComponentBaseUrl).href}">Back to Portfolio</a>`;
  }
}

function ensureSharedStylesheet() {
  const existingLink = Array.from(
    document.head.querySelectorAll('link[rel="stylesheet"]'),
  ).find(
    (link) =>
      link.href.includes("/Shared/style.css") ||
      link.href.includes("Shared/style.css"),
  );

  if (!existingLink) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL("style.css", sharedComponentBaseUrl).href;
    document.head.appendChild(link);
  }
}

function loadSharedComponent(fileName, elementId, callback) {
  ensureSharedStylesheet();

  fetch(new URL(fileName, sharedComponentBaseUrl))
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error loading ${fileName}: ${response.status}`);
      }
      return response.text();
    })
    .then((data) => {
      const template = document.createElement("template");
      template.innerHTML = data.trim();
      rewriteComponentUrls(template.content, sharedComponentBaseUrl);

      const container = document.getElementById(elementId);
      if (!container) {
        throw new Error(`The item with id was not found ${elementId}`);
      }
      container.innerHTML = "";
      container.appendChild(template.content);
      callback?.();
    })
    .catch((error) => {
      console.error(error);
    });
}

// ==================================================
// HEADER COMPONENT
// ==================================================

loadSharedComponent("header.html", "header-component", () => {
  renderHeaderNav();
  themeButton = document.getElementById("theme-toggle");
  initTheme();

  setTimeout(scrollToHashTarget, 100);
});

// ==================================================
// FOOTER COMPONENT
// ==================================================

loadSharedComponent("footer.html", "footer-component");

// ==================================================
// HASH SCROLL FIX
// ==================================================

function scrollToHashTarget() {
  const hash = window.location.hash;
  if (!hash) {
    return;
  }

  const id = hash.substring(1);
  const target = document.getElementById(id);
  if (!target) {
    return;
  }

  const headerHeight = document.querySelector("header")?.offsetHeight || 0;
  const offset = headerHeight + 16;
  const top = target.getBoundingClientRect().top + window.pageYOffset - offset;

  window.scrollTo({ top, behavior: "auto" });
}

window.addEventListener("hashchange", scrollToHashTarget);
