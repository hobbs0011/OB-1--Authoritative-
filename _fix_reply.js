const fs = require('fs');
const f = 'D:/OB-1-CANONICAL/APPS/NET-PET-AI/src/index.js';
const c = fs.readFileSync(f, 'utf8');
const old = 'const reply = choice?.content || choice?.reasoning_content || "Say that again?";';
const neu = 'const reply = choice?.content?.trim() || "Say that again?";';
if (!c.includes(old)) { console.error('Old line not found'); process.exit(1); }
console.log('Found old reply line, replacing...');
const r = c.replace(old, neu);
fs.writeFileSync(f, r);
console.log('DONE');
console.log('New line:', r.slice(r.indexOf('const reply'), r.indexOf('const reply')+70).trim());
