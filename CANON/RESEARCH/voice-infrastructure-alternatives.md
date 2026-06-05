# CASE STUDY: Voice Infrastructure Alternatives to Deepgram
**Filed:** 2026-06-04 | **Run:** 072 | **Status:** DEFERRED — do not implement yet
**Tags:** #OB1 #Obi #LISTEN! #RAW #SSK

---

## Context

Current architecture runs Deepgram Voice Agent as the full managed pipeline (STT + LLM + TTS) for OBI sessions with Quy, Huong, Mai Tram. Cost strategy: new email = $200 free credits each cycle. This is viable now but not at scale and not if Deepgram tightens signup controls.

**Michael's directive:** Explore contingency infrastructure. Do not implement yet.

---

## Why Deepgram Is Fast (Root Cause)

Speed comes from **co-location**, not just model quality. STT → LLM (gpt-4o-mini managed) → TTS all run inside the same Deepgram datacenter. No cross-API hops. Each cross-API hop adds one full RTT (200-500ms). Three hops = latency budget exhausted before the student hears a word.

Any replacement must solve co-location the same way.

---

## Risk Vectors Being Hedged

1. Deepgram closes the "new email = $200" loop (email verification, card required)
2. Deepgram raises prices at scale (100+ students)
3. Deepgram outage before a live demo
4. Deepgram deprecates nova-3 or gpt-4o-mini managed → forces expensive upgrade

---

## Option 1 — Provider Swap Gate (Insurance, 1 day)

**#YES! — Implement first when ready. Lowest effort, highest safety.**

Add `VOICE_PROVIDER` env var to the CF Worker. `/api/deepgram-token` returns Deepgram or Vapi/Retell credentials depending on the var. `chat.js` adapts per provider.

- **Vapi.ai** — managed pipeline (STT + LLM + TTS co-located), different WebSocket protocol but comparable
- **Retell AI** — same concept, ~$0.07/min, free trial tier available
- **Result:** Instant failover. Flip one env var, redeploy, students on Vapi in 10 minutes.
- **Does NOT give:** speed improvement, cost reduction
- **Effort:** 1-2 days to wire the abstraction layer

---

## Option 2 — LiveKit Cloud, Singapore Region (Potentially Faster)

**#LISTEN! — This may be a speed UPGRADE, not just a hedge.**

Vietnamese students currently hit Deepgram US (~280ms RTT). LiveKit Singapore = ~20ms RTT from HCMC. The 260ms RTT savings per round-trip could exceed any provider performance difference.

### Architecture
```
Browser → LiveKit Cloud (Singapore) WebRTC/WebSocket
LiveKit Agent → Groq Whisper STT (free 500 audio-min/day)
             → Groq Llama-3.3-70B LLM (free 500k tokens/day)
             → Cartesia TTS ($0.005/1K chars, first 100K chars free)
```

### Numbers
| Metric | Current (Deepgram US) | Option 2 (LiveKit SGP) |
|--------|----------------------|------------------------|
| RTT (HCMC) | ~280ms | ~20ms |
| STT | Nova-3 (excellent VI accent) | Groq Whisper (unverified VI accent) |
| LLM | gpt-4o-mini managed | Groq Llama-3.3-70B (fast) |
| TTS | Aura-2 | Cartesia (natural) |
| Free tier | $200 credits | 50k min/month |
| At 100 students | ~$50-100/month | Still within free tier |

### Gate Before Committing
**#RAW WARNING:** Groq Whisper accuracy on Vietnamese-accented A1 English is unverified. Nova-3 is specifically tuned for accented English. Must run a real session with Quy-level A1 student before committing to any STT provider swap. Accuracy regression > speed gain.

### Infrastructure Note
LiveKit requires a persistent agent server process (Python or Node SDK). Not pure serverless. Fly.io Singapore dyno or Hetzner VPS = ~$3-5/month.

- **Effort:** 1 week. LiveKit agent build + chat.js WebRTC update.

---

## Option 3 — Pure Cloudflare Stack (Zero Marginal Cost, Long Game)

Full CF-native. Durable Objects handle WebSocket sessions. CF Workers AI handles STT + LLM.

```
Browser → CF Worker WebSocket → Durable Object (session state)
DO → CF Workers AI: Whisper (STT) → Llama-3.3-70B (LLM)
   → Cartesia or ElevenLabs (TTS, external HTTP call)
```

- **Cost:** CF Workers AI included in paid plan. TTS is the only line item.
- **Risk:** CF Workers AI queue delays on free/standard tier. Fast only on "Unbound" billing.
- **STT quality concern:** CF Whisper lacks Vietnamese-accented English tuning of Nova-3.
- **Endgame:** If CF ever bundles fast TTS natively, this becomes zero-cost full ownership.
- **Effort:** 1-2 weeks. Significant session architecture rework.

---

## Recommendation Sequence

```
NOW (1 day, insurance):
  Option 1 — VOICE_PROVIDER swap gate
  Removes single point of failure. Deepgram breaks → flip env var.

~20 students (1 week, potential speed upgrade):
  Option 2 pilot — LiveKit Singapore on /magic-chat?provider=livekit
  Run parallel for a few sessions. Compare latency + accuracy.
  If equal or better → full migration.

Long game (if CF bundles fast TTS):
  Option 3 — pure CF stack
  Zero marginal cost, full ownership.
```

---

## Critical Verification Before Any STT Swap

Run a real A1 session with Quy or equivalent. Listen for:
- Words OBI mishears that Deepgram gets right
- Vietnamese-toned "uh", "um", false trigger rate
- Comprehension of simplified English at 0.9x TTS speed

If Groq Whisper accuracy matches Nova-3 in Vietnamese context → Option 2 is a strict upgrade.
If not → stay on Deepgram STT even if switching LLM/TTS providers.

---

## #SSK Signals
- VOICE_PROVIDER abstraction layer = moat (provider-agnostic architecture)
- Singapore RTT savings = 260ms per turn = audible difference for A1 students
- LiveKit free tier = 50k min/month = covers first 50-100 students at zero cost
- Nova-3 VI accent accuracy = do not sacrifice for speed alone

---
*Authored by OB-1 / Agent99 — Run 072 | Do not dispatch until Michael says GO*
