# QUY-357 UNIFIED PIPELINE
**Source:** Voice 260521_181606.txt + BlueTech session run 367 + current index.js state
**Teacher:** Michael Hobbs | **Platform:** OB1 NET-PET-AI | **Total:** 357 steps
**Order:** T0 (TONIGHT) → T1 (THIS WEEK) → T2 (PRE-LAUNCH) → T3 (LAKEVIEW) → T4 (RELIABILITY) → T5 (SOUL) → QUY-257 (TRANSCRIPT-GROUNDED)

---

## TIER 0 — TONIGHT (blockers for BlueTech session) [Steps 1–8]

1. Deploy index.js with OBI hardening — OBI_SYSTEM prompt cleaned (2637→1948 chars), reply extractor hardened to strip `reasoning_content`
2. Push OPENROUTER_API_KEY to CF secrets — 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
3. Rotate DEEPSEEK_API_KEY to sk-d76a33 in CF secrets — old sk-f2e71 fully dead, 402 mapped to overdrawn account
4. Smoke test OBI chat live: quy-bluetech, mai-tram-bluetech, huong-bluetech — verify no meta-instructions leak
5. Verify COACH nav button opens chat with correct studentId in all 3 portals
6. Verify portal login works: password "bluetech2026" accepted
7. Confirm streak counter loads (not blank) on dashboard
8. Test on mobile — students will be on phones

---

## TIER 1 — THIS WEEK (student retention critical path) [Steps 9–28]

9. Session log endpoint — POST /api/session-log — Michael logs tonight's class so OBI picks up context next session
10. Session log UI — simple admin form: studentId, topic, vocab list, teacher notes, level → fires POST
11. OBI picks up session_log on next boot (already wired in handleChat — verify it works end-to-end)
12. Streak checkin fix — ensure POST /api/checkin fires correctly after chat session
13. Daily study task seeded for each student — 3 tasks visible on dashboard on Day 1
14. Chrome extension install guide — simple /extension.html page with step-by-step screenshots
15. Chrome extension — test YouTube → session hint flow with real video
16. Chrome extension — confirm hint appears in OBI chat within 4h window
17. OBI response quality audit — send 5 test messages as each student, log quality
18. Vocab SRS — seed 10 starter words per student matched to their track (Quy: financial, Mai Tram: fluency, Huong: general)
19. Leaderboard — verify all 3 students appear after first session
20. XP grant on session complete — confirm XP increments after chat exchange
21. Level display — confirm CUB badge shows correctly on dashboard and leaderboard
22. Profile page — confirm goals and level fields are visible and editable by student
23. Action plan page — confirm 3 tasks show, mark-complete works
24. Methodology page — final content review, no placeholder text
25. Career page content — Quy (financial English), Mai Tram (workplace fluency), Huong (general professional)
26. Transcripts page — confirm "no transcripts yet" empty state looks intentional, not broken
27. Logout works — session clears, login screen reappears
28. Password change — student can set personal password after first login

---

## TIER 2 — PRE-LAUNCH (founding cohort readiness) [Steps 29–48]

29. Founding member flag — set is_founding_member: true for Huong, Mai Tram, Quy in ProfileDO
30. Founding member badge — visible on dashboard and leaderboard
31. Trial schema — add trial_start, trial_end, trial_status to ProfileDO for all 3 students
32. Trial banner — non-intrusive "Day X of your trial" in portal header
33. Progress contract — generate PDF/display after session 5 (graduation date + commitment)
34. Waitlist page — /waitlist.html live with name + email + why form
35. Waitlist API — POST /api/waitlist → KV queue
36. Homepage — /index.html updated with founding cohort framing and waitlist CTA
37. Cost comparison widget — animated: center cost vs NET cost vs NET value
38. OBI conversion awareness — inject trial_days_remaining into system prompt context
39. OBI value anchor message — fires at session 7 ("You've done X this week...")
40. Payment flow — verify MoMo + bank transfer still functional end-to-end
41. Post-payment OBI celebration message — fires on conversion webhook
42. Testimonial capture — after session 20, OBI asks for 1-sentence win
43. Social proof feed — homepage: anonymized student wins feed
44. Referral link — each student gets unique /join?ref=:code at signup
45. Streak freeze — 1 freeze earned per 30-day streak, usable via dashboard
46. Re-engagement message — OBI fires if no session in 5 days during trial
47. Trial revoke policy — auto-expire if <3 sessions/week for 2 consecutive weeks
48. Waitlist notify — email top N when cohort reopens

