const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = 'D:\\OB-1-CANONICAL\\Incarnate-Mailala2\\assets\\images';

async function main() {
  const files = fs.readdirSync(dir).filter(f => /\.jpg$/i.test(f));
  console.log(`Converting ${files.length} images to WebP...`);
  
  for (const file of files) {
    const inputPath = path.join(dir, file);
    const outputPath = path.join(dir, file.replace(/\.jpg$/i, '.webp'));
    
    await sharp(inputPath)
      .resize(1200, null, { withoutEnlargement: true })
      .webp({ quality: 85, effort: 4 })
      .toFile(outputPath);
    
    const jpgSize = fs.statSync(inputPath).size;
    const webpSize = fs.statSync(outputPath).size;
    const savings = ((1 - webpSize / jpgSize) * 100).toFixed(1);
    
    console.log(`  ${file}: ${(jpgSize/1024).toFixed(1)}KB -> ${(webpSize/1024).toFixed(1)}KB (${savings}% smaller)`);
  }
  
  console.log('Done.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
