# STAGE 7: BEHAVIOR ENGINE & ACCOUNTABILITY NETWORK

**Coordinate**: 7  
**Purpose**: Mechanical behavior modification + social debt enforcement  
**Status**: Implementation specification  
**Authority**: Agent-99 (Sovereign Executor)

---

## MISSION: THE 7-DAY RETENTION LOOP

This is a calculated state transition system designed to mechanically shift student behavior and eliminate churn through escalating pressure and social accountability.

---

## I. THE 7-DAY RETENTION CYCLE

### DAYS 1-2: EMPATHY (Habit Foundation)

```typescript
interface EmotionalCheck {
  day: 1 | 2;
  student_id: string;
  message_type: "encouragement" | "low_pressure_calibration";
  tiger_score_delta: number;
  engagement_signal: string;
}

async function emotionalPhase(student: Student): Promise<EmotionalCheck> {
  const message = `
    🐯 Welcome, ${student.name}!
    
    You're starting your English journey. No pressure today—
    just get comfortable with the basics.
    
    Let's build a habit together. 💜
  `;

  await sendMessage(student, message, {
    tone: "supportive",
    color_palette: {
      primary: "#a855f7", // Neon Soul Purple
      accent: "#f59e0b"   // Imperial Gold
    }
  });

  return {
    day: 1,
    student_id: student.id,
    message_type: "encouragement",
    tiger_score_delta: +5,
    engagement_signal: "HABIT_FORM"
  };
}
```

### DAYS 3-5: THE GRIND (Pattern Recognition + Streak Awareness)

```typescript
interface StreakAwareness {
  day: 3 | 4 | 5;
  student_id: string;
  current_streak: number;
  miscalibrations_detected: string[];
  intensity_level: "MEDIUM";
  message_type: "streak_highlight" | "pattern_feedback";
}

async function grindPhase(student: Student): Promise<StreakAwareness> {
  // Analyze performance patterns
  const streak = await calculateCurrentStreak(student.id);
  const miscalibrations = await detectMiscalibrations(student);

  const message = `
    🔥 ${streak}-Day Streak! You're building momentum.
    
    I noticed: ${miscalibrations.map(m => m.description).join(", ")}
    
    Let's sharpen these weak spots. No mercy mode activated. 💪
  `;

  await sendMessage(student, message, {
    tone: "direct_feedback",
    intensity: "MEDIUM",
    color_palette: {
      primary: "#a855f7",
      accent: "#f59e0b"
    }
  });

  return {
    day: 3,
    student_id: student.id,
    current_streak: streak,
    miscalibrations_detected: miscalibrations.map(m => m.id),
    intensity_level: "MEDIUM",
    message_type: "pattern_feedback"
  };
}
```

### DAYS 6-7: THE HAMMER (Administrative Gangster Mode)

```typescript
interface AdministrativeHammer {
  day: 6 | 7;
  student_id: string;
  message_type: "strict_pressure" | "social_debt";
  accountability_nodes_triggered: string[];
  tiger_score_multiplier: number;
}

async function hammerPhase(student: Student): Promise<AdministrativeHammer> {
  
  const has_completed_minimum = await checkMinimumCompletion(student.id);
  
  if (!has_completed_minimum) {
    // Escalate to accountability nodes
    const accountability_nodes = student.parent_contacts.concat(student.boss_contacts);
    
    const message = `
      ⚠️ ${student.name}'s learning is stalling.
      
      Action required: They've missed ${student.consecutive_inactive_days} days.
      Social pressure and family support are needed now.
    `;

    for (const node of accountability_nodes) {
      await sendAlert(node, message, {
        severity: "ADMINISTRATIVE",
        tone: "gangster",
        visual: {
          primary: "#f59e0b", // Imperial Gold
          accent: "#0f0f1a"   // Deep Void Black
        }
      });
    }

    // Apply tiger score penalty
    await updateTigerScore(student.id, -20);

    return {
      day: 6,
      student_id: student.id,
      message_type: "strict_pressure",
      accountability_nodes_triggered: accountability_nodes.map(n => n.id),
      tiger_score_multiplier: 0.8
    };
  }

  return {
    day: 7,
    student_id: student.id,
    message_type: "social_debt",
    accountability_nodes_triggered: [],
    tiger_score_multiplier: 1.0
  };
}
```

