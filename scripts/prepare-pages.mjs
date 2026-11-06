import { copyFile, mkdir } from "node:fs/promises";

const output = new URL("../docs/", import.meta.url);
const entry = new URL("index.html", output);

// GitHub Pages serves these files for direct visits and browser refreshes.
// Keep this list in sync with the routes in src/App.jsx.
for (const route of ["publications", "awards", "other", "hidden"]) {
    const directory = new URL(`${route}/`, output);
    await mkdir(directory, { recursive: true });
    await copyFile(entry, new URL("index.html", directory));
}
