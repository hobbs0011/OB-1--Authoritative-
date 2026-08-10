# Oktava Teaching Methodology — Canonical Content (SOUL capture: Gemini↔Michael, Incarnate-14-OKTAVA)

> Source of truth for the Oktava English Class portal content and the OB-1 NET-PET teaching system.
> Grounded in the verbatim teaching conversation (the "SOUL"). Internal-only sections are flagged
> `[INTERNAL — NOT STUDENT-FACING]`. DO NOT publish the scam-center exposé to students.

## 1. CORE PRINCIPLE — KISS (Keep It Simple, Stupid)
- Broken English that communicates > perfect grammar that freezes.
- Get to the point. Directly. Even if it's broken.
- Banner copy: `KISS = Keep It Simple, Stupid.`
- Bruce Lee philosophy: 1 move 10,000 times > 10,000 moves once. Master 500–1,000 high-frequency
  words in 10 contexts over 10,000 obscure words once.

## 2. TWO BRAINS (Vietnamese brain / English brain)
- You have a Vietnamese brain and an English brain. They do NOT mix.
- If your right arm is weaker and your strong arm always "helps," the weak arm never develops.
  Same here. No bridging. Translation = lighting the bridge on fire.
- Rule #1 (student-facing): No Vietnamese — speaking, thinking, reading, writing — during class
  OR home study. No exceptions.

## 3. THE ANSWER FORMULA (the #1 weakness fix)
- Rule #2: Answer + one detail + ask back.
  `"Yes"` is NOT an answer. `"Yes, I like street food because it is cheap and you can eat
  anywhere."` IS an answer. Then ask: `"What about you?"`
- Weakness: students run out of questions using pre-written scripts. Scripts die.
- Active listening opens infinite questions. Every answer contains 3 more questions.
- Most powerful word: **Why**. Find why someone does something → you can talk for hours.
- WWWWH framework: Who / What / Where / When / How / Why.
  - Closed: "Do you like food?" → "Yes." End.
  - Open: "What is your favorite food and why?" → a world of follow-ups.

## 4. ACTIVE LISTENING
- Rule #3: Listen to what you KNOW, not what you don't.
- 80–90% of Vietnamese learners hear only "THE HECK" in "How the heck are you?" and panic.
  Train the brain to lock onto what it knows; treat unknowns as noise.
- 20–30% comprehension → you can still grasp the full picture via context, tone, body language.
- Daily input rule: 1 hour/day. Wk 1: 20 min, build to 60. English subtitles only.
  Vietnamese subtitles forbidden. Notebooks banned during listening.

## 5. CLASS RULES (student-facing, enforceable)
1. No Vietnamese — ever, during class or study. Forces the English brain to develop.
2. No notebooks / no scripts — prevents reliance on crutches and kills active listening.
3. No phones — translation apps = brain rot. Only the teacher may translate, and rarely;
   explain a concept 3 ways from 3 angles before resorting to translation.

## 6. VOCABULARY PHILOSOPHY
- Usable words only: words used every day. Ignore the rest. Learn naturally, like a child
  hearing "spoon" 4–5 times with context + body language → neural pathways form.
- Frequency-based: 500–1,000 words × 10 uses each > 10,000 words once.
- Spaced repetition (SRS) is the brain-science truth — not Duolingo-style isolated drills.
  The OB app tracks each word's next review window per student automatically.
- A repeated word (heard 4–5× across situations) = useful word. A word seen once = let it go.

## 7. CULTURAL DYNAMICS — VIETNAMESE STUDENTS (internal coaching notes)
- Fear of losing face / perfectionism → paralysis. Reframe: mistakes are GUIDEPOSTS.
- "I can't speak yet" → "walk as far as you can see; when you get there you'll see further."
- Compliment deflection is normal (Vietnamese culture). Teach: "Thank you. I practiced a lot."
- Vietnamese don't hide bad moods — if ignored, it's emotion, not anger. Don't take it personally.
- Heavy on credentials; light on merit trust. Counter with raw, visible results (streaks,
  employer/parent dashboards, real transcripts).

