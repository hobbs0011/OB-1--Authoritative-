# PHASE 0 — KNOW THE BATTLEFIELD (hardened spec)
# Designed: Run 43 — 2026-06-02 ICT — Opus 4.8 deep-think
# Status: READY TO EXECUTE — waiting on Run 44 RISE

---

## A. HARDENING DELTAS — what the deep-think caught

1. **KILL THE WORKTREES.** Census is read-only. Worktrees check out committed state — mapping a worktree = mapping a lie. All Phase 0 agents read canonical `D:\OB-1-CANONICAL` directly. No isolation needed for readers.

2. **EVIDENCE-OR-UNKNOWN GATE.** No verdict is valid without evidence coordinates (`file:line` or `command → result`). A verdict lacking evidence is auto-recorded as UNKNOWN, never GREEN. This is the single most important hardening line.

3. **DOMAIN OWNERSHIP BY PATH.** Every file belongs to exactly one domain. Defined in §D below.

4. **D7 IS NOT A REPO READ.** CF workers/D1/KV/R2/secrets need live probes — wrangler CLI or Cloudflare MCP. Not equivalent to repo reads.

5. **CROSS-DOMAIN SEAMS NEED AN OWNER.** Listed in §E. These fall between agents without explicit ownership.

6. **COVERAGE IS A NUMBER.** Each domain declares inventory denominator upfront. Reports `mapped / total`. ≥95% or gap listed as UNKNOWN with reason.

7. **BREADTH BEFORE DEPTH.** inventory via grep/glob first, targeted evidence-reads only. No whole-file reads.

---

## B. UNIVERSAL ROW SCHEMA

Every agent emits this exact shape:

```json
{
  "domain": "D1",
  "piece": "vocab-srs / spaced repetition",
  "type": "module|route|page|endpoint|artifact|script|skill|binding|worker|doc",
  "verdict": "GREEN|AMBER|RED|GHOST|UNKNOWN",
  "connectivity_test": "the specific loop checked, in words",
  "evidence": ["src/index.js:16 import", "src/index.js:2270 computeNextReview called",
               "public/chat.js:1397 calls /api/vocab/due", "review caller: test-portal.html:290 ONLY"],
  "gap": "review write-back not wired from live voice session; intervals frozen at day 1",
  "fix_recommendation": "wire chat.js to POST /api/vocab/review with grade after due-word exchange",
  "fix_effort": "S|M|L",
  "seam_with": ["D3"]
}
```

Output file per domain: `OPERATIONS/BATTLEFIELD/D{N}-matrix.json` (array of rows).

---

## C. VERDICT RUBRIC

| Verdict | Definition | Required evidence |
|---------|-----------|-------------------|
| 🟢 GREEN | Exists, wired, loop closes, exercised in the **live** path | full chain cited incl. write-back/consumer |
| 🟠 AMBER | Exists, plumbed, loop half-open OR only test/admin path closes it | break point cited |
| 🔴 RED | Orphaned import / dead route / stub handler / missing artifact | absence proven |
| ⚫ GHOST | Deployed or present but nothing references it | zero inbound refs across repo + infra |
| ❓ UNKNOWN | Could not verify within scope | reason + what's needed to resolve |

---

## D. THE SEVEN DOMAINS (scope-bounded, path-exclusive)

