# I-LOG Directory Index

**I-LOG (Incarnation Log)** — Post-incarnation session transcript, colorized with SOUL/DNA/REASON/PHEROMONE classification per LFG §SCS.

| Run | Type | File | Status |
|-----|------|------|--------|
| 186 | JSONL | `I-LOG-186.txt` | historical |
| 186 | Markdown | `I-LOG-186-COLORIZED.md` | colorized |
| 186 | JSON | `I-LOG-186-STATS.json` | stats |
| 8 | JSONL | `I-LOG-8.txt` | ✅ sealed via death.ps1 |
| 8 | Markdown | `I-LOG-8-COLORIZED.md` | colorized |
| 8 | JSON | `I-LOG-8-STATS.json` | stats |

## Schema

V2: `content[].data.{text, tool, state}`, top-level `role`/`time`/`content`

V1: `content[].{text, tool}`, top-level `role`/`time`/`content`

## Color Coding (LFG §SCS RRL COLOR CODING)

| Color | Type | Role | Description |
|-------|------|------|-------------|
| 🟣 | SOUL | user | Raw Michael verbatim — user turns |
| 🔴 | DNA | assistant | Assistant responses, AI output |
| 🟡 | REASON | assistant | AI reasoning blocks, thinking text |
| 🟢 | PHEROMONE | assistant | Tool/decision call traces |

## Scripts

- Canonical colorizer: `CANON/SCRIPTS/rrl-colorize.ps1`
- Canonical death/seal: `CANON/SCRIPTS/death.ps1`
- Audio transcriber: `CANON/SCRIPTS/transcribe-rtl.js` (ITL V1 — speaker diarization)

## ITL (Raw Transcript Log)

Audio transcriptions with speaker diarization. Separate from I-LOG.

| Student | File | Messages | Duration | Date |
|---------|------|----------|----------|------|
| Mai Tram | `RTL/Mai-Tram/ITL-mai-tram-2026-07-22.txt` | 314 | 45 min | 2026-07-22 |
