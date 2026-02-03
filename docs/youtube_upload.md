# YouTube Upload (Official Data API)

This script uploads finished MP4 videos using the official YouTube Data API.

## Requirements
- A Google Cloud project with YouTube Data API enabled.
- OAuth client credentials JSON (downloaded from Google Cloud Console).
- Node.js 18+.

## Setup
1. Place your OAuth client JSON at `config/youtube_client_secret.json`.
2. Create `config/youtube_channels.json` with channel names and token paths.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run a dry run to validate inputs:
   ```bash
   npm run youtube:dry
   ```
4. Run the uploader:
   ```bash
   npm run youtube:run
   ```
   Follow the prompt to authorize and save a token at `config/youtube_token.json`.

## Input File
Create `input/youtube_jobs.jsonl` (one JSON object per line):
```json
{"channelKey":"austria_johannes","title":"Song Title","descriptionPath":"output/descriptions/song.md","tags":["music"],"videoPath":"output/videos/song.mp4","privacyStatus":"private","publishAt":"2025-01-10T12:00:00Z"}
{"channelKey":"austria_johannes","title":"Song Title (Remix)","descriptionPath":"output/descriptions/song-remix.md","tags":["music","remix"],"videoPath":"output/videos/song-remix.mp4","privacyStatus":"private","publishAt":"2025-01-10T12:00:00Z","publishOffsetDays":1}
```

## Notes
- `publishAt` must be an RFC3339 timestamp and requires `privacyStatus` to be `private` or `unlisted`.
- You can override `categoryId` per job if needed (default is Music, ID 10).
- `publishOffsetDays` lets you schedule an alternate version the next day while reusing the base publish time.
- `descriptionPath` lets you store full descriptions in separate files for reuse.
