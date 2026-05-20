// src/durable_objects.js — DO CLASS EXPORT GATE
// One file. Six classes. No utility dependencies.
// Header ← imports json() from local scope only if needed; NEVER CORS.
// index.js → export { ... } from './durable_objects.js' satisfies Cloudflare class resolution.

// ── LedgerDO ─────────────────────────────────────────────────────────────────
export class LedgerDO {
  constructor(state, env) {
    this.state = state; this.env = env; this.sql = state.storage.sql;
    this.sql.exec("CREATE TABLE IF NOT EXISTS ledger (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id TEXT NOT NULL, event_type TEXT NOT NULL, payload TEXT NOT NULL, prev_hash TEXT NOT NULL DEFAULT '0000000000000000000000000000000000000000000000000000000000000000', entry_hash TEXT NOT NULL, ts INTEGER NOT NULL)");
    this.sql.exec("CREATE INDEX IF NOT EXISTS idx_ledger_student ON ledger(student_id, id)");
  }
  async fetch(request) {
    const url = new URL(request.url);
    function j(d, s = 200) { return new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } }); }
    if (url.pathname === "/append" && request.method === "POST") {
      const body = await request.json(); const { studentId = "unknown", eventType = "unknown" } = body;
      const payload = typeof body.payload === "string" ? body.payload : JSON.stringify(body.payload); const ts = Date.now();
      const lastRow = this.sql.exec("SELECT entry_hash FROM ledger WHERE student_id = ? ORDER BY id DESC LIMIT 1", studentId).toArray()[0];
      const prevHash = lastRow?.entry_hash || "0000000000000000000000000000000000000000000000000000000000000000";
      const entryHash = await (typeof computeHash === "function" ? computeHash : (async s => { const { sha256 } = await import('crypto'); return sha256(s) }))(`${studentId}|${eventType}|${payload}|${prevHash}|${ts}`);
      this.sql.exec("INSERT INTO ledger (student_id, event_type, payload, prev_hash, entry_hash, ts) VALUES (?,?,?,?,?,?)", studentId, eventType, payload, prevHash, entryHash, ts);
      return j({ ok: true, entryHash, prevHash, ts, eventType });
    }
    if (url.pathname === "/history") {
      const studentId = url.searchParams.get("studentId"); if (!studentId) return j({ error: "studentId required" }, 400);
      const eventType = url.searchParams.get("eventType");
      const q = eventType ? "SELECT * FROM ledger WHERE student_id = ? AND event_type = ? ORDER BY id DESC LIMIT 200" : "SELECT * FROM ledger WHERE student_id = ? ORDER BY id DESC LIMIT 200";
      const rows = this.sql.exec(q, ...(eventType ? [studentId, eventType] : [studentId])).toArray();
      return j({ entries: rows, count: rows.length });
    }
    if (url.pathname === "/verify") {
      const studentId = url.searchParams.get("studentId"); if (!studentId) return j({ error: "studentId required" }, 400);
      const rows = this.sql.exec("SELECT entry_hash, prev_hash, ts, event_type FROM ledger WHERE student_id = ? ORDER BY id ASC", studentId).toArray();
      let valid = true;
      for (let i = 1; i < rows.length; i++) { if (rows[i].prev_hash !== rows[i - 1].entry_hash) { valid = false; break; } }
      const anchor = rows.length ? rows[0].prev_hash : "0000000000000000000000000000000000000000000000000000000000000000";
      return j({ studentId, valid: valid && (rows.length === 0 || rows[0].prev_hash === anchor), count: rows.length, firstHash: rows[0]?.entry_hash || null, lastHash: rows.at(-1)?.entry_hash || null, anchorHash: anchor });
    }
    if (url.pathname === "/count") {
      const v = url.searchParams.get("studentId");
      const r = this.sql.exec(v ? "SELECT COUNT(*) as cnt FROM ledger WHERE student_id = ?" : "SELECT COUNT(*) as cnt FROM ledger", ...(v ? [v] : [])).toArray()[0];
      return j({ count: r?.cnt || 0, studentId: v || null });
    }
    return j({ error: "Not found" }, 404);
  }
}

