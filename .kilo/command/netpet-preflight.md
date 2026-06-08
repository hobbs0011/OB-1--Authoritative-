# /netpet-preflight — NET-PET-AI Functional Pre-Deploy Pipeline

**Doctrine:** "Test the product against the real dependency, not the config object in isolation."
**Why this exists:** Run 101. Dozens of audits passed. OBI was dead for every student. One field — `listen.endpointing: 700` (bare integer) — was rejected by Deepgram's live API with `UNPARSABLE_CLIENT_MESSAGE`. Every audit checked "is the field present / is the model correct." None sent the payload to Deepgram and asked "did you accept it?" This pipeline closes that class of bug permanently.

**The law of this file:** A check is only REAL if it hits the live external dependency and asserts a real success signal. "Field exists," "model string matches," "no syntax error" are THEATER. They do not count. If a step does not produce a green/red from a real round-trip, delete it and write a real one.

---

## ROOT CAUSE RESEARCH — WHAT WAS ACTUALLY MISSED (from human sources, Run 101)

Researched post-mortem against Deepgram's official docs, GitHub discussions, and SDK source. Not AI summaries — human-written specs.

### 1. `endpointing` was NEVER a Voice Agent API field — it was cargo-culted from the wrong spec

`listen.endpointing` is a valid field in Deepgram's **streaming transcription** API (`wss://api.deepgram.com/v1/listen`). It controls silence duration before an utterance is considered ended.

It does **not exist** in the **Voice Agent** API (`wss://agent.deepgram.com/v1/agent/converse`). The full `listen.provider` spec for Voice Agent is:

```json
"listen": {
  "provider": {
    "type": "deepgram",
    "model": "nova-3",
    "smart_format": false,
    "language": "en",
    "keyterms": [],
    "eot_threshold": 0.7,
    "eager_eot_threshold": 0.5
  }
}
```

No `endpointing`. The end-of-turn equivalent in Voice Agent is **`eot_threshold`** — a confidence float (0.5–0.9, default 0.7), not a millisecond integer. `eager_eot_threshold` allows early cutoff before the user fully stops. **Both are Flux-model only** — nova-3 uses internal defaults and ignores them.

