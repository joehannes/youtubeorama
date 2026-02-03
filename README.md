# YouTube Song Factory System

This repository contains the planning system and templates for operating 70 YouTube music channels (35 per creator).

## Quick Start
1. Review base topics and channel definitions:
   - `data/base_topics.md`
   - `data/austria_johannes_channels.md`
   - `data/dominican_daniel_channels.md`
2. Use `chatgpt_context.txt` to generate weekly topics, lyrics, and Suno prompts.
3. Generate weekly scaffold files:
   ```bash
   python scripts/create_week_scaffold.py --year 2025 --week 5 --weekday monday --user both
   ```
4. Fill the generated files under `output/` with lyrics, prompts, and metadata.
5. Follow `docs/workflow.md` for the full manual process and automation considerations.

## Repository Layout
- `chatgpt_context.txt`: Core instructions for ChatGPT usage.
- `data/`: Base topics and channel definitions.
- `templates/`: File templates for weekly outputs and metadata.
- `scripts/`: Helper scripts to scaffold weekly files.
- `docs/`: Workflow notes and constraints.
  - `docs/automation_options.md`: Automation path comparisons and risk notes.

## Notes
This repo intentionally avoids hardcoding automation for third-party services with restrictive terms of service. Use it as the central planning system and add automation where legally and operationally appropriate.
