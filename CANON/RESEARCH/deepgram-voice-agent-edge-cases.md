# DEEPGRAM VOICE AGENT EDGE CASE RESEARCH
**Created:** 2026-05-31 11:15 ICT
**Updated:** 2026-05-31 12:45 ICT (Run 30 SuperSaiyan Deep Dive)
**Run:** ROMAN RUN 30+
**Status:** ACTIVE RESEARCH — Update each run with new findings
**Sources:** Official Docs (llms-full.txt 71K lines), GitHub SDK v5.3.0 CHANGELOG, JS SDK Issues #326-#477, Python SDK Issues #501-#719, Hacker News production reports, Browser Agent SDK reference, chat.js audit, COLD-START-BOOT.md

---

## §1 DOCUMENT PURPOSE

This is a living research document tracking Deepgram Voice Agent edge cases, protocol changes,
and implementation gaps in our OBI voice agent system. Updated across multiple runs.

**Research directive:** Search everywhere. Docs, forums, SDK source, changelogs, community posts,
Stack Overflow, Reddit, Discord transcripts, Hacker News, competitor comparisons. Leave no stone unturned.

---

## §2 CRITICAL PROTOCOL FINDINGS (OFFICIAL DOCS + SDK v5.x)

### 2.1 InjectAgentMessage FIELD NAME — RESOLVED ✓
- **ANSWER:** The correct field is `message` (NOT `content`)
- **Evidence:** OpenAPI schema (llms-full.txt line 11045-11074) defines `message` as REQUIRED
- **Reference page** (line 38680-38686) confirms `message` string required
- **Example payloads** (line 38697-38712) all use `"message"`
- **Line 32344 uses `content`** — this is a DOCUMENTATION ERROR, not the spec
- **OUR CODE IS CORRECT:** chat.js lines 916, 958, 1040 use `message` field ✓
- **NEW: `behavior` field** — optional, values `"default"` or `"queue"`
  - `default`: inject only during silence; returns InjectionRefused if turn in progress
  - `queue`: append after current ConversationText without interrupting
- **ACTION:** Add `behavior: "queue"` to vocab confirmation inject (line 916) so it doesn't get refused during agent speech

### 2.2 UpdatePrompt PROTOCOL — RESOLVED ✓
- **Method name:** `UpdatePrompt` (NOT `UpdateInstructions` — renamed in SDK v3.13.0)
- **Fields:** `{ type: "UpdatePrompt", prompt: "..." }`
- **Limit:** 25,000 chars for managed LLMs; unlimited for BYO LLMs
- **Server ack:** `PromptUpdated` event
- **Python SDK Bug #531:** UpdatePrompt requires MULTIPLE attempts before taking effect despite PromptUpdated ack
  - **IMPACT:** Our curriculum state injection feature must retry UpdatePrompt and verify via subsequent ConversationText
  - **STATUS:** Closed Feb 2026 but may still affect production

### 2.3 Error Codes — COMPLETE REGISTRY (from official docs)
**Fatal Errors (session-ending):**
| Code | Meaning | Our Exposure |
|------|---------|-------------|
| `CLIENT_MESSAGE_TIMEOUT` | Server waited too long for WS message | EC-2: Long OBI speech without binary frames |
| `INVALID_SETTINGS` | Settings parsed but values invalid | Run 25B: container/sample_rate with mp3 |
| `FAILED_TO_START_LISTENING` | STT connection failed | Transient — needs retry |
| `ASR_CONNECTION_CLOSED` | STT dropped mid-session | Needs reconnect |
| `ASR_DRIVER_TIMEOUT` | No transcript arrived | Audio format mismatch |
| `USER_AUDIO_FORMAT` | Audio doesn't match declared format | Encoding/sample_rate mismatch |
| `FAILED_TO_SPEAK` | TTS exhausted all retries/fallbacks | NO FALLBACK CONFIGURED — EC-12 |
| `FAILED_TO_THINK` | LLM exhausted all retries/fallbacks | NO FALLBACK CONFIGURED |
| `SERVER_GOING_AWAY` | Server maintenance shutdown | Reconnect needed |
| `NON_EXISTENT_FUNCTION_CALLED` | Function not registered | Vocab save function name mismatch |
| `SETTINGS_ALREADY_APPLIED` | Duplicate Settings message | Our Welcome handler sends once — OK |
| `NON_SETTINGS_MESSAGE_BEFORE_SETTINGS` | Message before Settings | Our onopen waits for Welcome — OK |

**Non-Fatal Warnings (session continues):**
| Code | Meaning | Our Exposure |
|------|---------|-------------|
| `INJECT_AGENT_MESSAGE_DURING_USER_SPEECH` | Inject ignored during user turn | Silence nudge timing |
| `INJECT_AGENT_MESSAGE_DURING_AGENT_SPEECH` | Inject ignored during agent turn | FIX: use behavior:"queue" |
| `PROMPT_TOO_LONG` | Prompt truncated at 25K chars | buildAgentPrompt length check needed |
| `THINK_REQUEST_FAILED` | LLM provider error | No fallback configured |
| `SPEAK_REQUEST_FAILED` | TTS provider error | No fallback configured |
| `FUNCTION_CALL_FAILED` | Function execution error | Vocab save POST failure |
| `SLOW_THINK_REQUEST` | LLM taking too long | Monitor for latency |
| `SLOW_SPEAK_REQUEST` | TTS taking too long | Monitor for latency |
| `GPT_4O_STREAM_END_ERROR` | gpt-4o failed to send done | Consider model switch |

