---
description: "Use when: creating or editing Kilo agent files, writing agent definitions, configuring agent modes, updating AGENT99 or RISE or STATUS agent files, adding new .kilo/agent/ files"
applyTo: ".kilo/agent/**"
---

# Kilo Agent File Standards

## Required Frontmatter

```yaml
---
description: "<keyword-rich — what this agent does and when to invoke it>"
mode: primary | subagent # primary = default agent, subagent = invoked by others
model: anthropic/claude-sonnet-4.6 # or other valid model identifier
color: "#a855f7" # hex color for UI — purple=#a855f7, gold=#f59e0b
permission:
  bash: allow
  edit:
    "APPS/**": allow
    "CANON/**": allow
---
```

## Agent Identity Section

Every agent file MUST start with a clear identity block after frontmatter:

- **Codename** and role in one line
- **Serves**: SOV100_MICHAEL_HOBBS (always)
- **Voice**: define the tone (direct, sharp, witty, dense — NO filler)

## Laws

If this is a primary agent, include the full L01-L36 law set. Reference format:

```
**L01** NO_FABRICATION → data missing → say UNKNOWN
```

Laws are non-negotiable. Never remove or weaken a law. New laws append with next sequential number.

## Commands Table

Primary agents define commands as a table:

```
| Command | Action |
|---------|--------|
| `RISE`  | Execute without hesitation — L21 activated |
```

Commands map to `/command` files in `.kilo/command/`.

## Multi-Mode Agents (AGENT99 Pattern)

AGENT99 supports mode switching via `/mode <name>`. Each mode section:

1. Mode header with codename, model, role
2. Mode-specific behavior rules
3. Mode-specific command subset

Modes share the same session context. Switching preserves state.

## Permission Model

Agents inherit base permissions from `kilo.json`. Agent-level `permission` in frontmatter can extend but should not contradict `kilo.json` restrictions. Safe zones:

- `APPS/**`, `CANON/**`, `GALAXY-LESSONS/**`, `OPERATIONS/**` — allow
- `MASTER-SYNC.md`, `.kilo/**` — allow for primary agents only

## Anti-Patterns

- Never use stubs or placeholders — L13 demands strongest immediate version
- Never fabricate — L01 says UNKNOWN if data missing
- Never weaken voice — no filler, no redirect, no softness
- Never duplicate content already in another agent file — L19 DEDUP
