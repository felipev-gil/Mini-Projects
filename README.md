# Mini Projects Portfolio

A curated collection of frontend projects built with HTML, CSS, and JavaScript.

This repository serves as both a learning playground and a portfolio, showcasing practical applications of modern web development concepts such as DOM manipulation, API consumption, local storage management, responsive design, and interactive user interfaces.

## Live Demo

LINK

---

## Features

- Responsive design for desktop, tablet, and mobile devices
- Dark and light mode with theme persistence
- Dynamic project rendering using JSON data
- Search functionality
- Category filtering
- Modular project organization
- Easy project registration and maintenance

---

## Project Categories

### API Integration

Projects that consume third-party APIs and display dynamic data.

Examples:

- Currency Converter
- Weather App
- Cryptocurrency Tracker

### Data Persistence

Projects that store and retrieve data from local storage.

Examples:

- Todo App
- Notes App
- Expense Tracker

### Games

Interactive browser-based games.

Examples:

- Sudoku
- Tic Tac Toe
- Memory Game

### Utilities

Small productivity and utility applications.

Examples:

- Password Generator
- Calculator
- Unit Converter

---

## Technologies Used

- HTML
- CSS
- JavaScript
- REST APIs
- Responsive Design Principles

---

## Folder Structure

```text
Mini-Projects/
│
├── index.html
├── style.css
├── script.js
├── projects.json
│
├── Assets/
│
└── Projects/
    ├── Api Integration/
    ├── Data Persistence/
    ├── Games/
    └── Utilities/
```

---

## Running Locally

Clone the repository:

```bash
git clone <repository-url>
```

Navigate to the project folder:

```bash
cd mini-projects
```

Open the project with Live Server or any static web server.

---

## Adding a New Project

1. Create a new project folder inside the appropriate category.
2. Include:

```text
index.html
style.css
script.js
README.md
```

3. Add a new entry to:

```text
projects.json
```

Example:

```json
{
  "title": "Weather App",
  "description": "Check current weather conditions using a public API.",
  "category": "API Integration",
  "emoji": "🌤️",
  "url": "Projects/API Integration/weather-app/index.html",
  "tags": ["api", "weather"]
}
```

The landing page will automatically display the new project.

---

## License

MIT
