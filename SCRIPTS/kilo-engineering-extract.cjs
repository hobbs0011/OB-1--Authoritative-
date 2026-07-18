const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const db = new DatabaseSync('C:\\Users\\mrmic\\.local\\share\\kilo\\kilo.db');
const repo = 'D:\\OB-1-CANONICAL';

const sessions = [
  'ses_1161a41d0ffepxyVzjs98ME1fJ',
  'ses_0899b2c82ffe2PtNt3XBMEVv5V'
];

const outDir = path.join(repo, 'CANON', 'ENGINEERING');
const soulDir = path.join(repo, 'CANON', 'SOUL', 'EXTRACT');
const pheromoneDir = path.join(repo, 'CANON', 'PHEROMONES');
const opsDir = path.join(repo, 'OPERATIONS');

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(soulDir, { recursive: true });
fs.mkdirSync(pheromoneDir, { recursive: true });
fs.mkdirSync(opsDir, { recursive: true });

function getMessages(sessionId) {
  const rows = db.prepare(`
    SELECT m.id, m.time_created, m.data as msg_data
    FROM message m
    WHERE m.session_id = ?
    ORDER BY m.time_created ASC
  `).all(sessionId);

  const messages = [];
  for (const r of rows) {
    let parsed = null;
    try { parsed = JSON.parse(r.msg_data); } catch {}
    messages.push({
      id: r.id,
      time_created: r.time_created,
      role: parsed && parsed.role ? parsed.role : 'unknown',
      data: r.msg_data
    });
  }
  return messages;
}

function getParts(sessionId) {
  const rows = db.prepare(`
    SELECT p.id, p.message_id, p.session_id, p.time_created, p.time_updated, p.data
    FROM part p
    WHERE p.session_id = ?
    ORDER BY p.time_created ASC
  `).all(sessionId);

  const results = [];
  for (const r of rows) {
    let parsed = null;
    let type = 'unknown';
    if (r.data) {
      try { parsed = JSON.parse(r.data); } catch {}
    }
    if (parsed && typeof parsed === 'object') {
      type = parsed.type || 'unknown';
    }
    results.push({
      id: r.id,
      message_id: r.message_id,
      session_id: r.session_id,
      time_created: r.time_created,
      time_updated: r.time_updated,
      type,
      data: r.data,
      text: parsed && typeof parsed.text === 'string' ? parsed.text : null
    });
  }
  return results;
}

const engineering = {
  run: 182,
  executed_at: new Date().toISOString(),
  head_sha: '',
  sessions: {},
  summary: {}
};

let totalParts = 0;
let totalThinking = 0;
let totalToolResult = 0;
let totalReasoning = 0;
let totalTools = 0;
let totalStepStarts = 0;
let totalStepFinishes = 0;
const soulscriptLines = [];
const allReasoning = [];

