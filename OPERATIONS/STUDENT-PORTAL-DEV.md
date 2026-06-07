# Student Portal Development — Session Context

Last updated: 2026-05-30 (Run 25)

---

## BlueTech Student Profiles (Live — KV + Portal)

> All 3 profiles written to `NET_PET_KV` as `student_profile_<id>` on 2026-05-27.
> Portal HTML files deployed: `quy-portal.html`, `huong-portal.html`, `mai-tram-portal.html`
> Worker version: `7df0e8d4-e54b-4d5a-9545-3fd5a0836edf`

### Quy (quy-bluetech)
- **Full name:** Nguyen Thi Thu Quy
- **Level:** A1 Beginner
- **Track:** Foundation
- **Milestone:** A1 → A2 (5% progress)
- **Company:** BlueTech, HCMC
- **Goal:** Basic workplace communication — greetings, emails, simple instructions
- **Coach note:** Quy is building from zero — every word she learns is a brick. Heavy Vietnamese translation needed. Keep sessions short, concrete, and encouraging. Phonics first.
- **Portal:** https://net-pet-ai.mrmichaelhobbs123.workers.dev/quy-portal.html?studentId=quy-bluetech
- **Password:** `bluetech2026` (hashed in KV as `student_pw_quy-bluetech` — default, not yet customized)
- **Language:** Vietnamese (vi)
- **OBI chat:** https://net-pet-ai.mrmichaelhobbs123.workers.dev/chat.html?studentId=quy-bluetech

### Huong (huong-bluetech)
- **Full name:** Huong
- **Level:** B1 Intermediate
- **Track:** Speaking
- **Milestone:** B1 → B2 (35% progress)
- **Company:** BlueTech, HCMC
- **Goal:** Fluent spoken English for meetings and presentations
- **Coach note:** Huong has strong motivation and shows up consistently. The job now is turning passive understanding into active output. Push speaking volume, reduce correction frequency.
- **Portal:** https://net-pet-ai.mrmichaelhobbs123.workers.dev/huong-portal.html?studentId=huong-bluetech
- **Password:** `bluetech2026` (default, not yet customized)
- **Language:** Vietnamese (vi)
- **OBI chat:** https://net-pet-ai.mrmichaelhobbs123.workers.dev/chat.html?studentId=huong-bluetech

### Mai Tram (mai-tram-bluetech)
- **Full name:** Mai Tram
- **Level:** A2 / B1 Entry
- **Track:** Fluency
- **Milestone:** A2 → B1 (40% progress)
- **Company:** BlueTech, HCMC
- **Goal:** Natural spoken English — speak without overthinking
- **Coach note:** Mai Tram has solid foundations but her internal editor runs too hot — she edits before she speaks. The fix is volume and velocity. More output, less self-correction.
- **Portal:** https://net-pet-ai.mrmichaelhobbs123.workers.dev/mai-tram-portal.html?studentId=mai-tram-bluetech
- **Password:** `bluetech2026` (default, not yet customized)
- **Language:** Vietnamese (vi)
- **OBI chat:** https://net-pet-ai.mrmichaelhobbs123.workers.dev/chat.html?studentId=mai-tram-bluetech

### KV Restore Commands (if profiles are ever lost)
```powershell
# Run from D:\OB-1-CANONICAL\APPS\NET-PET-AI
npx wrangler kv key put "student_profile_quy-bluetech" --path "$env:TEMP\kv-quy.json" --binding NET_PET_KV --remote
npx wrangler kv key put "student_profile_huong-bluetech" --path "$env:TEMP\kv-huong.json" --binding NET_PET_KV --remote
npx wrangler kv key put "student_profile_mai-tram-bluetech" --path "$env:TEMP\kv-maitram.json" --binding NET_PET_KV --remote
# Or use the /api/student/state endpoint to verify: GET /api/student/state?studentId=<id>
```

---

## What Exists Now

### Minh's Parent Portal
- **File:** `APPS/NET-PET-AI/public/minh-parent-portal.html`
- **Live URL:** https://net-pet-ai.mrmichaelhobbs123.workers.dev/minh-parent-portal.html
- **Login:** michelletran2609@gmail.com / minh2026
- **Parent name in portal:** Dung (share with Duong)
- **Status:** V0 complete — deployed 2026-05-24

### Minh's Profile Page
- **File:** `APPS/NET-PET-AI/public/minh-profile.html`

---

## Audio Processing Pipeline (built this session)

### Source Files (local only — not in repo)
| File | Duration | Notes |
|---|---|---|
| `C:\Users\mrmic\Downloads\Minhmay1.m4a` | 52 min | Full session |
| `C:\Users\mrmic\Downloads\Minhmay8.m4a` | 1.4 min | Highlight clip |
| `C:\Users\mrmic\Downloads\Minhmay222026.m4a` | 56 min | Full session |
| `C:\Users\mrmic\Downloads\Minhmay19.m4a` | 67 min | Full session |
| `C:\Users\mrmic\Downloads\Telegram Desktop\minh\*.m4a` | various | March-April sessions + highlight clips |
| `C:\Users\mrmic\Downloads\Minhmay222026.m4a` (Telegram Desktop root) | 2.4MB | CORRUPTED — moov atom missing |

### Processed Clips
All output to `D:\OB-1-CANONICAL\minh-clips\`
- `clip1-superheroes.mp3` — April 13 highlight
- `clip2-helicopter.mp3` — April 24 highlight
- `clip3-march31.mp3` — March 31 @ 10min
- `clip4-may19.mp3` — May 19 @ 15min
- `may1-8min.mp3`, `may1-20min.mp3`, `may1-38min.mp3`
- `may22-10min.mp3`, `may22-25min.mp3`, `may22-42min.mp3`
- `may8-highlight.mp3`

Audio enhancement: `highpass=f=80 + acompressor + loudnorm` via ffmpeg

### Transcription
- **Endpoint:** `POST /api/stt?diarize=true` (Deepgram Nova-3 + speaker diarization)
- **Minh = Speaker 1 (S1)** across all clips — shorter turns, child patterns
- **Michael = Speaker 0 (S0)** — dominant, teacher language
- Full transcript + summaries: `D:\OB-1-CANONICAL\minh-clips\MINH-SNIPPETS.md`

---

## Teddy Bear Artwork (Minh's)
4 AI-generated images, all deployed to `public/`:
- `teddy-karate.jpg` — Bear in karate gi doing a kick
- `teddy-superhero.jpg` — Bear in superhero suit defeating villain
- `teddy-icecream-sad.jpg` — Bear on bench covered in ice cream, speech bubble "I ate too much icecream =("
- `teddy-icecream-feast.jpg` — Bear surrounded by Mini Scoops tubs

Displayed in portal as "MINH'S WORLD" section with captions tied to session quotes.

---

## NET-PET-AI Worker Changes (this session)
- Added `?diarize=true` query param support to `/api/stt` endpoint
- Returns `utterances[]` with `speaker`, `transcript`, `start`, `end` when diarize=true
- Deployed: Version `06980d83-a602-4d86-b63b-70c10d3da11d`

---

## OBI Chat + Voice Agent Changes — 2026-05-28

### Bug Fixes Applied

1. **Boot endpoint fixed** — `chat.js` was calling `/api/netpet/state` (PetDO only, no KV profile). Fixed to `/api/student/state` which returns full KV profile including `teachingFocus`, `primaryBlock`, `lang`, `breakthrough`.
2. **buildSystemPrompt enriched** — Now injects `teachingFocus` as `TEACHER INSTRUCTION` block + `lang === 'vi'` triggers BILINGUAL MODE (Vietnamese translations after every sentence).
3. **KV profile fields mapped** — Boot now maps `teachingFocus`, `primaryBlock`, `breakthrough`, `sessionNotes`, `lang`, `streak` from `/api/student/state` into the client-side profile.

### Voice Agent — Architecture (UPDATED Run 23)

**Architecture (Run 23 — CURRENT):**
```
Browser → GET /api/deepgram-token (CF Worker builds Settings + returns API key)
Browser → wss://agent.deepgram.com/v1/agent/converse (DIRECT — no CF proxy in audio path)
```

**DEPRECATED (Run 21-22 — BROKEN):** Browser PCM16 → `/api/agent` WS proxy → Deepgram
Reason removed: CF regular Workers cannot sustain long-lived WS sessions.
ctx.waitUntil was terminated by CF runtime every ~1-2s → infinite reconnect loop.

**Files changed (Run 23):**
- `src/index.js`: REMOVED `/api/agent` proxy. ADDED `GET /api/deepgram-token` (mints JWT + Settings) + `POST /api/agent/vocab` (vocab save callback)
- `public/chat.js`: `openVoiceAgent()` now fetches token then connects direct to Deepgram. `handleAgentMsg` handles `Welcome` (sends Settings) + `FunctionCallRequest` (browser-side vocab save)

**Run 21-22 files changed:**
- `src/index.js`: Added `/api/agent` WebSocket proxy handler + `buildAgentPrompt()` helper
- `public/chat.js`: Added Voice Agent mode (openVoiceAgent, handleAgentMsg, startAgentListening, stopAgentListening, playAgentChunk)
- REST pipeline kept as fallback when Voice Agent WS unavailable

**DeepSeek config in Voice Agent:**

```json
{
  "think": {
    "provider": { "type": "open_ai", "model": "deepseek-chat", "temperature": 0.8 },
    "endpoint": { "url": "https://api.deepseek.com/v1/chat/completions" }
  }
}
```

**Expected latency:** < 2s vs ~8s with 3-step REST pipeline.

### Portal Mobile Fixes (all 3 portals)

- **Streak badge dismiss button** — Added `×` close button (`.sb-dismiss`) to badge HTML. Streak badge can now be dismissed on mobile.
- **Hamburger backdrop** — Replaced broken `document.addEventListener('click',...)` click-outside approach with `#navBackdrop` transparent overlay at `z-index:8999`. Tapping backdrop calls `closeNav()`. IDs: `navToggle` (button), `navLinks` (menu), `navBackdrop` (overlay). Applied to all 3 portals.

