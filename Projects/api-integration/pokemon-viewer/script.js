(() => {
  "use strict";
  const { $, element, status, json, picture } = Mini;

  let busy = false;
  async function search() {
    if (busy) return;
    const query = $("query").value.trim().toLowerCase();
    if (!query) {
      status("Enter a Pokémon name or ID.");
      return;
    }
    busy = true;
    for (const button of $("search-form").querySelectorAll("button"))
      button.disabled = true;
    $("results").replaceChildren();
    status("Loading Pokémon…");
    try {
      const data = await json(
        "https://pokeapi.co/api/v2/pokemon/" + encodeURIComponent(query),
      );
      if (
        !data.name ||
        !Array.isArray(data.types) ||
        !Array.isArray(data.stats)
      )
        throw Error("No Pokémon data was returned.");
      const card = element("article", undefined, "panel");
      card.append(element("h2", data.name + " #" + data.id));
      const url =
        data.sprites?.other?.["official-artwork"]?.front_default ||
        data.sprites?.front_default;
      if (url) card.append(picture(url, data.name));
      card.append(
        element("p", "Types: " + data.types.map((t) => t.type.name).join(", ")),
      );
      for (const stat of data.stats.filter((s) =>
        ["hp", "attack", "defense", "speed"].includes(s.stat.name),
      ))
        card.append(element("p", stat.stat.name + ": " + stat.base_stat));
      $("results").append(card);
      status("Pokémon loaded.");
    } catch (error) {
      status(error.message);
    } finally {
      busy = false;
      for (const button of $("search-form").querySelectorAll("button"))
        button.disabled = false;
    }
  }
  $("search-form").addEventListener("submit", (event) => {
    event.preventDefault();
    search();
  });
  $("random").addEventListener("click", () => {
    $("query").value = 1 + Math.floor(Math.random() * 1025);
    search();
  });
  $("suggestions").addEventListener("click", (event) => {
    const button = event.target.closest("[data-name]");
    if (button) {
      $("query").value = button.dataset.name;
      search();
    }
  });
})();
