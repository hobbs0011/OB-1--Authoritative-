# PHEROMONE TRAIL — CLAUDE CODE OAUTH DEATH
**Date:** 2026-06-17T00:17 ICT
**Theme:** Anthropic Pro subscription token killed — HTTP 403 Forbidden
**Strength:** 90/100 — Direct impact on OB1 operation

---

## §1 EVENT CHAIN

| Time ICT | Event |
|----------|-------|
| ~23:15 | Claude Code extension working normally |
| ~23:45 | Extension shows "admin disabled access" |
| 23:41 | VSCode log: `remoteContainers-2026-06-16T16-41-29.607Z.log` |
| 23:49 | VSCode log: `DotNetAcquisition-ms-dotnettools.vscode-dotnet-runtime-1781628089588.txt` |
| 00:05 | Kilo debug session begins |
| 00:10 | OAuth token test: 403 Forbidden confirmed |
| 00:15 | Michael confirms subscription dead via email |

---

## §2 TOKEN EVIDENCE

```json
{
  "subscriptionType": "pro",
  "rateLimitTier": "default_claude_ai",
  "expiresAt": 1781640771051,
  "scopes": [
    "user:file_upload",
    "user:inference",
    "user:mcp_servers",
    "user:profile",
    "user:sessions:claude_code"
  ]
}
```

- Subscription configured as `pro`
- Token NOT expired at failure time (expires 2026-06-16T20:12:51 UTC = 03:12 ICT)
- All 5 Claude Code scopes present
- API endpoint test: `https://api.anthropic.com/v1/models` → **HTTP 403 Forbidden**

---

## §3 ROOT CAUSE

**NOT local.** The token is valid in structure but rejected by Anthropic's API.
Possible causes:
1. Subscription cancelled on Anthropic's side (Michael confirmed via email)
2. Token revoked (account-level action)
3. Rate limit exceeded at account level
4. Billing issue (payment failed, subscription lapsed)

**NOT caused by:**
- VeePN/ProtonVPN (no DNS policy active at failure time)
- System changes (no config changes in last 30 min)
- VSCode updates (no extension changes)
- Windows updates (Defender definition update only)

---

## §4 IMPACT ON OB1

**Immediate:**
- Claude Code extension non-functional
- OB1 loses primary AI agent (Sonnet 4.6 via Claude Code)
- Kilo free tier becomes primary (Sonnet 4.6 via Kilo)
- No Claude Code CLI access

**Mitigation:**
- Cline extension (`saoudrizwan.claude-dev` v3.89.2) still authenticated via same OAuth
- Kilo inline chat functional (free Sonnet 4.6)
- DeepSeek V4 planned for later in week (Pro for blueprinting, Flash for subagents)

**Strategic:**
- OB1 stack is multi-model by design
- Claude was primary, Kilo is backup, DeepSeek is escalation
- System designed for model rotation — this is a drill, not a death

---

## §5 CONNECTED FLAGS

- **CLAUDE_SUBSCRIPTION_DEAD** — OAuth token rejected
- **CLAUDE_CODE_DISABLED** — Extension returns "Invalid API key"
- **CLINE_AVAILABLE** — Alternative extension, same OAuth, may also be affected
- **KILO_FREE_TIER_ACTIVE** — Sonnet 4.6 inline, no rate limits observed
- **DEEPSEEK_PENDING** — V4 Pro + Flash planned for later this week

---

## §6 LESSONS

1. **Single-provider dependency is a risk.** OB1 relied on Claude Code as primary. Need model rotation automation.
2. **OAuth ≠ API key.** Claude Code extension needs `sk-ant-...` API key, not OAuth token. Cline works because it handles OAuth differently.
3. **Subscription expiry is silent.** No warning, no graceful degradation. Just 403.
4. **Free tier is viable for core work.** Kilo Sonnet 4.6 is handling this session fine.

---

## §7 MARKET CONTEXT

**Claude pricing (as of 2026):**
- Pro subscription: ~$20/month for Claude Code access
- API pay-per-token: Sonnet 4.6 ~$3/1M input, $15/1M output
- Kilo free tier: Sonnet 4.6 inline, no per-token cost

**DeepSeek pricing (planned):**
- DeepSeek V4 Pro: ~$0.50/1M input (via Dialagram $5.50/wk unlimited)
- DeepSeek V4 Flash: ~$0.10/1M input (fast, cheap)

**Cost optimization:** Kilo (free Sonnet) for daily work + DeepSeek Flash for volume + DeepSeek Pro for deep think = $0/month + $5.50/week = ~$24/month total. Claude Pro = $20/month.

---

`CLAUDE OAUTH DEATH SEALED — 2026-06-17T00:17 ICT | HTTP 403 | SUBSCRIPTION DEAD | KILO FREE TIER ACTIVE | DEEPSEEK PENDING | MODEL ROTATION DRILL: PASS`