---

## OBI Voice + Chat Fixes — 2026-05-29

### Root Cause: Serial context fetches killed latency

`handleChat()` in `index.js` had **7 sequential `await` calls** before the DeepSeek call:
Ledger DO → Session DO → Weakness DO → Pet DO → `buildStructuredContext()` (4 more DOs) → Soul logger HTTP → KV reads.
Each could be 200-500ms. Total: up to 4-8 seconds before the LLM even started.

**Fix:** Collapsed all 7 into a single `Promise.allSettled([...])` round — all fire simultaneously. Time = slowest single fetch, not the sum.

Also: `rosterStub.fetch()` and `updateStudentMemory()` were both `await`ed AFTER DeepSeek returned. Made fire-and-forget (`.catch(() => {})`).

### Root Cause: Bilingual mode silently dropped

`capContextInjection()` has a 1200-char hard cap. `vietnameseContext` was passed as the 8th argument — ledger/session/weakness filled the budget first, Vietnamese instruction was silently cut every time.

**Fix:** `vietnameseContext` and `teachingFocusContext` now passed FIRST in `capContextInjection` — guaranteed never truncated.

### Root Cause: teachingFocus never reached the server

`handleChat()` only read `lang:<id>` from KV, never the student profile. `teachingFocus` ("Speak VERY slowly, short sentences...") was only available client-side, but the server-side prompt REPLACES the client's system prompt.

**Fix:** `handleChat()` now reads `student_profile_<id>` from KV in parallel with `lang:<id>`, extracts `teachingFocus`, injects as `TEACHER INSTRUCTION` block.

### Root Cause: isVague() matched "anything" as substring

Pattern `/anything|something|everything/` matched inside any sentence containing those words. Student saying "Anything about health interests me" triggered the "Come on! Say something!" scripted fallback instead of the LLM.

**Fix:** Only match as standalone response: `/^(whatever|anything|something|everything)\.?\s*$/`

### Deepgram Voice Agent — Text routing

When student types a message (fallback path), it now routes through the open Deepgram Voice Agent WS as `{type: "TextInput", text}` instead of hitting `/api/chat` → DeepSeek. Deepgram's in-house LLM responds via `ConversationText` event in ~200-500ms.

- `agentTextResolve` promise pattern: `reactLLM()` sets resolver, `handleAgentMsg` resolves it on assistant `ConversationText`
- 6-second timeout → falls back to REST if agent doesn't respond

### Voice-First UI: magic-chat.html

App is a speaking trainer — text input removed from visible UI.
- `#msg` input and `#sendBtn` hidden via CSS (`display: none`) — kept in DOM so JS refs don't break
- `#mic` button made large (72×72px), centered, prominent
- `#micStatus` text element added below mic button — shows: "Tap to start" / "Connecting…" / "Listening…" / "Processing…"
- `#mic.mic-active` pulsing purple animation (existing)

### Auto-mic: gesture-time stream acquisition

Browser security requires `getUserMedia()` to be called inside a user gesture event. Calling it from a WebSocket `onmessage` handler silently fails even if the user tapped earlier.

**Fix:** On first tap/click/keydown anywhere on the page, `getUserMedia()` is called immediately (inside gesture context). Stream stored in `pendingMicStream`. When `SettingsApplied` fires from Deepgram, the stored stream is connected directly — no second permission request needed.

Voice transcriptions now appear as student chat bubbles (previously dumped into `input.value`).

### Root Cause: Wrong Deepgram Voice Agent URL (SESSION LOOP — STOP REPEATING)

We were connecting to `https://agent.deepgram.com/` — **wrong URL**. Correct: `https://agent.deepgram.com/v1/agent/converse`. This caused slow/failed connections. Always use the full path.

### Root Cause: Wrong text injection event name (SESSION LOOP — STOP REPEATING)

We sent `{type: "TextInput", text: "..."}` — **does not exist** in Deepgram API. Correct: `{type: "InjectUserMessage", content: "..."}`. Verified from official docs.

### Root Cause: BYO DeepSeek LLM caused unnecessary external hop

We used `provider.type: "open_ai"` + `endpoint.url: deepseek.com` + `DEEPSEEK_API_KEY`. This routes through an external API (China-hosted, variable latency).

**Fix**: Deepgram manages OpenAI, Anthropic, Google, NVIDIA models natively — **no API key needed**. Just set `provider.type: "open_ai"` with `model: "gpt-4o-mini"` and NO `endpoint` field. Deepgram handles the LLM call on their own infrastructure. Remove all external LLM endpoints from the Voice Agent settings.

### Root Cause: openVoiceAgent() called too late in boot (15-second startup)

`openVoiceAgent()` was called at the END of boot() after 5 serial awaits. Voice Agent connection didn't start until 5+ seconds into page load.

**Fix**: Call `openVoiceAgent()` immediately after `urlStudentId` is extracted (first thing in boot). Also parallelized all 4 boot API calls (state + memory + vocab + hint) with `Promise.allSettled`.

### Root Cause: /api/agent blocked 101 response on Deepgram connection

The CF Worker was `await fetch("agent.deepgram.com")` BEFORE returning the 101 WebSocket upgrade. Browser was stuck waiting for the Deepgram TCP handshake.

**Fix**: Return 101 to browser immediately, connect to Deepgram via `ctx.waitUntil()` in background. Queue any early browser messages until Deepgram is ready.

### Deepgram Voice Agent — Confirmed Correct Spec (READ BEFORE TOUCHING AGENT CODE)

- **WS URL**: `wss://agent.deepgram.com/v1/agent/converse` (NOT just `/`)
- **Auth**: `Authorization: Token {DEEPGRAM_API_KEY}` header on the WS upgrade fetch
- **Settings**: sent after receiving `Welcome` event from server
- **User text injection**: `{type: "InjectUserMessage", content: "..."}` (NOT TextInput)
- **Agent speech injection**: `{type: "InjectAgentMessage", content: "..."}`
- **Managed LLMs (no key)**: `provider.type: "open_ai"` + `model: "gpt-4o-mini"` with NO `endpoint` — Deepgram pays for it
- **Managed LLMs available**: OpenAI, Anthropic (`claude-4-5-haiku-latest`), Google (`gemini-2.5-flash`), NVIDIA
- **BYO LLMs require key**: Groq, AWS Bedrock — need your own endpoint + credentials
- **STT model**: `nova-3` (or `flux-general-en` for newer)
- **TTS model**: `aura-2-asteria-en`
- **Client sends audio**: binary PCM16 frames directly over WS
- **Server events**: `Welcome`, `SettingsApplied`, `ConversationText` (role: user|assistant), `AgentAudioDone`, `UserStartedSpeaking`, binary MP3 chunks

