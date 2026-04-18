---
name: reincarnatedeath-merge
description: "Parallel chat death merge protocol. MERGE1 creates the file; MERGE2+ append only. Soul DNA is highest priority."
argument-hint: "MERGE{N} e.g. MERGE1, MERGE2"
---

# /reincarnatedeath-merge

Use this when multiple chats from one session are dying into one unified reincarnation artifact.

## Merge Rules

- MERGE1: create the merge artifact and write full extract.
- MERGE2+: read existing artifact first, append your extract, deduplicate overlaps.
- Never overwrite earlier merge sections.

## Strict Guardrails (Mandatory)

1. Staged execution only:
- Work in short stages (discover -> verify -> append -> validate).
- Do not run broad/destructive operations in one step.

2. Evidence required for claims:
- If a command result is referenced (doctor, verify, deploy, audit), include verbatim evidence block or exact sourced output in the merge artifact.
- No evidence, no closure.

3. Root-lane lineage required:
- Merge blocks must be anchored in root CANON lane artifact, not only external/kilo/worktree references.
- External references are allowed only as supporting evidence.

4. Explicit conflict ledger:
- Any path mismatch, owner mismatch, lane mismatch, or missing block must be tagged as MERGE_CONFLICT with an actionable resolution item.

5. No silent dedup:
- When deduplicating, record what was deduped and why.

6. Fail closed on ambiguity:
- If merge number, run file, or source evidence is uncertain, do not mark complete.

7. Append-only hard rule:
- Add new blocks only. Never rewrite prior merge blocks.

8. Completion contract:
- The merge is not complete until required gates pass in writing inside the artifact.

## Soul DNA Law (Highest Priority)

1. Capture this chat's unique Soul DNA first:
- Verbatim user language
- Intent and hard constraints
- Decisions and emotional signal

2. Fail closed if missing:
- If unique Soul DNA for this chat cannot be captured, do not mark merge complete.

3. No polite erasure:
- Keep meaningful raw wording intact.

## Required Merge Block

Add a block with:
- MERGE number
- Chat context summary line
- Raw Soul DNA quotes (verbatim)
- Decisions and corrections unique to this chat
- Explicit unfinished actions
- Evidence references (commands/logs/artifacts used)
- Conflict flags and current resolution status

## Finalization Gate (Last Merge Only)

The final merge may close only when all are true:
- All merge blocks present
- Soul DNA captured from every merged chat
- Conflicts flagged explicitly
- Unified pending work list produced

Additionally, all must be true:
- Root-lane artifact contains MERGE1..MERGEn evidence blocks.
- Each critical claim has an evidence section.
- Any unresolved conflict is carried as OPEN with owner + next action.
- Status line explicitly states CLOSED or CLOSED WITH OPEN CONFLICTS.

## Mandatory Gate Output

Every merge run must output this checklist in the artifact:

- Gate 1 (Soul DNA captured): PASS/FAIL
- Gate 2 (Append-only respected): PASS/FAIL
- Gate 3 (Evidence attached): PASS/FAIL
- Gate 4 (Conflicts ledgered): PASS/FAIL
- Gate 5 (Pending work unified): PASS/FAIL
- Gate 6 (Root-lane lineage complete): PASS/FAIL
