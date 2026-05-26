# TIER 5: ADAPTIVE BOOT MODE SELECTION (Design Document)

**Effort**: ~2-3 hours  
**Impact**: Automatic context-aware boot optimization; maximize speed + reduce bloat  
**Goal**: System learns optimal boot mode and switches automatically  
**Depends On**: Tier 1-4 (core optimization + metrics feedback loop)

---

## THREE BOOT MODES

### FAST MODE (~0.2 seconds)
**Use When**: Normal task execution, no state preservation needed

**Load**:
- CORE-INSTRUCTIONS.md (8KB)
- SSM-UNIFIED-INDEX.json boot_essential_laws only (7 laws, 5KB)
- Skill registry (lazy-loaded, not parsed)
- ✅ Pre-flight canon validation

**Skip**:
- Full SSM law catalog (loaded on-demand)
- Reincarnation procedures
- Heavy ledger history
- Skills context

**Boot Context**: AGENT-99-BOOT-CONTEXT.md (crystal clear WWWWWH)

**Memory**: ~50MB  
**Speed**: 0.15-0.25s

---

### FULL MODE (~0.8 seconds)
**Use When**: Complex reasoning, deep context needed, debugging

**Load**:
- CORE-INSTRUCTIONS.md + REINCARNATION-PROCEDURES.md
- SSM-UNIFIED-INDEX.json (all L1-L100 laws)
- AGENT-99-BOOT-CONTEXT.md (full)
- Last 5 sessions' Heavy Ledger entries (cached)
- Skill registry (parsed, cached)
- Memory state snapshot
- ✅ Pre-flight validation + canon integrity check

**Skip**:
- Student context (loaded on-demand)
- Full session history (> 5 sessions)
- Archived runs

**Boot Context**: Full + historical reference

**Memory**: ~200MB  
**Speed**: 0.7-0.9s

---

### REINCARNATE MODE (~1.2 seconds)
**Use When**: Session ending, state preservation, death-and-rebirth protocol

**Load**:
- Full boot (FULL mode) +
- Complete Heavy Ledger (all sessions)
- Soul DNA snapshot (RUN-specific)
- Reincarnation extraction pipeline (5-stage)
- COLD-START-BOOT.md
- Full .mcp.json context
- Complete git history snapshot

**Skip**: Nothing (maximum fidelity)

**Boot Context**: Complete + extraction ready

**Memory**: ~500MB  
**Speed**: 1.0-1.3s
**Output**: Sealed reincarnation artifact + next-boot handoff

---

## AUTOMATIC MODE SELECTION LOGIC

### Decision Tree (Evaluated at Boot)

```
Boot detected
  ├─ Is this reincarnation event? (/reincarnatedeath command)
  │   └─ YES → REINCARNATE mode
  │
  ├─ Is Heavy Ledger > 10MB? (lots of history)
  │   └─ YES + user_intent=governance → FULL mode
  │   └─ YES + user_intent=simple → FAST mode
  │
  ├─ Did previous boot timeout? (> 200ms)
  │   └─ YES → FAST mode (speed priority)
  │   └─ NO → Check context demand
  │       ├─ User message length > 500 chars? → FULL
  │       ├─ User mentions debugging/audit/deep? → FULL
  │       └─ Otherwise → FAST
  │
  └─ Default → FAST mode (best for 95% of tasks)
```

### Context Demand Signals

**Triggers FULL Mode**:
```
1. User keywords: "audit", "debug", "investigate", "full", "complete", "all"
2. Governance keywords: "decision", "law", "policy", "rule", "enforce"
3. Memory references: "remember", "history", "context", "previous"
4. Task complexity: Multi-step orchestration tasks (runSubagent calls)
5. Session length: >30 min elapsed since boot
```

**Always FAST**:
```
1. Simple questions ("what is X?", "how do I Y?")
2. Code generation (specific files only)
3. Single-file edits
4. Documentation reads
5. Quick status checks
```

**Always REINCARNATE**:
```
1. Explicit `/reincarnatedeath` command
2. Token budget exhaustion (>90% used)
3. Session timeout (>4 hours)
4. Forced restart (error recovery)
```

---

## IMPLEMENTATION

### 5.1 Boot Mode Detector

**Location**: `SCRIPTS/boot-mode-selector.ts`

```typescript
export type BootMode = "fast" | "full" | "reincarnate";

export interface BootModeDecision {
  mode: BootMode;
  reason: string;
  estimated_duration_ms: number;
  memory_estimate_mb: number;
  confidence: number; // 0-100
}

export class BootModeSelector {
  constructor(
    private metricsCollector: BootMetricsCollector,
    private userMessage?: string
  ) {}

  async selectBootMode(): Promise<BootModeDecision> {
    // Check for reincarnation override
    if (process.env.REINCARNATE === "true" || process.argv.includes("/reincarnatedeath")) {
      return {
        mode: "reincarnate",
        reason: "Explicit reincarnation requested",
        estimated_duration_ms: 1200,
        memory_estimate_mb: 500,
        confidence: 100
      };
    }

    // Analyze user message if provided
    if (this.userMessage) {
      const demand = this.analyzeContextDemand(this.userMessage);
      
      if (demand.requiresFull) {
        return {
          mode: "full",
          reason: `Context demand: ${demand.signals.join(", ")}`,
          estimated_duration_ms: 800,
          memory_estimate_mb: 200,
          confidence: 85
        };
      }
    }

    // Check metrics history for performance regression
    const metrics = await this.metricsCollector.getRecentMetrics(7);
    const avg_boot_time = metrics.reduce((sum, m) => sum + m.total_boot_duration, 0) / metrics.length;
    
    if (avg_boot_time > 200) {
      return {
        mode: "fast",
        reason: "Performance regression detected; prioritize speed",
        estimated_duration_ms: 200,
        memory_estimate_mb: 50,
        confidence: 80
      };
    }

    // Default: FAST mode (best for 95% of tasks)
    return {
      mode: "fast",
      reason: "Default: optimized for speed",
      estimated_duration_ms: 150,
      memory_estimate_mb: 50,
      confidence: 95
    };
  }

  private analyzeContextDemand(message: string): {
    requiresFull: boolean;
    signals: string[];
  } {
    const lower = message.toLowerCase();
    const signals: string[] = [];

    const fullTriggers = [
      "audit", "debug", "investigate", "full", "complete", "all",
      "decision", "law", "policy", "rule", "enforce",
      "remember", "history", "context", "previous",
      "soul-dna", "heavy-ledger", "reincarnation"
    ];

    for (const trigger of fullTriggers) {
      if (lower.includes(trigger)) {
        signals.push(trigger);
      }
    }

    return {
      requiresFull: signals.length > 0,
      signals
    };
  }
}
```

