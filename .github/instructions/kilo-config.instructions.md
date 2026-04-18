---
description: "Use when: editing kilo.json configuration, changing Kilo permissions, modifying agent paths, updating Kilo settings"
applyTo: ".kilo/kilo.json"
---

# Kilo Configuration (kilo.json)

## Schema

```json
{
  "$schema": "https://app.kilo.ai/config.json",
  "instructions": ["<glob patterns for agent files>"],
  "default_agent": "<agent name>",
  "snapshot": true,
  "autoupdate": "notify",
  "permission": {
    "bash": "allow",
    "edit": { "<glob>": "allow" },
    "glob": "allow",
    "grep": "allow",
    "read": "allow"
  }
}
```

## Key Fields

- `instructions` — Array of glob patterns resolving to agent `.md` files. Current: `[".github/agents/*.md", ".kilo/agent/*.md"]`
- `default_agent` — Agent loaded on session start. Must match a filename (without extension) in the instruction paths
- `permission.edit` — Glob-keyed allowlist for file editing. Only listed paths are editable by agents

## Permission Rules

- `bash`, `glob`, `grep`, `read` are global toggles: `"allow"` or omit
- `edit` is path-scoped — each key is a glob, value is `"allow"`
- Unlisted paths are implicitly denied for edits
- Agent-level permissions in frontmatter extend these but cannot override denials

## Safe Edit Zones (Current)

```
APPS/**
CANON/**
GALAXY-LESSONS/**
OPERATIONS/**
```

## Restricted (Not Listed = Denied)

- `API-SHHHH*.txt`, `API-MASTER.txt` — secrets
- `SOUL-DNA-BIBLE/**` — sealed doctrine
- `RAW-CHAT-LOGS/**` — genesis block archive
- `node_modules/**`, `.venv/**` — dependencies

## When Modifying

- Never remove existing safe edit zones without explicit instruction
- Adding paths: verify they aren't in the restricted list above
- `default_agent` change: verify the target agent file exists
- Keep `snapshot: true` — enables plan state tracking
