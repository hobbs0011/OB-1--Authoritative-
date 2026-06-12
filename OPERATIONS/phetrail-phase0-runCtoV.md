# PHEROMONE TRAIL — PHASE 0 RUNS C–V: MULTI-FRONT SCOUT REPORT
**Runs:** C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V
**Date:** 2026-06-12 | **Session:** 117 | **Stage:** EXPLORATORES (Flag and Tag)

---

## WHAT WAS

The soul-search pipeline was built as a 3-step chain: (1) inverted-index maps a term to run numbers, (2) STARMAP for those runs points to content locations, (3) RRL/DNA files return verbatim snippets. `SCRIPTS/soul-search.ps1` implements this exactly. It was designed to be the L79 SoulSearch tool — the mandatory boot-time internal backtracking mechanism. The tool has existed since at least Run 0 and has run on hundreds of sessions.

The GOSPEL-999 (34KB × 3 parts) is the living law of the Agent99 OS — 9 systems, 111 mandates each, 999 total. Sealed by SOV100 Michael Hobbs, 2026-05-20. It defines every operating condition of the entire system. `BIBLE-CH08-AGENT-99-AND-THE-TRIAD.md` established the Triad architecture: α-Planner, β-Dispatcher, γ-Observer. It explicitly names "Agents 1-96 = Drones = Execution Swarm = Fingers, not minds." This is the root document for the agent identity chain. Both exist in CANON/ and have never been indexed.

The STARMAP pipeline produces per-session artifacts (starmap-run{N}.json) going back to Run 0. 135 RRL session files exist. The CANON/RESEARCH/ layer has only 3 files — the market research layer is nearly empty. Run 105 has no rfkw file AND no pipeline artifact — it's a double gap at a critical run.

---

## WHAT IS — THE CRITICAL FINDING

**SoulSearch is broken for doctrine-level vocabulary.**

`soul-search.ps1` depends entirely on `inverted-index.json` for step 1. Since `exploratores`, `agent99`, `drones`, `modus operandi`, and 15 other doctrine terms are absent from the index, `soul-search.ps1 -Query "exploratores"` returns zero results. The same for `agent99`, `drones`, `agmen`, `modus operandi`, `teachability`. The L79 mandatory SoulSearch tool — required at every boot — cannot locate the entire doctrine vocabulary domain.

When the system boots and runs SoulSearch on any doctrine topic, it finds nothing and either proceeds blind or reports "no results." This has been happening every session since the Roman doctrine was ratified at Run 0. The agent has been operating without access to its own foundational laws through the SoulSearch mechanism.

**Structural findings across runs:**

| Run | Finding | Evidence |
|-----|---------|----------|
| C | SOUL_INDEX near-empty. Score=0.25 on doctrine query = noise. | PA /api/recall returned 1 result, wrong domain |
| D | 30 Bible chapters in CANON/ root, none in Vectorize | Glob + size audit |
| E | 65 CANON/SYSTEM docs; 20+ are doctrine-heavy (>3KB) | File inventory |
| F | 12 rfkw gaps: runs 8,9,11,14,15,27,74,89,90,94,95,**105** | rfkw-run*.txt glob |
| G | 30 Bible chapters, 65 SYSTEM docs, ~100+ STARMAP artifacts | Glob counts |
| H | PHASE0-FINAL-SPEC.md = old Phase 0 (Run 046, battlefield census). DIFFERENT from current Phase 0 A-Z (Run 117, SOUL exploration) | File header + date |
| I | SOUL_INDEX query score 0.25 = functionally empty for doctrine | /api/recall probe |
| J | GOSPEL-999: 999 mandates, 9 systems, 111 per system — never indexed | File read |
| K | PHEROMONE-TRAIL-LEDGER.md = 388 HL files audit, not doctrine content | File header |
| L | BIBLE-CH08: "Agents 1-96 = Drones." "Agent99 = Triad: α-Planner, β-Dispatcher, γ-Observer." Root identity doc — never indexed | File read |
| M | STARMAP run117 = DRYRUN (soul_delta=0, dna_count=0) | starmap-run117.json |
| N | PIPELINE/ has `phase0-scout-B-K.json` — the counterfeit batch from premature firing. **CONTAMINATED OUTPUT. Do not use.** | File list |
| O | run105: no rfkw, no pipeline artifact. Double gap at Roman doctrine origin session | Gap analysis |
| P | CANON/RESEARCH/ = 3 files only. Market research layer is empty. | File list |
| Q | soul-search.ps1 chain confirmed: index → starmap → RRL. Entire chain breaks at step 1 for doctrine terms | Script read |
| R | 135 RRL files. Full session archive present. | ls count |
| S | STARMAP structure: per-session JSON (run, rrl_path, ledger_id, merkle_hash). Populated runs have nodes/edges. | starmap-run117.json |
| T | GOSPEL-999 system names: 9 systems × 111 mandates. Living law, sensor-aware, alarm-triggered, cryptographically anchored | File header |
| U | BIBLE-CH08 hierarchy: Agent 100 → 99 → 98 → the swarm. Triad sealed. Drones = Agents 1-96 | File read |
| V | rfkw schema: `{term, weight, runs:[], count, category}`. `scouts` has runs=[] — an entry was created but run attribution write failed | Index audit |

