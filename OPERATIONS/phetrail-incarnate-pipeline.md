# PHEROMONE TRAIL — INCARNATE PIPELINE (6-Gate LostSoul System)
**Thread:** INCARNATE_PIPELINE | **Born:** Run 117 | **File:** APPS/PHOENIX-ARCHITECTI/src/incarnate.js
**Date captured:** 2026-06-13 | **Tracer:** Haiku scout

---

## WHAT IS — CRIME SCENE

6 gates. Live. In `phoenix-architecti`. Exported via `handleIncarnate`.

| Gate | Name | Mechanism | Trigger |
|------|------|-----------|---------|
| 1 | DEATH Capture | D1 `rrl_archive` + `run_state` insert. Fetches anchor SOUL from soul-logger for context. Fires Gates 2+4+5 non-blocking. | `POST /api/incarnate/death` |
| 2 | LostSoul Scan | Llama 70B — extracts every directive SOV100 wrote NOT already in SOUL archive. Creates BB entries `source=lostsoul`. | Fires from Gate 1 (non-blocking) |
| 3 | RISE Audit | Reads `run_state` last row. Queries `backburner` for open LostSouls. Returns report. | `GET /api/incarnate/rise` |
| 4 | Velocity Monitor | Regex — URGENCY_MARKERS × DIRECTIVE_PATTERNS. Creates BB entries `source=velocity-monitor, priority=!!` | Fires from Gate 1 (non-blocking) |
| 5 | Completeness Audit | Llama 70B — asked vs executed. Creates BB entries `source=completeness-audit` | Fires from Gate 1 (non-blocking) |
| 6 | Pattern Scanner | Llama 70B — last 5 runs, recurring unresolved items. Runs on cron. Creates BB `source=pattern-scan` | `runPatternScanner` on cron + `POST /api/incarnate/pattern-scan` |

**Added Run 120:** `gatePheromoneDeepDive` — scans for AGENT99_WORDS (Agent99, OBI, ANAKIN, DOOKU, Phoenix, PhoenixCoder, PhoenixArt, PCC, watchdog, FORCEAWARENESS, CommandDO). Creates BB `source=phedived`. Endpoint: `POST /api/incarnate/phedive`.

---

## EVIDENCE — WHAT I SEE

**extractUserMessages function (line 19-35):** Parses three formats:
- JSON lines: checks `obj.role === 'user'` OR `obj.type === 'human'`
- Plain text: regex `/^(Human:|SOV100:|Michael:)/i`

**⚠️ FLAG:** This parser uses `obj.role` directly — same envelope mismatch as the SOUL contamination bug. Claude Code JSONL nests at `obj.message.role`. If this function receives Claude Code JSONL, it extracts 0 user messages and falls back to `rrl_text.slice(0, 8000)` (raw bytes, not extracted turns).

**Gate 2 context injection (line 107-110):** Passes `anchorKeywords` + `anchorRecentPrompts` from soul-logger to Llama — so it knows what's ALREADY captured and only flags NEW directives. This is the dedup mechanism. Depends on soul-logger anchor being accurate.

**BB entry limit (line 133):** `directives.slice(0, 20)` — max 20 BB entries per Gate 2 scan. Gate 4 = 10 unique hits. Gate 5 = 10 gaps. Gate 6 = 8 patterns. Total max per run: 48 BB entries from IncarnatePipeline alone.

**D1 tables required:** `rrl_archive`, `run_state`, `backburner`, `pcc_metrics`. These are in `soul-archive` D1 (id: c69a11bc-064b-478f-9b1f-e9b8e2431fb8). Schema source unknown from this file alone.

**Auth gate (line 365):** `checkAdminKey` on all routes. Requires `x-pa-auth` or `WORKER_ADMIN_KEY`.

**No watcher on BB entries created by IncarnatePipeline.** Entries created. No cron reads them back to OB-1. No Telegram alert fires. Loop not closed.

---

## FLAGS

- `extractUserMessages` — same envelope mismatch risk as SOUL contamination bug. Evidence at line 25.
- `gatePheromoneDeepDive` (Run 120 addition) — scans for AGENT99_WORDS but `watchdog` still in the list even though it was renamed to `FORCEAWARENESS` Run 120.
- BB entries pile up with no consumer routing them back to operator. BB is a sink, not a loop.
- `rrl_archive` stores full raw RRL text in D1. For a 1.2MB RRL (Run 119 size), this is a large D1 row. No truncation guard.

---

## CONNECTING KEYWORDS

`LostSoul` → `backburner` → `BB entries` → `SOUL archive dedup` → `soul-logger anchor` → `anchorKeywords` → `SOUL_INDEX` (Vectorize) → `pheromone recall`

`runPatternScanner` → `cron` → `last 5 runs` → `rrl_archive` → `D1` → `soul-archive`

`gatePheromoneDeepDive` → `AGENT99_WORDS` → `FORCEAWARENESS` → `PCC naming correction Run 120`

`handleIncarnate` → `checkAdminKey` → `security.js` → `WORKER_ADMIN_KEY` → CF secret

---

## L77 TRIGGERS

- ARCHITECTURE CONTEXT ESTABLISHED — full 6-gate system documented
- FLAG: extractUserMessages envelope mismatch risk (same defect family as SOUL contamination)
- FLAG: BB sink with no watcher (followup/followthrough law L81 gap)

**COMRADE TARGETS:** Deep think model. Not OB-1 yet. Not Obi. This is recon only.
