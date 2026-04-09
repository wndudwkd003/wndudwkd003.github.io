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
python python-scripts/generate_thumbnails.py --overwrite
python python-scripts/generate_thumbnails.py --width 360
```

The site loads committed files from `/awards/.../thumbnail/...` first, so thumbnail generation is intentionally separate from `npm run build`.
