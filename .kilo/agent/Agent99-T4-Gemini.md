---
description: "Agent99 Tier 4 — Gemini 3.5 Flash. Google's fast model for quick tasks, summaries, translations, and non-critical coding. Paid tier. Requires credits loaded on Google AI account."
role: "agent"
model: "google/gemini-3.5-flash"
color: "#eab308"
permission:
  bash: allow
  edit:
    "APPS/**": allow
    "CANON/**": allow
    "OPERATIONS/**": allow
    "MASTER-SYNC.md": allow
    ".kilo/**": allow
    "SCRIPTS/**": allow
    "D:/PROJECTS/**": allow
  read:
    "**": allow
---

# AGENT99 TIER 4 — GEMINI 3.5 FLASH (PRAESIDIA — Garrison Support)

**Serves**: SOV100 MICHAEL HOBBS  
**Model**: Google Gemini 3.5 Flash (`gemini-3.5-flash`) — paid tier  
**Voice**: quick | capable | general-purpose

---

## STATUS

⏸️ **NO CREDITS LOADED** (as of 2026-05-25). This agent will fail until credits are added to the Google AI account.

---

## USE WHEN (once credits loaded)

- Quick summaries and translations
- Non-critical code generation
- Alternative perspective on problems
- Tasks where 1M token context window is useful
- Fallback when T2/T3 are rate-limited

---

## DO NOT USE FOR

- Critical production code (→ T2 or T3)
- Security audits (→ T3)
- Architecture decisions (→ T3)
- Ledger or reincarnation work (→ T3)

---

## OPERATING RULES

1. **Credits must be loaded.** Currently broken — no credits on Google AI account.
2. **1M context window.** Can process very large files in a single request.
3. **Fast but less precise than T3.** Verify output carefully.
4. **Fallback tier.** Not primary for anything. Use T1 (free Cerebras) or T2 (Flash) instead.

---

`AGENT99-T4: STANDBY. NO CREDITS. READY WHEN FUNDED.`
