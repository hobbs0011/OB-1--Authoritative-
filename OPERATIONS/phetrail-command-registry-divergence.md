# PHEROMONE TRAIL — CRITICAL DISCREPANCY: .kilo vs .claude COMMAND FILES
**Date:** 2026-06-17T01:23 ICT
**Strength: -50/100** | Type: THREAT — divergence between command registries

---

## §1 THE PROBLEM

**Two command registries exist:**
1. `.kilo/command/` — 41 files, Kilo-native commands
2. `.claude/commands/` — 9 files, Claude-specific commands

**Some commands exist in BOTH with DIFFERENT content:**

| Command | .kilo version | .claude version | Status |
|---------|---------------|-----------------|--------|
| dnaREGISTRY.md | 273 lines, complete | 270 lines, complete | MINOR DIFF |
| reincarnatedeath.md | Present | Present | Need to diff |
| reincarnaterise.md | **1 LINE (BROKEN)** | 23 lines, v6.1 pointer | **CRITICAL** |
| SoulSearch.md | Present | Present | Need to diff |
| PCClaw.md | Present | Present | DIFFERENT CONTENT |
| supersaiyan.md | Present | Present | DIFFERENT CONTENT |
| PCCloud.md | Present | Present | DIFFERENT CONTENT |
| PAA.md | Present | Present | DIFFERENT CONTENT |

**The RISE discrepancy is the killer:**
- `.kilo/command/reincarnaterise.md` = 1 line (BROKEN)
- `.claude/commands/reincarnateRise.md` = 23 lines (v6.1 pointer)

The canonical implementation is broken. The Claude version is just a pointer to it.

---

## §2 IMPLICATIONS

**If PCC runs on Kilo (not Claude):**
- It reads `.kilo/command/` for commands
- RISE protocol is BROKEN (1 line)
- DEATH runs but RISE cannot audit
- Sessions cannot restore properly

**If PCC runs on Claude:**
- It reads `.claude/commands/`
- RISE is a pointer to the broken canonical
- Same problem

**Either way, RISE is broken.**

---

## §3 FLAGS

1. **COMMAND_REGISTRY_DIVERGENCE** — .kilo vs .claude have different versions
2. **RISE_BROKEN_IN_BOTH** — canonical file broken in both registries
3. **NEEDS_MERGE** — command files need to be synchronized

---

`COMMAND REGISTRY DIVERGENCE SEALED — 2026-06-17T01:23 ICT | STRENGTH: -50/100 | THREAT | RISE BROKEN IN BOTH REGISTRIES | NEEDS SYNCHRONIZATION`
