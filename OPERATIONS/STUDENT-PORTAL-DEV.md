# Student Portal Development — Session Context

Last updated: 2026-05-27

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

### Voice Agent — Low Latency Pipeline

**Architecture:** Browser PCM16 → `/api/agent` WS proxy → Deepgram Voice Agent → DeepSeek LLM → Deepgram TTS → streamed MP3 back.

**Files changed:**

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

## RUN 22 DEPLOY LOG — 2026-05-29

### Deployed Workers

| Worker | Version | What changed |
|--------|---------|-------------|
| net-pet-ai | `68a46103` | Singleton guard, KeepAlive 3.5s, vocab_arc KV read |
| net-pet-ai | `a90c2bff` | KV fallback profile, TTS 0.85, silence 2.5s, greeting 400ms delay, AudioContext fallback |
| net-pet-ai | `9a59a35c` | WebView ScriptProcessor fallback, back-button cleanup, Blob URL fix, AudioFocus watchdog, VAD utterance_end_ms, chunk gate, mic mutex, WS zombie guard |
| phoenix-architecti | `dedd5342` | v0.0.3 — T1 strict (Dialagram 30s) vs T10 fallback cascade (Cerebras→Groq→CF-Qwen) |

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

## PCC (Phoenix-Command-Consul)
- **Code:** `APPS/PCC/src/index.js`
- **D1:** soul-archive (`c69a11bc-064b-478f-9b1f-e9b8e2431fb8`)
- **Status:** Not deployed as of 2026-05-24 (error 1042 — worker not found on CF account)
- **Function:** Empire dashboard — monitors worker health, soul-count, PhoenixCoder log, student portals
- **TODO:** Deploy with `cd APPS/PCC && npx wrangler deploy`
