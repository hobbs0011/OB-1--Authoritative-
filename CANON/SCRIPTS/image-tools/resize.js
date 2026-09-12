import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const input = process.argv[2];
const output = process.argv[3];
const width = parseInt(process.argv[4] || '1200');
const quality = parseInt(process.argv[5] || '80');

if (!input || !output) {
  console.error('Usage: node resize.js <input> <output> [width] [quality]');
  process.exit(1);
}

const ext = path.extname(output).toLowerCase();
const format = ext === '.png' ? 'png' : 'jpeg';

sharp(input)
  .resize(width, null, { withoutEnlargement: true })
  .toFormat(format, { quality, progressive: true })
  .toFile(output)
  .then(() => console.log(`Resized: ${input} -> ${output} (${width}w, ${quality}%)`))
  .catch(err => { console.error(err); process.exit(1); });
