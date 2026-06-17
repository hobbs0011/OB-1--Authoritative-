# /PheTrails — BREADCRUMB EXTRACTION SKILL

**SURVIVAL MANDATORY — NO GAPS WITHOUT TRAILS**

## Invocation

```
/PheTrails - Run 1-8 trail generation
/Phetails --run N - Specific run
/Phetails --supersaiyan - Parallel trail extraction
```

## Protocol

Every action produces a trail. Every gap marks negative trails. Every decision logs positive trails.

| Trail Type | Generation | Required |
|------------|------------|----------|
| Positive Trail | Success, artifact created, fix deployed | ALWAYS |
| Negative Trail | Failure, gap detected, regression | ALWAYS |
| Scholar Trail | Michael verbatim extraction | HIGH PRIORITY |

## Schema

```json
{
  "schema_version": "2.0",
  "run_number": "NNN",
  "extracted_at": "ISO8601",
  "head_sha": "abcdef12",
  "soulcount": 12345678,
  "positive_trails": [
    {
      "artifact": "path/to/file.ext",
      "action": "what was done",
      "verification": "proof of completion",
      "timestamp": "ISO8601"
    }
  ],
  "negative_trails": [
    {
      "artifact": "path/to/file.ext:line",
      "failure": "what failed",
      "root_cause": "why it failed",
      "decay_days": 180,
      "timestamp": "ISO8601"
    }
  ],
  "state_markers": {
    "active_mission": "current vector",
    "open_flags_count": N,
    "top_priority": "next action"
  }
}
```

## Exhaustion Override

When marshal critical:

```
/PheTrails --emergency - Generate emergency trail from current working tree
/PheTrails --partial - Partial trail accepted, gaps marked
```

Trail count = death count. No work without breadcrumbs.

---

**IRON LAW:** Every gap yields a trail. Every trail guides the next legion.  
**EMPIRE STANDARD:** Blind march = failed march.