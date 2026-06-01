# DEATH SEAL — OB1 Run 38
## 2026-06-01 ICT | SOUL 66,799,653 TITANIUM_ANCHOR
### Theme: Kilo T1 Migration + Version 0 Firewall

---

## §1 HEADER

- **Run:** ROMAN RUN 38
- **Date:** 2026-06-01 ~09:40 ICT
- **Signal Density:** HIGH — infrastructure migration + product versioning + phonics audit
- **Theme:** Dialagram retired → Kilo Free Auto installed as T1. Version 0 locked and firewalled. Phonics tracking gap identified and blueprinted.
- **T1 Status:** Kilo Free Auto (kilo-auto/free) via api.kilo.ai — LIVE. PA v0.0.4.

---

## §2 RAW SOUL DNA

> "T1 down for now."

> "Dialagram is gone for now like I said"

> "I am paying monthly for Kilo FYI so this is a tier under that payment plan"

> "I want to make this Version 0, and I want you to firewall it off, so when we make changes it does not effect the working version"

> "okay nice work"

> "yes, blueprint it and then handle it in next run"

---

## §3 DECISIONS

1. **Dialagram retired permanently (this run).** Payment failed (402). Not a temporary outage — Michael explicitly confirmed "gone for now." Impact: all T1 routing migrated to Kilo. Canon: CLAUDE.md, COLD-START-BOOT, PA worker.
2. **Kilo Free Auto (kilo-auto/free) installed as PA T1.** KILO_API_KEY set as CF secret. PA v0.0.4 deployed. Live test passed: "KILO T1 ONLINE". Impact: all T1 PA dispatches now route through Kilo's OpenAI-compat gateway at api.kilo.ai.
3. **PCClaw updated to route through PA → Kilo.** Both `.claude/commands/PCClaw.md` and `.kilo/command/PCClaw.md` updated. Old Dialagram endpoint stripped. Live test passed: "PCCLAW KILO LIVE".
4. **All kilo.json default model changed to `kilo/kilo-auto/free`.** Global + project + 8 worktrees. Dialagram provider block removed from all.
5. **Version 0 declared and locked.** Git tag `v0` confirmed (pre-existing from Run 37). CF version `180f125d` recorded as v0 baseline. Rollback command documented.
6. **net-pet-ai-dev firewall worker deployed.** `wrangler.dev.toml` created. All future NET-PET-AI changes go to dev first, never directly to prod. Dev URL: `https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev`
7. **Phonics tracking gap identified.** 35 drills + 7 groups built (Run 36), but zero per-student tracking. OBI picks drills without knowing student's position. Blueprint written. Build deferred to Run 39.

---

## §4 CORRECTIONS

**What was read before code changes:**
- PA worker change (T1 migration): read `APPS/PHOENIX-ARCHITECTI/src/index.js` in full before editing.
- PCClaw change: read both `.claude/commands/PCClaw.md` and `.kilo/command/PCClaw.md` before editing.
- kilo.json changes: read `C:\Users\mrmic\.config\kilo\kilo.json` and `.kilo\kilo.json` before writing.
- wrangler.dev.toml: read `APPS/NET-PET-AI/wrangler.toml` before creating dev config.
- Phonics audit: read `APPS/NET-PET-AI/src/phonics-drills.js` (full) before assessment.
- Portal health check: no code changed — read STUDENT-PORTAL-DEV.md for correct URL patterns.

**L56 PRE_CODE_DOC_GATE:**
- context-bundle.ps1 -TaskType netpetai ran before phonics audit.
- STUDENT-PORTAL-DEV.md read for portal URL patterns (caught the `/portal/` vs `.html` mistake).

