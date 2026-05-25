// PCC â Phoenix-Command-Consul
// OB-1 Empire Dashboard â Cloudflare Worker
// Operator: mrmichaelhobbs123@gmail.com

const SOUL_COLOR = '#a855f7';
const DNA_COLOR = '#f59e0b';
const PHOENIX_STATUS_URL = 'https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/status';
const NETPET_STATUS_URL = 'https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/status';

function getTierLabel(count) {
  if (count >= 250000) return 'TITANIUM_ANCHOR';
  if (count >= 100000) return 'ANCHOR';
  if (count >= 25000) return 'LOCK';
  if (count >= 5000) return 'ALARM';
  return 'NOMINAL';
}

async function querySoulContext(db) {
  try {
    const result = await db.prepare(
      "SELECT session_id, position, text, byte_count FROM soul_prompts WHERE session_id LIKE 'sov100%' ORDER BY rowid ASC"
    ).all();
    return result?.results ?? [];
  } catch (e) {
    return [];
  }
}

async function querySoulCount(db) {
  try {
    const result = await db.prepare(
      "SELECT SUM(byte_count) as total FROM soul_prompts WHERE session_id LIKE 'sov100%'"
    ).first();
    return result?.total ?? 0;
  } catch (e) {
    return 0;
  }
}

async function queryRecentSoulPrompts(db) {
  try {
    const result = await db.prepare(
      'SELECT session_id, byte_count, estimated_timestamp FROM soul_prompts ORDER BY rowid DESC LIMIT 5'
    ).all();
    return result?.results ?? [];
  } catch (e) {
    return [];
  }
}

async function queryPhoenixCoderLog(db) {
  try {
    const result = await db.prepare(
      'SELECT id, tasktype, taskinput, result, createdat FROM phoenix_architecti_log ORDER BY createdat DESC LIMIT 5'
    ).all();
    return result?.results ?? [];
  } catch (e) {
    return [];
  }
}

async function queryMissionLogs(db) {
  try {
    const result = await db.prepare(
      'SELECT id, mission_name, start_time, end_time, status FROM mission_logs ORDER BY start_time DESC LIMIT 5'
    ).all();
    return result?.results ?? [];
  } catch (e) {
    return [];
  }
}

async function fetchPhoenixStatus() {
  try {
    const resp = await fetch(PHOENIX_STATUS_URL, { signal: AbortSignal.timeout(5000) });
    if (!resp.ok) return { error: `HTTP ${resp.status}` };
    return await resp.json();
  } catch (e) {
    return { error: e.message };
  }
}

async function fetchStudentPortals() {
  const students = [
    { name: 'Huong', path: 'huong-profile.html' },
    { name: 'Mai Tram', path: 'mai-tram-profile.html' },
    { name: 'Quy', path: 'quy-profile.html' },
    { name: 'Minh', path: 'minh-parent-portal.html' },
    { name: 'Quan', path: 'quan-profile.html' },
    { name: 'Quang', path: 'quang-profile.html' },
    { name: 'Lam', path: 'lam-profile.html' },
  ];
  const base = 'https://net-pet-ai.mrmichaelhobbs123.workers.dev/';
  return Promise.all(students.map(async s => {
    try {
      const r = await fetch(base + s.path, { signal: AbortSignal.timeout(4000) });
      return { name: s.name, ok: r.ok, status: r.status };
    } catch (e) {
      return { name: s.name, ok: false, status: 0 };
    }
  }));
}

function renderStudentHealth(portals) {
  return portals.map(p => `
    <tr>
      <td style="color:#e0e0e0">${p.name}</td>
      <td style="color:${p.ok ? '#22c55e' : '#ef4444'};font-weight:bold">${p.ok ? 'LIVE' : 'FAIL'}</td>
      <td style="color:#555;font-size:11px">${p.status}</td>
    </tr>`).join('');
}

async function fetchNetPetStatus() {
  try {
    const resp = await fetch(NETPET_STATUS_URL, { signal: AbortSignal.timeout(5000) });
    if (!resp.ok) return { status: 'DOWN', error: `HTTP ${resp.status}` };
    return await resp.json();
  } catch (e) {
    return { status: 'DOWN', error: e.message };
  }
}