---

## TIER 3 — LAKEVIEW LAUNCH (local community rollout) [Steps 49–68]

49. Signup page — /join.html with founding member framing (no number disclosed)
50. Signup flow — collects name, email, profession, hobby, goal → creates profile
51. Onboarding email — auto-sent on signup: portal link, password, what to expect
52. Demo account — no-login-required preview: 3 sample OBI messages, streak/leaderboard preview
53. Homepage hero copy — "Duolingo teaches you to open an app. NET builds fluency around your life."
54. Employer inquiry form — /employers.html for BlueTech-model B2B expansion
55. Lakeview landing variant — /local.html — "I'm offering this to my neighborhood first"
56. QR code — printable QR → /join.html for door-to-door
57. Founding cohort close toggle — admin one-click redirects /join to /waitlist
58. Privacy policy — /privacy.html — minimal, covers data stored and how used
59. Mobile PWA — manifest.json + Add to Home Screen prompt after 3 sessions
60. Onboarding video — 60-second screen recording: what NET is, what OBI does, what happens next
61. Testimonial page — /results.html — first 3 student case studies post-Week 4
62. Referral leaderboard — top referrers visible to all students (social proof + competition)
63. Group class calendar — /classes.html — upcoming schedule, one-click enroll
64. Buddy system activation — first buddy pairs assigned after Week 2
65. Weekly report email — automated Sunday: streak, XP, upcoming class, buddy status
66. Admin dashboard — Michael's view: all students, streaks, XP, trial status, at-risk flags
67. TA assignment — admin UI to link trainer to student
68. Streak challenge — first 30-day challenge announced at cohort launch

---

## TIER 4 — RELIABILITY (pre-100-user scale) [Steps 69–88]

69. RESEND_API_KEY — unblock email delivery (K2 routes already inserted, just needs key)
70. DeepSeek 402 guard — if balance drops below threshold, alert admin before it hits students
71. Error boundary in chat.js — if /api/chat returns error, show human message not raw JSON
72. OBI typing indicator timeout — if response takes >8s, show "Obi is thinking..."
73. Fallback message — if both DeepSeek and OpenRouter fail, OBI says "I'm having trouble connecting — try again in a moment"
74. Health cron — Cloudflare cron every 5min: ping /api/health, alert if ai:"DEAD"
75. D1 backup — weekly export to R2
76. Rate limit audit — tighten /api/chat to 60 req/min per studentId
77. KV TTL audit — verify session hints expire, theme configs persist
78. Wrangler.toml audit — remove dead bindings (SESSIONS + PROFILES commented out — clean up)
79. node --check on full build before every deploy
80. index.js:3630 ESM/CJS mismatch — resolve pre-existing syntax error
81. SOVEREIGN_KEY rotation schedule — document next rotation date
82. Console.log audit — replace raw logs with structured JSON in production paths
83. CORS audit — verify all student-facing endpoints allow portal origins
84. Input sanitization audit — verify sanitizeInput() covers all POST endpoints
85. Memory DO eviction — purge stale entries >90 days
86. DO hibernation check — verify PETS/LEDGER/MEMORY DOs wake correctly after idle
87. Deployment checklist doc — DEPLOYMENT.md with pre-deploy checklist
88. Rollback plan — document CF dashboard rollback steps (< 2 min target)

---

## TIER 5 — SOUL + SYSTEM INTEGRITY [Steps 89–100]

