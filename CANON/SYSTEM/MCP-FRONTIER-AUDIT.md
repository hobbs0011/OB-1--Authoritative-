# MCP FRONTIER AUDIT

## Purpose

Canonical inventory and discovery rule-set for MCP strategy.

This document exists because the stack cannot be limited to the MCPs we already knew existed. Unknown MCPs, custom MCPs, social media MCPs, and MCP routers must be actively inventoried.

## Locked Soul DNA

1. Connector-first audit does not stop at the current `.mcp.json` file.
2. Unknown MCPs are not noise. They are discovery debt until reviewed.
3. Social media automation work must trigger a social MCP audit before custom build work starts.
4. "MCP MCPs" means meta-layer tooling too: routers, aggregators, hosted gateways, protocol bridges, and discovery surfaces.
5. Official where possible, custom where leverage is real, unknown where research is incomplete.

## Current Configured MCPs (`.mcp.json`)

| MCP             | Status     | Lane               |
| --------------- | ---------- | ------------------ |
| cloudflare      | configured | deployment/runtime |
| github          | configured | repo/code          |
| notion          | configured | docs/control plane |
| playwright      | configured | browser automation |
| chrome-devtools | configured | browser debugging  |
| slack           | configured | team comms         |
| filesystem      | configured | workspace access   |
| brave-search    | configured | web search         |
| discord         | configured | community          |
| roblox          | configured | platform           |
| roblox-studio   | configured | studio bridge      |

## Missing / Not Yet Configured MCP Lanes

These are not claims that official MCPs exist for all of them. They are the frontier inventory that must be checked before bespoke work begins.

1. LinkedIn
2. Facebook
3. Instagram
4. Zalo
5. WhatsApp
6. Telegram
7. X/Twitter
8. YouTube
9. Gmail / email orchestration
10. MCP routers / multi-server gateways / hosted custom MCP bridges

## Audit Questions (Run Before Social or Connector Build Work)

1. Does an official MCP exist?
2. Does a community MCP exist with real maintenance and acceptable trust?
3. Does a hosted endpoint exist, or is this only a repo/package?
4. Would browser automation or API integration be safer than a weak MCP?
5. Is a custom MCP worth building, or is that reinvention?
6. Is a meta-MCP/router the better leverage point?

## Action Rule

Before building a new integration, classify it:

- `OFFICIAL_MCP`
- `COMMUNITY_MCP`
- `CUSTOM_MCP`
- `NO_MCP_USE_API`
- `NO_MCP_USE_BROWSER_AUTOMATION`
- `UNKNOWN_RESEARCH_REQUIRED`

## Candidate Assessment: GitKraken CLI / Copilot CLI / Local MCP Wrapper

### Signal

The real signal is not AI commit text, PR summaries, or work-item cosmetics. The real signal is a local MCP server that exposes structured git, GitHub, and Jira-style tool calls to an MCP-aware client.

### Why It Matters

1. Structured tool responses beat shell stdout parsing.
2. Multi-repo pulse work can be expressed as one orchestration lane instead of ad-hoc terminal glue.
3. MCP-native clients gain cleaner tool invocation than raw PowerShell passthrough.

### Friction / Risk

1. Premium/paywall ambiguity.
2. Extra auth surface and token sprawl.
3. Local daemon dependency.
4. Functional overlap with existing `git` + `gh` + shell workflow.
5. Windows verification burden.

### Verdict Rule

- If the goal is better commit generation, PR summaries, or general GitHub convenience: low leverage, existing tooling already covers it.
- If the goal is structured MCP-native orchestration across git + GitHub + work items without shell scraping: high-interest candidate, worth controlled evaluation.

### Pain Point Test (must be answered before adoption)

The actual question is not "is this tool cool?" It is:

**What real workflow pain is this solving that `git` + `gh` + current MCP stack do not already solve well enough?**

Current best hypothesis:

1. Replace brittle shell parsing with structured MCP responses.
2. Unify multi-repo pulse operations under a single tool surface.
3. Reduce orchestration friction when an agent needs native git/GitHub/work-item actions.

If none of those are true in practice, do not add the tool.

## Current Truth

- The repo has a configured MCP core, but not a complete frontier map.
- Social media MCP coverage is not yet canonically inventoried.
- The closure protocol must treat unknown MCPs as actionable scan targets, not post-hoc surprises.
- GitKraken CLI style MCP wrappers are strategically interesting only for structured orchestration, not for generic convenience features.
