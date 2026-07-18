const fs = require('fs');
const path = require('path');
const https = require('https');

const repoRoot = 'D:\\OB-1-CANONICAL';
const outDir = path.join(repoRoot, 'OPERATIONS');
const historyPath = path.join(process.env.USERPROFILE, '.claude', 'history.jsonl');

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    }).on('error', reject);
  });
}

async function main() {
  if (!fs.existsSync(historyPath)) {
    console.log('NO_ACTIVE_SESSION — cannot capture SOUL');
    process.exit(1);
  }

  const historyLines = fs.readFileSync(historyPath, 'utf8').split(/\r?\n/).filter(Boolean);
  const lastLine = historyLines[historyLines.length - 1];
  let activeUUID = null;
  const m = lastLine.match(/"sessionId"\s*:\s*"([^"]+)"/);
  if (m) activeUUID = m[1];

  if (!activeUUID) {
    console.log('NO_ACTIVE_SESSION — cannot capture SOUL');
    process.exit(1);
  }

  const jsonlPath = path.join(process.env.USERPROFILE, '.claude', 'projects', 'd--OB-1-CANONICAL', activeUUID + '.jsonl');
  if (!fs.existsSync(jsonlPath)) {
    console.log('JSONL_NOT_FOUND: ' + jsonlPath);
    process.exit(1);
  }

  const prompts = [];
  let seq = 0;
  const lines = fs.readFileSync(jsonlPath, 'utf8').split(/\r?\n/).filter(Boolean);
  for (const line of lines) {
    let obj;
    try { obj = JSON.parse(line); } catch { continue; }
    if (obj && obj.role === 'user' && obj.text) {
      seq++;
      prompts.push({
        order: seq,
        ts: obj.ts,
        chars: obj.text.length,
        excerpt: obj.text.slice(0, 120)
      });
    }
  }

  const totalChars = prompts.reduce((s, p) => s + p.chars, 0);
  let soulCount = 0;
  try {
    const raw = await httpsGet('https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count');
    const parsed = JSON.parse(raw);
    soulCount = Number(parsed.soulcount || 0);
  } catch (e) {
    console.log('SOUL_API_UNREACHABLE: ' + e.message);
  }

  const ts = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
  const summaryPath = path.join(outDir, 'soul-capture-' + ts + '-summary.jsonl');
  const receiptsPath = path.join(outDir, 'soul-capture-' + ts + '-receipts.json');

  const summary = {
    ts: new Date().toISOString(),
    event: 'soul_capture',
    session_id: activeUUID,
    jsonl_path: jsonlPath,
    prompt_count: prompts.length,
    total_chars: totalChars,
    soulcount_live: soulCount,
    status: 'CAPTURED'
  };

  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + '\n', 'utf8');
  fs.writeFileSync(receiptsPath, JSON.stringify(prompts, null, 2), 'utf8');

  console.log('SOUL CAPTURED');
  console.log('Session: ' + activeUUID);
  console.log('Prompts: ' + prompts.length);
  console.log('Chars: ' + totalChars);
  console.log('SOULcount: ' + soulCount);
  console.log('Summary: ' + summaryPath);
  console.log('Receipts: ' + receiptsPath);
}

main();
