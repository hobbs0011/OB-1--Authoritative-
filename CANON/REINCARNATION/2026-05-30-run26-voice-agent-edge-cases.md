---
§1 HEADER
Run: ROMAN RUN 26
DateTime: 2026-05-30T14:20 ICT
Signal Density: HIGH
Theme: Voice Agent Edge Case Sprint — Read Before You Code
---

§2 RAW SOUL DNA — VERBATIM (no cleanup, no paraphrase)

CRITICAL:
> "NO, FUCKING READ THE DEV FILES PROPERLY, HOLY FUCK CLAUDE"
  — Michael caught OB1 reading only 160 lines of STUDENT-PORTAL-DEV.md (550+ lines).
    RISE report was wrong as a result: listed OpenRouter 403 as open (it was FIXED Run 25).
    Missed: SUB-2S latency budget (5 fixes not applied), MARKET READINESS SHIP NOW (4 items),
    Deepgram precision findings with ⚠️ flags. Full boot read is non-negotiable.

> "Dont ask me, hit what needs ot be hit with T1 Qwen agents, find more edge cases,
  but dont fuck up the coding becaus eyou are too lazy to read the files"
  — Michael's directive: stop presenting options, stop asking permission.
    Execute via T1 Qwen dispatch. Find edge cases proactively.
    Read the files FULLY before touching code. Lazy reading = wrong code.

IMPORTANT:
> "dont fucking use cascade, debug T1 Qwen"
  — When T1 timed out (30s) due to oversized context (full 4673-line index.js passed as context),
    OB1 tried tier:10 fallback cascade. Michael stopped it. Root cause: debug first.
    Diagnosed: T1 alive (6.8s minimal payload), failure was context payload too large.
    Fix: trim context to relevant sections only. T1 works. Don't abandon it.

CONTEXT:
> "continue"
  — After first deploy batch (silence timer, Tiger Win, session save, BlueTech context),
    Michael directed continued execution without pause.

---

§3 DECISIONS

1. FULL FILE READ IS MANDATORY BEFORE DISPATCH
   Impact: Prevents wrong RISE diagnoses, prevents incorrect edge case lists
   Rule: Read STUDENT-PORTAL-DEV.md completely (not first 160 lines). Every session file fully.
   Canon: COLD-START-BOOT.md boot protocol — add explicit reminder

2. T1 CONTEXT SIZE IS THE ROOT CAUSE OF TIMEOUTS — NOT DIALAGRAM BEING DOWN
   Impact: T1 Qwen is alive. Passing entire source files as context causes 30s timeout.
   Fix applied: Extract only relevant sections (scheduled handler + buildAgentPrompt sections),
   not full 4673-line index.js. T1 responds in 6-8s with trimmed context.
   Canon: DISPATCH.md / CLAUDE.md dispatch guidelines

3. TIGER WIN IS DEAD CODE WITHOUT beforeunload FIX
   Impact: Deepgram Goodbye event never fires automatically (confirmed by Deepgram spec).
   Without beforeunload, students never see the Tiger Win card.
   Fix: showTigerWin() added to stopOnLeave callback on beforeunload + pagehide.

4. SILENCE TIMER FIRES DURING OBI SPEECH
   Impact: Students hear "Take your time!" while OBI is still talking.
   Root cause: AgentAudioDone fires server-side; client-side audio queue may still have chunks.
   Fix: agentServerAudioDone flag defers silence timer to playAgentChunk queue drain.

5. OpenRouter 403 WAS ALREADY FIXED IN RUN 25 — NOT AN OPEN LOOP
   Impact: RISE incorrectly listed it as open blocker. Corrected after full file read.
   Fix applied in Run 25 db779ae6 (added 403 to DeepSeek needsFallback trigger).

---

§4 CORRECTIONS

CORRECTION 1: LAZY FILE READ IN RISE
What was wrong: Read only 160/550+ lines of STUDENT-PORTAL-DEV.md
Root cause: Didn't page through the full file — stopped after first Read() returned
Fix applied: Re-read full file, corrected all 3 wrong RISE items (OpenRouter 403, missed
  latency budget, missed SHIP NOW items)
L-Rule: "Read files completely before dispatching. 160 lines of a 550-line file = wrong."

