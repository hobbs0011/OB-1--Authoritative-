# Run 175 — Heir Blueprint (Claude Decommission Complete)

**Sealed:** 2026-07-18T15:45+07:00 | **HEAD:** c789ca838 | **SOUL:** 239,645,670 TITANIUM_ANCHOR
**Next session run:** 176 | **Model:** DeepSeek V4 Flash (workhorse) | **Provider:** OpenRouter

---

## What Was Done This Run

1. Claude nuked from 16 files — kilo.json, AGENTS.md, agent definitions, commands, dispatch
2. 5 scripts decommissioned — session-capture.ps1, soul-capture.ps1, soul-watcher.ps1, death-stage1-rrl.ps1
3. 2 CF workers fixed — phoenix-architecti (blueprint.js + phoenix-coder-current.js), phoenix-empire-dev (magic_chat_endpoint.js)
4. Reincarnation scripts made Kilo-native — removed `~/.claude/` paths, `CLAUDE_REAL` constants
5. RRL organized — 843 non-transcript files moved to `RRL/non-transcripts/`
6. Current session transcript captured (6,397 bytes, Run 175)
7. DEATH seal: Run 175, KILO_GAP, HL-7307

---

## Pipeline for Next Session (Run 176)

### 🔴 P1 — Cloudflare Workers (do first, before any other work)

```
npx wrangler secret delete ANTHROPIC_API_KEY --name phoenix-architecti
npx wrangler secret delete ANTHROPIC_API_KEY --name phoenix-empire-dev   # confirm if exists
npx wrangler deploy --name phoenix-architecti
npx wrangler deploy --name phoenix-empire-dev
```

**Rotate the Anthropic key** at console.anthropic.com — it was in plaintext in `SCRIPTS/set-pa-secrets.ps1`.

### 🟡 P2 — Canonical Hygiene

| Task | File | What |
|------|------|------|
| Fix obi.ps1 line 259 | `SCRIPTS/obi.ps1` | `$stateSnapshot.run.current` → `$stateSnapshot.run` |
| Sync STATE-SNAPSHOT.json | `CANON/HEAVY-LEDGER/STATE-SNAPSHOT.json` | HEAD → c789ca838, run → 175 |
| Update SOULCOUNT in 3 agent files | `.kilo/agent/` | SS-Agent99, T3-Pro, T2-Flash — frozen values (894K) → 239,645,670 |
| Nuke Agent99-T4-Gemini | `.kilo/agent/` | Dead agent — no credits. Remove or add decommission notice |
| Remove RISE.md `model: anthropic/` | `.kilo/agent/RISE.md` | Already done — verify |

### 🟢 P3 — Deep Audit (optional, medium priority)

- **SoulScholars rewrite**: `SCRIPTS/soul-scholar-extract.ps1` needs a Michael-voice filter (currently extracts ALL text from RRL, producing 99.5% noise). Add classifier for: first-person pronouns, rhetorical questions, imperative voice, emotional markers, `[MICHAEL]`/`[USER]` tags.
- **ARCHIVE sweep**: `CANON/ARCHIVE/` and `CANON/SYSTEM/COLD-START-BOOT.md` have 22,000+ historical Claude references. These are archival data — leave unless explicitly tasked.

### ⚪ P4 — Free Model Resource Strategy

Current free tiers available:
- **stepfun/step-3.7-flash:free** — OpenRouter, fast, good for daily work
- **poolside/laguna-m.1:free** — OpenRouter, good for code generation
- **DeepSeek V4 Flash** (paid via OpenRouter) — premium workhorse
- **DeepSeek V4 Pro** (paid) — heavy decisions, architecture

Do NOT need Claude. Do NOT need Anthropic. Free cascade: stepfun → poolside → DeepSeek Flash.

---

## Key Files

| File | Purpose |
|------|---------|
| `SCRIPTS/reincarnate-death.ps1` | DEATH seal — Kilo-native STAGE 0 |
| `SCRIPTS/reincarnate-rise.ps1` | RISE audit — Kilo-native STAGE 0 |
| `SCRIPTS/extract-session.js` | Session transcript extractor from kilo.db |
| `.kilo/agent/AGENT99.md` | T2: DeepSeek V4 Pro (not Opus) |
| `.kilo/command/DISPATCH.md` | Kilo-native dispatch |
| `APPS/PHOENIX-ARCHITECTI/src/blueprint.js` | Returns 410 Gone — Claude decommissioned |
| `APPS/PHOENIX-EMPIRE-DEV/src/magic_chat_endpoint.js` | Default: DeepSeek (not Claude) |

---

## Current State

- **HEAD:** c789ca838
- **Branch:** canon
- **Working tree:** CLEAN
- **SOULCOUNT:** 239,645,670 TITANIUM_ANCHOR
- **Last DEATH:** Run 175, KILO_GAP, HL-7307
- **RRL root:** 164 files | **RRL/non-transcripts:** 843 files
- **HL count:** 7307 total

---

`NEXT SESSION: Run 176. Start with P1 (CF secrets delete + deploy). Then P2 (obi.ps1 fix + STATE-SNAPSHOT). Use free models for everything except DeepSeek Pro for final rulings. No Claude anywhere.`