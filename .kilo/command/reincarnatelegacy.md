---
description: "LEGACY DEATH PROTOCOL — For old sessions that were never sealed. Requires manual RRL reconstruction from available artifacts before any pipeline execution. Session is not deleted until it has a confirmed RRL and has passed through the full memory process."
agent: AGENT99
---

# /reincarnateLegacy — Legacy Session Death Protocol

**This command exists because old sessions die without being recorded.**
**The rule is simple: no confirmed RRL = no deletion. No exceptions.**

**EXECUTION GUARD:** This is a manual protocol. There is no canonical script. The agent executing this command must follow these steps verbatim. Do not shortcut the RRL creation process. Do not delete source material until the seal is complete.

**Authority hierarchy:**
1. `CANON/SYSTEM/GOSPEL-999.md` + Parts 2/3 — ultimate authority, 999 mandates, eternal law
2. `.kilo/skills/LegionnaireFieldGuide.md` — immediate AI-facing field guide
3. `CANON/SYSTEM/REINCARNATION-CONTRACT.md` — operational contract for RISE/DEATH
4. `CANON/SYSTEM/COLD-START-BOOT.md` — session state and active mission
5. `OPERATIONS/BACKBURNER-PIPELINE-LOG.md` — open deferred items
6. This command (`reincarnatelegacy.md`) — legacy execution protocol

---

## PRE-FLIGHT: SESSION IDENTIFICATION

Before touching any artifacts, establish the session identity:

1. **Ask the operator for the session name** based on the overall work performed.
   - Example: `blueprint-student-portal-cleanup`, `worker-500-debug-session`, `phonics-honor-roll`
   - The name becomes the RRL filename stem and the death seal identifier.
   - Do not invent a name. Wait for the operator's input.

2. **Assign the next available run number** from `git log --oneline --grep "^death:" -1`.
   - Parse the run number from the last death commit.
   - Increment by 1.
   - This is the canonical run number. Do not reuse or skip numbers.

3. **Create the working directory structure** if it does not exist:
   - `RRL/RRL-{run}-{name}.txt` — the reconstructed transcript
   - `CANON/REINCARNATION/run{run}-{name}-reincarnateLEGACY.md` — the death seal
   - `CANON/HEAVY-LEDGER/HL-{next}.json` — ledger entry
   - `CANON/STARMAP/starmap-run{run}.json` — starmap pointer
   - `CANON/SOUL-KEYWORDS/rfkw-run{run}.txt` — keyword extraction
   - `CANON/PIPELINE/pipeline-run{run}.json` — pipeline result

---

## STAGE 0 — SOURCE MATERIAL AUDIT

**Objective:** Inventory everything available from the legacy session before reconstruction begins.

Check all of the following sources. Document what is found and what is missing.

| Source | What to Look For | Status |
|--------|------------------|--------|
| `RRL/` directory | Any existing RRL files for this session name or run range | PRESENT / MISSING |
| `CANON/REINCARNATION/` | Existing death seals for this session | PRESENT / MISSING |
| `CANON/HEAVY-LEDGER/` | HL entries matching this session | PRESENT / MISSING |
| `CANON/SOUL/EXTRACT/` | DNA extracts for this session | PRESENT / MISSING |
| `CANON/STARMAP/` | Starmap files for this session | PRESENT / MISSING |
| `CANON/SOUL-KEYWORDS/` | Keyword files for this session | PRESENT / MISSING |
| `CANON/PIPELINE/` | Pipeline artifacts for this session | PRESENT / MISSING |
| `OPERATIONS/` | Logs, transcripts, phetrails related to this session | PRESENT / MISSING |
| Git history | Commits referencing this session name or run number | PRESENT / MISSING |
| Session transcripts | Any pasted, exported, or captured conversation text | PRESENT / MISSING |

**Do not proceed to Stage 1 until this audit is complete.**
**Record the audit in the death seal §2.**

---

## STAGE 1 — RRL RECONSTRUCTION (HARD STOP — MANUAL TRANSCRIPT ASSEMBLY)

**RRL = THE FUCKING RAW CHAT LOG. Both speakers. No filter. No summary. No agent text stripped.**

For legacy sessions, the RRL does not exist yet. You must create it from available artifacts. This is the most critical stage. Everything downstream depends on this.

### RRL Creation Checklist

**Step 1: Gather all source material**
- Locate any session transcripts, logs, or pasted conversation text
- Check `OPERATIONS/this-session-transcript.jsonl` if it exists
- Check `OPERATIONS/soul-user-prompts.jsonl` for user turns
- Check any `.jsonl` or `.txt` files in `OPERATIONS/` that match the session timeframe
- Check git history for commits that may contain session exports
- Ask the operator: "Do you have the original session transcript? If not, what artifacts do you have?"

