(() => {
  "use strict";
  const { $, element, status, json, picture, safeUrl } = Mini;

  let page = 0,
    busy = false;
  async function load(shuffle) {
    if (busy) return;
    busy = true;
    $("shuffle").disabled = true;
    $("more").disabled = true;
    let next = page + 1;
    if (shuffle) {
      do {
        next = 1 + Math.floor(Math.random() * 30);
      } while (next === page);
    }
    status("Loading photos…");
    try {
      const images = await json(
        "https://picsum.photos/v2/list?page=" + next + "&limit=12",
      );
      if (!Array.isArray(images))
        throw Error("The image service returned an unexpected response.");
      if (shuffle) $("images").replaceChildren();
      for (const image of images) {
        const card = element("article", undefined, "result-card");
        card.append(
          picture(
            "https://picsum.photos/id/" +
              encodeURIComponent(image.id) +
              "/600/400",
            "Photo by " + image.author,
          ),
        );
        const link = element("a", "Photo by " + image.author);
        const url = safeUrl(image.url);
        if (url) {
          link.href = url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        }
        card.append(link);
        $("images").append(card);
      }
      if (images.length) page = next;
      status(
        images.length
          ? "Loaded " + images.length + " photos."
          : "No more images found. Try Shuffle images.",
      );
    } catch (error) {
      status(error.message);
    } finally {
      busy = false;
      $("shuffle").disabled = false;
      $("more").disabled = false;
    }
  }
  $("shuffle").addEventListener("click", () => load(true));
  $("more").addEventListener("click", () => load(false));
})();
