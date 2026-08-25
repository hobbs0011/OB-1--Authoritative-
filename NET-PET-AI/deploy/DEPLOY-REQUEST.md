# DEPLOY REQUEST — net-pet-ai LIVE BUG (engineer/supplyline handoff)
Priority: BLOCKING — /api/deepgram-token returns 500 for ALL students, all modes. Voice chat broken.
Field-verified: 500 with VOICE_BRAIN_LOCK error for student=scout, mode=demo, 3x against live workers.dev.

## Root cause (verified against LIVE bundle, not repo)
The live worker's assertVoiceBrainLock() (deployed router.js:14977) requires ALL THREE providers
(listen/speak/think) to be type "deepgram". The settings builder (deployed router.js:15171) was emitting
think.provider.type = "open_ai" => throws => 500.

## Fix (ONE token)
think.provider type+model BOTH corrected (scout correction):
  think:  { type: "deepgram", model: "gemini-3.1-flash-lite" }
  listen: { type: "deepgram", model: "flux-general-en", version: "v2" }
  speak:  { type: "deepgram", model: "aura-2-odysseus-en" }
These match the worker's own /api/health/voice BRAIN_LOCK exactly. The march's first pass only flipped
open_ai->deepgram and kept gpt-4o-mini — WRONG (gpt-4o-mini is an OpenAI model name, not a Deepgram-hosted
model). Deepgram would still reject it. KV prompt cache is safe: assert runs before cache-write, so broken
settings were never cached.
The corrected, ready-to-deploy bundle is committed at: NET-PET-AI/deploy/net-pet-ai-fixed.router.js
This is the EXACT live bundle + the one-token fix. Do NOT rebuild from src/index.js — the repo source is
STALE (older design, lock requires "open_ai"); the deployed worker is newer. MAP != TERRAIN.

## How to deploy (USE WRANGLER, not hand-built multipart)
  cd NET-PET-AI/deploy && wrangler deploy net-pet-ai-fixed.router.js --name net-pet-ai
  # then verify:
  curl -s "https://net-pet-ai.<account-subdomain>.workers.dev/api/deepgram-token?studentId=<real-student>&mode=demo"
  # expect 200 + JSON with settings.agent.think.provider.type == "deepgram"

## ALSO FIX (CI path is broken)
.github/workflows/deploy-net-pet-ai.yml deploys from "APPS/NET-PET-AI/" which DOES NOT EXIST in canon.
Real dir is "NET-PET-AI/". This is why CI can't deploy at all.
Add a post-deploy guardrail step hitting /api/deepgram-token expecting 200 (not just /api/health).

## Terrain map (fleet)
net-pet-ai        = live app, THIS bug
net-pet-ai-dev     = same bug (tested)
net-pet-ai-production = different app, ai:DEAD
net-pet-ai-staging = 404
