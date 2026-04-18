# OpenClaw Review + Rebrand Fork Plan (NET)

Date: 2026-04-16
Scope: MCP alignment for multi-agent orchestration and fork-without-claw naming

## 1) Live MCP Reality (from local audit)

Live and authenticated now:
- Cloudflare: LIVE (accounts=1, workers=6)
- GitHub: LIVE (user=hobbs0011)
- Notion: LIVE (multiple valid tokens)

Configured in workspace MCP files:
- .mcp.json: cloudflare, github, notion, playwright, chrome-devtools, slack, filesystem, brave-search, discord
- .vscode/mcp.json: zapier, skyvia, pipedream, composio, cloudflare, github, notion, deepseek, context7, playwright, chrome-devtools, memory, filesystem, azure

## 2) OpenClaw GodMode Requirement Match

OpenClaw skill-required MCPs:
- github
- playwright

OpenClaw skill-optional MCPs:
- lighthouse
- a11y
- memory

Current match against this repo:
- github: ready
- playwright: ready
- memory: configured in VS Code MCP, not currently included in root MCP audit checks
- lighthouse: missing
- a11y: missing

Conclusion:
- You are already capable of running the core GodMode workflow.
- To match the full quality-gate intent from OpenClaw docs, add lighthouse + a11y MCP lanes.

## 3) MCPs You Should Connect Next (NET Priority)

Tier 1 (immediate value for NET product velocity)
- Deepgram MCP (voice pipeline quality and STT/TTS validation)
- Stripe MCP (payments/activation flow checks)
- Twilio or WhatsApp MCP lane (student reminders/re-engagement)
- Lighthouse MCP (performance gate for mobile-first student UX)
- A11y MCP (WCAG gate for education accessibility)

Tier 2 (ops amplification)
- Google Drive MCP (lesson collateral ingestion/export)
- Slack MCP (internal alerting)
- Discord MCP (community support workflows)
- Zapier/Pipedream/Composio (cross-system automations)

Tier 3 (advanced control plane)
- Memory MCP hardening (cross-session continuity)
- Context7 + docs retrieval standardization
- Ledger MCP bridge for canonical audit trail

## 4) Can You Fork It Without Calling It Claw?

Yes. Fully possible.

Why:
- Upstream license is MIT, which permits forking, modification, and renaming.
- Requirement: preserve MIT license text and required attribution notices.

Important nuance:
- Some metadata keys (for example clawdbot-specific frontmatter blocks) may be required only if publishing into that exact ecosystem.
- For an internal/private variant, you can rename the product and repository while keeping any required schema keys only where parser compatibility needs them.

## 5) Recommended Rebrand Names

Safe options:
- NET-GodMode-Skill
- Phoenix-Orchestrator-Skill
- OBI-GodMode-Skill
- Sovereign-Orchestrator

Suggested canonical fork target:
- Repository: net-godmode-skill
- Internal package/skill name: net-godmode
- Display title: NET GodMode

## 6) Deterministic Rebrand Checklist

1. Fork upstream repo to your org/account.
2. Rename repository and default branch policy.
3. Replace branding strings in docs:
- OpenClaw
- ClawHub
- clawdbot
- cc-godmode
4. Update frontmatter/service metadata:
- name
- description
- author
- repository URL
- tags
5. Keep MIT license file and attribution intact.
6. Update install docs to your internal install path and commands.
7. Add NET-specific agent workflow rules:
- Vietnamese-first pedagogy checks
- Gospel 444 UI checks
- Cloudflare worker deployment gates
- Durable Object migration gate
8. Add MCP prerequisites table that mirrors your actual stack.
9. Run smoke tests:
- workflow command parsing
- github + playwright availability
- optional gates degrade gracefully if lighthouse/a11y absent
10. Tag release v1.0.0-net and lock changelog.

## 7) Minimal Risk Rules During Fork

- Do not copy proprietary or private credentials into fork.
- Do not break expected schema fields if your runtime parser depends on them.
- Keep command vocabulary stable so operators do not retrain.
- Add a compatibility mode section to avoid migration breakage.

## 8) Recommended Immediate Execution (this week)

- Add Lighthouse MCP and A11y MCP entries to workspace MCP config.
- Expand SCRIPTS/god-mode.ps1 MCP audit to include:
  - playwright
  - memory
  - lighthouse
  - a11y
  - deepseek
- Create fork scaffold with NET naming and preserved MIT headers.
- Run first end-to-end command:
  - New Feature: Add JWT auth with refresh tokens
  - Verify dual quality gates and generated reports.

## 9) Decision

Yes, forking and removing claw branding is viable and low-risk if you preserve MIT terms and keep any runtime-required schema compatibility blocks.