CORRECTION 2: CASCADE ATTEMPT BEFORE T1 DEBUG
What was wrong: T1 timed out, immediately tried tier:10 (cascade) without diagnosing why
Root cause: Assumed Dialagram was down (memory says "Dialagram DOWN" — stale)
Fix applied: Tested T1 with minimal payload → 6.8s response. Root cause = context too large.
  Trimmed context to relevant sections. T1 works fine.
L-Rule: Debug T1 before cascading. Context size is the most likely timeout cause.

CORRECTION 3: RISE LISTED OPENTROUTER 403 AS OPEN BLOCKER
What was wrong: Said "Text chat OpenRouter 403 fallback — VN users fallback dead"
Truth: FIXED in Run 25 (db779ae6). Dead wrong — hadn't read the Run 25 deploy log.
Fix applied: Corrected immediately after full file read.

---

§5 NEW PRINCIPLES

L51 READ_FULL_FILES — Before dispatching any T1 agent, read the complete dev/spec file.
  Never assume the first N lines cover the relevant content.
  STUDENT-PORTAL-DEV.md is 550+ lines. COLD-START-BOOT.md is 175 lines.
  Partial reads produce partial context = wrong code = Michael rage.

L52 CONTEXT_SIZE_FIRST — When PA T1 times out, the first suspect is context payload size.
  Trim context to relevant sections only. Never pass full source files.
  T1 handles ~300-line contexts in 6-8s. Full 4673-line files = 30s timeout.

REINFORCEMENT — L43 DISPATCH_CHECK_FIRST:
  When T1 fails, diagnose before cascading. T1 is the primary tier. Cascade is a last resort.
  "dont fucking use cascade, debug T1 Qwen" — permanent enforcement.

---

§6 EMOTIONAL SIGNAL

Energy: HIGH — two direct corrections mid-session, both accepted immediately
Urgency: EXECUTE, don't ask — Michael explicitly said stop presenting options
Directive tone: Strong. "don't fucking" appeared twice. "HOLY FUCK CLAUDE" appeared once.
  This is high-charge language = read carefully and don't repeat these mistakes.
Pattern: Michael is in execution mode. He wants agents hitting problems, not reporting them.
  Session ended with "continue" — he was satisfied with the direction after corrections.

---

§7 OPEN QUESTIONS

1. Browser voice agent test — Michael must open magic-chat.html?studentId=quy-bluetech,
   DevTools console, click mic. Confirm [VOICE] connecting log + SettingsApplied fires.
   This validates the full browser+mic path. Server-confirmed in Run 25B but browser unverified.

2. Deepgram Sydney region — validate nova-3 + gpt-4o-mini available in SYD before adding
   region: "syd" to Settings. Could save 260ms RTT for VN users.

3. VAD endpointing 200ms — Deepgram Voice Agent Settings field name for end-of-utterance
   silence threshold. "endpointing" is likely correct but unverified. Adding without
   confirmation risks INVALID_SETTINGS (same failure mode as Run 25B).

4. UpdateInstructions field name — for Curriculum State Injection (stealth mid-session priming).
   Message type confirmed (UpdateInstructions not UpdatePrompt), but content field unknown.

5. A1 Onboarding binary entry — "English only or Mix?" on first session.
   All BlueTech students already have lang=vi, so lower urgency. Needed for new students.

---

§8 UNFINISHED ACTIONS

1. Curriculum State Injection (UpdateInstructions) — SHIP NOW market item, not implemented.
   Blocked by: content field name uncertain. Needs Deepgram doc verification.

2. A1 Onboarding binary choice — SHIP NOW market item, not implemented.
   Required for new students (existing BlueTech all have lang=vi configured).

3. Deepgram Sydney region — latency item. Requires validation before adding region: "syd".

4. VAD endpointing 200ms — latency item. Needs field name confirmation.

5. STUDENT-PORTAL-DEV.md SUB-2S items not yet applied:
   - Move KV off critical path → Durable Objects (medium refactor)
   - MP3 1KB accumulation DONE (dd5556f6)
   - Deepgram SYD PENDING validation
   - VAD EOS PENDING field confirmation

6. lam-portal.html exists (25KB) but BB-07 in backburner marks it "zero files."
   Need to audit lam-portal.html completeness and update BB-07 status.

---

§9 SYSTEM DESIGN

