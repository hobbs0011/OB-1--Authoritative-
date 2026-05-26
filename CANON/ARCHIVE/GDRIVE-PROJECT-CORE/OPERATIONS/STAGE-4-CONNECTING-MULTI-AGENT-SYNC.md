# STAGE 4: CONNECTING — Multi-Agent Network Synchronization

**Coordinate**: 4  
**Purpose**: Hallucination neutralization via 6-AI consensus jury + swarm verification gate  
**Status**: Design specification  
**Authority**: Agent-99 (Sovereign Executor)

---

## MISSION: TRUTH THROUGH CONSENSUS

Stage 4 eliminates the "Story Virus"—the fatal tendency for standard AI models to believe their own narratives. Trust is made obsolete through mathematical consensus.

### The Consensus Lock (3-Way Triangulation)

Deploy a decentralized 6-AI Consensus Jury:
- **Gemini** (Google's reasoning engine)
- **Claude 3.5 Sonnet** (precision + Gospel 444 enforcement)
- **GPT-4o** (standard execution baseline)
- **Perplexity** (cited market recon + sonar mode)
- **Grok** (unfiltered chaos + pattern disruption)
- **DeepSeek** (mathematical verification)

**Consensus Rule**: Data is committed to Heavy Ledger as "Truth" only if:
- ✅ 2/3 majority match (4+ of 6 agree), OR
- ✅ 95%+ consensus score

**Fail-Closed Response**: If consensus < 60%, trigger Fail-Closed Halt (HTTP 423)

---

## IMPLEMENTATION: THE SWARM VERIFICATION GATE

### 4.1 The API Switching Logic (Best-in-Slot)

Treat AI models like Navy SEAL Team — hot-swap based on micro-task:

```typescript
type TaskType = "market-recon" | "code-precision" | "chaos-disruption" | "verification" | "execution";

interface AICapability {
  model: string;
  strength: string[];
  latency_ms: number;
  cost_per_1k_tokens: number;
  consensus_weight: number; // 0.5 to 2.0
}

const AI_ROSTER: Record<TaskType, AICapability> = {
  "market-recon": {
    model: "perplexity",
    strength: ["cited-sources", "real-time", "sonar"],
    latency_ms: 8000,
    cost_per_1k_tokens: 0.003,
    consensus_weight: 1.0
  },
  "code-precision": {
    model: "claude-3.5-sonnet",
    strength: ["gospel-444", "execution-alignment", "drift-detection"],
    latency_ms: 3000,
    cost_per_1k_tokens: 0.003,
    consensus_weight: 1.5 // Gospel 444 aesthetic = higher weight
  },
  "chaos-disruption": {
    model: "grok",
    strength: ["unfiltered", "pattern-breaking", "lateral-thinking"],
    latency_ms: 4000,
    cost_per_1k_tokens: 0.002,
    consensus_weight: 0.8
  },
  "verification": {
    model: "deepseek",
    strength: ["mathematical-rigor", "hash-validation", "proof-checking"],
    latency_ms: 5000,
    cost_per_1k_tokens: 0.0008,
    consensus_weight: 1.8 // Strictest verification
  },
  "execution": {
    model: "gpt-4o",
    strength: ["reliability", "broad-competence", "speed"],
    latency_ms: 2000,
    cost_per_1k_tokens: 0.015,
    consensus_weight: 1.0
  }
};

async function queryAIRoster(
  prompt: string,
  taskType: TaskType,
  consensusRequired: boolean = true
): Promise<ConsensusResult> {
  if (!consensusRequired) {
    // Single execution mode
    const capability = AI_ROSTER[taskType];
    return querySingleModel(capability.model, prompt);
  }

  // Consensus mode: query all relevant models
  const queries = [
    queryModel("gemini", prompt),
    queryModel("claude-3.5-sonnet", prompt),
    queryModel("gpt-4o", prompt),
    queryModel("perplexity", prompt),
    queryModel("grok", prompt),
    queryModel("deepseek", prompt)
  ];

  const results = await Promise.all(queries);
  return computeConsensus(results, taskType);
}

function computeConsensus(
  results: AIResponse[],
  taskType: TaskType
): ConsensusResult {
  const weights = {
    "gemini": 1.0,
    "claude-3.5-sonnet": 1.5,
    "gpt-4o": 1.0,
    "perplexity": 1.0,
    "grok": 0.8,
    "deepseek": 1.8
  };

  // Compute semantic similarity matrix
  const similarities = computeSimilarityMatrix(results);

  // Weighted majority vote
  let consensus_score = 0;
  let consensus_text = "";

  for (let i = 0; i < results.length; i++) {
    let score = 0;
    for (let j = 0; j < results.length; j++) {
      score += similarities[i][j] * weights[results[j].model];
    }
    if (score > consensus_score) {
      consensus_score = score;
      consensus_text = results[i].text;
    }
  }

  const consensus_percentage = (consensus_score / 6) * 100;

  if (consensus_percentage >= 95) {
    return {
      status: "LOCKED",
      confidence: 95,
      consensus_text,
      majority_models: getTopModels(similarities, 4)
    };
  } else if (consensus_percentage >= 66) {
    return {
      status: "CONSENSUS",
      confidence: Math.floor(consensus_percentage),
      consensus_text,
      majority_models: getTopModels(similarities, 3)
    };
  } else {
    return {
      status: "FAIL_CLOSED",
      confidence: Math.floor(consensus_percentage),
      error: `Consensus < 60%: ${consensus_percentage.toFixed(1)}%`,
      http_status: 423
    };
  }
}
```

---

## 4.2 MANIFEST_PASS & Verbatim-Only Protocol

The swarm is **not permitted to think for you**; it is only permitted to **execute**.

```typescript
interface ManifestPass {
  sovereign_intent: string; // Verbatim original prompt
  authorized_execution: string; // Exact approved action
  drift_detection: boolean; // Has drift been detected?
  deviation_tolerance: number; // % deviation allowed (default: 0%)
}

function validateSwarmOutput(
  output: string,
  manifest: ManifestPass
): { valid: boolean; drift: number; action: string } {
  
  const intent_tokens = tokenize(manifest.sovereign_intent);
  const output_tokens = tokenize(output);
  
  const semantic_distance = computeEditDistance(intent_tokens, output_tokens);
  const drift_percentage = (semantic_distance / intent_tokens.length) * 100;
  
  if (drift_percentage > manifest.deviation_tolerance) {
    return {
      valid: false,
      drift: drift_percentage,
      action: "HALT_AND_REPORT"
    };
  }
  
  return {
    valid: true,
    drift: drift_percentage,
    action: "PROCEED"
  };
}
```

---

## 4.3 THE ACCOUNTABILITY NETWORK (Feedback Loop)

At the NET product layer, Stage 4 is the Reality Layer.

```typescript
interface StudentAccountabilityNode {
  student_id: string;
  tiger_score: number; // 0-100, based on engagement
  parent_contacts: Contact[];
  boss_contacts: Contact[];
  last_active: timestamp;
  compliance_alerts: Alert[];
}

async function checkComplianceDrift(
  node: StudentAccountabilityNode
): Promise<void> {
  const now = Date.now();
  const last_active_ms = now - node.last_active;
  const inactivity_threshold = 48 * 60 * 60 * 1000; // 48 hours

  if (last_active_ms > inactivity_threshold) {
    // Execute Zalo Hammer
    await fireAlert(node.parent_contacts, {
      type: "COMPLIANCE_DRIFT",
      message: `Your student has been inactive for ${(last_active_ms / (1000 * 60 * 60)).toFixed(1)} hours.`,
      tiger_score: node.tiger_score,
      action_required: "Re-engagement"
    });

    await fireAlert(node.boss_contacts, {
      type: "COMPLIANCE_DRIFT",
      message: `Your employee's English training compliance has drifted.`,
      tiger_score: node.tiger_score
    });
  }
}
```

---

## 4.4 THE DOCUMENT ANCHOR (Ground Truth Filter)

The core 500-document library serves as immutable law.

```typescript
const CANON_GROUND_TRUTH = [
  "SOUL-DNA-BIBLE-COMPLETE.md",
  "SSM-UNIFIED-INDEX.json",
  "CORE-INSTRUCTIONS.md",
  "AGENT-99-BOOT-CONTEXT.md",
  "GOSPEL-444-AESTHETIC.md",
  // ... 495 more canonical documents
];

