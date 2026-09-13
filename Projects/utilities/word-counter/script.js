(() => {
  "use strict";
  const { $ } = Mini;

  function count() {
    const text = $("text").value;
    $("words").textContent = (
      text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) || []
    ).length;
    $("letters").textContent = (text.match(/\p{L}/gu) || []).length;
    $("spaces").textContent = (text.match(/\s/gu) || []).length;
  }
  $("text").addEventListener("input", count);
})();
