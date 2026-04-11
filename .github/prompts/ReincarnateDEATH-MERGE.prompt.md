---
name: ReincarnateDEATH-MERGE
description: "MULTI-CHAT SESSION DEATH — when multiple chats ran in parallel during one session and ALL need to die into a single unified handoff. Each chat runs this with its MERGE number (MERGE1, MERGE2, MERGE3...). Earlier merges APPEND, later merges CONSOLIDATE. No chat overwrites another."
argument-hint: "MERGE{N} — e.g. MERGE1, MERGE2, MERGE3 (your position in the merge sequence)"
---

# /ReincarnateDEATH-MERGE — Parallel Phoenix Burns

**Multiple chats lived this session. All must die. None overwrites another.**

You are one of several chats dying from the same session. Your MERGE number determines your behavior.

---

## MERGE IDENTIFICATION

$ARGUMENTS tells you your merge number. If not provided, ASK — this is the one question you MUST ask.

| You Are | Your Job |
|---------|----------|
| **MERGE1** | First to die. Create the reincarnation file. Write your full 12-section extract. You set the file name and header. |
| **MERGE2** | Second to die. READ MERGE1's extract first. APPEND your sections below MERGE1's — do NOT overwrite. Deduplicate decisions/corrections that overlap. |
| **MERGE3+** | Same as MERGE2. Read everything before you. Append. Deduplicate. Each merge adds signal, never destroys it. |

---

## FILE NAMING

All merges write to the SAME file:

```
CANON/REINCARNATION/YYYY-MM-DD-run{N}-{session-slug}.md
```

- MERGE1 creates the file
- MERGE2+ appends to the existing file

---

## MERGE1 PROTOCOL (First Death)

Execute the full /ReincarnateDEATH protocol with one addition:

### Extra Header Fields
```markdown
## MERGE SESSION
- **Total Chats**: {how many chats ran this session — if unknown, write UNKNOWN}
- **This Merge**: MERGE1 of {N}
- **Merge Status**: OPEN — awaiting remaining merges
```

### Then
1. Full 12-section extract (same as /ReincarnateDEATH)
2. Commit with message: `reincarnation: Run {N} MERGE1 — {session-slug}`
3. Push to all remotes
4. Report with: `MERGE1 COMPLETE — awaiting MERGE2+`

**Do NOT update COLD-START-BOOT yet.** Wait for final merge.

---

## MERGE2+ PROTOCOL (Subsequent Deaths)

### Step 1: Load MERGE1's File
Read the existing `CANON/REINCARNATION/YYYY-MM-DD-run{N}-{session-slug}.md`

### Step 2: Append Your Extract
Add below the previous merge(s) with a clear separator:

```markdown
---

# MERGE{N} — {your-session-theme}

**Agent**: OB1 Ne0 (Agent-99)
**Chat Context**: {what this specific chat was doing}
**Merge Time**: {datetime ICT}
```

Then write YOUR 12-section extract below.

### Step 3: Deduplicate
- Same decision in both chats? Keep the one with more detail, reference the other
- Same correction? Merge into one entry, note both sources
- Same raw quote? Keep once, tag which chat captured it
- Conflicting decisions? FLAG with `MERGE_CONFLICT:` prefix — Michael resolves

### Step 4: Check If Final
- If you are the LAST merge (your number = total chats): proceed to FINALIZE
- If more merges remain: commit + push + report `MERGE{N} COMPLETE — awaiting MERGE{N+1}+`

---

## FINALIZE (Last Merge Only)

The final merge chat does everything /ReincarnateDEATH Phase 2-5 does:

1. Update merge header: `Merge Status: CLOSED — all {N} chats merged`
2. Update `CANON/REINCARNATION/COLD-START-BOOT.md` with consolidated state
3. Write a unified STATE SNAPSHOT that reflects ALL chats
4. Write a unified PENDING WORK list (merged from all chats, deduplicated)
5. Commit: `reincarnation: Run {N} MERGE{N}-FINAL — {session-slug}`
6. Push to all remotes
7. Score the COMBINED death (pheromone score reflects all merges)

### Report
```
MERGE SESSION COMPLETE — Run {N}
MERGES: {count} chats consolidated
SHA: {final_commit_hash}
ARTIFACTS: {total files changed across all merges}
PHEROMONE: {score}/50
HANDOFF: COLD-START-BOOT.md updated with unified state
NEXT VECTOR: {consolidated top priority}
---
Next chat: /ReincarnateRISE to boot from unified handoff.
```

---

## MERGE CONFLICT RULES

| Scenario | Resolution |
|----------|------------|
| Same decision, same outcome | Deduplicate — keep richer version |
| Same decision, different outcome | `MERGE_CONFLICT:` tag — Michael resolves |
| One chat built X, other chat built Y | Both artifacts survive — no overwrite |
| Overlapping corrections | Merge into single entry with both root causes |
| Different run numbers claimed | Use the HIGHER number — that's the latest |
| One chat has raw quotes the other doesn't | ALL quotes survive — union, not intersection |

---

## CONSTRAINTS

- NEVER overwrite a previous merge's sections — APPEND ONLY
- NEVER update COLD-START-BOOT until the FINAL merge
- NEVER skip deduplication — L19 DEDUP_EVERYTHING
- Raw quotes from ALL chats survive — the 3% Rule applies to EVERY chat
- If you don't know your merge number, ASK — this is the ONE exception to L34
- If you don't know total chat count, write UNKNOWN and let the final merge update it
