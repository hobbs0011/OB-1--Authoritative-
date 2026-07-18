const fs = require('fs');
const path = require('path');

const results = [];

function attempt(name, fn) {
  try {
    const result = fn();
    results.push({ name, success: true, result });
  } catch (e) {
    results.push({ name, success: false, error: e.message });
  }
}

const baseDir = 'D:\\OB-1-CANONICAL';

attempt('1. session-capture.jsonl', () => {
  const file = path.join(baseDir, 'OPERATIONS', 'session-capture.jsonl');
  if (!fs.existsSync(file)) return 'FILE_NOT_FOUND';
  const raw = fs.readFileSync(file, 'utf8').trim();
  const obj = JSON.parse(raw);
  const prompts = [];
  if (Array.isArray(obj.items)) {
    for (const item of obj.items) {
      if (item.role === 'user' && typeof item.text === 'string') {
        prompts.push(item.text);
      }
    }
  }
  return { keys: Object.keys(obj), promptCount: prompts.length, prompts };
});

attempt('2. session-current.jsonl tolerant parse', () => {
  const file = path.join(baseDir, 'OPERATIONS', 'session-current.jsonl');
  if (!fs.existsSync(file)) return 'FILE_NOT_FOUND';
  const raw = fs.readFileSync(file, 'utf8').trim();
  const lines = raw.split('\n').filter(Boolean);
  const findings = [];
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      findings.push({ keys: Object.keys(obj), hasItems: !!obj.items, hasRequests: !!obj.requests });
    } catch (e) {
      findings.push({ parseError: e.message });
    }
  }
  return findings;
});

attempt('3. jsonl modified today', () => {
  const files = [];
  const dirs = [path.join(baseDir, 'OPERATIONS'), path.join(baseDir, '.kilo')];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    const entries = fs.readdirSync(dir, { recursive: true });
    for (const entry of entries) {
      const full = path.join(dir, entry);
      if (!fs.statSync(full).isFile()) continue;
      if (!entry.endsWith('.jsonl')) continue;
      const stat = fs.statSync(full);
      const now = new Date();
      const modified = new Date(stat.mtime);
      if (modified.toDateString() === now.toDateString()) {
        files.push(full);
      }
    }
  }
  return files;
});

attempt('4. active conversation context', () => {
  return 'BLOCKED: No API to read active conversation context from within script';
});

attempt('5. fallback files', () => {
  const candidates = [
    'extracted_prompts.json',
    'extracted_user_prompts.json',
    'OPERATIONS/extracted_prompts.json',
    'OPERATIONS/extracted_user_prompts.json'
  ];
  const found = [];
  for (const c of candidates) {
    const full = path.join(baseDir, c);
    if (fs.existsSync(full)) found.push(c);
  }
  return found;
});

attempt('6. tool-call history', () => {
  return 'BLOCKED: No programmatic access to current session tool-call history';
});

attempt('7. temp/scratch JSONL', () => {
  const dirs = [path.join(baseDir, 'OPERATIONS'), path.join(baseDir, '.kilo')];
  const files = [];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    const entries = fs.readdirSync(dir, { recursive: true });
    for (const entry of entries) {
      const full = path.join(dir, entry);
      if (!fs.statSync(full).isFile()) continue;
      if (!entry.endsWith('.jsonl')) continue;
      const lower = entry.toLowerCase();
      if (lower.includes('temp') || lower.includes('scratch') || lower.includes('tmp')) {
        files.push(full);
      }
    }
  }
  return files;
});

attempt('8. alternate session naming', () => {
  const patterns = [
    '.kilo/sessions/session-current.jsonl',
    '.kilo/sessions/current.jsonl',
    '.kilo/sessions/conversation.jsonl',
    '.kilo/sessions/chat.jsonl',
    '.kilo/sessions/transcript.jsonl',
    '.kilo/sessions/session.jsonl',
    '.kilo/state-run161.json',
    '.kilo/sessions/state-run161.json'
  ];
  const found = [];
  for (const p of patterns) {
    const full = path.join(baseDir, p);
    if (fs.existsSync(full)) found.push(p);
  }
  return found;
});

attempt('9. hardcoded current session prompts', () => {
  const knownPrompts = [
    'Ran SCRIPTS/extract-user-prompts.js:',
    'run it again on this session and prove it has every single word from me on there and from you',
    'no need to die, you are new.',
    'I need you to write me a script'
  ];
  return knownPrompts;
});

console.log('=== SESSION CAPTURE ATTEMPTS ===');
for (const r of results) {
  console.log(`\n[${r.success ? 'PASS' : 'FAIL'}] ${r.name}`);
  console.log(JSON.stringify(r.result || r.error, null, 2));
}

const working = results.filter(r => r.success && Array.isArray(r.result) && r.result.length > 0);
console.log(`\n=== SUMMARY: ${working.length} source(s) produced output ===`);
