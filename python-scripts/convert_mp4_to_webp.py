from __future__ import annotations

import argparse
import math
import re
import shutil
import subprocess
import sys
import tempfile
from collections import deque
from pathlib import Path

from tqdm import tqdm


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


def non_negative_float(value: str) -> float:
    number = float(value)
    if number < 0:
        raise argparse.ArgumentTypeError("must be 0 or greater")
    return number


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert an MP4 or other video file to an animated WebP."
    )
    parser.add_argument("input", type=Path, help="Input video path.")
    parser.add_argument(
        "output",
        type=Path,
        nargs="?",
        help="Output WebP path. Defaults to the input path with a .webp suffix.",
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
        help="Downscale videos wider than this value. Use 0 to keep the original width. Default: 1080.",
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
        "--start",
        type=non_negative_float,
        help="Start time in seconds.",
    )
    parser.add_argument(
        "--duration",
        type=positive_float,
        help="Maximum output duration in seconds.",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Replace the output file if it already exists.",
    )
    parser.add_argument(
        "--ffmpeg",
        type=Path,
        help="Explicit FFmpeg executable path.",
    )
    return parser.parse_args()


def find_ffmpeg(explicit_path: Path | None) -> str:
    if explicit_path is not None:
        resolved = explicit_path.expanduser().resolve()
        if not resolved.is_file():
            raise FileNotFoundError(f"FFmpeg was not found at: {resolved}")
        return str(resolved)

    system_ffmpeg = shutil.which("ffmpeg")
    if system_ffmpeg:
        return system_ffmpeg

    try:
        import imageio_ffmpeg
    except ImportError as error:
        raise FileNotFoundError(
            "FFmpeg was not found. Install the Python requirements or pass "
            "--ffmpeg with an executable path."
        ) from error

    return imageio_ffmpeg.get_ffmpeg_exe()


def find_ffprobe(ffmpeg: str) -> str | None:
    ffmpeg_path = Path(ffmpeg)
    sibling_name = "ffprobe.exe" if ffmpeg_path.suffix.lower() == ".exe" else "ffprobe"
    sibling = ffmpeg_path.with_name(sibling_name)
    if sibling.is_file():
        return str(sibling)

    return shutil.which("ffprobe")


def get_video_duration(source: Path, ffmpeg: str) -> float | None:
    ffprobe = find_ffprobe(ffmpeg)
    if ffprobe is None:
        return None

    try:
        result = subprocess.run(
            [
                ffprobe,
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                str(source),
            ],
            capture_output=True,
            text=True,
            check=False,
            timeout=15,
        )
    except (OSError, subprocess.TimeoutExpired):
        return None
    if result.returncode != 0:
        return None

    try:
        return float(result.stdout.strip())
    except ValueError:
        return None


def build_video_filter(fps: float, max_width: int) -> str:
    filters = [f"fps={fps:g}"]
    if max_width > 0:
        filters.append(
            f"scale='min({max_width},iw)':-2:flags=lanczos"
        )
    # libwebp_anim buffers frames and may not report encoder progress until the
    # file is complete. showinfo reports each frame before it enters the encoder.
    filters.append("showinfo")
    return ",".join(filters)


def convert(args: argparse.Namespace) -> Path:
    source = args.input.expanduser().resolve()
    if not source.is_file():
        raise FileNotFoundError(f"Input video was not found: {source}")

    target = (
        args.output.expanduser().resolve()
        if args.output is not None
        else source.with_suffix(".webp")
    )
    if target.suffix.lower() != ".webp":
        raise ValueError("The output path must use the .webp extension.")
    if source == target:
        raise ValueError("The input and output paths must be different.")
    if target.exists() and not args.overwrite:
        raise FileExistsError(
            f"Output already exists: {target}. Pass --overwrite to replace it."
        )

    ffmpeg = find_ffmpeg(args.ffmpeg)
    target.parent.mkdir(parents=True, exist_ok=True)

    temp_file = tempfile.NamedTemporaryFile(
        prefix=f".{target.stem}.",
        suffix=".webp",
        dir=target.parent,
        delete=False,
    )
    temp_path = Path(temp_file.name)
    temp_file.close()

    source_duration = get_video_duration(source, ffmpeg)
    output_duration = source_duration
    if output_duration is not None and args.start is not None:
        output_duration = max(0.0, output_duration - args.start)
    if args.duration is not None:
        output_duration = (
            min(output_duration, args.duration)
            if output_duration is not None
            else args.duration
        )
    progress_total = (
        math.ceil(output_duration * args.fps)
        if output_duration is not None
        else None
    )

    command = [
        ffmpeg,
        "-hide_banner",
        "-loglevel",
        "info",
        "-nostats",
        "-y",
    ]
    if args.start is not None:
        command.extend(["-ss", f"{args.start:g}"])
    command.extend(["-i", str(source)])
    if args.duration is not None:
        command.extend(["-t", f"{args.duration:g}"])
    command.extend(
        [
            "-an",
            "-vf",
            build_video_filter(args.fps, args.max_width),
            "-c:v",
            "libwebp_anim",
            "-lossless",
            "0",
            "-quality",
            str(args.quality),
            "-compression_level",
            str(args.compression_level),
            "-loop",
            str(args.loop),
            "-fps_mode",
            "passthrough",
            str(temp_path),
        ]
    )

    try:
        process = subprocess.Popen(
            command,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
        )

        last_progress = 0.0
        recent_ffmpeg_output: deque[str] = deque(maxlen=40)
        with tqdm(
            total=progress_total,
            desc=source.name,
            unit="frame",
            dynamic_ncols=True,
            mininterval=0.2,
        ) as progress_bar:
            assert process.stderr is not None
            for raw_line in process.stderr:
                line = raw_line.rstrip()
                recent_ffmpeg_output.append(line)
                if "showinfo" not in line:
                    continue

                match = re.search(r"\bn:\s*(\d+)\b", line)
                if match is None:
                    continue
                current_progress = int(match.group(1)) + 1

                if progress_total is not None:
                    current_progress = min(current_progress, progress_total)
                if current_progress > last_progress:
                    progress_bar.update(current_progress - last_progress)
                    last_progress = current_progress

            return_code = process.wait()
            if (
                return_code == 0
                and progress_total is not None
                and last_progress < progress_total
            ):
                progress_bar.update(progress_total - last_progress)

        if return_code != 0:
            details = "\n".join(recent_ffmpeg_output).strip()
            if not details:
                details = "FFmpeg failed without an error message."
            raise RuntimeError(details)

        if not temp_path.is_file() or temp_path.stat().st_size == 0:
            raise RuntimeError("FFmpeg did not create a valid output file.")

        temp_path.replace(target)
    finally:
        temp_path.unlink(missing_ok=True)

    return target


def main() -> int:
    args = parse_args()
    try:
        target = convert(args)
    except (FileNotFoundError, FileExistsError, RuntimeError, ValueError) as error:
        print(f"Error: {error}", file=sys.stderr)
        return 1

    input_size = args.input.expanduser().resolve().stat().st_size
    output_size = target.stat().st_size
    ratio = (output_size / input_size * 100) if input_size else 0
    print(f"Created: {target}")
    print(f"Size: {output_size / 1024 / 1024:.2f} MiB ({ratio:.1f}% of input)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
