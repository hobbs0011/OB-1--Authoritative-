---
description: "Use when: creating or editing Kilo command files, adding new slash commands, modifying .kilo/command/ files, writing command definitions for audit, debug, deploy, ledger, status, mode, or any /command"
applyTo: ".kilo/command/**"
---

# Kilo Command File Standards

## Required Frontmatter

```yaml
---
description: "<concise action phrase — what this command does>"
agent: RISE # which agent handles execution (RISE, AGENT99, or STATUS)
---
```

- `description` must be a single imperative phrase — "Run system audit", "Deploy NET-PET-AI worker"
- `agent` must reference an existing agent in `.kilo/agent/`

## Body Format

The body is the instruction the agent receives when the command is invoked. Write it as direct orders — not documentation.

### Simple Commands (start, stop, restart)

Short and direct. One action, one outcome:

```markdown
Start the NET-PET-AI local dev server.
Runs: npm run dev from APPS/NET-PET-AI
```

### Structured Commands (audit, debug, ledger)

Use numbered steps and tree-style output format:

````markdown
Execute system audit:

1. **Repo integrity**: git status, uncommitted changes
2. **Canon verification**: Check all referenced files exist

**Output**:
\```
AUDIT COMPLETE
├── INTEGRITY: ✅/🔴
└── WORKER: ✅/🔴
\```
````

### Parameterized Commands

Commands that accept arguments use `$ARGUMENTS`:

```markdown
Use $ARGUMENTS for specific area: "canon", "ledger", "worker", "full"
```

## Command Categories

| Category        | Commands                                                | Pattern                          |
| --------------- | ------------------------------------------------------- | -------------------------------- |
| **Lifecycle**   | start, stop, restart                                    | Simple — run/kill process        |
| **Diagnostics** | audit, debug, doctor, status, checker                   | Structured — multi-step checks   |
| **Protocol**    | halt, stabilize, reincarnate, romeprotocol, supersaiyan | Behavioral — change agent mode   |
| **Operations**  | run, setup, gateway, console, dashboard                 | Action — execute deployment/test |
| **Navigation**  | help, mode, ssm, ledger                                 | Info — display state or switch   |
| **Utility**     | onboard, pair, terminal, reverseengineer                | Task — specific workflows        |

## Anti-Patterns

- Don't explain what the command is — describe what the agent should DO
- Don't include agent identity/laws — that's in the agent file
- Don't reference UI elements — commands are text-invoked
- Don't make commands that overlap — check existing commands in `.kilo/command/` first (L19 DEDUP)
