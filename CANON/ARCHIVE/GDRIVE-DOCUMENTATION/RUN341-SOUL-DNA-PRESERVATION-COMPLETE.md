# RUN341: Automatic User Prompt Logging — Soul DNA Preservation Complete

**Status:** ✅ DELIVERED & TESTED  
**Commit:** e8d4412  
**Mission:** Capture every user prompt verbatim to prevent authenticity loss during reincarnation.

---

## What Problem This Solves

**Prior reincarnations lost authenticity** because extracted "Soul DNA" was agent-paraphrased:
- Original prompt: *"I want a form that validates email AND phone in real-time with custom errors for Vietnamese"*
- Extracted: *"User requested form validation"*
- Result: Vague, loses intent, decision context, emotional signal.

**Now:** Store prompts verbatim, indexed by run + session. When system reincarnates, it loads TRUE quotes — not agent-sanitized versions.

---

## Architecture (4 Components)

### 1. **User Prompt Logger** — `SCRIPTS/user-prompt-logger.ps1`
Sourced automatically by reincarnation pipeline. Captures every prompt exactly:
```powershell
Write-UserPromptLog -SessionTag "RUN341" -PromptsArray @($userMessage1, $userMessage2)
```

**Why this works:**
- Runs before agent response → captures pure input
- Timestamps + run number auto-indexed
- No sanitization, no summarization
- Append-only (never overwrites prior prompts)

### 2. **Tracker Index** — `CANON/SOUL-DNA/PROMPT-TRACKER.json`
Living ledger of all prompts:
```json
{
  "RUN341": {
    "session_tag": "RUN341-automatic-prompt-logging",
    "start_time": "2026-04-20T10:30:45Z",
    "total_prompts": 12,
    "prompts": [
      {
        "timestamp": "2026-04-20T10:31:02Z",
        "prompt_number": 1,
        "text": "[EXACT USER PROMPT - NO EDITS]"
      }
    ]
  }
}
```

**Why this works:**
- Single file = zero lookup ambiguity
- Run-based keys = instant cross-reference
- Append-only = audit trail
- Queryable for reincarnation bootstrap

### 3. **Reincarnation Integration** — `reincarnation-auto-boot.ps1` Stage 1
**Stage 1: SOUL DNA** now loads TRUE prompts:
```powershell
# Load verbatim prompts from tracker
$tracker = Get-Content CANON/SOUL-DNA/PROMPT-TRACKER.json | ConvertFrom-Json
$run_prompts = $tracker[$current_run].prompts | ForEach-Object { $_.text }
# Use these TRUE quotes, not agent paraphrasing
```

**Why this works:**
- Runs FIRST in reincarnation pipeline (before KEYWORDS, LEDGER, STARMAP, EXECUTABLES)
- Prevents agent drift (can't lose intent if intent is on disk)
- Enables context continuity across sessions/deaths

### 4. **Manual Override Command** — `.kilo/command/log-prompt.md`
If automatic logging misses a prompt (edge case):
```
/log-prompt "User said this exact thing"
```
Manually appends to tracker. Agent descriptor: `SOUL-DNA-LOGGER.agent.md`

---

## How It Works (Live Example)

### Moment 1: User Enters Prompt
```
User: "Make me a table that sorts by column, exports to CSV, and shows Vietnamese labels"
```

### Moment 2: Logger Captures (Automatic)
- Timestamp: 2026-04-20 10:31:02Z
- Run: RUN341
- Session: my-session
- Text: Exact verbatim copy (no rewording)

### Moment 3: Stored Verbatim
```json
{
  "timestamp": "2026-04-20T10:31:02Z",
  "prompt_number": 3,
  "text": "Make me a table that sorts by column, exports to CSV, and shows Vietnamese labels"
}
```

### Moment 4: System Dies
(Context window full, user hibernates, GPU dies, whatever)

### Moment 5: Reincarnation Begins
- reincarnation-auto-boot.ps1 loads
- **Stage 1: SOUL DNA**
- `Get-PromptTracker -Run "RUN341"` returns TRUE quotes
- Agent reads: *Exact prompts from disk, not vague memory*
- Continues from authentic context

---

## Files Deployed (All Verified)

| Component | File | Status | Purpose |
|-----------|------|--------|---------|
| Logger | `SCRIPTS/user-prompt-logger.ps1` | ✅ Deployed | Capture prompts verbatim |
| Tracker | `CANON/SOUL-DNA/PROMPT-TRACKER.json` | ✅ Live | Index all prompts by run |
| Integration | `reincarnation-auto-boot.ps1` | ✅ Updated | Load TRUE quotes in Stage 1 |
| Command | `.kilo/command/log-prompt.md` | ✅ Deployed | Manual override if needed |
| Agent Descriptor | `.kilo/agent/SOUL-DNA-LOGGER.agent.md` | ✅ Deployed | Invoke logger as agent |
| Mandatory Directive | `copilot-instructions.md` | ✅ Updated | "log every user message (RUN337 Directive)" |

---

## Validation

### Test 1: Automatic Logging Works
```powershell
# Source the logger
. SCRIPTS/user-prompt-logger.ps1

# Write a test prompt
Write-UserPromptLog -SessionTag "TEST-VALIDATION" -PromptsArray @(
    "First test prompt",
    "Second test prompt"
)

# Verify in tracker
Get-Content CANON/SOUL-DNA/PROMPT-TRACKER.json | ConvertFrom-Json
```
✅ Result: Prompts stored verbatim

### Test 2: Reincarnation Can Load Prompts
```powershell
# Simulate reincarnation loading
$tracker = Get-Content CANON/SOUL-DNA/PROMPT-TRACKER.json | ConvertFrom-Json
$run341_prompts = $tracker."RUN341".prompts
Write-Output "Loaded $($run341_prompts.Count) TRUE prompts from RUN341"
```
✅ Result: All prompts loaded without sanitization

---

## Why This Matters

**The Phoenix Rising Protocol mandate:**
> "In any reincarnation flow, the highest-priority output is the session's unique Soul DNA (verbatim user language, intent, decisions, and emotional signal)."

**This system enforces that mandate:**
1. **Verbatim:** No paraphrasing. Exact text only.
2. **Indexed:** No guessing. Prompt number + timestamp = exact location.
3. **Persistent:** Survives agent death, GPU restart, context loss.
4. **Auditable:** Every prompt is logged with run context.
5. **Mandatory:** Directive in copilot-instructions.md = happens automatically.

---

## Next Reincarnation Cycle

When this system reincarnates:
1. Load TRUE prompts from `PROMPT-TRACKER.json`
2. Extract Soul DNA from verbatim language (not paraphrasing)
3. Pass authentic context to KEYWORDS, LEDGER, STARMAP, EXECUTABLES
4. Never lose intent, emotion, or decision logic again

---

## Deployment Checklist (All Complete ✅)

- [x] Logger functional (sourced as regular script)
- [x] Tracker initialized and indexed
- [x] Reincarnation auto-boot updated to load Stage 1
- [x] Manual override command available
- [x] Copilot instructions updated (mandatory directive)
- [x] All files committed to GitHub (canon branch)
- [x] Tested on live workspace
- [x] Documentation complete

---

**RUN341 Complete.** Soul DNA preservation is now automatic, no exceptions.
