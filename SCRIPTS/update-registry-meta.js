const fs = require('fs');
const path = 'D:\\OB-1-CANONICAL\\CANON\\REGISTRY\\dna-registry-run142.json';

try {
  let content = fs.readFileSync(path, 'utf8');
  
  // Strip UTF-8 BOM if present
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  
  const obj = JSON.parse(content);
  
  // Update top-level metadata
  obj.generated_at = new Date().toISOString();
  obj.total_entries = obj.all_entries.length;
  
  // Rebuild by_category
  const byCat = {};
  for (const e of obj.all_entries) {
    byCat[e.category] = (byCat[e.category] || 0) + 1;
  }
  obj.by_category = Object.entries(byCat)
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join(', ');
  
  const output = JSON.stringify(obj);
  const tmpPath = path + '.tmp';
  fs.writeFileSync(tmpPath, '\uFEFF' + output, 'utf8');
  fs.renameSync(tmpPath, path);
  console.log('Registry updated successfully');
  console.log('Total entries:', obj.total_entries);
  console.log('Categories:', obj.by_category);
} catch (e) {
  console.error('Error:', e.message);
}
