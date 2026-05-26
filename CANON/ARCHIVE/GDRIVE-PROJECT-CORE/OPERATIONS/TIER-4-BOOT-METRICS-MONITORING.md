# TIER 4: BOOT METRICS & MONITORING (Design Document)

**Effort**: ~2-3 hours  
**Impact**: Real-time performance visibility + automated bottleneck detection  
**Goal**: Monitor boot performance and identify optimization opportunities  
**Depends On**: Tier 1-3 (pre-flight + lazy-load + consolidated context)

---

## ARCHITECTURE

### 4.1 Boot Metrics Collection

**Capture During Each Boot**:

```typescript
interface BootMetrics {
  // Timestamps
  boot_start: number;           // Unix timestamp
  preflight_end: number;        // After canonvalid
  context_load_end: number;     // After core + SSM index
  skills_stage_end: number;     // After lazy-load setup
  boot_ready: number;           // Total boot complete
  
  // Durations (ms)
  preflight_duration: number;
  context_load_duration: number;
  skills_setup_duration: number;
  total_boot_duration: number;
  
  // Context sizes
  context_loaded_kb: number;    // Actually loaded into memory
  context_available_kb: number; // Could load but didn't (lazy)
  
  // Counts
  canon_files: number;
  ssm_laws_indexed: number;
  skills_available: number;
  skills_loaded: number;
  
  // Resource usage
  memory_before: number;        // MB
  memory_after: number;         // MB
  memory_delta: number;         // MB increase
  
  // System info
  os: string;
  node_version: string;
  boot_mode: "fast" | "full" | "reincarnate";
}
```

### 4.2 Boot Metrics Persistence

**Store Locally** (one file per day):
```
OPERATIONS/METRICS/
├─ 2026-04-20-BOOT-METRICS.jsonl  (newline-delimited JSON)
├─ 2026-04-21-BOOT-METRICS.jsonl
└─ ...
```

**Each row**: One complete BootMetrics object (timestamped)

**Schema**:
```jsonl
{"boot_start":1713607200000,"preflight_duration":15,"context_load_duration":45,...total_boot_duration":98}
{"boot_start":1713607210000,"preflight_duration":14,"context_load_duration":44,...total_boot_duration":97}
```

### 4.3 Metrics Analysis

**Daily Summary** (`OPERATIONS/METRICS/2026-04-20-SUMMARY.json`):

```json
{
  "date": "2026-04-20",
  "boots": 47,
  "boot_durations": {
    "min_ms": 92,
    "max_ms": 320,
    "mean_ms": 156,
    "median_ms": 148,
    "p95_ms": 210,
    "p99_ms": 280
  },
  "memory_delta": {
    "min_mb": 8,
    "max_mb": 42,
    "mean_mb": 18
  },
  "bottlenecks": [
    {
      "stage": "preflight",
      "mean_duration_ms": 18,
      "note": "Canon file check (avg 50 files)"
    },
    {
      "stage": "context_load",
      "mean_duration_ms": 72,
      "note": "JSON parsing SSM index"
    },
    {
      "stage": "skills_setup",
      "mean_duration_ms": 12,
      "note": "Lazy-load registry initialization"
    }
  ],
  "recommendations": [
    "Cache parsed SSM index (JSON parse = 72ms bottleneck)",
    "Pre-compile skill registry (12ms setup could be 2ms)",
    "Parallel canon validation (18ms could be 8ms with concurrent checks)"
  ]
}
```

---

## IMPLEMENTATION

### 4.4 Boot Metrics Collector (TypeScript/PowerShell)

**Location**: `SCRIPTS/boot-metrics-collector.ts`

```typescript
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export class BootMetricsCollector {
  private metrics: Partial<BootMetrics> = {};
  private startTime: number = Date.now();

  constructor() {
    this.metrics = {
      boot_start: this.startTime,
      os: os.platform(),
      node_version: process.version,
    };
  }

  // Record stage completion
  recordStageComplete(stage: "preflight" | "context_load" | "skills_setup" | "boot_ready") {
    const now = Date.now();
    
    switch (stage) {
      case "preflight":
        this.metrics.preflight_end = now;
        this.metrics.preflight_duration = now - this.startTime;
        break;
      case "context_load":
        this.metrics.context_load_end = now;
        this.metrics.context_load_duration = now - (this.metrics.preflight_end || this.startTime);
        break;
      case "skills_setup":
        this.metrics.skills_stage_end = now;
        this.metrics.skills_setup_duration = now - (this.metrics.context_load_end || this.startTime);
        break;
      case "boot_ready":
        this.metrics.boot_ready = now;
        this.metrics.total_boot_duration = now - this.startTime;
        break;
    }
    
    console.log(`[BOOT-METRICS] ${stage} completed: ${this.metrics[`${stage}_duration`]}ms`);
  }

  // Record resource usage
  recordResourceUsage(memory_before_mb: number) {
    const memory_after_mb = process.memoryUsage().heapUsed / 1024 / 1024;
    this.metrics.memory_before = memory_before_mb;
    this.metrics.memory_after = memory_after_mb;
    this.metrics.memory_delta = memory_after_mb - memory_before_mb;
  }

  // Record counts
  recordCounts(counts: {
    canon_files: number;
    ssm_laws: number;
    skills_available: number;
    skills_loaded: number;
  }) {
    this.metrics.canon_files = counts.canon_files;
    this.metrics.ssm_laws_indexed = counts.ssm_laws;
    this.metrics.skills_available = counts.skills_available;
    this.metrics.skills_loaded = counts.skills_loaded;
  }

  // Persist metrics to disk
  async persistMetrics(): Promise<void> {
    const today = new Date().toISOString().split("T")[0];
    const metricsDir = path.join(process.cwd(), "OPERATIONS", "METRICS");
    
    // Ensure directory exists
    if (!fs.existsSync(metricsDir)) {
      fs.mkdirSync(metricsDir, { recursive: true });
    }

    const metricsFile = path.join(metricsDir, `${today}-BOOT-METRICS.jsonl`);
    const line = JSON.stringify(this.metrics) + "\n";
    
    fs.appendFileSync(metricsFile, line);
    console.log(`[BOOT-METRICS] Persisted to ${metricsFile}`);
  }

  // Get metrics
  getMetrics(): BootMetrics {
    return this.metrics as BootMetrics;
  }
}

// Singleton instance
let collector: BootMetricsCollector | null = null;

export function getBootMetricsCollector(): BootMetricsCollector {
  if (!collector) {
    collector = new BootMetricsCollector();
  }
  return collector;
}
```

