(() => {
  "use strict";
  const { $, element, status } = Mini;

  let style = "lorelei",
    busy = false,
    timer;
  function generate() {
    if (busy) return;
    busy = true;
    const seed = $("seed").value.trim() || Math.random().toString(36).slice(2);
    $("seed").value = seed;
    for (const button of $("avatar-form").querySelectorAll("button"))
      button.disabled = true;
    $("result").replaceChildren();
    status("Loading avatar…");
    const img = element("img");
    img.alt = style + " avatar for " + seed;
    function finish(message) {
      clearTimeout(timer);
      busy = false;
      for (const button of $("avatar-form").querySelectorAll("button"))
        button.disabled = false;
      status(message);
    }
    img.onload = () =>
      finish("Avatar ready. Use the same seed and style to recreate it.");
    img.onerror = () => {
      img.remove();
      finish("The avatar service could not load this image. Try again.");
    };
    timer = setTimeout(() => {
      img.onload = null;
      img.onerror = null;
      img.removeAttribute("src");
      img.remove();
      finish("The avatar request timed out. Try again.");
    }, 12000);
    img.src =
      "https://api.dicebear.com/9.x/" +
      style +
      "/svg?seed=" +
      encodeURIComponent(seed);
    $("result").append(img);
  }
  $("avatar-form").addEventListener("submit", (event) => {
    event.preventDefault();
    generate();
  });
  $("styles").addEventListener("click", (event) => {
    const button = event.target.closest("[data-style]");
    if (!button || busy) return;
    style = button.dataset.style;
    for (const child of $("styles").children)
      child.setAttribute("aria-pressed", child === button);
    generate();
  });
  window.addEventListener("pagehide", () => clearTimeout(timer));
})();
