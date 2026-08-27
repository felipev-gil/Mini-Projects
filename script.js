// ==================================================
// ELEMENTS
// ==================================================

const favorites = document.getElementById("favorites");
const grid = document.getElementById("grid");
const filtersEl = document.getElementById("filters");
const searchEl = document.getElementById("search");
const emptyEl = document.getElementById("empty");
let themeButton = null;

// ==================================================
// STATE
// ==================================================

let projects = [];
let activeCategory = "All";
let query = "";

// ==================================================
// INIT
// ==================================================

document.addEventListener("DOMContentLoaded", () => {
  initProjects();
  setCurrentYear();
});

// ==================================================
// PROJECTS
// ==================================================

function initProjects() {
  searchEl?.addEventListener("input", handleSearch);

  loadProjects();
}

function setCurrentYear() {
  const yearElement = document.getElementById("year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

function handleSearch(event) {
  query = event.target.value;

  renderProjects();
}

async function loadProjects() {
  try {
    const response = await fetch("./projects.json");

    if (!response.ok) {
      throw new Error("Failed to load projects.");
    }

    projects = await response.json();

    projects = projects.sort((a, b) =>
      a.title.localeCompare(b.title, undefined, {
        sensitivity: "base",
        numeric: true,
      }),
    );

    renderFilters();
    renderProjects();
  } catch (error) {
    console.error("Error loading projects:", error);

    grid.innerHTML = `
      <p class="empty">
        Unable to load projects.
      </p>
    `;
  }
}

// ==================================================
// FILTERS
// ==================================================

function renderFilters() {
  const categories = [
    "All",
    ...new Set(projects.map((project) => project.category)),
  ];

  filtersEl.innerHTML = "";

  categories.forEach((category) => {
    const button = document.createElement("button");

    button.className = category === activeCategory ? "chip active" : "chip";

    button.textContent = category;

    button.addEventListener("click", () => {
      activeCategory = category;

      renderFilters();
      renderProjects();
    });

    filtersEl.appendChild(button);
  });
}

// ==================================================
// PROJECT RENDERING
// ==================================================

function renderProjects() {
  const searchQuery = query.trim().toLowerCase();

  const filteredProjects = projects.filter((project) => {
    const categoryMatch =
      activeCategory === "All" || project.category === activeCategory;

    if (!categoryMatch) {
      return false;
    }

    if (!searchQuery) {
      return true;
    }

    const searchableText = [
      project.title,
      project.description,
      project.category,
      ...(project.tags || []),
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(searchQuery);
  });

  filteredProjects.sort((a, b) =>
    a.title.localeCompare(b.title, undefined, {
      sensitivity: "base",
      numeric: true,
    }),
  );

  grid.innerHTML = "";

  emptyEl.hidden = filteredProjects.length !== 0;

  filteredProjects.forEach((project) => {
    const card = document.createElement("a");

    card.className = "card";

    card.href = project.url;

    card.target = "_self";

    card.innerHTML = `
      <div class="card-info">
      
        <h3>
          ${project.title}
        </h3>
        
        <div class="card-emoji">
          ${project.emoji || "📁"}
        </div>

      </div>

      <p>
        ${project.description}
      </p>

      <div class="card-meta">

        <span class="tag">
          ${project.category}
        </span>

        <span class="card-link">
          Open →
        </span>

      </div>
    `;

    grid.appendChild(card);
  });
}
