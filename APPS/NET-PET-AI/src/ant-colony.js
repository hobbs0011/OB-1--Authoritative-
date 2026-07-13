// src/ant-colony.js — OBI Ant Colony / Stigmergy Engine
// Pheromone trail reinforcement over coaching domains, GLOBAL across the student swarm.
// Mold: Grassé 1959 (stigmergy), Goss 1989 (shortest-path positive feedback),
//       Dreyer et al. 2024 PNAS (ants > humans at collective problem solving via emergent memory),
//       Dorigo ACO. Trails are mechanical + automatic: deposit on win, evaporate on neglect.
// No top-down planning. Amplify whatever works; let losers evaporate. Ants cannot lie → trails = truth.

import { extractWeaknesses } from './memory-brain.js';

const HALF_LIFE_DAYS = 7;
const MS_PER_DAY = 86400000;

const DOMAIN_DEFAULTS = {
  th_sound: ["exaggerate_mouth_position", "model_in_reply", "drill_repeat_x3", "shadow_after_correction", "minimal_pairs_t_v_s"],
  r_l_sound: ["isolation_drill", "mirror_practice", "model_in_reply", "tongue_position_cue"],
  final_consonant: ["word_end_tap", "syllable_stretch", "model_in_reply"],
  word_stress: ["stress_beats", "markup_bold_stress", "contrast_pair"],
  past_tense: ["timeline_viz", "forced_correction", "story_retell"],
  present_perfect: ["anchor_recent", "forced_correction", "story_retell"],
  articles: ["article_minimal_pair", "forced_correction"],
  prepositions: ["spatial_gesture", "forced_correction"],
  vocabulary: ["collocation_pair", "sentence_frame", "shadow_example"],
  formality: ["register_switch", "model_in_reply"],
};

export async function ensureColonySchema(env) {
  if (!env.SOUL_DB) return false;
  await env.SOUL_DB.prepare(
    `CREATE TABLE IF NOT EXISTS pheromone_trails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      segment TEXT NOT NULL,
      action TEXT NOT NULL,
      weight REAL NOT NULL DEFAULT 0,
      deposits INTEGER NOT NULL DEFAULT 0,
      last_deposit_ts INTEGER NOT NULL DEFAULT 0,
      created_ts INTEGER NOT NULL DEFAULT 0,
      UNIQUE(segment, action)
    )`
  ).run();
  return true;
}

export async function seedDomainActions(env) {
  if (!(await ensureColonySchema(env))) return { seeded: 0 };
  const now = Date.now();
  let seeded = 0;
  for (const [domain, actions] of Object.entries(DOMAIN_DEFAULTS)) {
    for (const action of actions) {
      const existing = await env.SOUL_DB.prepare(
        `SELECT id FROM pheromone_trails WHERE segment = ? AND action = ?`
      ).bind(domain, action).first();
      if (!existing) {
        await env.SOUL_DB.prepare(
          `INSERT INTO pheromone_trails (segment, action, weight, deposits, last_deposit_ts, created_ts)
           VALUES (?, ?, 0.5, 0, ?, ?)`
        ).bind(domain, action, now, now).run();
        seeded++;
      }
    }
  }
  return { seeded };
}

export async function depositTrail(env, { segment, action, weight = 1 }) {
  if (!env.SOUL_DB || !segment || !action) return null;
  await ensureColonySchema(env);
  const now = Date.now();
  await env.SOUL_DB.prepare(
    `INSERT INTO pheromone_trails (segment, action, weight, deposits, last_deposit_ts, created_ts)
     VALUES (?, ?, ?, 0, ?, ?)
     ON CONFLICT(segment, action) DO UPDATE SET
       weight = weight + ?,
       deposits = deposits + 1,
       last_deposit_ts = ?`
  ).bind(segment, action, weight, now, now, weight, now).run();
  return { segment, action, weight };
}

export async function depositFromBreakthrough(env, text, weight = 2) {
  if (!env.SOUL_DB || !text) return { domains: [] };
  const weaknesses = extractWeaknesses(String(text));
  const domains = [...new Set(weaknesses.map(w => w.specific))];
  for (const domain of domains) {
    await depositTrail(env, { segment: domain, action: "model_in_reply", weight });
  }
  return { domains };
}

export async function evaporate(env, { halfLifeDays = HALF_LIFE_DAYS } = {}) {
  if (!env.SOUL_DB) return { pruned: 0 };
  await ensureColonySchema(env);
  const now = Date.now();
  const rows = await env.SOUL_DB.prepare(
    `SELECT id, weight, last_deposit_ts FROM pheromone_trails`
  ).all();
  let pruned = 0;
  for (const r of rows.results || []) {
    const ageDays = Math.max(0, (now - (r.last_deposit_ts || now)) / MS_PER_DAY);
    const decay = Math.pow(0.5, ageDays / halfLifeDays);
    const newWeight = (r.weight || 0) * decay;
    if (newWeight < 0.01) {
      await env.SOUL_DB.prepare(`DELETE FROM pheromone_trails WHERE id = ?`).bind(r.id).run();
      pruned++;
    } else {
      await env.SOUL_DB.prepare(`UPDATE pheromone_trails SET weight = ? WHERE id = ?`).bind(newWeight, r.id).run();
    }
  }
  return { pruned, halfLifeDays };
}

export async function getTrailMap(env, segment) {
  if (!env.SOUL_DB) return [];
  await ensureColonySchema(env);
  const q = segment
    ? `SELECT segment, action, weight, deposits, last_deposit_ts FROM pheromone_trails WHERE segment = ? ORDER BY weight DESC`
    : `SELECT segment, action, weight, deposits, last_deposit_ts FROM pheromone_trails ORDER BY weight DESC`;
  const r = segment ? await env.SOUL_DB.prepare(q).bind(segment).all() : await env.SOUL_DB.prepare(q).all();
  return r.results || [];
}

export async function selectAction(env, { segment, candidates, exploreRate = 0.1 }) {
  if (!segment) throw new Error("segment required");
  const map = await getTrailMap(env, segment);
  const known = new Map(map.map(t => [t.action, t.weight]));
  const pool = (candidates && candidates.length)
    ? candidates
    : [...new Set(map.map(t => t.action))];
  if (pool.length === 0) return { action: null, weights: {}, source: "empty" };

  const weights = {};
  let total = 0;
  for (const a of pool) {
    const w = Math.max(0.01, known.get(a) || 0.01);
    weights[a] = w;
    total += w;
  }
  if (Math.random() < exploreRate) {
    const action = pool[Math.floor(Math.random() * pool.length)];
    return { action, weights, source: "explore" };
  }
  let roll = Math.random() * total;
  for (const a of pool) {
    roll -= weights[a];
    if (roll <= 0) return { action: a, weights, source: "exploit" };
  }
  return { action: pool[pool.length - 1], weights, source: "fallback" };
}

export async function runColonyLoop(env) {
  const report = { ok: true, schema: false, seeded: 0, evaporated: null, errors: [] };
  try {
    report.schema = await ensureColonySchema(env);
    const seed = await seedDomainActions(env);
    report.seeded = seed.seeded;
    report.evaporated = await evaporate(env);
  } catch (err) {
    report.errors.push(err.message);
    report.ok = false;
  }
  return report;
}
