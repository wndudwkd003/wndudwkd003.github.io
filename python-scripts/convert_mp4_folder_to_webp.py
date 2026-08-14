from __future__ import annotations

import argparse
import sys
from pathlib import Path
from types import SimpleNamespace

from convert_mp4_to_webp import convert


ROOT_DIR = Path(__file__).resolve().parent.parent
DEFAULT_INPUT_DIR = ROOT_DIR / "mp4"
DEFAULT_OUTPUT_DIR = ROOT_DIR / "webp"


def bounded_int(minimum: int, maximum: int):
    def parse(value: str) -> int:
        number = int(value)
        if not minimum <= number <= maximum:
            raise argparse.ArgumentTypeError(
                f"must be between {minimum} and {maximum}"
            )
        return number

    return parse


def positive_float(value: str) -> float:
    number = float(value)
    if number <= 0:
        raise argparse.ArgumentTypeError("must be greater than 0")
    return number


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Convert every MP4 under the project's mp4 folder into an animated "
            "WebP under the webp folder."
        )
    )
    parser.add_argument(
        "--fps",
        type=positive_float,
        default=12.0,
        help="Output frames per second. Default: 12.",
    )
    parser.add_argument(
        "--max-width",
        type=bounded_int(0, 16384),
        default=1080,
        help="Maximum width. Use 0 to keep the original width. Default: 1080.",
    )
    parser.add_argument(
        "--quality",
        type=bounded_int(0, 100),
        default=70,
        help="WebP quality from 0 to 100. Default: 70.",
    )
    parser.add_argument(
        "--compression-level",
        type=bounded_int(0, 6),
        default=6,
        help="Encoding effort from 0 (fast) to 6 (smallest). Default: 6.",
    )
    parser.add_argument(
        "--loop",
        type=bounded_int(0, 65535),
        default=0,
        help="Loop count. 0 means infinite. Default: 0.",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Replace WebP files that already exist.",
    )
    parser.add_argument(
        "--ffmpeg",
        type=Path,
        help="Explicit FFmpeg executable path.",
    )
    return parser.parse_args()


def find_mp4_files(input_dir: Path) -> list[Path]:
    return sorted(
        path
        for path in input_dir.rglob("*")
        if path.is_file() and path.suffix.lower() == ".mp4"
    )


def main() -> int:
    args = parse_args()
    DEFAULT_INPUT_DIR.mkdir(parents=True, exist_ok=True)
    DEFAULT_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    sources = find_mp4_files(DEFAULT_INPUT_DIR)
    if not sources:
        print(f"No MP4 files found in: {DEFAULT_INPUT_DIR}")
        return 0

    converted = 0
    skipped = 0
    failed = 0

    for source in sources:
        relative_path = source.relative_to(DEFAULT_INPUT_DIR).with_suffix(".webp")
        target = DEFAULT_OUTPUT_DIR / relative_path

        if target.exists() and not args.overwrite:
            print(f"Skipped existing file: {target}")
            skipped += 1
            continue

        conversion_args = SimpleNamespace(
            input=source,
            output=target,
            fps=args.fps,
            max_width=args.max_width,
            quality=args.quality,
            compression_level=args.compression_level,
            loop=args.loop,
            start=None,
            duration=None,
            overwrite=args.overwrite,
            ffmpeg=args.ffmpeg,
        )

        try:
            created_path = convert(conversion_args)
        except (FileNotFoundError, FileExistsError, RuntimeError, ValueError) as error:
            print(f"Failed: {source}\n  {error}", file=sys.stderr)
            failed += 1
            continue

        print(f"Created: {created_path}")
        converted += 1

    print(
        f"Complete. Converted: {converted}, skipped: {skipped}, failed: {failed}"
    )
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