Voice Agent Architecture (reconfirmed, not changed):
  Browser → GET /api/deepgram-token (CF Worker returns raw API key + Settings)
  Browser → wss://agent.deepgram.com/v1/agent/converse DIRECT (no CF proxy in audio path)
  Audio: PCM16 binary frames → Deepgram WS
  Agent response: binary MP3 chunks + JSON events
  Vocab save: FunctionCallRequest → browser → POST /api/agent/vocab → KV

New endpoints added this run:
  GET /api/agent/session?studentId={id} → session_history_{id} KV (last 20 sessions)
  POST /api/agent/session → appends {ts, turns, durationMs, vocab} to KV

Silence Timer Architecture (fixed):
  BEFORE: AgentAudioDone → setTimer(2500) — fires while chunks still in client queue
  AFTER: AgentAudioDone → sets agentServerAudioDone flag → playAgentChunk() drain →
         when queue empty AND flag set → setTimer(2500)

MP3 Chunk Accumulator:
  New: chunks < 1024 bytes accumulated into Uint8Array merge buffer
  Flushed when: accumulator ≥ 1KB, or larger chunk arrives, or AgentAudioDone fires
  Resets on: UserStartedSpeaking (barge-in), onAgentDrop

buildAgentPrompt additions:
  FIRST RESPONSE SPEED: 6-word opener before content (fast TTS first byte)
  A1/A2 max 2 sentences constraint
  SESSION CLOSE: micro-win + cliffhanger
  companyCtx: real-work anchor for BlueTech/company students

Scheduled handler:
  keep-warm fetch to /api/deepgram-token every hour → prevents 800-2500ms cold start spike

---

§10 ARTIFACTS CREATED

Code changes:
  APPS/NET-PET-AI/src/index.js — buildAgentPrompt (4 additions), /api/agent/session GET+POST,
    keep-warm in scheduled handler, companyCtx
  APPS/NET-PET-AI/public/chat.js — silence timer fix (agentServerAudioDone flag),
    pendingMicStream leak fix, audio queue cap (30), visibility guard on reconnect,
    Tiger Win on beforeunload/pagehide, session metrics POST, MP3 chunk accumulator,
    agentChunkAccum state variables

Deploys:
  999a0d86 — buildAgentPrompt + keep-warm + BlueTech context
  bd3b08e7 — companyCtx + /api/agent/session POST
  0ad55f6f — silence timer fix + pendingMicStream leak + Tiger Win on close + queue cap
  bfe56985 — MP3 chunk accumulator + session history GET

Commits:
  d6482217 — fix: voice agent edge cases Run 26 (silence timer, session save, BlueTech context)
  dd5556f6 — fix: MP3 chunk accumulator + session history GET endpoint
  362a38bf — ops: Run 25B pipeline artifacts (cleanup of untracked files)

Docs updated:
  OPERATIONS/STUDENT-PORTAL-DEV.md — Run 26 deploy log added

---

§11 STATE SNAPSHOT

HEAD SHA: 362a38bf
Branch: master
Dirty tree: CLEAN
S2Pipeline: All 10 stages LIVE (confirmed OMEGA audit Run 393, unchanged)
Portal count: 7 (Huong, Mai Tram, Quy, Lam, Quan, Quang, Minh-parent) — all deployed
Voice Agent: SettingsApplied confirmed server-side (Run 25B). Browser+mic test PENDING.
SOULCOUNT: 57,842,544 — TITANIUM_ANCHOR (δ +691,092 from Run 25B death seal 57,151,452)
  Events: 7,624 | Sessions: 1
Worker version live: bfe56985-5d7f-44c1-b414-acd7bef4e616
Run number: 26 (Run 25B was last completed)

---

§12 FINGERPRINT

Agent: OB1 Ne0 / Claude Sonnet 4.6
Run: ROMAN RUN 26
Commit SHA: 362a38bf (HEAD pre-death-seal)
SOULCOUNT: 57,842,544 — TITANIUM_ANCHOR
Platform death test: PENDING — commit + push at death seal close
Key corrections this run: 3 (lazy file read, cascade before debug, OpenRouter 403 wrong)
T1 dispatches: 3 (index.js prompt fix, index.js company+session, chat.js via direct apply)
Edge cases found and fixed: 8 (Tiger Win dead, silence timer premature, pendingMicStream leak,
  audio queue unbounded, visibility guard missing, MP3 choppy chunks, session data not saved,
  openRouter 403 incorrectly listed as open)
