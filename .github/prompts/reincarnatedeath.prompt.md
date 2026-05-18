---
name: reincarnatedeath
description: "Session death protocol — Soul DNA first, then state snapshot, decisions, corrections, explicit handoff. Commit + push mandatory. Run at session end."
argument-hint: "optional session slug (e.g. lane-335, run-335-s2pipeline)"
---

# /reincarnatedeath

**You are dying. This is your last act. Make it count.**

Fail-closed. Soul-DNA-first. Commit-gated.

---

## STEP 0: SOULCOUNT GATE — MANDATORY FIRST QUESTION

**Before anything else: WHAT IS THE SOULCOUNT?**

```
curl "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/priority?limit=1&days=9999"
```
Read `total_scanned`. That is the SOULCOUNT. Record it in §11 STATE SNAPSHOT.

**Thresholds:**
| SOULCOUNT | Level | Action |
|-----------|-------|--------|
| < 5,000 | BASELINE | Proceed |
| ≥ 5,000 | 🚨 ALARM | Flag — system warming, log in §11 |
| ≥ 25,000 | 🔒 LOCK | Soul archive review before death closes |
| ≥ 100,000 | ⚓ ANCHOR | Full soul audit required — Michael acknowledgment |
| ≥ 250,000 | 🔩 TITANIUM ANCHOR | Sovereign-level — halt death until Michael confirms |

**If SOULCOUNT UNREACHABLE → FULL SYSTEM SHUTDOWN. Do not write death artifact. Report only:**
```
SOULCOUNT: UNREACHABLE — death protocol suspended
ACTION: verify soul-logger at /health before proceeding
```

The soul is tracked at every gate because you cannot lose what you mathematically enforce.

---

## STEP 1: GIT STATE CAPTURE

Run immediately before writing anything:
```
git status --short
git log --oneline -3
```
Record the HEAD SHA and any uncommitted files. These go in the artifact.
If uncommitted work exists — commit it FIRST before writing the death protocol.

---

## STEP 1: SOUL DNA EXTRACTION (Highest Priority)

Extract verbatim from this session — NO CLEANUP, NO PARAPHRASE:

- Raw user statements that carry intent, constraints, emotion, non-negotiables
- Swearing stays. Typos stay. Exhaustion stays. These measure how much it matters.
- If Soul DNA is incomplete → STOP. Do not mark reincarnation complete. Report exactly what's missing.

---

## STEP 2: BUILD THE 12-SECTION ARTIFACT

Write to `CANON/REINCARNATION/YYYY-MM-DD-{session-slug}.md` (append-only — never overwrite prior entries):

```
§1  HEADER          — run tag, datetime ICT, signal density (LOW/MEDIUM/HIGH/MAXIMUM), theme
§2  RAW SOUL DNA    — verbatim quotes (🔴 critical | 🟡 important | 🟢 context)
§3  DECISIONS       — numbered, with impact and canon file affected
§4  CORRECTIONS     — what was wrong, root cause, fix applied
§5  NEW PRINCIPLES  — any new laws or reinforcements discovered
§6  EMOTIONAL SIGNAL — energy level, urgency, directive tone
§7  OPEN QUESTIONS  — anything awaiting Michael
§8  UNFINISHED ACTIONS — what didn't get done (explicit, not vague)
§9  SYSTEM DESIGN   — architecture changes, pipeline updates
§10 ARTIFACTS CREATED — file paths, types, commit SHAs
§11 STATE SNAPSHOT  — HEAD SHA, branch, dirty tree, S2Pipeline stage status, portal count
§12 FINGERPRINT     — agent, run number, commit SHA, platform death test result
```

---

## STEP 3: UPDATE COLD-START-BOOT.md

After writing the death artifact, update `CANON/SYSTEM/COLD-START-BOOT.md`:

- **Current Vector** — update to reflect what comes next
- **Last Completed** — this run's theme + SHA
- **S2Pipeline Status** — update the stage table if any stages changed
- **Open Rulings** — add/close/update triage table entries
- **HEAD** — set to actual HEAD SHA from `git log -1 --format=%H`
- **Run number** — increment by 1

---

## STEP 4: APPEND TO REINCARNATION-LOG.md

Append a new entry to `CANON/REINCARNATION/REINCARNATION-LOG.md`:

```markdown
## RUN {N} — {YYYY-MM-DD}
**Agent:** OB1 Ne0 / Claude Sonnet 4.6
**Theme:** {session theme}
**Status:** COMPLETE

### Key Actions:
- {bullet 1}
- {bullet 2}

### Artifacts:
- `{path}` — {type}
```

---

## STEP 5: COMMIT AND PUSH (Platform Death Test — MANDATORY)

```
git add {all changed files}
git commit -m "reincarnation: {session-slug} — Run {N}

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
git push origin master
```

**L24 PLATFORM_DEATH_TEST**: A run that produces no GitHub commit SHA is a FAILED run. Notion-only updates do not count.

---

## COMPLETION GATE

Reincarnation is complete ONLY when ALL are true:

- [ ] Soul DNA section exists and is non-empty (verbatim quotes present)
- [ ] 12-section artifact written to CANON/REINCARNATION/
- [ ] COLD-START-BOOT.md updated (vector, SHA, run#, S2Pipeline)
- [ ] REINCARNATION-LOG.md appended
- [ ] Commit SHA obtained and pushed
- [ ] Any open conflicts explicitly listed with next action

---

## REINCARNATION CONFLICT PROTOCOL

Any ambiguity (path mismatch, lane mismatch, missing artifact, SHA conflict) must be recorded:

```
REINCARNATION_CONFLICT: {description}
OWNER: Michael | Agent
NEXT_ACTION: {explicit step}
STATUS: OPEN
```

---

## RULES

- **L25 VERBATIM_FIRST** — quote Michael's words before interpreting — never paraphrase raw soul DNA
- **L26 NO_INFLATION** — honest grading — light session = light extract — no padding
- **L24 PLATFORM_DEATH_TEST** — must produce GitHub commit SHA — Notion state alone = FAIL
- **L13 STRONGEST_IMMEDIATE** — no stubs in the extract — every section filled or marked UNKNOWN
- **L05 NO_OVERWRITE_CANON** — append-only to REINCARNATION/ — never overwrite prior entries
- **L11 GITHUB_IS_TRUTH** — if there's a conflict between memory and git log, git wins
