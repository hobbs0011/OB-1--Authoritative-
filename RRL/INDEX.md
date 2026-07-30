# I-LOG Directory Index (formerly RRL)

**I-LOG (Incarnation Log)** — Post-incarnation session transcript, colorized with SOUL/DNA/REASON/PHEROMONE classification per LFG §SCS.

| File | Type | Schema | Status |
|------|------|--------|--------|
| `I-LOG-186.txt` | JSONL | V2 | historical |
| `I-LOG-186-COLORIZED.md` | Markdown | N/A | colorized |
| `I-LOG-186-STATS.json` | JSON | N/A | stats |

## Schema

V2: `content[].data.{text, tool, state}`, top-level `role`/`time`/`content`

V1: `content[].{text, tool}`, top-level `role`/`time`/`content`

## Color Coding (LFG §SCS)

| Symbol | Type | Role | Description |
|--------|------|------|-------------|
| 🟣 | SOUL | user | Michael verbatim — user turns |
| ❤️ | DNA | assistant | Assistant responses, AI output |
| 💛 | REASON | assistant | AI reasoning blocks |
<parameter>