function renderSoulPromptRows(rows) {
  if (!rows.length) return '<tr><td colspan="3" style="color:#555;text-align:center">no rows</td></tr>';
  return rows.map(r => `
    <tr>
      <td style="color:#888;font-size:12px">${r.session_id ?? ''}</td>
      <td style="color:${SOUL_COLOR};text-align:right">${(r.byte_count ?? 0).toLocaleString()}</td>
      <td style="color:#555;font-size:11px">${r.estimated_timestamp ?? ''}</td>
    </tr>`).join('');
}

function renderPCLogRows(rows) {
  if (!rows.length) return '<tr><td colspan="3" style="color:#555;text-align:center">no rows / table absent</td></tr>';
  return rows.map(r => {
    const task = (r.taskinput ?? '').slice(0, 60) + ((r.taskinput ?? '').length > 60 ? 'â¦' : '');
    const res = (r.result ?? '').slice(0, 40) + ((r.result ?? '').length > 40 ? 'â¦' : '');
    return `
    <tr>
      <td style="color:#888;font-size:11px">${r.id ?? ''}</td>
      <td style="color:${DNA_COLOR};font-size:11px">${task}</td>
      <td style="color:#555;font-size:11px">${res}</td>
    </tr>`;
  }).join('');
}

function renderMissionLogRows(rows) {
  if (!rows.length) return '<tr><td colspan="4" style="color:#555;text-align:center">no missions</td></tr>';
  return rows.map(r => `
    <tr>
      <td style="color:#888;font-size:11px">${r.id ?? ''}</td>
      <td style="color:${DNA_COLOR};font-size:11px">${r.mission_name ?? ''}</td>
      <td style="color:#555;font-size:11px">${r.start_time ?? ''}</td>
      <td style="color:${r.end_time ?? '' === 'null' ? '#ef4444' : '#22c55e'};font-size:11px">${r.end_time ?? '' === 'null' ? 'RUNNING' : r.end_time}</td>
    </tr>`).join('');
}

function renderPhoenixStatus(status) {
  if (status.error) {
    return `<span style="color:#ef4444">ERROR: ${status.error}</span>`;
  }
  const alive = status.alive === true || status.status === 'LIVE' || status.status === 'ok' || status.alive === 'true';
  const color = alive ? '#22c55e' : '#ef4444';
  const label = alive ? 'ALIVE' : 'DOWN';
  return `<span style="color:${color};font-weight:bold">${label}</span>
    <span style="color:#555;font-size:11px;margin-left:12px">${JSON.stringify(status).slice(0, 120)}</span>`;
}

