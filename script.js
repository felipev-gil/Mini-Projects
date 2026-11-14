(() => {
  "use strict";
  const grid = document.getElementById("grid");
  const featuredGrid = document.getElementById("featured-grid");
  const filters = document.getElementById("filters");
  const search = document.getElementById("search");
  const status = document.getElementById("catalog-status");
  const retry = document.getElementById("retry");
  const empty = document.getElementById("empty");
  let projects = [];
  let category = "All";
  function element(tag, className, text) {
    const node = document.createElement(tag);
    node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function createCard(project) {
    const card = element("a", "project-card");
    card.href = `./projects/${project.id}/index.html`;
    const top = element("div", "card-top");
    const emoji = element("span", "card-emoji", project.emoji || "◇");
    emoji.setAttribute("aria-hidden", "true");
    top.append(emoji, element("span", "tag", project.category));
    const bottom = element("div", "card-bottom");
    bottom.append(element("span", "card-open", "Open project →"));
    card.append(top, element("h3", "", project.title), element("p", "", project.description), bottom);
    return card;
  }
  function renderProjects() {
    const query = search.value.trim().toLocaleLowerCase();
    const visible = projects.filter((project) => (category === "All" || project.category === category)
      && [project.title, project.description, project.category, ...project.tags].join(" ").toLocaleLowerCase().includes(query));
    grid.replaceChildren(...visible.map(createCard));
    empty.hidden = visible.length > 0;
    status.textContent = `${visible.length} of ${projects.length} projects${category === "All" ? "" : ` in ${category}`}${query ? ` matching “${search.value.trim()}”` : ""}.`;
    filters.querySelectorAll("button").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.category === category)));
  }
  function renderFilters() {
    filters.replaceChildren();
    for (const name of ["All", ...new Set(projects.map((project) => project.category).sort())]) {
      const button = element("button", "chip", name);
      button.type = "button";
      button.dataset.category = name;
      button.addEventListener("click", () => { category = name; renderProjects(); });
      filters.append(button);
    }
  }
  function validateCatalog(data) {
    const ids = new Set();
    if (!Array.isArray(data)) throw new Error("Catalog must be an array.");
    for (const item of data) {
      if (!item || typeof item.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) || ids.has(item.id)
        || ![item.title, item.description, item.category].every((value) => typeof value === "string" && value.trim())
        || !Array.isArray(item.tags) || !item.tags.every((tag) => typeof tag === "string")
        || typeof item.featured !== "boolean" || (item.emoji !== undefined && typeof item.emoji !== "string")) throw new Error("Invalid project catalog entry.");
      ids.add(item.id);
    }
    return data;
  }
  async function loadProjects() {
    retry.hidden = true;
    search.disabled = true;
    grid.setAttribute("aria-busy", "true");
    featuredGrid.setAttribute("aria-busy", "true");
    status.textContent = "Loading projects…";
    const controller = new AbortController();
    const deadline = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch("./projects.json", { signal: controller.signal });
      if (!response.ok) throw new Error(`Catalog request failed (${response.status}).`);
      const data = validateCatalog(await response.json());
      // Featured order follows the catalog; the full collection is alphabetical.
      const featured = data.filter((project) => project.featured).slice(0, 6);
      featuredGrid.replaceChildren(...featured.map(createCard));
      document.getElementById("featured").hidden = featured.length === 0;
      projects = [...data].sort((a, b) => a.title.localeCompare(b.title));
      renderFilters();
      renderProjects();
      search.disabled = false;
    } catch (error) {
      status.textContent = "The collection could not be loaded. Please try again.";
      retry.hidden = false;
      console.warn(error.message);
    } finally {
      clearTimeout(deadline);
      grid.setAttribute("aria-busy", "false");
      featuredGrid.setAttribute("aria-busy", "false");
    }
  }
  search.addEventListener("input", renderProjects);
  document.getElementById("clear-filters").addEventListener("click", () => { search.value = ""; category = "All"; renderProjects(); search.focus(); });
  retry.addEventListener("click", loadProjects);
  loadProjects();
})();
