# PHEROMONE TRAIL — OPENCLAW WORKSPACE
**Date:** 2026-06-17T00:36 ICT
**Strength: 85/100** | Type: RECON — agent workspace, configuration

---

## §1 WORKSPACE DIRECTORY

**Path:** `C:\Users\mrmic\.openclaw\workspace\`
**Contents:**
- `.git/` — git repository
- `.openclaw/` — nested OpenClaw config
- `AGENTS.md` — agent definitions
- `HEARTBEAT.md` — heartbeat config
- `IDENTITY.md` — agent identity
- `SOUL.md` — agent personality/prompt
- `TOOLS.md` — tool definitions
- `USER.md` — user profile

**Assessment:** This is the agent's "brain" — its configuration, identity, personality, and tools are all defined here as markdown files.

**Risk:** These files define how the agent behaves. If compromised, attacker could change agent behavior.

---

## §2 FLAGS

1. **OPENCLAW_WORKSPACE_GIT** — workspace is a git repo
2. **OPENCLAW_AGENT_CONFIG_IN_MARKDOWN** — AGENTS.md, SOUL.md, etc.
3. **NEEDS_READ** — contents of markdown files not yet examined

---

`OPENCLAW WORKSPACE SEALED — 2026-06-17T00:36 ICT | GIT REPO | AGENT CONFIG IN MARKDOWN | AGENTS/SOUL/IDENTITY/TOOLS/USER`