### 5.2 Boot Mode Router

**Location**: `SCRIPTS/boot-mode-router.ps1`

```powershell
param(
    [ValidateSet("auto", "fast", "full", "reincarnate")]
    [string]$Mode = "auto",
    [string]$UserMessage = ""
)

if ($Mode -eq "auto") {
    # Invoke auto-selector
    Write-Host "[BOOT-MODE] Analyzing context for optimal boot mode..." -ForegroundColor Cyan
    
    # Check environment + message
    if ($env:REINCARNATE -eq "true") {
        Write-Host "[BOOT-MODE] Selected: REINCARNATE (explicit request)" -ForegroundColor Magenta
        $Mode = "reincarnate"
    }
    elseif ($UserMessage -match "(audit|debug|full|history|law)") {
        Write-Host "[BOOT-MODE] Selected: FULL (context demand: $([Regex]::Matches($UserMessage, '(audit|debug|full|history|law)').Value))" -ForegroundColor Blue
        $Mode = "full"
    }
    else {
        Write-Host "[BOOT-MODE] Selected: FAST (default optimization)" -ForegroundColor Green
        $Mode = "fast"
    }
}

# Load mode-specific context
$startMemory = (Get-Process -Id $PID).WorkingSet / 1MB

switch ($Mode) {
    "fast" {
        Write-Host "[BOOT-MODE:FAST] Loading core context (8KB)..." -ForegroundColor Green
        # Load: CORE-INSTRUCTIONS.md, SSM boot subset, skill registry
        # Skip: Full ledger, reincarnation procedures, history
        # Expected: 150ms, 50MB
    }
    
    "full" {
        Write-Host "[BOOT-MODE:FULL] Loading comprehensive context (250KB)..." -ForegroundColor Blue
        # Load: Everything in FAST + full SSM laws + reincarnation + last 5 sessions
        # Expected: 800ms, 200MB
    }
    
    "reincarnate" {
        Write-Host "[BOOT-MODE:REINCARNATE] Loading complete state for preservation..." -ForegroundColor Magenta
        # Load: Everything + Heavy Ledger + Soul DNA snapshot + extraction pipeline
        # Expected: 1200ms, 500MB
    }
}

$endMemory = (Get-Process -Id $PID).WorkingSet / 1MB
Write-Host "[BOOT-MODE] Memory delta: $(${endMemory} - ${startMemory})MB" -ForegroundColor Cyan
```

### 5.3 Metrics Feedback Loop (Tier 4 → Tier 5)

**Auto-Adjust on Regression**:

```
if (recent_7day_avg_boot_time > 200ms) {
    → Downgrade to FAST mode
    → Audit what's bloating boot
    → Recommend optimization (Tier 4 analysis)
}

if (user_prefers_full_context_95%) {
    → Upgrade to FULL mode by default
    → Reduce latency perception via caching
}
```

---

## STANDING ORDERS (Tier 5)

1. **Auto-select on every boot**: Evaluate mode decision tree
2. **Honor explicit requests**: User `/mode fast` or `/mode full` overrides
3. **Learn from history**: If confidence < 75%, log for review
4. **Feedback to Tier 4**: Record actual boot performance vs estimate
5. **Adapt weekly**: Update mode selection thresholds based on metrics

---

## SUCCESS CRITERIA

- [x] Implement 3 boot modes (FAST, FULL, REINCARNATE)
- [ ] Achieve auto-selection with >85% accuracy
- [ ] Maintain <0.2s FAST boots 98% of time
- [ ] Cache FULL context for <50ms subsequent loads
- [ ] Reduce average boot from 2.5s → <0.5s (80% savings)
- [ ] Zero broken boots (pre-flight validation 100% pass rate)

---

## EVOLUTION PATH

**Now (Tier 5.0)**: Simple decision tree + metrics feedback  
**Later (Tier 5.1)**: ML-based mode prediction (learn user patterns)  
**Later (Tier 5.2)**: Predictive prefetching (load before user asks)  
**Later (Tier 5.3)**: Cross-session context optimization (remember what matters)

---

## COMPLETE BOOT OPTIMIZATION SUMMARY

| Tier | Component | Savings | Status |
|------|-----------|---------|--------|
| **1.3** | Pre-flight validation | +safety | ✅ Done |
| **2.1** | Skill lazy-loading | -95% skill bloat | ✅ Done |
| **2.2** | Consolidated boot context | -60% overhead | ✅ Done |
| **4** | Metrics + monitoring | Data-driven optimization | 📋 Design |
| **5** | Adaptive mode selection | Context-aware speed | 📋 Design |

**Total Optimization**: 2.5s → 0.2s (-92%) with full context when needed

---

**Next Step**: Commit Tier 4-5 designs, then implement in following sprints.
