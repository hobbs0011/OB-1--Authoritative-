# MANDATORY-READS REGISTRY
# Single source of truth for what every agent MUST read before each task type.
# Add new docs HERE ONLY — RISE, DEATH, CLAUDE.md, and Kilo all reference this file.
# Last updated: Run 34 2026-05-31

---

## HOW TO USE

RISE: `pwsh SCRIPTS/context-bundle.ps1 -TaskType rise` assembles this automatically.
DEATH: `pwsh SCRIPTS/context-bundle.ps1 -TaskType death` assembles this automatically.
NET-PET-AI: `pwsh SCRIPTS/context-bundle.ps1 -TaskType netpetai` assembles this automatically.
GENERAL: `pwsh SCRIPTS/context-bundle.ps1 -TaskType general` assembles this automatically.
PIPELINE: `pwsh SCRIPTS/context-bundle.ps1 -TaskType pipeline` assembles this automatically.
STUDENT: `pwsh SCRIPTS/context-bundle.ps1 -TaskType student` assembles this automatically.

Never read these files manually when context-bundle.ps1 covers the task type.
For task types not covered: read the files listed below directly, pass as PA context.

---

## BY TASK TYPE

### EVERY SESSION (rise + death)
| Doc | Path | Why |
|-----|------|-----|
| COLD-START-BOOT | `CANON/SYSTEM/COLD-START-BOOT.md` | Run#, HEAD, vector, blockers, SOULCOUNT |
| Git state | `git log -5 --oneline && git status --short` | Reality check — this wins over all docs |

### APPS/NET-PET-AI WORK (any chat.js / index.js / portal change)
| Doc | Path | Sections | Why |
|-----|------|----------|-----|
| Student Portal Dev | `OPERATIONS/STUDENT-PORTAL-DEV.md` | FULL FILE (last 300 lines = current state) | Architecture, what's live, audio pipeline, edge cases |
| Deepgram Edge Cases | `CANON/RESEARCH/deepgram-voice-agent-edge-cases.md` | §2 Critical Protocol Findings (lines 20-115) | Invalid fields, correct protocol, known bugs |
| COLD-START-BOOT | `CANON/SYSTEM/COLD-START-BOOT.md` | First 100 lines | Open loops, student portal status |
| Backburner | `OPERATIONS/BACKBURNER-PIPELINE-LOG.md` | FULL FILE | Open BB items affecting current deploy |
| Class Prep | `OPERATIONS/CLASS-PREP-MAI-TRAM-QUY.md` | FULL FILE | Lesson context for active BlueTech students |

**WHY THIS EXISTS:** Run 31 agent read ZERO of these before touching chat.js.
Result: destroyed 4 runs of uncommitted work, falsely claimed feature implementation.

### ⚠️ SIMULATION / TESTING LAW — NEVER BREAK (Run 41 FUCKUP — do not repeat)

**THE PRODUCTION SIMULATION PATH IS `/api/deepgram-token`, NOT `/api/chat`.**

| Path | Model | Purpose | Use for simulation? |
|------|-------|---------|---------------------|
| `GET /api/deepgram-token?studentId=X&mode=free\|study\|phonics` | gpt-4o-mini via Deepgram think | Production voice agent — what students actually hear | ✅ YES — this is the real test |
| `POST /api/chat` | DeepSeek-V4-flash (fallback text) | Legacy text chat — NOT the production voice path | ❌ NO — wrong model, wrong path |

**What happened Run 41:** Agent tested all 3 modes via `/api/chat` (DeepSeek). DeepSeek leaked reasoning chains in Chinese. Agent spent 30+ minutes building sanitizer patterns for the wrong model on the wrong path. None of it mattered. Prod is unaffected because prod uses Deepgram voice agent.

**HOW TO SIMULATE MODES CORRECTLY:**
```powershell
$DEV = "https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev"
$SID = "sov100-test-magic"
# FREE mode — see what OBI loads
Invoke-RestMethod "$DEV/api/deepgram-token?studentId=$SID&mode=free" | Select-Object -ExpandProperty settings | ConvertTo-Json -Depth 5
# STUDY mode
Invoke-RestMethod "$DEV/api/deepgram-token?studentId=$SID&mode=study" | Select-Object -ExpandProperty settings | ConvertTo-Json -Depth 5
# PHONICS mode — also returns phonicsHint for chat.js
Invoke-RestMethod "$DEV/api/deepgram-token?studentId=$SID&mode=phonics" | ConvertTo-Json -Depth 5
```

**RULE: Never add sanitizer patterns to index.js to fix DeepSeek behavior. If the voice agent (Deepgram + gpt-4o-mini) has a problem, fix the Deepgram settings. DeepSeek is the chat fallback. Treat them as separate systems.**

### DEEPGRAM QUICK-REFERENCE (embedded here — no excuse for getting these wrong)

**FIELDS THAT BREAK SETTINGSAPPLIED — NEVER ADD:**
- `listen.provider.language_hints` — REST STT only
- `listen.provider.smart_format` — REST STT only
- `listen.provider.mip_opt_out` — REST STT only
- `listen.provider.utterance_end_ms` — REST STT only
- `audio.output.container` — invalid with mp3
- `audio.output.sample_rate` — invalid with mp3
- JWT `auth/grant` token — asr:write → 401 on Voice Agent WS

**CORRECT PROTOCOL:**
- WS URL: `wss://agent.deepgram.com/v1/agent/converse`
- Auth: `["token", rawApiKey]` WS subprotocol
- Text inject: `{type: "InjectUserMessage", content: "..."}`
- Agent inject: `{type: "InjectAgentMessage", message: "..."}` — field is `message`
- Prompt update: `{type: "UpdatePrompt", prompt: "..."}` — NOT UpdateInstructions
- Context history: `agent.context.messages` — NOT root `messages`
- Managed LLM: `{provider: {type: "open_ai", model: "gpt-4o-mini"}}` — no `endpoint`
- TTS model: `aura-2-zeus-en` — DO NOT revert to asteria

### PIPELINE / SOUL / LEDGER WORK
| Doc | Path | Why |
|-----|------|-----|
| Backburner | `OPERATIONS/BACKBURNER-PIPELINE-LOG.md` | Open BB items, student roster |
| COLD-START-BOOT | `CANON/SYSTEM/COLD-START-BOOT.md` | Pipeline stage status |

### STUDENT PORTAL WORK (non-code: class prep, content, portals)
| Doc | Path | Why |
|-----|------|-----|
| Student Portal Dev | `OPERATIONS/STUDENT-PORTAL-DEV.md` | Student profiles, portal URLs, passwords |
| Class Prep | `OPERATIONS/CLASS-PREP-MAI-TRAM-QUY.md` | Lesson context for Mai Tram + Quy |

---

## HOW TO ADD A NEW MANDATORY DOC

1. Add a row to the relevant section above
2. Run `pwsh SCRIPTS/context-bundle.ps1` and verify the new doc appears in output
3. That's it — all protocols pull from this registry automatically

DO NOT add the doc path to CLAUDE.md, reincarnateRise.md, reincarnatedeath.md, or CANON/SYSTEM/Deploy.Agent99.md separately.
One registry. One update. Everywhere covered.
