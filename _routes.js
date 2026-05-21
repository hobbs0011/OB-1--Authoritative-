const fs = require('fs');
const c = fs.readFileSync('APPS/NET-PET-AI/src/index.js','utf8');
const routes = [];
c.split('\n').forEach(l => {
  const m = l.match(/path\s*===\s*"([^"]+)"/);
  if(m) routes.push(m[1]);
});
const uniq = [...new Set(routes)].sort();
uniq.forEach(r => console.log(r));