| # | Domain | Path ownership (exclusive) | Inventory denominator | Connectivity test |
|---|--------|---------------------------|----------------------|-------------------|
| **D1** | Runtime app | `APPS/NET-PET-AI/src/**`, `APPS/NET-PET-AI/public/**` | all src modules, all routes (`path ===`), all pages | import → called → loop closes → live consumer. **+verify AD-1/2/3: no external LLM in audio path** |
| **D2** | Soul system | `soul-logger` worker, `SCRIPTS/session-capture.ps1` | all `/api/soul/*` endpoints | session-capture fires on stop? soulcount is live query? **owns SOUL→DNA endpoint resolution** |
| **D3** | Pipeline chain | `RRL/`, `CANON/HEAVY-LEDGER/`, `CANON/STARMAP/`, `CANON/SOUL-KEYWORDS/`, `CANON/PHEROMONES/`, `CANON/PIPELINE/`, `CANON/REINCARNATION/` | 8 stages × runs 0–43 | per-run artifact present? merkle intact? inverted-index valid JSON? rfkw-search returns hits? |
| **D4** | Automation | `SCRIPTS/**` (`.ps1/.mjs/.cjs/.js`) | all script files | wired into a protocol or orphaned? runs clean? **owns registry↔context-bundle decoupling** |
| **D5** | Skills/commands | `.claude/commands/**`, `.kilo/command/**` (canonical only — exclude `.kilo/worktrees/**`) | all command files | skill matches live system reality? duplicates? death-protocol divergence resolved? |
| **D6** | Knowledge | all `**/*.md` NOT owned by D3/D5, excl. `.kilo/worktrees/**`, `node_modules/**` | all canon docs | REGISTRY v2 rubric: REGISTER/REFERENCE/DATA/DUPLICATE/ARCHIVE |
| **D7** | CF infra | live (not repo) | all workers, D1, KV, R2, DO, secrets | deployed AND referenced? via CF MCP / `wrangler list` / `/api/status`. GHOST detection |

**Global exclusions:** `.kilo/worktrees/**`, `.git/**`, `node_modules/**`

---

## E. CROSS-DOMAIN SEAMS (explicit owner)

| Seam | Owner | Consumer | Question |
|------|-------|----------|----------|
| SOUL→DNA endpoint | D2 | D3 | `GET /api/soul/session/{run}` vs `POST /api/soul/extract` — which is live? (Run 34 fix claim) |
| inverted-index corruption | D4 (writer script) | D3 (data) | does `build-soulkeys` / death STEP 6 produce valid JSON or `-Append` garbage? |
| registry ↔ context-bundle | D4 (script) | D6 (registry doc) | does script read the registry or hard-code paths? |
| Deepgram anti-drift law | D1 (audio path) | D6 (the law doc) | is live path compliant AND is the law in the registry? |
| reincarnation v5.0 | D5 (skill files) | D3 (artifacts) | did v5.0 changes land correctly? does `REINCARNATION-CONTRACT.md` exist and match? |

---

## F. THE MERGE (7 → 1, done by OB1)

1. Ingest `OPERATIONS/BATTLEFIELD/D{1-7}-matrix.json`
2. Produce `CANON/SYSTEM/BATTLEFIELD-MAP.md` (human) + `system-map.json` (machine)
3. Emit **ranked fix list** sorted by `(verdict severity × fix_effort⁻¹)` — RED-Small first
4. Append **BATTLEFIELD STATE rollup** to `COLD-START-BOOT.md`: counts per verdict per domain + link
5. Register `BATTLEFIELD-MAP.md` in mandatory-reads.json (D6 product folds in here)

---

## G. EXECUTION MODEL

```
- 7 agents, parallel, NO worktrees, all read canonical D:\OB-1-CANONICAL
- Each writes ONLY OPERATIONS/BATTLEFIELD/D{N}-matrix.json. No other writes.
- LAW: READ-ONLY. MAP, DON'T FIX. Found fix → fix_recommendation field, never applied.
- D7 may run read-only live probes (wrangler list / CF MCP / GET /api/status). No mutations.
- Breadth before depth: grep/glob inventory first, targeted evidence-reads only.
```

---

## H. EXIT GATE

Phase 0 is trustworthy only when ALL true:

- [ ] 7 matrices present and schema-valid
- [ ] Coverage ≥95% per domain, or gaps listed as UNKNOWN with reason
- [ ] **Zero verdicts without evidence** (anti-hallucination invariant)
- [ ] All 5 seams resolved to a verdict
- [ ] Merged `BATTLEFIELD-MAP.md` + ranked fix list + `COLD-START-BOOT.md` rollup produced

Only when this gate passes → Phase 0b (fix AMBER/RED) → TRACK A/B. Map first. Build on GREEN.

---

## SONNET AUDIT TARGETS (from Opus design session)

1. Whether reincarnation v5.0 changes Kilo made actually match the blueprint and `REINCARNATION-CONTRACT.md` exists and matches (seam §E)
2. Whether D6 rubric and REGISTRY v2 spec are fully consistent
3. Whether any blueprint handed to Kilo assumes a piece this census might return RED — if yes, that blueprint waits for the map
