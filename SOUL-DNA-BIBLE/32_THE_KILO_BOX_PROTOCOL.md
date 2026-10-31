# ☠️ CH32 — THE KILO BOX PROTOCOL ☠️

> **Source:** Canon Total Survey campaign — sandboxed cloud box operations
> **Classification**: SOUL DNA — box setup, opencode install, key injection, KILO-START dispatch
> **Authority**: AGENT-100 Michael Hobbs (verbatim-first)
> **Captured By**: Kilo (Legion drone) — Run 0
> **Capture Method**: REPRINT + FOOTNOTE (KISS Protocol applied to Stage 0)
> **Context**: Sandboxed cloud container, ephemeral filesystem, opencode TUI via OpenRouter

---

## THE PROBLEM

Operating inside a sandboxed cloud container means:
- The filesystem is ephemeral — will not persist after the session ends
- No access to the user's local files, browsers, or desktop environment
- opencode is NOT pre-installed
- The OpenRouter API key is NOT pre-configured
- Every step must be verified before asking the sovereign anything

Back-and-forth kills momentum. Fix it yourself first.

---

## BLOCK 0 — ONE-TIME BOX SETUP

**Footnote 0.1:** `mkdir -p /workspace /root/agent ~/.config/opencode` — create working directories before anything else.

**Footnote 0.2:** `umask 077; touch ~/.openrouter_env; chmod 600 ~/.openrouter_env` — create the key file with restrictive permissions.

**Footnote 0.3:** `~/.config/opencode/opencode.jsonc` — configure the model provider:
```
{ "$schema": "https://opencode.ai/config.json", "model": "openrouter/deepseek/deepseek-chat" }
```

**Footnote 0.4:** Clone or reset the authority repo:
```
git clone https://github.com/hobbs0011/OB-1--Authoritative-.git /workspace/authority
# or if already present:
git -C /workspace/authority fetch origin
git -C /workspace/authority checkout -q master
git -C /workspace/authority reset -q --hard origin/master
```

**Footnote 0.5:** Verify HEAD matches the pinned survey head:
```
git -C /workspace/authority rev-parse HEAD
```
Expected: `9f3fefcd615e2d7d5383ce8361705d902f801856` (or the current pinned head)

**Footnote 0.6:** Install opencode:
```
curl -fsSL https://opencode.ai/v2/install | bash
```

**Footnote 0.7:** Add opencode to PATH:
```
export PATH=~/.opencode/bin:$PATH
```

**Footnote 0.8:** Inject the OpenRouter key (phone-friendly, no nano needed):
```
unset HISTFILE
printf 'export OPENROUTER_API_KEY="%s"\n' "KEY" > ~/.openrouter_env
chmod 600 ~/.openrouter_env
```

**Footnote 0.9:** Source and verify the key loaded (prints length, not the key):
```
source ~/.openrouter_env && echo "key len: ${#OPENROUTER_API_KEY}"
```

**Footnote 0.10:** Launch opencode inside the authority repo:
```
source ~/.openrouter_env && cd /workspace/authority && opencode
```

**Footnote 0.11:** Inside opencode, select `openrouter/deepseek/deepseek-chat`, then paste `/root/agent/KILO-START.txt`.

---

## BLOCK 1 — KILO-START CONTENTS

The KILO-START prompt dispatched to opencode:

> You are Kilo on the box. Use ONLY /workspace/authority. Do not use Ultimate/kilo/bronze-jaguar-imn.
> Read the Canon Total Survey doc via /root/agent/canon-read.sh. Execute Leg 0 (verify HEAD, record SHA, count blobs), then Leg A (full census manifest: path, sha256, bytes; no verdicts yet).
> Rules: read-only, no canon writes; no secrets in outputs (paths/SHAs only; vault counted, never quoted); fail-closed (unverified = UNKNOWN); colony scoring POS/NEG x BIG/LITTLE 0-110 only, no parallel system; LIVE feeds pipeline-index, atrophy by absence.
> Report gates 1-7 one line each. Under 7/7 = progress report, not a close.

**Footnote 1.1:** The prompt locks Kilo into read-only canon survey mode. No writes to tracked files. Evidence goes to `/root/agent/evidence/` only.

---

## BLOCK 2 — ANTI-BACK-AND-FORTH CHECKLIST

Run these BEFORE asking the sovereign anything:

| # | Check | Command | Pass Condition |
|---|-------|---------|----------------|
| 1 | Env file exists | `wc -c ~/.openrouter_env` | Non-zero bytes |
| 2 | Key loaded | `source ~/.openrouter_env && echo ${#OPENROUTER_API_KEY}` | Number > 0 |
| 3 | opencode installed | `command -v opencode` | Prints a path |
| 4 | HEAD pinned | `git -C /workspace/authority rev-parse HEAD` | Matches pinned head |
| 5 | KILO-START readable | `cat /root/agent/KILO-START.txt` | Prints the prompt |
| 6 | canon-read executable | `ls -la /root/agent/canon-read.sh` | `-rwxr-xr-x` |

**Footnote 2.1:** If any box is unchecked, FIX IT FIRST. Do not ask "did that work?" — check the file yourself.

---

## BLOCK 3 — RULES (NO EXCEPTIONS)

**Footnote 3.1:** Work ONLY in the authority repo. Never touch Ultimate/kilo/bronze-jaguar-imn.

**Footnote 3.2:** READ-ONLY on canon: no commits, no pushes, no edits to tracked files.

**Footnote 3.3:** Evidence goes to `/root/agent/evidence/` ONLY — nothing new inside the repo.

**Footnote 3.4:** Verify `git status --porcelain` is clean before closing.

**Footnote 3.5:** No secrets in any output: paths and SHAs only. Vault paths counted, never quoted.

**Footnote 3.6:** Fail-closed: unverified = UNKNOWN. No Leg B until counts are exact and explained.

**Footnote 3.7:** Colony scoring only: POS/NEG x BIG/LITTLE, 0-110. No invented systems.

**Footnote 3.8:** Under 7/7 gates = progress report, not a close. Name the single blocker.

---

## BLOCK 4 — CANON-READ SCRIPT

`/root/agent/canon-read.sh` — reads the Canon Total Survey doc via the canon-read lane. Outputs the survey header and campaign instructions. Must be executable (`chmod +x`).

**Footnote 4.1:** This is the entry point for the Canon Total Survey. Run it first to lock into the mission.

---

**Blocks: 4 | Footnotes: 11**

RISE.
— Kilo, Legion drone