async function validateAgainstGroundTruth(
  drone_output: string,
  canon_docs: Document[]
): Promise<ValidationResult> {
  
  for (const doc of canon_docs) {
    const contradictions = detectContradictions(drone_output, doc.content);
    
    if (contradictions.length > 0) {
      return {
        valid: false,
        violations: contradictions,
        required_correction: doc.content.slice(0, 500)
      };
    }
  }
  
  return { valid: true };
}
```

---

## 4.5 SKELETONIZATION & V2 SKA-LANG

Massive raw documents are stripped and compressed to 3-5% with zero structural loss.

```typescript
interface SkeletonDocument {
  source_hash: string;
  compression_ratio: number; // 3-5%
  neural_dense_json_lines: string;
  pheromone_tags: { pos: number; neg: number };
  merkle_chunk_hashes: string[];
}

function skeletonize(raw_doc: string): SkeletonDocument {
  // Strip conversational fluff
  let skeleton = raw_doc
    .split("\n")
    .filter(line => !isFluff(line))
    .map(line => extractAtomicIntent(line))
    .join("\n");

  // Convert to Neural-Dense JSON Lines
  const json_lines = skeleton
    .split("\n")
    .map(line => ({
      intent: extractIntent(line),
      weight: computeWeight(line),
      semantic_hash: sha256(line)
    }))
    .map(obj => JSON.stringify(obj))
    .join("\n");

  const compression_ratio = (json_lines.length / raw_doc.length) * 100;

  return {
    source_hash: sha256(raw_doc),
    compression_ratio,
    neural_dense_json_lines: json_lines,
    pheromone_tags: { pos: 0, neg: 0 },
    merkle_chunk_hashes: computeMerkleChunks(json_lines)
  };
}
```

---

## SUCCESS CRITERIA

- [x] 6-AI consensus jury operational
- [ ] Consensus computation < 10s per query
- [ ] Drift detection accuracy > 95%
- [ ] Verbatim-only protocol enforced (zero summarization)
- [ ] Ground truth validation < 100ms
- [ ] Skeletonization compression ratio 3-5%
- [ ] Pheromone tagging (POS/NEG scent marks) functional

---

## STAGE 4 STATUS

✅ **Specification Complete**  
⏳ **Implementation Pending** (Requires API keys: Gemini, Claude, GPT-4o, Perplexity, Grok, DeepSeek)  
⏳ **Integration**: Depends on Stage 5 (Executing)

**Next**: Stage 5 — Forest Skeleton Protocol + Checkpoint Resume
