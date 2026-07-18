const fs = require('fs');
const sessionFile = 'C:\\Users\\mrmic\\AppData\\Roaming\\Code\\User\\workspaceStorage\\858b03f19a6a9f144ca60d53af71eec3\\chatSessions\\e1ef485d-04e5-4b3e-9b06-a258b0277bc8.jsonl';
const raw = fs.readFileSync(sessionFile, 'utf8');
const lines = raw.split('\n').filter(Boolean);
console.log('Total lines:', lines.length);
for (let i = 0; i < Math.min(lines.length, 20); i++) {
  try {
    const obj = JSON.parse(lines[i]);
    console.log(`Line ${i}: kind=${obj.kind}, keys=${Object.keys(obj).join(',')}`);
    if (obj.kind === 2 && Array.isArray(obj.v) && obj.v[0]) {
      const first = obj.v[0];
      console.log(`  first item keys: ${Object.keys(first).join(',')}`);
      if (first.k) console.log(`  first item k: ${JSON.stringify(first.k).slice(0, 200)}`);
    }
  } catch (e) {
    console.log(`Line ${i}: PARSE ERROR: ${e.message}`);
  }
}