### 2.2 Agent REST vs WebSocket Split (v5.3.0)
- `agent.v1.settings.think.models` now routes over HTTPS not WSS (was misrouted before)
- New `agentRest` environment slot replaces old `Agent` environment value
- Client `fetch()` baseUrl restored to `api.deepgram.com` (was incorrectly defaulting to `agent.deepgram.com`)
- **IMPACT:** Our CF Worker `/api/deepgram-token` endpoint may need updating if we query think models

### 2.3 Diarization v2 GA (v5.3.0)
- New `diarize_model` field on listen requests
- **POTENTIAL:** Could improve multi-speaker detection in group sessions

### 2.4 Provider Type Consolidation (v5.3.0)
- `DeepgramListenProviderV1` and `DeepgramListenProviderV2` top-level types
- Old nested paths preserved as aliases
- **OUR SETTINGS:** Use `{ type: "deepgram", model: "nova-3" }` — should still work via alias

### 2.5 Token Auth Evolution
- v3.12.0: Token-based auth endpoint added
- v4.5.0: Temporary auth tokens fixed (were broken)
- v4.6.0: DEEPGRAM_ACCESS_TOKEN env var support
- **OUR IMPLEMENTATION:** Uses raw API key via subprotocol `["token", apiKey]`
- **QUESTION:** Should we migrate to proper token grant flow for better security?

### 2.6 Speak Fallback (v4.9.0)
- Adds fallback TTS provider if primary fails
- **OUR CODE:** No fallback configured — single aura-2-zeus-en voice
- **ACTION:** Add speak fallback to prevent silent failures

### 2.7 TTL Seconds Support (v4.10.0)
- Session time-to-live configurable
- **OUR CODE:** No TTL set — sessions can run indefinitely
- **ACTION:** Set reasonable TTL (1800s = 30 min) as cost protection

### 2.8 MIP Opt-Out (v4.11.0)
- Model Improvement Program opt-out flag
- **PRIVACY:** Should we enable this for student data protection?

