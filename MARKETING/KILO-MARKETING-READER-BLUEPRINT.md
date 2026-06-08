# KILO MARKETING READER BLUEPRINT
## Mission: Read, extract, and organize NET marketing content from 3 source files

**You (Kilo) do the reading. Do not rely on OB-1's prior sampling notes.**
**Read the files fresh. Extract verbatim. Preserve Michael's voice exactly.**

---

## STEP 0 — CONTEXT LOAD (read these first, don't skip)

1. `MARKETING/KILO-MARKETING-ORGANIZER-BLUEPRINT-2-3-4.md` — OB-1's sampling notes. Use as a map, not a substitute for reading the source files.
2. `MARKETING/MASTER/` — all 7 existing files (completed from `_1.txt`). Do NOT re-extract content already in these files.

---

## STEP 1 — READ THE SOURCE FILES

Files are large (750–2500+ lines). Use chunked reads — three passes per file:

### File A: `MARKETING/RAW/NET Marketing_&_Copywrite_2.txt`
- Pass 1: offset=0, limit=150 (beginning)
- Pass 2: offset=700, limit=150 (middle)
- Pass 3: offset=1400, limit=150 (end — adjust if file is shorter)

### File B: `MARKETING/RAW/NET Marketing_&_Copywrite_3.txt`
- Pass 1: offset=0, limit=150
- Pass 2: offset=500, limit=150
- Pass 3: offset=900, limit=130 (file ~1029 lines)

### File C: `MARKETING/RAW/NET Marketing_&_Copywrite_4.txt`
- Pass 1: offset=0, limit=150
- Pass 2: offset=380, limit=150
- Pass 3: offset=680, limit=80 (file ~760 lines)

**After reading: note what's in each file before extracting. If a section is cut off mid-thought, read ±50 more lines to complete it.**

---

## STEP 2 — EXTRACTION TARGETS (in priority order)

### 1. `MARKETING/MASTER/active-listening-hooks.md` ← CREATE NEW

Source: `_2.txt` — search for hooks named LISTEN, NATIVE, SMART, RIDDLE, ERROR404

**Format for each hook:**
```
## HOOK: [NAME]
**Keyword:** [DM trigger word]
**Audience:** [Tigers parent / Professional / General]

### Visual Brief (Gospel 444)
Background: Void Black #0f0f1a
[Hero imagery, effects, typography — extract verbatim]

### Copy — English
HEADLINE: [headline]
[body copy — verbatim]

### Copy — Vietnamese
TIÊU ĐỀ: [headline]
[body — verbatim, or mark [VN PENDING] if missing]

### CTA
[DM keyword] — [call to action]
```

**Extraction rule:** These are 5 distinct hooks (LISTEN, NATIVE, SMART, RIDDLE, ERROR404). Each has its own visual spec + bilingual copy + CTA. Extract all 5 fully. If any are incomplete in the file, mark `[COPY PENDING — hook exists, copy not executed]`.

---

### 2. `MARKETING/MASTER/operational-playbook.md` ← CREATE NEW

Source: `_3.txt` primary, `_4.txt` has duplicate (use `_3.txt` version)

**Extract:** Stages 1.8 through 3.7 — the full funnel operational playbook.

**Format:**
```
## STAGE [N]: [STAGE NAME]

**Objective:** [what this stage achieves]
**Duration / Trigger:** [when this fires]

### Steps
[numbered steps — verbatim]

### Scripts / Templates
[any scripts, messages, or templates included — verbatim]

### Notes
[Michael's corrections or directives — verbatim]
```

Extract ALL stages 1.8 → 3.7. Flag any stage that exists as a header only (not fully executed) as `[EXECUTION PENDING]`.

---

### 3. `MARKETING/MASTER/bluetech-classroom-curriculum.md` ← CREATE NEW

Source: `_2.txt` (Stages 000–6), `_4.txt` (Stages 17–20)

**Format:**
```
## SESSION STAGE [N]: [TITLE]
**Source file:** [_2.txt or _4.txt]
**Context:** [what Michael was working on with BlueTech at this stage]

### What Was Taught
[content — verbatim from transcript]

### Methodology Notes
[Michael's approach or corrections at this stage]

### Student Response / Outcome
[any noted outcomes or quotes — verbatim]
```

**Gap to flag:** Stages 4, 7–16 not located in any sampled section. If you find them while reading, extract them. If not found after full read, note: `[STAGES 4, 7–16: NOT FOUND IN SOURCE FILES — may exist in unread .txt portions]`.

---

### 4. `MARKETING/MASTER/messenger-bot-flows-extended.md` ← CREATE NEW

Source: `_2.txt` — additional DM keywords beyond what's in `messenger-bot-flows.md`

Existing keywords (already in `MASTER/messenger-bot-flows.md` — do NOT duplicate):
TIGER, PLAY, FOUNDATION, PACK, UNLEASH, STREAK, MASTER, HIGHWAY, GOLDFISH, DEPARTURE, ENTERPRISE, LAKEVIEW, OBIBETA

**Extract:** Any NEW keyword triggers found in `_2.txt` that are NOT in that list.

**Format:** Same as `messenger-bot-flows.md`:
```
## KEYWORD: "[KEYWORD]"
**Stage:** [which stage triggers it]
**Audience:** [audience segment]
NODE 1: [delay + message + buttons]
NODE 2: [delay + message]
NODE 3: [delay + message + buttons]
NODE 4: [scheduling branch]
```

---

