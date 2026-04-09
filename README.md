# Juyoung Kim Portfolio

A personal portfolio website built with React and Vite.

This site is designed as a clean research archive for publications, projects, activities, and personal notes.

- Live site: [wndudwkd003.github.io](https://wndudwkd003.github.io)
- Tech stack: React, Vite, React Router

## Project Structure

```text
src/
  components/
    layout/
      Layout.jsx          # global layout
      Layout.css          # main UI styling
    portfolio/
      ProjectCard.jsx     # project card component
  config/
    siteConfig.js         # site config and nav binding
  data/
    siteText.json         # editable text for Home to Other
    publications.js       # publication data
    projects.js           # project data
    awards.js             # activity and award data
  routes/
    HomePage.jsx
    PublicationsPage.jsx
    ProjectsPage.jsx
    AwardsPage.jsx
    OtherPage.jsx
  App.jsx
  main.jsx
  index.css
python-scripts/
  generate_thumbnails.py  # helper for image thumbnails
```

## Where To Edit

### Main text content

Edit [src/data/siteText.json](src/data/siteText.json)

This file controls:

- top navigation labels
- home title, intro, profile, interests, and photo path
- page titles and descriptions for `Projects`, `Publications`, `Activities`, and `Other`
- about / interests / timeline / contact content in `Other`

### Publications

Edit [src/data/publications.js](src/data/publications.js)

### Projects

Edit [src/data/projects.js](src/data/projects.js)

### Activities and awards

Edit [src/data/awards.js](src/data/awards.js)

### Layout and design

Edit [src/components/layout/Layout.css](src/components/layout/Layout.css)

This file controls most of the visual style including:

- header and navigation
- home hero and profile layout
- publications and projects spacing
- activities card layout and slider UI
- other page cards and timeline

## Photo Setup

The home photo is controlled in `src/data/siteText.json`.

Example:

```json
"photo": {
  "imagePath": "public\\52495773.png",
  "label": "Photo area",
  "copy": "A portrait, lab photo, or research-related image can live here later."
}
```

Rules:

- if `imagePath` is empty, the placeholder photo area is shown
- if `imagePath` has a valid path, the placeholder is replaced by a circular profile image
- files inside `public/` can be referenced with either `public\\file.png` or `public/file.png`

## Development

Install dependencies:

```bash
npm install
```

Run local development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Generate thumbnails:

```bash
npm run generate-thumbnails
```

## Editing Rules

- Keep shared text content in `src/data/siteText.json`
- Keep publications, projects, and activities in their own data files
- Prefer editing content data first before changing route components
- Use `Layout.css` for most style changes to keep the design consistent
- Keep the overall tone simple, clean, and minimal
- Avoid over-styling or adding unnecessary visual effects

## Notes

- The site uses `siteText.json` as the main text source for easy maintenance
- `siteConfig.js` reads navigation labels from `siteText.json`
- The portfolio is intended to stay easy to update without touching many files

---

</br>

Supported by ChatGPT 왜이리 똑똑한거야 GPT