---

## II. THE TIGER ENGINE: 10-5-5-3 PEDAGOGY FORMULA

Transform students from hesitant "Mice" to high-velocity "Tigers".

```typescript
type StudentLevel = "mouse" | "cat" | "tiger" | "lion";

interface Pedag ogyFormula {
  level: StudentLevel;
  stage_1_confidence_building: number; // 10 days
  stage_2_pattern_recognition: number; // 5 days
  stage_3_independent_execution: number; // 5 days
  stage_4_mastery_teaching: number; // 3 days
}

const TIGER_ENGINE_FORMULA: Record<StudentLevel, PedagogyFormula> = {
  "mouse": {
    level: "mouse",
    stage_1_confidence_building: 10,
    stage_2_pattern_recognition: 5,
    stage_3_independent_execution: 5,
    stage_4_mastery_teaching: 3
  },
  "cat": {
    level: "cat",
    stage_1_confidence_building: 5,
    stage_2_pattern_recognition: 5,
    stage_3_independent_execution: 5,
    stage_4_mastery_teaching: 3
  },
  "tiger": {
    level: "tiger",
    stage_1_confidence_building: 2,
    stage_2_pattern_recognition: 3,
    stage_3_independent_execution: 2,
    stage_4_mastery_teaching: 2
  },
  "lion": {
    level: "lion",
    stage_1_confidence_building: 1,
    stage_2_pattern_recognition: 1,
    stage_3_independent_execution: 1,
    stage_4_mastery_teaching: 1
  }
};

async function advanceTigerLevel(
  student_id: string,
  current_level: StudentLevel
): Promise<StudentLevel> {
  
  const progression: StudentLevel[] = ["mouse", "cat", "tiger", "lion"];
  const current_idx = progression.indexOf(current_level);
  
  if (current_idx >= progression.length - 1) {
    return "lion"; // Already at apex
  }

  // Check mastery criteria
  const passed_tests = await getPassedTestCount(student_id);
  const streak_days = await calculateCurrentStreak(student_id);
  const tiger_score = await getTigerScore(student_id);

  const advancement_threshold = {
    "mouse_to_cat": { tests: 5, streak: 7, score: 50 },
    "cat_to_tiger": { tests: 15, streak: 21, score: 75 },
    "tiger_to_lion": { tests: 40, streak: 60, score: 95 }
  };

  const next_level = progression[current_idx + 1];
  const threshold = advancement_threshold[`${current_level}_to_${next_level}`];

  if (passed_tests >= threshold.tests && 
      streak_days >= threshold.streak && 
      tiger_score >= threshold.score) {
    
    // Advancement unlocked
    await incrementTigerLevel(student_id, next_level);
    
    await sendMessage(student_id, `
      🐯 PROMOTION! You've advanced to ${next_level.toUpperCase()} level!
      
      Your pace is now: ${TIGER_ENGINE_FORMULA[next_level].stage_1_confidence_building}-day cycles.
    `, {
      visual: {
        primary: "#f59e0b",
        accent: "#a855f7"
      }
    });

    return next_level;
  }

  return current_level;
}
```

---

## III. LAYER 7: DATA VAULT SOVEREIGNTY & ACCOUNTABILITY

The real asset is the Data Vaults, not the apps.