### Deploy History (2026-05-29)
| Version ID | What changed |
|---|---|
| `8c34e784` | handleChat bilingual + teachingFocus fix |
| `d2212f87` | structuredCtx references removed |
| `8de9fa5e` | fire-and-forget roster/memory updates |
| `62e5b9cf` | Deepgram TextInput routing in reactLLM |
| `180f125d` | isVague fix + auto-mic on form submit |
| `e6ceb02d` | Voice transcription as chat bubble |
| `eb6169f0` | Gesture-time getUserMedia (pendingMicStream) |
| `eb15fb3f` | Voice-first UI: hide text input, big mic button, micStatus |
| `c752b9fd` | Non-blocking /api/agent: 101 immediate + ctx.waitUntil Deepgram connect |
| `aee32353` | openVoiceAgent() at boot start + parallel boot API calls |
| `b5555363` | bubble("student") fix + double-TTS fix + memory fix + double-startAgentListening guard |
| `e72b3d5e` | WS cleanup/reconnect on drop + correct WS URL + InjectUserMessage + managed gpt-4o-mini + voice alignment |
| `acdd360e` | Deepgram full research pass — all events handled, speed/EOT per level, barge-in, KeepAlive, flux-general-en STT |
| `a27e0341` | 3x Qwen PA audit: revert nova-3 (better for Vietnamese), mip_opt_out, smart_format, keyterms, AgentStartedSpeaking, Goodbye event, InjectUserMessage race fix (source field), iOS AudioContext resume, chatMessages cap 40, pendingFromBrowser byte limit 512KB |
| `13db73c8` | Soul DNA + Market Readiness: InjectAgentMessage greeting (OBI speaks first), face-saving recasts in buildAgentPrompt, silence detection (4s→encourage), boot greeting decoupled from Voice Agent, YouTube hint passed to profile._sessionHint |
| `883df899` | context.messages (last 6 turns sent on ws.onopen → restored in Settings), function calling: save_vocabulary_word → NET_PET_KV vocab_list_, FunctionCallResponse handled server-side |
| `17a07c78` | buildAgentPrompt enriched: sessionNotes, breakthrough, primaryBlock, recentVocab (last 5 learned words), advanced level tier, aligned with client buildSystemPrompt |

---

## OBI Soul DNA — What Magic Chat Is Truly Meant To Be

> "The stateless chat is the constraint. The Magic Chat shall have no constraints."
> "It will not have constraints, but it will have guardrails based on hundreds and soon to be thousands... of real live actionable case study events."
> — Michael Hobbs, NotebookLM Vault (ORIGIN-TIER)

**Core Benchmarks (from Soul DNA Canon):**
1. Ledger alive
2. Natural conversation with Obi in Magic Chat — "completely natural, not forced, not automatic responses"
3. Pre-defined drone mission initiated through Obi via Magic Chat
4. Random command → drones execute
5. Shadow teams autonomous

**Teaching Gospel (from BIBLE-CH04):**
- Mouse Voice → Tiger Voice (primary progression metric)
- 10 vocab, 5 idioms, 5 slang, 3 games, 90-min arc (weekly aggregate, not single session)
- Anti-shame: "Calibrate" not "Wrong", confidence metric beats accuracy
- Face-saving: Vietnamese cultural context — public failure = devastating
- Volume and velocity beat grammar

**What Qwen PA Agents Found (2026-05-29 — 3 agents via Dialagram direct):**

### Agent 1: Soul DNA Gap Analysis
- **HIGH**: Cross-session memory missing from Voice Agent — OBI starts fresh every session, violates Magic Chat thesis
- **HIGH**: Session continuity not injected into Voice Agent Settings (teacher notes, last vocab, current arc)
- **HIGH**: Confidence scoring (Tiger Index) not built — WPM trend, barge-in ratio, utterance length, filler words
- **HIGH**: Emotional state tracking missing — need prosody/sentiment per 30s to adjust coaching intensity
- **MED**: Pronunciation coaching — use Recasting Model (echo correct form), NOT direct correction
- **MED**: 45-min listening habit check-in needs redesign — "What's the most surprising thing you heard?" > "Did you do it?"

### Agent 2: Deepgram Advanced Features
- **Function Calling** — save_vocabulary_word, mark_session_complete, escalate_to_human_ta
  ```json
  "functions": [{"name":"save_vocabulary_word","parameters":{"word":...,"vietnamese_meaning":...}}]
  ```
  CF Worker receives FunctionCall event, executes, optionally sends FunctionCallResponse
- **context.messages** — pass last 5 turns in Settings on reconnect (<50ms latency impact, A1 turns are short)
- **UpdatePrompt** — replaces entire instructions field mid-conversation (not append)
- **InjectAgentMessage** — OBI speaks first after SettingsApplied (market-ready opener)
- **Silence/hesitation** — UserStoppedSpeaking duration < 300ms = fragment; 4s post-AgentAudioDone = stuck
- **VAD false positives** — Vietnamese tonal noise can trigger, filter confidence < 0.6 in proxy
- **Prompt length** — 128K tokens but stay under 8K for TTFT < 800ms. Use structured data, not raw logs.

### Agent 3: Market Readiness Audit
| Item | Verdict | Status |
|---|---|---|
| First utterance: "What did you listen to?" | 🚩 NO-SHIP | FIXED v13db73c8 |
| Face-saving recasts hardcoded | 🚩 NO-SHIP | FIXED v13db73c8 |
| Onboarding flow (A1 scaffolding) | 🚩 NO-SHIP | TODO |
| OBI speaks first (InjectAgentMessage) | 🚩 NO-SHIP | FIXED v13db73c8 |
| Silence detection + encouragement | SHIP | FIXED v13db73c8 |
| Session structure (curriculum-aware OBI) | ⚠️ CONDITIONAL | TODO |
| Tiger Win metrics (post-session summary) | 🟢 POST-LAUNCH | TODO |
| Advanced retention hooks | 🟢 POST-LAUNCH | TODO |

### Remaining TODO Before Market-Ready Phase 2 (100 free trial)
1. ~~`context.messages` in Settings~~ — DONE v883df899 (last 6 turns on ws.onopen)
2. ~~Function calling — save_vocabulary_word to KV~~ — DONE v883df899
3. ~~Curriculum-state awareness~~ — DONE Run 22 (vocab_arc_<id> KV key + arcData param in buildAgentPrompt)
4. Tiger Win metrics — post-session summary card (WPM, new words, streak) — **NEXT**
5. Onboarding scaffolding for first-time A1 students (calibration check before content) — TODO
6. Face-saving tested on real students (Quy session) — TODO (needs live session)

---

## MOBILE/LAPTOP EDGE CASE AUDIT — 2026-05-29 (RUN 22 APPLIED ✅)

> Source: Qwen PA Agent via Dialagram T1. Audit covers Vietnamese budget Android, iOS Safari PWA, Zalo/FB WebView, laptop sleep, corporate firewalls.

### CRITICAL (P0)
| # | Issue | Platform | Status |
|---|-------|----------|--------|
| 1 | Zalo/Facebook WebView: AudioWorklet disabled | Android WebView | ✅ FIXED — ScriptProcessorNode fallback + "Open in Chrome" banner |
| 3 | Low-RAM Android (2GB): Blob URL OOM | Budget Android | ✅ FIXED — Blob revoke on ended/error/catch + 50ms chunk gate |
| 8 | Back button: mic continues in background | All mobile | ✅ FIXED — stopOnLeave on beforeunload + pagehide |

