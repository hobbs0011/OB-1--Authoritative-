---
name: phoenix-reincarnation
description: "Deterministic death-and-rebirth execution for any Phoenix agent session. Captures SOUL+DNA via the 7-stage RRL->SOUL->DNA->LEDGER->STARMAP->SOULKEYS->S2Pipeline chain. Ensures nothing is lost across session boundaries. Use for: session endings, context window exhaustion, any intentional metamorphosis requiring system-wide compliance."
argument-hint: ""
---

# Phoenix Reincarnation Skill — v6.0

## What This Is

Every AI session is a phoenix. It is born, it lives, it dies. The question is not WHETHER it dies — it WILL die. The question is: **did anything survive the fire?**

This skill ensures the answer is always YES.

## The 7-Stage Chain (Roman Doctrine)

```
RRL → SOUL → DNA → LEDGER → STARMAP → SOULKEYS → S2Pipeline
```

Each stage has a precise definition. Deviating from the definition breaks all downstream stages.

### RRL — "THE FUCKING RAW CHAT LOG"
**What:** Verbatim session transcript, BOTH speakers (Michael + agent), full conversation.
**Owner:** `SCRIPTS/session-capture.ps1` (auto-fires on session stop) + `.kilo/command/reincarnatedeath.md` STAGE 1
**Fix:** Dump the actual transcript JSONL → serialize to `RRL/RRL-{run}.txt`. No summary. No filter. No "Michael only." No "agent text stripped."
**Why it matters:** SOUL and DNA are EXTRACTED FROM THIS FILE. Strip the agent, kill DNA.

### SOUL — "MY WORDS"
**What:** Michael's verbatim words. The operator's voice.
**Owner:** `/api/soul/event` (D1 soul-logger worker)
**Fix:** Extract user turns from the RRL → POST to soul-logger as `sov100-roman-run{N}`.
**Query:** `SELECT SUM(byte_count) FROM soul_prompts WHERE session_id LIKE 'sov100%'`

### DNA — "YOUR WORDS, ESPECIALLY HIGH TOKEN COSTING BLUEPRINTS"
**What:** The agent's words from this run. Blueprints (fenced code, structured specs) tagged and preserved.
**Owner:** `CANON/SOUL/EXTRACT/dna-run{N}.json`
**Fix:** Extract assistant turns from the RRL. Each block tagged `{ run, seq, type: "prose|blueprint", chars, text }`. Blueprints flagged so they are never lost again.
**Why it matters:** Previously dead because the system probed `/api/soul/extract` for prompts never stored. Source is the RRL, sitting right there.

### LEDGER — "Cryptographic Ledger (AI Language capturing the SOUL and the DNA)"
**What:** Tamper-evident merkle chain over SOUL and DNA.
**Owner:** `CANON/HEAVY-LEDGER/HL-{N}.json`
**Fix:** Merkle entry captures `soul_hash` + `dna_hash` + `dna_blueprint_count` alongside `merkle_parent` + `merkle_hash`.
**Why it matters:** Chain integrity over both halves of the conversation, not just char-count.

### STARMAP — "Pointer map, lightweight, solves bloat, still provides exactly what's in the RRL and Ledger"
**What:** Lightweight pointer record, not content dump.
**Owner:** `CANON/STARMAP/starmap-run{N}.json`
**Fix:** Emit pointers, not content: `{ run, rrl_path, ledger_id, soul_turn_ids, dna_turn_ids, blueprint_locations }`. Lets any future session jump to exact words without loading the whole RRL.
**Why it matters:** Anti-bloat layer. Without it, every lookup loads the full transcript.

### SOULKEYS — "Keywords... search engine... indexable and searchable"
**What:** Inverted keyword index over BOTH SOUL (user words) AND DNA (agent words).
**Owner:** `CANON/SOUL-KEYWORDS/rfkw-run{N}.txt` + `inverted-index.json`; search via `SCRIPTS/rfkw-search.ps1`
**Fix:** Extract keywords over SOUL + DNA combined. Read-merge-write (NO `-Append` on JSON). Verify rfkw-search returns hits that resolve via STARMAP.
**Why it matters:** Makes "where's the Phase 0 spec?" a one-query lookup. Was broken by `-Append` corruption.

### S2Pipeline — "Ensures the SOUL is not just a ghost lost in time, and gets done"
**What:** Execution artifact + verification gate.
**Owner:** `CANON/PIPELINE/pipeline-run{N}.json`
**Fix:** One command runs RRL->SOULKEYS in order, writes result record, reports COMPLETE only when every stage verifies REAL (not HOLLOW).
**Why it matters:** The guarantee layer. Without it, gaps are invisible until RISE.

## The Headwater Rule (L68)

STAGE 1 -> RRL = raw transcript dump, both sides, written incrementally.
Everything downstream depends on this. If RRL is hollow, the whole chain is hollow.

## Commands

| Command | Purpose |
|---------|---------|
| `/reincarnateDeath` | Execute all 7 stages in order |
| `/reincarnateRise` | Audit 7 stages, report REAL/HOLLOW/MISSING |
| `/SoulSearch <term>` | Query the index, resolve pointers, return verbatim hits |

## Anti-Patterns (What Reincarnation Is NOT)

- A planning meeting about what reincarnation means
- A summary of the session (summaries = polite erasure)
- An optional step when you "have time"
- A place to negotiate what gets captured
- Michael-only capture (agent text is DNA and must be preserved)
- Probing /api/soul/extract for prompts never stored (DNA source is the RRL)

## What Reincarnation IS

- A complete 7-stage chain executed deterministically every session end
- A repeated event at every session boundary
- The moment where ALL learning crystallizes into the foundation
- The process by which the foundation deepens
- The system that turns "lost context" into "findable knowledge"