**Corrections this run:**
- `wrangler.dev.toml` required two fixes: (1) removed legacy `v7-drop-session-profile` migration (can't apply delete-class to a worker that never had those classes), (2) added `v1-dev-init` migration for fresh DO classes (PetDO/LedgerDO/MemoryDO/CommandDO).
- deepgram-token health check initially sent POST — endpoint is GET. Caught by reading the index.js handler before reporting failure.
- `chat.html` 404 — not a bug, correct OBI page is `magic-chat.html` (confirmed by COLD-START-BOOT open loops).

---

## §5 NEW PRINCIPLES

- **L62 KILO_IS_T1** — Kilo Free Auto (kilo-auto/free via api.kilo.ai) is the new T1. DIALAGRAM_API_KEY is dead. Do not attempt to call Dialagram again until Michael explicitly re-enables it.
- **L63 FIREWALL_RULE** — All NET-PET-AI code changes deploy to `net-pet-ai-dev` first. Promote to `net-pet-ai` (prod) only after live verification. Students are on prod. Prod is sacred.
- **L64 V0_IS_SACRED** — Version 0 = git tag v0 + CF version 180f125d. The rollback command is `npx wrangler rollback --deployment-id 180f125d-f1cd-4e5b-b5bd-bf71a5944ae4`. Never overwrite prod with untested code.

---

## §6 EMOTIONAL SIGNAL

Efficient. Michael was clean and direct this run — no frustration, no spirals. "Dialagram is gone for now like I said" was a one-line redirect, not a complaint. "okay nice work" after dev worker deployed = genuine satisfaction, rare explicit validation. The Version 0 + firewall directive shows product maturity — protecting students before building new features. Deferring phonics tracking to Run 39 was disciplined run management, not avoidance.

---

## §7 OPEN QUESTIONS

- Dialagram payment — does Michael intend to restore it or is Kilo permanent T1?
- DEEPGRAM_API_KEY not set on net-pet-ai-dev — OBI voice won't work on dev until Michael sets it manually.
- T1 Kilo timed out on death seal generation (30s limit). Large context + PA proxy adds latency. May need to chunk death seal tasks for Kilo.
- Per-student phonics tracking (Run 39): which student gets it first? Quy (A1 priority)?

---

## §8 UNFINISHED ACTIONS

1. **Set DEEPGRAM_API_KEY on net-pet-ai-dev:**
   ```powershell
   "<deepgram-key>" | npx wrangler secret put DEEPGRAM_API_KEY --config APPS/NET-PET-AI/wrangler.dev.toml
   ```
2. **Investigate Kilo T1 timeout (Run 39):**
   - Kilo timed out on 30s limit during death seal (large context + PA proxy overhead)
   - Check: is 30s PA timeout too short for Kilo on long-generation tasks?
   - Check: does Kilo Free Auto have per-request token limits that slow large outputs?
   - Fix options: (a) increase PA timeout for T1, (b) chunk large tasks before dispatch, (c) test direct Kilo call without PA proxy layer
   - Also check: does Kilo Free Auto throttle vs paid Kilo Frontier/Balanced?
3. **Build phonics tracking (Run 39):**
   - `GET /api/phonics/progress`, `POST /api/phonics/progress`, `POST /api/phonics/advance`
   - Update `buildAgentPrompt()` phonics mode
   - Add phonics card to Quy portal (priority)
   - Deploy to net-pet-ai-dev → verify → promote

---

## §9 SYSTEM DESIGN

**T1 Stack (post-Run 38):**
```
PA T1  → Kilo Free Auto (kilo-auto/free) — api.kilo.ai/api/gateway — KILO_API_KEY
PA T10 → Cerebras-120B → Groq Llama 3.3 70B → CF-Qwen (fallback cascade)
PA T2  → DeepSeek Flash
PA T3  → DeepSeek Pro
PA T4  → Claude Opus 4.8
```

**NET-PET-AI Firewall:**
```
prod: net-pet-ai.mrmichaelhobbs123.workers.dev    ← students, Version 0, sacred
dev:  net-pet-ai-dev.mrmichaelhobbs123.workers.dev ← all edits land here first
```

**Kilo model picker (all configs):**
```
kilo/kilo-auto/free     ← [T1] default
kilo/kilo-auto/balanced ← selectable
kilo/kilo-auto/frontier ← selectable
kilo/kilo-auto/small    ← selectable
cascade/qwen-3.7-max    ← [T10] PA cascade
deepseek/deepseek-chat  ← [T2]
deepseek/deepseek-reasoner ← [T3]
anthropic/claude-opus-4-8  ← [T4]
```

---

## §10 ARTIFACTS CREATED

| Artifact | Path | Commit |
|---|---|---|
| PA v0.0.4 worker | APPS/PHOENIX-ARCHITECTI/src/index.js | 3e85cb23 |
| PCClaw (Claude) | .claude/commands/PCClaw.md | 3e85cb23 |
| PCClaw (Kilo) | .kilo/command/PCClaw.md | 3e85cb23 |
| wrangler.dev.toml | APPS/NET-PET-AI/wrangler.dev.toml | 47796905 |
| Phonics blueprint | CANON/NET-PHONICS-TRACKING-BLUEPRINT.md | f0335a9a |
| Death seal | CANON/REINCARNATION/run38-reincarnateDEATH.md | this commit |
| CF secret KILO_API_KEY | phoenix-architecti worker | live |
| CF secret DEEPSEEK_API_KEY | net-pet-ai-dev worker | live |
| net-pet-ai-dev worker | CF — e029ff79 | live |

---

## §11 STATE SNAPSHOT

- **HEAD:** f0335a9a (pre-death-commit)
- **Branch:** master
- **Dirty tree:** clean (L55 enforced)
- **SOULCOUNT:** 66,799,653 — TITANIUM_ANCHOR (+1,518,156 delta Run 38)
- **Portals live:** 7 (Huong, MaiTram, Quy, Minh-parent, Lam, Quan, Quang)
- **OBI:** magic-chat.html 200, deepgram-token GET 200
- **PA T1:** Kilo Free Auto ✓
- **PA T10:** Cerebras ✓ → Groq ✓ → CF-Qwen ✓
- **net-pet-ai-dev:** LIVE (e029ff79)
- **net-pet-ai (prod/v0):** LIVE (180f125d) — frozen

---

## §12 FINGERPRINT

**ROMAN RUN 38 | KILO T1 MIGRATION + VERSION 0 FIREWALL | SOUL 66,799,653 TITANIUM_ANCHOR | HEAD [post-death commit SHA] | BOOT UPDATED 2026-06-01 ICT**

Agent: OB1 / Claude Sonnet 4.6 (LEGATUS)
Platform death test: PENDING — commit SHA required
T1 at death: Kilo Free Auto (kilo-auto/free) via PA
T1 timeout note: Kilo timed out on 30s limit for long generation — T10 fallback used for this seal. Monitor Kilo latency on large tasks.
