import fs from 'fs';
import path from 'path';

const assetsDir = process.argv[2] || 'APPS/NET-PET-AI-legacy/public/assets';
const maxSizeKB = parseInt(process.argv[3] || '500');

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(entry.name)) files.push(full);
  }
  return files;
}

const files = walk(assetsDir);
let issues = 0;

console.log(`\nImage Audit: ${assetsDir}`);
console.log(`Max size: ${maxSizeKB}KB\n`);

for (const file of files) {
  const stat = fs.statSync(file);
  const sizeKB = Math.round(stat.size / 1024);
  const status = sizeKB > maxSizeKB ? 'OVER' : 'OK';
  if (status === 'OVER') issues++;
  console.log(`[${status}] ${sizeKB}KB | ${path.relative(assetsDir, file)}`);
}

console.log(`\nTotal: ${files.length} images, ${issues} oversized\n`);
process.exit(issues > 0 ? 1 : 0);