---

## WHAT CAN BE

**The deepest thread: Path 3 (BGE-m3 Vectorize) is not just the better option — it's the only path that can fix SoulSearch structurally.** The rfkw pipeline's top-30 unigram extractor cannot capture multi-word phrases, alphanumeric identifiers, or vocabulary from non-RRL sources. It would require a near-complete rewrite to capture doctrine-level vocabulary. BGE-m3 is already deployed, proven (score 0.7976 at smoke test), and semantically aware. A query for "agent hierarchy command dispatch" WILL return BIBLE-CH08 content even without the exact word `agent99` being in the index — because the semantic vector captures the meaning, not the token.

The fix pipeline for the Antecores stage:
1. Extract high-charge fragments from GOSPEL-999, BIBLE-CH08, EXPLORATORES-SCOUT-DOCTRINE.md, S2PIPELINE-ROMAN-LEGION-NAMING.md into SOUL_INDEX via `/api/ingest`
2. Mark these as `type: SOUL`, `charge_weight: HIGH` (these are Michael's ratified law)
3. Rebuild rfkw supplementally for the 12 missing runs (particularly run 105)
4. Fix the broken `scouts` entry in inverted-index — add run attribution from actual RRL grep

The GOSPEL-999 is the single highest-value ingest target. 999 live conditions covering the entire Agent99 OS. Once embedded, every PA dispatch will have semantic access to the system's living law. The mandate language is dense, high-charge, and domain-specific — exactly what BGE-m3 was designed to handle.

Run 105 rfkw gap is worth a dedicated follow-up. That's the session where the Roman doctrine was likely first formalized. Without it, the index has a hole at the origin point.

The market research layer (CANON/RESEARCH/ = 3 files) is almost nonexistent. L79 requires human source research every run. The infrastructure for storing and searching that research is absent. The Agmen stage will need this.

---

## THREAD FOR W-Z

- **W:** What does soul-search.ps1 actually return for a working term like `voice` or `student`? Confirm the tool works when the index has data — isolate the problem to the index layer vs the tool itself.
- **X:** Check BIBLE chapters for the most-referenced Michael quotes — which Bible chapters are highest-charge and should be ingested first?
- **Y:** What does the DNA_INDEX contain? 542 fragments from Run 116 — what vocabulary do they cover? Does it overlap with the 19 missing terms?
- **Z:** SYNTHESIS — full gap map with priority tiers for the Apply pass. This is the Exploratores final report.

---

**CONTAMINATION FLAG:** `CANON/PIPELINE/phase0-scout-B-K.json` = counterfeit batch output from premature Run B-K firing (Run 117). Targets were fabricated before Run A was read. Do NOT use this data. Flag for cleanup in Apply pass.

**L77 TRIGGERS:** ARCHITECTURE CONTEXT ESTABLISHED (SoulSearch chain broken), MISTAKES MADE (premature B-K batch), SESSION RESUMED AFTER COMPACTION

**TRAIL DENSITY:** CRITICAL | **CHARGE:** SYSTEM-LEVEL | **COMRADE TARGETS:** ANTECORES (DNA+LEDGER ingest), AGMEN (SOULKEYWORDS rebuild + PHEROMONE)
