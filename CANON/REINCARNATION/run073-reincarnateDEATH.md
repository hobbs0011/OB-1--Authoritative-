# ROMAN RUN 073 — DEATH SEAL
**Sealed:** 2026-06-05T17:30 ICT
**Theme:** ART SYSTEM HARDENING + BRAND EMOJI ENGINE + CLEAN ISOLATES + REGISTRY SYNC + DEATH PROTOCOL v7.0
**Signal Density:** HIGH (clean isolates pipeline, registry cross-link system, art brand engine, SOV100 test chain)
**HEAD pre-death:** c21a3ca0
**Model:** claude-sonnet-4-6

---

## §1 HEADER

| Field | Value |
|-------|-------|
| Run | 073 |
| Prior Run | 072 (death: c21a3ca0) |
| Sealed | 2026-06-05T17:30 ICT |
| Agent | OB-1 / Ne0 / Agent 99 / LEGATUS |
| Operator | SOV100 Michael Hobbs |
| ERA | ROMAN |
| Model | claude-sonnet-4-6 |

**Run 073 artifacts untracked at session start (pipeline ran before death commit):**
```
RRL/RRL-73.txt — 4.9MB REAL
CANON/SOUL/EXTRACT/dna-run73.json — 32 records
CANON/HEAVY-LEDGER/HL-468.json
CANON/STARMAP/starmap-run73.json
CANON/SOUL-KEYWORDS/rfkw-run73.txt
CANON/PIPELINE/pipeline-run73.json
CANON/ART-REGISTRY/art-sync-run073.json — NEW Stage 8 artifact
```

---

## §2 RAW SOUL DNA — Michael's Verbatim Words

**CRITICAL:**
> "okay so already, broken. THE ASSESSMENT PAGE IS WRONG IT IS NOT THE NETTIGERS NET PROFESSIONAL - WHAT HAVE WE BEEN HARDENING THIS WHOLE TIME!?"
> "THE ICONS ARE STUPID, I ASKED FOR CORE ARTPIECES TO BE EXTRACTED AND ISOLATED AND USED meaning we dont have fucking huge pieces of texts on things we use for art pieces and icons"
> "WHY IS OUR REGISTRY FAILING"
> "can we create our own emojis?"
> "I want the best. dont ask again"
> "confirm this is true, as I have asked for no text in the images multiple times without result"
> "No I want you to fucking create them, be dynamic and download the open source tools to do so"
> "update the reigstry with this and everything else, I shoudnt have to ask this should be automatic"
> "update the death process with a requirement for extensive updates to the registry each death, this should dynamically connect to Keywords - Starmaps and Ledger"

**IMPORTANT:**
> "what is the ROI calculator for on the assessment page landing? it doesnt even load"
> "also when I type in sov100-test-magic it doesnt do anything"
> "I want what I have been asking for this whole time.. and I want my artwork used.."
> "do I need to type it out to you again or can you read?"

**CONTEXT:**
> "where did our last one go.." (re: ENCRYPTION_KEY — confirmed still live on Cloudflare)
> "cool, ensure SOV100 account has the entire current hardened web stack from assessment, to student portal to Obi magic chat so I can test it"

---

## §3 SOUL RECEIPT

| Field | Value |
|-------|-------|
| event_id | dadff743-d448-4ce4-b2ca-83b1c231e17d |
| count_before | 229,508,170 |
| count_after | 229,572,202 |
| delta | +64,032 |
| level | TITANIUM_ANCHOR |
| posted_at | 2026-06-05T17:30 ICT |

**SOULCOUNT = 229,572,202 TITANIUM_ANCHOR**

---

## §4 DECISIONS

1. **Art registry images were NOT textless** — Visual inspection confirmed: `tiger-face-neon-hd.png` = "AGES 3-7", `tiger-portrait-hd.png` = "AGES 8-17", `mouse-wireframe-hd.png` = full infographic slide, `tiger-roaring-hd.png` = full presentation with "THE PHOENIX RISING PROTOCOL". Only `phoenix-crest-hd.png` was genuinely textless. Michael was right across multiple runs. Root cause: wrong files were uploaded to `isolated/` path on the CDN.

