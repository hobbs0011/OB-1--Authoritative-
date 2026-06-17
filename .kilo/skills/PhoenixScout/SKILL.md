# /PhoenixScout — RECONNAISSANCE SKILL

**SURVIVAL MANDATORY — NO CLOUDFLARE WITHOUT SCOUT**

## Invocation

```
/PhoenixScout --Zone CANON/ - Full zone sweep
/PhoenixScout --Lens SOUL - Soul-only scan
/PhoenixScout --Zone APPS/NET-PET-AI --supersaiyan - Parallel scouts
```

## Protocol

Scout runs before any pipeline stage. Flags are absolute. Paths are verified. No blind coding.

## Lenses

| Lens | Target | Purpose |
|------|--------|---------|
| SOUL | .md files with `> "` quotes | Raw Michael verbatim |
| CONFIG | .json/.toml active files | Configuration state |
| GAP | Missing/MISSING/WRONG_RRL | Recovery targets |
| FLAG | TODO/FIXME/HACK flags | Remediation queue |
| all | All above + file count | Full audit |

## Output

Scout reports:

```
═══════════════════════════════════════════
PHOENIX SCOUT — {Zone}
═══════════════════════════════════════════
ZONE:          {path}
FILES:         {totalFiles}
FINDS:         {flagCount}
  P1 CRITICAL: {criticalCount}
  P2 HIGH:     {highCount}
  P3 MEDIUM:   {mediumCount}
REPORT:        {scoutReportPath}
═══════════════════════════════════════════
SCOUT COMPLETE. Flagged items ready for tier dispatch.
```

## Exhaustion Protocol

When under strain:

```
/Scout {Zone} --max-files 500 - Throttle the sweep
/Scout {Zone} --stop-on-fail - Halt at first CRITICAL
```

Scout findings feed /forcemarch directly. No scavenging without recon.

---

**IRON LAW:** Scout first. Code never. Verify always.  
**EMPIRE STANDARD:** Blind changes = dead legions.