# Thumbnail Scripts

`generate_thumbnails.py` creates missing thumbnails inside each award folder's `thumbnail` directory.

## Install

```bash
python -m pip install -r python-scripts/requirements.txt
```

## Run

```bash
python python-scripts/generate_thumbnails.py
```

Optional:

```bash
python python-scripts/generate_thumbnails.py --format webp --max-width 1080 --overwrite
```

The site loads committed files from `/awards/.../thumbnail/...` first, so thumbnail generation is intentionally separate from `npm run build`.

`--format` controls the output file type. `webp` is the default and usually gives the smallest files. `--max-width` only downsizes images wider than the given width; smaller images keep their original dimensions and are only recompressed. If the source image is an animated GIF and `--format webp` is used, the script saves an animated WebP instead of a static frame. The script then removes stale thumbnail variants for the same image stem so the site uses the new compressed file.
