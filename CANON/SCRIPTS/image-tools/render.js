import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const input = process.argv[2];
const outputDir = process.argv[3] || '.';
const sizes = [320, 640, 1200];

if (!input) {
  console.error('Usage: node render.js <input> [outputDir]');
  process.exit(1);
}

const basename = path.basename(input, path.extname(input));

Promise.all(sizes.map(size => {
  const outPath = path.join(outputDir, `${basename}-${size}w${path.extname(input)}`);
  return sharp(input)
    .resize(size, null, { withoutEnlargement: true })
    .toFile(outPath)
    .then(() => ({ size, path: outPath }));
}))
.then(results => {
  console.log(`Rendered ${results.length} sizes from ${input}:`);
  results.forEach(r => console.log(`  ${r.size}w -> ${r.path}`));
})
.catch(err => { console.error(err); process.exit(1); });
