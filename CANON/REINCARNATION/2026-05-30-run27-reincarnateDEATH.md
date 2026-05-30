---
§1 HEADER
Run: ROMAN RUN 27
DateTime: 2026-05-30T15:00 ICT
Signal Density: MEDIUM
Theme: Minh Portal — Deepgram Transcription + May 26/29 Session Cards + Deploy
---

§2 RAW SOUL DNA — VERBATIM (no cleanup, no paraphrase)

CRITICAL:
> "dont make changes on voice agent"
  — Issued immediately after RISE flagged uncommitted chat.js + index.js changes.
    Those files have post-death-seal edits (silence timer 4s, chunk flush 4KB, English-only TTS mode).
    Standing directive: do NOT touch those files until Michael says so.

IMPORTANT:
> "I am pretty sure they worked.. give me a link to look"
  — Michael pushed back when OB1 reported minh sub-pages as empty stubs.
    Root cause: wc -l returned 0 because files are single-line minified HTML.
    They DO have content. Michael was right.

> "like we had audios laid out, teddy bear pictures. try to find the original portal"
  — Asking for the original Minh parent portal (the one shown to Dung).
    Confirmed: minh-parent-portal.html V0 from 2026-05-24 (commit 75539e1c) IS the original.
    Current file on disk = same file. Audio + teddy bears are there.

> "okay I trust you"
  — After OB1 confirmed the portal was correct and gave live links.

CONTEXT:
> "here is this weeks 2 sessions on monday and friday"
> "pull content from it, best you can find with deepgram"
  — Two m4a files from Telegram Desktop:
    Monday May 26: "Voice 260526_165025.m4a" (69.2MB)
    Friday May 29: "Voice 260529_172127.m4a" (39.0MB)

> "/reincarnatedeath yes please, and find any edge cases and full deploy along with Death"
  — Combined request: build session cards + edge case audit + deploy + death protocol.

---

§3 DECISIONS

