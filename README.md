# Tako

Tako is a single-page marketing site for showcasing automation, Slack bots, and AI assistant services. Content for each section is stored in JSON files and loaded client-side to keep the layout flexible and easy to update.

## Features

- Responsive landing page built with semantic HTML and modern CSS.
- Client-side rendering of hero, pricing, marketplace, and footer sections from JSON data.
- Lightweight JavaScript utilities for data loading and DOM population.
- Structured content files (`data/content.json` and `data/tools.json`) that make it simple to update copy and featured tools without touching the markup.

## Project structure

- `index.html` – page template and section markup.
- `styles.css` – styling for the layout, typography, and components.
- `script.js` – fetches JSON content and injects it into the page.
- `data/` – JSON data powering the marketing copy and tool listings.
- `assets/` – static images and icons used throughout the site.

## Prerequisites

Tako is a static site, so there are no package dependencies. You only need a local web server to serve the files (required because the browser fetches JSON via `fetch`). Any of the following tools work:

- Python 3.8+
- Node.js 18+ (for using `npx` or installing a lightweight static server)

## Local installation

1. Clone the repository and change into the project directory:

   ```bash
   git clone https://github.com/your-org/tako.git
   cd tako
   ```

2. Start a local web server:

   **Option A: Python**

   ```bash
   python3 -m http.server 8000
   ```

   **Option B: Node.js (`npx`)**

   ```bash
   npx http-server -p 8000
   ```

   **Option C: Node.js (`serve`)**

   ```bash
   npm install --global serve
   serve -l 8000
   ```

3. Open your browser to [http://localhost:8000](http://localhost:8000). You should see the Tako landing page populated with data from the `data/` directory.

## Customizing content

- Edit `data/content.json` to tweak section headings, copy, pricing tiers, and contact details.
- Update `data/tools.json` to change the available tool listings in the marketplace grid.
- Add or replace images in the `assets/` directory to update the visuals used by the page.

After making changes, refresh the browser to see your updates reflected immediately.