### 5. `MARKETING/MASTER/agent99-system-prompt.md` ← CREATE NEW

Source: `_3.txt` — Agent-99 System Prompt Stage 1 + Stage 2

**Extract verbatim:**
- Stage 1: Command Directives 1–7 + 20 Immutable Hooks (full list)
- Stage 2: Directives 8–11 (UI/UX, Funnel, Messenger Bots, Anti-Drift Governance)

**Format:**
```
# AGENT-99 SYSTEM PROMPT — CANONICAL INITIALIZATION

## STAGE 1: CORE DIRECTIVES

### Directive [N]: [Title]
[verbatim content]

### THE 20 IMMUTABLE HOOKS
1. [hook name] — [description]
...

## STAGE 2: OPERATIONAL DIRECTIVES

### Directive [N]: [Title]
[verbatim content]
```

Do NOT paraphrase. This is the AI persona initialization — every word matters. Extract verbatim.

---

### 6. `MARKETING/MASTER/gospel-444-image-prompts.md` ← CREATE NEW

Source: `_4.txt` — all Midjourney / image generation prompts

**Extract:**
- PRAiS brand prompts (cybernetic phoenix, Soul Purple left / Imperial Gold right)
- Phoenix Reality-C OS visual asset prompts
- Tiger Engine image prompts
- Phase 0 banner image prompts (from `_2.txt` if present)
- Any 8K rebuild prompts

**Format:**
```
## PROMPT SET: [Name / Purpose]
**Used for:** [what asset this generates]
**Source:** [_2.txt / _4.txt + approximate location]

### Prompt
```
[full prompt — verbatim]
```

**Parameters:** [--ar, --v, --style flags if present]
**Notes:** [Gospel 444 color rules applied, any Michael corrections]
```

---

### 7. `MARKETING/MASTER/prais-brand-materials.md` ← CREATE NEW

Source: `_4.txt`

**Extract:**
- PRAiS full name: Phoenix Rising AI Solutions
- Brand position: umbrella brand over NET
- Logo spec: cybernetic phoenix, Soul Purple left / Imperial Gold right
- Any brand copy written (NOT just image prompts — look for taglines, positioning statements, brand narrative)
- Any sub-brand relationships (NET sits under PRAiS, etc.)

**Format:**
```
# PRAiS BRAND MATERIALS — CANONICAL

## Brand Identity
**Full Name:** Phoenix Rising AI Solutions
**Abbreviation:** PRAiS
**Position:** [extract verbatim]

## Logo Spec
[verbatim description]

## Taglines / Brand Copy
[verbatim — EN + VN if present]

## Sub-Brand Architecture
[how PRAiS, NET, OBI relate to each other — extract Michael's own words]

## Brand Narrative
[any longer-form brand story — verbatim]
```

---

## STEP 3 — DUPLICATION RULES

| If you find content that... | Action |
|---|---|
| Already exists verbatim in a MASTER/ file | Skip — do not duplicate |
| Exists in both `_3.txt` and `_4.txt` | Use `_3.txt` version (earlier = source) |
| Is a header only (no body executed) | Extract header, mark `[COPY PENDING]` |
| Has EN but no VN | Extract EN, mark VN as `[VN PENDING]` |
| Contradicts an existing MASTER/ file | Extract with note: `[CONTRADICTION — see brand-truth-canonical.md §N]` |

---

## STEP 4 — GAPS TO FLAG

After completing all 7 files, write a `GAPS.md` note (or add a `## GAPS` section to each file) covering:

- BlueTech stages 4, 7–16: found or not found?
- Agent-99 Stage 1.5 / Stage 1.7: found or not found?
- Any hooks only partially written
- Any Midjourney prompts that reference assets not described
- VN translations missing (count per file)

---

## OUTPUT CHECKLIST

- [ ] `active-listening-hooks.md` — 5 hooks complete
- [ ] `operational-playbook.md` — stages 1.8–3.7 complete
- [ ] `bluetech-classroom-curriculum.md` — stages 000–6 + 17–20, gaps flagged
- [ ] `messenger-bot-flows-extended.md` — new keywords only
- [ ] `agent99-system-prompt.md` — directives 1–11 + 20 hooks verbatim
- [ ] `gospel-444-image-prompts.md` — all Midjourney prompts
- [ ] `prais-brand-materials.md` — brand identity + copy

---

## BRAND ENFORCEMENT (apply to every file)

- Gospel 444: Void Black `#0f0f1a` | Soul Purple `#a855f7` | Imperial Gold `#f59e0b`
- **ZERO BLUE** — no blue in any brand/product context
- English copy = Imperial Gold anchor
- Vietnamese copy = sleek white subtitle
- Bilingual always. Missing VN = `[VN PENDING]`, never fabricate
- Preserve Michael's voice verbatim. Do not rewrite or improve copy.
- BANNED phrases (do not include even if found in older file iterations):
  - "We give permission" — BANNED
  - "We don't sell English" — BANNED
  - "Struggle Data Logs" — BANNED
  - "Rote memorization" alone — always pair as: Standard "Cramming" Memorization (Rote Memorization)

---

**Author:** OB-1 (Agent-99)
**Created:** 2026-06-08
**For:** Kilo session — marketing extraction sprint (files _2, _3, _4)
**Estimated Kilo sessions:** 7 (one per MASTER/ output file)
**Read KILO-MARKETING-ORGANIZER-BLUEPRINT-2-3-4.md first for OB-1 sampling context**
