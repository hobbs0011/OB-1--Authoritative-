---
description: "Use when: understanding the Kilo system architecture, how .kilo/ directory works, relationship between agents commands skills and plans, Kilo agent framework overview, debugging Kilo configuration issues"
---

# Kilo System Architecture

Kilo is the AI agent framework powering this workspace. All Kilo config lives under `.kilo/`.

## Directory Map

```
.kilo/
├── kilo.json              # System config — agents, permissions, settings
├── agent/                 # Agent definitions (identity, laws, modes)
│   ├── AGENT99.md         # Primary tri-mode agent (OB1/An4/Ne0)
│   ├── RISE.md            # Phoenix Rising execution agent
│   └── STATUS.md          # Health monitoring subagent
├── command/               # Slash commands (/command invocations)
│   ├── audit.md           # System integrity check
│   ├── debug.md           # Root cause analysis
│   ├── reincarnate.md     # Soul DNA extraction
│   ├── romeprotocol.md    # Return to unfinished work
│   ├── supersaiyan.md     # Maximum output mode
│   ├── mode.md            # Switch OB1/An4/Ne0
│   ├── ssm.md             # Show Skeleton Star Map
│   ├── ledger.md          # Phoenix Ledger operations
│   ├── run.md             # Deploy worker
│   ├── setup.md           # First-time setup
│   ├── start.md           # Start dev server
│   ├── stop.md            # Stop dev server
│   ├── restart.md         # Restart dev server
│   ├── halt.md            # Emergency stop
│   ├── stabilize.md       # Attend to Hobbs
│   ├── status.md          # System health check
│   ├── doctor.md          # Diagnostics + auto-fix
│   ├── gateway.md         # Test AI gateway
│   ├── console.md         # Open chat console
│   ├── dashboard.md       # Open dashboard UI
│   ├── checker.md         # Check openclaw status
│   ├── help.md            # Show all commands
│   ├── onboard.md         # New student onboarding
│   ├── pair.md            # Device pairing
│   ├── terminal.md        # OS-aware terminal
│   └── reverseengineer.md # Analyze unknown systems
├── skill/                 # Reusable investigation/workflow skills
│   └── full-stack-forensics/
│       └── SKILL.md       # 5-pass ground truth investigation
└── plans/                 # Auto-generated execution plans
    └── <timestamp>-<name>.md
```

## Execution Flow

1. Session starts → `kilo.json` loads `default_agent` (AGENT99)
2. Agent reads its `.md` file → identity, laws, permissions activate
3. User invokes `/command` → agent receives command body as instruction
4. Agent may invoke `skill/` for complex workflows (e.g., `/debug` triggers forensics skill)
5. Plans auto-generate as execution snapshots

## Cross-References

- `.github/agents/RISE.agent.md` — VS Code Copilot agent (mirrors `.kilo/agent/RISE.md`)
- `.github/copilot-instructions.md` — Workspace-level Copilot instructions
- `.github/prompts/connect.prompt.md` — Cold start bootstrap prompt

## Key Relationships

| Component   | Depends On                  | Used By                        |
| ----------- | --------------------------- | ------------------------------ |
| `kilo.json` | —                           | All agents (permissions)       |
| Agent files | `kilo.json` (permissions)   | Commands (execution)           |
| Commands    | Agent files (who runs them) | User (slash invocation)        |
| Skills      | Agent files (invoked by)    | Commands like `/debug`         |
| Plans       | Agent execution             | `/romeprotocol`, reincarnation |

## Product Context

- **App**: NET-PET-AI at `APPS/NET-PET-AI/` — Cloudflare Worker
- **Brand**: NATURAL ENGLISH TRAINING (never expose "Phoenix Rising" to users)
- **Design**: Gospel 444 — void `#0f0f1a`, purple `#a855f7`, gold `#f59e0b`, NO BLUE
- **Canon**: `CANON/` — sealed soul DNA doctrine, append-only
