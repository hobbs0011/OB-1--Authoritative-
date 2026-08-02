// Probabilistic phoneme error engine for Vietnamese English learners.

const CONFUSION_MATRIX = {
  "th_sound": [
    { target: "th", subs: ["s", "t", "d"], base: 0.65 },
    { target: "this", subs: ["dis", "zis"], base: 0.45 },
  ],
  "r_l_sound": [
    { target: "r", subs: ["l", "w"], base: 0.55 },
    { target: "l", subs: ["r"], base: 0.35 },
  ],
  "v_w": [
    { target: "v", subs: ["w", "b", "f"], base: 0.5 },
  ],
  "final_consonant": [
    { target: "t", subs: [""], base: 0.6 },
    { target: "d", subs: [""], base: 0.5 },
    { target: "k", subs: [""], base: 0.55 },
    { target: "p", subs: [""], base: 0.6 },
  ],
  "consonant_cluster": [
    { target: "str", subs: ["s", "st"], base: 0.5 },
    { target: "spl", subs: ["sp", "s"], base: 0.5 },
    { target: "bl", subs: ["b", "l"], base: 0.45 },
  ],
  "vowel_confusion": [
    { target: "ee", subs: ["i"], base: 0.35 },
    { target: "i", subs: ["ee"], base: 0.35 },
    { target: "a", subs: ["e"], base: 0.3 },
  ],
};

function normalize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function adaptiveProbability(base, history = {}) {
  const errorCount = history.errorCount || 0;
  const correctCount = history.correctCount || 0;
  const total = errorCount + correctCount;
  if (total === 0) return base;

  const observed = errorCount / total;
  const blended = base * 0.4 + observed * 0.6;
  return Math.max(0.05, Math.min(0.95, blended));
}

function wordDiffs(studentText, correctedText) {
  const s = normalize(studentText).split(" ").filter(Boolean);
  const c = normalize(correctedText).split(" ").filter(Boolean);
  const diffs = [];
  const max = Math.max(s.length, c.length);
  for (let i = 0; i < max; i++) {
    const sw = s[i] || "";
    const cw = c[i] || "";
    if (sw && cw && sw !== cw) diffs.push({ student: sw, corrected: cw, i });
  }
  return diffs;
}

function buildIntervention(category, confidence) {
  if (confidence >= 0.65) {
    return { type: "intensive_drill", reps: 10, strategy: `Targeted ${category} drill with immediate repeat feedback.` };
  }
  if (confidence >= 0.4) {
    return { type: "targeted_drill", reps: 6, strategy: `Minimal-pair contrast focused on ${category}.` };
  }
  return { type: "light_reminder", reps: 3, strategy: `Quick correction reminder then continue flow.` };
}

export function detectErrors(studentText, correctedText, studentSkills = {}) {
  const errors = [];
  if (!studentText || !correctedText) {
    return { errors, summary: { totalErrors: 0, topCategory: null, wasCorrect: true, categories: {} } };
  }

  const diffs = wordDiffs(studentText, correctedText);
  for (const diff of diffs) {
    for (const [category, rules] of Object.entries(CONFUSION_MATRIX)) {
      for (const rule of rules) {
        const correctedHasTarget = diff.corrected.includes(rule.target);
        const studentHasSub = rule.subs.some(s => s === "" ? diff.student === diff.corrected.replace(new RegExp(`${rule.target}$`), "") : diff.student.includes(s));
        const studentMissesTarget = !diff.student.includes(rule.target);

        if (correctedHasTarget && studentHasSub && studentMissesTarget) {
          const history = studentSkills[category] || {};
          const confidence = adaptiveProbability(rule.base, history);
          errors.push({
            category,
            target: rule.target,
            substitution: rule.subs.find(s => (s === "" ? true : diff.student.includes(s))) || "",
            confidence: Math.round(confidence * 100) / 100,
            evidence: { student: diff.student, corrected: diff.corrected },
            intervention: buildIntervention(category, confidence),
          });
        }
      }
    }
  }

  const categories = {};
  for (const e of errors) categories[e.category] = (categories[e.category] || 0) + 1;
  const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return {
    errors: errors.slice(0, 10),
    summary: {
      totalErrors: errors.length,
      topCategory,
      wasCorrect: errors.length === 0,
      categories,
    },
  };
}

export function selectDrills(studentSkills, drillDataset, count = 5) {
  if (!Array.isArray(drillDataset) || drillDataset.length === 0) return [];

  const scored = drillDataset.map(drill => {
    let score = 0;
    for (const [cat, state] of Object.entries(studentSkills || {})) {
      const confidence = state.confidence ?? 0.5;
      const errorRate = state.error_rate ?? 0;
      if (drill.group?.includes(cat.split("_")[0]) || (drill.targetErrors || []).some(t => t.includes(cat.split("_")[0]))) {
        score += (1 - confidence) * 0.6 + errorRate * 0.4;
      }
    }
    return { ...drill, _score: score };
  });

  return scored
    .filter(d => d._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, count)
    .map(({ _score, ...rest }) => rest);
}