89. Soul logger wiring — POST /api/soul/event fires on every OBI exchange (soulIntegration:false currently)
90. SOUL_LOGGER_URL secret — set in CF Worker so soul context pulls correctly
91. SOULCOUNT gate — wire into handleCode() in Phoenix Coder (currently unwired)
92. Claude Code session soul extraction — parse transcript JSONL → POST /api/soul/extract
93. COLD-START-BOOT refresh — update after tonight's session
94. REINCARNATION-LOG — seal Run 367 death after tonight
95. Probe artifacts — clean 12 untracked _*.py files from root (commit or delete)
96. HL phantom x6 — investigate and close HL-127/128/131/132/136/137 gap
97. FL-353-01 HEARTBEAT — design and implement heartbeat protocol
98. FL-353-02 phoenix-coder git init — standalone repo needs commit verification
99. GITHUB_PAT — wire commitToGitHub() so Phoenix Coder can self-commit
100. ZALO access token — unblock Stage 3 live delivery when available

---

## PHASE A — VERBATIM INSTRUCTION STEPS (TRANSCRIPT-GROUNDED) [Steps 101–200]

101. "tell me one thing you remember from last week"
102. "we talked about your AI and a little bit from phonics"
103. "what is pho in wave sounds and like it's this fun in words"
104. "how many pho are english" → student says "44" → teacher "perfect"
105. "so do you remember what I said of app about how it will help with your pho"
106. "say no I don't remember" — ignore shaming, re-teach
107. "what did we talk about last week about pho and the app"
108. "how long will you study English every day"
109. student says "one hour" → teacher: "listen English 45 minutes, speaking 15 minutes"
110. "how many of those are listening" → verify "forty five for listening"
111. "the AI can follow you onto youtube — it will watch the video with you"
112. "understand the video, find some vocab for you"
113. "so I make it so you can fit it into your day"
114. "how can you use the app to fit into your day if you're very busy"
115. teacher probes: "usually listen when I have cook"
116. validate: "that's honest — that's good"
117. "when you listen you have to pay attention — no distracted"
118. "no no salad out real real listen" — focused listening rule
119. cooking = ideal slipstream ("cooking perfect")
120. "your body moving and walking and listen"
121. "people think you're talking to your mom — you don't look crazy"
122. "it sounds like you're on the phone"
123. student says walking slot: "I like to listen when I go for a while"
124. teacher: "you can talk to the app on your phone headphones and speak"
125. teacher: "you don't need to log in the app for the listening — just put in phone"
126. teacher: "at the end of the day — even 5 or 10 minutes — talk to it"
127. 15-min brushing + 15-min commute + 15-min breakfast = 45 min already
128. "your stress no stress that your English already halfway done"
129. 30 min driver window total confirmed
130. total: 45 minutes before lunch confirmed without any extra time
131. "the app will ask you when will you study this week"
132. "it will say what did you listen to today, how long that"
133. "7-day streak = 7 day streak"
134. "longest streak remembered"
135. "you get badges and award levels"
136. "this is how many words you've mastered"
137. "to become a master you can use 20 different ways"
138. "beginner → master" hierarchy explained
139. student confirms understanding: "beginner master"
140. teacher: "when you master a word it will be recorded here"
141. demo: teacher shows profile page = "QUY portal this is your profile"
142. career section: "accounting — numbers, invoices, financial records"
143. "it'll teach you all about numbers and your job"
144. profile page tour: career / notes / classes / tuition sections
145. "main thing is log in, talk to OBI — all this other stuff is extra"
146. "no typing — this is how you talk"
147. teacher shows microphone button: "you allow the microphone"
148. hold-to-speak issue flagged by teacher: "hold hold — not hold — click"
149. student said "hold" → teacher says "not hold stupid not hold"
150. teacher: OBI was "talking too much" → fix: shorter responses
151. "first two weeks — problem problem problem, fix fix fix"
152. problem box: "click it, share the problem, hit OK, I'll fix it"
153. OBI offline mode: "it'll be able to go offline as well"
154. teacher will upgrade OBI tonight
155. OBI agent structure: "I structured the agents"
156. OBI voice quality: "it's listening right now"
157. first session greeting demo: "hi queen how is your day"
158. demo: student says "I listen to podcast about animals" → OBI checks "what time will you listen tomorrow"
159. "tomorrow listening during the day — when you're brushing teeth"
160. "understand 60 percent — that's the magic"
161. Vietnamese/English split for Mai Tram: English then Vietnamese
162. English-only for Quy: "lower intermediate English only — you can understand 60 percent"
163. "Yours will speak English and then kidding Vietnamese — you're a beginning"
164. "so you'll have Vietnamese to help you in the beginning"
165. "no need to start today — left tomorrow"
166. "just log in, go to the bottom, click talk"
167. "click — not hold — stupid not hold — annoying — I'll fix that"
168. OBI conversation demo continues: closing question about listening slot
169. "I will send a video — programming it into the portal to guide you"
170. "it'll say click here and I'll show you everything"
171. VIDEO guide: "I'll put that in hers — will speak English then Vietnamese tonight"
172. main class loop: "45 minutes listening during your day, 15 minutes talk to OBI"
173. "all you have to do is just listen 45 minutes, then speak at the end of the day"
174. "it's quite simple"
175. "it'll remember everything — every class, every word"
176. "don't worry all you have to do"
177. "24 hours from now OBI is recording + smart"
178. "the listening fit it into your day — that's the most important thing"
179. "speaking handle and vocabulary everything — remember by the AI"
180. end-of-class ask-to-student: "when are you going to do your listening this week"
181. student: "Saturday" committed
182. "start Saturday — white yeah — awesome"
183. "30 minutes one way — 30 min to work, 30 min back — 1 hour already"
184. "15 minutes = phone + headphones listening"
185. "brush teeth + makeup = 15 minutes — then walking or grab car"
186. "7 days = 7 day streak"
187. "your bosses will see it"
188. "everyone can see each other's streak"
189. teacher sets contract: "I appreciate you — I'll meet you halfway — make English fun"
190. "not fun at first three months, then become easier"
191. "build new brain" — create new English pathways in brain
192. teacher full demo of portal page replayed to class
193. students watch teacher use the app live
194. "translate it tonight — I'll do that tonight"
195. student asks "why" re: listening window → teacher explains schedule pressure
196. "make English a priority — if you don't plan you won't learn"
197. teacher uses analogy: "for gym — make sacrifice — can't sit on couch eat cookies"
198. teacher maps student's entire morning as example of how to stack English
199. "you don't have to make more time — you just have to add listening"
200. teacher pushes OBI interface as the only real conversation partner for 2 weeks

