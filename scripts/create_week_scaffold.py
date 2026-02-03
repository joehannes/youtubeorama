#!/usr/bin/env python3
"""Create weekly scaffold files for channel outputs."""

from __future__ import annotations

import argparse
from pathlib import Path

CHANNEL_FILES = {
    "austria_johannes": Path("data/austria_johannes_channels.md"),
    "dominican_daniel": Path("data/dominican_daniel_channels.md"),
}

TEMPLATE_FILE = Path("templates/weekly_channel_file_template.md")
OUTPUT_DIR = Path("output")


def parse_channel_ids(channel_file: Path) -> list[str]:
    ids: list[str] = []
    for line in channel_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line.startswith("|"):
            continue
        parts = [part.strip() for part in line.strip("|").split("|")]
        if parts and parts[0].startswith(("J", "D")):
            ids.append(parts[0])
    return ids


def create_files(year: int, week: int, weekday: str, user: str) -> list[Path]:
    if user not in CHANNEL_FILES:
        raise ValueError(f"Unknown user: {user}")

    channel_ids = parse_channel_ids(CHANNEL_FILES[user])
    template = TEMPLATE_FILE.read_text(encoding="utf-8")

    week_label = f"Week{week:02d}"
    output_paths: list[Path] = []

    for channel_id in channel_ids:
        filename = f"{year}_{week_label}_{weekday}_user{user}_channel{channel_id}.md"
        output_path = OUTPUT_DIR / str(year) / week_label / weekday / user
        output_path.mkdir(parents=True, exist_ok=True)
        file_path = output_path / filename
        file_path.write_text(template, encoding="utf-8")
        output_paths.append(file_path)

    return output_paths


def main() -> None:
    parser = argparse.ArgumentParser(description="Create weekly scaffold files.")
    parser.add_argument("--year", type=int, required=True)
    parser.add_argument("--week", type=int, required=True)
    parser.add_argument("--weekday", required=True, choices=["monday", "wednesday", "friday"])
    parser.add_argument(
        "--user",
        required=True,
        choices=["austria_johannes", "dominican_daniel", "both"],
    )

    args = parser.parse_args()

    users = [args.user]
    if args.user == "both":
        users = ["austria_johannes", "dominican_daniel"]

    for user in users:
        create_files(args.year, args.week, args.weekday, user)


if __name__ == "__main__":
    main()
