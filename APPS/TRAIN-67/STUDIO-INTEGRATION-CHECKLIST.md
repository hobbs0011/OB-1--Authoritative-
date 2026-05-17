# Studio Integration Checklist — QuestionBankV2 + QuestionChunks

**For:** Michael Hobbs (SOV100)  
**Game:** Skibidi Zombie: Survive the Brainrots  
**As of:** Run 65 | April 5, 2026  
**Status:** Copy-paste ready. Follow steps 1–6 in order.

---

## What Was Built

| File | Location in Repo | What It Does |
|---|---|---|
| `QuestionBankV2.lua` | `CANON/TRAIN-67/CODE/` | Core service — chunked Q loading, ELO, FTUE, localization |
| `UnifiedServer.server.lua` | `CANON/TRAIN-67/CODE/` | Boot order now wires QBv2 + AnalyticsService |
| `Mouse_A.lua` | `CANON/TRAIN-67/CODE/QuestionChunks/` | First 15 Mouse-A beginner questions (FTUE + pool) |

---

## Step 1 — Copy Files Into Roblox Studio

### A. QuestionBankV2 (ModuleScript)

1. In **ServerStorage**, create a `ModuleScript` named **`QuestionBankV2`**
2. Paste the full contents of `CANON/TRAIN-67/CODE/QuestionBankV2.lua`

### B. QuestionChunks Folder

1. In **ServerStorage**, create a **Folder** named **`QuestionChunks`**
2. Inside `QuestionChunks`, create a `ModuleScript` named **`Mouse_A`**
3. Paste the full contents of `CANON/TRAIN-67/CODE/QuestionChunks/Mouse_A.lua`

> You will add more chunks here later (`Mouse_B`, `Cat_A`, etc.). Same pattern.

### C. UnifiedServer (ServerScript)

1. In **ServerScriptService**, find or create a `Script` named **`UnifiedServer`**
2. Paste the full contents of `CANON/TRAIN-67/CODE/UnifiedServer.server.lua`

---

## Step 2 — Studio Explorer Final Structure

```
ServerStorage
└── QuestionBankV2          [ModuleScript]
└── QuestionChunks          [Folder]
    └── Mouse_A             [ModuleScript]

ServerScriptService
└── UnifiedServer           [Script]
```

> CombatSystem is in ServerScriptService too (separate — it is ZERO ESL, no Q-bank dependency).

---

## Step 3 — Verify Boot Prints in Output

When you **Play** in Studio, the Output window should show:

```
======================================================
📚 QuestionBankV2 — Chunked-Loading Question Service
  Total questions: 15
  Formats: multiple_choice, word_builder, speed_type, listen_choose, sentence_arrange, fill_blank
  L1 support: th → en
  DataStore overflow: true
  LRU cache max: 200
  Pipeline: Train 6-7 — MAKE MONEY
======================================================
[QBv2] Registered chunk 'Mouse_A' — 15 questions
```

If you see `0 questions`, the chunk folder path is mismatched — check ServerStorage vs ServerScriptService.

---

## Step 4 — Smoke Test in Studio Console

Run this in the **Studio Command Bar** (server-side):

```lua
local QB = require(game.ServerStorage.QuestionBankV2)
print(QB.GetStats().total)  -- should print 15

local fakePlayer = { currentTier = 1, totalQuestionsAnswered = 0 }
local q = QB.GetQuestion(fakePlayer, { tier = "Mouse" })
print(q and q.format or "NIL — check chunk load")
```

Expected output:
```
15
multiple_choice
```

---

## Step 5 — Pre-Wiring English Rewards (Optional)

If `EnglishRewardsManager.lua` is already active in your game:

1. Open it in Studio
2. Find the line that calls `QuestionBank` (old v1)
3. Replace with:
   ```lua
   local QuestionBankV2 = require(game.ServerStorage.QuestionBankV2)
   ```
4. Replace any `QuestionBank.GetQuestion(...)` calls with `QuestionBankV2.GetQuestion(...)`

> CombatSystem.lua does NOT need changes — it was rewritten as ZERO ESL (pure combat only).

---

## Step 6 — Adding More Chunks Later

When you're ready to add more questions (Mouse_B, Cat_A, etc.):

1. Create a new `ModuleScript` in `ServerStorage > QuestionChunks`
2. Name it `Mouse_B` (or `Cat_A`, etc.)
3. Use the same `Mouse_A.lua` format — array of question tables, `return chunk` at end
4. ID format: `M_B_001` for Mouse_B, `C_A_001` for Cat_A, etc.
5. Commit the file to `CANON/TRAIN-67/CODE/QuestionChunks/` — you're done

QuestionBankV2 auto-discovers all chunks in the folder on boot. No code changes needed.

---

## Tier Roadmap

| Chunk | Questions | Status | ELO Range |
|---|---|---|---|
| Mouse_A | 15 | ✅ BUILT | 850–920 |
| Mouse_B | 15 | 🔲 NEXT | 920–980 |
| Cat_A | 15 | 🔲 QUEUED | 1200–1350 |
| Cat_B | 15 | 🔲 QUEUED | 1350–1450 |
| Wolf_A | 15 | 🔲 QUEUED | 1600–1750 |
| Lion_A | 15 | 🔲 QUEUED | 2000–2150 |
| Tiger_A | 15 | 🔲 QUEUED | 2400–2550 |

Total on roadmap: 7 chunks × 15 = 105 questions. DataStore overflow handles 3,000+.

---

## Quick Reference — Question ID Format

```
M = Mouse    C = Cat    W = Wolf    L = Lion    T = Tiger
A = Sub-tier A (first 15)    B = Sub-tier B (next 15)

M_A_001 = Mouse, Sub-tier A, Question 1
C_B_007 = Cat, Sub-tier B, Question 7
```

---

## L1 Language Note

The current `QuestionBankV2` CONFIG sets `DEFAULT_L1 = "th"` (Thai).
Mouse_A.lua provides **both** `vi` (Vietnamese) and `th` (Thai) translations in all prompts.

To switch the default to Vietnamese for the entire game, change one line in `QuestionBankV2.lua`:
```lua
DEFAULT_L1 = "vi",  -- was "th"
```

Per-player override is also supported via `playerData.l1Language = "vi"`.

---

*Run 65 — Anakin | SUPER_SAIYAN | Platform Death Test: pending commit SHA*
