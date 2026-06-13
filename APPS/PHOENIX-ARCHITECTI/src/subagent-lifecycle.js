const PHEROMONE_INTERVAL_MS = 30000;
const DEFAULT_KEYWORDS = ['PACT', 'PARCH', 'Agent99', 'Agent99 OS', 'FORCEAWARENESS', 'RISE', 'DEATH', 'pheromone', 'phetrail', 'SOUL', 'PCC1', 'PCC2', 'PCC3', 'pcc1-obi', 'orchestrator', 'PhoenixCoder', 'PhoenixArt', 'role'];

function nowIso() {
  return new Date().toISOString();
}

function safeText(value) {
  return typeof value === 'string' ? value : JSON.stringify(value || '');
}

function keywordSet(text) {
  const source = safeText(text).toLowerCase();
  return [...new Set(DEFAULT_KEYWORDS.filter(k => source.includes(k.toLowerCase())))];
}

function hashSeed(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function createSubagentId(agentType, missionId, taskKey) {
  const seed = `${agentType}:${missionId}:${taskKey}:${Date.now()}`;
  return `${agentType.toLowerCase()}-${hashSeed(seed)}`;
}

async function putTrail(env, key, value) {
  if (!env?.CACHE) return;
  await env.PHETRAIL.put(key, JSON.stringify(value));
}

export async function openRise(env, { missionId, subagentId, agentType, commander = 'pcc1-obi', pcc, target, task }) {
  const startedAt = nowIso();
  const payload = {
    mission_id: missionId,
    subagent_id: subagentId,
    agent_type: agentType,
    commander,
    pcc,
    target: target || '',
    task_preview: safeText(task).slice(0, 500),
    keywords: keywordSet(task),
    status: 'RUNNING',
    started_at: startedAt,
    pheromone_interval_ms: PHEROMONE_INTERVAL_MS,
    rise_boots: {
      genesis_boot: {
        name: 'Agent99 Genesis Boot',
        scope: 'all agents and subagents on birth',
        loaded: ['Agent99 OS', 'RISE', 'DEATH', 'FORCEAWARENESS', 'pheromone trails', 'SOUL'],
        completed_at: startedAt,
      },
      role_boot: {
        name: 'Role Boot',
        scope: 'role-specific short bright life',
        loaded: ['role pheromones', 'related starmaps', 'mission context'],
        role: agentType,
        completed_at: startedAt,
      },
    },
  };

  await putTrail(env, `subagent:rise:${subagentId}`, payload);
  await putTrail(env, 'subagent:latest', { ...payload, event: 'RISE' });
  return payload;
}

export function buildPheromoneTicks(startedAtMs, endedAtMs) {
  const ticks = [];
  const start = Math.floor(startedAtMs / PHEROMONE_INTERVAL_MS) * PHEROMONE_INTERVAL_MS;
  for (let tickMs = start; tickMs <= endedAtMs; tickMs += PHEROMONE_INTERVAL_MS) {
    ticks.push({
      tick_ms: tickMs,
      elapsed_ms: Math.max(0, tickMs - startedAtMs),
      pheromone: `subagent:${tickMs}`,
    });
  }
  return ticks.length ? ticks : [{ tick_ms: startedAtMs, elapsed_ms: 0, pheromone: `subagent:${startedAtMs}` }];
}

export async function markPheromoneTicks(env, { subagentId, agentType, missionId, startedAtMs, endedAtMs, status, task }) {
  const ticks = buildPheromoneTicks(startedAtMs, endedAtMs);
  for (const tick of ticks) {
    await putTrail(env, `subagent:pheromone:${subagentId}:${tick.tick_ms}`, {
      mission_id: missionId,
      subagent_id: subagentId,
      agent_type: agentType,
      tick,
      status,
      keywords: keywordSet(task),
      written_at: nowIso(),
    });
  }
  await putTrail(env, 'subagent:latest', {
    event: 'PHEROMONE',
    mission_id: missionId,
    subagent_id: subagentId,
    agent_type: agentType,
    status,
    ticks: ticks.length,
    written_at: nowIso(),
  });
  return ticks;
}

export async function closeDeath(env, { missionId, subagentId, agentType, commander, pcc, target, task, startedAt, endedAt, status, error = '', lessons = [], pheromoneTicks = [] }) {
  const payload = {
    mission_id: missionId,
    subagent_id: subagentId,
    agent_type: agentType,
    commander,
    pcc,
    target: target || '',
    task_preview: safeText(task).slice(0, 500),
    status,
    started_at: startedAt,
    ended_at: endedAt,
    duration_ms: Math.max(0, new Date(endedAt).getTime() - new Date(startedAt).getTime()),
    error,
    lessons,
    keywords: keywordSet(task),
    pheromone_ticks: pheromoneTicks.length,
    pheromone_interval_ms: PHEROMONE_INTERVAL_MS,
    protocol: 'RISE -> PHEROMONE_EVERY_30S -> DEATH',
  };

  await putTrail(env, `subagent:death:${subagentId}`, payload);
  await putTrail(env, 'subagent:latest', { ...payload, event: 'DEATH' });
  return payload;
}