### 4.5 Metrics Analysis Script

**Location**: `SCRIPTS/analyze-boot-metrics.ps1`

```powershell
param(
    [string]$Date = (Get-Date).ToString("yyyy-MM-dd"),
    [int]$Days = 7
)

$metricsDir = Join-Path (Get-Location) "OPERATIONS\METRICS"

if (-not (Test-Path $metricsDir)) {
    Write-Host "[ERROR] Metrics directory not found: $metricsDir" -ForegroundColor Red
    exit 1
}

# Load all metrics for date range
$allMetrics = @()
for ($i = 0; $i -lt $Days; $i++) {
    $checkDate = (Get-Date).AddDays(-$i).ToString("yyyy-MM-dd")
    $metricsFile = Join-Path $metricsDir "$checkDate-BOOT-METRICS.jsonl"
    
    if (Test-Path $metricsFile) {
        Get-Content $metricsFile | ForEach-Object {
            $allMetrics += ConvertFrom-Json $_
        }
    }
}

if ($allMetrics.Count -eq 0) {
    Write-Host "[WARN] No metrics found for $Days days" -ForegroundColor Yellow
    exit 0
}

# Compute statistics
$durations = $allMetrics | Select-Object -ExpandProperty total_boot_duration
$memoryDelta = $allMetrics | Select-Object -ExpandProperty memory_delta

$stats = [PSCustomObject]@{
    total_boots = $allMetrics.Count
    boot_duration_min = ($durations | Measure-Object -Minimum).Minimum
    boot_duration_max = ($durations | Measure-Object -Maximum).Maximum
    boot_duration_avg = ($durations | Measure-Object -Average).Average
    boot_duration_median = ($durations | Sort-Object | Select-Object -Index ([int]($durations.Count / 2))).BootDuration
    memory_delta_avg_mb = ($memoryDelta | Measure-Object -Average).Average
}

Write-Host "`n=== BOOT METRICS ANALYSIS ($Date, Last $Days Days) ===" -ForegroundColor Cyan
Write-Host "Total boots analyzed: $($stats.total_boots)" -ForegroundColor Cyan
Write-Host "`nBoot Duration (ms):"
Write-Host "  Min:     $($stats.boot_duration_min)" -ForegroundColor Green
Write-Host "  Max:     $($stats.boot_duration_max)" -ForegroundColor Yellow
Write-Host "  Average: $([math]::Round($stats.boot_duration_avg, 1))" -ForegroundColor Cyan
Write-Host "  Median:  $($stats.boot_duration_median)" -ForegroundColor Cyan
Write-Host "`nMemory Delta: $([math]::Round($stats.memory_delta_avg_mb, 2)) MB average"

# Identify bottlenecks
$bottlenecks = @()
$allMetrics | ForEach-Object {
    if ($_.preflight_duration -gt 25) { $bottlenecks += "HIGH preflight: $($_.preflight_duration)ms" }
    if ($_.context_load_duration -gt 100) { $bottlenecks += "HIGH context_load: $($_.context_load_duration)ms" }
    if ($_.skills_setup_duration -gt 20) { $bottlenecks += "HIGH skills_setup: $($_.skills_setup_duration)ms" }
}

if ($bottlenecks.Count -gt 0) {
    Write-Host "`nBottlenecks Detected:" -ForegroundColor Red
    $bottlenecks | Get-Unique | ForEach-Object { Write-Host "  ⚠️  $_" -ForegroundColor Red }
}
```

---

## METRICS DASHBOARD (Future: Tier 4.2)

**Web Dashboard** (simple HTML):
```
OPERATIONS/METRICS/dashboard.html
├─ Real-time boot time trend chart (sparkline)
├─ Memory usage distribution
├─ Bottleneck heatmap
├─ Recommendations (auto-generated from analysis)
```

---

## STANDING ORDERS (Tier 4)

1. **Always collect**: BootMetrics on every session boot
2. **Persist daily**: Append-only to YYYY-MM-DD-BOOT-METRICS.jsonl
3. **Analyze weekly**: Generate recommendations from 7-day window
4. **Alert on regression**: If total_boot_duration > 200ms, flag for review
5. **Pre-Tier5 input**: Use metrics to train adaptive boot mode (Tier 5)

---

## SUCCESS CRITERIA

- [x] Collect boot metrics without user awareness (<5ms overhead)
- [ ] Persist 30+ days of metrics (future: archive to R2)
- [ ] Analyze metrics automatically (daily summaries)
- [ ] Detect bottlenecks with confidence (>95%)
- [ ] Drive optimization decisions (← feeds Tier 5)

---

**Next**: TIER 5 (Adaptive Boot Mode Selection) uses Tier 4 metrics to auto-select Fast/Full/Reincarnate boot mode.