Source: [Deepgram configure-voice-agent docs](https://developers.deepgram.com/docs/configure-voice-agent) — human-written field list.

### 2. Deepgram ran a V1 migration that changed the entire settings schema — we never read it

The [Voice Agent V1 migration guide](https://developers.deepgram.com/docs/voice-agent-v1-migration) documents breaking changes including:
- `session_id` → `request_id` in Welcome
- `message` → `description` in errors
- `message` → `content` in InjectAgentMessage
- Full settings schema restructure

We were on V1 already but had cargo-culted fields from pre-V1 examples. The migration guide is the authoritative human source for what is and isn't valid. **It must be read before any settings change.**

### 3. The correct message order (from Deepgram staff, GitHub discussion #1478)

Deepgram staff (John Vajda) confirmed: `CLIENT_MESSAGE_TIMEOUT` and disconnects happen when audio is sent before `SettingsApplied`. The mandatory sequence is:

```
WS connect → Welcome → send Settings → SettingsApplied → then audio / InjectAgentMessage
```

Our `chat.js` buffers pre-SettingsApplied PCM and flushes after (EC-15 fix) — this is correct. **But if Settings is rejected (Error instead of SettingsApplied), the whole sequence stalls and the student hears nothing.** GATE 3 is the only thing that catches this.

### 5. FAILED_TO_SPEAK — the next silent killer (unanswered in Deepgram's own forums as of 2025)

From [GitHub discussion #1549](https://github.com/orgs/deepgram/discussions/1549): a developer configured `aura-2-thalia-en`, `nova-3`, `linear16` at 16kHz — settings applied cleanly — then immediately got `FAILED_TO_SPEAK: Failed to speak. Please check your agent.speak settings`. No Deepgram staff response. Root cause unknown. **This is a live unresolved failure mode that our GATE 4 (audio chunk received) catches and the forums don't.** If GATE 3 is green but GATE 4 is red, that's exactly this bug class. Do not deploy.

Known confirmed triggers:
- Third-party TTS providers (ElevenLabs, Cartesia) — fail for most developers, use Deepgram aura-2 only
- Wrong model name in `speak.provider.model` (typo, deprecated name, region-unavailable model)
- Audio output encoding mismatch between Settings and what the client expects

### 6. THINK_REQUEST_FAILED / FAILED_TO_THINK — gpt-4o-mini outages are real and recurring

From [GitHub discussion #1433](https://github.com/orgs/deepgram/discussions/1433): Deepgram staff (John Vajda) confirmed: *"Our metrics show degraded service for 4o-mini, 4.1-mini, 4.1 nano, 4.1, and possibly other OpenAI models."* — this is a Deepgram-side outage of their managed OpenAI pipeline, not our code. Incident documented at [status.deepgram.com](https://status.deepgram.com/incidents/btbhfrzzyk39). **When OBI goes silent and GATE 3 is green but GATE 4 is red: check Deepgram's status page FIRST before touching any code.** This is a recurring failure mode, not a one-off.

### 7. Audio output: our MP3 setting is the right call — but here is why

Deepgram's own audio playback docs state that linear16 PCM output is raw and uncontainerized, and browsers will not play it without a manually prepended WAV header. Quote: *"Without this header in the Chrome browser case, the audio will not play."* Our Settings use `output.encoding: "mp3"` which sidesteps this entirely — MP3 is a self-describing containerized format browsers play natively. **Never change `output.encoding` to `linear16` without implementing WAV header injection in `chat.js`.** This is a known trap that Deepgram's own docs flag and that would produce silent audio with zero error messages.

### 8. Token auth: raw API key in browser is officially discouraged

From Deepgram's own browser-agent repo: *"Never use API keys in a production browser application. Use bearer tokens."* Their official implementation uses `bearer` scheme for production and `token` (raw key) only for local dev. Our current prod setup returns the raw API key to the browser. This is a known security gap (BB-43 — already backlogged by Michael as low priority). The correct path when ready: `POST /v1/auth/grant` → short-lived JWT → `bearer <jwt>` in WS auth. Not a voice correctness issue, a security posture issue.

### 4. What the pre-deploy process must include going forward

Before changing ANY field in the voice settings block (`agent.listen`, `agent.think`, `agent.speak`, `audio`):

1. **Check the field against the Voice Agent spec** — not the STT spec, not the SDK README, not a ChatGPT summary. The source of truth is [developers.deepgram.com/docs/configure-voice-agent](https://developers.deepgram.com/docs/configure-voice-agent).
2. **Check the V1 migration guide** for whether the field was renamed or removed.
3. **Run GATE 3** (`node test/preflight-ws.mjs`) against dev before deploying. SettingsApplied = field accepted. Error = field rejected, field name is in `description`. This is a 10-second check that would have caught the endpointing bug instantly.

The process failure was not a code bug — it was never reading the right human spec. A static source check would not have caught this. Only a live round-trip catches it.

---

## TOOLCHAIN INSTALL (one-time — all open source, all npm)

Run once from `D:\OB-1-CANONICAL\APPS\NET-PET-AI`. These are the OSS tools the gates depend on. No paid SaaS, no accounts — everything runs locally against the live worker.

```powershell
# E2E + cross-browser engines (Chromium / Firefox / WebKit)
npm install --save-dev @playwright/test
npx playwright install chromium firefox webkit

# Accessibility (axe-core ruleset, runs inside the Playwright harness)
npm install --save-dev @axe-core/playwright

# Page audit — perf / a11y / best-practices / SEO (uses Playwright's Chromium, no extra Chrome)
npm install --save-dev lighthouse chrome-launcher

# Load / concurrency (HTTP round-trips at student scale)
npm install --save-dev autocannon

# WebSocket client for the functional gates (GATE 2-4)
npm install --save-dev ws
```

**Tool → purpose → why this one (all OSS):**

| Tool | License | Gate | Why it, not alternatives |
|------|---------|------|--------------------------|
| Playwright | Apache-2.0 | 2-4, 7, 8 | Only OSS runner driving real Chromium **+ Firefox + WebKit** from one config — covers Safari/iOS without a Mac |
| axe-core | MPL-2.0 | 8 | Industry-standard WCAG engine; same ruleset every screen-reader audit uses |
| Lighthouse | Apache-2.0 | 9 | Google's own measured perf/a11y scores from a real render, not a checklist |
| autocannon | MIT | 10 | Pure-Node HTTP load (no Go/k6 binary to install on Windows); reports real latency percentiles |
| ws | MIT | 2-4 | Node WS client to send the exact Settings payload to the live Deepgram agent |

**Candidates deliberately NOT added (keep the toolchain honest, not bloated):**
- `k6` — superior load tool but needs a separate Go binary install on Windows; autocannon covers student-scale concurrency with zero extra runtime.
- `pa11y` — overlaps axe-core; one a11y engine is enough.
- OWASP ZAP / nuclei — security DAST is real value but heavy; track as a separate `/netpet-security` pipeline, not inline here.

---

## RUN ORDER (HARD GATES — stop on first red)

Run from `D:\OB-1-CANONICAL\APPS\NET-PET-AI`. Every gate must be GREEN before the next runs. A RED gate = HALT, do not deploy, fix root cause, re-run from gate 1.

```
GATE 0  →  Key is alive          (raw API key authenticates against Deepgram REST)
GATE 1  →  Token endpoint serves  (prod /api/deepgram-token returns token + settings, 200)
GATE 2  →  WS auth passes         (token opens wss://agent.deepgram.com, Welcome received)
GATE 3  →  Settings ACCEPTED      (send real Settings → SettingsApplied, NOT Error)  ← THE RUN 101 GATE
GATE 4  →  OBI actually speaks     (binary audio chunk received within 5s of SettingsApplied)
GATE 5  →  Brain lock holds        (speak=aura-2-zeus-en, think=gpt-4o-mini no endpoint, listen=nova-3)
GATE 6  →  Roster gate holds       (inactive studentId → 403, active → 200)
GATE 7  →  Cross-browser           (npm run test:browser → 21/21 across Chrome/FF/Edge/Safari/iOS/Android)
GATE 8  →  Accessibility           (axe-core WCAG 2.1 A/AA → 0 critical/serious violations on live page)
GATE 9  →  Lighthouse audit        (perf/a11y/best-practices/SEO scores above threshold on live page)
GATE 10 →  Load / concurrency      (autocannon student-scale burst → 0 non-2xx, breaker stays closed)
```

If all 11 gates green → deploy authorized. Anything else → HALT.

---

## GATE 0 — KEY IS ALIVE (not theater: real REST round-trip)

```powershell
$apiKey = "910707f04834888ef19ad0011baebd792aa87dba"  # DEEPGRAM_API_KEY, scope: usage:write
$proj = Invoke-RestMethod -Uri "https://api.deepgram.com/v1/projects" -Headers @{ "Authorization" = "Token $apiKey" }
if ($proj.projects.Count -ge 1) { "GATE 0 GREEN — key authenticates, project: $($proj.projects[0].project_id)" }
else { throw "GATE 0 RED — key dead or revoked. Rotate DEEPGRAM_API_KEY before anything else." }
```

**RED means:** key revoked/expired. The token endpoint will serve a dead key and every WS will drop → robot voice / silence. Fix the secret first (`wrangler secret put DEEPGRAM_API_KEY`).

---

## GATE 1 — TOKEN ENDPOINT SERVES (real prod HTTP, 200 + body shape)

```powershell
$r = Invoke-RestMethod -Uri "https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/deepgram-token?studentId=sov100-test-magic"
if ($r.token -and $r.settings) { "GATE 1 GREEN — token + settings returned" }
else { throw "GATE 1 RED — endpoint returned: $($r | ConvertTo-Json -Compress). Check circuit breaker (KV circuit:deepgram:state), KV binding, assertVoiceBrainLock throw." }
```

**RED means:** circuit breaker stuck open (KV `circuit:deepgram:state` = 'open'), KV unbound, or `assertVoiceBrainLock` threw 500. Read the actual `error` field — it tells you which.

---

## GATE 2 + 3 + 4 — THE REAL ONE (WS auth → Settings ACCEPTED → audio streams)

This is the gate that would have caught Run 101. It is non-negotiable. Save as `test/preflight-ws.mjs`:

```js
import { WebSocket } from "ws";
const PROD = "https://net-pet-ai.mrmichaelhobbs123.workers.dev";
const res = await fetch(`${PROD}/api/deepgram-token?studentId=sov100-test-magic`);
const { token, settings } = await res.json();
if (!token || !settings) { console.error("GATE 2 RED — no token/settings"); process.exit(1); }

const ws = new WebSocket("wss://agent.deepgram.com/v1/agent/converse", ["token", token]);
let welcome = false, applied = false, audio = false;

const verdict = await new Promise((resolve) => {
  ws.on("message", (d) => {
    const isJson = typeof d === "string" || d[0] === 0x7b;
    if (isJson) {
      const m = JSON.parse(d.toString());
      if (m.type === "Welcome")          { welcome = true; ws.send(JSON.stringify(settings)); }
      if (m.type === "SettingsApplied")  { applied = true; setTimeout(() => resolve(), 5000); } // wait for audio
      if (m.type === "Error")            { console.error("GATE 3 RED — Deepgram rejected Settings:", m.description); resolve(); }
    } else if (d.length > 0) { audio = true; }   // binary = TTS audio = OBI speaking
  });
  ws.on("error", (e) => { console.error("GATE 2 RED — WS error:", e.message); resolve(); });
  setTimeout(() => resolve(), 15000);
});
ws.close();

if (!welcome) { console.error("GATE 2 RED — WS never reached Welcome (auth failed). Token scope insufficient or key dead."); process.exit(1); }
if (!applied) { console.error("GATE 3 RED — Settings NOT accepted. THIS IS THE RUN 101 BUG CLASS. Read the Error description above and fix the offending field."); process.exit(1); }
if (!audio)   { console.error("GATE 4 RED — SettingsApplied but NO audio in 5s. OBI is silent. Check speak.provider / greeting / InjectAgentMessage."); process.exit(1); }
console.log("GATE 2 GREEN — Welcome received (auth ok)");
console.log("GATE 3 GREEN — SettingsApplied (Deepgram accepts payload)");
console.log("GATE 4 GREEN — audio chunk received (OBI speaks)");
```

```powershell
node test/preflight-ws.mjs   # exit 0 = gates 2-4 green; non-zero = HALT
```

**Why this is the real test:** it sends the EXACT settings object prod serves, to the EXACT live WS endpoint students hit, and asserts the three signals that mean "a student will hear OBI": auth (Welcome), payload accepted (SettingsApplied), voice produced (binary audio). No field-existence theater anywhere.

---

## GATE 5 — BRAIN LOCK HOLDS (real served payload, not source grep)

```powershell
$s = (Invoke-RestMethod -Uri "https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/deepgram-token?studentId=sov100-test-magic").settings
$ok = $s.agent.speak.provider.model -eq "aura-2-zeus-en" `
  -and $s.agent.think.provider.model -eq "gpt-4o-mini" `
  -and $s.agent.think.provider.type -eq "open_ai" `
  -and (-not $s.agent.think.provider.endpoint) `
  -and $s.agent.listen.provider.model -eq "nova-3"
if ($ok) { "GATE 5 GREEN — Zeus/gpt-4o-mini(in-house)/nova-3 served live" }
else { throw "GATE 5 RED — brain lock drifted in SERVED payload: $($s.agent | ConvertTo-Json -Compress)" }
```

**Note:** this checks the *served* payload, not the source file. A runtime mutation or env override that the source-grep test misses gets caught here.

---

## GATE 6 — ROSTER GATE HOLDS (real 403/200 round-trip)

```powershell
# Inactive must be rejected
$inactive = try { (Invoke-WebRequest -Uri "https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/deepgram-token?studentId=lam-bluetech" -SkipHttpErrorCheck).StatusCode } catch { $_.Exception.Response.StatusCode.value__ }
# Active must pass
$active = (Invoke-WebRequest -Uri "https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/deepgram-token?studentId=quy-bluetech" -SkipHttpErrorCheck).StatusCode
if ($inactive -eq 403 -and $active -eq 200) { "GATE 6 GREEN — inactive=403, active=200" }
else { throw "GATE 6 RED — roster gate broken: lam=$inactive (want 403), quy=$active (want 200)" }
```

---

## GATE 7 — CROSS-BROWSER (real headless browsers, 21 tests)

```powershell
npm run test:browser   # Chrome, Firefox, Edge, Safari(WebKit), Safari iOS x2, Chrome Android
# PASS = "21 passed"; anything less = HALT
```

---

## DEPLOY AUTHORIZATION

Only after GATES 0–7 all GREEN:

```powershell
npx wrangler deploy --env dev        # 1. dev first (FIREWALL RULE)
node test/preflight-ws.mjs           # 2. re-run gate 2-4 against dev URL (edit PROD const) — must stay green
npx wrangler deploy                  # 3. promote to prod ONLY if dev green
node test/preflight-ws.mjs           # 4. re-run against prod — final confirmation OBI lives
```

If step 4 is not green, OBI is dead in prod — roll back immediately (`wrangler rollback`) and HALT.

---

## THE RULE FOR ADDING CHECKS (read before you touch this file)

Before adding any new gate, answer ONE question: **"Does this hit a live dependency and assert a real success signal?"**

- ✅ "Send X to Deepgram, assert Y comes back" → REAL, add it.
- ✅ "Hit endpoint, assert HTTP status + body shape" → REAL, add it.
- ❌ "Check the source contains the string X" → THEATER, do not add. (This is exactly what let Run 101 ship.)
- ❌ "Check the config object has field X" → THEATER. Fields can be present and still rejected by the API.

Every gate here was earned by a bug that shipped to a paying student. Add gates the same way: when something breaks in prod, write the real round-trip check that would have caught it, then it never breaks silently again.

---

## BUG → GATE LEDGER (the receipts)

| Run | Bug shipped to students | Gate that now catches it |
|-----|------------------------|--------------------------|
| 101 | `listen.endpointing: 700` bare int → Settings rejected → OBI silent | GATE 3 |
| pre-101 | `/v1/keys` mint failed silently → raw key → WS auth drop → robot voice | GATE 2 |
| pre-101 | robot voice = browser speechSynthesis fired because no audio from Deepgram | GATE 4 |
| pre-101 | dev had no KV binding → 500 Internal error | GATE 1 (reads real `error` field) |
| 99/100 | any studentId could mint a token (no roster check) | GATE 6 |
| ongoing | brain re-routed outside Deepgram / wrong voice model | GATE 5 (served payload, not source) |
| ongoing | works on Chrome, dead on Safari/iOS | GATE 7 |
```
