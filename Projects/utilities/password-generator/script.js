(() => {
  "use strict";
  const { $, status, copy } = Mini;

  const groups = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?/",
  };
  function randomIndex(max) {
    const value = new Uint32Array(1);
    const limit = Math.floor(4294967296 / max) * max;
    do {
      crypto.getRandomValues(value);
    } while (value[0] >= limit);
    return value[0] % max;
  }
  function generate() {
    const selected = Object.entries(groups)
      .filter(([id]) => $(id).checked)
      .map(([, chars]) => chars);
    const length = Number($("length").value);
    if (!selected.length) {
      $("password").value = "";
      status("Select at least one character group.");
      return;
    }
    if (
      !Number.isInteger(length) ||
      length < selected.length ||
      length < 6 ||
      length > 64
    ) {
      status("Choose a length from 6 to 64.");
      return;
    }
    // Reject whole candidates missing a selected group: uniform over passwords satisfying the choices.
    const pool = selected.join("");
    let password;
    do {
      password = Array.from(
        { length },
        () => pool[randomIndex(pool.length)],
      ).join("");
    } while (
      !selected.every((chars) => [...password].some((c) => chars.includes(c)))
    );
    $("password").value = password;
    status("Generated " + length + " characters.");
  }
  $("length").addEventListener(
    "input",
    () => ($("length-value").textContent = $("length").value),
  );
  $("generate").addEventListener("click", generate);
  $("copy").addEventListener("click", () => {
    if ($("password").value) copy($("password").value);
  });
  generate();
})();
