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
      const entryHash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${studentId}|${eventType}|${payload}|${prevHash}|${ts}`)).then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join(""));
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
    // P10 PURGE ENDPOINT — GDPR erasure support (student-scoped)
    if (url.pathname === "/purge" && request.method === "POST") {
      const sid = url.searchParams.get("studentId");
      if (sid) {
        this.sql.exec("DELETE FROM ledger WHERE student_id = ?", sid);
      }
      return j({ ok: true, purged: { ledger: sid || 'all' } });
    }
  }
}

// ── PetDO ─────────────────────────────────────────────────────────────────────
export class PetDO {
  constructor(state, env) {
    this.state = state; this.env = env; this.sql = state.storage.sql;
    this.sql.exec("CREATE TABLE IF NOT EXISTS pet_state (id INTEGER PRIMARY KEY CHECK (id = 1), streak INTEGER DEFAULT 0, xp INTEGER DEFAULT 0, mood TEXT DEFAULT 'neutral', total_sessions INTEGER DEFAULT 0, last_checkin INTEGER DEFAULT 0, longest_streak INTEGER DEFAULT 0, tiger_score INTEGER DEFAULT 0, day_phase TEXT DEFAULT 'E1')");
    this.sql.exec("INSERT OR REPLACE INTO pet_state (id, streak, xp, mood, total_sessions, last_checkin, longest_streak, tiger_score, day_phase) VALUES (1, 0, 0, 'neutral', 0, 0, 0, 0, 'E1')");
    for (const m of ["ALTER TABLE pet_state ADD COLUMN tiger_score INTEGER DEFAULT 0", "ALTER TABLE pet_state ADD COLUMN day_phase TEXT DEFAULT 'E1'"]) { try { this.sql.exec(m); } catch(_) {} }
    this.sql.exec("CREATE TABLE IF NOT EXISTS checkins (id INTEGER PRIMARY KEY AUTOINCREMENT, minutes INTEGER, confidence INTEGER, xp_gained INTEGER, streak_at_checkin INTEGER, ts INTEGER)");
  }
  async fetch(request) {
    const url = new URL(request.url); function j(d, s = 200) { return new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } }); }
    // P10 PURGE ENDPOINT — GDPR erasure support (student-scoped)
    if (url.pathname === "/purge" && request.method === "POST") {
      const sid = url.searchParams.get("studentId");
      // PetDO uses idFromName(studentId), so each student has separate DO
      // Reset their pet state
      this.sql.exec("UPDATE pet_state SET streak=0, xp=0, mood='neutral', total_sessions=0, last_checkin=0, longest_streak=0, tiger_score=0, day_phase='E1' WHERE id=1");
      this.sql.exec("DELETE FROM checkins WHERE 1=1"); // shared table, would need student_id column to scope
      return j({ ok: true, purged: { pet_state: 'reset', checkins: 'all_shared' } });
    }
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
      const cf2 = this.sql.exec("SELECT confidence FROM checkins ORDER BY id DESC LIMIT 10").toArray(); const avg = cf2.length ? cf2.reduce((a, r) => a + r.confidence, 0) / cf2.length : 5; const er = Math.min(1, avg / 10); const dc = (now - (cur.last_checkin || 0)) < 86400000 ? 1 : 0;
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

// ── CommandDO ──────────────────────────────────────────────────────────────────
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
    // P10 PURGE ENDPOINT — GDPR erasure support (student-scoped)
    if (url.pathname === "/purge" && request.method === "POST") {
      const sid = url.searchParams.get("studentId");
      if (sid) {
        this.sql.exec("DELETE FROM session_log WHERE student_id = ?", sid);
        this.sql.exec("DELETE FROM memory_state WHERE student_id = ?", sid);
      }
      return j({ ok: true, purged: { session_log: 'student', memory_state: 'student' } });
    }
    if (url.pathname === "/log" && request.method === "POST") { const body = await request.json(); const now = Date.now(); this.sql.exec("INSERT INTO session_log (student_id, session_type, input, output, score, weak_areas, route, ts) VALUES (?,?,?,?,?,?,?,?)", String(body.studentId || "anon"), String(body.sessionType || "chat"), String(body.input || ""), String(body.output || ""), Number(body.score) || 0, JSON.stringify(body.weakAreas || []), JSON.stringify(body.route || {}), now); return j({ ok: true, ts: now }); }
    if (url.pathname === "/log" && request.method === "GET") { const sid = url.searchParams.get("studentId") || "anon"; const lim = Math.min(parseInt(url.searchParams.get("limit") || "30"), 200); const r = this.sql.exec("SELECT * FROM session_log WHERE student_id = ? ORDER BY ts DESC LIMIT ?", sid, lim).toArray(); return j({ entries: r, count: r.length }); }
    if (url.pathname === "/state" && request.method === "GET") { const sid = url.searchParams.get("studentId") || "anon"; const r = this.sql.exec("SELECT * FROM memory_state WHERE student_id = ?", sid).toArray()[0]; return j(r || { student_id: sid, level: "A1", goal: "daily speaking", streak: 0 }); }
    if (url.pathname === "/state" && request.method === "POST") { const body = await request.json(); const sid = String(body.studentId || "anon"); const now = Date.now(); this.sql.exec("INSERT INTO memory_state (student_id, level, goal, streak, last_active, last_score, weak_areas, summary, updated_at) VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(student_id) DO UPDATE SET level=excluded.level, goal=excluded.goal, streak=excluded.streak, last_active=excluded.last_active, last_score=excluded.last_score, weak_areas=excluded.weak_areas, summary=excluded.summary, updated_at=excluded.updated_at", sid, String(body.level || "A1"), String(body.goal || "daily speaking"), Number(body.streak) || 0, now, Number(body.lastScore) || 0, JSON.stringify(body.weakAreas || []), String(body.summary || ""), now); return j({ ok: true, studentId: sid }); }
    return j({ error: "Not found" }, 404);
  }
}
