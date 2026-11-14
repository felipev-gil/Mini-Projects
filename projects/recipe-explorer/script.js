import { $, element, status, requestJSON, image, link } from "../../shared/project-utils.js";

import { ingredients } from "./logic.mjs";
const request = requestJSON(), base = "https://www.themealdb.com/api/json/v1/1/";
function detail(meal, returnButton) {
 const dialog = element("section", "", "panel stack result-card");
 const heading = element("h2", meal.strMeal); heading.tabIndex = -1;
 dialog.append(heading, image(meal.strMealThumb, meal.strMeal), element("p", [meal.strArea,meal.strCategory].filter(Boolean).join(" · ")), element("h3", "Ingredients"));
 const list = element("ul"); ingredients(meal).forEach(value => list.append(element("li",value))); dialog.append(list);
 dialog.append(element("h3", "Instructions"), element("p", meal.strInstructions || "No instructions provided.", "preserve-lines"));
 if (meal.strSource) dialog.append(link("Original recipe (opens in a new tab)", meal.strSource));
 if (meal.strYoutube) dialog.append(link("Watch recipe video (opens in a new tab)", meal.strYoutube));
 if (returnButton) {
 const close = element("button", "Close recipe");
 close.addEventListener("click", () => { dialog.remove(); returnButton.focus(); });
 dialog.append(close);
 }
 $("#recipe-detail")?.remove(); dialog.id = "recipe-detail"; $("#result").prepend(dialog); heading.focus();
}
function render(data, random = false) {
 if (data?.meals !== null && !Array.isArray(data?.meals)) throw new Error("The service returned an unexpected recipe response.");
 const meals = (data.meals || []).filter(meal => typeof meal.strMeal === "string" && meal.idMeal);
 if (random && meals.length) {
  $("#result").replaceChildren();
  detail(meals[0]);
  status("Random recipe ready: " + meals[0].strMeal + ".");
  return;
 }
 const grid = element("div", "", "result-grid");
 for (const meal of meals) {
  const card = element("article", "", "panel stack result-card"), button = element("button", "View recipe");
  button.setAttribute("aria-label", "View recipe: " + meal.strMeal);
  button.addEventListener("click", () => detail(meal, button));
  card.append(image(meal.strMealThumb, meal.strMeal), element("h2", meal.strMeal), button); grid.append(card);
 }
 $("#result").replaceChildren(grid);
 status(meals.length ? "Recipes found: " + meals.length + "." : "No recipes found. Try a different meal name.");

}
$("#search-form").addEventListener("submit", event => { event.preventDefault(); const query = $("#query").value.trim(); if (query) request(base + "search.php?s=" + encodeURIComponent(query), render); else status("Enter a meal name.", "error"); });
$("#random").addEventListener("click", () => request(base + "random.php", data => render(data, true)));




