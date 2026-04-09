from __future__ import annotations

import argparse
import os
import sys
from functools import lru_cache
from pathlib import Path

THUMBNAIL_DIRNAME = "thumbnail"
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
DEFAULT_WIDTH = 480
ROOT_DIR = Path(__file__).resolve().parent.parent
DEFAULT_AWARDS_DIR = ROOT_DIR / "public" / "awards"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create missing thumbnails under public/awards/**/thumbnail."
    )
    parser.add_argument(
        "--awards-dir",
        type=Path,
        default=DEFAULT_AWARDS_DIR,
        help=f"Root awards directory. Default: {DEFAULT_AWARDS_DIR}",
    )
    parser.add_argument(
        "--width",
        type=int,
        default=DEFAULT_WIDTH,
        help=f"Thumbnail width in pixels. Default: {DEFAULT_WIDTH}",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Rebuild thumbnails even when the target file already exists.",
    )
    return parser.parse_args()


def iter_source_images(awards_dir: Path):
    for dirpath, dirnames, filenames in os.walk(awards_dir):
        dirpath = Path(dirpath)
        dirnames[:] = [name for name in dirnames if name != THUMBNAIL_DIRNAME]

        for filename in filenames:
            source_path = dirpath / filename
            if source_path.suffix.lower() in SUPPORTED_EXTENSIONS:
                yield source_path


def thumbnail_path_for(source_path: Path) -> Path:
    return source_path.parent / THUMBNAIL_DIRNAME / source_path.name


@lru_cache(maxsize=1)
def load_pillow():
    try:
        from PIL import Image, ImageOps, ImageSequence
    except ImportError as error:
        raise SystemExit(
            "Pillow is required. Install it with "
            "`python -m pip install -r python-scripts/requirements.txt`."
        ) from error

    return Image, ImageOps, ImageSequence


def normalize_for_save(image, extension: str, image_module):
    if extension in {".jpg", ".jpeg"}:
        if image.mode not in {"RGB", "L"}:
            background = image.getchannel("A") if "A" in image.getbands() else None
            if background is not None:
                flattened = image.convert("RGBA")
                canvas = image_module.new("RGB", flattened.size, (255, 255, 255))
                canvas.paste(flattened, mask=flattened.getchannel("A"))
                return canvas
            return image.convert("RGB")
        return image.convert("RGB")

    if extension == ".gif":
        if image.mode not in {"P", "L"}:
            return image.convert("P", palette=image_module.ADAPTIVE)
        return image

    return image


def save_thumbnail(source_path: Path, target_path: Path, width: int) -> None:
    Image, ImageOps, ImageSequence = load_pillow()

    with Image.open(source_path) as original:
        if getattr(original, "is_animated", False):
            frame = next(ImageSequence.Iterator(original)).copy()
        else:
            frame = original.copy()

    frame = ImageOps.exif_transpose(frame)
    frame.thumbnail((width, width * 100), Image.Resampling.LANCZOS)
    frame = normalize_for_save(frame, source_path.suffix.lower(), Image)

    save_kwargs = {"optimize": True}
    extension = source_path.suffix.lower()

    if extension in {".jpg", ".jpeg"}:
        save_kwargs.update(format="JPEG", quality=70)
    elif extension == ".png":
        save_kwargs.update(format="PNG", compress_level=9)
    elif extension == ".webp":
        save_kwargs.update(format="WEBP", quality=70, method=6)
    elif extension == ".gif":
        save_kwargs.update(format="GIF")

    target_path.parent.mkdir(parents=True, exist_ok=True)
    frame.save(target_path, **save_kwargs)


def main() -> int:
    args = parse_args()
    awards_dir = args.awards_dir.resolve()

    if not awards_dir.exists():
        print(f"No awards directory found at {awards_dir}. Skipping thumbnail generation.")
        return 0

    created = 0
    skipped = 0

    for source_path in iter_source_images(awards_dir):
        target_path = thumbnail_path_for(source_path)

        if target_path.exists() and not args.overwrite:
            skipped += 1
            continue

        save_thumbnail(source_path, target_path, args.width)
        created += 1
        print(f"Created thumbnail: {target_path.relative_to(ROOT_DIR)}")

    print(f"Thumbnail generation complete. Created: {created}, skipped: {skipped}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
