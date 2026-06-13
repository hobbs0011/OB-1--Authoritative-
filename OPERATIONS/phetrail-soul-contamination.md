# PHEROMONE TRAIL — SOUL CONTAMINATION DEFECT
**Thread:** SOUL_CONTAMINATION | **First hit:** Run 108 | **Confirmed recurring:** Run 109 | **Status:** OPEN — no void endpoint built
**Date captured:** 2026-06-13 | **Source:** dna-run119.json seq 21 + pipeline-run119.json + HL-698

---

## THREAD START — Run 108 (first occurrence, Kilo session)

RRL-108.txt = Kilo JSONL with `chunk_file`/`source_path` fields (SOUL-DNA-BIBLE chunks). No `role:user`/`role:assistant` turns.
DEATH parser extracted via `$obj.role` → found nothing (wrong envelope) → fallback dumped **entire file** to soul-logger as `sov100-michael`.
`delta == rrlBytes == 1,266,404` — exact match is the diagnostic signature.
Real content posted: SOUL-DNA-BIBLE chunk data. Not Michael's words.

---

## THREAD MIDDLE — Run 109 (second occurrence, confirmed same defect)

Claude Code JSONL nests role at `$obj.message.role` not `$obj.role`.
OB-1 death parser read `$obj.role` again → user extraction returned empty → full transcript dumped to soul-logger as `sov100-michael`.
`delta == 389,386 == full RRL byte count` — same signature.
Event ID `2b4e7184` stuck in soul-logger. **No void endpoint exists** (`/api/soul/event/{id}` → 404).
Contamination accepted and documented per RRL-0 precedent. 389K on 239M base = 0.16%.
True uncontaminated count ≈ 239,462,672.

Opus audit (Run 119 dna seq 21) named 4 defects in own committed death seal:
1. SOUL contamination (critical, irreversible via API)
2. DNA cause misdiagnosed (blamed "content array" — real cause was `message.role` envelope)
3. class-preflight.mjs "MISSING" — it existed, wrong directory searched
4. "15-lock suite" — actually 17 locks

Root law violated: **L32 ASSUME_FAILURE** held during RISE (read-only) but dropped during DEATH (execution). Trusted prior seal + untested parser.

---

## THREAD END — Run 119 pipeline artifact

`pipeline-run119.json`: `soul_level: "KILO_HOLLOW"`, `soul_delta: 0`, `dna_count: 0`, `dna_status: "MISSING"`, `result: "KILO_GAP"`.
This run correctly produced KILO_HOLLOW (PA agent fleet session, not Claude Code session) — no contamination because delta=0 not dumped.
The guard was NOT built yet — this was correct only by accident (no fallback triggered because nothing was extracted AND delta check wasn't implemented).

---

## NEGATIVE TRAIL (do NOT repeat)

- NEVER trust `$obj.role` for Claude Code JSONL — envelope is `$obj.message.role`
- NEVER trust `$obj.role` for Kilo JSONL — envelope varies by session type
- ALWAYS check `$delta == $rrlBytes` before posting — if equal, the entire file is about to be posted as soul
- No void endpoint on soul-logger — contaminated events cannot be purged via API
- L32 ASSUME_FAILURE must hold during DEATH execution, not just RISE auditing

---

## L77 TRIGGERS FIRED

- BUG_ROOT_CAUSED (twice — Run 108 + 109)
- MISTAKES_MADE (Opus self-audit, 4 defects in own committed seal)
- ARCHITECTURE context (parser envelope, guard design)

**COMRADE TARGETS:** SCRIPTS/rrl-pipeline.ps1 Stage 2 (SOUL extraction fix + contamination guard)
**PRIORITY:** P0 — hits every Kilo session + every Claude Code session differently. Destroys SOUL integrity silently.