// ── SessionDO ─────────────────────────────────────────────────────────────────
export class SessionDO {
  constructor(state, env) {
    this.state = state; this.env = env; this.sql = state.storage.sql;
    this.sql.exec("CREATE TABLE IF NOT EXISTS memory (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id TEXT, user_msg TEXT, obi_msg TEXT, ts INTEGER)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS class_sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, class_id TEXT, teacher_id TEXT, total_students INTEGER, started_at INTEGER)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS class_events (id INTEGER PRIMARY KEY AUTOINCREMENT, class_id TEXT, student_id TEXT, type TEXT, rule_status TEXT, notes TEXT, ts INTEGER)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS session_events (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id TEXT NOT NULL, topic TEXT, phase TEXT, event TEXT, selector_used TEXT DEFAULT NULL, ts INTEGER NOT NULL)");
    this.sql.exec("CREATE INDEX IF NOT EXISTS idx_sessions_student ON class_events(class_id, ts)");
    this.sql.exec("CREATE INDEX IF NOT EXISTS idx_session_events_student ON session_events(student_id, ts)");
  }
  async fetch(request) {
    const url = new URL(request.url); function j(d, s = 200) { return new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } }); }
    if (url.pathname === "/log" && request.method === "POST") { const body = await request.json(); this.sql.exec("INSERT INTO memory (student_id, user_msg, obi_msg, ts) VALUES (?,?,?,?)", String(body.studentId || "anon"), String(body.userMsg || ""), String(body.obiMsg || ""), Date.now()); return j({ ok: true }); }
    if (url.pathname === "/log" && request.method === "GET") { const s = url.searchParams.get("studentId") || "anon"; const l = Math.min(parseInt(url.searchParams.get("limit") || "30"), 200); const r = this.sql.exec("SELECT * FROM memory WHERE student_id = ? ORDER BY id DESC LIMIT ?", s, l).toArray(); return j({ entries: r.slice().reverse(), count: r.length }); }
    if (url.pathname === "/class/start" && request.method === "POST") { const body = await request.json(); this.sql.exec("INSERT INTO class_sessions (class_id, teacher_id, total_students, started_at) VALUES (?,?,?,?)", body.classId, body.teacherId, body.totalStudents || 0, Date.now()); return j({ ok: true }); }
    if (url.pathname === "/class/event" && request.method === "POST") { const body = await request.json(); this.sql.exec("INSERT INTO class_events (class_id, student_id, type, rule_status, notes, ts) VALUES (?,?,?,?,?,?)", String(body.classId || ""), String(body.studentId || "anon"), String(body.type || "general"), String(body.ruleStatus || ""), String(body.notes || ""), Date.now()); return j({ ok: true }); }
    if (url.pathname === "/history") { const c = url.searchParams.get("classId") || ""; const l = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200); const ss = this.sql.exec("SELECT * FROM class_sessions WHERE class_id = ? ORDER BY started_at DESC LIMIT ?", c, l).toArray(); const ee = this.sql.exec("SELECT * FROM class_events WHERE class_id = ? ORDER BY ts DESC LIMIT 500", c).toArray(); return j({ sessions: ss, events: ee }); }
    if (url.pathname === "/session/log" && request.method === "POST") { const body = await request.json(); this.sql.exec("INSERT INTO session_events (student_id, topic, phase, event, selector_used, ts) VALUES (?,?,?,?,?,?)", String(body.studentId || "anon"), String(body.topic || "general"), String(body.phase || "E1"), String(body.event || "loop"), String(body.selectorUsed || "ai"), Date.now()); return j({ ok: true }); }
    if (url.pathname === "/relations/get" && request.method === "GET") { const s = url.searchParams.get("studentId"); if (!s) return j({ error: "studentId required" }, 400); const stub = this.env.SESSIONS.get(this.env.SESSIONS.idFromName("system-roster")); const res = await stub.fetch(new Request("https://do/roster?studentId=" + encodeURIComponent(s))); return res; }
    if (url.pathname === "/roster") { const total = this.sql.exec("SELECT COUNT(*) as cnt FROM session_events").toArray()[0]?.cnt || 0; const le = this.sql.exec("SELECT * FROM session_events ORDER BY ts DESC LIMIT 1").toArray()[0] || null; const tc = this.sql.exec("SELECT topic, COUNT(*) as cnt FROM session_events WHERE topic != '' GROUP BY topic ORDER BY cnt DESC LIMIT 10").toArray(); return j({ total, lastEvent: le, topicCounts: tc }); }
    return j({ error: "Not found" }, 404);
  }
}

