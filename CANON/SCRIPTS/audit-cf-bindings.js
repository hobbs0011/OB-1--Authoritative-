const fs = require('fs');
const path = require('path');

const base = 'D:\\OB-1-CANONICAL';
const workers = [];
const kv = {};
const d1 = {};
const doSet = new Set();

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (!['node_modules', '.git', 'ARCHIVE', 'DEPRECATED', 'test-results', '.venv'].includes(f)) {
        walk(p);
      }
    } else if (f === 'wrangler.toml') {
      const text = fs.readFileSync(p, 'utf8');
      const nameM = text.match(/^name\s*=\s*"([^"]+)"/m);
      const name = nameM ? nameM[1] : path.basename(dir);
      workers.push(name);
      for (const km of text.matchAll(/\[\[kv_namespaces\]\]\s*binding\s*=\s*"([^"]+)"\s*id\s*=\s*"([^"]+)"/g)) {
        const [, b, id] = km;
        kv[id] = kv[id] || [];
        kv[id].push(name + ':' + b);
      }
      for (const dm of text.matchAll(/\[\[d1_databases\]\]\s*binding\s*=\s*"([^"]+)"\s*database_name\s*=\s*"([^"]+)"\s*database_id\s*=\s*"([^"]+)"/g)) {
        const [, b, dbname, dbid] = dm;
        d1[dbid] = d1[dbid] || [];
        d1[dbid].push(name + ':' + dbname);
      }
      for (const cm of text.matchAll(/class_name\s*=\s*"([^"]+)"/g)) {
        doSet.add(cm[1]);
      }
    }
  }
}

walk(base);

console.log('WORKERS:');
for (const w of [...new Set(workers)].sort()) {
  console.log('  - ' + w);
}
console.log('\nKV_NAMESPACES:');
for (const [id, refs] of Object.entries(kv)) {
  console.log('  ' + id + ': ' + [...new Set(refs)].sort().join(', '));
}
console.log('\nD1_DATABASES:');
for (const [id, refs] of Object.entries(d1)) {
  console.log('  ' + id + ': ' + [...new Set(refs)].sort().join(', '));
}
console.log('\nDO_CLASSES (' + doSet.size + '):');
for (const c of [...doSet].sort()) {
  console.log('  - ' + c);
}
