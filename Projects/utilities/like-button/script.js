(() => {
  "use strict";
  const { $, status } = Mini;

  $("heart").addEventListener("click", () => {
    const liked = $("heart").getAttribute("aria-pressed") !== "true";
    $("heart").setAttribute("aria-pressed", liked);
    $("heart").setAttribute(
      "aria-label",
      liked ? "Unlike this demo" : "Like this demo",
    );
    $("heart").textContent = liked ? "♥" : "♡";
    status(liked ? "Liked." : "Like removed.");
  });
})();
