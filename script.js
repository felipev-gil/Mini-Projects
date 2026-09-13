(() => {
  let projects = [],
    category = "All";
  const search = document.getElementById("search");
  const filters = document.getElementById("filters");
  function card(project) {
    const link = document.createElement("a");
    link.className = "card";
    link.href = project.url;
    const info = document.createElement("div");
    info.className = "card-info";
    const title = document.createElement("h3");
    title.textContent = project.title;
    const emoji = document.createElement("span");
    emoji.className = "card-emoji";
    emoji.textContent = project.emoji;
    emoji.setAttribute("aria-hidden", "true");
    info.append(title, emoji);
    const description = document.createElement("p");
    description.textContent = project.description;
    const meta = document.createElement("div");
    meta.className = "card-meta";
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = project.category;
    const open = document.createElement("span");
    open.className = "card-link";
    open.textContent = "Open →";
    meta.append(tag, open);
    link.append(info, description);
    if (project.status) {
      const notice = document.createElement("p");
      notice.textContent = project.status;
      notice.className = "project-notice";
      link.append(notice);
    }
    link.append(meta);
    return link;
  }
  function render() {
    const query = search.value.trim().toLowerCase();
    const visible = projects.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        [p.title, p.description, p.category, ...p.tags]
          .join(" ")
          .toLowerCase()
          .includes(query),
    );
    document.getElementById("grid").replaceChildren(...visible.map(card));
    document.getElementById("empty").hidden = visible.length !== 0;
  }
  search.addEventListener("input", render);
  async function load() {
    try {
      const response = await fetch("./projects.json");
      if (!response.ok) throw new Error();
      projects = (await response.json()).sort((a, b) =>
        a.title.localeCompare(b.title),
      );
      document
        .getElementById("favorites-grid")
        .replaceChildren(...projects.filter((p) => p.favorite).map(card));
      const categories = [
        "All",
        "Utilities",
        "Data Persistence",
        "Games",
        "API Integration",
      ];
      for (const name of categories) {
        const button = document.createElement("button");
        button.className = "chip";
        button.textContent = name;
        button.setAttribute("aria-pressed", name === category);
        button.addEventListener("click", () => {
          category = name;
          for (const chip of filters.children)
            chip.setAttribute("aria-pressed", chip === button);
          render();
        });
        filters.append(button);
      }
      render();
      // Favorites change the page height after fetch; restore an incoming section link.
      if (location.hash) {
        document.getElementById(location.hash.slice(1))?.scrollIntoView();
      }
    } catch {
      const empty = document.getElementById("empty");
      empty.hidden = false;
      empty.textContent =
        "The catalog could not load. Refresh the page. For local use, start a static server as described in the README.";
    }
  }
  load();
})();
