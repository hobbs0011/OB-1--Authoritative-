---
description: "OB1 recon scout mission — 1 hour keyword chain walk"
agent: ob1
timeout_seconds: 3600
tags: ["scout", "phetrail", "recon", "keyword-chain"]
---

# OB1 Recon Scout Mission — 1 Hour Window

**Doctrine:** PHETRAIL-SCOUT-MANUAL.md (Run 121 methodology)

## Execution

1. **Seed keyword**: Take the last keyword from the backburner queue marked `source='scout-seed'`
   - If none: default to "FORCEAWARENESS" (high-signal recent directive)

2. **Walk the chain** (each step ~10 min):
   - Search CANON/SOUL/EXTRACT/ for keyword density
   - Find chapters/files with highest keyword mention count
   - Read keyword index at bottom of matched files
   - Pick 2-3 connecting words (ones that appear in multiple chapters = denser scent)
   - Search for each connecting word
   - Log what you find: is this new territory (POS) or dead end (NEG)?

3. **Document as you go** — write phetrail entry for each step:
   - `keyword → area found → connecting words discovered → next keyword`
   - Mark as POS (new territory) or NEG (dead end)
   - Link to specific file/chapter/line

4. **At 55 min**: compile and commit phetrail file

## Output

File: `OPERATIONS/phetrail-ob1-scout-YYYYMMDD.md`

```
# OB1 Scout Mission — [Date]

## Chain 1: [seed-keyword]
- [keyword] → CANON/file.md L## → area: [NEW AREA NAME]
- Connecting words: [w1], [w2], [w3] (density: N chapters)
- Status: POS/NEG
- Next keyword: [densest connecting word]

## Neg Trails (dead ends found)
- [keyword → dead file, reason]

## POS Territories Found
- [new area name]: [brief description]
- Citation: [file:line]
```

## Seed Keyword Selection

1. Check `SELECT * FROM backburner WHERE source='scout-seed' ORDER BY created_at DESC LIMIT 1`
2. If none in DB: use latest high-signal keyword from recent DNA/SOUL
3. Always cite the seed source in output

## Law

- **Reinforce as you go** (L121 SOUL DIRECTIVE) — don't batch writes at the end
- **NEG decays slower** — old dead-end trails guide future scouts
- **10% scout, 90% exploiter** — this is scout mode; exploiter runs follow denser trails next
- **The whole is in every piece** — one well-read chapter has pointers to 20 others

---

`Recon Scout Mission v1.0 — keyword chain walk, POS/NEG trail documentation, pheromone reinforcement`