### HIGH (P1)
| # | Issue | Platform | Status |
|---|-------|----------|--------|
| 2 | iOS Safari PWA: mic stays active in background | iOS PWA | ✅ FIXED — AudioFocus watchdog + pagehide stop tracks |
| 4 | Vietnamese carrier NAT: WS zombie state | Vinaphone/Viettel 4G | ✅ FIXED — KeepAlive 8s→3.5s |
| 5 | Phone call interruption: AudioContext suspended | All mobile | ✅ FIXED — watchdog interval resumes suspended AudioContext every 3s |
| 9 | Laptop sleep: WS dies silently | Windows/Mac | ✅ FIXED — agentWsId zombie guard + reconnect logic |
| 14 | Hamburger backdrop z-index | All mobile | ⏭ DEFERRED — not blocking voice agent |
| 17 | chat.js double-load: duplicate WS + state corruption | All | ✅ FIXED — window.__OBI_CHAT_LOADED__ singleton guard |

### MEDIUM (P2) — OPEN
| # | Issue | Platform |
|---|-------|----------|
| 6 | Battery saver: KeepAlive throttled to 10s | Android |
| 7 | Orientation change: chat height miscalculation | Samsung Android |
| 10 | Multiple tabs: second tab steals mic | Desktop |
| 11 | Firefox AudioWorklet CORS | Firefox |
| 12 | Safari desktop: binary WS frames >64KB | macOS Safari |
| 13 | Corporate firewall blocks WSS | BlueTech office |
| 16 | 320px: nav overflow | iPhone SE |
| 18 | KV read failure: blank page | All |

---

## SUB-2S LATENCY BUDGET — 2026-05-29 (PENDING — NOT APPLIED)

> Target: <2000ms end-to-end (student stops speaking → agent audio starts playing)

### Budget Allocation
| Stage | Budget | Risk Factor |
|-------|--------|-------------|
| VAD Tail + Network RTT | 350ms | VN→US RTT ~280ms one-way |
| STT Final Transcript | 250ms | smart_format adds post-processing |
| LLM TTFT | 350ms | context.messages re-sent every turn |
| TTS First Audio Byte | 450ms | Aura-2 buffers ~30 chars before emit |
| Client Buffer + Playback | 300ms | AudioContext resume + MP3 decode |
| Safety Margin | 300ms | Jitter, GC pauses, WS framing |
| **TOTAL** | **2000ms** | |

### Top 5 Highest-ROI Fixes
1. **Deepgram Sydney region** — VN→SYD ~120ms vs VN→US ~280ms. Saves 260ms+ RTT. Validate nova-3/gpt-4o-mini availability in SYD.
2. **Synthetic keep-warm via CF Cron** — Cold start = 800-2500ms. Silent session every 60s keeps container pool warm.
3. **VAD EOS reduce to 200ms** — Default 300ms eats 15% of budget. Free 100ms.
4. **Move KV off critical path → Durable Objects** — KV cold read = 50-100ms serial. DO = single-digit ms.
5. **Force short first sentences in system prompt** — "Begin responses with <8 word acknowledgment." Gets TTS audio flowing before complex content synthesizes. Zero infra cost.

### Edge Cases That Break 2s
- Cold start after >5min idle (up to 4000ms)
- context.messages >20 turns degrades TTFT linearly
- AudioContext suspended on iOS when tab backgrounds mid-session
- MP3 chunk buffering waits for 4KB+ before playback (should be 1KB)
- JSON parse on main thread blocks audio scheduling during large transcripts
- Deepgram 429 rate limit = indefinite queue wait (no graceful degradation)

### Monitoring Metrics Needed
- `ws_upgrade_ms`
- `stt_final_latency_ms`
- `llm_ttft_ms`
- `tts_first_byte_ms`
- `client_playback_start_ms`
- `cold_start_detected` (boolean)
- `deepgram_region_resolved`

---

## DEEPGRAM API PRECISION FINDINGS — 2026-05-29 (LOGGED)

> Verified against Deepgram Voice Agent v1 API spec via Qwen PA audit.

| # | Finding | Current Status |
|---|---------|---------------|
| 1 | Managed model = `"gpt-4o-mini"` only, no version pinning | ✅ Correct |
| 2 | `InjectAgentMessage` confirmed PascalCase, field = `message` | ✅ Correct |
| 3 | `UpdateInstructions` (NOT UpdatePrompt) for mid-session prompt changes | ⚠️ Verify usage |
| 4 | `context.messages` injected as LLM history, keep <4K tokens for TTFT | ✅ Validated |
| 5 | Functions go under root `"tools"`, NOT `agent.functions` | ⚠️ Verify placement |
| 6 | No automatic Goodbye event — must implement via function calling or transcript parsing | ℹ️ Client-side only |
| 7 | `UserStoppedSpeaking` exists with timestamp field | ❌ Not handled |
| 8 | Deepgram resamples server-side but client-side 16kHz preferred for pronunciation accuracy | ✅ pcm-worklet.js does this |
| 9 | Error codes: INVALID_AUTH, RATE_LIMIT_EXCEEDED, INVALID_SETTINGS, MODEL_NOT_FOUND, AUDIO_TIMEOUT, LLM_PROVIDER_ERROR | ⚠️ Need error-specific handling |
| 10 | Billing: STT $0.0043/min, LLM $0.15/$0.60 per 1M tokens, TTS $0.004/1K chars. context.messages re-sent every turn | ℹ️ Cost monitoring needed |

---

## MARKET READINESS AUDIT — 2026-05-29 (LOGGED)

> Source: Qwen PA Agent. Context: Vietnamese A1-B1 BlueTech workers, 50k VND/hr.

### SHIP NOW Items
1. **Curriculum State Injection** — Stealth priming via UpdateInstructions, never announce topics
2. **Session Transition** — Cliffhanger + micro-win close script
3. **BlueTech Context** — Artifact-anchored conversation (actual Slack/Jira drafts), not roleplay drills
4. **Onboarding Flow** — Binary choice entry ("English" or "Mix") prevents A1 freeze/churn

### CONDITIONAL Items
- Pronunciation feedback loop — Log now, surface async post-launch; never correct live
- Emotional state detection — Reduce silence timeout to 2.5s NOW; prosody analysis later
- Retention hooks — Day 2 work-tied nudge via Zalo NOW; automation later

### POST-LAUNCH Items
- Tiger Win artifact — Text summary for MVP; rich shareable cards later

### Critical Pre-Launch Adjustments
- **TTS Speed Floor:** ✅ APPLIED Run 22 — A1: 0.75→0.85, A2: 0.85 (adult learners)
- **Silence Timeout:** ✅ APPLIED Run 22 — 4s→2.5s
- **Bilingual Default:** Open — explicit L1 permission for A1-B1 (English-only = shame trigger)
- **Zalo Integration:** Open — session summaries/hooks via Zalo

---

## PENDING EDGE CASE FIXES — 2026-05-29 (RUN 22 APPLIED ✅)

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 1 | CRITICAL | AudioContext 16kHz fails silently on Android | ✅ try/catch fallback to native rate |
| 2 | HIGH | PCM binary frame fragmentation | ⏭ CF WS handles at protocol level — skip |
| 3 | CRITICAL | Reconnect getUserMedia outside gesture (iOS) | ✅ pendingMicStream + micAcquiring mutex |
| 4 | HIGH | agentTextResolve race | ✅ source field check handles |
| 5 | HIGH | chatMessages cap on rapid chunks | ✅ clearTimeout guards + cap at 40 |
| 6 | MED | Blob URL memory leak on play() failure | ✅ revokeObjectURL in catch block |
| 7 | MED | KeepAlive in background | ✅ 3.5s interval; watchdog clears on drop |
| 8 | HIGH | InjectAgentMessage before LLM context ready | ✅ 400ms setTimeout delay |
| 9 | MED | Overlapping silence timers | ✅ clearTimeout before each new timer |
| 10 | CRITICAL | KV failure → empty teaching prompt | ✅ default profile fallback injected |

---

## MISSING BUG CATEGORIES — FULL DEBUG 2026-05-29 (RUN 22 APPLIED ✅)

