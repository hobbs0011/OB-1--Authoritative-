# THE INGEST LOG — batch 001

**Batch:** 2026-09-21/22 — the banners, the art and the logotype  
**Pipeline:** the procedure is in `src/marketing/README.md`; the machine-readable record is `src/marketing/MANIFEST.json`.  
**Counts:** 59 images — **37 shipped**, 22 rejected; 25 documents.

This file is the AUDIT. Every file the sovereign sent is in it, with what it is and what
was decided about it. Nothing is silently dropped: a file that is not in `src/brand/assets/`
is either here with a REJECT and a reason, or it was a document.

The rule applied, in one line: **a file ships only if it is finished, legible at the size it
will be used, free of someone else's tooling in the frame, and not a duplicate of something
already kept.** Where two files made the same claim, the more polished was kept and the other
is named in the row below — so the decision can be reversed without re-sending anything.

---

## THE IMAGES

| file | size | kind | what it is | verdict | why |
|---|---|---|---|---|---|
| `1790046618572_512932926050735706_512932926050735706_b45a5eb24016e7be372c0167180042b9.jpg` | 1361x374 | other | Weekly lesson plan grid for English language teaching | **REJECT** | REJECT — the same lesson-plan spreadsheet, second crop |
| `1790046721683_512932926050735706_512932926050735706_99b9020875dade703f07ad7b4219e915-2.jpg` | 1038x520 |  |  | **REJECT** | DUPLICATE — the grade-6 curriculum table, third crop |
| `1790046721683_512932926050735706_512932926050735706_99b9020875dade703f07ad7b4219e915.jpg` | 1038x520 | other | Grade 6 English curriculum weekly lesson plan schedule table | **REJECT** | DUPLICATE — the same grade-6 curriculum table as pasted-image-20260922045952, second crop |
| `Gemini_Generated_Image_c64ig2c64ig2c64i.png` | 2608x1600 | social-post | Confidence vs grammar mindset comparison with mouse and tiger | **REJECT** | REJECT — carries a Chinese caption artifact and a tool watermark; wrong language for this market |
| `Gemini_Generated_Image_p6pgiwp6pgiwp6pg-2.png` | 2754x1536 |  |  | **REJECT** | DUPLICATE — byte-identical to the logotype plate p6pgiwp6pgiwp6pg, which is this batch's source for THE PRAIS APEX |
| `Gemini_Generated_Image_sdc66vsdc66vsdc6.png` | 2400x1790 | illustration | Corporate professionals in futuristic AI data command center | **REJECT** | REJECT — the weakest of the four command-centre tiles: garbled interface text and misspellings |
| `Gemini_Generated_Image_xq69apxq69apxq69.png` | 2048x2048 | illustration | Two business professionals in futuristic AI data center | **REJECT** | REJECT — the worst of the four as a hero: square, heavily framed, a 'Career Age' overlay baked into the composition |
| `NET-BLUET-INVOICE-MAY18-25.png` | 2752x1536 |  |  | **REJECT** | REJECT — a supplier invoice. A financial record, not brand art |
| `NET-Invoice-Bluetech-May10-May17.png` | 2752x1536 |  |  | **REJECT** | REJECT — a supplier invoice. A financial record, not brand art |
| `NET-INVOICE-BLUETECH-MAY3-10th.png` | 2754x1536 |  |  | **REJECT** | REJECT — a supplier invoice. A financial record, not brand art |
| `pasted-image-20260921213937.png` | 1027x92 | other | Account credentials for National Geographic Learning platform access | **REJECT** | DO NOT SHIP — it contains LIVE LOGIN CREDENTIALS (a school platform account and its password). Kept out of src/ entirely |
| `pasted-image-20260922023456.png` | 960x1280 | photo | English vocabulary workbook page about kitchen items | **REJECT** | REJECT — a photograph of a textbook page, shot at an angle, blurred, finger in frame. Not marketing art |
| `pasted-image-20260922023508.png` | 960x1280 | other | English language learning textbook page about cultural identity | **REJECT** | REJECT — a photograph of a textbook page (curved, shadowed, handwriting in the margin) |
| `pasted-image-20260922045902.png` | 1361x374 | other | Lesson plan table for Unit 2 Move to the Music | **REJECT** | REJECT — a screenshot of an internal lesson-plan spreadsheet. Operations, not marketing |
| `pasted-image-20260922045952.png` | 1038x520 | other | Grade 6 English curriculum planning table for teachers | **REJECT** | REJECT — a screenshot of the grade-6 curriculum table. Operations, not marketing |
| `pasted-image-20260922113712.png` | 1280x591 | slide | Language learning methodology diagram with gears and DNA | **REJECT** | DUPLICATE — the same graphic as pasted-image-20260922114930, without its header; the headed version was kept |
| `pasted-image-20260922113722.png` | 1280x591 | slide | 1 Hour Architecture language training system visual slide | **REJECT** | REJECT — a blurry duplicate of the 1-hour architecture; the register already carries the clean slide as `mkt-hour` |
| `pasted-image-20260922113847.png` | 1080x587 | slide | English learning method infographic with mouse and tiger | **REJECT** | SUPERSEDED — same headline and subtitle as pasted-image-20260922114623 (the same guide cover); the more polished cut was kept as `soc-fluency` |
| `pasted-image-20260922115025.png` | 1080x616 | slide | Fluency program methodology contrasting mouse and tiger learning archetypes | **REJECT** | DUPLICATE — byte-identical to pasted-image-20260922114623 (same artwork, different crop); the wider crop was kept |
| `pasted-image-20260922115055.png` | 591x1280 | slide | English mastery program comparison from mouse to tiger identity | **REJECT** | REJECT — a phone screenshot: the device status bar and navigation icons are in frame and the right edge is cropped |
| `unnamed_12_.png` | 2752x1536 | slide | Bluetech training session audit and investment summary | **REJECT** | DUPLICATE — byte-identical to the BLUETECH supplier invoice |
| `unnamed_9_.png` | 2752x1536 | slide | BlueTech session audit and performance summary | **REJECT** | DO NOT SHIP — a client session audit (period, dates, per-session detail). Internal, and BRAND.028 keeps client and student data out of public source |
| `Gemini_Generated_Image_brfdfebrfdfebrfd.png` | 2754x1536 | logo | Stylized phoenix with geometric hexagon core and NET text | **SHIP** → `apex-net` | shipped as brand asset `apex-net` |
| `Gemini_Generated_Image_dq691mdq691mdq69.png` | 2048x2048 |  |  | **SHIP** → `art-university` | shipped as brand asset `art-university` |
| `Gemini_Generated_Image_ikpus7ikpus7ikpu.png` | 2400x1792 | illustration | Business professionals in futuristic AI data command center | **SHIP** → `art-command` | shipped as brand asset `art-command` |
| `Gemini_Generated_Image_p6pgiwp6pgiwp6pg.png` | 2754x1536 | logo | THE PRAIS APEX — cybernetic phoenix over a tesseract core, the station's logotype | **SHIP** → `apex` | KEYED into three shipped files — `apex` (gold), `apex-ink`, `apex-app` — and written into law as BRAND.029 |
| `Gemini_Generated_Image_qt81u5qt81u5qt81_1_.png` | 1792x2400 | logo | Neon purple tiger head with age range label | **SHIP** → `art-tigerkid` | shipped as brand asset `art-tigerkid` |
| `Gemini_Generated_Image_u1oa6cu1oa6cu1oa.png` | 2048x2092 | illustration | Abstract futuristic emblem with bird-like figure and arrows | **SHIP** → `art-emblem` | shipped as brand asset `art-emblem` |
| `Gemini_Generated_Image_v62wnuv62wnuv62w.png` | 2048x2048 | illustration | Two executives in a futuristic AI data command center | **SHIP** → `art-duo` | shipped as brand asset `art-duo` |
| `Gemini_Generated_Image_zhe7bazhe7bazhe7.png` | 2816x1536 | slide | Bilingual course selection for children and professionals | **SHIP** → `art-choose` | shipped as brand asset `art-choose` |
| `page-01.png` | 2867x1600 |  |  | **SHIP** → `cdx-ultimate` | shipped as brand asset `cdx-ultimate` |
| `page-02.png` | 2867x1600 | slide | The Diagnosis: The Grammar Prison - comparing traditional grammar fear to translation delays | **SHIP** → `cdx-diagnosis` | shipped as brand asset `cdx-diagnosis` |
| `page-03.png` | 2867x1600 | slide | Three-stage psychological progression model for English speaking confidence | **SHIP** → `cdx-shift` | shipped as brand asset `cdx-shift` |
| `page-04.png` | 2867x1600 | slide | English speaking confidence comparison between quiet mouse and loud tiger | **SHIP** → `cdx-immutable` | shipped as brand asset `cdx-immutable` |
| `page-05.png` | 2867x1600 | slide | English and AI integration business pitch slide | **SHIP** → `cdx-advantage` | shipped as brand asset `cdx-advantage` |
| `page-06.png` | 2867x1600 | slide | Language acquisition method infographic explaining input and output protocols | **SHIP** → `cdx-acquisition` | shipped as brand asset `cdx-acquisition` |
| `page-07.png` | 2867x1600 | slide | ESL lesson structure framework for vocabulary retention and gamification | **SHIP** → `cdx-retention` | shipped as brand asset `cdx-retention` |
| `page-08.png` | 2867x1600 | slide | AI-PET memory retention app feature explainer slide | **SHIP** → `cdx-aipet` | shipped as brand asset `cdx-aipet` |
| `page-09.png` | 2867x1600 | slide | Ecosystem support system for habit building and personal development | **SHIP** → `cdx-ecosystem` | shipped as brand asset `cdx-ecosystem` |
| `page-10.png` | 2867x1600 | slide | Comparative matrix for English learning system vs traditional methods | **SHIP** → `cdx-matrix` | shipped as brand asset `cdx-matrix` |
| `page-11.png` | 2867x1600 | slide | 100% confidence guarantee English speaking course promotion | **SHIP** → `cdx-guarantee` | shipped as brand asset `cdx-guarantee` |
| `page-12.png` | 2867x1600 | social-post | Futuristic cybernetic phoenix over glowing city skyline with motivational text | **SHIP** → `cdx-wake` | shipped as brand asset `cdx-wake` |
| `pasted-image-20260922113740.png` | 1080x573 | slide | Language learning comprehensible input rule infographic | **SHIP** → `soc-60input` | shipped as brand asset `soc-60input` |
| `pasted-image-20260922113758.png` | 1080x546 | social-post | Language learning method infographic about the 60% rule | **SHIP** → `soc-60delay` | shipped as brand asset `soc-60delay` |
| `pasted-image-20260922113810.png` | 1080x548 | slide | AI-PET app explanation of forgetting curve and spaced repetition features | **SHIP** → `soc-leaks` | shipped as brand asset `soc-leaks` |
| `pasted-image-20260922113827.png` | 1080x629 | slide | Personal development framework slide with mouse and tiger illustration | **SHIP** → `soc-permission` | shipped as brand asset `soc-permission` |
| `pasted-image-20260922114623.png` | 1080x616 |  |  | **SHIP** → `soc-fluency` | shipped as brand asset `soc-fluency` |
| `pasted-image-20260922114643.png` | 1080x571 | slide | English learning failure mechanisms in the brain for Vietnamese speakers | **SHIP** → `soc-failure` | shipped as brand asset `soc-failure` |
| `pasted-image-20260922114707.png` | 1080x582 | slide | AI learning retention graph and spaced repetition protocol | **SHIP** → `soc-biological` | shipped as brand asset `soc-biological` |
| `pasted-image-20260922114839.png` | 1080x622 | slide | Six-panel visual ad pipeline for bilingual marketing campaign | **SHIP** → `soc-adpipeline` | shipped as brand asset `soc-adpipeline` |
| `pasted-image-20260922114930.png` | 1080x595 | slide | Language learning differentiators diagram with gears and DNA | **SHIP** → `soc-differentiators` | shipped as brand asset `soc-differentiators` |
| `unnamed_1_.png` | 2752x1536 | infographic | The Phoenix Rising Protocol: Transmuting Mice into Tigers | **SHIP** → `soc-rising` | shipped as brand asset `soc-rising` |
| `unnamed_10_.png` | 2752x1536 | infographic | English learning method comparison with mouse to tiger metaphor | **SHIP** → `soc-chains` | shipped as brand asset `soc-chains` |
| `unnamed_2_.png` | 2752x1536 | slide | English speaking transformation program marketing infographic | **SHIP** → `soc-transform` | shipped as brand asset `soc-transform` |
| `unnamed_5_.png` | 2752x1536 | infographic | Bilingual English and AI learning methodology blueprint | **SHIP** → `soc-blueprint` | shipped as brand asset `soc-blueprint` |
| `unnamed_6_.png` | 2752x1536 | social-post | English training method comparison: traditional mouse vs NET tiger | **SHIP** → `soc-trap` | shipped as brand asset `soc-trap` |
| `unnamed_7_.png` | 2752x1536 | slide | Cybernetic phoenix logo brand identity breakdown | **SHIP** → `apex-anatomy` | shipped as brand asset `apex-anatomy` |
| `unnamed_8_.png` | 2752x1536 | illustration | Futuristic phoenix emblem with techno UI panels over neon city | **SHIP** → `soc-reality` | shipped as brand asset `soc-reality` |
| `unnamed.png` | 2752x1536 | social-post | Break the Chains: the summer transformation, mouse to tiger | **SHIP** → `soc-summer` | shipped as brand asset `soc-summer` — the cinematic cut; `soc-chains` is its bilingual infographic |