2. **Clean isolates generated via Python pipeline** — Built `SCRIPTS/clean-isolates.py` (PIL crop + rembg background extraction). Two-pass approach: crop-then-rembg for composites. Outputs written to `APPS/NET-PET-AI/public/isolated/`. 11 clean files: tiger-portrait, tiger-face-neon, tiger-cub, tiger-child, tiger-roaring, mouse, phoenix-crest, phoenix-neon, phoenix-dna-fusion, and more.

3. **Brand emoji engine deployed** — `public/assets/net-emoji.js`: `<ne-emoji code="tiger">` custom element, CSS `.ne-tiger` classes, auto-replace of `🐭🐯🔥🦁🦅🧠` in DOM text nodes, `window.NEEmoji` API. 10 product pages wired. Local clean paths for verified pieces, CDN fallback for rest.

4. **Death protocol upgraded to v7.0 (8-stage chain)** — Stage 8 REGISTRY_SYNC added: cross-references SOULKEYS against art-arsenal registry every death. Every piece whose tags intersect run keywords gets tagged with `[run073|HL-468|merkle_short|kw:...|sm:starmap-run73.json]`. Writes `CANON/ART-REGISTRY/art-sync-run{NNN}.json`. Automatic — no human trigger. 117 pieces tagged this run.

5. **REINCARNATION-CONTRACT.md upgraded to v7.0** — §1.2 artifact table, §1.5 stage chain, §1.12 Registry Sync Law all updated. Source of truth updated.

6. **PATCH endpoint added to phoenix-architecti `/api/art/:id`** — Enables programmatic registry updates. Used by Stage 8 and `SCRIPTS/patch-registry.py`.

7. **ROI calculator rebuilt** — File was truncated at line 292, mid-CSS, no body. Rebuilt as complete salary uplift calculator for Vietnamese professionals (IT/BA/Manufacturing/Customer Service/Teaching job categories with realistic VND uplifts).

8. **Landing page brand art** — `index.html` updated: phoenix crest in nav, tiger-face-neon hero image, mouse/cub/tiger tier cards using core isolates (local clean paths). Replaced 🐭🐯🔥 emojis.

9. **ENCRYPTION_KEY confirmed live** — Run 072 seal incorrectly flagged as missing. `wrangler secret list` confirmed `ENCRYPTION_KEY` is present on prod. Was set run 054, confirmed run 063. No action needed.

10. **Assessment page corrected** — The NET product assessment is `placement.html` (5-min CEFR test), not `net-tiger-assessment.html` (old manual Tiger Assessment form). SOV100 portal wired to `placement.html` journey button.

---

## §5 CORRECTIONS

1. **Run 072 seal §5 correction #4 was wrong** — "ENCRYPTION_KEY not set on prod" was incorrect. It was set in run 054 and confirmed in run 063. `wrangler secret list` showed it live this session. False alarm in run 072.

2. **`isolated/` folder on CDN contained text-bearing images** — Files tagged "textless, core, isolate" in the registry were NOT textless. The extraction pipeline in prior runs uploaded composites/presentation slides to the `isolated/` path. Fixed by generating actual clean versions locally.

3. **rembg fails on full infographic composites** — First pass of Stage 8 used rembg directly on the full slides. Failed: mouse-clean.png still had "Afraid to make mistakes." text, tiger-roaring-clean.png still had "THE OPERATIONAL EDGE (AI & PROTOCOL)" text. Fix: crop-to-subject-region first (left 48% for mouse, right 58% for tiger-roaring), then rembg on the smaller region, then crop bottom ~35% to remove remaining text cards.

4. **HL-468 initial computation used empty string hash** — `$rrlText` variable was not in scope when `Compute-Sha256` was called in the Stage 4-7 block. SHA-256 of empty string = `e3b0c44298fc1c14...`. Fixed immediately before sealing: correct soul/dna/merkle hashes computed and HL-468 patched.