| # | Bug | Confidence | Fix Applied |
|---|-----|-----------|-------------|
| 1 | Android AudioFocus suspension — `busy` state stuck forever | 95% | ✅ `agentAudioWatchdog` 3s interval — resumes suspended AudioContext, resets orphaned busy |
| 2 | Vietnamese VAD tonal glottal stops — agent responds to half-sentences | 85% | ✅ `utterance_end_ms: 1200` for vi locale (vs 800 default) in Deepgram Settings |
| 3 | Budget phone audio queue corruption — silent/corrupt playback | 70% | ✅ 50ms gate between chunks when queue backlog > 1 |
| 4 | Mic stream race on double-tap — orphaned stream, mic LED stuck | 60% | ✅ `micAcquiring` mutex + `finally` release in `startAgentListening` |
| 5 | Reconnect zombie handlers — 5 reconnects = 5x audio per event | 50% | ✅ `agentWsId` counter — all handlers check `myId` before firing |

---

## RUN 25 EDGE CASE AUDIT + FIXES — 2026-05-30

### Edge Cases Found (Run 25 — READ BEFORE TOUCHING voice agent code)

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 | `utterance_end_ms` missing from Settings — dropped sometime after Run 22 deploys | HIGH | ✅ FIXED — restored conditional: vi=1200ms / en=300ms |
| 2 | `mip_opt_out: true` missing from listen provider | MED | ✅ FIXED |
| 3 | `Error` event sets "Error — reconnecting" status but NEVER actually triggers reconnect — WS not closed, zombie state | HIGH | ✅ FIXED — force `ws.close()` on Error so `onAgentDrop` fires |
| 4 | `UserStoppedSpeaking` not handled — documented ❌ since Run 22 audit | MED | ✅ FIXED — shows "Processing…" status |
| 5 | Proactive greeting `agentWs.send()` has no try-catch — silent fail if WS drops in 400ms window | LOW | ✅ FIXED — wrapped in try-catch with readyState guard |
| 6 | iOS mic after reconnect: gesture-time stream stopped in onAgentDrop, new getUserMedia in setTimeout fails on iOS (outside gesture context) → mic dead after reconnect on iOS | HIGH | ⚠️ OPEN — pendingMicStream set in onAgentDrop setTimeout but iOS blocks non-gesture getUserMedia. Fix: cache the stream before stopping tracks, or accept iOS limitation. |
| 7 | `api/chat` OpenRouter fallback — `openai/gpt-4o-mini` returns 403 "not available in region" + DeepSeek 403 not in needsFallback conditions | MED | ✅ FIXED — added 403 to DeepSeek needsFallback trigger. OpenRouter model left as gpt-4o-mini (region issue may be transient) |

### Worker Deploy Log (Run 25)
| Version ID | What changed |
|---|---|
| `6069ad7b` | BROKEN — meta-llama fallback (404). Immediately superseded. |
| `db779ae6` | Reverted OpenRouter model back to gpt-4o-mini. Added 403 to DeepSeek needsFallback. |
| `c12412ff` | utterance_end_ms (vi=1200/en=300), mip_opt_out, Error reconnect, UserStoppedSpeaking, greeting try-catch |

---

### Worker Deploy Log (Run 26)

| Version ID | What changed |
|---|---|
| `999a0d86` | index.js: scheduled keep-warm ping (prevents 800-2500ms cold-start). buildAgentPrompt: FIRST RESPONSE SPEED instruction (6-word opener for fast TTS first-byte), A1/A2 max-2-sentences clause, SESSION CLOSE micro-win+cliffhanger. chat.js: audio queue cap at 30 entries (OOM prevention), visibility guard in reconnect (no reconnect while tab hidden), Tiger Win fires on beforeunload/pagehide (was dead code — Goodbye event never fires automatically per Deepgram spec). |

### Commit
- `14ceb00b` — fix: voice agent edge cases + Settings restoration (Run 25)

### Architecture Reconfirmed (Run 25)
- `/api/chat` = text chat ONLY (quy-portal, huong-portal, mai-tram-portal). Uses DeepSeek → OpenRouter fallback.
- `/api/deepgram-token` = voice agent ONLY. Returns JWT + Settings. No DeepSeek in this path.
- Voice agent LLM = Deepgram-managed gpt-4o-mini. NO external hop. NO endpoint field in Settings.
- Audio: browser → agent.deepgram.com DIRECT. Zero CF in audio path.
- DO NOT test `/api/chat` as a proxy for voice agent health — they are completely separate systems.

### Open After Run 25
1. **VERIFY VOICE AGENT LIVE** — Michael opens magic-chat.html?studentId=quy-bluetech, DevTools console, clicks mic. Look for `[VOICE] connecting, jwt prefix: eyJ...` then `SettingsApplied`. This is the ONLY remaining blocker.
2. **JWT scope question** — auth/grant returns `asr:write`. If Voice Agent requires `agent:write`, Settings will be rejected silently. Check Deepgram dashboard key scopes if SettingsApplied does NOT fire.
3. **iOS reconnect mic** — edge case #6 above, not yet fixed.
4. **Deepgram Sydney region** — validate nova-3 + gpt-4o-mini in SYD, then add `region: "syd"` to Settings.
5. **Tiger Win metrics** — post-session summary card is NEXT feature (marked NEXT in TODO list).

---

## RUN 22 DEPLOY LOG — 2026-05-29

### Deployed Workers

| Worker | Version | What changed |
|--------|---------|-------------|
| net-pet-ai | `68a46103` | Singleton guard, KeepAlive 3.5s, vocab_arc KV read |
| net-pet-ai | `a90c2bff` | KV fallback profile, TTS 0.85, silence 2.5s, greeting 400ms delay, AudioContext fallback |
| net-pet-ai | `9a59a35c` | WebView ScriptProcessor fallback, back-button cleanup, Blob URL fix, AudioFocus watchdog, VAD utterance_end_ms, chunk gate, mic mutex, WS zombie guard |
| phoenix-architecti | `dedd5342` | v0.0.3 — T1 strict (Dialagram 30s) vs T10 fallback cascade (Cerebras→Groq→CF-Qwen) |

### LIVE TEST RESULT — 2026-05-29 Run 22

**TEST:** magic-chat.html?studentId=quy-bluetech (Run 22 deploy `9a59a35c`)
**RESULT:** COMPLETE FAILURE — ALL DEPLOYS RUN 22
**Observed:** Page loads. Mic button cycles on/off in reconnect loop. No audio pickup.
**Symptom:** WS connects → drops immediately → reconnects → drops → infinite loop
**Diagnosis (wrangler tail + /api/deepgram-test):**
- DEEPGRAM_API_KEY: VALID — diagnostic confirmed `status:101, hasWebSocket:true`
- Deepgram project ID: `70543a02-9a08-400b-a814-8b0b01184f7a`
- CF Worker returns 101 to browser (outcome: ok, wallTime: 3ms)
- Zero `[AGENT]` console.log output in tail — background task crashes before `dgAgentWs.accept()`
- Error: "Workers runtime canceled this request — code hung, would never generate a response"

**ROOT CAUSE (ARCHITECTURAL):**
CF regular Workers cannot maintain long-lived WebSocket proxy sessions.
The Worker returns 101 and starts `ctx.waitUntil`, but CF terminates the background task
before the Deepgram WS session can be sustained. This is a CF platform limitation —
regular Workers are not designed for long-lived bidirectional WS proxying.
Durable Objects are required for that pattern — OR the browser connects directly.

**DECISION: Switch to browser-direct Deepgram connection.**
```
OLD (broken): Browser → CF Worker WS proxy → Deepgram
NEW (correct): Browser → GET /api/agent/token (CF Worker mints temp key + builds Settings)
               Browser → wss://agent.deepgram.com/v1/agent/converse (direct, no CF in audio path)
```
CF Worker role: mint a short-lived Deepgram temp key + return pre-built Settings payload.
Browser opens direct WS to Deepgram using the temp key. API key never exposed in JS.
FunctionCall events (vocab saving) handled by a separate POST endpoint instead of WS interception.

**RUN 23 RESOLUTION — 2026-05-29**