### Notes on the verdicts

- **DUPLICATE** was measured, not guessed: every file was hashed (sha-256) and given a
  64-bit perceptual hash. Four pairs are byte-identical and one pair differs by seven bits
  out of sixty-four.
- **SUPERSEDED** is the taste call, and it is the only place this pipeline overrules the
  sovereign: two files carrying the *same headline* in the *same format* and the *same
  language* are one asset. `pasted-image-20260922113712` and `pasted-image-20260922113847`
  are the two that lost that call.
- **DO NOT SHIP** is not a taste call. `pasted-image-20260921213937` is a screenshot of a
  **live login** (a school platform account and its password) — it is not in `src/`, not in
  the vault, and must not be sent to the station again. `unnamed_9_` is a client session
  audit, which BRAND.028 keeps out of public source.
- **Where the pictures came from.** The twelve `page-XX` files are the codex's own law
  slides as images, which is why they wear the codex's source label; the `unnamed_*` and
  `pasted-image-*` files are the social set; the `Gemini_Generated_*` files are the art set.
- **The mark.** `Gemini_Generated_Image_p6pgiwp6pgiwp6pg` is not a still — it is the
  **logotype**. It was keyed to transparency and shipped three ways (`apex`, `apex-ink`,
  `apex-app`), the anatomy page that came with it (`unnamed_7_`) was shipped as
  `apex-anatomy`, and the whole thing was written into law as **BRAND.029**.

