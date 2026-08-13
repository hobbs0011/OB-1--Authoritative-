# OB-1 Kilo Dispatch — Read this at every session start

**Kilo-native mode.** All dispatch routes through the in-session model.

## Routing

Inline-first. For write/create/generate tasks, execute directly in-session. Phoenix-Architecti worker is available as an optional fallback only when inline execution fails or is blocked.

| Tier | Model | When |
|------|-------|------|
| Inline | In-session model (default) | ALL write / implement / generate / fix / debug / refactor / audit / pipeline tasks |
| T2 | DeepSeek V4 Pro | Final rulings / irreversible decisions / arbitration only |

## Worker URLs (reference only — do not dispatch unless inline fails)
- phoenix-architecti: https://phoenix-architecti.mrmichaelhobbs123.workers.dev
- pcc (empire dashboard): https://pcc.mrmichaelhobbs123.workers.dev
- net-pet-ai (main app): https://net-pet-ai.mrmichaelhobbs123.workers.dev
- soul-logger: https://soul-logger.mrmichaelhobbs123.workers.dev

## Cold Boot
1. Read CANON/SYSTEM/COLD-START-BOOT.md
2. Read OPERATIONS/BACKBURNER-PIPELINE-LOG.md
3. Read RRL/RRL-[latest].txt + latest RRL/DNA-LOG-*.txt
4. git log -5 --oneline

## PRE-CODE GATE — MANDATORY BEFORE ANY APPS/NET-PET-AI CHANGE

Run 31 car crash: agent touched chat.js/index.js WITHOUT reading docs. Destroyed 4 runs of uncommitted work.

Before any NET-PET-AI change, YOU MUST READ:
1. `OPERATIONS/STUDENT-PORTAL-DEV.md` — full file, not partial
2. `CANON/RESEARCH/deepgram-voice-agent-edge-cases.md` — §2 at minimum

Skipping = L56 violation = Run 31 repeat.

### Deepgram Voice Agent — Invalid Fields (WILL BREAK SETTINGSAPPLIED)
Never add: `language_hints`, `smart_format`, `mip_opt_out`, `utterance_end_ms`, `audio.output.container`, `audio.output.sample_rate`
These are REST STT only — invalid in Voice Agent WS.

### Deepgram Voice Agent — Correct Protocol
- WS URL: `wss://agent.deepgram.com/v1/agent/converse`
- Text inject: `{type: "InjectUserMessage", content: "..."}`
- Agent inject: `{type: "InjectAgentMessage", message: "..."}`  (field = `message` not `content`)
- Prompt update: `{type: "UpdatePrompt", prompt: "..."}` (NOT UpdateInstructions)
- Context history: `agent.context.messages` (NOT root `messages`)
- TTS model: `aura-2-zeus-en` (DO NOT revert to asteria)

## L55 COMMIT_DONT_HOLD
Every verified working feature MUST be committed before session end.
Gapless audio v2+v3 was lost permanently because it ran uncommitted across 4 runs (Runs 27-31).

## Security Constraints
- DO NOT REMOVE CLOUDFLARE_API_TOKEN before deploy
- GAP-8 FROZEN: never touch net-pet-ai-production v1.6.2
- NOTION BLACKLISTED
- lam portal BB-07: DO NOT BUILD without explicit Michael direction
- Secrets restore: pwsh SCRIPTS/set-pa-secrets.ps1
- SOULCOUNT: per-session only (aggregate banned per SOV100)

## Scout Protocol — MANDATORY FOR ALL /PhoenixRISE SCOUT MISSIONS

**Canonical doc search ALWAYS precedes SOUL system search.**

When scouting a territory (game, project, feature), follow this exact search order:
1. **Canonical project docs first** — `CANON/<PROJECT>/DOCS/`, `CANON/<PROJECT>/SPECS/`, `CANON/<PROJECT>/CODE/`
2. **Reincarnation death seals** — `CANON/REINCARNATION/run*-reincarnateDEATH.md` for explicit decisions and pipeline definitions
3. **Legacy archives** — `CANON/ARCHIVE/`, `APPS/<PROJECT>/`, `ASSETS/<PROJECT>/`
4. **SOUL-KEYWORDS** — `CANON/SOUL-KEYWORDS/` for session-level keyword signals (secondary, not primary)
5. **DNA EXTRACT** — `CANON/SOUL/EXTRACT/` for structured extraction (tertiary)

**Anti-hallucination rules:**
- A single incidental keyword in SOUL-KEYWORDS/DNA EXTRACT is NOT authoritative evidence.
- Always cross-reference with canonical docs before drawing conclusions about contractors, tools, or pipelines.
- "3D modeling" in a student portal placeholder is NOT a game asset pipeline — verify with `CANON/<PROJECT>/DOCS/3D-ASSET-MANIFEST.md` or equivalent.
- If a search result conflicts with canonical docs, canonical docs win.

**Required scouting checks for game projects:**
- Asset pipeline: search `CANON/<PROJECT>/DOCS/` for manifest, pipeline, or strategy docs
- Tool/service decisions: check `run*-reincarnateDEATH.md` for "Decision" and "Unfinished Actions" tables
- Contractor vs AI service: verify source — human names come from canonical roster docs, AI services come from tool/pipeline docs

## Soul/DNA Capture
Run at session start: `pwsh SCRIPTS/soul-watcher.ps1`
This posts Michael's words to soul-archive D1 in real-time.