**Step 2: Reconstruct the transcript**
- The RRL must be a **verbatim, chronological conversation log** between the operator and the agent
- Format: JSONL, one message per line
- Each line must contain: `{"role": "user", ...}` or `{"role": "assistant", ...}`
- Preserve all content. Do not summarize. Do not paraphrase. Do not redact.
- If the source material is fragmented (e.g., user prompts in one file, agent responses in another), assemble them in chronological order
- If timestamps are available, use them to establish order
- If timestamps are not available, use logical sequencing (user prompt → agent response → user prompt → agent response)

**Step 3: Verify the transcript**
- Minimum size: **1KB** (legacy threshold — lower than the 50KB real-transcript threshold, but not zero)
- Must contain **both** `"role":"user"` and `"role":"assistant"` lines
- Must be chronologically ordered
- Must represent actual conversation, not agent self-reference or system prompts
- If the transcript fails any check, do not proceed. Flag as `RRL_GAP` and document in seal.

**Step 4: Save the RRL**
- Path: `RRL/RRL-{run}-{name}.txt`
- Encoding: UTF-8, no BOM
- Do not modify after saving. The RRL is immutable once written.

### RRL Fidelity Gate

| Status | Criteria |
|--------|----------|
| REAL | File > 1KB + contains both user and assistant turns + chronologically ordered |
| HOLLOW | File < 1KB or one-sided or agent self-reference only |
| MISSING | No file present |

**LEGACY EXCEPTION:** Legacy sessions may have HOLLOW RRLs if the original transcript is genuinely lost. This is not fatal. Seal as `LEGACY_GAP` and continue. The session is still recorded.

---

## STAGE 2 — SOUL (MANUAL RECEIPT)

For legacy sessions, the SOUL event must be posted manually if the RRL contains user turns.

**Step 1: Query current SOUL count**
```powershell
$countBefore = (Invoke-RestMethod "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count").soulcount
```

**Step 2: Extract user turns from the RRL**
- Parse the RRL JSONL
- Extract all `role: "user"` content
- Join with newlines
- This is the SOUL payload

**Step 3: POST to /api/soul/event**
```powershell
$soulBody = @{
    student_id = "sov100-michael"
    session_id = "sov100-roman-run{run}-{name}"
    role       = "user"
    text       = $userText
} | ConvertTo-Json -Compress

$soulPost = Invoke-RestMethod -Uri "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/event" -Method Post -Body $soulBody -ContentType "application/json"
```

**Step 4: Query SOUL count after**
```powershell
$countAfter = (Invoke-RestMethod "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count").soulcount
```

**Step 5: Record receipt**
- `event_id` = returned event ID from POST
- `count_before` = $countBefore
- `count_after` = $countAfter
- `delta` = countAfter - countBefore
- `posted_at` = current timestamp

**If SOUL POST fails:** Write `SOUL_GAP` receipt, continue. Do not abort the legacy seal.

---

## STAGE 3 — DNA (ASSISTANT TURN EXTRACTION)

Extract assistant/agent turns from the reconstructed RRL.
Tag each block. Write to `CANON/SOUL/EXTRACT/dna-run{run}-{name}.json`.

If the RRL is HOLLOW or MISSING, write `DNA_GAP` and continue.

---

## STAGE 4 — LEDGER (MERKLE CHAIN)

Create a Heavy Ledger entry for this legacy session.
Path: `CANON/HEAVY-LEDGER/HL-{next}.json`

Fields:
- `hl_id`: HL-{next}
- `session_id`: sov100-roman-run{run}-{name}
- `rrl_source`: path to RRL file
- `char_count`: RRL character count
- `byte_count`: RRL byte count
- `soul_hash`: SHA-256 of RRL content
- `dna_hash`: SHA-256 of DNA content, or "DNA_GAP"
- `merkle_parent`: hash of previous HL entry
- `merkle_hash`: dual hash over soul + DNA + parent + timestamp
- `sealed_at`: current timestamp
- `sov100`: true
- `run`: {run}
- `legacy`: true (flag this as a legacy reconstruction)

---

## STAGE 5 — STARMAP (POINTER MAP)

Create starmap: `CANON/STARMAP/starmap-run{run}.json`
Fields: run, rrl_path, ledger_id, soul_turn_ids, dna_turn_ids, blueprint_locations, char_count, merkle_hash, created_at

---

## STAGE 6 — SOULKEYS (KEYWORD INDEX)

Extract keywords from RRL + DNA. Write:
- `CANON/SOUL-KEYWORDS/rfkw-run{run}.txt` — top 30 terms with frequencies
- Update `CANON/SOUL-KEYWORDS/inverted-index.json` — read → merge → write