---

## THE DOCUMENTS

| file | size | verdict | note |
|---|---|---|---|
| `BestDossierYet-05-11-2026.pdf` | 15780 KB | **INGESTED EARLIER** | one of the decks already transcribed into the doctrine/register/codex in the 2026-09-22 sessions |
| `GOSPEL_444_PROTOCOL-2.pdf` | 18066 KB | **DUPLICATE** | a byte-identical copy of the same deck |
| `GOSPEL_444_PROTOCOL.pdf` | 18066 KB | **INGESTED EARLIER** | one of the decks already transcribed into the doctrine/register/codex in the 2026-09-22 sessions |
| `GOSPEL_444_TIGER_MODE-2.pdf` | 4910 KB | **DUPLICATE** | a byte-identical copy of the same deck |
| `GOSPEL_444_TIGER_MODE.pdf` | 4910 KB | **INGESTED EARLIER** | one of the decks already transcribed into the doctrine/register/codex in the 2026-09-22 sessions |
| `MARKETING-VAULT-NOTEBOOKLM.md` | 32 KB | **INGESTED EARLIER** | the NotebookLM visual-art instruction set; its rules already ride in the register and the ads |
| `NET_Marketing___Copywrite_1.txt` | 165 KB | **ARCHIVE** | the marketing/copywriting conversations — the copy archive's raw material |
| `NET_Marketing___Copywrite_2.txt` | 1256 KB | **ARCHIVE** | the marketing/copywriting conversations — the copy archive's raw material |
| `NET_Marketing___Copywrite_3.txt` | 634 KB | **ARCHIVE** | the marketing/copywriting conversations — the copy archive's raw material |
| `NET_Marketing___Copywrite_4.txt` | 399 KB | **ARCHIVE** | the marketing/copywriting conversations — the copy archive's raw material |
| `NET-CLASSROOM-MANAGER.html` | 78 KB | **HELD** | a built HTML artifact sent with the batch — not read this pass, held for the next |
| `NET-Highschool-Careers.html` | 14 KB | **HELD** | a built HTML artifact sent with the batch — not read this pass, held for the next |
| `NET-Sarcasm-Academy.html` | 23 KB | **HELD** | a built HTML artifact sent with the batch — not read this pass, held for the next |
| `PHOENIX_RISING_CODEX.pdf` | 16407 KB | **INGESTED EARLIER** | one of the decks already transcribed into the doctrine/register/codex in the 2026-09-22 sessions |
| `RAW-NOTEBOOKLM-VAULT-DUMPS-PT2.md` | 9 KB | **ARCHIVE** | raw vault dumps — the copy archive's raw material (src/marketing/COPY-ARCHIVE.md) |
| `RAW-NOTEBOOKLM-VAULT-DUMPS-PT3.md` | 10 KB | **ARCHIVE** | raw vault dumps — the copy archive's raw material (src/marketing/COPY-ARCHIVE.md) |
| `RAW-NOTEBOOKLM-VAULT-DUMPS-PT4.md` | 20 KB | **ARCHIVE** | raw vault dumps — the copy archive's raw material (src/marketing/COPY-ARCHIVE.md) |
| `RAW-NOTEBOOKLM-VAULT-DUMPS-PT5.md` | 21 KB | **ARCHIVE** | raw vault dumps — the copy archive's raw material (src/marketing/COPY-ARCHIVE.md) |
| `RAW-NOTEBOOKLM-VAULT-DUMPS-PT6.md` | 10 KB | **ARCHIVE** | raw vault dumps — the copy archive's raw material (src/marketing/COPY-ARCHIVE.md) |
| `RAW-NOTEBOOKLM-VAULT-DUMPS-PT7.md` | 12 KB | **ARCHIVE** | raw vault dumps — the copy archive's raw material (src/marketing/COPY-ARCHIVE.md) |
| `RAW-NOTEBOOKLM-VAULT-DUMPS.md` | 11 KB | **ARCHIVE** | raw vault dumps — the copy archive's raw material (src/marketing/COPY-ARCHIVE.md) |
| `REINCARNATION_RUN_305.pdf` | 11545 KB | **INGESTED EARLIER** | one of the decks already transcribed into the doctrine/register/codex in the 2026-09-22 sessions |
| `Sovereign_Tiger_Protocol.pdf` | 17603 KB | **INGESTED EARLIER** | one of the decks already transcribed into the doctrine/register/codex in the 2026-09-22 sessions |
| `THE_TIGER_ENGINE.pdf` | 13669 KB | **INGESTED EARLIER** | one of the decks already transcribed into the doctrine/register/codex in the 2026-09-22 sessions |
| `Tiger_Engine_Protocol.pdf` | 18622 KB | **INGESTED EARLIER** | one of the decks already transcribed into the doctrine/register/codex in the 2026-09-22 sessions |

