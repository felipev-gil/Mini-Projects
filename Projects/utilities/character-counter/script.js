(() => {
  "use strict";
  const { $, status } = Mini;

  $("text").addEventListener("input", () => {
    const length = $("text").value.length;
    $("count").textContent = length;
    $("progress").style.width = (length / 280) * 100 + "%";
    status(280 - length + " characters remaining.");
  });
})();