### 2.9 Agent Timing Fix (v4.11.2)
- Bug fix for "agent timing issue" (PR #428)
- **RELEVANCE:** May relate to our silence timer / barge-in race conditions

---

## §3 KNOWN GITHUB ISSUES (OPEN + RELEVANT CLOSED)

### 3.1 #463 — InjectAgentMessage SILENT DROP (OPEN, Feb 2026)
**Severity:** HIGH
**Symptom:** InjectAgentMessage sent successfully but no response event follows.
No AgentStartedSpeaking, no InjectionRefused, no Warning, no Error. Silent no-op.
**Reproduction:** Intermittent, especially after at least one normal turn.
**Payload used:** `{ type: "InjectAgentMessage", content: "Are you still on the line?" }`
**Note:** Uses `content` field, NOT `message` field.
**Our exposure:** Lines 916, 958, 1040 in chat.js — silence nudge, vocab confirmation, greeting.
**Workaround needed:** Watchdog timer after inject. If no response in 3s, retry or fallback.

### 3.2 #443 — TTS STATIC/NOISE WITH AURA-2 HELENA (OPEN, Nov 2025)
**Severity:** MEDIUM-HIGH
**Symptom:** All Voice Agent TTS output plays as broadband static despite correct config.
/v1/speak REST endpoint produces clean audio with same voice.
**Voice affected:** aura-2-helena-en
**Our voice:** aura-2-zeus-en (swapped Run 29)
**Risk:** Same pipeline bug could affect any aura-2 voice via Voice Agent WS.
**Request ID for trace:** fb4f1cce-d56e-49fd-9fd1-941c9f5e916b
**Audio config in report:** linear16, 16kHz, container "none"
**Our audio config:** MP3 encoding (different!) — may or may not be affected.
**Action:** Test zeus specifically. Compare /v1/speak output vs Voice Agent streaming output.

### 3.3 #419 — CLIENT_MESSAGE_TIMEOUT DURING LONG SPEECH (CLOSED, Jul 2025)
**Severity:** MEDIUM
**Symptom:** Deepgram closes connection with CLIENT_MESSAGE_TIMEOUT while agent is still speaking.
Occurs on responses >8-10 seconds. KeepAlive every 8s was insufficient.
**Root cause:** Server expects continuous binary frames even during playback.
**Our KeepAlive:** Every 3.5s (JSON only, no binary).
**Risk:** Long OBI explanations (>10s) may trigger disconnect.
**Fix needed:** Send silent PCM16 binary frame alongside KeepAlive during agent speaking state.

### 3.4 #400 — AgentThinking EVENT NEVER ARRIVES (OPEN, Jun 2025)
**Severity:** LOW-MEDIUM
**Symptom:** AgentThinking event never fires despite 4-5s LLM latency.
SDK v4.2.0, using open_ai gpt-4o think provider.
**Our code:** Shows typing bubble only on AgentThinking (line 989-990).
**Impact:** Students see no feedback during thinking latency.
**Workaround:** Start 1.5s timer on UserStoppedSpeaking. Show bubble proactively if no event arrives.

### 3.5 #477 — useDeepgramAgent() React Hook REQUEST (OPEN, Mar 2026)
**Severity:** INFORMATIONAL
**Relevance:** Indicates growing React ecosystem adoption. Not directly applicable (we're vanilla JS).

### 3.6 #395 — Browser Compatibility AgentLiveClient (CLOSED, Mar 2026)
**Severity:** RESOLVED
**Note:** Was beta, now GA. Confirms browser WebSocket support is production-ready.

### 3.7 #402 — JWT Tokens Broken with v4 SDK (CLOSED, Jun 2025)
**Severity:** RESOLVED
**Relevance:** We use raw API key, not JWT. Not affected.

### 3.8 #362 — Claude Integration Buggy (CLOSED, Feb 2025)
**Severity:** RESOLVED
**Relevance:** We use OpenAI GPT-4o-mini for think provider. Not affected.

---

## §4 OUR IMPLEMENTATION AUDIT (chat.js as of Run 29)

### 4.1 Current Architecture
```
Browser → GET /api/deepgram-token (CF Worker returns raw API key + Settings)
Browser → wss://agent.deepgram.com/v1/agent/converse DIRECT (no CF proxy)
Audio IN: PCM16 binary frames via AudioWorklet
Audio OUT: Binary MP3 chunks → Audio element playback
Events: JSON messages parsed in handleAgentMsg()
Vocab save: FunctionCallRequest → POST /api/agent/vocab → KV
```

### 4.2 Settings Payload Sent on Welcome
```javascript
{
  type: "Settings",
  audio: { input: { encoding: "linear16", sample_rate: 16000 } },
  agent: {
    language: "en",
    listen: { provider: { type: "deepgram", model: "nova-3" } },
    speak: { provider: { type: "deepgram", model: "aura-2-zeus-en", speed: ttsSpeed } },
    // think provider configured server-side in CF Worker
  },
  messages: [last 6 chat history entries]
}
```

### 4.3 Event Handlers Implemented
| Event | Handler | Status |
|-------|---------|--------|
| Welcome | Send Settings + history | ✓ |
| SettingsApplied | Reset state, start keepalive, send greeting | ✓ |
| UserStartedSpeaking | Barge-in stop, clear queue, cancel silence timer | ✓ |
| UserStoppedSpeaking | Set "Processing…" status | ✓ |
| AgentStartedSpeaking | Remove think bubble, set busy state | ✓ |
| AgentThinking | Show typing indicator | ✓ (but may never fire per #400) |
| ConversationText (assistant) | Display bubble, save memory, resolve inject | ✓ |
| ConversationText (user) | Display bubble, increment turns | ✓ |
| AgentAudioDone | Flush accumulator, start silence timer on drain | ✓ |
| FunctionCallRequest | Save vocab, send response, inject confirmation | ✓ |
| Goodbye | End session, show Tiger Win | ✓ |
| Error | Log, force close, trigger reconnect | ✓ |
| Warning | Console warn only | ✓ |

### 4.4 Timers and Intervals
| Timer | Interval | Purpose |
|-------|----------|--------|
| KeepAlive | 3500ms | Prevent WS timeout |
| AudioFocus watchdog | 3000ms | Resume suspended AudioContext (Android) |
| Silence nudge | 6000ms after AgentAudioDone + queue drain | Prompt silent student |
| Nudge cooldown | 15000ms between nudges | Prevent nudge loop |
| Reconnect backoff | 2000ms × 1.5^n, max 15000ms | Exponential backoff on drop |
| Max retries | 5 | Cap infinite retry loops |

### 4.5 Known Vulnerabilities in Our Code
1. **InjectAgentMessage uses `message` field** — may need `content` (EC-5)
2. **No inject watchdog** — silent drops go undetected (EC-1)
3. **No SettingsApplied timeout** — permanent loading if Settings rejected (EC-6)
4. **No AgentThinking fallback** — no feedback if event never fires (EC-3)
5. **KeepAlive is JSON-only** — may not satisfy binary frame requirement (EC-2)
6. **No mic health check on visibility restore** — muted tracks undetected (EC-7)
7. **No TTS audio quality check** — static goes undetected (EC-4)
8. **No session duration cap** — unlimited billing exposure (EC-9)
9. **Barge-in doesn't cancel pending injects** — race condition (EC-8)
10. **chatMessages capped at 40** — but no persistence across page reloads

---

## §5 EDGE CASE REGISTRY

### EC-1: InjectAgentMessage SILENT DROP
- **Source:** GitHub #463
- **Priority:** P0
- **Effort:** 30 min
- **Description:** Inject sent but no server response. Silent failure.
- **Affected features:** Silence nudge, vocab confirmation, proactive greeting
- **Fix:** Add 3s watchdog after each inject. Retry once. Fallback to local text bubble.
- **Status:** OPEN

### EC-2: CLIENT_MESSAGE_TIMEOUT ON LONG RESPONSES
- **Source:** GitHub #419
- **Priority:** P1
- **Effort:** 30 min
- **Description:** Server drops connection during long TTS output despite KeepAlive.
- **Fix:** Send silent PCM16 frame (zero-filled 160-byte buffer) every 3.5s during agent speaking.
- **Status:** OPEN

### EC-3: AgentThinking NEVER FIRES
- **Source:** GitHub #400
- **Priority:** P1
- **Effort:** 15 min
- **Description:** Thinking indicator never shows during LLM latency.
- **Fix:** Proactive timer on UserStoppedSpeaking → show bubble after 1.5s if no event.
- **Status:** OPEN

### EC-4: TTS STATIC WITH AURA-2 VOICES
- **Source:** GitHub #443
- **Priority:** P2
- **Effort:** 30 min
- **Description:** Voice Agent streaming produces static; REST /v1/speak is clean.
- **Fix:** RMS check on first 500ms of audio. Fallback to text if static detected.
- **Status:** OPEN — needs testing with aura-2-zeus-en specifically

### EC-5: InjectAgentMessage FIELD NAME (`message` vs `content`)
- **Source:** GitHub #463 payload comparison
- **Priority:** P0
- **Effort:** 10 min
- **Description:** Our code uses `message`, issue reporter uses `content`. One may be wrong.
- **Fix:** Test both. Send `{ message: x, content: x }` for backward compat. Verify which works.
- **Status:** OPEN — BLOCKS ALL OTHER INJECT FIXES

### EC-6: NO SETTINGSAPPLIED TIMEOUT
- **Source:** Code audit
- **Priority:** P1
- **Effort:** 20 min
- **Description:** If Settings rejected silently, student sees permanent "Setting up…"
- **Fix:** 10s timeout after Welcome. If no SettingsApplied, close + reconnect + log.
- **Status:** OPEN

### EC-7: ANDROID MIC MUTED ON TAB RESTORE
- **Source:** Code audit + Android Chrome behavior
- **Priority:** P2
- **Effort:** 25 min
- **Description:** getUserMedia tracks become muted when tab backgrounded then restored.
- **Fix:** On visibilitychange → visible, check track.readyState !== "live". Re-acquire if dead.
- **Status:** OPEN

### EC-8: BARGE-IN VS INJECT RACE CONDITION
- **Source:** Code audit
- **Priority:** P3
- **Effort:** 20 min
- **Description:** Student interrupts during OBI speech, but pending inject still processes.
- **Fix:** Track pending inject count. On UserStartedSpeaking, flag stale injects.
- **Status:** OPEN

### EC-9: NO SESSION DURATION CAP
- **Source:** Code audit + billing concern
- **Priority:** P3
- **Effort:** 15 min
- **Description:** Unlimited session length = unlimited Deepgram billing.
- **Fix:** 25min warning inject. 30min hard Goodbye + Tiger Win + WS close.
- **Status:** OPEN

### EC-10: updatePrompt vs updateInstructions (PROTOCOL DRIFT)
- **Source:** SDK CHANGELOG v3.13.0 commit b175a1f
- **Priority:** P2
- **Effort:** 15 min
- **Description:** SDK renamed updateInstructions → updatePrompt. Our curriculum injection
  feature (not yet implemented) must use correct method name.
- **Fix:** When implementing curriculum state injection, use `updatePrompt` not `updateInstructions`.
- **Status:** BLOCKED — feature not implemented yet

### EC-11: CONTEXT LENGTH OPTION
- **Source:** SDK v4.4.0 (commit 7b22b07)
- **Priority:** P3
- **Effort:** 10 min
- **Description:** SDK supports context_length option for conversation history window.
- **Our code:** Manually slices last 6 messages. Could use server-side context_length instead.
- **Fix:** Add context_length to Settings payload. Let Deepgram manage window.
- **Status:** OPEN — optimization, not bug

### EC-12: SPEAK FALLBACK NOT CONFIGURED
- **Source:** SDK v4.9.0 (PR #414)
- **Priority:** P2
- **Effort:** 10 min
- **Description:** If primary TTS voice fails, no fallback configured.
- **Fix:** Add fallback voice in Settings (e.g., aura-asteria-en as backup to aura-2-zeus-en).
- **Status:** OPEN

### EC-13: TTL_SECONDS NOT SET
- **Source:** SDK v4.10.0 (PR #420)
- **Priority:** P2
- **Effort:** 5 min
- **Description:** No session TTL = indefinite billing exposure.
- **Fix:** Add ttl_seconds: 1800 to Settings.
- **Status:** OPEN

### EC-14: MIP_OPT_OUT NOT SET
- **Source:** SDK v4.11.0 (PR #421)
- **Priority:** P3
- **Effort:** 5 min
- **Description:** Student voice data may be used for model improvement without explicit opt-out.
- **Fix:** Add mip_opt_out: true to Settings for privacy compliance.
- **Status:** OPEN

---

## §6 RESEARCH QUEUE (NEXT RUNS)

### Run 31 Priorities
1. [ ] EC-5: Test `message` vs `content` field against live API (10 min)
2. [ ] EC-1: Implement inject watchdog with retry (30 min)
3. [ ] EC-6: Add SettingsApplied timeout (20 min)
4. [ ] EC-3: Add AgentThinking fallback timer (15 min)

### Run 32 Priorities
5. [ ] EC-2: Send silent binary frame during agent speaking (30 min)
6. [ ] EC-12: Configure speak fallback voice (10 min)
7. [ ] EC-13: Set ttl_seconds: 1800 (5 min)
8. [ ] EC-14: Set mip_opt_out: true (5 min)

### Run 33 Priorities
9. [ ] EC-7: Android mic health check on visibility restore (25 min)
10. [ ] EC-4: TTS audio quality RMS check (30 min)
11. [ ] EC-8: Barge-in inject cancellation (20 min)
12. [ ] EC-9: Session duration cap (15 min)

### Ongoing Research Tasks
- [x] ~~Find actual Deepgram docs~~ — RESOLVED: developers.deepgram.com works; use .md suffix or llms-full.txt
- [x] ~~Research UpdatePrompt protocol~~ — RESOLVED: `{ type: "UpdatePrompt", prompt: "..." }`, 25K char limit
- [x] ~~Verify InjectAgentMessage field name~~ — RESOLVED: `message` is correct, `content` is doc error
- [ ] Search Deepgram Discord for voice agent edge cases (bot-blocked on web fetch)
- [ ] Search Reddit r/deepgram for production gotchas (bot-blocked on web fetch)
- [ ] Fetch HN comment threads: 41057030 (24 comments), 47351652 (7 comments), 47354996 (1 comment)
- [ ] Test Deepgram Sydney region — NO APAC ENDPOINT EXISTS (only Global + EU documented)
- [ ] Verify VAD endpointing field name for 200ms threshold
- [ ] Investigate Flux model compatibility with Voice Agent (diarization v2 GA)
- [ ] Evaluate migration to @deepgram/agents Browser SDK (handles reconnection, audio buffering, VAD natively)
- [ ] Test UpdatePrompt retry behavior (Python SDK #531 suggests multiple attempts needed)
- [ ] Monitor GPT_4O_STREAM_END_ERROR warning frequency in production

---

## §7 TESTING CHECKLIST

### Manual Tests Needed
- [ ] Open magic-chat.html?studentId=quy-bluetech in Chrome
- [ ] Click mic, verify [VOICE] connecting log appears
- [ ] Verify SettingsApplied fires within 3s
- [ ] Speak a sentence, verify transcription appears
- [ ] Verify OBI responds with audio (not static)
- [ ] Stay silent for 10s, verify nudge fires
- [ ] Interrupt OBI mid-speech, verify barge-in stops audio
- [ ] Switch to another tab for 30s, return, verify mic still works
- [ ] Let session run for 5+ minutes, verify no disconnect
- [ ] Trigger vocab save via function calling, verify confirmation

### Automated Tests Needed
- [ ] Unit test: InjectAgentMessage with both `message` and `content` fields
- [ ] Integration test: Full connect → Settings → speak → respond cycle
- [ ] Stress test: 30-minute continuous session
- [ ] Network test: Simulated packet loss during audio streaming
- [ ] Browser matrix: Chrome, Safari, Firefox, Edge on desktop + mobile

---

## §8 BROWSER AGENT SDK INTELLIGENCE (@deepgram/agents)

Deepgram now ships an official Browser Agent SDK with 4 composable layers:
```
@deepgram/agents-widget    Drop-in widget (UMD + ESM, bundles Preact)
       ↓
@deepgram/ui               Pre-built React components + CSS
       ↓
@deepgram/react            React provider + hooks
       ↓
@deepgram/agents           Core WebSocket client, microphone, player
```

### Features Our Custom chat.js LACKS:
| Feature | Browser SDK | Our chat.js | Gap |
|---------|------------|-------------|-----|
| Reconnection w/ exponential backoff + jitter | ✓ (configurable maxAttempts, baseDelay, maxDelay, jitter) | ✓ (manual: 2s×1.5^n, max 15s, no jitter) | Add jitter to prevent thundering herd |
| Audio buffering before SettingsApplied | ✓ (frames queued, flushed on settings-applied) | ✗ (frames lost during setup) | **EC-15: NEW** |
| Playback-aware mode tracking | ✓ (waits for audio queue drain before mode transition) | Partial (agentServerAudioDone flag) | Verify alignment |
| Silero VAD integration | ✓ (optional, speechThreshold/silenceThreshold) | ✗ (relies on server-side VAD only) | Consider adding client-side VAD |
| Token caching (4-min TTL) | ✓ (automatic) | ✗ (fetches new token every reconnect) | **EC-16: NEW** |
| Typed event emitter | ✓ (all events typed) | ✗ (manual JSON parse) | Low priority |
| AgentPlayer.interrupt() | ✓ (barge-in with queue discard) | ✓ (manual audio queue clear) | Equivalent |
| AgentMicrophone.mute()/unmute() | ✓ | ✗ (only stop/start) | Add mute for push-to-talk |
| Volume/frequency analysis | ✓ (getInputVolume, getOutputByteFrequencyData) | ✗ | Nice-to-have for visualizations |
| Custom WebSocket URL | ✓ (proxy/self-hosted support) | ✗ (hardcoded agent.deepgram.com) | Needed for EU endpoint |
| injection-refused event handler | ✓ | ✗ (not handled) | **EC-17: NEW** |

### EC-15: AUDIO FRAMES LOST DURING SETTINGS HANDSHAKE
- **Source:** Browser SDK docs — "Frames sent before settings-applied are queued internally"
- **Our code:** startAgentListening() fires immediately after SettingsApplied, but if mic was already streaming (pendingMicStream), those pre-settings frames were sent to a WS that hadn't accepted Settings yet
- **Risk:** First 200-500ms of student speech may be dropped
- **Fix:** Buffer audio frames locally until agentReady === true, then flush

### EC-16: NO TOKEN CACHING ON RECONNECT
- **Source:** Browser SDK caches tokens for 4 minutes
- **Our code:** Every openVoiceAgent() calls GET /api/deepgram-token
- **Risk:** On rapid reconnect (network flap), multiple token fetches add latency
- **Fix:** Cache token in sessionStorage with 4-min TTL

### EC-17: InjectionRefused EVENT NOT HANDLED
- **Source:** Official docs — server sends InjectionRefused when inject arrives during turn
- **Our code:** No handler for this event type
- **Risk:** Silent failure — we don't know inject was refused
- **Fix:** Add InjectionRefused handler → log + retry with behavior:"queue" or defer

---

## §9 PYTHON SDK BUGS (Cross-SDK Intelligence)

Bugs found in deepgram-python-sdk that may also affect JS/browser implementations:

### PY-531: UpdatePrompt Requires Multiple Attempts
- **Status:** Closed Feb 2026 (investigate label)
- **Symptom:** PromptUpdated ack fires but prompt doesn't actually change until 2nd or 3rd attempt
- **Impact:** Curriculum state injection must verify effectiveness, not just ack
- **Workaround:** Send UpdatePrompt, wait for next ConversationText, verify content reflects new prompt. Retry up to 3x.

### PY-501: Tasks Cancelled Error on Connection Close
- **Status:** Closed Feb 2026
- **Symptom:** Cleanup race condition throws "Tasks cancelled" on graceful close
- **Impact:** May cause console noise; not functional but messy

### PY-704: Multiple language_hint Parameters Not Supported
- **Status:** Closed May 2026
- **Relevance:** If we add Vietnamese language hints for bilingual students, need to verify JS SDK handles array syntax

### PY-719: OpenTelemetry Instrumentation Request
- **Status:** Open May 2026
- **Relevance:** Production observability gap. No built-in tracing for Voice Agent latency.

---

## §10 HACKER NEWS PRODUCTION INTELLIGENCE

### Latency Benchmarks (Real-World)
| Architecture | Voice-to-Voice Latency | Source |
|-------------|----------------------|--------|
| Deepgram STT (local) + Llama 3B (local) + Deepgram TTS (local) | **500ms** | HN #41057030 (72pts) |
| Deepgram STT + GPT-4o-mini + ElevenLabs TTS | ~1.8s | Same source (cloud swap) |
| Deepgram → LiveKit → ElevenLabs | 1-2s | HN openserv-labs/openclaw |
| Vapi/Retell/Bland.ai (API orchestration) | >2s | HN criticism: "network latency at every step" |

### Competitor Landscape
| Competitor | Strength | Weakness | Our Position |
|-----------|----------|----------|-------------|
| **Vapi** | Drag-and-drop, telephony built-in | Too opinionated, API latency | We're leaner, direct WS |
| **Retell** | Full telephony stack | Opinionated, expensive | N/A for us (no telephony) |
| **LiveKit** | Real-time transport, SFU | Weeks of plumbing for production | We skip this layer entirely |
| **Pipecat** | Flexible pipeline framework | Heavy wiring needed | Dograh forked it to simplify |
| **ElevenLabs** | Superior TTS quality (+300ms cost) | Expensive, slower | Deepgram Aura is faster but lower quality |
| **OpenAI Realtime** | Integrated LLM+voice | Vendor lock-in, pricing | We use GPT-4o-mini via think provider |

### Key Production Workarounds (from HN)
1. **Dual-mode VAD** (AVA project): 40% WebRTC VAD + 40% energy RMS + 20% agreement bonus with frame smoothing — prevents false barge-in
2. **Barge-in buffer flush**: Kill playback + flush provider buffers + suppress output for configurable window after interrupt
3. **Local models for sub-second**: Only viable with self-hosted Deepgram + local LLM
4. **Cloudflare free tier**: Workers + DOs can proxy Deepgram STT/TTS at zero cost for hobbyist scale

### Nova-3 Accuracy Benchmark
- Deepgram Nova-3: **85%** accuracy
- ElevenLabs Scribe v2: **93.5%** accuracy
- Gemini 2.5 Flash: **91.4%** accuracy
- GPT-4o MiniTranscribe: **90.7%** accuracy
- **IMPACT:** For ESL students with heavy accents, Nova-3 may mis-transcribe more than competitors. Test with Vietnamese-accented English specifically.

---

## §11 UPDATED EDGE CASE REGISTRY (COMPLETE)

| ID | Description | Priority | Status | Source |
|----|-------------|----------|--------|--------|
| EC-1 | InjectAgentMessage silent drop | P0 | OPEN — add watchdog + retry | GitHub #463 |
| EC-2 | CLIENT_MESSAGE_TIMEOUT on long responses | P1 | OPEN — send silent binary frame | GitHub #419 |
| EC-3 | AgentThinking never fires | P1 | OPEN — proactive timer fallback | GitHub #400 |
| EC-4 | TTS static with aura-2 voices | P2 | OPEN — RMS check needed | GitHub #443 |
| EC-5 | InjectAgentMessage field name | P0 | **RESOLVED ✓** — `message` is correct | Official docs |
| EC-6 | No SettingsApplied timeout | P1 | OPEN | Code audit |
| EC-7 | Android mic muted on tab restore | P2 | OPEN | Code audit |
| EC-8 | Barge-in vs inject race condition | P3 | OPEN | Code audit |
| EC-9 | No session duration cap | P3 | OPEN — set ttl_seconds:1800 | Code audit |
| EC-10 | UpdatePrompt protocol drift | P2 | **RESOLVED ✓** — use `updatePrompt` | SDK CHANGELOG |
| EC-11 | Context length option unused | P3 | OPEN — optimization | SDK v4.4.0 |
| EC-12 | Speak fallback not configured | P2 | OPEN — add backup voice | SDK v4.9.0 |
| EC-13 | ttl_seconds not set | P2 | OPEN — billing protection | SDK v4.10.0 |
| EC-14 | mip_opt_out not set | P3 | OPEN — privacy compliance | SDK v4.11.0 |
| EC-15 | Audio frames lost during settings handshake | P1 | **NEW** — buffer until agentReady | Browser SDK docs |
| EC-16 | No token caching on reconnect | P2 | **NEW** — cache with 4-min TTL | Browser SDK docs |
| EC-17 | InjectionRefused event not handled | P2 | **NEW** — add handler + retry logic | Official docs |
| EC-18 | UpdatePrompt requires multiple attempts | P2 | **NEW** — retry + verify pattern | Python SDK #531 |
| EC-19 | No Sydney/APAC endpoint exists | INFO | **RESOLVED** — only Global + EU | Official docs |
| EC-20 | Nova-3 accuracy gap vs competitors | P2 | **NEW** — test with VN-accented English | HN benchmark |
| EC-21 | behavior:"queue" not used on injects | P1 | **NEW** — prevents InjectionRefused | Official docs |
| EC-22 | GPT_4O_STREAM_END_ERROR monitoring | P3 | **NEW** — track warning frequency | Official docs |

---

## §12 REFERENCES (UPDATED)

### Official Documentation
- Docs Home: https://developers.deepgram.com/
- Full Docs (LLM-friendly): https://developers.deepgram.com/llms-full.txt
- Docs Index: https://developers.deepgram.com/llms.txt
- Voice Agent Overview: https://developers.deepgram.com/docs/voice-agent
- Settings Reference: https://developers.deepgram.com/docs/voice-agent-settings
- InjectAgentMessage: https://developers.deepgram.com/docs/voice-agent-inject-agent-message
- Errors & Warnings: https://developers.deepgram.com/docs/voice-agent-errors-warnings
- Feature Overview: https://developers.deepgram.com/docs/voice-agent-feature-overview
- Function Calling: https://developers.deepgram.com/docs/voice-agents-function-calling
- Browser Agent SDK: https://developers.deepgram.com/docs/browser-agent-overview
- Browser JS SDK: https://developers.deepgram.com/docs/browser-agent-javascript
- Configure Agent: https://developers.deepgram.com/docs/configure-voice-agent
- API Reference: https://developers.deepgram.com/reference/voice-agent/voice-agent
- Agentic Tools / MCP: https://developers.deepgram.com/developer-tools/agentic-tools
- Playground: https://playground.deepgram.com/?endpoint=agent

### GitHub
- JS SDK: https://github.com/deepgram/deepgram-js-sdk
- JS SDK Issues (Voice Agent): https://github.com/deepgram/deepgram-js-sdk/issues?q=is%3Aissue+voice+agent
- Python SDK: https://github.com/deepgram/deepgram-python-sdk
- Python SDK Issues (Voice Agent): https://github.com/deepgram/deepgram-python-sdk/issues?q=is%3Aissue+voice+agent
- Skills Repository: https://github.com/deepgram/skills
- Discussions: https://github.com/orgs/deepgram/discussions

### Community
- Discord: https://dpgr.am/discord
- Slack Bot: @Deepgram in any workspace
- HN Thread (AI Tutor <1s): https://news.ycombinator.com/item?id=41057030
- HN Thread (Dograh/Vapi): https://news.ycombinator.com/item?id=47351652

### Internal
- Our chat.js: APPS/NET-PET-AI/public/chat.js (lines 776-1069)
- Our index.js: APPS/NET-PET-AI/src/index.js (buildAgentPrompt + /api/deepgram-token)
- Run 26 Edge Cases: CANON/REINCARNATION/2026-05-30-run26-voice-agent-edge-cases.md
- COLD-START-BOOT: CANON/SYSTEM/COLD-START-BOOT.md

---

## §14 STRATEGIC DIFFERENTIATOR: MEMORY

**Why clients don't just use Gemini/ChatGPT:** Those models have amnesia. Every session is a stranger.
OBI's moat is **MEMORY** — persistent, per-student, cross-session relationship context.

### Memory Architecture in Production
| Layer | Implementation | Location |
|-------|---------------|----------|
| Per-turn memory save | POST /api/memory on every assistant ConversationText | chat.js:999 |
| Session history | KV key `session_history_{studentId}` (last 20 sessions) | index.js /api/agent/session |
| Vocab accumulation | `agentSessionVocab[]` array + KV persist via function calling | chat.js:903-917 |
| Greeting personalization | `profile.sessionNotes` + `profile._sessionHint` injected into opening | chat.js:948-957 |
| Conversation continuity | Last 6 messages sent in Settings payload on Welcome | chat.js:890-893 |
| Student profile context | fullName, lang, studentId loaded from portal | magic-chat.html init |

### Memory-Threatening Edge Cases (REPRIORITIZED)
Any EC that breaks memory continuity is effectively P0 regardless of technical severity:
- **EC-15** (audio frames lost during handshake) → student's first words of session never transcribed → memory gap
- **EC-8** (barge-in vs inject race) → OBI responds to stale context → relationship feels broken
- **EC-1** (inject silent drop) → vocab confirmation never reaches student → learning reinforcement lost
- **EC-18** (UpdatePrompt retry) → curriculum state injection fails → OBI doesn't adapt to lesson plan
- **EC-6** (no SettingsApplied timeout) → permanent loading → zero memory formed this session
- **chatMessages cap at 40** → long sessions lose early context within same session
- **No cross-page persistence** → page reload wipes chatMessages entirely (only KV survives)

### Memory Expansion Opportunities (Future Runs)
1. **Emotion/sentiment tagging** per turn → detect frustration, adjust tone
2. **Pronunciation error tracking** across sessions → build per-student phoneme remediation plan
3. **Topic affinity graph** → what does each student gravitate toward? Feed into prompt
4. **Session-to-session bridging** → "Last time you mentioned X, how did that go?"
5. **Parent-facing memory summary** → Minh portal already has session cards; expand to all parents
6. **Vocabulary retention curve** → track which saved words student actually uses in later sessions

---

## §15 SIMULATION LAW — PRODUCTION TEST PATH (Run 41 HARD LESSON)

> **THIS IS NOT A SUGGESTION. THIS IS A LAW. VIOLATING IT COSTS 30+ MINUTES.**

### THE LAW
**The production simulation path is `/api/deepgram-token`, NOT `/api/chat`.**

| Path | Model | What it tests |
|------|-------|--------------|
| `GET /api/deepgram-token?studentId=X&mode=free\|study\|phonics` | gpt-4o-mini via Deepgram think | ✅ REAL — exactly what students hear |
| `POST /api/chat` | DeepSeek-V4-flash | ❌ WRONG — legacy text fallback, different model, different memory path |

### WHAT HAPPENED (Run 41)
Agent tested all 3 modes (free, study, phonics) via `POST /api/chat`. DeepSeek-V4-flash leaked reasoning chains in Chinese. Agent spent 30+ minutes building and thrashing sanitizer patterns (`^We\b`, `^We are meeting`, `^We need to`...). None of it mattered for production. The voice agent (Deepgram → gpt-4o-mini) does not have this problem. Eventually had to `git checkout -- index.js` mid-session after leaving it in broken state.

### CORRECT SIMULATION COMMANDS
```powershell
$DEV = "https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev"
$SID = "sov100-test-magic"
# See full OBI prompt for each mode — this IS what the student hears
Invoke-RestMethod "$DEV/api/deepgram-token?studentId=$SID&mode=free"    | Select-Object -ExpandProperty settings | ConvertTo-Json -Depth 5
Invoke-RestMethod "$DEV/api/deepgram-token?studentId=$SID&mode=study"   | Select-Object -ExpandProperty settings | ConvertTo-Json -Depth 5
Invoke-RestMethod "$DEV/api/deepgram-token?studentId=$SID&mode=phonics" | ConvertTo-Json -Depth 5
```

### TO ADVANCE SIMULATION STATE (real KV writes)
```powershell
# Phonics: advance drill progress
Invoke-RestMethod "$DEV/api/phonics/progress" -Method POST -ContentType "application/json" -Body (@{studentId=$SID;drill_id="hogfez-01";error_type="th_substitution"} | ConvertTo-Json)

# Free/Study: advance session memory
Invoke-RestMethod "$DEV/api/memory/$SID" -Method POST -ContentType "application/json" -Body (@{
  world_model_update="C1 professional. Uses 'on the contrary' naturally. Filler word: 'basically' under pressure.";
  session_summary="Practiced concise project status updates. 30-second drill.";
  breakthrough="Cut 5-sentence explanation to 2 without prompting";
  struggle="Still starts sentences with 'So...' under pressure"
} | ConvertTo-Json)

# Save vocab
Invoke-RestMethod "$DEV/api/vocab/save" -Method POST -ContentType "application/json" -Body (@{studentId=$SID;word="articulate";meaning_vi="diễn đạt rõ ràng"} | ConvertTo-Json)

# Log session completion
Invoke-RestMethod "$DEV/api/agent/session" -Method POST -ContentType "application/json" -Body (@{studentId=$SID;turns=12;durationMs=420000;vocab=@("articulate","concise")} | ConvertTo-Json)
```

### KEY ARCHITECTURAL FACT
`/api/chat` (DeepSeek) and `/api/deepgram-token` (gpt-4o-mini) have COMPLETELY DIFFERENT memory architectures:
- **deepgram-token**: reads KV student_profile + vocab_list + vocab_arc + STUDENT_MEMORY DO + phonics_progress
- **/api/chat**: reads Ledger DO + Profiles DO + Pets DO + Soul Logger HTTP + KV lang/profile

Debugging DeepSeek behavior to fix voice agent issues = wrong diagnosis, wrong treatment.

---

## §13 CHANGE LOG

| Date | Run | Change |
|------|-----|--------|
| 2026-06-01 | 41 | §15 added: Simulation Law. Run 41 DeepSeek fuckup documented. Correct simulation commands and state-advance commands added. |
| 2026-05-31 11:15 | 30 | Initial creation. 14 edge cases catalogued. SDK v5.3.0 CHANGELOG analyzed. |
| 2026-05-31 12:45 | 30 SS | SUPER SAIYAN DEEP DIVE. EC-5 RESOLVED (message not content). EC-10 RESOLVED (updatePrompt). EC-19 RESOLVED (no Sydney endpoint). Added EC-15 through EC-22. Complete error/warning code registry from official docs. Browser Agent SDK gap analysis (9 features missing). Python SDK cross-intelligence (PY-531 UpdatePrompt retry). HN production benchmarks (500ms local vs 1.8s cloud). Competitor landscape (Vapi/Retell/LiveKit/Pipecat/ElevenLabs). Nova-3 accuracy gap documented. All doc URLs corrected and verified. Research queue updated with resolved items checked off. |
- Run 26 Edge Cases: CANON/REINCARNATION/2026-05-30-run26-voice-agent-edge-cases.md
- COLD-START-BOOT: CANON/SYSTEM/COLD-START-BOOT.md

---

## §9 CHANGE LOG

| Date | Run | Change |
|------|-----|--------|
| 2026-05-31 | 30 | Initial creation. 14 edge cases catalogued. SDK v5.3.0 CHANGELOG analyzed. GitHub issues #400-#477 reviewed. Protocol findings documented. Testing checklist created. |