for (const sid of sessions) {
  const messages = getMessages(sid);
  const parts = getParts(sid);
  totalParts += parts.length;

  const partsByMsg = {};
  for (const p of parts) {
    if (!partsByMsg[p.message_id]) partsByMsg[p.message_id] = [];
    partsByMsg[p.message_id].push(p);
  }

  const thinking = parts.filter(p => p.type === 'thinking');
  const toolResults = parts.filter(p => p.type === 'tool_result');
  const reasoning = parts.filter(p => p.type === 'reasoning');
  const texts = parts.filter(p => p.type === 'text');
  const tools = parts.filter(p => p.type === 'tool');
  const stepStarts = parts.filter(p => p.type === 'step-start');
  const stepFinishes = parts.filter(p => p.type === 'step-finish');
  totalThinking += thinking.length;
  totalToolResult += toolResults.length;
  totalReasoning += reasoning.length;
  totalTools += tools.length;
  totalStepStarts += stepStarts.length;
  totalStepFinishes += stepFinishes.length;

  engineering.sessions[sid] = {
      message_count: messages.length,
      part_count: parts.length,
      thinking_count: thinking.length,
      tool_result_count: toolResults.length,
      reasoning_count: reasoning.length,
      text_count: texts.length,
      tool_count: tools.length,
      step_start_count: stepStarts.length,
      step_finish_count: stepFinishes.length,
    parts: parts.map(p => ({
      id: p.id,
      message_id: p.message_id,
      type: p.type,
      time_created: p.time_created,
      text_preview: p.text ? p.text.slice(0, 200) : null,
      data_preview: p.data ? p.data.slice(0, 200) : null
    }))
  };

  const reasoningPath = path.join(soulDir, `reasoning-run182-session-${sid.slice(0, 8)}.jsonl`);
  const reasoningLines = [];
  for (const p of parts) {
    if (p.type !== 'thinking' && p.type !== 'tool_result' && p.type !== 'reasoning' && p.type !== 'tool' && p.type !== 'step-start' && p.type !== 'step-finish') continue;
    const entry = {
      session_id: sid,
      part_id: p.id,
      message_id: p.message_id,
      type: p.type,
      time_created: p.time_created,
      text: p.text,
      data_preview: p.data ? p.data.slice(0, 500) : null
    };
    reasoningLines.push(JSON.stringify(entry));
    allReasoning.push(entry);
  }
  fs.writeFileSync(reasoningPath, reasoningLines.join('\n') + '\n', 'utf8');
  console.log('REASONING WRITTEN: ' + reasoningPath + ' (' + reasoningLines.length + ' entries)');

  for (const m of messages) {
    if (m.role !== 'user') continue;
    const msgParts = partsByMsg[m.id] || [];
    const textParts = msgParts.filter(p => p.type === 'text' && p.text && p.text.trim());
    if (textParts.length === 0) continue;
    const fullText = textParts.map(p => p.text.trim()).join('\n\n');
    soulscriptLines.push(JSON.stringify({
      session_id: sid,
      message_id: m.id,
      timestamp: m.time_created,
      role: m.role,
      text: fullText,
      char_count: Buffer.byteLength(fullText, 'utf8'),
      sha256: crypto.createHash('sha256').update(fullText).digest('hex')
    }));
  }
}

engineering.summary = {
  total_sessions: sessions.length,
  total_parts: totalParts,
  total_thinking: totalThinking,
  total_tool_result: totalToolResult,
  total_reasoning: totalReasoning,
  total_tool: totalTools,
  total_step_start: totalStepStarts,
  total_step_finish: totalStepFinishes,
  inner_thoughts_extracted: totalThinking + totalToolResult + totalReasoning + totalTools + totalStepStarts + totalStepFinishes,
  soulscript_entries: soulscriptLines.length
};

const engPath = path.join(outDir, 'engineering-run182.json');
fs.writeFileSync(engPath, JSON.stringify(engineering, null, 2), 'utf8');
console.log('ENGINEERING WRITTEN: ' + engPath);

const phetrail = {
  run: 183,
  status: 'ENGINEERING_COMPLETE',
  executed_at: new Date().toISOString(),
  target_run: 182,
  sessions: sessions,
  summary: engineering.summary,
  outputs: {
    engineering: engPath,
    reasoning: Object.keys(engineering.sessions).map(sid => path.join(soulDir, `reasoning-run182-session-${sid.slice(0, 8)}.jsonl`))
  }
};

const phetrailPath = path.join(pheromoneDir, 'PheTrail-run183-engineering.json');
fs.writeFileSync(phetrailPath, JSON.stringify(phetrail, null, 2), 'utf8');
console.log('PHEROMONE WRITTEN: ' + phetrailPath);

const soulscriptPath = path.join(opsDir, 'soulscript-run182.jsonl');
fs.writeFileSync(soulscriptPath, soulscriptLines.join('\n') + '\n', 'utf8');
console.log('SOULSCRIPT WRITTEN: ' + soulscriptPath + ' (' + soulscriptLines.length + ' entries)');

console.log('ENGINEERING COMPLETE');
console.log(JSON.stringify(engineering.summary, null, 2));

db.close();
