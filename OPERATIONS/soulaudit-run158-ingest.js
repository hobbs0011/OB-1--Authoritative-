const https = require('https');
const fs = require('fs');
const lines = fs.readFileSync('D:\\OB-1-CANONICAL\\OPERATIONS\\session-run158-prompts.jsonl', 'utf8')
  .split('\n').filter(l => l.trim());

const sessionId = 'sov100-roman-run158';
const studentId = 'sov100-michael';
let totalBytes = 0;

async function main() {
  const beforeCount = await new Promise((resolve) => {
    https.get('https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count', (res) => {
      let d = '';
      res.on('data', (c) => { d += c; });
      res.on('end', () => { try { const r = JSON.parse(d); resolve(r.soulcount); } catch(e) { resolve('ERROR'); } });
    }).on('error', () => resolve('ERROR'));
  });

  console.log('=== SOULCOUNT BEFORE ===');
  console.log('Before:', beforeCount);
  console.log('=== POSTING PROMPTS ===');

  const results = [];
  const parseResponse = (data) => {
    try {
      const parsed = JSON.parse(data);
      const bytes = parsed.byte_count || parsed.bytes || 0;
      return { bytes, raw: parsed };
    } catch (e) {
      return { bytes: 0, error: data };
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const obj = JSON.parse(lines[i]);
    const body = JSON.stringify({
      student_id: studentId,
      session_id: sessionId,
      role: 'user',
      text: obj.prompt
    });

    const result = await new Promise((resolve) => {
      const req = https.request({
        hostname: 'soul-logger.mrmichaelhobbs123.workers.dev',
        path: '/api/soul/event',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          const parsed = parseResponse(data);
          totalBytes += parsed.bytes;
          console.log(`[${i+1}] ${res.statusCode} | ${parsed.bytes} chars | ${obj.prompt.substring(0, 40).replace(/\n/g, ' ')}...`);
          resolve({ status: res.statusCode, bytes: parsed.bytes, raw: parsed.raw, text: obj.prompt.substring(0, 80) });
        });
      });

      req.on('error', (err) => {
        console.log(`[${i+1}] ERROR: ${err.message}`);
        resolve({ error: err.message });
      });

      req.write(body);
      req.end();
    });

    results.push(result);
    if (i < lines.length - 1) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  const afterCount = await new Promise((resolve) => {
    https.get('https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count', (res) => {
      let d = '';
      res.on('data', (c) => { d += c; });
      res.on('end', () => { try { const r = JSON.parse(d); resolve(r.soulcount); } catch(e) { resolve('ERROR'); } });
    }).on('error', () => resolve('ERROR'));
  });

  console.log('=== FINAL RECEIPTS ===');
  console.log('Session:', sessionId);
  console.log('Prompts ingested:', lines.length);
  console.log('Total bytes reported by API:', totalBytes);
  console.log('Manual char count:', Buffer.byteLength(lines.map(l => JSON.parse(l).prompt).join(''), 'utf8'));
  console.log('SOULCOUNT before:', beforeCount);
  console.log('SOULCOUNT after:', afterCount);
  console.log('Delta:', typeof afterCount === 'number' && typeof beforeCount === 'number' ? afterCount - beforeCount : 'N/A');

  fs.writeFileSync('D:\\OB-1-CANONICAL\\OPERATIONS\\soulaudit-run158-receipts.json', JSON.stringify({
    session_id: sessionId,
    prompts_ingested: lines.length,
    total_bytes_api: totalBytes,
    total_bytes_manual: Buffer.byteLength(lines.map(l => JSON.parse(l).prompt).join(''), 'utf8'),
    soulcount_before: beforeCount,
    soulcount_after: afterCount,
    delta: typeof afterCount === 'number' && typeof beforeCount === 'number' ? afterCount - beforeCount : null,
    receipts: results
  }, null, 2));

  console.log('Receipts saved: OPERATIONS/soulaudit-run158-receipts.json');
}

main().catch(console.error);
