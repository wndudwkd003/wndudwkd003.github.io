from __future__ import annotations

import argparse
import os
import sys
from functools import lru_cache
from pathlib import Path

THUMBNAIL_DIRNAME = "thumbnail"
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
DEFAULT_FORMAT = "webp"
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
        "--format",
        choices=("jpg", "webp", "png"),
        default=DEFAULT_FORMAT,
        help=(
            "Thumbnail file format. JPG and WEBP are compressed formats. "
            f"Default: {DEFAULT_FORMAT}"
        ),
    )
    parser.add_argument(
        "--max-width",
        type=int,
        default=None,
        help="Resize only images wider than this many pixels before saving.",
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


def thumbnail_path_for_format(source_path: Path, output_format: str) -> Path:
    return source_path.parent / THUMBNAIL_DIRNAME / f"{source_path.stem}.{output_format}"


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


def normalize_for_save(image, output_format: str, image_module):
    if output_format == "jpg":
        if "A" in image.getbands():
            flattened = image.convert("RGBA")
            canvas = image_module.new("RGB", flattened.size, (255, 255, 255))
            canvas.paste(flattened, mask=flattened.getchannel("A"))
            return canvas

        return image.convert("RGB")

    if output_format == "png":
        if image.mode not in {"P", "L", "RGB", "RGBA"}:
            return image.convert("RGBA" if "A" in image.getbands() else "RGB")
        return image

    if output_format == "webp" and image.mode not in {"RGB", "RGBA", "L", "P"}:
        return image.convert("RGBA" if "A" in image.getbands() else "RGB")

    return image


def resize_if_needed(image, max_width: int | None, resampling_module):
    if max_width is None or image.width <= max_width:
        return image

    new_height = round(image.height * (max_width / image.width))
    return image.resize((max_width, new_height), resampling_module.LANCZOS)


def transpose_if_needed(image, source_path: Path, image_ops_module):
    if source_path.suffix.lower() not in {".jpg", ".jpeg", ".webp"}:
        return image

    try:
        exif = image.getexif()
    except Exception:
        return image

    orientation = exif.get(274) if exif else None
    if orientation is None:
        return image

    return image_ops_module.exif_transpose(image)


def save_thumbnail(source_path: Path, target_path: Path, output_format: str, max_width: int | None) -> None:
    Image, ImageOps, ImageSequence = load_pillow()

    with Image.open(source_path) as original:
        if output_format == "webp" and getattr(original, "is_animated", False):
            frames = []
            durations = []
            loop = original.info.get("loop", 0)
            default_duration = original.info.get("duration", 100)

            for frame in ImageSequence.Iterator(original):
                current_frame = frame.copy()
                current_frame = transpose_if_needed(current_frame, source_path, ImageOps)
                current_frame = resize_if_needed(current_frame, max_width, Image)
                current_frame = normalize_for_save(current_frame, output_format, Image)
                frames.append(current_frame)
                durations.append(frame.info.get("duration", default_duration))

            if not frames:
                return

            target_path.parent.mkdir(parents=True, exist_ok=True)
            frames[0].save(
                target_path,
                format="WEBP",
                save_all=True,
                append_images=frames[1:],
                duration=durations,
                loop=loop,
                optimize=True,
                quality=70,
                method=6,
            )
            return

        if getattr(original, "is_animated", False):
            frame = next(ImageSequence.Iterator(original)).copy()
        else:
            frame = original.copy()

    frame = transpose_if_needed(frame, source_path, ImageOps)
    frame = resize_if_needed(frame, max_width, Image)
    frame = normalize_for_save(frame, output_format, Image)

    save_kwargs = {"optimize": True}
    if output_format == "jpg":
        save_kwargs.update(format="JPEG", quality=78, progressive=True)
    elif output_format == "png":
        save_kwargs.update(format="PNG", compress_level=9)
    elif output_format == "webp":
        save_kwargs.update(format="WEBP", quality=70, method=6)

    target_path.parent.mkdir(parents=True, exist_ok=True)
    frame.save(target_path, **save_kwargs)


def remove_stale_thumbnails(target_path: Path) -> None:
    if not target_path.parent.exists():
        return

    for stale_path in target_path.parent.glob(f"{target_path.stem}.*"):
        if stale_path == target_path:
            continue

        if stale_path.suffix.lower() in SUPPORTED_EXTENSIONS and stale_path.is_file():
            stale_path.unlink()


def main() -> int:
    args = parse_args()
    awards_dir = args.awards_dir.resolve()

    if not awards_dir.exists():
        print(f"No awards directory found at {awards_dir}. Skipping thumbnail generation.")
        return 0

    created = 0
    skipped = 0

    for source_path in iter_source_images(awards_dir):
        target_path = thumbnail_path_for_format(source_path, args.format)

        if target_path.exists() and not args.overwrite:
            remove_stale_thumbnails(target_path)
            skipped += 1
            continue

        save_thumbnail(source_path, target_path, args.format, args.max_width)
        remove_stale_thumbnails(target_path)
        created += 1
        print(f"Created thumbnail: {target_path.relative_to(ROOT_DIR)}")

    print(f"Thumbnail generation complete. Created: {created}, skipped: {skipped}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
