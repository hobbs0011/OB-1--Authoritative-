# Timmy Nguyễn Portal

Single-file static portal for Michael's client: **Timmy** (class 5P1) and his mom **Trâm Nguyễn**.
A clone/adaptation of the Nguyen Family Portal (the Quang/Quan site) built for this family.

## Deliverable
- `index.html` — the ENTIRE portal in one self-contained HTML file (no external deps, no build step).
  Open it directly in a browser, or host it anywhere static. Works fully offline.
- Pages/views (SPA, switched via JS): Login, Parent Dashboard, Timmy's World, Gameplan, Study Request form.
- Theme: dark wood + gold glassmorphism (matches the original Nguyen portal).
- Storage: `localStorage` keys `timmy_session`, `timmy_daily`, `timmy_requests`.

## Views
| View | Path (hash) | Notes |
|---|---|---|
| Login | #login | role tabs Parents / Timmy |
| Parent dashboard | #parent | progress bars, daily log, homestudy monitor, study requests, audio library |
| Timmy's world | #timmy | paw-point rewards, homework checklist, +10/+15/+20 min buttons, games |
| Gameplan | #gameplan | 4-week plan (confidence -> Global Stage 5 -> Science Reader -> Review) |

## Login PINs (DEFAULT — MUST BE CHANGED BEFORE SHARING)
- Parent: `PIN_PARENT = "5820"`
- Timmy: `PIN_TIMMY = "3820"`
Edit the two constants at the top of the <script> in index.html. (Plain PINs in a static page are
not real security — this is a "something private" barrier for a child, not a security boundary.)

## To do before giving the link to Trâm
1. Change the PINs.
2. Replace the placeholder `AUDIO_LIBRARY` entries with real audio: put your own MP3 files (or
   recordings) somewhere public (e.g. upload them) and set each entry's `src` to the real URL,
   plus title/words. Audio plays via <audio controls>.
3. Optionally swap the flat ANIMALS list / word pairs for the actual vocabulary from
   Macmillan Global Stage 5 Unit 1 and Oxford "Young Animals" Level 1.

## Client facts baked in (from Zalo screenshots)
- Parent: Trâm Nguyễn (Timmy's mom); Teacher: Michael (English teacher).
- Timmy: smart, socially shy; focus = confidence + social interaction.
- Schedule: Saturdays 10am in person (coffee shop); homework 20-30 min/day; possibly 2x/week.
- Books: Macmillan Global Stage Language/Workbook 5 (digital, "Timmy - 5P1") + Oxford
  Read and Discover "Young Animals" Level 1.
- Michael promised mom: password-protected site, daily progress, audio listening, study
  requests, homestudy monitoring, fun games/home lessons.

## Games in Timmy's world
- Animal Flashcards: 12 animals, card flip, speechSynthesis text-to-speech (English + Vietnamese gloss).
- Word Match: memory match between English word and Vietnamese gloss.
Data lives in the ANIMALS array at the top of the script — easy to extend.

## Notes
- This is a purely static page; the original Nguyen portal ran on a Cloudflare worker for its
  PIN API. Here the PIN check is client-side JS. For real auth, the same worker approach
  (POST /api/parent/checkpin) could be adapted later.
