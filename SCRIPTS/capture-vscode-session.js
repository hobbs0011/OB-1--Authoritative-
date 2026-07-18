const fs = require('fs');
const path = require('path');

const sessionFile = process.argv[2] || 'C:\\Users\\mrmic\\AppData\\Roaming\\Code\\User\\workspaceStorage\\858b03f19a6a9f144ca60d53af71eec3\\chatSessions\\e1ef485d-04e5-4b3e-9b06-a258b0277bc8.jsonl';
const outputFile = process.argv[3] || 'OPERATIONS/soul-user-prompts.jsonl';

const raw = fs.readFileSync(sessionFile, 'utf8');
const lines = raw.split('\n').filter(Boolean);
const prompts = [];

for (const line of lines) {
  try {
    const obj = JSON.parse(line);
    
    if (obj.kind === 0 && obj.v && obj.v.inputText) {
      const text = obj.v.inputText.trim();
      if (text && !text.startsWith('<') && text.length > 2) {
        prompts.push({ role: 'user', text, source: 'inputText' });
      }
    }
    
    if (obj.kind === 2 && Array.isArray(obj.v)) {
      for (const req of obj.v) {
        if (req.k && Array.isArray(req.k) && req.k[0] === 'requests' && req.v) {
          const request = Array.isArray(req.v) ? req.v[0] : req.v;
          if (request && request.request && request.request.message) {
            const msg = request.request.message;
            const text = (msg.text || '').trim();
            if (text && text.length > 2) {
              prompts.push({ role: 'user', text, source: 'requests.message' });
            }
          }
          if (request && request.response) {
            const resp = Array.isArray(request.response) ? request.response[0] : request.response;
            if (resp && resp.value && typeof resp.value === 'string') {
              const text = resp.value.trim();
              if (text && text.length > 2) {
                prompts.push({ role: 'assistant', text, source: 'response.value' });
              }
            }
          }
        }
      }
    }
  } catch (e) {
    continue;
  }
}

if (prompts.length === 0) {
  console.log('PROMPTS 0');
  process.exit(1);
}

const out = prompts.map(p => JSON.stringify(p)).join('\n') + '\n';
fs.writeFileSync(outputFile, out);
console.log(`PROMPTS ${prompts.length}`);
console.log(`Wrote ${prompts.length} messages to ${outputFile}`);
