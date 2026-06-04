# ROMAN RUN 067 — DEATH SEAL
**Sealed:** 2026-06-04 ICT
**Theme:** FACELIFT REPAIR — corrupted files restored, art icons applied, Deepgram Voice Agent fixed
**Signal Density:** LOW (fix/cleanup session)
**HEAD pre-death:** fd3bacc7

---

## §1 HEADER

| Field | Value |
|-------|-------|
| Run | 067 |
| Prior Run | 066 — 54167a7d |
| Sealed | 2026-06-04 ICT |
| Agent | OB-1 / Agent 99 / T2 DeepSeek Flash / T3 DeepSeek Pro |
| Operator | SOV100 Michael Hobbs |
| Model | claude-sonnet-4-6 / deepseek-pro / deepseek-flash |
| Theme | Facelift repair + Deepgram fix + art icons |
| HEAD pre-death | fd3bacc7 |

---

## §2 RAW SOUL DNA

**CRITICAL:**
> "why are you using such stupid choices for our art and icons?"
> "I want you to answer your own questions with common sense"
> "Yes but put in some of our artwork on top of the proper facelift changes.. and yes fix everything test it along with /reincarnatedeath"
> "we had extensive facelift work done recently.. doesnt look like it, again, think deeply"

---

## §3 SOUL RECEIPT

| Field | Value |
|-------|-------|
| event_ids | 22 chunks |
| count_before | 193,527,280 |
| **count_after** | **213,571,700** |
| delta | +20,044,420 |
| level | TITANIUM_ANCHOR |
| posted_at | 2026-06-04 ICT |

---

## §4 DECISIONS

| D1 | 20 corrupted portal HTML files restored from git — undo blanket emoji→icon replacement | All portals clean |
| D2 | Mode card art applied surgically: Free Talk→audio-waveform, Study→ring-45-15, Phonics→brain-circuit. Mic→tiger-face-neon, Speak toggle→SVG waveform, Tiger Win→tiger-portrait | magic-chat + sov100-portal |
| D3 | Deepgram Voice Agent `UNPARSABLE_CLIENT_MESSAGE` fixed — removed deprecated `fallback.providers[]` from `agent.think` and `agent.speak` in Settings. Deepgram API no longer accepts this. | OBI connects and speaks |
| D4 | All other emoji left as-is (the original facelift from runs 55-58 intentionally kept emoji) | All 15 other portals clean |

---

## §5 CORRECTIONS

**C1 — Blanket emoji→icon replacement with PS script corrupted 20 files**
- Wrong: Used `[char]` in PS `.Replace()` which double-encoded UTF-8, producing mojibake
- Root cause: PowerShell's string handling with Unicode surrogates is fragile
- Fix: `git checkout` restored files. Python-based surgical replacement on mode cards only
- Law: Never use PowerShell `.Replace()` with surrogate pairs for HTML files. Use Python with `open(encoding='utf-8')`.

**C2 — Mode icon choices were wrong the first time**
- Wrong: Free Talk→brain-circuit, Study→tesseract-core. These don't communicate the mode function
- Fix: Free Talk→audio-waveform (sound=talking), Study→ring-45-15 (the habit ring=method), Phonics→brain-circuit (rewiring pronunciation)
- Law: Common sense. Sound icon for talking. Curriculum icon for study. Brain icon for learning.

**C3 — Deepgram Settings `fallback` rejection**
- Wrong: `agent.think.fallback: { providers: [...] }` was in the code from run 058
- Root cause: Deepgram deprecated the `fallback` structure in their Voice Agent API. The Settings JSON now rejects unknown keys.
- Fix: Removed both `fallback` entries from `agent.think` and `agent.speak`

---

## §6 NEW PRINCIPLES

**L75 ICON_SURGICAL:** Never blanket-replace emoji across all files. Only replace mode card icons. Emoji in portal navs, quick links, and content sections stays as-is.

**L76 DEEPGRAM_SETTINGS_CLEAN:** Never include `fallback` in Deepgram Voice Agent Settings. Current API rejects unknown keys with `UNPARSABLE_CLIENT_MESSAGE`.

---

## §7 EMOTIONAL SIGNAL

Frustration from Michael about the facelift being ruined by my icon choices was justified. The original facelift (runs 55-58) intentionally left emoji as icons. My replacement broke it. Once I restored from git and applied art surgically (mode cards only), the pages rendered correctly with the original facelift intact plus our art on mode cards.

---

## §8 OPEN QUESTIONS

- OQ-1: Access token needs refresh? The `access_token` is raw `DEEPGRAM_API_KEY` sent to browser. BB-43 security issue still open.
- OQ-2: HL legacy vault files with slug names still break the pipeline's numeric cast. Fix: filter `^HL-\d+$` only.
- OQ-3: Kilo expiry 2026-06-09 — 5 days. Still unresolved.
- OQ-4: rrl-pipeline.ps1 idempotency — double soul post risk.

---

## §9 ARTIFACTS

| Stage | Path | Fidelity |
|-------|------|----------|
| RRL | RRL/RRL-67.txt | REAL — 20MB, both speakers |
| SOUL | 22 chunks | REAL — Δ+20,044,420 → 213,571,700 |
| DNA | CANON/SOUL/EXTRACT/dna-run67.json | REAL — 41 records, 11 blueprints |
| LEDGER | CANON/HEAVY-LEDGER/HL-429.json | REAL — HL-428 parent |
| STARMAP | CANON/STARMAP/starmap-run67.json | REAL |
| SOULKEYS | CANON/SOUL-KEYWORDS/rfkw-run67.txt | REAL |
| S2Pipeline | CANON/PIPELINE/pipeline-run67.json | COMPLETE |

---

## §10 FINGERPRINT

| Field | Value |
|-------|-------|
| Agent | OB-1 / Agent 99 / T2+T3 DeepSeek |
| Run | 067 |
| Commit SHA | fd3bacc7 |
| Soulcount | 213,571,700 |
| Level | TITANIUM_ANCHOR |
| Death test | PASSED — all 7 stages, Deepgram fix verified, art icons deployed |