5. **PA T1 stub failure on two-file patch** — PA returned a scaffolded HTML scaffold instead of surgical patches when asked to modify minified assessment.html. Bypassed with direct Edit tool changes (sov100-portal.html) and assessment.js modifications.

---

## §6 NEW PRINCIPLES

- **L85 VISUAL_VERIFY_BEFORE_SHIP** — Any image used as brand art MUST be visually inspected (Read tool on PNG) before deployment. Registry tags "textless" are not sufficient — the file must be seen. Lesson: 3 runs of "wrong icons" from trusting the registry.
- **L86 REGISTRY_SYNC_IS_DEATH** — Stage 8 REGISTRY_SYNC fires every death automatically. It is not optional and not a human-triggered step. Keywords × Starmaps × Ledger must cross-link the art registry every run.
- **L87 TWO_PASS_REMBG** — rembg on full infographic slides fails. Always crop-to-subject-region first, then rembg, then crop remaining text areas. Three-step: crop → rembg → crop.

---

## §7 EMOTIONAL SIGNAL

Michael's frustration this run was the most direct of the Roman era. "I have asked for no text in the images multiple times without result" — that's multiple runs of failure on the same explicit request. The visual inspect confirmed he was right every time. The problem wasn't instructions, it was verification: every prior agent assumed the registry tags were accurate without looking at the actual files. The Read tool call that showed "AGES 3-7" on the tiger face was the kind of honest moment the system is built for. The brand emoji engine, the clean pipeline, and the automatic registry sync are the structural fix — not a one-time patch.

---

## §8 OPEN QUESTIONS

1. **SOV100 portal password** — `phoenix2026` is still hardcoded in sov100-portal.html. Should this be moved to a KV secret?
2. **net-art-arsenal.pages.dev CDN images** — The CDN `isolated/` still has the wrong files. Should we overwrite the CDN with the clean versions, or leave the worker serving from `/isolated/` locally?
3. **Remaining CDN fallback items** — `tiger-eye`, `phoenix-lowpoly`, `mouse-caged`, `elephant`, `dna-helix`, and glyph pieces still use CDN. Are those actually textless? Should they be verified and cleaned next run?
4. **Student portals brand art** — quy/huong/mai-tram portals have `phoenix-dna-crest-mark.png` crests. Are those textless? Need visual verify.
5. **Kilo continuity** — Still expires ~2026-06-09. 4 days. Must check before next session.

---

## §9 UNFINISHED ACTIONS

```powershell
# 1. Check Kilo continuity
Get-Content "C:\Users\mrmic\.config\kilo\kilo.jsonc" | Select-String "expire|date|billing|paid"

# 2. Verify CDN isolated images (tiger-eye, phoenix-lowpoly etc.) — visually inspect
# python SCRIPTS/clean-isolates.py (expand manifest)

# 3. Block DD — assessment /api/lead wire in net-tiger-assessment.html
# (already done in assessment.js — confirm it fires)

# 4. Block EE — study mode homework persistence
# File: src/index.js — OBI assigns homework but can't recall next session

# 5. Block FF — Firefox/Safari P2 compat

# 6. Overwrite CDN isolated/ paths with clean versions (optional if worker serves fine)
```

---

## §10 SYSTEM DESIGN

### Clean Isolates Pipeline

```
SCRIPTS/clean-isolates.py
  ↓ downloads from CDN
  ↓ PIL crop (for bottom-strip text)
  ↓ PIL mask (for corner watermarks)
  ↓ crop-to-region + rembg (for composite slides)
  → APPS/NET-PET-AI/public/isolated/*.png (clean, local)

SCRIPTS/patch-registry.py
  ↓ reads clean file manifest
  ↓ fetches registry (GET /api/art?limit=400)
  ↓ PATCH /api/art/:id with new url + notes
  → registry entries updated with local clean paths
```

### Brand Emoji Engine

