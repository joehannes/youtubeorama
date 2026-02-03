#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 3 ]]; then
  echo "Usage: $0 <image.png> <audio.mp3> <output.mp4>"
  exit 1
fi

IMAGE="$1"
AUDIO="$2"
OUTPUT="$3"

ffmpeg -y \
  -loop 1 -i "$IMAGE" \
  -i "$AUDIO" \
  -c:v libx264 -tune stillimage -preset veryfast \
  -c:a aac -b:a 192k \
  -pix_fmt yuv420p -shortest \
  -movflags +faststart \
  "$OUTPUT"
