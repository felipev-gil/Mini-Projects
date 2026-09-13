(() => {
  "use strict";
  const { $, element } = Mini;

  const rules = [
    ["At least 8 characters", (v) => v.length >= 8],
    ["Lowercase letter", (v) => /[a-z]/.test(v)],
    ["Uppercase letter", (v) => /[A-Z]/.test(v)],
    ["Number", (v) => /[0-9]/.test(v)],
    ["Symbol", (v) => /[^a-z0-9\s]/i.test(v)],
  ];
  function update() {
    let score = 0;
    $("checks").replaceChildren(
      ...rules.map(([name, test]) => {
        const pass = test($("password").value);
        if (pass) score++;
        return element("li", (pass ? "✓ " : "○ ") + name);
      }),
    );
    $("score").textContent = score + " of 5 checks met";
    $("progress").style.width = score * 20 + "%";
  }
  $("password").addEventListener("input", update);
  $("toggle").addEventListener("click", () => {
    const show = $("password").type === "password";
    $("password").type = show ? "text" : "password";
    $("toggle").textContent = show ? "Hide password" : "Show password";
    $("toggle").setAttribute("aria-pressed", show);
  });
  update();
})();
