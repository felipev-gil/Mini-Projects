import { $, element, status, requestJSON, image } from "../../shared/project-utils.js";

const request = requestJSON();
function search(query) {
 request("https://pokeapi.co/api/v2/pokemon/" + encodeURIComponent(query.toLowerCase()), data => {
  if (!data || typeof data.name !== "string" || !Number.isInteger(data.id)) throw new Error("The service returned an unexpected Pokémon response.");
  const card = element("article", "", "panel stack result-card");
  card.append(element("h2", "#" + data.id + " · " + data.name), image(data.sprites?.other?.["official-artwork"]?.front_default || data.sprites?.front_default, data.name, "portrait"));
  card.append(element("p", "Types: " + (data.types || []).map(item => item.type?.name).filter(Boolean).join(", ")));
  card.append(element("p", "Height: " + (data.height / 10) + " m · Weight: " + (data.weight / 10) + " kg"));
  (data.stats || []).forEach(item => card.append(element("p", (item.stat?.name || "Stat") + ": " + item.base_stat, "fact")));
  $("#result").replaceChildren(card); status("Showing " + data.name + ".");
 }, "No Pokémon found. Try its English name or a valid number.");
}
$("#search-form").addEventListener("submit", event => { event.preventDefault(); const query = $("#query").value.trim(); if (query) search(query); else status("Enter a name or number.", "error"); });
$("#random").addEventListener("click", () => { const id = String(1 + Math.floor(Math.random() * 151)); $("#query").value = id; search(id); });


