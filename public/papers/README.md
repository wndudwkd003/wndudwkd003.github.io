# Publication detail folders

Each publication loads its expanded content from a folder whose name matches the publication `id` in `src/data/publications.js`.

```text
public/papers/
  int-journal-2026-001/
    details.json
    images/
      a1.png
      a2.webp
```

The page requests `public/papers/{publication-id}/details.json` when the publication is expanded. Existing `publication.details` data remains available as a fallback when no folder JSON exists.

## Automatic images

Images do not need to be listed in `details.json`. Put them in the paper's `images` folder and name them `a{number}`:

- `a1.png`
- `a2.jpg`
- `a3.webp`
- `a4.gif`

AVIF, GIF, JPEG/JPG, PNG, and WebP are supported. Images are discovered at development/build time and displayed in numeric order, so `a10` appears after `a9`. Restart the development server if a newly added image does not appear immediately.

Generate 1080-pixel-wide WebP thumbnails with:

```bash
python python-scripts/generate_thumbnails.py --scope publications
```

Generated files are stored under `images/thumbnail/`. The publication carousel loads a generated thumbnail first and falls back to the original image if necessary.

## details.json

```json
{
    "labels": {
        "overview": "Research Overview",
        "contributions": "Key Contributions",
        "materials": "Figures"
    },
    "overview": "Short overview of the paper.",
    "contributions": [
        "First contribution.",
        "Second contribution."
    ],
    "sections": [
        {
            "title": "Method",
            "paragraphs": ["Paragraph text."],
            "bullets": ["Optional bullet item."]
        }
    ]
}
```