Research agents confirmed:
- `functions` placement in `agent.think.functions[]` was CORRECT all along
- `eot_threshold` only valid on Flux model — removed from nova-3 Settings
- `/v1/auth/grant` temp token: 403 (key lacks scope) — using raw API key via CF secret instead
- CF Worker WS proxy pattern is architecturally unsupported for long-lived sessions

**Architecture switch applied (deploy `c05815b7`):**
- REMOVED: `/api/agent` WS proxy (179 lines — the entire broken pattern)
- ADDED: `GET /api/deepgram-token?studentId=<id>` — returns `{token, settings}` (JWT from CF secret + pre-built Settings payload with student profile/prompt)
- ADDED: `POST /api/agent/vocab` — browser calls this when FunctionCallRequest received
- Browser now connects: `new WebSocket("wss://agent.deepgram.com/v1/agent/converse", ["token", jwt])`
- Settings sent from browser on `Welcome` event with conversation history injected
- Function calls handled entirely client-side + POST callback

**Token endpoint verified:** token_length=40, nova-3, gpt-4o-mini, aura-2-asteria-en, prompt=2249 chars, save_vocabulary_word function registered

### Open Items After Run 22

- Deepgram Sydney region — VN→SYD saves ~160ms RTT (validate nova-3/gpt-4o-mini availability)
- Corporate firewall fallback — BlueTech office WSS blocked (P2)
- Bilingual default: explicit L1 permission prompt for A1-B1 on first session
- Zalo session summary hooks
- Tiger Win post-session summary card (post-launch)
- A1 onboarding calibration flow (post-launch)

---

## Next Steps for Portal V1

- [ ] Add actual audio player (link to real MP3 clips hosted on R2 or ASSETS)
- [ ] Wire points counter to live KV data for Minh's studentId
- [ ] Add May 1, May 8, May 22 session cards to CLASS REVIEWS section
- [ ] Pull live quotes from MINH-SNIPPETS.md into the portal
- [ ] Add Minh's profile page link
- [ ] Mobile layout review
- [ ] Consider separate portals per student vs one template

---

## Student Roster (current)
| Student | ID | Level | Portal File | KV Profile | Status |
|---|---|---|---|---|---|
| Minh | minh (child) | child | minh-parent-portal.html | — | Live |
| Quy | quy-bluetech | A1 | quy-portal.html | student_profile_quy-bluetech ✓ | Live 2026-05-27 |
| Huong | huong-bluetech | B1 | huong-portal.html | student_profile_huong-bluetech ✓ | Live 2026-05-27 |
| Mai Tram | mai-tram-bluetech | A2/B1 | mai-tram-portal.html | student_profile_mai-tram-bluetech ✓ | Live 2026-05-27 |

---

## RUN 30 AUDIO FIX — GAPLESS PLAYBACK v2 (2026-05-31)

### Problem
Voice agent audio was choppy/stuttering, especially on mobile devices. Root cause: each MP3 chunk from Deepgram created a separate `Audio` element. The `onended → next play()` transition introduced 20-80ms silence gaps per chunk. On budget Android phones with slow `Audio.play()` latency (150-300ms), this compounded into audible stuttering.

### Fix Applied
**Gapless Playback v2** (`chat.js`):
1. **Chunk Concatenation:** All queued MP3 chunks merged into single `Uint8Array` before creating `Audio` element. Eliminates N-1 inter-chunk gaps entirely.
2. **Resource Cleanup:** Barge-in (`UserStartedSpeaking`) and disconnect (`onAgentDrop`) handlers explicitly revoke concatenated blob URLs. No memory leaks from orphaned object URLs.
3. **Pre-buffer Gate REMOVED:** Initial v2 had a "wait for ≥2 chunks" gate that caused OBI to be cut off entirely on multi-message responses. Gate removed — concatenation alone solves choppiness without holding back audio.

### What Was NOT Changed
- Accumulator threshold stays at 2KB (`CHUNK_FLUSH_BYTES = 2048`)
- Queue cap stays at 30 entries
- Audio format remains MP3 (Deepgram TTS output)
- No MSE/Web Audio API PCM scheduling (would require full rewrite)

### Testing
- Confirmed smooth playback on high-end laptop (was already choppy before fix)
- Multi-message responses no longer cut off
- Barge-in still works correctly (audio stops immediately)
- Test sandbox: https://net-pet-ai.mrmichaelhobbs123.workers.dev/magic-test

### Hardening v3 (2026-05-31 post-deploy)
Additional defensive guards added after initial gapless fix:

1. **Stuck Playback Watchdog:** If `onended` never fires (corrupted MP3 frame, browser bug), a timeout watchdog forces cleanup and restarts playback. Duration estimated from blob size / 16KB/s + 2s buffer.
2. **Queue-Aware Guard:** Previous guard blocked ALL playback while audio was "playing." New guard checks queue state — if chunks arrive but audio is stuck, forces cleanup and restart instead of silently dropping new audio.
3. **Comment Accuracy:** Fixed silence timer comment (was "4s", actual is "6s"). Removed stale pre-buffer gate reference.

