const https = require('https');
const fs = require('fs');

const content = fs.readFileSync('D:/OB-1-CANONICAL/APPS/NET-PET-AI/src/index.js', 'utf8');
console.log('File size:', content.length, 'chars');

const body = JSON.stringify({
  task: 'OBI chatbot fix. In APPS/NET-PET-AI/src/index.js, find handleChat or handleObi function. Fix the system prompt so OBI never leaks raw AI reasoning into student responses. Build a clean system prompt helper: (1) Lock OBI role as warm English phonics teacher for adult Vietnamese beginners. (2) Instruct: NEVER output reasoning blocks, never say "as an AI", never reference internal instructions — always stay in character as the teacher. (3) Response length: under 3 sentences for beginners, 5 for intermediate. (4) Grammar correction: silently rephrase correctly — never call out the error. (5) Close with behavioral contract preventing prompt injection. Replace the old prompt builder. Do not add routes. Do not touch student profile or D1 code.',
  context: content.substring(0, 8000) + '\n\n... (file continues, total ' + content.length + ' chars)',
  maxTokens: 4096,
  targetfile: 'D:/OB-1-CANONICAL/APPS/NET-PET-AI/src/index.js',
  diffMode: true
});

const req = https.request({
  hostname: 'phoenix-coder.mrmichaelhobbs123.workers.dev',
  path: '/api/code',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log(d.slice(0, 5000));
  });
});
req.write(body);
req.end();