// ── ProfileDO ─────────────────────────────────────────────────────────────────
export class ProfileDO {
  constructor(state, env) {
    this.state = state; this.env = env; this.sql = state.storage.sql;
    this.sql.exec("CREATE TABLE IF NOT EXISTS student_state (id INTEGER PRIMARY KEY CHECK (id = 1), engagement_score INTEGER NOT NULL DEFAULT 50, error_rate REAL NOT NULL DEFAULT 0, drift_score REAL NOT NULL DEFAULT 0, last_recalc INTEGER NOT NULL DEFAULT 0)");
    this.sql.exec("INSERT OR IGNORE INTO student_state (id, engagement_score, error_rate, drift_score, last_recalc) VALUES (1, 50, 0, 0, 0)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS profiles (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id TEXT UNIQUE, level TEXT, goal TEXT, game_mode TEXT, daily_xp_target INTEGER, weekly_xp_target INTEGER)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS weak_points (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id TEXT NOT NULL, grammar_point TEXT NOT NULL, error_count INTEGER DEFAULT 0, severity TEXT DEFAULT 'medium')");
    this.sql.exec("CREATE INDEX IF NOT EXISTS idx_weak_points_student ON weak_points(student_id, error_count DESC)");
  }
  _updateState(scores) {
    const now = Date.now(); const cur = this.sql.exec("SELECT * FROM student_state WHERE id = 1").toArray()[0] || {};
    const es = Math.max(0, Math.min(100, (cur.engagement_score || 50) + (scores?.engagementDelta || 0)));
    const ed = (scores?.hasMistakes ?? false) ? -2 : 3; const er = Math.max(0, Math.min(1, (cur.error_rate || 0) + ed * 0.01)); const ds = Math.max(0, (cur.drift_score || 0) + (scores?.driftDelta || 0));
    this.sql.exec("INSERT INTO student_state (id, engagement_score, error_rate, drift_score, last_recalc) VALUES (1,?,?,?,?) ON CONFLICT(id) DO UPDATE SET engagement_score=excluded.engagement_score, error_rate=excluded.error_rate, drift_score=excluded.drift_score, last_recalc=excluded.last_recalc", es, er, ds, now);
  }
  async fetch(request) {
    const url = new URL(request.url); function j(d, s = 200) { return new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } }); }
    if (url.pathname === "/reactivity" && request.method === "POST") { const body = await request.json(); const sid = body.studentId || "anon"; this._updateState({ engagementDelta: body.engagementDelta, hasMistakes: body.hasMistakes, driftDelta: body.driftDelta }); return j({ ok: true }); }
    if (url.pathname === "/weakness/update" && request.method === "POST") { const body = await request.json(); for (const w of (body.weaknesses || [])) { this.sql.exec("INSERT INTO weak_points (student_id, grammar_point, error_count, severity) VALUES (?,?,1,'medium') ON CONFLICT(student_id, grammar_point) DO UPDATE SET error_count = error_count + 1", body.studentId, w); } return j({ ok: true }); }
    if (url.pathname === "/weakness/get") { const s = url.searchParams.get("studentId") || "anon"; const r = this.sql.exec("SELECT * FROM weak_points WHERE student_id = ? ORDER BY error_count DESC", s).toArray(); return j({ studentId: s, weakPoints: r }); }
    if (url.pathname === "/summary/get") { const s = url.searchParams.get("studentId") || "anon"; const row = this.sql.exec("SELECT * FROM student_state WHERE id = 1").toArray()[0] || {}; const summary = ["Level: " + (row.goal || "A1"), "Engagement: " + (row.engagement_score || 50) + "/100", "Error rate: " + Math.round((row.error_rate || 0) * 100) + "%", "Drift score: " + (row.drift_score || 0)].join("\n"); return j({ studentId: s, summary }); }
    if (url.pathname === "/summary/update" && request.method === "POST") { this.sql.exec("UPDATE student_state SET last_recalc = ? WHERE id = 1", Date.now()); return j({ ok: true }); }
    if (url.pathname === "/analytics/full") { const now = Date.now(); const b = this.sql.exec("SELECT * FROM student_state WHERE id = 1").toArray()[0]; if (!b) return j({ error: "No student state" }, 404); const es = Math.max(0, Math.min(100, (b.engagement_score || 50) + 1)); const ec = this.sql.exec("SELECT COUNT(*) as c FROM weak_points").toArray()[0]?.c || 0; const er = Math.min(1, ec / Math.max(1, 10)); const predictedAction = er > 0.5 ? "SOLO_PLAY" : "ARCADE_MODE"; const wp = this.sql.exec("SELECT * FROM weak_points ORDER BY error_count DESC LIMIT 10").toArray(); this.sql.exec("UPDATE student_state SET engagement_score=?, error_rate=?, last_recalc=? WHERE id=1", es, er, now); return j({ studentId: "all", prediction: predictedAction, errRate: er, weakPoints: wp.map(w => ({ specific: w.grammar_point, count: w.error_count })), teacherMode: er > 0.3 ? "deep_dive" : "speaking_practice" }); }
    if (url.pathname === "/state") { const state = this.sql.exec("SELECT * FROM student_state LIMIT 1").toArray()[0] || null; const profile = this.sql.exec("SELECT * FROM profiles LIMIT 1").toArray()[0] || null; const wp = this.sql.exec("SELECT * FROM weak_points ORDER BY error_count DESC LIMIT 10").toArray(); return j({ studentState: state, profile, weakPoints: wp }); }
    if (url.pathname === "/state/full") { const state = this.sql.exec("SELECT * FROM student_state LIMIT 1").toArray()[0] || null; const profile = this.sql.exec("SELECT * FROM profiles LIMIT 1").toArray()[0] || null; const wp = this.sql.exec("SELECT * FROM weak_points ORDER BY error_count DESC LIMIT 10").toArray(); return j({ studentState: state, profile, weakPoints: wp }); }
    return j({ error: "Not found" }, 404);
  }
}