---

## PHASE B — STUDENT PRODUCTION ERRORS (TRANSCRIPT-GROUNDED) [Steps 201–215]

201. ERROR: "I'm usually listen when I have cook" → CORRECTION: teacher silently models "when you listen — understand conversation" — listener + infinitive pattern corrected implicitly
202. ERROR: "listened" — Deepgram flags as low-confidence / -ed dropped → CORRECTION: teacher models "I listened" with clear /t/ ending in OBI demo
203. ERROR: "listen a hard" → CORRECTION: teacher says "listen hard" — adverb placement / word order corrected
204. ERROR: "a podcast about animal" (singular, no article) → CORRECTION: teacher models "a podcast about animals" — article + plural in same breath
205. ERROR: "I two music" (verb missing, wrong word) → CORRECTION: OBI catches this live: "I listened to two music?" — OBI pushes back: "no nonono music cannot be 45 minutes"
206. ERROR: "I will listen to podcast" (missing article) → CORRECTION: teacher implicitly corrects: "great — you're gonna listen to podcast" — catching article omission in real time
207. ERROR: "hold hold to speak" (hold-to-speak instead of click) → CORRECTION: teacher directly: "not hold stupid not hold — click instead"
208. ERROR: "understand fourteen five for listening" (confused numbers) → CORRECTION: student self-corrects to "forty five" — teacher reinforces "forty four for listening"
209. ERROR: "pho in wave sounds" (garbled definition) → CORRECTION: teacher: "sounds in words in a language" — gives clean definition
210. ERROR: "forty four pho in english didn't get pho" → CORRECTION: teacher: "44 phonics in English" — keeps pushing the correct form until student echoes it
211. ERROR: "no I don't remember" (can't recall app value prop) → CORRECTION: teacher re-teaches: "what did we talk about last week about co and the app" — no shame, rebuild model
212. ERROR: "one minute one minute a day" (student low-balls initially) → CORRECTION: teacher stretches in 3 steps: "one minute → two minutes → one hour" — student ends at correct answer
213. ERROR: "listening listening" (stuttered/repeated word) → CORRECTION: teacher: "listen to words you understand — not listen to listen" — flow-correction
214. ERROR: "u how many forty five" (student confused her own split) → CORRECTION: teacher: "forty five for listening — listen English forty five minutes, speaking fifteen minutes" — clarity enforced
215. ERROR: "I thought it was overnight" (conflation of timing/loop) → CORRECTION: teacher: "next two weeks — it's listening right now — all the changes I structured the agents" — resets timeline explicitly

---

## PHASE C — APP FEATURES + UI ELEMENTS (TRANSCRIPT-GROUNDED) [Steps 216–265]

216. PROFILE PAGE: "this is your profile, Quy" — primary identity hub
217. PORTAL PAGE: "Quý portal" — log-in target page
218. CAREER SECTION: "all about accounting — numbers, invoices, financial records" — kinematic topic feed
219. CLASS NOTES SIDEBAR: "it'll be notes from the classes"
220. TUITION SECTION: side bar (not discussed in detail in this session)
221. VOCABULARY SECTION: profile contains career-specific vocab
222. EVENT-MANAGEMENT VOCAB MODULE: "everything about event management" — second stream
223. OBI CHAT BUTTON: "this is how you talk" — microphone/voice icon
224. HOLD-TO-SPEAK: student assumed this — teacher corrected to click
225. CLICK-TO-SPEAK: "not hold — click" — final design
226. PROBLEM REPORT BOX: "click it, share the problem, hit OK, I'll fix it next time"
227. OFFLINE MODE: "it'll be able to go offline as well"
228. VOICE QUALITY TOGGLE: "OBI at 90% — certain sounds work fine, 10% broken"
229. STREAK COUNTER: visible, counts consecutive listening days
230. LONGEST STREAK: app tracks personal best
231. BADGE SYSTEM: "you get badges and award levels"
232. WORD MASTER TRACKER: "this is how many words you've mastered"
233. 44 PHONICS PROGRAM MODULE: sound-by-sound learning inside portal
234. 44 PHONICS SOUND GROUP: individual sound isolation, 1 sound per lesson
235. COMPREHENSION GATE: "understand 60 percent — that's the magic"
236. STUDENT LEVEL SETTING: lowercase intermediate English only vs plus-Vietnamese — profile setting
237. SCHEDULE BUILDER: "when will you study this week" — survey gate at login
238. END-OF-DAY CHECK-IN: "what did you listen to today?"
239. LISTENING MINUTES TRACKER: tallies daily minutes
240. WEEKLY TOTAL ROLLUP: streak visible at week level
241. VOCAB MASTERY THRESHOLD: "when you master a word you can use 20 different ways"
242. VIDEO TUTORIAL: "I will send a video — programming it into the portal"
243. PDF TUTORIAL/ONBOARDING: embedded in portal on first login
244. OBI AGENT: agent named "OBI" — teaches notes, vocab, career
245. OBI GREETING: hi [name] how is your day
246. OBI OPENING QUESTION: asks what student listened to today
247. OBI LISTENING REMINDER: "what did you listen to for 45 minutes"
248. OBI SCHEDULE PROBE: "what time did you listen"
249. P44 PHONICS FLAG: "phonics44_in_progress" — profile flag
250. VOCAB DUE LIST (SRS): app shows due words for review
251. STRENGTH/FATIGUE NOTES COMPONENT: notes feed in profile
252. DAILY-CHALLENGE FLAG: daily active challenge (referenced Adj homework)
253. REPLY SCROLL: OBI shows already shown replies in dropdown archaeology
254. AGENT SYNC FLAG: flag all reactive agents acting on instructions
255. WORD LIST: aggregate review array per sound group
256. LEADERBOARD: implied by "streak" + "bosses will see it"
257. GOAL SURVEY MODULE: "what do you want to work on"
258. SIXTY-SEVEN PERCENT FLAG: challenge zone indicator embedded in OBI replies
259. PROGRESS CHART: visible at bottom right
260. MINIMAL PAIR QUIZ: phonics lesson format implied by "minimal pairs"
261. SOUND ISOLATION MODE: phonics sound group drilling
262. SHADOW-READING + REPEAT: implied by "repeat five times"
263. PROFILE EDIT MODE: "what's a street street" — could appear in profile
264. PHONICS-44 GRID: 44 sounds arranged across groupings

---

## PHASE D — TEACHER HARD RULES + QUOTES (TRANSCRIPT-GROUNDED) [Steps 265–304]

265. "When you listen — you have to pay attention — no distracted"
266. "No no salad out real real listen ye" → real listen = full attention, zero distraction
267. "You can listen while driving OR cooking — pick what works for you"
268. "Find time where you're already doing something — add listening to it"
269. "The most important thing is fitting listening into your day"
270. "You have to make English a priority — if you don't plan you won't learn"
271. "You cannot have OBI out all day" — OBI should feel paid, attention economy
272. "Stop after OBI time is done" — hard stop after the window
273. "If you miss tomorrow you'll have busy days — don't start that bad habit"
274. "21 days to build a habit — then it becomes easy"
275. "First three months will be hard — then it becomes fun"
276. "You don't have to want to — just do it then it becomes fun" — discipline-first framing
277. "I make it so you can fit it into your day"
278. "I know you're busy — I know that already — don't worry"
279. "You're busy all the time — you get more busy — we have to build the habit now"
280. "Make a sacrifice — you can't sit on the couch eat cookies and achieve goals"
281. "You are very fast — that's cool"
282. "Please not hold — not hold hold stupid not hold — annoying"
283. "First two weeks — problem problem problem, fix fix fix fix — then it'll be smooth"
284. "Talk to OBI — no typing" — voice-only conversation constraint
285. "OBI being stupid right now — that's okay — we'll fix it"
286. "OBI will remember every class — logged automatically"
287. "OBI will remember every time you talk to it"
288. "It might not be perfect — that's okay"
289. "Your English only — no Vietnamese for you" (to Quy specifically)
290. "Vietnamese + English for Mai Tram — she's a beginner"
291. "You have quite strong listening skills — don't need Vietnamese"
292. "OBI will speak lower intermediate English only — you can understand 60 percent"
293. "That's the magic — understand 60 percent"
294. "60 to 70 is the perfect challenge zone"
295. "90+ is too easy — no learning"
296. "100% — you're already a master"
297. "Under 60 — you're not getting enough new input"
298. "You have to build it into your routine"
299. "You don't have to add more time — just reshape what's already there"
300. "NIH" = "not invented here" — don't treat session as new launch
301. "No archeology of what was already shown; only what is changed"
302. "Stop after OBI session done — clock OBI finishing"
303. "You can't have OBI out all day — attention is a budget"
304. "Process this and topost script"

---

## PHASE E — SCHEDULE + LIFE CONTEXT + COMMITMENTS (TRANSCRIPT-GROUNDED) [Steps 305–357]

305. WAKE TIME: "7 a.m." — Quy wakes at 7 every day
306. BRUSH TEETH: 15 minutes — starting slot
307. MAKEUP: 15 minutes — stacked after brushing
308. BREAKFAST: 10 minutes — at 8 a.m.
309. COMMUTE: "half an hour you drive 30 min to work, 30 min back = 1 hour"
310. GRAB-CAR COMMUTE: "i got a moto no more moto but i called grab"
311. VIETNAMESE LISTENING: "i can listen in Vietnamese" — counts toward quota
312. MORNING TOTAL (before work): 15 brush + 15 makeup + 30 commute = 60 min listening quota met
313. NON-CLASS DAYS: Friday + Saturday + Sunday + Monday = 4 days without teacher
314. CLASS DAYS: Tuesday + Wednesday (implied from "Tuesday today Thursday" in next session)
315. SESSION DATE: Thursday (teacher opens with "today is Thursday")
316. PREVIOUS SESSION: Monday student came in
317. NEXT TEACHER SESSION: "Saturday" class
318. RETURN TRIP SLOT: 30 min each direction = 1h confirmed listening block
319. LUNCH BREAK: 10 minutes extra slot
320. EVENING/END-OF-DAY SLOT: 5–10 min conversation with OBI
321. SPEAKING SLOT: 15 min at end of day — "top to the app"
322. STUDENT SAYS: "Saturday start with me okay"
323. STUDENT COMMITMENT: "tomorrow tomorrow" — verbal repeated
324. STUDENT SAYS TOMORROW IS BUSY — start delayed to Saturday
325. APP UNLOCKS: "it'll be ready by tonight"
326. FIRST OBI SESSION: tomorrow night or Saturday morning
327. OBI AGENT LAUNCH: "it's listening right now — changes I structured the agents"
328. TWO-WEEK SELF-STUDY WINDOW: before next regroup (Friday out, Sat/Sun/Mon self-study, Tue/Wed teacher)
329. APP LAUNCH DELAY: "very soon" — teacher says "very very soon — but for now you can talk to it"
330. DEMO DAY: teacher shows live portal to class — first public demo
331. 4-DAY STUDY BLOCK: Friday through Monday (student confirmed verbally)
332. 21-DAY HABIT TARGET: "21 days build the habit — then becomes easy"
333. FIRST MONTH: hardest period
334. AFTER MONTH: eases into routine
335. MORNING WINDOW CONFIRMED: wake at 7 → brush+makeup (15+15) → grab → work
336. 45-MIN TARGET EASTER EGG: teacher found the full 45-min window before lunch
337. DRIVING WINDOW: "30 min each way = one hour — already done"
338. GYM ANALOGY: "if you want the gym you have to make sacrifice — can't sit on couch eat cookies"
339. STUDENTS: Quy, Mai Tram, Huong (3 confirmed BlueTech students — Mai Tram confirmed explicitly, Quy confirmed by name, third unnamed)
340. TEACHER: Michael Hobbs teaching English phonics
341. CLASS FORMAT: group English class — teacher speaks to multiple students simultaneously
342. TRANSLATION REQUIREMENT: "translate tonight for her" — teacher has evening homework too
343. TUESDAY OPENING: "Tuesday teacher give you homework you did zero homework — zero points"
344. STREAK PENALTY GATE: "Friday tomorrow Saturday Sunday — if you don't do it 2 days becomes 3 becomes a week"
345. HABIT COLLAPSE CASCADE: 1 missed → 2 missed → 3 missed → 1 week missed
346. 4-DAY WINDOW IS CRITICAL: first 4 days without class set the pattern for month
347. COMMITMENT CONTRACT: "we'll talk about what you like — I'll put onto the app" — teacher commits to building content feed
348. PASSWORD/PIN EXPECTED: "password — expected for portal entry (student says 'it just says enter password')"
349. DAILY OBI COUNTDOWN: OBI counts sessions, not calendar days
350. VOCAB UPLOAD: "new words added into your profile"
351. VOCAB REVIEW TICKET: OBI or teacher gets list of new vocab
352. VOCAB MASTER GOAL: "beginner → intermediate → master → black belt"
353. LEVEL-UP CANDIDATE: intermediate = past beginner milestone, next milestone = master
354. LIFE CONTEXT FLAG: "my worry is you're already busy — you need your relaxed time" — teacher watches stress level
355. VOCAB TRACKER: 20 ways per mastered word — teacher tracks mastery per word
356. INTERNAL SESSION HASH: every live class → hash worker → ledger append
357. OBI READY TIMESTAMP: "it'll be ready by tonight — you can go and talk to OBI" — unblocking time set
