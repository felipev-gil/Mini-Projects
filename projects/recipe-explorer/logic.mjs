export function ingredients(meal) {
 const result = [];
 for (let index = 1; index <= 20; index++) {
  const ingredient = meal["strIngredient" + index];
  if (typeof ingredient === "string" && ingredient.trim()) {
   const measure = meal["strMeasure" + index];
   result.push([typeof measure === "string" ? measure.trim() : "", ingredient.trim()].filter(Boolean).join(" "));
  }
 }
 return result;
}