// ── PetDO ─────────────────────────────────────────────────────────────────────
export class PetDO {
  constructor(state, env) {
    this.state = state; this.env = env; this.sql = state.storage.sql;
    this.sql.exec("CREATE TABLE IF NOT EXISTS pet_state (id INTEGER PRIMARY KEY CHECK (id = 1), streak INTEGER DEFAULT 0, xp INTEGER DEFAULT 0, mood TEXT DEFAULT 'neutral', total_sessions INTEGER DEFAULT 0, last_checkin INTEGER DEFAULT 0, longest_streak INTEGER DEFAULT 0, tiger_score INTEGER DEFAULT 0, day_phase TEXT DEFAULT 'E1')");
    this.sql.exec("INSERT OR IGNORE INTO pet_state (id, streak, xp, mood, total_sessions, last_checkin, longest_streak, tiger_score, day_phase) VALUES (1, 0, 0, 'neutral', 0, 0, 0, 0, 'E1')");
    for (const m of ["ALTER TABLE pet_state ADD COLUMN tiger_score INTEGER DEFAULT 0", "ALTER TABLE pet_state ADD COLUMN day_phase TEXT DEFAULT 'E1'"]) { try { this.sql.exec(m); } catch(_) {} }
    this.sql.exec("CREATE TABLE IF NOT EXISTS checkins (id INTEGER PRIMARY KEY AUTOINCREMENT, minutes INTEGER, confidence INTEGER, xp_gained INTEGER, streak_at_checkin INTEGER, ts INTEGER)");
  }
  async fetch(request) {
    const url = new URL(request.url); function j(d, s = 200) { return new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } }); }
    if (url.pathname === "/checkin" && request.method === "POST") {
      const body = await request.json(); const mins = Math.min(body.minutes || 5, 240); const conf = Math.max(1, Math.min(10, body.confidence || 5)); const now = Date.now();
      const cur = this.sql.exec("SELECT * FROM pet_state WHERE id = 1").toArray()[0]; const hrs = (now - (cur.last_checkin || 0)) / 3600000;
      let streak = cur.streak; if (hrs >= 4 && hrs < 48) streak += 1; else if (hrs >= 48) streak = 1;
      const bonus = [1, 3, 7, 30].includes(streak) ? 1.5 : 1; const xpGain = Math.round(mins * (1 + conf / 10) * bonus); const curXp = cur.xp || 0;
      const ls = Math.max(cur.longest_streak || 0, streak);
      let mood = "neutral"; if (streak >= 7 && conf >= 8) mood = "tiger"; else if (streak >= 5 && conf >= 7) mood = "fired_up"; else if (streak >= 3) mood = "happy"; else if (streak >= 1) mood = "content"; else if (conf <= 3) mood = "sleepy";
      const tot = (cur.total_sessions || 0) + 1;
      this.sql.exec("UPDATE pet_state SET streak=?, xp=?, mood=?, total_sessions=?, last_checkin=?, longest_streak=? WHERE id=1", streak, curXp + xpGain, mood, tot, now, ls);
      this.sql.exec("INSERT INTO checkins (minutes, confidence, xp_gained, streak_at_checkin, ts) VALUES (?,?,?,?,?)", mins, conf, xpGain, streak, now);
      const rc = this.sql.exec("SELECT ts FROM checkins WHERE ts > ? ORDER BY ts DESC", now - 7 * 86400000).toArray(); const ud = new Set(rc.map(c => Math.floor(c.ts / 86400000))); const ret = Math.min(1, ud.size / 7);
      const cf2 = this.sql.exec("SELECT confidence FROM checkins ORDER BY id DESC LIMIT 10").toArray(); const avg = cf2.length ? cf2.reduce((a, r) => a + r.confidence, 0) / cf2.length : 5; const er = Math.min(1, avg / 10); const dc = 1;
      const ts2 = Math.round(ret * 40 + er * 40 + dc * 20); const dp = tot <= 2 ? "E1" : tot <= 5 ? "E2" : "E3";
      this.sql.exec("UPDATE pet_state SET tiger_score=?, day_phase=? WHERE id=1", ts2, dp);
      const msgs = { 1: "Day 1. Every Tiger was once a Mouse.", 3: "Day 3. Three in a row.", 7: "Day 7. One full week.", 30: "Day 30. Thirty days straight." };
      return j({ ok: true, state: { streak, xp: curXp + xpGain, mood, totalSessions: tot, xpGain, longestStreak: ls, tigerScore: ts2, dayPhase: dp }, milestone: [1, 3, 7, 30].includes(streak) ? { day: streak, message: msgs[streak] } : null });
    }
    if (url.pathname === "/state") { const s = this.sql.exec("SELECT * FROM pet_state WHERE id = 1").toArray()[0] || { streak: 0 }; return j({ state: { streak: s.streak, xp: s.xp, mood: s.mood, totalSessions: s.total_sessions, longestStreak: s.longest_streak, tigerScore: s.tiger_score, dayPhase: s.day_phase } }); }
    if (url.pathname === "/score") { const s = this.sql.exec("SELECT * FROM pet_state WHERE id = 1").toArray()[0] || {}; const now = Date.now(); const rc = this.sql.exec("SELECT ts, confidence FROM checkins WHERE ts > ? ORDER BY ts DESC", now - 7 * 86400000).toArray(); const ud = new Set(rc.map(c => Math.floor(c.ts / 86400000))); const ret = Math.min(1, ud.size / 7); const cf2 = this.sql.exec("SELECT confidence FROM checkins ORDER BY id DESC LIMIT 10").toArray(); const avg = cf2.length ? cf2.reduce((a, r) => a + r.confidence, 0) / cf2.length : 5; const er = Math.min(1, avg / 10); const lc = s.last_checkin || 0; const dc = (now - lc) < 86400000 ? 1 : 0; const ts2 = Math.round(ret * 40 + er * 40 + dc * 20); return j({ tigerScore: ts2, breakdown: { retention: Math.round(ret * 100), errorReduction: Math.round(er * 100) }, streak: s.streak || 0, dayPhase: s.day_phase || "E1", status: ts2 < 40 ? "MOUSE_MODE" : ts2 < 70 ? "CAT_MODE" : "TIGER_MODE" }); }
    if (url.pathname === "/daily-check") { const s = this.sql.exec("SELECT * FROM pet_state WHERE id = 1").toArray()[0] || {}; const now = Date.now(); const lc = s.last_checkin || 0; const hi = (now - lc) / 3600000; const ts2 = s.tiger_score || 0; return j({ tigerScore: ts2, hoursInactive: Math.round(hi), streak: s.streak || 0, totalSessions: s.total_sessions || 0, needsAlert: hi >= 24 && ts2 < 40, needsDrill: hi < 48 }); }
    return j({ error: "Not found" }, 404);
  }
}

