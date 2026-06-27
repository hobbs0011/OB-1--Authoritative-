const fs = require('fs');
const path = 'D:\\OB-1-CANONICAL\\CANON\\REGISTRY\\dna-registry-run142.json';

try {
  const stat = fs.statSync(path);
  console.log('File size:', stat.size);
  console.log('File mtime:', stat.mtime);
  
  const content = fs.readFileSync(path, 'utf8');
  const obj = JSON.parse(content);
  
  // Check if we can write to a temp file first
  const tmpPath = path + '.tmp';
  fs.writeFileSync(tmpPath, content);
  console.log('Temp file written successfully');
  fs.renameSync(tmpPath, path);
  console.log('File renamed successfully');
} catch (e) {
  console.error('Error:', e.message);
}