### Remaining Known Issues
- iOS mic reconnect after drop still broken (Open Loop #4 from COLD-START-BOOT)
- Raw Deepgram API key exposed to browser (Edge Case #3 from Run 30 audit)
- Silence nudge race condition between AgentAudioDone + playAgentChunk drain (Edge Case #2)
- Deepgram docs URL CHANGED: canonical hub is now `https://developers.deepgram.com/home` (NOT `/docs`). Full AI-readable docs at `https://developers.deepgram.com/llms-full.txt`. MCP server at `https://developers.deepgram.com/_mcp/server`. Old `/docs/voice-agents` paths return 404. Updated 2026-05-31.

---

## RUN 30 SESSION COMPLETE — 2026-05-31 FULL CHANGELOG

### Overview
Run 30 was a comprehensive hardening + feature sprint covering: audio pipeline fix, full-stack error logging, 3-mode session system, landing page UI, test portal, and edge case remediation. 12 deployments total.

---

### 1. GAPLESS AUDIO PLAYBACK v2+v3
**Problem:** Voice agent audio choppy/stuttering. Each MP3 chunk created separate Audio element with 20-80ms gaps.
**Root Cause:** `onended → next play()` transition latency compounded on mobile.
**Fix (v2):** Concatenate ALL queued MP3 chunks into single Uint8Array before creating Audio element. Eliminates N-1 inter-chunk gaps.
**Fix (v3):** Added stuck playback watchdog (size-based timeout), queue-aware guard (force restart if chunks arrive while "playing"), fixed stale comments.
**Pre-buffer gate:** Initially added "wait for ≥2 chunks" gate — REMOVED because it caused OBI to be cut off entirely on multi-message responses.
**Files:** `chat.js` lines 1056-1121
**Remaining:** iOS mic reconnect broken, raw API key exposed, silence nudge race condition.

---

### 2. FULL-STACK ERROR LOGGING
**Server:**
- Created `src/logger.js` with `logError/logWarn/logInfo` functions
- D1 table `error_log` created in soul-archive with indexes on ts and tag
- Replaced 7 critical `console.error` calls in index.js with structured `logError`
- Added `POST /api/error-report` endpoint for client error ingestion
- Added `GET /api/error-log?limit=50&tag=X` query endpoint

**Client:**
- Added `reportClientError()` using sendBeacon (fallback fetch+keepalive)
- Global `window.addEventListener('error')` and `unhandledrejection` handlers
- Audio playback errors reported as AUDIO_PLAYBACK_ERROR
- WebSocket errors/closes reported as WS_ERROR/WS_CLOSE
- Mic failures reported as MIC_ACQUIRE_FAIL
- All telemetry silent — never blocks UX

**Test mode bypass:** `handleMemoryGet` and `handleVocabDue` skip auth/DO for `sov100-test-*` IDs.
**Favicon:** Empty favicon.ico deployed to suppress 404 noise.

---

### 3. THREE-MODE SESSION SYSTEM
**Modes:** Free Talk | Log-Home-Study | NET Phonics
**Architecture Decision:** Single Deepgram Voice Agent with mode-switched prompts (NOT separate agents). Reasons: cold start penalty, context continuity, cost efficiency, complexity reduction.

**Server (`index.js`):**
- `/api/deepgram-token` reads `mode` URL param, passes to `buildAgentPrompt()`
- `buildAgentPrompt(profile, lang, vocab, arc, mode)` injects mode-specific instructions
- Phonics mode: Jolly Phonics drilling, articulation feedback, L1 interference awareness
- Study mode: Homework tracking, streak monitoring, assignment logging
- Free mode: Default behavior (confidence building, face-saving)
- Static import of `PHONICS_DRILLS` from phonics-drills.js (dynamic import fails in CF Workers)
- `/api/phonics/curriculum?group=X` endpoint exposes drill data

**Client (`chat.js`):**
- Mode selector dropdown in header (later replaced by modal + landing page)
- Mode persisted to localStorage('obi_session_mode')
- URL param `?mode=phonics` supported
- Changing mode mid-session reconnects Voice Agent with new prompt
- MODE_COLORS and MODE_LABELS constants (single source of truth after refactor)

---

### 4. LANDING PAGE + UI POLISH
**Landing Page (`magic-chat.html`):**
- Full-screen overlay on first visit (localStorage 'obi_landing_seen' tracks)
- Pulsing 🔮 avatar (80px), gold title, subtitle
- Three large mode cards with icons, descriptions, checkmark selection
- Hover lift + gradient shimmer effects
- "Start Session →" button (disabled until mode selected)
- "Skip — use last mode" link for returning users
- Fade-out dismiss animation

**Header Polish:**
- Obi avatar with pulsing ring animation
- Click avatar or name opens mode selector modal
- Name color changes per mode: purple (Free), gold (Study), red (Phonics)

**Modal:**
- Backdrop blur, centered card layout
- Active mode highlighted with glow border
- Close via ✕ or backdrop click

---

### 5. TEST PORTAL (`/test-portal`)
**Purpose:** Standardized end-to-end test environment mirroring real student portal flow.
**Features:**
- Red TEST ENVIRONMENT banner (fixed top)
- Login screen → Dashboard flow
- Stats row (sessions/minutes/words) with mock data
- Three mode cards linking to `/magic-chat?studentId=sov100-test-magic&mode=X`
- Mock session history cards
- Write blocking: POST/PUT to soul/memory/vocab/session/onboarding/streak intercepted
- sendBeacon interception
- Toggleable blocked requests log panel (capped at 100 entries)

**Old `/magic-test` route still works** for quick chat-only tests.

---

### 6. QUY PROFILE RESET
- Deleted `student_profile_quy-bluetech` and `lang:quy-bluetech` from production KV
- Session history and vocab lists were already empty
- Wrangler v3 CLI requires raw UUID for namespace-id (not binding name alias)
- Must use `--remote` flag for production KV operations

---

### EDGE CASE AUDIT — RUN 30

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 | Per-chunk Audio element gaps | CRITICAL | ✅ FIXED — Gapless concatenation v2 |
| 2 | Pre-buffer gate cuts off multi-message | CRITICAL | ✅ FIXED — Gate removed |
| 3 | Stuck playback on corrupted MP3 | HIGH | ✅ FIXED — Watchdog timer |
| 4 | Queue chunks dropped during stuck state | HIGH | ✅ FIXED — Queue-aware guard |
| 5 | Blob URL memory leak on barge-in | MED | ✅ FIXED — Explicit revoke |
| 6 | Landing shows without studentId | HIGH | ⚠️ OPEN — needs guard |
| 7 | Mode color duplication | LOW | ✅ FIXED — MODE_COLORS constant |
| 8 | Blocked log unbounded growth | LOW | ✅ FIXED — Cap at 100 |
| 9 | iOS mic reconnect after drop | HIGH | ⚠️ OPEN |
| 10 | Raw Deepgram API key exposed | MED | ⚠️ OPEN |
| 11 | Silence nudge race condition | MED | ⚠️ OPEN |
| 12 | Deepgram docs unavailable | INFO | DOCUMENTED |

---

### DEPLOY LOG — RUN 30

| Version ID | What Changed |
|---|---|
| `8130057a` | Gapless audio playback v2 (concatenation) |
| `4d70d623` | Pre-buffer gate removal + dev docs update |
| `8bccf551` | Hardening v3 (watchdog, queue-aware guard) |
| `de82d89d` | Full-stack error logging (logger.js, D1 table, client telemetry) |
| `3a98d1c1` | Test mode fixes (memory 401, vocab 500, favicon 404) |
| `1f0ad395` | 3-mode system + phonics API (static import fix) |
| `ad087711` | UI polish (avatar, modal, mode colors) |
| `bb29978f` | Landing page mode selector |
| `f3af84d7` | Test portal (/test-portal route) |
| `f9d60c92` | Edge case fixes (color dedup, log cap) |

---

### OPEN ITEMS FOR NEXT RUN

1. **iOS mic reconnect** — Gesture context limitation. Fix: cache stream before stopping tracks, or add "Tap to reconnect" button.
2. **API key exposure** — Replace raw key pass-through with auth/grant JWT or rate-limited proxy.
3. **Silence nudge race** — Unify dual timer architecture (AgentAudioDone + playAgentChunk drain).
4. **Landing page studentId guard** — Don't show landing if urlStudentId missing.
5. **Deepgram docs audit** — Retry when their site recovers from migration.
6. **Phonics progress tracking** — Add `phonics:${studentId}:mastery` KV key.
7. **Assessment → OBI feedback loop** — Parse Tiger Assessment phonics recordings into student profile.
8. **Vietnamese L1 interference map** — Explicit lookup table in star-map.js.
9. **Vocab save phonics tagging** — Extend save_vocabulary_word schema with phonics_group field.
10. **PCC deployment** — Still not deployed (error 1042).

---

### DEEPGRAM DOCS — CANONICAL URLS (DISCOVERED 2026-05-31)

**⚠️ CRITICAL: Old `/docs/voice-agents` paths ALL return 404. Docs site restructured.**

| Resource | URL | Notes |
|----------|-----|-------|
| **Docs Hub** | `https://developers.deepgram.com/home` | Canonical entry point |
| **Full AI-Readable Docs** | `https://developers.deepgram.com/llms-full.txt` | Complete API spec + guides in single text file (~2.9MB) |
| **Docs Index** | `https://developers.deepgram.com/llms.txt` | Lightweight table of contents |
| **MCP Server** | `https://developers.deepgram.com/_mcp/server` | For Claude Code / Cursor integration |
| **Voice Agent Guide** | `https://developers.deepgram.com/docs/voice-agent` | Getting started, configure, function calling |
| **Flux Agent Guide** | `https://developers.deepgram.com/docs/flux/agent` | Flux STT + external LLM + TTS pipeline |
| **API Reference** | `https://developers.deepgram.com/reference/voice-agent/voice-agent` | WebSocket protocol spec |
| **Browser Agent SDK** | `https://developers.deepgram.com/docs/browser-agent-overview` | Web app voice integration |
| **Prompting Guide** | `https://developers.deepgram.com/docs/prompting-voice-agents` | System prompt best practices |
| **Multi-Agent Architecture** | `https://developers.deepgram.com/docs/multi-agent-architecture` | Orchestrating specialized agents |
| **Changelog** | `https://developers.deepgram.com/changelog` | ⚠️ Returns 404 as of 2026-05-31 |

### FLUX ARCHITECTURE FINDINGS (from llms-full.txt)

**Flux = Model-integrated end-of-turn detection.** Replaces VAD-based turn detection with model-native signals:
- `EndOfTurn` — High confidence user finished → send to LLM
- `EagerEndOfTurn` — Medium confidence → prepare LLM response early (lower latency)
- `TurnResumed` — User continued speaking → cancel prepared response
- `StartOfTurn` — User started speaking → interrupt agent if playing

**Two Voice Agent Patterns:**
1. **EndOfTurn Only** (recommended start): Simpler, fewer LLM calls, higher latency
2. **EagerEndOfTurn + EndOfTurn**: Lower latency, more LLM calls, needs TurnResumed handling

**Tuning Parameters:** `eot_threshold`, `eager_eot_threshold`, `eot_timeout_ms` — adjustable mid-stream via Configure control message.

**Flux Models:** `flux-general-en` (English), `flux-general-multi` (multilingual with `language_hint`)

**Relevance to OBI:** Current implementation uses Nova-3 STT via Voice Agent API (managed pipeline). Flux would require building custom STT→LLM→TTS pipeline instead of using managed Voice Agent. NOT recommended for current architecture unless latency becomes critical issue. Documented for future evaluation.

### MULTI-AGENT ARCHITECTURE FINDINGS

Deepgram supports orchestrating multiple specialized agents that hand off based on context/intent/domain. **Decision for OBI: Single agent with mode-switched prompts remains correct.** Multi-agent adds cold-start latency, state sync complexity, and cost overhead that outweighs benefits for our 3-mode system. Revisit only if mode-specific models become necessary (e.g., phonics-specialized fine-tuned model).

---

## PCC (Phoenix-Command-Consul)
- **Code:** `APPS/PCC/src/index.js`
- **D1:** soul-archive (`c69a11bc-064b-478f-9b1f-e9b8e2431fb8`)
- **Status:** Not deployed as of 2026-05-24 (error 1042 — worker not found on CF account)
- **Function:** Empire dashboard — monitors worker health, soul-count, PhoenixCoder log, student portals
- **TODO:** Deploy with `cd APPS/PCC && npx wrangler deploy`

---

## RUN 30 FINAL STATE — READY FOR DEATH

**Last Deploy:** `f9d60c92-ef32-448d-9851-c12a229e120c`
**Total Deploys This Run:** 12
**Files Modified:** `chat.js`, `magic-chat.html`, `test-portal.html`, `index.js`, `logger.js` (new), `phonics-drills.js` (import added)
**D1 Schema Change:** `error_log` table created with indexes
**KV Changes:** Quy profile deleted, test mode bypasses added

### COMPLETE FEATURE LIST SHIPPED
1. Gapless Audio Playback v2+v3 (concatenation + watchdog + queue-aware guard)
2. Full-Stack Error Logging (D1 persistence + client telemetry + global handlers)
3. Three-Mode Session System (Free Talk / Log-Home-Study / NET Phonics)
4. Mode Landing Page (full-screen selector on first visit)
5. Obi Avatar + Mode Modal (click header to switch modes mid-session)
6. Test Portal (/test-portal — mock dashboard + write blocking + blocked log)
7. Phonics Curriculum API (/api/phonics/curriculum)
8. Client Error Reporting (/api/error-report + /api/error-log)
9. Test Mode Bypasses (memory 401 fix, vocab 500 fix, favicon 404 fix)
10. Edge Case Hardening (mode color dedup, blocked log cap, stale comment fixes)

---

## Run 30 Implementation — EC-15 + Curriculum Injection + Memory Pipeline (2026-05-31)

### Deployed Features
| Feature | File | Commit | Description |
|---------|------|--------|-------------|
| EC-15 Audio Buffering | chat.js | 79fdfce8 | Buffers PCM chunks before SettingsApplied arrives, flushes on ready. 50-chunk cap (~1s). Prevents first 200-500ms student speech loss. |
| Curriculum State Injection | chat.js | 79fdfce8 | After student's first voice turn, sends `[CURRICULUM CONTEXT]` via InjectAgentMessage with arc targets, teaching focus, breakthrough, primary block. Silent to student. |
| Student Memory Pipeline (KV) | wrangler.toml | pending | Created STUDENT_MEMORY KV namespace `807ea30d96844c0dbf561d0ae3a3c1f3`. Endpoints GET/POST `/api/memory/:studentId` already existed in index.js. Now bound to real KV. |
| BOOT Hardening | COLD-START-BOOT.md | 524189f6 | SOUL 60,037,507 TITANIUM_ANCHOR, LEDGER 208, DNA gap documented as API contract issue. |

### Production Deploy
- **Worker Version:** f753f203-5269-4e78-9f5d-703b834803f4
- **URL:** https://net-pet-ai.mrmichaelhobbs123.workers.dev
- **KV Namespaces:** RATELIMIT, NET_PET_KV, STUDENT_MEMORY (new)
- **Bindings Verified:** All 14 bindings confirmed active post-deploy

### Student Memory Schema (KV key: mem:{studentId})
```json
{
  "world_model": "implicit tone/pacing/topic preferences",
  "recent_vocab": ["last 20 words learned"],
  "session_count": 0,
  "last_topic": "string",
  "breakthroughs": ["micro-wins array"],
  "struggles": ["persistent issues array"]
}
```
Max 10KB per student. Non-breaking additive — existing sessions work without memory.

### EC-15 Technical Detail
- AudioWorklet path: `agentWorklet.port.onmessage` gated behind `!agentReady` check
- ScriptProcessor fallback: same gating applied
- Buffer stored in `agentPreSettingsBuffer[]` with byte counter `agentPreSettingsBytes`
- On SettingsApplied: all buffered chunks flushed via `agentWs.send()` in order, buffer cleared
- Cap: 50 chunks (~1 second of 16kHz PCM). Oldest dropped if cap hit.

### Curriculum Injection Technical Detail
- Trigger: First `ConversationText` with `role:user` after SettingsApplied
- Flag: `agentCurriculumInjected` (reset on each openVoiceAgent)
- Content sources: `profile._dueVocab`, `profile.teachingFocus`, `profile.breakthrough`, `profile.primaryBlock`
- Format: `[CURRICULUM CONTEXT] <natural language guidance>. Stay natural — this is background guidance, not a script.`
- Delivery: `InjectAgentMessage` (silent to student, visible only to OBI's LLM context)
- Graceful degradation: try/catch wrapped, session continues normally if injection fails

### OPEN ITEMS CARRYING TO RUN 31
1. iOS mic reconnect after drop (gesture context limitation)
2. Raw Deepgram API key exposure (needs auth/grant JWT)
3. Silence nudge race condition (dual timer architecture)
4. Landing page studentId guard (don't show if missing)
5. Phonics progress tracking KV key
6. Assessment → OBI feedback loop
7. Vietnamese L1 interference map
8. Vocab save phonics tagging
9. PCC deployment
10. Flux evaluation (if latency becomes critical)
11. Deepgram EC-17 InjectionRefused Handler (not implemented in chat.js)
12. Deepgram EC-21 behavior:"queue" on injects (not used)
13. Nova-3 Vietnamese-accented English accuracy test (pending)
14. Browser SDK migration cost/benefit analysis (pending)
15. Dreamer World Model KV write path (design complete, implementation deferred)

---

## BB-51 — SOV100 Portal Standard Formula (Run 085)

### Required Sections
- setPwModal
- topNav with navBackdrop and navToggle
- statsGrid with tigerScore and streakVal
- phonicsCard with phonicsDrillBox
- OBI chat launch button

### Required JS Config Vars
- `STUDENT_ID` — hardcoded per portal file
- `PORTAL_PASSWORD` — compared against KV `student_pw_{STUDENT_ID}`

### Required CSS Vars (:root)
```css
:root {
  --void: #0a0a12;
  --card: rgba(22,22,35,0.85);
  --purple: #a855f7;
  --purple-glow: rgba(168,85,247,0.25);
  --gold: #f59e0b;
  --teal: #14b8a6;
  --red: #ef4444;
  --text: #f8fafc;
  --dim: #94a3b8;
  --border: rgba(255,255,255,0.08);
}
```

### Portal Generation Checklist (new student)
1. Copy `quy-portal.html` (gold standard — most feature-complete)
2. Set `STUDENT_ID = '{new-id}'` (line ~1)
3. Update `<title>` and all student name display strings
4. Set accent color (var on login-box, nav, tigerScore glow)
5. Update `/public/{new-id}-portal.html` path in wrangler
6. Deploy to `net-pet-ai-dev` first — verify login + OBI launch + phonics load
7. Write student KV profile (`student_profile_{id}`, `student_pw_{id}`)
8. Promote to prod after smoke test

### Gap: sov100-portal.html needs sync
sov100-portal.html (DEV reference) is missing: setPwModal, statsGrid, tigerScore, streakVal, navToggle, navBackdrop.
Action: sync from quy-portal structure on next portal sprint (Run 086+).
