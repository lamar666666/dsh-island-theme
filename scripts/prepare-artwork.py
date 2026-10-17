#!/usr/bin/env python3
"""Convert the approved island source artwork into local WebP assets."""

import argparse
from pathlib import Path

from PIL import Image


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source-dir",
        required=True,
        type=Path,
        help="Directory containing island-hero.png, island-night.png, and lamar-pet.png",
    )
    source_dir = parser.parse_args().source_dir
    assets_dir = Path(__file__).resolve().parents[1] / "assets"
    assets_dir.mkdir(parents=True, exist_ok=True)

    conversions = (
        ("island-hero.png", "island-day.webp", {"quality": 88, "method": 6}),
        ("island-night.png", "island-night.webp", {"quality": 88, "method": 6}),
        ("lamar-pet.png", "island-mascot.webp", {"lossless": True, "method": 6}),
    )
    for source_name, output_name, options in conversions:
        source_path = source_dir / source_name
        output_path = assets_dir / output_name
        with Image.open(source_path) as image:
            image.save(output_path, format="WEBP", **options)
        print(f"{source_name} -> {output_path.relative_to(assets_dir.parent)}")


if __name__ == "__main__":
    main()
