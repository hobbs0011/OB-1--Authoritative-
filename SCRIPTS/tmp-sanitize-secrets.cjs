const fs = require('fs');
const path = require('path');

const files = [
  'D:\\OB-1-CANONICAL\\CANON\\SOUL\\EXTRACT\\reasoning-run182-session-ses_1161.jsonl',
  'D:\\OB-1-CANONICAL\\CANON\\SOUL\\EXTRACT\\reasoning-run182-session-ses_0899.jsonl'
];

const secretPatterns = [
  /DEEPSEEK_API_KEY=\s*sk-[A-Za-z0-9]+/g,
  /sk-[A-Za-z0-9]{32,}/g,
  /CLOUDFLARE_API_TOKEN=\s*[^\s"']+/gi,
  /Bearer\s+[A-Za-z0-9\-_\.]+/gi,
  /password['":\s]+['"][^'"]+['"]/gi,
  /api_key['":\s]+['"][^'"]+['"]/gi,
  /token['":\s]+['"][^'"]+['"]/gi,
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let text = fs.readFileSync(file, 'utf8');
  let redactions = 0;
  for (const pat of secretPatterns) {
    const matches = text.match(pat);
    if (matches) {
      redactions += matches.length;
      text = text.replace(pat, '[REDACTED]');
    }
  }
  fs.writeFileSync(file, text, 'utf8');
  console.log('Sanitized ' + path.basename(file) + ' (' + redactions + ' redactions)');
}
