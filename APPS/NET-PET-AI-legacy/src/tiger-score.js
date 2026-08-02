// src/tiger-score.js
// Canonical Tiger score math: Continuity(40%) + Execution(30%) + Accountability(30%).

function clampScore(value) {
  const n = Number.isFinite(value) ? value : 0;
  return Math.max(0, Math.min(100, n));
}

function classifyTiger(score) {
  if (score >= 80) return "TIGER";
  if (score >= 40) return "CUB";
  return "MOUSE";
}

export function calculateTigerScore(input) {
  const continuity = clampScore(input?.continuity ?? 0);
  const execution = clampScore(input?.execution ?? 0);
  const accountability = clampScore(input?.accountability ?? 0);

  const score = Math.round((continuity * 0.4) + (execution * 0.3) + (accountability * 0.3));

  return {
    score,
    state: classifyTiger(score),
    breakdown: {
      continuity,
      execution,
      accountability,
      weighted: {
        continuity: Math.round(continuity * 0.4),
        execution: Math.round(execution * 0.3),
        accountability: Math.round(accountability * 0.3),
      },
    },
  };
}

export function deriveTigerInputs(snapshot, fallback) {
  const pet = snapshot?.petState || {};
  const state = snapshot?.studentState || {};

  const continuity = fallback?.continuity
    ?? state.continuity_score
    ?? Math.min(100, (snapshot?.sessionEvents?.length || 0) * 10);

  const execution = fallback?.execution
    ?? state.execution_score
    ?? Math.min(100, (pet.totalSessions || 0) * 5);

  const accountability = fallback?.accountability
    ?? state.accountability_score
    ?? Math.min(100, (pet.streak || 0) * 10);

  return {
    continuity: clampScore(continuity),
    execution: clampScore(execution),
    accountability: clampScore(accountability),
  };
}