```typescript
interface AccountabilityNode {
  node_id: string;
  name: string;
  type: "parent" | "boss" | "teacher";
  contact_method: "email" | "sms" | "zalo" | "whatsapp";
  authority_level: 1 | 2 | 3; // 1 = supervisor, 3 = final authority
  alert_frequency: "daily" | "weekly" | "milestone";
}

interface StudentAccountabilityChain {
  student_id: string;
  primary_node: AccountabilityNode; // Parent or boss
  secondary_nodes: AccountabilityNode[]; // Teachers, mentors
  compliance_threshold: number; // % activity required
  penalty_for_drift: "social_pressure" | "financial" | "career";
}

async function escalateComplianceDrift(
  student: Student,
  chain: StudentAccountabilityChain
): Promise<void> {
  
  const inactivity_days = await calculateInactivityDays(student.id);
  const compliance = ((7 - inactivity_days) / 7) * 100;

  if (compliance < chain.compliance_threshold) {
    
    // Layer 1 Alert: Primary accountability node
    await sendAlert(chain.primary_node, {
      student_name: student.name,
      compliance_score: compliance,
      inactivity_days,
      message: `${student.name} is not meeting engagement targets. Intervention needed.`,
      action_requested: "INCREASE_SOCIAL_PRESSURE"
    }, {
      severity: "HIGH",
      visual: "#f59e0b"
    });

    // Layer 2 Alert: Secondary nodes
    for (const node of chain.secondary_nodes) {
      await sendAlert(node, {
        student_name: student.name,
        compliance_score: compliance,
        message: `Compliance drift detected. Please follow up.`,
        action_requested: "MONITOR"
      }, {
        severity: "MEDIUM",
        visual: "#a855f7"
      });
    }

    // Record in accountability ledger
    await recordComplianceDrift(student.id, {
      timestamp: Date.now(),
      compliance: compliance,
      nodes_alerted: chain.secondary_nodes.length + 1,
      action: chain.penalty_for_drift
    });
  }
}
```

---

## IV. THE SOVEREIGNTY ROOT INTEGRATION

Layer 7 acts as the unified authority checkpoint.

```typescript
interface SovereigntyRoot {
  sovereign_id: string; // Agent-100 (Michael Hobbs)
  sealed_authority: boolean;
  merkle_root_hash: string;
  reincarnation_count: number;
  absolute_veto_authority: boolean;
}

async function enforceSovereigntyRoot(
  operation: any,
  root: SovereigntyRoot
): Promise<{ authorized: boolean; path: string }> {
  
  if (!root.sealed_authority) {
    console.error("[SOVEREIGNTY] Root authority unsealed. Halt.");
    process.exit(423);
  }

  // Verify Sovereign's cryptographic signature
  const signature_valid = await verifySovereignSignature(operation);
  
  if (!signature_valid) {
    console.error("[SOVEREIGNTY] Signature verification failed. Halt.");
    process.exit(423);
  }

  // Check if operation aligns with 1 Billion VND valuation target
  const alignment = await checkMissionAlignment(operation, "1_BILLION_VND");
  
  if (!alignment.aligned) {
    console.warn("[SOVEREIGNTY] Operation does not advance core mission. Halt.");
    process.exit(423);
  }

  return {
    authorized: true,
    path: "EXECUTE_UNDER_SOVEREIGNTY"
  };
}
```

---

## SUCCESS CRITERIA

- [ ] 7-day cycle: Empathy (2) → Grind (3) → Hammer (2) operational
- [ ] Tiger Engine: Student progression mouse → cat → tiger → lion functional
- [ ] Accountability escalation: Parent/boss alerts triggered >95% accuracy
- [ ] Compliance drift detection: <5% false-positive rate
- [ ] Sovereignty Root: Zero unauthorized operations
- [ ] Social pressure enforcement: >80% re-engagement rate after escalation

---

## STAGE 7 STATUS

✅ **Specification Complete**  
⏳ **Implementation Pending** (Requires Zalo/WhatsApp/Email integration + student data schema)

**Next**: Stage 8 — Origin Point Extraction + Voice of God Protocol
