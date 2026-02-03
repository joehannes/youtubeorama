# Cover Image Generation (Free Tier)

This automation generates YouTube cover images (16:9) using a free-tier AI image service.

## Provider
Default: Hugging Face Inference API (free tier) with Stable Diffusion XL.

### Requirements
- A free Hugging Face account.
- An API token stored in your environment:
  ```bash
  export HF_TOKEN=your_token_here
  ```

## Input File
Create `input/image_jobs.jsonl` (one job per line):
```json
{"slug":"song-slug","outputName":"song-slug.png","subject":"mountain sunrise cover art","channelContext":"Austrian Christian poetry channel","dailyContext":"forgiveness at dawn","genreContext":"ambient folk + piano","visualStyle":"soft light, cinematic, minimal text space","mood":"peaceful","language":"English"}
```

## Run
- Dry run (validate input parsing):
  ```bash
  npm run images:dry
  ```
- Actual run:
  ```bash
  npm run images:run
  ```

Images are saved to `output/suno_images` and can be paired with MP3s for ffmpeg.

## Notes
- Free-tier inference has rate limits; if you hit limits, slow the batch or upgrade.
- The prompt is assembled from channel context + daily topic + genre + visual style.
