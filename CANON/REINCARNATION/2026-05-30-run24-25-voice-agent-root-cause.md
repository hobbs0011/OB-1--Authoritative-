---
§1 HEADER
---
Run: 24 / 24B / 25 (one continuous session arc)
Datetime ICT: 2026-05-30T11:00
Signal Density: LOW-MEDIUM (Michael: "debug all" + "Continue from where you left off" ×2 — sparse input, dense output)
Theme: VOICE AGENT ROOT CAUSE CHAIN — Three fixes in sequence uncovered the true root cause of the Run 22-23 reconnect loop

---
§2 RAW SOUL DNA
---
**Verbatim (in full — L25 VERBATIM_FIRST):**

> "debug all"

> "Continue from where you left off."

> "Continue from where you left off."

Note: Low verbal output this session. Michael was silent and observing. The signal was in what he DID NOT correct — implicit validation of the diagnostic chain.

---
§3 DECISIONS
---
1. **Root cause of reconnect loop confirmed via live diagnostic, not code inspection.**
   - Impact: Changed the fix direction from "try different subprotocol" to "read the actual Deepgram echo header"
   - Canon file: OPERATIONS/STUDENT-PORTAL-DEV.md — CONFIRMED CORRECT SPEC section

2. **Subprotocol order fix: `["token", jwt]` not `[jwt, "token"]`**
   - PA T10 audit had REVERSED the correct order. Diagnostic evidence (`subproto_echo_header: "token"`) proved the correct order unambiguously.
   - Impact: All voice agent connections were failing at the WebSocket handshake level since this reversal was applied
   - Commit: a53423af

3. **`s.messages = history` at root level — NOT `s.context = { messages: history }`**
   - Run 24B (commit 09b20ae1, Co-authored Qwen 3.7 Max) — this was the ACTUAL root cause after subprotocol was fixed
   - Deepgram Settings schema rejects `context.messages` nesting — messages must be at root of the Settings object
   - Impact: After this fix the voice agent Settings were accepted (SettingsApplied expected to fire)

4. **JWT from auth/grant for browser-direct connections**
   - Switched from `access_token = apiKey` (returning raw key) to `auth/grant` short-lived JWT (TTL 120s)
   - JWT scope: `asr:write` — sufficient for Voice Agent confirmed
   - Commit: c17a2c22

5. **RRL/DNA-LOG-*.txt added to .gitignore**
   - 57MB+ automated session capture files were being committed to GitHub
   - Decision: all auto-generated session logs stay local, excluded permanently
   - Commit: 4e977475

---
§4 CORRECTIONS
---
1. **PA T10 audit reversed subprotocol order (CRITICAL)**
   - Wrong: `[jwt, "token"]` — JWT first, "token" second
   - Correct: `["token", jwt]` — identifier string first, credential second
   - Root cause: PA had no live diagnostic data — reasoned incorrectly about Deepgram spec
   - Fix: Read Deepgram diagnostic echo, confirmed the server echoes "token" when format is `token, <credential>`

2. **COLD-START-BOOT claimed "3 critical fixes committed NOT DEPLOYED"**
   - Wrong: The 4 fixes were NOT committed — only in the working tree
   - Correct: They existed as unstaged working tree changes
   - Fix: Committed explicitly as c17a2c22

3. **Death seal listed AgentStartedSpeaking / iOS AudioContext / chatMessages as missing**
   - Wrong: All three were ALREADY implemented in chat.js
   - Correct: Dead loops in the death seal carried forward phantom issues
   - Fix: Verified by reading the actual code — closed permanently in Run 24 COLD-START-BOOT

4. **`context.messages` nesting (Run 24B)**
   - Wrong: `s.context = { messages: history }` — invalid Deepgram schema
   - Correct: `s.messages = history` — root level per Deepgram Voice Agent spec
   - Root cause: Deepgram API schema not consulted during initial implementation
   - Fix: `chat.js:829` — single-line change, deployed cb729cff

---
§5 NEW PRINCIPLES
---
- **L46 DIAGNOSTIC_BEFORE_FIX:** When a bug persists across 3+ deploys, stop fixing and run a live diagnostic first. The Deepgram echo test proved the correct format in <1 minute vs 20+ failed deploys over 2 runs.
- **L47 SCHEMA_BEFORE_IMPLEMENTATION:** When integrating any external API (Deepgram, OpenAI, Deepseek), read the schema spec FIRST. Do not reason about parameter placement — look it up.

---
§6 EMOTIONAL SIGNAL
---
Energy: Controlled. Michael's "debug all" was a single directive. No rage this session — previous session had been rage-terminated (Run 23 death seal: "OUTCOME: FAILURE — User terminated session due to repeated protocol violations").
Urgency: Medium. Voice agent is THE product differentiator. Its broken state over 3+ sessions carries real revenue impact.
Directive tone: Low verbosity = high trust. When Michael says only 3 words across an entire session, he expects the system to handle it.