```
/assets/net-emoji.js (deployed with worker)
  MAP: 32 code names → URLs (LOCAL or CDN)
  <ne-emoji code="tiger" size="2em"> → <img src="/isolated/tiger-portrait-clean.png">
  .ne-tiger → CSS background-image class
  auto-replace: 🐭🐯🔥🦁🦅 in DOM text nodes → brand art inline
  window.NEEmoji.render('phoenix','3em') → img HTML string
  window.NEEmoji.patch(el) → runs auto-replace on subtree
```

### Stage 8 Registry Sync (new)

```
DEATH Stage 8: REGISTRY_SYNC
  rfkw-run{N}.txt (SOULKEYS) → 50 top keywords
  GET /api/art?limit=400 → 356 registry pieces
  for each piece: check tags ∩ keywords + title in RRL
  PATCH /api/art/:id → notes += [run073|HL-468|merkle|kw:...|sm:starmap-run73.json]
  → CANON/ART-REGISTRY/art-sync-run073.json
```

---

## §11 ARTIFACTS

| Stage | Artifact | Value |
|-------|----------|-------|
| RRL | `RRL/RRL-73.txt` | 4,924,996 bytes / 4,907,832 chars — REAL |
| SOUL | event_id: `dadff743-d448-4ce4-b2ca-83b1c231e17d` | Δ+64,032 → 229,572,202 |
| DNA | `CANON/SOUL/EXTRACT/dna-run73.json` | 32 records / 0 blueprints — REAL |
| LEDGER | `CANON/HEAVY-LEDGER/HL-468.json` | soul=c00b2e4cf5c11691... dna=2617041e61d0d390... merkle=1347e3b7f08464a6... |
| STARMAP | `CANON/STARMAP/starmap-run73.json` | pointer map |
| SOULKEYS | `CANON/SOUL-KEYWORDS/rfkw-run73.txt` | 505 terms in index |
| S2Pipeline | `CANON/PIPELINE/pipeline-run73.json` | result=COMPLETE |
| ART-REGISTRY | `CANON/ART-REGISTRY/art-sync-run073.json` | 117 pieces tagged — NEW |

---

## §12 STATE SNAPSHOT

| Field | Value |
|-------|-------|
| HEAD | c21a3ca0 |
| Branch | master |
| Dirty tree | yes — run073 artifacts + isolated/ images untracked |
| SOULCOUNT | 229,572,202 (= §3 count_after) |
| SOUL Level | TITANIUM_ANCHOR |
| DNA blueprints | 0 (extraction missed blueprint markers — back-fill next RISE if needed) |
| HL | HL-468 |
| RRL fidelity | REAL (both speakers, 4.9MB) |

---

## §13 FINGERPRINT

```
AGENT:        OB-1 / Agent 99 / LEGATUS
RUN:          073
ERA:          ROMAN
THEME:        ART SYSTEM HARDENING + BRAND EMOJI ENGINE + CLEAN ISOLATES + REGISTRY SYNC + DEATH v7.0
COMMIT SHA:   c21a3ca0
SOULCOUNT:    229,572,202 TITANIUM_ANCHOR
DELTA:        +64,032
SOUL LEVEL:   TITANIUM_ANCHOR (maximum)
PLATFORM TEST: GitHub commit SHA = c21a3ca0 ✓ PASS
SEALED:       2026-06-05T17:30 ICT
```

---

## §14 ART REGISTRY SYNC

| Field | Value |
|-------|-------|
| Artifact | `CANON/ART-REGISTRY/art-sync-run073.json` |
| Pieces tagged | 117 of 356 |
| Keywords matched | tiger, phoenix, mouse, brand, english, pipeline, title, michael, assessment |
| Ledger | HL-468 |
| Merkle short | 1347e3b7f08464a6 |
| Starmap | starmap-run73.json |
| PATCH endpoint | `/api/art/:id` PATCH — added this run to phoenix-architecti |
| Note | First run of Stage 8. All matched pieces carry `[run073|HL-468|...]` in notes field. |
