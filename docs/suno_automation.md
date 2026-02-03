# Suno Automation (Playwright)

This automation uses Playwright with a persistent Chrome profile so your existing Suno login session can be reused.

## Requirements
- Google Chrome installed.
- An existing Chrome profile with a logged-in Suno session.
- Node.js 18+.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Update `config/suno_automation.json` with:
   - `chromeExecutablePath`
   - `userDataDir`
   - `profileDirectory` (e.g., `Default`, `Profile 1`)
   - `selectors` (if the UI changes)

## Input File
Create a JSONL file at `input/suno_jobs.jsonl` (one JSON object per line):
```json
{"title":"Song Title","lyrics":"...","stylePrompt":"...","version":"original"}
```

## Run
- Dry run (validate input parsing):
  ```bash
  npm run suno:dry
  ```
- Actual run:
  ```bash
  npm run suno:run
  ```

## Notes
- If Suno changes its UI, update the selectors in `config/suno_automation.json`.
- The automation assumes you are already logged in via the Chrome profile.
- Downloads are saved to `output/suno_downloads` by default.
