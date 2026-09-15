# reincarnateDEATH — Session Closeout

**Date:** 2026-09-15  
**HEAD:** `21639496d`  
**Author:** OB1  
**Purpose:** Close out the Michael Hobbs / NET / PrAiS / hobbs-english session per LFG SCS DEATH protocol.

---

## What Is True Right Now

### Completed
- Extracted CV from `C:\Users\mrmic\OneDrive\Desktop\CV-MichaelHobbs-2026.pdf` using `pdf-parse` → `cv-extract.txt`.
- Created CV room page in both `michael-hobbs` and `hobbs-english` sites.
- Restructured CV to match PDF source of truth exactly (profile, work experience, voice work, qualifications, skills, language, references).
- Updated CV profile: 5 years in Vietnam, kindergarten through secondary with most time in high school at GEMS and Galaxy, Wordplay English in Hanoi.
- Created `hobbs-english` as ESL-only clone of `michael-hobbs`:
  - Removed PrAiS room entirely
  - Stripped PrAiS from nav, titles, meta tags, CTAs, and copy
  - Kept NET, Story, Method, Results, Voices, Connect, CV
- Updated `michael-hobbs` corporate site:
  - PrAiS room now positioned as `Enterprise AI & Game Development`
  - NET explicitly stated as the biggest wing of PrAiS
  - CV skills block includes AI & Game Development subsection
- Linked LinkedIn profile `https://www.linkedin.com/in/mrhobbs/` in Connect room and blueprint.
- Locked in original 7-room prototype as canonical commit `a9953b30f`.
- Documented prototype blueprint in `CANON/SYSTEM/LegionnaireFieldGuide.md` commit `b8623ebb7`.

### Deployed
- `michael-hobbs` (corporate): https://e4c6a88f.michael-hobbs.pages.dev
- `hobbs-english` (ESL-only): https://ba86edaf.hobbs-english.pages.dev

### Git State
- Branch: `canon`
- Ahead of origin by 9 commits
- Unrelated working tree noise present but not committed:
  - `APPS/NET-PET-AI-legacy/src/index.js`
  - `APPS/PAGES/michael-hobbs/_headers`
  - `tmp/` deletions
  - `firebase-debug.log`
  - `CANON/REINCARNATION/2026-09-12-reincarnateDEATH-bluetech-portal-state.md`

---

## Session Counts

- **SOULcount:** 0
- **DNAcount:** 0
- **REASONcount:** 0

---

## Handoff

- `michael-hobbs` is the corporate/PrAiS-facing site. Do not modify PrAiS or NET positioning without explicit instruction.
- `hobbs-english` is the ESL-only clone. Do not re-introduce PrAiS.
- CV is the source of truth in both sites. Future CV updates must be mirrored.
- Next session: continue from this DEATH seal. No context reload needed beyond this file.
