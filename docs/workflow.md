# Workflow Overview

This repo provides a structured content system for 70 YouTube music channels (35 per creator).

## What This Repo Covers
- Base topic system and channel definitions.
- ChatGPT context instructions.
- Templates for weekly outputs and channel metadata.
- A scaffold script to generate weekly files.
- Automation options and risk notes.

## What This Repo Does NOT Automate (Yet)
Automating third-party services like Suno or YouTube often violates terms of service, and the sites can change without notice. This repo avoids hardcoding or reverse-engineering those services. Instead, it provides a clean manual workflow that can be semi-automated with explicit user actions.

## Suggested Daily Flow
1. Run the scaffold script to create weekly files.
2. Use `chatgpt_context.txt` to generate subtopics, lyrics, and style prompts.
3. Paste results into the per-channel files.
4. Use the channel metadata template to keep upload descriptions consistent.
5. Generate cover images using a free service of choice (manual or API-driven).
6. Create a simple video with FFmpeg (image + audio).
7. Upload and schedule.
8. Optional: Run Playwright automation for Suno generation (see `docs/suno_automation.md`).
9. Optional: Generate AI cover images via Hugging Face (see `docs/image_generation.md`).

## Progress Milestones
1. Define base topics + channel profiles.
2. Generate weekly scaffold files.
3. Fill lyrics + prompts + metadata.
4. Create cover images + audio/video packaging.
5. Upload and schedule.

## Automation Opportunities (User-Owned Risk)
If you later choose to automate:
- **Browser automation** (Playwright/Selenium) can log in and fill forms but may violate ToS.
- **Unofficial APIs** or reverse-engineering can break anytime and risk account issues.
- **Chrome extensions** can help with bulk uploads but should be vetted carefully.

This repo keeps automation boundaries explicit so you can decide the risk level.

See `docs/automation_options.md` for a deeper comparison of automation paths.