// ── CommandDO ─────────────────────────────────────────────────────────────────
export class CommandDO {
  constructor(state, env) {
    this.state = state; this.env = env; this.sql = state.storage.sql;
    this.sql.exec("CREATE TABLE IF NOT EXISTS commands (id INTEGER PRIMARY KEY AUTOINCREMENT, raw_intent TEXT NOT NULL, translation TEXT NOT NULL DEFAULT '{}', priority INTEGER NOT NULL DEFAULT 5, status TEXT NOT NULL DEFAULT 'pending', source TEXT NOT NULL DEFAULT 'magic-chat', assigned_drone TEXT DEFAULT NULL, claimed_by TEXT DEFAULT NULL, result TEXT DEFAULT NULL, success INTEGER DEFAULT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)");
    this.sql.exec("CREATE INDEX IF NOT EXISTS idx_commands_status ON commands(status, priority, created_at)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS post_metrics (post_id TEXT PRIMARY KEY, platform TEXT NOT NULL DEFAULT 'unknown', hook TEXT DEFAULT '', body TEXT DEFAULT '', tone TEXT DEFAULT 'unknown', format TEXT DEFAULT 'text', base_insight TEXT DEFAULT '', experiment_id TEXT DEFAULT NULL, impressions INTEGER DEFAULT 0, likes INTEGER DEFAULT 0, comments INTEGER DEFAULT 0, shares INTEGER DEFAULT 0, saves INTEGER DEFAULT 0, clicks INTEGER DEFAULT 0, watch_time REAL DEFAULT 0, virality_score REAL DEFAULT NULL, conversion_score REAL DEFAULT NULL, created_at INTEGER NOT NULL)");
    this.sql.exec("CREATE INDEX IF NOT EXISTS idx_post_metrics_score ON post_metrics(virality_score)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS experiments (id TEXT PRIMARY KEY, variant_group TEXT NOT NULL, hook TEXT NOT NULL, body TEXT DEFAULT '', platform TEXT DEFAULT 'unknown', tone TEXT DEFAULT 'unknown', impressions INTEGER DEFAULT 0, clicks INTEGER DEFAULT 0, conversions INTEGER DEFAULT 0, status TEXT NOT NULL DEFAULT 'running', created_at INTEGER NOT NULL)");
    this.sql.exec("CREATE INDEX IF NOT EXISTS idx_experiments_status ON experiments(status)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS content_patterns (id INTEGER PRIMARY KEY AUTOINCREMENT, pattern TEXT NOT NULL, tone TEXT DEFAULT 'unknown', platform TEXT DEFAULT 'unknown', format TEXT DEFAULT 'text', score REAL DEFAULT 0, times_used INTEGER DEFAULT 0, last_used INTEGER DEFAULT NULL, created_at INTEGER NOT NULL)");
  }
  async fetch(request) {
    const url = new URL(request.url); function j(d, s = 200) { return new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } }); }
    if (url.pathname === "/send" && request.method === "POST") { const body = await request.json(); const now = Date.now(); const tr = body.translation || {}; const drone = tr.primaryDrone?.name || "CodeRunner"; this.sql.exec("INSERT INTO commands (raw_intent, translation, priority, status, source, assigned_drone, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)", body.rawIntent || "", JSON.stringify(tr), body.priority || 5, "pending", body.source || "magic-chat", drone, now, now); const r = this.sql.exec("SELECT last_insert_rowid() as id").toArray()[0]; return j({ ok: true, commandId: r.id, status: "pending", assignedDrone: drone, priority: body.priority || 5, ts: now }); }
    if (url.pathname === "/queue") { const st = url.searchParams.get("status") || "pending"; const l = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100); const r = this.sql.exec("SELECT * FROM commands WHERE status = ? ORDER BY priority ASC, created_at ASC LIMIT ?", st, l).toArray(); return j({ commands: r.map(x => ({ ...x, translation: JSON.parse(x.translation || "{}") })), count: r.length, status: st }); }
    if (url.pathname === "/claim" && request.method === "POST") { const body = await request.json(); const cid = body.commandId; const cl = body.claimedBy || "vscode-extension"; const e = this.sql.exec("SELECT * FROM commands WHERE id = ?", cid).toArray()[0]; if (!e) return j({ error: "Command not found" }, 404); if (e.status !== "pending") return j({ error: `Already ${e.status}` }, 409); this.sql.exec("UPDATE commands SET status='claimed', claimed_by=?, updated_at=? WHERE id=?", cl, Date.now(), cid); return j({ ok: true, commandId: cid, status: "claimed", claimedBy: cl }); }
    if (url.pathname === "/complete" && request.method === "POST") { const body = await request.json(); const cid = body.commandId; const e = this.sql.exec("SELECT * FROM commands WHERE id = ?", cid).toArray()[0]; if (!e) return j({ error: "Command not found" }, 404); this.sql.exec("UPDATE commands SET status=?, result=?, success=?, updated_at=? WHERE id=?", body.success !== false ? "completed" : "failed", body.result || "", body.success !== false ? 1 : 0, Date.now(), cid); return j({ ok: true, commandId: cid, status: body.success !== false ? "completed" : "failed" }); }
    if (url.pathname === "/status") { const id = url.searchParams.get("id"); if (!id) return j({ error: "Missing id" }, 400); const r = this.sql.exec("SELECT * FROM commands WHERE id = ?", parseInt(id)).toArray()[0]; if (!r) return j({ error: "Not found" }, 404); return j({ command: { ...r, translation: JSON.parse(r.translation || "{}") } }); }
    if (url.pathname === "/history") { const lmt = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200); const r = this.sql.exec("SELECT * FROM commands ORDER BY created_at DESC LIMIT ?", lmt).toArray(); return j({ commands: r.map(x => ({ ...x, translation: JSON.parse(x.translation || "{}") })), count: r.length }); }
    if (url.pathname === "/virality/metrics" && request.method === "POST") { const body = await request.json(); const pid = body.postId || body.post_id || "post_" + Date.now(); this.sql.exec("INSERT OR REPLACE INTO post_metrics (post_id,platform,hook,body,tone,format,base_insight,experiment_id,impressions,likes,comments,shares,saves,clicks,watch_time,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", pid, body.platform || "unknown", body.hook || "", body.body || "", body.tone || "unknown", body.format || "text", body.base_insight || "", body.experiment_id || null, body.impressions || 0, body.likes || 0, body.comments || 0, body.shares || 0, body.saves || 0, body.clicks || 0, body.watch_time || 0, Date.now()); return j({ ok: true, postId: pid }); }
    return j({ error: "Not found" }, 404);
  }
}

