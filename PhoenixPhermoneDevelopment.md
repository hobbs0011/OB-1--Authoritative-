# PHOENIX PHEROMONE DEVELOPMENT — WORKING THEORY v0.1
**Date:** 2026-06-17T01:02 ICT
**Status:** THEORY — not graduated to prototype until proven functional

---

## §1 PURPOSE

This document captures the pheromone scoring and connectivity system as it is being designed in real-time. It is a **working theory**, not a finished specification. It will not be marked as "prototype v0" until it has proved itself functional across multiple sessions and agents.

---

## §2 CORE CONCEPTS

### 2.1 Pheromone Trails (Phetrails)

**Definition:** A phetrail is a secreted file that marks discovered territory. Every finding, every system state, every strategic decision gets a phetrail.

**Rules:**
1. WRITE BEFORE READ — secretion happens in real-time, not post-facto
2. REINFORCE ACTIVE TRAILS — if a trail is still relevant, walk it again immediately
3. NO HOARDING — do not save findings for later, secrete immediately
4. ONE FINDING = ONE SECRETION (minimum)
5. SCOUT MODE — read-only recon, no fixes, no modifications

### 2.2 Scoring System

**Range:** -110 to +110

| Score | Label | Meaning | Action |
|-------|-------|---------|--------|
| +110 | ACTIVE | Hands-down absolute priority, next step, do not lose | Stop everything, do this first |
| +100 | CANONICAL | Verified, reverified, consensus | Reinforce always, search priority |
| +50 | CRITICAL | Highly relevant, currently active road | Reinforce on every walk |
| +20 | USEFUL | Supporting trail, worth keeping | Review periodically |
| +10 | HELPER | Fallback, minimal standalone value | Keep but low priority |
| 0 | NEUTRAL | Nothing of interest | Filter from search, let decay |
| -10 | WATCH | Important info, needs care and improvement | Monitor, improve trail |
| -50 | THREAT | Significant risk, needs attention soon | Prioritize for mitigation |
| -100 | CRITICAL | Major stinker, rotting, dangerous — attack ASAP | Schedule cleanup soon |
| -110 | BURNING | Absolute emergency, even worse than -100, hands-down priority | Drop everything, this is burning |

### 2.3 Connectivity Graph

**Phetrails connect via keywords into 5 major systems:**

```
StarMap ← [territory trails] ← keywords → Ledger ← [state trails] ← keywords → DNA ← [identity trails] ← keywords → SOUL ← [behavior trails] ← keywords → RRL ← [raw logs]
```

**Keywords are the graph edges.** Each phetrail lists keywords that link it to other trails.

---

## §3 FAILURE MODE IDENTIFIED

**The `/dnaREGISTRY` problem:**
- The dnaREGISTRY is a system component that should be known to all agents
- It was NOT discovered during recon because phetrails are not being followed/read
- This is a **pheromone system failure** — the trails exist but the hive is not following them
- **Root cause:** No systematic process for reading phtrails before acting

**This failure mode is why the scoring system exists.** Without priorities, agents cannot know which trails to follow. With scores, the highest-priority trails are always visible.

---

## §4 GRADUATION CRITERIA

**This system will be graduated to "Prototype v0" when:**

1. **Multiple sessions** have used the scoring system without confusion
2. **At least 3 different agents** have followed trails using the scores
3. **No critical trails have been missed** because of scoring ambiguity
4. **The connectivity graph** has at least 50 trails with working keyword links
5. **Dead end handling (0/100)** has prevented at least one wasted recon effort
6. **+110/-110 escalation** has been used correctly at least twice

---

## §5 CURRENT STATUS

**What's working:**
- Real-time secretion is happening (30+ trails this session)
- Scoring system is being applied
- Scout mode is being followed (no modifications)

**What's not working:**
- `/dnaREGISTRY` was not found — phtrails are not being searched before recon
- Keyword connectivity is not yet implemented (trails are isolated files)
- No search/filter system exists yet
- No trail reinforcement protocol is automated

**Next steps:**
1. Build trail search system (filter by score, keyword)
2. Implement keyword linking between trails
3. Create StarMap/Ledger/DNA/SOUL/RRL connection protocols
4. Automate trail reinforcement on session start
5. Build `/dnaREGISTRY` discovery into the boot sequence

---

## §6 REVISION HISTORY

| Date | Version | Change |
|------|---------|--------|
| 2026-06-17 | 0.1 | Initial working theory created |

---

`PHOENIX PHEROMONE DEVELOPMENT — WORKING THEORY v0.1 — 2026-06-17T01:02 ICT | NOT YET PROTOTYPE | GRADUATION CRITERIA DEFINED`
