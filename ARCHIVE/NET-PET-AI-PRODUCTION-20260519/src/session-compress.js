// Session compression helpers for SessionDO.

function extractTopicMarkers(text) {
  const markers = [];
  const rules = [
    { r: /\b(food|eat|restaurant|cook|meal)\b/i, t: "food" },
    { r: /\b(work|job|office|meeting|boss)\b/i, t: "work" },
    { r: /\b(school|class|study|teacher|exam)\b/i, t: "education" },
    { r: /\b(family|mother|father|child|parent)\b/i, t: "family" },
    { r: /\b(travel|trip|hotel|plane|city|country)\b/i, t: "travel" },
  ];
  for (const x of rules) if (x.r.test(text)) markers.push(x.t);
  return markers;
}

export function compressMemoryTable(sql, keepCount = 30) {
  const total = sql.exec("SELECT COUNT(*) as cnt FROM memory").toArray()[0]?.cnt || 0;
  if (total <= keepCount) return { compressed: 0, kept: total, summary: null };

  const cutoffRow = sql.exec("SELECT id FROM memory ORDER BY id DESC LIMIT 1 OFFSET ?", keepCount).toArray()[0];
  if (!cutoffRow?.id) return { compressed: 0, kept: total, summary: null };

  const oldRows = sql.exec("SELECT student_id, user_msg, obi_msg, ts FROM memory WHERE id <= ? ORDER BY id ASC", cutoffRow.id).toArray();
  if (oldRows.length === 0) return { compressed: 0, kept: total, summary: null };

  const byStudent = {};
  for (const row of oldRows) {
    const sid = row.student_id || "unknown";
    if (!byStudent[sid]) byStudent[sid] = { exchanges: 0, topics: new Set(), firstTs: row.ts, lastTs: row.ts };
    const x = byStudent[sid];
    x.exchanges += 1;
    x.firstTs = Math.min(x.firstTs, row.ts || x.firstTs);
    x.lastTs = Math.max(x.lastTs, row.ts || x.lastTs);

    const text = `${row.user_msg || ""} ${row.obi_msg || ""}`;
    for (const m of extractTopicMarkers(text)) x.topics.add(m);
  }

  const summary = Object.entries(byStudent)
    .map(([sid, v]) => {
      const topics = Array.from(v.topics).join(", ") || "general";
      return `[${sid}] ${v.exchanges} exchanges | topics: ${topics}`;
    })
    .join("\n");

  sql.exec(`CREATE TABLE IF NOT EXISTS compressed_memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    summary TEXT NOT NULL,
    row_count INTEGER NOT NULL,
    oldest_ts INTEGER NOT NULL,
    newest_ts INTEGER NOT NULL,
    compressed_at INTEGER NOT NULL
  )`);

  const oldestTs = oldRows[0].ts || 0;
  const newestTs = oldRows[oldRows.length - 1].ts || 0;
  sql.exec(
    "INSERT INTO compressed_memory (summary, row_count, oldest_ts, newest_ts, compressed_at) VALUES (?, ?, ?, ?, ?)",
    summary,
    oldRows.length,
    oldestTs,
    newestTs,
    Date.now()
  );

  sql.exec("DELETE FROM memory WHERE id <= ?", cutoffRow.id);

  return { compressed: oldRows.length, kept: total - oldRows.length, summary };
}

export function compressSessionEvents(sql, keepCount = 100) {
  const total = sql.exec("SELECT COUNT(*) as cnt FROM session_events").toArray()[0]?.cnt || 0;
  if (total <= keepCount) return { compressed: 0, kept: total };

  const cutoffRow = sql.exec("SELECT id FROM session_events ORDER BY id DESC LIMIT 1 OFFSET ?", keepCount).toArray()[0];
  if (!cutoffRow?.id) return { compressed: 0, kept: total };

  const byType = sql.exec(
    "SELECT event_type, COUNT(*) as cnt FROM session_events WHERE id <= ? GROUP BY event_type",
    cutoffRow.id
  ).toArray();

  const rowCount = byType.reduce((sum, r) => sum + (r.cnt || 0), 0);
  const summary = byType.map(r => `${r.event_type}:${r.cnt}`).join(", ");

  sql.exec(`CREATE TABLE IF NOT EXISTS compressed_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_summary TEXT NOT NULL,
    row_count INTEGER NOT NULL,
    compressed_at INTEGER NOT NULL
  )`);

  sql.exec(
    "INSERT INTO compressed_events (event_summary, row_count, compressed_at) VALUES (?, ?, ?)",
    summary,
    rowCount,
    Date.now()
  );

  sql.exec("DELETE FROM session_events WHERE id <= ?", cutoffRow.id);

  return { compressed: rowCount, kept: total - rowCount };
}

export function runSessionCompression(sql, opts = {}) {
  const memoryKeep = opts.memoryKeep || 30;
  const eventsKeep = opts.eventsKeep || 100;

  return {
    memory: compressMemoryTable(sql, memoryKeep),
    events: compressSessionEvents(sql, eventsKeep),
  };
}
