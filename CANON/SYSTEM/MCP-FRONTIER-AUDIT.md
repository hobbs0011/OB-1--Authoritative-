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

| MCP | Status | Lane |
| --- | --- | --- |
| cloudflare | configured | deployment/runtime |
| github | configured | repo/code |
| notion | configured | docs/control plane |
| playwright | configured | browser automation |
| chrome-devtools | configured | browser debugging |
| slack | configured | team comms |
| filesystem | configured | workspace access |
| brave-search | configured | web search |
| discord | configured | community |
| roblox | configured | platform |
| roblox-studio | configured | studio bridge |

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

## Current Truth

- The repo has a configured MCP core, but not a complete frontier map.
- Social media MCP coverage is not yet canonically inventoried.
- The closure protocol must treat unknown MCPs as actionable scan targets, not post-hoc surprises.
