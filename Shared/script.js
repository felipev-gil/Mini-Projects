(() => {
  const root = new URL("../", document.currentScript.src);
  let theme = "dark";
  try {
    theme = localStorage.getItem("theme") === "light" ? "light" : "dark";
  } catch {}
  document.documentElement.dataset.theme = theme;
  function initialize() {
    const header = document.getElementById("header-component");
    const footer = document.getElementById("footer-component");
    if (header) {
      header.innerHTML =
        '<header class="site-header"><a class="skip-link" href="#main">Skip to content</a><div class="site-header-inner"><a class="site-brand"><img width="56" height="56" alt=""/><span>Mini Projects</span></a><nav aria-label="Main navigation"></nav><button id="theme-toggle" type="button"></button></div></header>';
      header.querySelector(".site-brand").href = new URL("index.html", root);
      header.querySelector("img").src = new URL("Assets/logo.svg", root);
      const nav = header.querySelector("nav");
      const links = document.body.classList.contains("portfolio")
        ? [
            ["About", "about"],
            ["Favorites", "favorites"],
            ["Projects", "projects"],
            ["Contact", "contact"],
          ]
        : [["← Back to Portfolio", "projects"]];
      for (const [title, hash] of links) {
        const link = document.createElement("a");
        link.textContent = title;
        link.href = new URL("index.html#" + hash, root);
        nav.append(link);
      }
      const button = header.querySelector("button");
      function updateButton() {
        button.textContent = theme === "dark" ? "☀ Light" : "☾ Dark";
        button.setAttribute(
          "aria-label",
          "Switch to " + (theme === "dark" ? "light" : "dark") + " theme",
        );
      }
      button.addEventListener("click", () => {
        theme = theme === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = theme;
        try {
          localStorage.setItem("theme", theme);
        } catch {}
        updateButton();
      });
      updateButton();
    }
    if (footer) {
      const p = document.createElement("p");
      p.textContent =
        "© " +
        new Date().getFullYear() +
        " Felipe · Built with HTML, CSS & JavaScript";
      footer.replaceChildren(p);
    }
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
})();
