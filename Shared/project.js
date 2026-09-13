/* Small DOM and request helpers shared only by the integrated demos. */
window.Mini = (() => {
  const $ = (id) => document.getElementById(id);
  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function status(message) {
    $("status").textContent = message;
  }
  function safeUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" ? url.href : "";
    } catch {
      return "";
    }
  }
  function picture(url, alt) {
    const img = element("img");
    img.alt = alt;
    img.loading = "lazy";
    const safe = safeUrl(url);
    if (safe) img.src = safe;
    img.addEventListener("error", () => {
      img.replaceWith(element("p", "Image unavailable: " + alt));
    });
    return img;
  }
  async function json(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (response.status === 404)
        throw new Error("No results found. Try another search.");
      if (response.status === 429 || response.status === 403)
        throw new Error(
          "The service is limiting requests. Please try again later.",
        );
      if (!response.ok)
        throw new Error(
          "The service returned HTTP " +
            response.status +
            ". Please try again.",
        );
      return await response.json();
    } catch (error) {
      if (error.name === "AbortError")
        throw new Error("The request timed out. Please try again.");
      if (error instanceof TypeError)
        throw new Error(
          "Could not reach the service. Check your connection and try again.",
        );
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      status("Copied to clipboard.");
    } catch {
      status("Clipboard unavailable. Select the text and copy it manually.");
    }
  }
  function mealCard(meal) {
    const card = element("article", undefined, "panel");
    card.append(
      element("h2", meal.strMeal),
      picture(meal.strMealThumb, meal.strMeal),
    );
    card.append(
      element(
        "p",
        [meal.strCategory, meal.strArea].filter(Boolean).join(" · "),
      ),
    );
    const ingredients = element("ul");
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal["strIngredient" + i];
      if (typeof ingredient === "string" && ingredient.trim())
        ingredients.append(
          element(
            "li",
            ((meal["strMeasure" + i] || "") + " " + ingredient).trim(),
          ),
        );
    }
    card.append(
      element("h3", "Ingredients"),
      ingredients,
      element("h3", "Instructions"),
      element(
        "p",
        meal.strInstructions || "No instructions provided.",
        "formatted",
      ),
    );
    const video = safeUrl(meal.strYoutube);
    if (
      video &&
      ["www.youtube.com", "youtube.com", "youtu.be"].includes(
        new URL(video).hostname,
      )
    ) {
      const link = element("a", "Watch recipe video");
      link.href = video;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      card.append(link);
    }
    return card;
  }
  return { $, element, status, safeUrl, picture, json, copy, mealCard };
})();