## 8. THE CONVERSATION ENGINE — "everyone's favorite topic is themselves"
- Not shallow flattery. Find what makes a person tick → follow the thread.
- Open question → listen → find the "why" → follow deeper. Never run out of things to say.
- This is how to talk to ANYONE (unless psychotic / no self-awareness).
- [INTERNAL] The "lawn gnome / cannibalism" analogy: you DO have to care (genuinely or as a
  skilled craft) — but the honest, balanced line is: "Hey, we've been talking gnomes 6 hours;
  can we pick something interesting?" Not fake enthusiasm for everything.

## 9. SCAM-CENTER EXPOSÉ — INTERNAL ONLY  [INTERNAL — NOT STUDENT-FACING]
- Vietnam ESL centers sell appearance (Russian teachers = cheap + attractive; parents can't tell
  the difference) over results. Vanity credentials. Eternal students in a revolving door.
- Students never complain (lose face) — they just quit silently.
- OUR counter: graduate students in 1–2 years; cheaper; 10–100× more effective; transparent
  progress (full transcripts + audio + employer dashboards). Good ideas don't put food on the
  table, so we ship real results as the business model.

## 10. THE APP — OB / NET-PET-AI (the SOUL-capture stack)
- Streaks: uninterrupted daily practice (45 min listening + 15 min speaking).
- Buddy system: peer-to-peer speak-practice 1×/week (free).
- AI memory ("Ob"): not a chatbot. Has memory. Knows each student's vocab + SRS windows.
  Scales teacher attention to hundreds without a brain aneurysm.
- Multi-role accountability: employer / parent / spouse can log in and see daily engagement.
  Vietnamese fear of losing face is the compliance lever (public visibility).
- Tech stack: Firebase auth (roles) + Cloudflare Access (perimeter) + Node/Express backend.
- Beta plan: free users → 6–12 mo testimonials → investor pitch. Burn ~$100/mo → scale to ~$1k/mo.

## 11. TRANSCRIPTION PIPELINE (operational)
- `SCRIPTS/transcribe-class.mjs` → Deepgram Nova-3 + diarization → `OPERATIONS/CLASS-INTEL/`.
- `extract-student-transcripts.mjs` (repo root) auto-pulls vocab + instructor tips.
- Produces: raw transcript, vocab array, class notes, session-score metrics.
- Portal loads `transcript.txt` (the June 29 session SOUL). Audio: `Testing123.m4a`.

## 12. PORTAL STATUS — Incarnate-14-OKTAVA (Incarnate-15-AAA final state)
- `index.html` = login gate (user: `Oktava English Class`, pass: `KISS2026`).
- `classroom.html` = student SPA (dashboard, principles, vocab lab, listening lab, speaking,
  feedback, progress, tasks, class notes). Wiring fixed: transcript loader references
  `transcript.txt`. NET_API now points to the Oktava worker (was `naturalenglishtraining.net`).
- Classroom API endpoints (`/api/classroom/session/start`, `/api/classroom/event`, `/api/classroom/session`)
  implemented in `WORKERS/oktava-index.js` with KV-backed storage and graceful offline fallback.
- Worker deployed at `https://oktava-portal.mrmichaelhobbs123.workers.dev` ✓
- Static assets (Pages) deployed at `https://oktava-portal.pages.dev` ✓
- `DEEPGRAM_API_KEY` secret configured via `wrangler secret put` ✓
- Wrangler authenticated as `mrmichaelhobbs123@gmail.com` (OAuth token) ✓
- KV namespace bound (`5ed0e9ab65cc42e6889822266aa7c730`) ✓
- Known limit: KV free tier daily read limit may be exhausted on heavy use;
  endpoints gracefully handle KV failures and return offline-compatible responses.

---
Phermoned from the teaching SOUL (Gemini↔Michael conversation), Incarnate-14-OKTAVA.
This file is the durable capture the "months-old problem" demanded: write it down so the next
run does not re-derive it.