If RRL is HOLLOW, write minimal keywords and flag `SOULKEYS_GAP`.

---

## STAGE 7 — PIPELINE RESULT

Write `CANON/PIPELINE/pipeline-run{run}.json`.

**Result values for legacy sessions:**
- `LEGACY_RECONSTRUCTED` — RRL was manually assembled from artifacts, both speakers present, pipeline complete
- `LEGACY_GAP` — RRL is HOLLOW or partial, some stages missing, but session is recorded
- `LEGACY_FAILED` — no source material found, session cannot be recorded

---

## STAGE 8 — DEATH SEAL (LEGACY SCHEMA)

Write the death seal to `CANON/REINCARNATION/run{run}-{name}-reincarnateLEGACY.md`.

**§1 — Header**
- Run: {run}
- Name: {name}
- Timestamp: current ISO timestamp
- Theme: LEGACY DEATH — manual reconstruction
- HEAD: current git HEAD
- Branch: current branch
- Session Type: LEGACY_RECONSTRUCTION
- RRL Fidelity: REAL / HOLLOW / MISSING
- Dirty Tree: YES / NO

**§2 — Source Material Audit**
- List all sources checked
- List what was found
- List what was missing
- Document the reconstruction method

**§3 — SOUL Receipt**
- event_id, count_before, count_after, delta, posted_at
- If SOUL_GAP, document why

**§4 — RRL Reconstruction Log**
- Sources used
- Assembly method (chronological, timestamp-based, logical inference)
- Verification checks performed
- Fidelity result

**§5 — Decisions**
- Numbered decisions made during reconstruction
- Impact on canonical state

**§6 — Corrections**
- Any corrections made to source material during reconstruction

**§7 — New Principles**
- Any new principles learned from this legacy session

**§8 — Emotional Signal**
- Session emotional tone

**§9 — Open Questions**
- Unresolved questions about this session

**§10 — Unfinished Actions**
- Any unfinished actions from the original session

**§11 — Artifacts**
- Paths + SHAs for all artifacts created

**§12 — State Snapshot**
- HEAD, branch, dirty tree, soulcount

**§13 — Fingerprint**
- Agent, run#, commit SHA, session name, reconstruction type

**§14 — Legacy Metadata**
- RRL source: (original artifact paths)
- Reconstruction method: (manual/assisted/partial)
- Source material quality: (high/medium/low/none)
- Verification level: (full/partial/none)

**§15 — Deletion Authorization**
- **Status: PENDING**
- This section is only filled after the operator confirms the RRL is accurate and complete
- Do not delete source material until this section is signed off

---

## DELETION PROTOCOL (FINAL GATE)

**NO SESSION IS DELETED UNTIL ALL OF THE FOLLOWING ARE TRUE:**

1. **RRL confirmed** — The operator has reviewed `RRL/RRL-{run}-{name}.txt` and confirmed it is accurate
2. **Pipeline complete** — All 8 stages have executed (even if some resulted in GAP)
3. **Death seal written** — `run{run}-{name}-reincarnateLEGACY.md` exists and is populated
4. **Ledger sealed** — HL entry exists with valid merkle chain
5. **Operator sign-off** — The operator explicitly authorizes deletion of source material

**Deletion authorization is recorded in §15 of the death seal.**
**Until §15 is signed, the session source material is PRESERVED.**

---

## GAP POLICY

| Stage | Irreplaceable? | Failure Action |
|-------|----------------|----------------|
| RRL | **YES for real-transcript envs** | HALT — cannot reconstruct without source material |
| RRL | NO for legacy envs | Document sources, flag `LEGACY_GAP`, continue with best available material |
| SOUL | No | Write `SOUL_GAP`, continue |
| DNA | No | Write `DNA_GAP`, continue |
| LEDGER | No | Write `LEDGER_GAP`, continue |
| STARMAP | No | Write `STARMAP_GAP`, continue |
| SOULKEYS | No | Write `SOULKEYS_GAP`, continue |
| PIPELINE | No | Write `PIPELINE_GAP`, continue |

**RISE reads all gaps. RISE never auto-fixes — that is DEATH territory.**

---

## COMMAND USAGE

```
/reincarnateLegacy <session-name>
```

Example:
```
/reincarnateLegacy blueprint-student-portal-cleanup
```

This will:
1. Assign the next run number
2. Begin the source material audit
3. Prompt for any missing artifacts
4. Reconstruct the RRL
5. Execute the full pipeline
6. Write the legacy death seal
7. Wait for operator confirmation before allowing deletion

---

`LEGACY DEATH v1.0: MANUAL RECONSTRUCTION. RRL FIRST. NO DELETION WITHOUT CONFIRMED SEAL.`