function buildHTML(soulcount, tierLabel, soulRows, pcRows, missionRows, phoenixStatus, netpetStatus, studentPortals, ts) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>PCC â Phoenix-Command-Consul</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0f0f0f; color: #e0e0e0; font-family: 'Courier New', Courier, monospace; padding: 24px; }
  h1 { color: ${SOUL_COLOR}; font-size: 22px; letter-spacing: 3px; margin-bottom: 4px; }
  .subtitle { color: #555; font-size: 12px; margin-bottom: 24px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 720px) { .grid { grid-template-columns: 1fr; } }
  .card { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 16px; }
  .card-wide { grid-column: 1 / -1; }
  .card h2 { font-size: 13px; letter-spacing: 2px; color: #555; margin-bottom: 12px; text-transform: uppercase; }
  .soulcount-val { font-size: 42px; font-weight: bold; color: ${SOUL_COLOR}; line-height: 1; }
  .tier-label { font-size: 16px; color: ${SOUL_COLOR}; opacity: 0.7; margin-top: 6px; letter-spacing: 2px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { text-align: left; color: #444; padding: 4px 8px 8px 0; font-weight: normal; letter-spacing: 1px; font-size: 11px; }
  td { padding: 5px 8px 5px 0; border-bottom: 1px solid #222; vertical-align: top; word-break: break-all; }
  tr:last-child td { border-bottom: none; }
  .phoenix-card { }
  .refresh-note { color: #333; font-size: 11px; margin-top: 20px; text-align: right; }
  .ts { color: #444; font-size: 11px; }
</style>
</head>
<body>
<h1>&#9889; PCC</h1>
<div class="subtitle">Phoenix-Command-Consul &mdash; OB-1 Empire Dashboard &mdash; auto-refresh 30s</div>

<div class="grid">

  <!-- SOULCOUNT -->
  <div class="card">
    <h2>&#9679; SOULCOUNT</h2>
    <div class="soulcount-val">${soulcount.toLocaleString()}</div>
    <div class="tier-label">${tierLabel}</div>
    <div class="ts" style="margin-top:10px">session_id LIKE sov100%</div>
  </div>

  <!-- PHOENIX-ARCHITECTI STATUS -->
  <div class="card phoenix-card">
    <h2>&#9650; Phoenix-Architecti</h2>
    <div style="margin-top:8px">${renderPhoenixStatus(phoenixStatus)}</div>
  </div>

  <!-- NET-PET-AI STATUS -->
  <div class="card">
    <h2>&#9650; NET-PET-AI</h2>
    <div style="margin-top:8px">${renderPhoenixStatus(netpetStatus)}</div>
  </div>

  <!-- STUDENT PORTALS -->
  <div class="card">
    <h2>&#9650; Student Portals</h2>
    <table>
      <thead><tr><th>Student</th><th>Status</th><th>HTTP</th></tr></thead>
      <tbody>${renderStudentHealth(studentPortals)}</tbody>
    </table>
  </div>

  <!-- MISSION LOGS -->
  <div class="card card-wide">
    <h2>&#9670; Mission Logs â last 5</h2>
    <table>
      <thead><tr>
        <th>ID</th>
        <th>Mission Name</th>
        <th>Start Time</th>
        <th>Status</th>
      </tr></thead>
      <tbody>${renderMissionLogRows(missionRows)}</tbody>
    </table>
  </div>

  <!-- SOUL PROMPTS -->
  <div class="card card-wide">
    <h2>&#9670; soul_prompts â last 5</h2>
    <table>
      <thead><tr>
        <th>session_id</th>
        <th style="text-align:right">byte_count</th>
        <th>created_at</th>
      </tr></thead>
      <tbody>${renderSoulPromptRows(soulRows)}</tbody>
    </table>
  </div>

  <!-- PHOENIX CODER LOG -->
  <div class="card card-wide">
    <h2>&#9670; phoenix_architecti_log â last 5</h2>
    <table>
      <thead><tr>
        <th>id</th>
        <th>task</th>
        <th>result</th>
      </tr></thead>
      <tbody>${renderPCLogRows(pcRows)}</tbody>
    </table>
  </div>

</div>

<div class="refresh-note">Last fetched: <span class="ts">${ts}</span></div>

<script>
  setTimeout(() => location.reload(), 30000);
</script>
</body>
</html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const ts = new Date().toISOString();

    if (url.pathname === '/api/status') {
      const soulcount = await querySoulCount(env.DB);
      return Response.json({
        worker: 'pcc',
        soulcount,
        tier: getTierLabel(soulcount),
        alive: true,
        ts,
      });
    }

    if (url.pathname === '/api/context') {
      const rows = await querySoulContext(env.DB);
      const text = rows.map(r => `\n\n=== ${r.session_id} (pos ${r.position}, ${r.byte_count} bytes) ===\n${r.text}`).join('');
      return new Response(text, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    if (url.pathname === '/api/context.json') {
      const rows = await querySoulContext(env.DB);
      return Response.json({ sessions: rows.length, rows });
    }

    if (url.pathname === '/') {
      const [soulcount, soulRows, pcRows, missionRows, phoenixStatus, netpetStatus, studentPortals] = await Promise.all([
        querySoulCount(env.DB),
        queryRecentSoulPrompts(env.DB),
        queryPhoenixCoderLog(env.DB),
        queryMissionLogs(env.DB),
        fetchPhoenixStatus(),
        fetchNetPetStatus(),
        fetchStudentPortals(),
      ]);

      const tierLabel = getTierLabel(soulcount);
      const html = buildHTML(soulcount, tierLabel, soulRows, pcRows, missionRows, phoenixStatus, netpetStatus, studentPortals, ts);
      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
};