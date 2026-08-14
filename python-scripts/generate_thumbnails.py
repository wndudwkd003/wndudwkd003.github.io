from __future__ import annotations

import argparse
import os
import sys
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

THUMBNAIL_DIRNAME = "thumbnail"
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}
ANIMATED_SOURCE_FORMATS = {"GIF", "PNG", "WEBP"}
DEFAULT_FORMAT = "webp"
ROOT_DIR = Path(__file__).resolve().parent.parent
DEFAULT_ACTIVITIES_DIR = ROOT_DIR / "public" / "awards"
DEFAULT_PUBLICATIONS_DIR = ROOT_DIR / "public" / "papers"
DEFAULT_PROJECTS_DIR = ROOT_DIR / "public" / "projects"
PROJECT_SOURCE_EXTENSIONS = {".jpg", ".jpeg", ".png"}


@dataclass(frozen=True)
class ThumbnailProfile:
    name: str
    root_dir: Path
    max_width: int | None
    quality: int
    source_extensions: frozenset[str]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create missing thumbnails for activities and publication figures."
    )
    parser.add_argument(
        "--scope",
        choices=("all", "activities", "publications", "projects"),
        default="all",
        help="Choose which thumbnail profile to run. Default: all",
    )
    parser.add_argument(
        "--activities-dir",
        "--awards-dir",
        dest="activities_dir",
        type=Path,
        default=DEFAULT_ACTIVITIES_DIR,
        help=f"Activities root directory. Default: {DEFAULT_ACTIVITIES_DIR}",
    )
    parser.add_argument(
        "--publications-dir",
        type=Path,
        default=DEFAULT_PUBLICATIONS_DIR,
        help=f"Publications root directory. Default: {DEFAULT_PUBLICATIONS_DIR}",
    )
    parser.add_argument(
        "--projects-dir",
        type=Path,
        default=DEFAULT_PROJECTS_DIR,
        help=f"Projects root directory. Default: {DEFAULT_PROJECTS_DIR}",
    )
    parser.add_argument(
        "--publications-max-width",
        type=int,
        default=1080,
        help="Maximum publication thumbnail width. Default: 1080",
    )
    parser.add_argument(
        "--publications-quality",
        type=int,
        default=84,
        help="Publication JPG/WEBP quality. Default: 84",
    )
    parser.add_argument(
        "--projects-max-width",
        type=int,
        default=1080,
        help="Maximum project thumbnail width. Default: 1080",
    )
    parser.add_argument(
        "--projects-quality",
        type=int,
        default=100,
        help="Project JPG/WEBP quality. Default: 100",
    )
    parser.add_argument(
        "--format",
        choices=("jpg", "webp", "png"),
        default=DEFAULT_FORMAT,
        help=f"Thumbnail file format. Default: {DEFAULT_FORMAT}",
    )
    parser.add_argument(
        "--max-width",
        type=int,
        default=None,
        help="Optional global max-width override for the selected profiles.",
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=None,
        help="Optional global JPG/WEBP quality override for the selected profiles.",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Rebuild thumbnails even when the target file already exists.",
    )
    return parser.parse_args()


def iter_source_images(root_dir: Path, source_extensions: frozenset[str]):
    for dirpath, dirnames, filenames in os.walk(root_dir):
        dirpath = Path(dirpath)
        dirnames[:] = [name for name in dirnames if name != THUMBNAIL_DIRNAME]

        for filename in filenames:
            source_path = dirpath / filename
            if source_path.suffix.lower() in source_extensions:
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


def save_thumbnail(
    source_path: Path,
    target_path: Path,
    output_format: str,
    max_width: int | None,
    quality: int,
) -> None:
    Image, ImageOps, ImageSequence = load_pillow()

    with Image.open(source_path) as original:
        preserve_animation = (
            output_format == "webp"
            and getattr(original, "is_animated", False)
            and original.format in ANIMATED_SOURCE_FORMATS
        )

        if preserve_animation:
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
                quality=quality,
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
        save_kwargs.update(format="JPEG", quality=quality, progressive=True)
    elif output_format == "png":
        save_kwargs.update(format="PNG", compress_level=9)
    elif output_format == "webp":
        save_kwargs.update(format="WEBP", quality=quality, method=6)

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


def build_profiles(args: argparse.Namespace) -> list[ThumbnailProfile]:
    profiles = [
        # Preserve the existing Activities behavior: no default resize and quality 70.
        ThumbnailProfile("activities", args.activities_dir.resolve(), None, 70, frozenset(SUPPORTED_EXTENSIONS)),
        # Publication figures retain their aspect ratio at a maximum width of 1080.
        ThumbnailProfile(
            "publications",
            args.publications_dir.resolve(),
            args.publications_max_width,
            args.publications_quality,
            frozenset(SUPPORTED_EXTENSIONS),
        ),
        # Project thumbnails are only created for static PNG/JPG sources.
        ThumbnailProfile(
            "projects",
            args.projects_dir.resolve(),
            args.projects_max_width,
            args.projects_quality,
            frozenset(PROJECT_SOURCE_EXTENSIONS),
        ),
    ]

    selected = profiles if args.scope == "all" else [p for p in profiles if p.name == args.scope]
    return [
        ThumbnailProfile(
            profile.name,
            profile.root_dir,
            args.max_width if args.max_width is not None else profile.max_width,
            args.quality if args.quality is not None else profile.quality,
            profile.source_extensions,
        )
        for profile in selected
    ]


def generate_for_profile(profile: ThumbnailProfile, args: argparse.Namespace) -> tuple[int, int]:
    if not profile.root_dir.exists():
        print(f"[{profile.name}] No directory found at {profile.root_dir}. Skipping.")
        return 0, 0

    created = 0
    skipped = 0
    print(
        f"[{profile.name}] root={profile.root_dir.relative_to(ROOT_DIR)}, "
        f"format={args.format}, max_width={profile.max_width}, quality={profile.quality}"
    )

    for source_path in iter_source_images(profile.root_dir, profile.source_extensions):
        target_path = thumbnail_path_for_format(source_path, args.format)

        if target_path.exists() and not args.overwrite:
            remove_stale_thumbnails(target_path)
            skipped += 1
            continue

        save_thumbnail(source_path, target_path, args.format, profile.max_width, profile.quality)
        remove_stale_thumbnails(target_path)
        created += 1
        print(f"Created thumbnail: {target_path.relative_to(ROOT_DIR)}")

    print(f"[{profile.name}] complete. Created: {created}, skipped: {skipped}")
    return created, skipped


def main() -> int:
    args = parse_args()

    if args.max_width is not None and args.max_width <= 0:
        raise SystemExit("--max-width must be greater than 0.")
    if args.publications_max_width <= 0:
        raise SystemExit("--publications-max-width must be greater than 0.")
    if args.projects_max_width <= 0:
        raise SystemExit("--projects-max-width must be greater than 0.")

    qualities = [
        value
        for value in (args.quality, args.publications_quality, args.projects_quality)
        if value is not None
    ]
    if any(value < 1 or value > 100 for value in qualities):
        raise SystemExit("Quality must be between 1 and 100.")

    total_created = 0
    total_skipped = 0
    for profile in build_profiles(args):
        created, skipped = generate_for_profile(profile, args)
        total_created += created
        total_skipped += skipped

    print(f"Thumbnail generation complete. Created: {total_created}, skipped: {total_skipped}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
