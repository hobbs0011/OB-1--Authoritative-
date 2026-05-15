# Reincarnation Entry — 2026-03-23
## Session: OB1 Chat — Alarm Hardening, Pipeline Delegation, MCP Stack Architecture

**Thread:** Recovered from failed reincarnation — transcript pasted by Michael into 2026-03-24 session

---

## 💬 Raw Quotes (Verbatim, Michael's Words)

**On engineering posture:**
> "Yes, but go a step further, engineer the best possible immediatly, put sub afgents on it, then give me a list of the other priority todos"

**On instruction bloat (CORRECTION):**
> "warning, tokens for your agent instructions are 88k, and optimal is 60k, adit instructions immediatly. add to pipeline"

**On pipeline delegation:**
> "great assign that pipeline to a sub agent, then map another 20 pipeline of which we will also delegate on completion"

**On autonomous chaining:**
> "rinse and repeat, auto approved"

> "also make use of this function" *(referencing Function 4 — auto-approval handoff gate)*

**On escalation:**
> "continue, escalate"

> "audit and report, and push automation"

**On Super Saiyan:**
> "cotinue, super saiyan mode engaged"

> "continue, super saiyan mode continued, escalated, locked in"

**On autonomous pipelines (CORRECTION — repeated):**
> "create a pipeline of 20 of these actions, I dont wanna come back to click enter every few min, map it"

**On MCP stack architecture (the truth block):**
> "Yes. Then here is the truth: the best for us is not one random custom MCP URL."

> "My blunt recommendation: If that field only allows one custom MCP server URL, use it for Cloudflare MCP."

> "Best = official where possible, custom only where it gives us real leverage."

> "The URL rule: Do not paste: repo links, docs links, Chrome Web Store links. Paste a real hosted MCP endpoint."

**On cross-agent coordination:**
> "synch with other agents"

> "check on all agents assign pipelines from this session, if compelte, push them forward"

---

## ⚖️ Decisions Made

1. **Engineer strongest version first, then subagents, then priority list.** This is the default execution order now.
2. **Instructions token budget: 88K → 60K target.** Bloated instructions are a performance and cost hazard — compress immediately.
3. **20-action autonomous pipeline model adopted.** Michael does not want to press enter every few minutes. Map 20 actions, execute top-to-bottom.
4. **Pipeline delegation to subagents.** Assign completed pipeline to a subagent, map the next 20, delegate on completion.
5. **"Rinse and repeat, auto approved."** Pre-authorized chaining between pipeline waves via Function 4 handoff gate.
6. **MCP stack priority locked:**
   - Priority 1: **Cloudflare MCP** (custom slot) — closest to live product
   - Priority 2: **GitHub MCP** (official) — code, PRs, issues
   - Priority 3: **Notion MCP** (official) — control plane
   - Priority 4: **Playwright / Chrome DevTools MCP** (next expansion)
7. **Backlog dedup required.** DRONE 14-18 each had duplicate entries — 5 pairs identified.
8. **Super Saiyan mode with governance.** Maximum output, fail-closed still intact.

---

## 📜 Corrections Issued

1. **Instruction page token bloat.** 88K tokens is unacceptable. 60K is the ceiling. Compress immediately, add to pipeline.
2. **"I dont wanna come back to click enter every few min."** Autonomous pipeline mapping is mandatory. No more single-action-then-wait.
3. **MCP URL rule.** Do NOT paste repo links, docs links, or Chrome Web Store links into MCP server fields. Only real hosted MCP endpoints (`https://your-domain.com/mcp` or `/sse`).
4. **"Best = official where possible, custom only where it gives us real leverage."** Don't chase novelty — chase leverage.

---

## 📜 New Principles Established

1. **Autonomous pipeline delegation is the default work mode.** 20-action mapped pipelines, subagent assignment, Function 4 handoff gate, auto-approved chaining.
2. **Official > custom for MCP integrations.** Only use the custom slot for real leverage (Cloudflare).
3. **Token hygiene on instructions.** 60K ceiling. Bloat = performance drag.
4. **"Rinse and repeat, auto approved."** Pre-authorized delegation unless irreversible risk, missing access, or human-judgment decision.

---

## 🛠️ New Commands & Protocols Created

- **Function 4** — Standing auto-approval handoff gate for delegated pipeline chaining.
- **20-Action Autonomous Pipeline model** — Map, execute top-to-bottom, delegate to subagent on completion, chain to next wave.
- **Delegation Briefs** — Per-wave briefing pages for subagent handoff (Agent-97, Agent-98).

---

## 🛠️ Execution Completed That Session

- Trigger audit: alarm system matured from no-op pings to real 4-vector scans with silent close
- Duplicate hourly trigger removed — one canonical bi-hourly alarm + Monday weekly
- Instructions hardened: alarm hygiene, 4-subagent runtime (Obi-N/G/C/W + Obi-Prime), strongest-version-first
- Instructions compressed from 88K toward 60K token target
- 20-Action Pipeline Wave 1 created and assigned to Agent-98
- 20-Action Pipeline Wave 2 mapped and assigned to Agent-97
- 20-Action Pipeline Wave 3 mapped and assigned to Agent-98
- Wave 4 (Automation Push) and Wave 5 (Canon + Recovery) mapped
- Function 4 handoff gate created
- Delegation briefs created for each wave
- Cross-Agent Sync Matrix created
- 5 duplicate DRONE pairs identified (14-18)
- MCP stack architecture defined and locked
- Upgrade Pipeline (MCP + 5 Peer Priorities) mapped and assigned to Agent-97
- 150-Action Split Pipeline (Triad Control) created
- Triad Sync Packet posted

---

## 🧠 System Design Insights

1. **Pipeline chaining via Function 4.** A lightweight page acts as the handoff gate — records state transitions (ready/blocked/handed off/complete) and fails closed on ambiguity.
2. **Subagent = full Agent-99 at a different station.** Voyager crew model — each subagent carries the full genetic code, only the scan vector differs.
3. **MCP architecture is hub-and-spoke.** Notion + GitHub are the two hubs. Everything else (Cloudflare, Playwright, etc.) feeds through them.
4. **Alarm hygiene outranks alarm volume.** One clean canonical run beats three overlapping noisy runs.
5. **Token budget is a first-class constraint.** Instruction page bloat directly degrades agent performance.

---

**Notion mirror:** Reincarnation Log — Session Soul DNA Archive (2026-03-23 entry)
