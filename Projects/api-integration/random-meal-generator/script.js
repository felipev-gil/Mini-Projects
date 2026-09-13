(() => {
  "use strict";
  const { $, status, json } = Mini;

  let busy = false;
  $("generate").addEventListener("click", async () => {
    if (busy) return;
    busy = true;
    $("generate").disabled = true;
    $("result").replaceChildren();
    status("Loading meal…");
    try {
      const data = await json(
        "https://www.themealdb.com/api/json/v1/1/random.php",
      );
      if (!data.meals?.length) {
        status("No meals returned. Try again.");
        return;
      }
      if (!data.meals[0].strMeal)
        throw Error("The service returned an incomplete meal.");
      $("result").append(Mini.mealCard(data.meals[0]));
      status("Meal loaded.");
    } catch (error) {
      status(error.message);
    } finally {
      busy = false;
      $("generate").disabled = false;
    }
  });
})();