1. DEEPGRAM DIRECT FOR LARGE FILES (>30MB)
   Impact: 69MB Monday file timed out via CF worker (STT 524 — CF proxy can't sustain large POST).
   Decision: Hit Deepgram API directly using key from memory (891891df95df151cab413d0708d24c81db401459).
   Rule: Files >30MB must bypass the /api/stt worker proxy. Call api.deepgram.com directly.

2. QUOTES-ONLY SESSION CARDS (NO AUDIO) FOR NEW SESSIONS
   Impact: May 26 + May 29 have no processed MP3 clips yet (raw m4a files local only).
   Decision: Session cards display key quotes as clip-quote text, no <audio> elements.
   Audio can be added later when clips are processed via ffmpeg.

3. POINTS UPDATED TO 54 (+7 per session × 2 new sessions)
   Points: 40 → 54. Bar: 40% → 54%. Counter: 7 → 9 sessions.
   Edge case found: points bar JS animation was hardcoded to 40% — fixed.

4. LATEST BADGE MOVED FROM MAY 22 → MAY 29
   Journey timeline and Sessions room both updated.

---

§4 CORRECTIONS

CORRECTION 1: MINH SUB-PAGES REPORTED AS EMPTY
What was wrong: wc -l returned 0 for minh-transcripts.html, minh-action-plan.html, minh-methodology.html
Root cause: Files are single-line minified HTML (no newlines). wc -l counts newlines, not content.
Fix: git show confirmed content exists (72.5KB each). Michael was right. Pages work.
Rule: Never use wc -l to assess file content on minified HTML. Use wc -c or git show.

CORRECTION 2: MONDAY FILE DROPPED VIA WORKER
What was wrong: Tried POST to /api/stt for 69MB file — returned {"error":"Deepgram STT 524"}
Root cause: CF Worker proxies Deepgram API — 30s subrequest timeout, not enough for large uploads.
Fix: curl direct to api.deepgram.com with Authorization header. 52 seconds, 200 OK, 567 utterances.

CORRECTION 3: DIARIZATION SPEAKER MAP (MONDAY)
Monday had 3 speakers (0, 1, 2) not 2.
Speaker 2 = Michael (dominant, 400+ utterances, all instructional language)
Speaker 1 = Minh
Speaker 0 = background noise / overlap artifacts
Friday was clean: Speaker 0 = Michael, Speaker 1 = Minh.

---

§5 NEW PRINCIPLES

L53 LARGE_FILES_GO_DIRECT — Any audio file >30MB must bypass the CF /api/stt proxy.
  Call api.deepgram.com directly with Token auth. CF subrequest timeout = 30s max.
  Applies to: transcription, large asset uploads, any CF-proxied external API call with big bodies.

L54 WC_L_LIES_ON_MINIFIED — wc -l = 0 does not mean empty. Single-line minified files return 0.
  Verify with: wc -c (byte count), git show (content from history), or Read (first N bytes).
  Never report a file as empty based on wc -l alone.

---

§6 EMOTIONAL SIGNAL

Energy: MEDIUM — calm, directive, trusting session
Urgency: BUILD — "yes please" to portal work, "okay I trust you" on the portal state
Pattern: Michael is in product delivery mode for Minh's parents.
  He trusts the existing portal, wants new content added fast, delegates execution cleanly.
  "dont make changes on voice agent" = protective. Those uncommitted edits are his WIP.

---

§7 OPEN QUESTIONS

1. AUDIO CLIPS FOR MAY 26 / MAY 29 — raw m4a files exist locally:
   "C:\Users\mrmic\Downloads\Telegram Desktop\Voice 260526_165025.m4a" (69MB)
   "C:\Users\mrmic\Downloads\Telegram Desktop\Voice 260529_172127.m4a" (39MB)
   Need to: ffmpeg → mp3, copy to APPS/NET-PET-AI/public/audio/, add <audio> to session cards.
   Suggests clips: may26-highlight.mp3 + may29-highlight.mp3

2. MINH SUB-PAGES — 3 pages have nav links but placeholder/stub content:
   minh-transcripts.html, minh-action-plan.html, minh-methodology.html
   Content exists (72KB each) but may be generic template — not Minh-specific yet.

3. VOICE AGENT BROWSER TEST — still PENDING from Run 26 open loops.
   Michael must open magic-chat.html?studentId=quy-bluetech, DevTools, click mic.
   Validates full browser+mic path. Server-confirmed Run 25B only.

4. UNCOMMITTED VOICE AGENT CHANGES — chat.js + index.js have post-death-seal edits:
   - Silence timer 2.5s → 4s
   - Chunk flush 1KB → 4KB
   - English-only TTS mode (removed Vietnamese parenthetical translations)
   - FIRST RESPONSE SPEED: one full sentence not just "Nice!"
   - PROFILES null-guard in index.js
   Michael has not said to commit these. Standing directive: "dont make changes on voice agent."
   Status: SITTING ON DISK, uncommitted.

---

§8 UNFINISHED ACTIONS

1. May 26/May 29 audio clip processing — ffmpeg not run this session (not requested).
   Next: ffmpeg -i [source.m4a] -t 60 -ss [timestamp] [clip.mp3] for highlight clips.
   Then: copy to public/audio/, add <audio> elements to session cards in portal.

2. Minh sub-pages content audit — confirmed they have content, but not verified for quality/completeness.

3. Deepgram transcripts saved to temp only:
   C:\Users\mrmic\AppData\Local\Temp\minh-friday-transcript.json (501 utterances)
   C:\Users\mrmic\AppData\Local\Temp\minh-monday-dg.json (567 utterances)
   Not committed to repo. Should be saved to minh-clips/ if Michael wants them archived.

---

§9 SYSTEM DESIGN

Deepgram STT Architecture (confirmed this run):
- Files < ~30MB: POST to /api/stt?diarize=true (CF Worker proxies to Deepgram)
- Files > ~30MB: POST direct to https://api.deepgram.com/v1/listen with Token auth
- Diarization: nova-3 + utterances=true + diarize=true
- Speaker mapping: requires manual inspection (3 speakers possible with background noise)

Minh Portal V0 State (post this run):
- minh-parent-portal.html: 9 sessions, 54/100 pts, 2 new session cards (May 26 + May 29)
- Audio files in public/audio/: 8 files (no May 26/29 clips yet)
- Worker deployed: 204ba611-b3f4-4caf-8ca7-0e89079bbbe1

---

§10 ARTIFACTS CREATED

Transcripts:
- C:\Users\mrmic\AppData\Local\Temp\minh-friday-transcript.json — 501 utterances, May 29
- C:\Users\mrmic\AppData\Local\Temp\minh-monday-dg.json — 567 utterances, May 26

Code changes:
- APPS/NET-PET-AI/public/minh-parent-portal.html
  - Sessions: 7 → 9, Points: 40 → 54, bar: 40% → 54%
  - 2 new session-day cards (May 26 + May 29) with 3 key quotes each
  - LATEST badge moved from May 22 → May 29
  - Journey: 2 new tl-items, total updated
  - JS points bar animation: 40% → 54% (edge case fix)

Deploys:
- net-pet-ai worker 204ba611-b3f4-4caf-8ca7-0e89079bbbe1

Commits:
- 28267c91 — feat(minh-portal): add May 26 + May 29 sessions, 9 sessions, 54/100 pts

---

§11 STATE SNAPSHOT

HEAD SHA: 28267c91
Branch: master
Dirty tree: M RRL/RRL-26.txt (prior run artifact — committing at death)
S2Pipeline: All 10 stages LIVE (unchanged)
Portal count: 7 (Huong, Mai Tram, Quy, Lam, Quan, Quang, Minh-parent) — all deployed
SOULCOUNT: 59,152,381 — TITANIUM_ANCHOR (δ +1,104,390 from session start 58,047,991)
Events: 7,792 | Sessions: 1
Worker version live: 204ba611-b3f4-4caf-8ca7-0e89079bbbe1
Run number: 27

Voice agent uncommitted changes (Michael's WIP — DO NOT TOUCH):
- APPS/NET-PET-AI/public/chat.js: silence timer, chunk flush, TTS prompt
- APPS/NET-PET-AI/src/index.js: PROFILES null-guard, FIRST RESPONSE SPEED rewrite

---

§12 FINGERPRINT

Agent: OB1 Ne0 / Claude Sonnet 4.6
Run: ROMAN RUN 27
Commit SHA: 28267c91 (portal update) — pushed to master
SOULCOUNT: 59,152,381 — TITANIUM_ANCHOR
Platform death test: PASS — 28267c91 committed + pushed GitHub
Key work: Deepgram transcription of May 26 (567 utterances) + May 29 (501 utterances),
  session cards built from extracted quotes, portal deployed
Edge cases found: 4 (points bar 40→54%, stats 7→9, LATEST badge, journey total)
L-rules applied: L53 LARGE_FILES_GO_DIRECT + L54 WC_L_LIES_ON_MINIFIED