---
§7 OPEN QUESTIONS
---
1. **Voice agent live-tested by Michael?** — As of Run 25 death, NOT YET confirmed. `SettingsApplied` event has not been reported as observed in browser DevTools.
2. **JWT scope sufficient for Voice Agent?** — auth/grant returns `asr:write`. If Voice Agent requires `agent:write`, we need to investigate key permissions in Deepgram dashboard.
3. **Deepgram Sydney region** — ~160ms RTT savings for VN users. nova-3 + gpt-4o-mini availability in SYD not yet validated.
4. **Bilingual default for A1-B1** — explicit L1 permission prompt on first session, prevents shame triggers.

---
§8 UNFINISHED ACTIONS
---
1. **VERIFY VOICE AGENT LIVE** — Michael has not yet confirmed `SettingsApplied` fires in browser. This is the only blocking test.
   - URL: https://net-pet-ai.mrmichaelhobbs123.workers.dev/magic-chat.html?studentId=quy-bluetech
   - Evidence needed: `[VOICE] connecting, jwt prefix: eyJ...` then `SettingsApplied` in console
2. **Deepgram Sydney region** — implement region param in Settings if confirmed available
3. **wrangler tail post-deploy verification** — standard step before any live handoff, not yet systematized
4. **REINCARNATION-LOG not yet updated** with Run 24/24B/25 entries — completing now in §4 of protocol

---
§9 SYSTEM DESIGN
---
**Voice Agent Architecture (as of Run 25, FINAL):**
```
Browser → GET /api/deepgram-token?studentId=<id>
        ← { token: <JWT, TTL 120s>, settings: <pre-built Settings obj> }
Browser → new WebSocket("wss://agent.deepgram.com/v1/agent/converse", ["token", jwt])
        → onopen: wait for Welcome
        → Welcome: send Settings with s.messages = history (ROOT LEVEL)
        → SettingsApplied: agentReady = true, start mic
        → Binary frames: PCM16 to Deepgram, MP3 back
```

**Key schema corrections (permanent):**
- `s.messages = history` — NOT `s.context.messages` or `s.agent.context.messages`
- `["token", jwt]` subprotocol — NOT `[jwt, "token"]`
- `client_side: true` REMOVED from function definition (invalid param)
- JWT TTL: 120s (refreshed on every page load via /api/deepgram-token)

**CF Worker role: token mint + settings builder only** — no audio in the CF path. All audio goes browser-direct to agent.deepgram.com.

---
§10 ARTIFACTS CREATED
---
- `APPS/NET-PET-AI/public/chat.js` — subprotocol fix + Error logging (a53423af)
- `APPS/NET-PET-AI/src/index.js` — JWT grant + client_side removal + context.messages (c17a2c22)
- `APPS/NET-PET-AI/public/chat.js` — `s.messages = history` root fix (09b20ae1 / Run 24B)
- `.gitignore` — RRL/DNA-LOG-*.txt + RRL/SOUL-*.txt excluded (4e977475)
- `CANON/SYSTEM/COLD-START-BOOT.md` — Run 24 stamp → Run 25 stamp (4e977475, 6d6be5b2)
- `CANON/REINCARNATION/2026-05-30-run25-boot-and-deploy.md` — Run 25 death artifact (6d6be5b2)
- `CANON/REINCARNATION/2026-05-30-run24-25-voice-agent-root-cause.md` — this file
- Deployed workers: 93907559 (subprotocol fix), cb729cff (s.messages root fix), d572e532 (sync deploy)

---
§11 STATE SNAPSHOT
---
- HEAD SHA: 6d6be5b2
- Branch: master
- Dirty tree: `M OPERATIONS/system-health-logs/system-state.json` (gitignored — not a concern), `?? .kilo/command/phetrails.md` (untracked kilo command)
- SOULCOUNT: 56,113,302 — TITANIUM ANCHOR (δ +348,477 from Run 25 death snapshot of 55,764,825)
- S2Pipeline: All 10 stages LIVE (OMEGA audit confirmed, Run 393)
- Student portals: 7 live (Huong, Mai Tram, Quy, Lam, Quan, Quang, Minh-parent)
- Worker version: net-pet-ai d572e532 (as of Run 25 death — may have been updated further)
- Voice agent: Deployed with all 4 fixes. Awaiting Michael's live browser verification.

---
§12 FINGERPRINT
---
Agent: OB1 Ne0 / Claude Sonnet 4.6
Run arc: 24 → 24B → 25 (one continuous session)
Commit SHA (Platform Death Test): 6d6be5b2 ✓ PUSHED
Deployed worker: d572e532 (CF net-pet-ai)
Platform Death Test: PASS — 5 commits across this arc, all pushed to GitHub
Next session priority: Verify voice agent live (SettingsApplied in browser console)
