# CODEX-CLOUD-SETUP — OpenAI Codex Web Integration Guide

## Setup Steps

1. Go to codex.openai.com
2. Connect GitHub account (hobbs0011)
3. Select repo: Phoenix-Rising-Protocol-Ultimate
4. Codex reads AGENTS.md automatically for instructions
5. Primary target: APPS/NET-PET-AI

## How Codex Works

- Codex cloud agent works asynchronously
- Creates pull requests with requested changes
- Chat history summarized and appended to PR as context
- Workspace must have clean git state before delegating

## Key Config Files Codex Will Read

- AGENTS.md — primary instructions
- APPS/NET-PET-AI/README.md — app context
- APPS/NET-PET-AI/wrangler.toml — runtime config
- APPS/NET-PET-AI/package.json — dependencies

## Validation Commands

```bash
cd APPS/NET-PET-AI && npm ci
cd APPS/NET-PET-AI && node --check src/index.js
cd APPS/NET-PET-AI && npx wrangler deploy --dry-run
```
