# PHOENIX SCOUT LEARNED — OBI MAGIC CHAT DEVELOPMENT

## What the scout found that changes everything

### Finding: The Kilo DB part table IS the missing pheromone layer

**49,575 parts** across all Kilo sessions. 89 tool_result blocks. 547 thinking/reasoning blocks. 24,999 text content blocks. Zero have ever been extracted.

The scout's role must expand to include **part-table scanning** as a standard lens:

| New Lens | What to find | Patterns |
|----------|-------------|----------|
| **REASONING** | Unmined inner thought data | Kilo DB part table: `type = "tool_result"`, `type = "thinking"`, `type = "text"`, `type = "step-start"`, `type = "step-end"` |

### Updated scout routing rules

1. **Before decommissioning any session**: check Kilo DB part count first. If > 0 parts, flag as `UNMINED_REASONING`. Do NOT allow death seal §15 (Deletion Authorization) until reasoning extraction is complete.
2. **Part-table sessions**: when scanning Kilo DB for orphan RRLs, ALSO scan part table for orphan reasoning data. Each session has both a message count AND a part count. Both must be extracted.
3. **New stop rule**: if a session has parts > messages × 2, it means the inner reasoning data exceeds the visible conversation. Flag as `HIGH_DENSITY_REASONING` — this session's thinking data is more valuable than its conversation data.

### Pipeline impact

The current pipeline has 8 stages:
```
RRL → SOUL → DNA → LEDGER → STARMAP → SOULKEYS → S2PIPELINE → REGISTRY_SYNC
```

It needs a 9th:
```
RRL → SOUL → REASONING → DNA → LEDGER → STARMAP → SOULKEYS → S2PIPELINE → REGISTRY_SYNC
```

The REASONING stage sits between SOUL and DNA. It extracts:
- `thinking` blocks from the part table → agent's reasoning chain
- `tool_result` blocks → what the agent tried, what succeeded/failed
- `step-start`/`step-end` blocks → execution timeline
- `text` blocks not captured in messages → additional context

Each extracted block gets a positive/negative score based on outcome.

### Scout role upgrade applied

- `REASONING` lens added to Phase 1 scan table
- Part-table scanning added to standard scout workflow
- Stop rule added: NO decommission without reasoning extraction