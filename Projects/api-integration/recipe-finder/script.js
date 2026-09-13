(() => {
  "use strict";
  const { $, element, status, json, picture } = Mini;

  let busy = false,
    lastButton = null;
  function lock(value) {
    busy = value;
    $("search").disabled = value;
    for (const button of $("results").querySelectorAll("button"))
      button.disabled = value;
  }
  $("search-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy) return;
    const query = $("query").value.trim();
    if (!query) {
      status("Enter a meal name.");
      return;
    }
    lock(true);
    $("results").replaceChildren();
    $("results").hidden = false;
    $("details").hidden = true;
    status("Loading recipes…");
    try {
      const data = await json(
        "https://www.themealdb.com/api/json/v1/1/search.php?s=" +
          encodeURIComponent(query),
      );
      if (data.meals === null || data.meals?.length === 0) {
        status("No recipes found. Try another meal name.");
        return;
      }
      if (!Array.isArray(data.meals))
        throw Error("The recipe service returned an unexpected response.");
      for (const meal of data.meals) {
        const card = element("article", undefined, "result-card");
        card.append(
          picture(meal.strMealThumb, meal.strMeal),
          element("h2", meal.strMeal),
          element("p", meal.strCategory || "Uncategorized"),
        );
        const button = element("button", "View recipe");
        button.setAttribute("aria-label", "View recipe: " + meal.strMeal);
        button.addEventListener("click", () => details(meal.idMeal, button));
        card.append(button);
        $("results").append(card);
      }
      status(data.meals.length + " recipes found.");
    } catch (error) {
      status(error.message);
    } finally {
      lock(false);
    }
  });
  async function details(id, button) {
    if (busy) return;
    lastButton = button;
    lock(true);
    status("Loading recipe details…");
    try {
      const data = await json(
        "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" +
          encodeURIComponent(id),
      );
      if (!data.meals?.[0]?.strMeal)
        throw Error("Recipe details were not found. Try another recipe.");
      $("meal").replaceChildren(Mini.mealCard(data.meals[0]));
      $("results").hidden = true;
      $("details").hidden = false;
      $("details").focus();
      status("Recipe loaded.");
    } catch (error) {
      status(error.message);
    } finally {
      lock(false);
    }
  }
  $("back").addEventListener("click", () => {
    $("details").hidden = true;
    $("results").hidden = false;
    lastButton?.focus();
    status("Back to search results.");
  });
})();
