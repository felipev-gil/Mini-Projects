(() => {
  "use strict";
  const { $, element, status, json } = Mini;

  let busy = false;
  $("search-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy) return;
    const query = $("query").value.trim();
    if (!query) {
      status("Enter a country name.");
      return;
    }
    busy = true;
    $("search").disabled = true;
    $("results").replaceChildren();
    status("Loading countries…");
    try {
      const countries = await json(
        "https://restcountries.com/v3.1/name/" + encodeURIComponent(query),
      );
      if (!Array.isArray(countries))
        throw Error("The service returned an unexpected response.");
      for (const country of countries) {
        const card = element("article", undefined, "result-card");
        card.append(
          element(
            "h2",
            (country.flag || "") +
              " " +
              (country.name?.common || "Unnamed country"),
          ),
        );
        const values = {
          Capital: country.capital?.join(", "),
          Region: country.region,
          Population: Number.isFinite(country.population)
            ? country.population.toLocaleString()
            : "Unavailable",
          Currencies: Object.values(country.currencies || {})
            .map((c) => c.name)
            .join(", "),
          Languages: Object.values(country.languages || {}).join(", "),
        };
        for (const [label, value] of Object.entries(values))
          card.append(element("p", label + ": " + (value || "Unavailable")));
        $("results").append(card);
      }
      status(
        countries.length
          ? countries.length + " countries found."
          : "No countries found. Try another name.",
      );
    } catch (error) {
      status(error.message);
    } finally {
      busy = false;
      $("search").disabled = false;
    }
  });
})();
