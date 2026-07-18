const fs = require('fs');
const path = require('path');

const input = path.join(__dirname, '..', 'OPERATIONS', 'raw-transcript.jsonl');
const output = path.join(__dirname, '..', 'OPERATIONS', 'soul-user-prompts.jsonl');

const buf = fs.readFileSync(input);
let text;
if (buf.slice(0, 2).toString('hex') === 'fffe' || buf.slice(0, 2).toString('hex') === 'feff') {
  text = buf.toString('utf16le');
} else {
  text = buf.toString('utf8');
}

const lines = text.split(/\r?\n/);

const prompts = [];
let i = 0;
while (i < lines.length) {
  const line = lines[i];
  if (line.startsWith('## User')) {
    i++;
    const userLines = [];
    while (i < lines.length && !lines[i].startsWith('## Assistant')) {
      userLines.push(lines[i]);
      i++;
    }
    const prompt = userLines.join('\n').trim();
    if (prompt.length > 0) {
      prompts.push(prompt);
    }
  } else {
    i++;
  }
}

const jsonl = prompts.map(p => JSON.stringify({ text: p })).join('\n');
fs.writeFileSync(output, jsonl + '\n', 'utf8');

console.log('PROMPTS', prompts.length);
console.log('OUTPUT', output);
