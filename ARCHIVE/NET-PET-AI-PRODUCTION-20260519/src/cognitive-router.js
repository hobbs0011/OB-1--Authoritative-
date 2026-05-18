// src/cognitive-router.js
// Mode-based routing policy that replaces symbolic agent mythology while
// preserving translation payload compatibility for CommandDO.

const MODE_KEYWORDS = {
  OBI: ["teach", "student", "lesson", "speak", "chat", "correction", "practice", "class"],
  OPTIMIZER: ["plan", "optimize", "pipeline", "roadmap", "improve", "architecture", "refactor"],
  AUDIT: ["audit", "review", "verify", "check", "consistency", "risk", "compliance", "debug"],
};

const EXECUTION_LANES = [
  { id: 1, name: "CodeRunner", skills: ["execute", "eval", "script", "run"] },
  { id: 2, name: "FileWriter", skills: ["create", "edit", "write", "file", "patch"] },
  { id: 3, name: "GitOps", skills: ["commit", "push", "branch", "merge", "git"] },
  { id: 4, name: "Deployer", skills: ["deploy", "wrangler", "publish", "ship"] },
  { id: 5, name: "TestRunner", skills: ["test", "check", "verify", "validate", "lint"] },
  { id: 6, name: "LessonForge", skills: ["lesson", "teach", "curriculum", "vocab"] },
  { id: 8, name: "NotionSync", skills: ["notion", "database", "page", "sync"] },
  { id: 10, name: "BrowserPilot", skills: ["browse", "scrape", "screenshot", "playwright"] },
  { id: 12, name: "SecurityAudit", skills: ["security", "audit", "scan", "vulnerability"] },
  { id: 13, name: "PerformanceProbe", skills: ["performance", "speed", "benchmark", "optimize"] },
  { id: 16, name: "APIForge", skills: ["api", "endpoint", "route", "backend"] },
  { id: 17, name: "DatabaseOps", skills: ["database", "sql", "migrate", "schema"] },
  { id: 19, name: "LogAnalyzer", skills: ["log", "debug", "trace", "diagnose"] },
  { id: 25, name: "BackupAgent", skills: ["backup", "snapshot", "archive", "restore"] },
  { id: 29, name: "CanonKeeper", skills: ["canon", "bible", "doctrine", "soul"] },
];

function inferMode(intentLower) {
  const scores = { OBI: 0, OPTIMIZER: 0, AUDIT: 0 };
  for (const [mode, keywords] of Object.entries(MODE_KEYWORDS)) {
    scores[mode] = keywords.filter(k => intentLower.includes(k)).length;
  }

  if (scores.AUDIT > scores.OBI && scores.AUDIT >= scores.OPTIMIZER) return "AUDIT";
  if (scores.OPTIMIZER > scores.OBI) return "OPTIMIZER";
  return "OBI";
}

function computePriority(rawIntent) {
  if (/urgent|now|immediately|asap|critical|emergency/i.test(rawIntent)) return 1;
  if (/important|priority|soon/i.test(rawIntent)) return 3;
  if (/when you can|low priority|whenever|eventually/i.test(rawIntent)) return 8;
  return 5;
}

function matchLanes(intentLower) {
  const matches = [];
  for (const lane of EXECUTION_LANES) {
    const score = lane.skills.filter(s => intentLower.includes(s)).length;
    if (score > 0) matches.push({ ...lane, score });
  }
  matches.sort((a, b) => b.score - a.score);
  return matches;
}

export function routeCommandIntent(rawIntent) {
  const original = String(rawIntent || "");
  const intentLower = original.toLowerCase();

  const mode = inferMode(intentLower);
  const priority = computePriority(original);
  const matchedLanes = matchLanes(intentLower);

  const primaryDrone = matchedLanes[0] || { id: 1, name: "CodeRunner", skills: ["execute"], score: 0 };
  const supportDrones = matchedLanes.slice(1, 4);

  const interpretation = `${mode} mode selected. Primary lane: ${primaryDrone.name} (#${primaryDrone.id}). ${supportDrones.length} support lanes assigned.`;

  return {
    mode,
    policy: {
      mode,
      reason: matchedLanes.length > 0 ? "keyword-lane-match" : "default-fallback",
      matchedLaneCount: matchedLanes.length,
    },
    // Keep legacy fields for CommandDO/UI compatibility.
    agent99: {
      role: "Mode Router",
      interpretation,
    },
    agent98: {
      role: "Stress Test",
      notes: matchedLanes.length === 0
        ? "No lane keywords matched. Defaulting to CodeRunner."
        : `${matchedLanes.length} lanes matched with ${mode} policy gate.`,
    },
    agent97: {
      role: "Audit",
      trail: `mode=${mode}, intent="${original.slice(0, 100)}", lanes=${matchedLanes.map(d => d.name).join(",")}, priority=${priority}`,
    },
    primaryDrone,
    supportDrones,
    priority,
    translated: {
      original,
      sanitized: original,
      droneCount: matchedLanes.length,
      ts: Date.now(),
    },
  };
}