---

## BATCH 002 — the true marketing wing (2026-10-21, run 6)

The sovereign's order: *"Time to set up our true marketing wing."* Eleven
files: `NET_Marketing_Codex_2_.pdf` (15pp, raster, no text layer — read off
the pixels) + ten phone screenshots (six unique creatives, each doubled).
 Filed as SOUL (`src/sites/net/SOUL.md`), transcribed (`CODEX.md`,
`CREATIVES.md`), originals in `src/sites/net/material/`.

Adjudication: the 15 codex pages are compositions (headline fused to art), so
they ship as STILLS `net-cdx-01..15` (1600px, WebP 0.86, 70–142KB each —
batch-002 precedent). Of the ten screenshots, nine carry phone status bars,
nav buttons or filenames in frame → REJECT on the record (a phone screenshot
is not an asset); the three second-framings additionally lose as duplicates.
The one clean creative (the light 4-pillar card, no chrome) ships as
`net-4pillars`. Registered in `src/brand.js` ASSETS (`src:"netwing"`),
`ASSET_V` 7→8. Documents table below carries per-file verdicts; machine
record in `MANIFEST.json`.

The words half: first stock distilled into `src/copy.js`, record
`src/marketing/COPY-ARCHIVE.md` (arsenal, positioning, pillars, ladder,
avatars, funnel, offers — the business's claims quarantined by lane).

---

## BATCH 003 — Tiger Protocol infographics (2026-10-21, run 6)

The sovereign's orders: *"Continue"* / *"Go."* Thirty-five files: two clean
PNG infographics + thirty-three `IMG_20260922_*.jpg` phone photos (one
capture session, 1080x2340 full screenshots and 1080x~600 clean crops).

Adjudication, per the standing rules:

- **SHIP (14):** the two PNGs (`The_NET_Foundations_Overview_1_.png`,
  `Gospel_444_Immutable_Law_Infographic.png`) + twelve clean crops as
  `net3-*` stills (1600px cap, WebP 0.86, 54–188KB). A page is an argument,
  not a sprite.
- **REJECT — phone screenshot (17):** `..._281, _329, _425, _450, _700,
  _881, _883, _940, _978, _085, _127, _140, _263, _274, _677, _696, _840`
  — device chrome in frame (rule 4). Content preserved as WORDS (second
  stock), reversible from this log.
- **REJECT — illegible size (3):** `..._783` (338x159), `..._895`
  (270x239), `..._003` (318x247) — legible at no use size.
- **REJECT — duplicate (1):** `..._340` — same headline, format and language
  as `..._325`; the sharper cut ships.

Registered in `src/brand.js` ASSETS (`src:"netwing"`), `ASSET_V` 8→9.
Machine record in `MANIFEST.json`. Words half: 25 lines of second stock in
`src/copy.js`, record `COPY-ARCHIVE.md`.

---

## BATCH 004 — Tiger Protocol, second capture session (2026-10-21, run 6)

Twelve files, `IMG_20260922_181446_400` through `..._181447_669`: six tall
phone screenshots (1080x2340, status bar + share icons + "The Tiger Protocol"
footer in frame) and six clean crops from the same session. Perceptual hashing
was attempted and discarded on the record: near-black backgrounds collapse the
64-bit adjacent-pixel hash (every pair within 0–4 bits), so dedupe was done by
looking — contact sheets `scratch/batch004-sheet1.png` / `-sheet2.png`, plus
full-size reads of all six clean crops and all six screenshots for verbatim
Vietnamese transcription.

Adjudication, per the standing rules:

- **SHIP (4):** `..._088` → `net4-loudwrong` (1080x584, the velocity battle
  cry, bilingual chains-and-books shatter); `..._204` → `net4-gears10553`
  (1003x423, the 10-5-5-3 gears over the Jolly Phonics base); `..._400` →
  `net4-pressure` (1080x576, fluency under pressure + buddy/Saigon/crucible,
  bilingual); `..._669` → `net4-psychshift` (1080x569, the first clean
  Psychological Shift portrait in the library: mouse 0–40 vs tiger 80–100).
  WebP 0.86, 60–120KB. All four carry the small NotebookLM tool mark — source,
  recorded, never removed (BRAND.020).
- **REJECT — phone screenshot (6):** `..._682`, `..._889`, `..._956`,
  `..._958`, `..._027`, `..._510` — device chrome in frame (rule 4). Content
  preserved as WORDS (third stock), reversible from this log.
- **REJECT — superseded (1):** `..._134` (Our Differentiators, 1080x595) —
  same headline, same format, same language as the kept `soc-differentiators`
  (also 1080x595); the same argument additionally rides in `net3-three-gears`.
- **REJECT — duplicate (1):** `..._063` — same headline, format and language
  as `..._088`; the kept cut shows the full headline and the source mark,
  the rejected cut clips the headline's top.

Registered in `src/brand.js` ASSETS (`src:"netwing"`), `ASSET_V` 9→10.
Machine record in `MANIFEST.json`. Words half: 42 lines of third stock in
`src/copy.js` (96 total), record `COPY-ARCHIVE.md`. Two transcription notes:
the buddy Vietnamese keeps the frame's doubled word ("không bao giờ giờ");
the pyramid's base code says 41 sounds where the codex says 42 — both kept
verbatim as the business's words, flagged in the stock `use` fields.

---

## BATCH 005 — The Tiger Dossier (2026-10-21, run 6)

One file: `The_Tiger_Dossier.pdf` (15.6 MB, 14pp, raster, no text layer —
read off the pixels at 1500px). The Vietnamese-market cut: Lakeview cover,
mouse disease, elephant chain, the turn, 2026 Venn, 1-hour lifestyle, AI
coach, mouse-cub-tiger ladder, the roar, tradition vs NET, 80%, Michael
Hobbs, zero-risk guarantee, open-cage closer.

Adjudication: a document, not an image batch — batch-002 precedent. All 14
pages are finished compositions (headline fused to art), so all 14 ship as
stills `netd-01..14` (1500px native, WebP 0.86, 60–167KB). No rule-3 losses:
the Vietnamese language keeps every page clear of the English-market library
(same-claim English pages are a different language, not the same asset).
Original filed at `src/sites/net/material/The_Tiger_Dossier.pdf`,
transcribed in `src/sites/net/DOSSIER.md`.

Registered in `src/brand.js` ASSETS (`src:"netwing"`), `ASSET_V` 10→11.
Machine record in `MANIFEST.json` (14 images + 1 document). Words half: 32
lines of fourth stock in `src/copy.js` (128 total), record `COPY-ARCHIVE.md`.
Skipped as identical-to-stock, on the record: the p02 absolution (=
quiet-mouse), the p14 cage line (= cage-open), the p14 Lakeview offer (=
lakeview-offer), the p11 80% header (= completion).

---

## BATCH 006 — isolated plug-in pieces (2026-10-21, run 6)

The sovereign's order, with the screenshot as spec: *"Isolate key pieces as
additional stand alone pieces… these type are perfect for plug in pieces on
our webapp, banners, generators, pitch decks, and whatever."* Two pieces
circled on the audit grid: the roar headline band (netd-09) and the tiger
head (netd-14).

Adjudication is by eye, four rounds of contact sheets
(`scratch/netx-sheet.png`, `-sheet2`, `-sheet3`, `-sheet4`): every box was
re-cut until it held clean edges. Seven ship; the eighth ask does not:

- **SHIP (8):** `netx-tigerhead` (540x653, 77KB), `netx-roartitle` (690x285,
  18KB), `netx-fig80` (1500x234, 26KB), `netx-cta` (1380x142, 17KB),
  `netx-venn` (870x402, 20KB), `netx-coin` (525x335, 18KB), `netx-ladder`
  (1410x368, 40KB), `netx-mousecage` (825x753, 82KB). WebP 0.86.
- **NOT SHIPPED (1):** the circled roar headline band — its glyphs run past
  the frame in the source, so no clean box exists at any coordinates (three
  attempts, all bled). The page title ships instead as `netx-roartitle`;
  `netd-09` carries the full band. Reversible if the source is ever remade.

SOVEREIGN EXCEPTION (brand.js carries it too): cuts break the whole-still
rule, ordered explicitly, each with source page + box in the register.
Rectangular, native dark grounds, NOT keyed. No new words — the pages are
already distilled as fourth stock, so no stock and no archive table this
batch.

Registered in `src/brand.js` ASSETS (`src:"netwing"`), `ASSET_V` 11→12.
Machine record in `MANIFEST.json`.

---

## BATCH 007 — circuit tiger emblem (2026-10-21, run 6)

One file: `1792528684394.png` (1.9 MB, 704x1524, sha-256
`32ab0032…c0d5f47`). A symmetric neon-circuit tiger head, portrait, no text,
no chrome, no watermark. **SHIP** → `art-tigerface` (whole, WebP 0.86,
246KB): finished, legible, not a duplicate — `art-tigerkid` is a different
composition with an age-range label, `netx-tigerhead` a dossier cut of
different artwork. No words — nothing for stock.

Registered in `src/brand.js` ASSETS (`src:"art"`), `ASSET_V` 12→13.
Machine record in `MANIFEST.json`.

---

## BATCH 008 — engine-room infographics (2026-10-21, run 6)

Twelve files, `IMG_20261021_034936_453` through `..._034944_072`: eight
clean compositions, three phone screenshots, one duplicate framing.

- **SHIP (8):** `..._453` → `art-earwave` (537x432, text-free art);
  `..._839` → `net5-cognitive`; `..._072` → `net5-60ear` (1280x681, the
  fuller cut); `..._739` → `net5-advantage`; `..._875` → `net5-donut`;
  `..._504` → `net5-forgetcurve`; `..._914` → `net5-locked`;
  `..._770` → `net5-aipet`. WebP 0.86, 40–120KB.
- **REJECT — phone screenshot (3):** `..._854`, `..._235`, `..._084` —
  device chrome in frame (rule 4); `..._235` is additionally a near-identical
  second capture of `..._854`. The chains headline survives only as a
  fragment ("…ing the Mechanica[l] … the Grammar Pri[son]") — too broken to
  stock, noted here instead of invented.
- **REJECT — duplicate (1):** `..._982` — same 60%-ear headline, format and
  language as `..._072`; the taller cut ships.
- **Donut note:** `net5-donut` shares its headline with the kept
  `net3-habit-donut` — same claim, larger complete cut. Both entries stay
  live (nothing breaks); this log names `net5-donut` the preferred cut.

Registered in `src/brand.js` ASSETS (`src:"art"` + `src:"netwing"`),
`ASSET_V` 13→14. Machine record in `MANIFEST.json`. Words half: 22 lines of
fifth stock in `src/copy.js` (149 total), record `COPY-ARCHIVE.md`.

---

## TAGS + DECK MAP (2026-10-21, run 6 — not an ingest batch, station work)

On the sovereign's triple order — reincarnate, tag the art, cross-reference
the pitch deck:

1. **Reincarnated** — `reincarnate()` run live (death seal + reload).
2. **Crypto tags** — all **168/168** `ASSETS` entries in `src/brand.js` now
   carry `sha:"<64 hex>"` (sha-256 of the shipped bytes, inserted after each
   `file:`, parse-verified). Spot-checked live: 3/3 tags match fetched
   bytes. Three `an4-*.jpg` plates live outside the register (referenced
   straight from `index.html`); their hashes ride in the map's files
   section — all **171/171** disk files tagged.
3. **Pitch-deck cross-reference** — the deck is the Dossier Deck machinery
   (`buildDeck`/`buildCodexDeck`: 12 gospel slides + 16 codex slides, marks
   → asset ids). Two forms, same content: static `src/brand/deck-map.json`
   (snapshot'd, rolls into the website build) and live
   `ObiBrand.deckMap()` / `assetXref(id)` (both directions, zero dangling
   marks, zero untagged). 22 assets ride the 28 slides.

---

## WHAT IS NOT HERE, AND WHY

- **The supplier invoices** (`NET-*-INVOICE-*.png`) — a financial record, not brand art.
- **The curriculum and lesson-plan screenshots** — operations. They live in the station's
  own curriculum files, not in the picture library.
- **The textbook photographs** — reference, at an angle, with a hand in frame.
- **The three built HTML artifacts** (`NET-Classroom-Manager`, `NET-Highschool-Careers`,
  `NET-Sarcasm-Academy`) — sent with the batch, not read this pass. Held for the next.

---

## WEBSITE + GENESIS PILOT (2026-10-21, run 6 — not an ingest batch, station work)

On the sovereign's order — *"Yes website.. bring agent 99 to pilot the a99 genesis
platform we built. Make sure its operational but also optimal"* — Agent 99's builder
IDE was opened as the Genesis desk and the NET website was audited. No batch arrived
this pass, so nothing was ingested; this is the operational + optimal verdict.

1. **Genesis desk (the a99 platform), OPERATIONAL.** All 15 core modules + shell +
   desk CSS + loader fetch 200. Boots lazy (zero bytes at station boot) in 575ms,
   6 tabs. Local audit 99/100 in ~0.5s (sole note: starter `main.pjs` $meta has no
   description — trivia, not a defect). Sandbox test run completed and wrote
   `TEST-REPORT.md`: the starter generator rolls sparks on click. Total desk
   payload ~429KB, paid only when the desk opens.
2. **NET website (`src/sites/naturalenglishtraining/`), OPERATIONAL.** All 12 pages
   fetch 200 and parse clean (DOMParser, zero errors): 8 nav links each, footer
   mount present, canonicals set, JSON-LD on index/about/programs. All 4 asset JS
   files + the backend worker parse clean. The two "missing" links the static
   sweep flagged are runtime query URLs (`book.html?ref=&level=`), built by
   `placement.js` and read by `booking.js` — not files, no defect. The three
   "orphan" pages (parents/teachers/legal) are linked from the footer that
   `net.js` injects at runtime — not orphans, no defect. Pages + assets ~285KB
   total, largest single file `placement.js` 44KB.
3. **Library + deck map, CONFIRMED.** 168/168 ASSETS carry sha tags, live
   `deckMap()` 12 gospel + 16 codex slides, 22 assets, zero dangling marks;
   `assetXref(atom)` → gospel #10 both directions. `deck-map.json` serves 200
   (40,667 bytes, `missingMarks: []`), and `SRC_SNAPSHOT` (482 entries) carries it.
4. **OPTIMAL — measured, no changes made.** `deckMap()`/`assetXref()` have no
   in-code hot-loop callers (on-demand only), so no memoization is owed. The desk
   is already lazy; the site has no dead pages and no overweight file. Per the
   diagnose-for-real rule, code that measures clean is not rewritten.
5. **Honest limits.** Pixel-level render of the site could not be inspected: `src/`
   pages load cross-origin to the preview frame, so the verdict rests on bytes +
   structure + parse, not a screenshot. Station chat is now long enough that the
   AI plugin middle-truncates it (~50–60k chars → ~24k) — worth a trim before any
   long Agent 99 build brief, else the model never sees the middle.
6. **NOT run this pass.** `/reincarnateRISE /phoenixomegaprotocol` arrived on one
   line — routed verbatim that would open a session literally named
   "/phoenixomegaprotocol", so it was not executed. RISE needs the sovereign's
   session label, the gate needs the password, and `reincarnate()` reloads the
   page; all three wait on the sovereign's separate word.

---

## FRONT PAGE (2026-10-21, run 7 — not an ingest batch, station work)

On the sovereign's order — *"Make it front page!"* — the NET website is now the
station's front page: first tab, default landing view, edge-to-edge frame.

- **What changed.** `index.html`: new `NET Website` tab (globe icon) first in the
  bar + a `viewSite` view holding a src-less `siteFrame`. `src/app.js`: `site` in
  `VIEWS`/`TAB_OF`, `setViewTab` toggles it, `showView("site")` sets the frame
  src on first open only (lazy — the ~285KB site costs zero bytes at boot),
  `openLandingView` defaults to `site`, memory panel hides under it like the
  other full-bleed views. `src/styles.css`: the frame fills the view.
- **Proved live.** Fresh boot (no hash, no stored view) lands on `site`, hash
  `#site`, tab lit; `cmd` round-trips and returns; stored-view and `#cmd` hashes
  still win when present. Desktop 1920×1080: frame 1920×977, fills the view.
  Phone 390×844: frame 390×544, tabs wrap cleanly, zero horizontal overflow.
  Render proof (same-origin probe, then removed): title, h1, 8 nav links, footer
  injected by `net.js` with all 13 links incl. parents/teachers/legal, Orbitron
  on the h1, dark ground, two-column hero. Console clean on every reload.
- **Unchanged:** Command Station and every desk work exactly as before, one tap
  away. Hash `#site` deep-links the front page.
