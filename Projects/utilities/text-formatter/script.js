(() => {
  "use strict";
  const { $, copy } = Mini;

  const preview = $("preview");
  $("text").addEventListener(
    "input",
    () => (preview.textContent = $("text").value),
  );
  $("format-0").addEventListener(
    "click",
    () => (preview.textContent = preview.textContent.toUpperCase()),
  );
  $("format-1").addEventListener(
    "click",
    () => (preview.textContent = preview.textContent.toLowerCase()),
  );
  $("format-2").addEventListener("click", () => {
    const text = preview.textContent.toLowerCase();
    preview.textContent = text.replace(/\p{L}/u, (c) => c.toUpperCase());
  });
  [
    ["fontWeight", "bold"],
    ["fontStyle", "italic"],
    ["textDecoration", "underline"],
  ].forEach(([property, value], i) => {
    const button = $("format-" + (i + 3));
    button.addEventListener("click", () => {
      const active = button.getAttribute("aria-pressed") !== "true";
      button.setAttribute("aria-pressed", active);
      preview.style[property] = active ? value : "";
    });
  });
  $("format-6").addEventListener("click", () => {
    preview.textContent = $("text").value;
    preview.removeAttribute("style");
    for (let i = 3; i <= 5; i++)
      $("format-" + i).setAttribute("aria-pressed", "false");
  });
  $("copy").addEventListener("click", () => copy(preview.textContent));
})();
