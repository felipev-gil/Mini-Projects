import { $, element, status, requestJSON } from "../../shared/project-utils.js";

import { findCountries } from "./logic.mjs";
let countries;
const request = requestJSON();
function show(query) {
 const matches = findCountries(countries, query);
 $("#result").replaceChildren(...matches.map(country => {
  const card = element("article", "", "panel result-card");
  card.append(element("h2", country.flag + " " + country.name));
  for (const [label, value] of Object.entries({ "Official name": country.official, Capital: country.capital.join(", "), Region: country.region, Currencies: country.currencies.join(", "), Languages: country.languages.join(", ") })) card.append(element("p", label + ": " + (value || "Not listed"), "fact"));
  return card;
 }));
 status(matches.length ? matches.length + " matching countries or territories." : "No matches. Try another country name or two-letter code.");
}
$("#search-form").addEventListener("submit", event => {
 event.preventDefault(); const query = $("#query").value.trim();
 if (!query) return status("Enter a country name or code.", "error");
 if (countries) show(query);
 else request("./data/countries.json", data => { if (!Array.isArray(data)) throw new Error("The country dataset could not be read."); countries = data; show(query); });
});