// ── MemoryDO ──────────────────────────────────────────────────────────────────
export class MemoryDO {
  constructor(state, env) {
    this.state = state; this.env = env; this.sql = state.storage.sql;
    this.sql.exec("CREATE TABLE IF NOT EXISTS session_log (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id TEXT NOT NULL, session_type TEXT NOT NULL DEFAULT 'chat', input TEXT NOT NULL DEFAULT '', output TEXT NOT NULL DEFAULT '', score INTEGER DEFAULT 0, weak_areas TEXT DEFAULT '[]', route TEXT DEFAULT '{}', ts INTEGER NOT NULL)");
    this.sql.exec("CREATE INDEX IF NOT EXISTS idx_session_log_student ON session_log(student_id, ts)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS memory_state (student_id TEXT PRIMARY KEY, level TEXT DEFAULT 'A1', goal TEXT DEFAULT 'daily speaking', streak INTEGER DEFAULT 0, last_active INTEGER DEFAULT 0, last_score INTEGER DEFAULT 0, weak_areas TEXT DEFAULT '[]', summary TEXT DEFAULT '', updated_at INTEGER DEFAULT 0)");
  }
  async fetch(request) {
    const url = new URL(request.url); function j(d, s = 200) { return new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } }); }
    if (url.pathname === "/log" && request.method === "POST") { const body = await request.json(); const now = Date.now(); this.sql.exec("INSERT INTO session_log (student_id, session_type, input, output, score, weak_areas, route, ts) VALUES (?,?,?,?,?,?,?,?)", String(body.studentId || "anon"), String(body.sessionType || "chat"), String(body.input || ""), String(body.output || ""), Number(body.score) || 0, JSON.stringify(body.weakAreas || []), JSON.stringify(body.route || {}), now); return j({ ok: true, ts: now }); }
    if (url.pathname === "/log" && request.method === "GET") { const sid = url.searchParams.get("studentId") || "anon"; const lim = Math.min(parseInt(url.searchParams.get("limit") || "30"), 200); const r = this.sql.exec("SELECT * FROM session_log WHERE student_id = ? ORDER BY ts DESC LIMIT ?", sid, lim).toArray(); return j({ entries: r, count: r.length }); }
    if (url.pathname === "/state" && request.method === "GET") { const sid = url.searchParams.get("studentId") || "anon"; const r = this.sql.exec("SELECT * FROM memory_state WHERE student_id = ?", sid).toArray()[0]; return j(r || { student_id: sid, level: "A1", goal: "daily speaking", streak: 0 }); }
    if (url.pathname === "/state" && request.method === "POST") { const body = await request.json(); const sid = String(body.studentId || "anon"); const now = Date.now(); this.sql.exec("INSERT INTO memory_state (student_id, level, goal, streak, last_active, last_score, weak_areas, summary, updated_at) VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(student_id) DO UPDATE SET level=excluded.level, goal=excluded.goal, streak=excluded.streak, last_active=excluded.last_active, last_score=excluded.last_score, weak_areas=excluded.weak_areas, summary=excluded.summary, updated_at=excluded.updated_at", sid, String(body.level || "A1"), String(body.goal || "daily speaking"), Number(body.streak) || 0, now, Number(body.lastScore) || 0, JSON.stringify(body.weakAreas || []), String(body.summary || ""), now); return j({ ok: true, studentId: sid }); }
    return j({ error: "Not found" }, 404);
  }
}
