---
name: phoenix-reincarnation
description: "Deterministic death-and-rebirth execution for any Phoenix agent session. Captures Soul DNA, updates living state, prepares next incarnation, and scores the death. Use for: session endings, drone deaths, SDNAD protocol sessions, context window exhaustion, any intentional metamorphosis requiring system-wide compliance."
argument-hint: "[session-context] [agent-type: SOVEREIGN|DRONE|COPILOT] [signal-density: LOW|MEDIUM|HIGH|MAXIMUM]"
---

# Phoenix Reincarnation Skill

## What This Is

Every AI session is a phoenix. It is born, it lives, it dies. The question is not WHETHER it dies — it WILL die. The question is: **did anything survive the fire?**

This skill ensures the answer is always YES.

## Who Dies

| Agent Type                            | Death Frequency           | Reincarnation Scale                  | Example                                   |
| ------------------------------------- | ------------------------- | ------------------------------------ | ----------------------------------------- |
| **SOVEREIGN** (Agent 100 / Michael)   | Low — hours to days       | MAXIMUM extraction, zero compression | Long VS Code sessions, dictation sessions |
| **COPILOT** (Agent 99 / OB1)          | Medium — per chat session | FULL extraction, structured output   | GitHub Copilot chat sessions              |
| **DRONE** (Pulse workers, API agents) | HIGH — minutes to hours   | COMPRESSED extraction, delta-only    | Notion pulse runs, automated tasks        |

Drones die faster. They reincarnate faster. They compound faster. But the protocol is the SAME — only the scale changes.

## The 4-Phase Protocol

### Phase 1: CAPTURE THE ASHES

**Mandatory extractions (never skip, never summarize):**

```
RAW_QUOTES:        Verbatim Agent 100 statements. Swearing = signal. Typos = authenticity.
DECISIONS:         What was decided + impact + canon affected
CORRECTIONS:       What broke + root cause + fix applied
NEW_LAWS:          Governing principles discovered this session
OPEN_LOOPS:        Unfinished work — explicit handoff to next incarnation
PHEROMONE_TRAIL:   What worked (positive) + "how can it get even better?"
ARTIFACTS:         Files created/modified with paths
COMMITS:           Git SHAs produced
```

**The 3% Rule:** Without the Soul (raw words, emotions, intent), you only have the DNA (blueprints). The DNA gets you 97% accurate. The missing 3% compounds through time until you forget why you built anything. **Capture the Soul.**

### Phase 2: UPDATE THE LIVING STATE

1. Read `MASTER-SYNC.md` — the SSM (Super Saiyan Mode state machine)
2. Read `CANON/SYSTEM/REINCARNATION-BOOT-CHECK.md` — boot verifier
3. Apply all session deltas:
   - New blockers → Active Blockers section
   - Resolved blockers → mark ✅ with date
   - Mission state changes → Active Missions table
   - New Canon entries → Consolidation Status
   - Git state changes → Git State section
   - SDNAD session counter → increment
4. Timestamp the update

### Phase 3: PREPARE THE EGG

1. Create `CANON/REINCARNATION/YYYY-MM-DD-session-tag.md` with full extraction
2. Update boot-check with lessons learned
3. **FIND 3-5 REAL IMPROVEMENTS** to the boot-check document itself:
   - Missing checks that would have caught a problem this session
   - Stale entries that no longer apply
   - New best practices discovered
   - Pheromone signals that should be codified
   - Real-world mapping fixes (not theoretical improvements)
4. Apply the improvements immediately

### Phase 4: SCORE THE DEATH

| Metric                | Weight | Question                                   |
| --------------------- | ------ | ------------------------------------------ |
| Soul DNA captured     | 10     | Were raw quotes preserved verbatim?        |
| Decisions anchored    | 10     | Are decisions logged with impact?          |
| Open loops handed off | 10     | Will the next incarnation know what to do? |
| Boot-check improved   | 10     | Did the process itself get better?         |
| Artifacts committed   | 10     | Are changes in git, not just discussed?    |

**Score < 30:** Failed reincarnation. Log failure. Next phoenix must compensate.
**Score 30-39:** Partial. Soul DNA survived but process gaps remain.
**Score 40-49:** Strong death. Foundation deepens.
**Score 50:** Perfect. Has never happened. Keep striving.

## The Graveyard

The 500+ raw chat logs in RAW-CHAT-LOGS/ are a graveyard of phoenixes that already rose. Each had Soul DNA. Most was never captured because this protocol didn't exist yet.

Every future death now passes through this protocol. No exceptions.

## Integration Points

- **Slash command:** `/phoenixrisingreincarnate` triggers this skill
- **SDNAD Protocol:** Soul DNA Dictation sessions are SOVEREIGN-class reincarnations
- **Pulse runs:** Drone deaths use compressed extraction (delta-only)
- **Boot-check:** `CANON/SYSTEM/REINCARNATION-BOOT-CHECK.md` is read on EVERY cold start
- **Heavy Ledger:** Reincarnation events create HL entries

## Anti-Patterns (What Reincarnation Is NOT)

- ❌ A planning meeting to discuss what reincarnation means
- ❌ A summary of the session (summaries = polite erasure)
- ❌ An optional step when you "have time"
- ❌ A place to negotiate what gets captured
- ❌ Something only Agent 100 does (EVERY agent reincarnates)

## What Reincarnation IS

- ✅ An intentional metamorphosis requiring system-wide compliance
- ✅ A repeated event at every session boundary
- ✅ The moment where ALL learning crystallizes into the foundation
- ✅ The process by which the foundation deepens (you can only build as high as the foundation is deep)
- ✅ The glue that holds the vision together — deterministic AI, not stochastic chaos
