# Thumbnail Scripts

`generate_thumbnails.py` creates missing thumbnails for Activities and Publications.

- Activities keep the existing behavior: original width and quality 70.
- Publications preserve the original aspect ratio, resize to a maximum width of 1080 pixels, and use quality 84.
- Projects process PNG/JPG/JPEG/GIF files at a maximum width of 1080 pixels and quality 100. Animated GIF files are written as animated WebP thumbnails.
- Animated WebP files preserve their original frame durations. Projects use a maximum width of 720 pixels; Activities and Publications use 1080 pixels. The default quality is 100 and can be adjusted with `--animated-webp-quality` without changing the animation timing.
- Non-animated project WebP files are left untouched by the animated-media rule.

## Install

```bash
python -m pip install -r python-scripts/requirements.txt
```

## Run

```bash
python python-scripts/generate_thumbnails.py
```

Run only one profile:

```bash
python python-scripts/generate_thumbnails.py --scope activities
python python-scripts/generate_thumbnails.py --scope publications
python python-scripts/generate_thumbnails.py --scope projects
```

Target one project directory and use custom settings for both animated WebP and GIF sources:

```bash
python python-scripts/generate_thumbnails.py --scope projects --projects-dir public/projects/project_sub_1 --projects-max-width 500 --projects-quality 50 --projects-animated-webp-max-width 500 --animated-webp-quality 50 --animated-webp-method 6 --overwrite
```

Adjust only the animated WebP quality while preserving its original frame timing:

```bash
python python-scripts/generate_thumbnails.py --scope projects --animated-webp-only --animated-webp-quality 90 --animated-webp-method 3 --overwrite
```

The command processes one file at a time because animated WebP encoding keeps many decoded frames in memory. The overall progress bar counts only files that will actually be processed, while the active file has its own frame progress bar. After frame preparation reaches 100%, that bar changes to an `encoding q{quality}` state during Pillow's final WebP encoding pass.

Each completed file prints its original size, thumbnail size, and reduction percentage. A combined size summary is printed after all files in the selected profile finish. If re-encoding makes a file larger, the result is reported as `increased` instead of `reduced`.

Optional:

```bash
python python-scripts/generate_thumbnails.py --scope publications --publications-max-width 1080 --publications-quality 84 --overwrite
```

The site loads committed files from `/awards/.../thumbnail/...` and `/papers/{publication-id}/images/thumbnail/...` first, so thumbnail generation is intentionally separate from `npm run build`.

`--format` controls the output file type. `webp` is the default and usually gives the smallest files. `--max-width` only downsizes images wider than the given width; smaller images keep their original dimensions and are only recompressed. If the source image is an animated GIF and `--format webp` is used, the script saves an animated WebP instead of a static frame. The script then removes stale thumbnail variants for the same image stem so the site uses the new compressed file.

## Convert MP4 to animated WebP

To convert every `.mp4` file in the project's `mp4` folder and save the results in the `webp` folder, run:

```bash
python python-scripts/convert_mp4_folder_to_webp.py
```

Existing WebP files are skipped. Pass `--overwrite` to rebuild them. Subfolders under `mp4` are preserved under `webp`.
Each conversion displays a `tqdm` progress bar with the processed video time, percentage, elapsed time, and estimated remaining time.

`convert_mp4_to_webp.py` converts an MP4 or another FFmpeg-readable video into an animated WebP. It uses a system FFmpeg executable when available and falls back to the executable provided by `imageio-ffmpeg`.

```bash
python python-scripts/convert_mp4_to_webp.py input.mp4
```

The default output is `input.webp` at 12 FPS, up to 1080 pixels wide, with quality 70 and infinite looping. A smaller web asset can be created with:

```bash
python python-scripts/convert_mp4_to_webp.py input.mp4 output.webp --fps 10 --max-width 720 --quality 60
```

To convert only part of a video:

```bash
python python-scripts/convert_mp4_to_webp.py input.mp4 output.webp --start 2.5 --duration 4 --overwrite
```

Use `--max-width 0` to preserve the original width. Run the script with `--help` for all options.
