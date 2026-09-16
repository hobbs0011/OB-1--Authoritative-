const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\mrmic\\OneDrive\\Desktop';
const outDir = path.join(__dirname, '..', 'assets', 'images');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const newImages = [
  '6150204477533786107_121.jpg',
  '6150204477533786110_121.jpg',
  '6150204477533786109_121.jpg',
  '6150204477533786111_121.jpg',
  '6150204477533786112_121.jpg',
  '6150204477533786120_121.jpg',
  '6150204477533786119_121.jpg',
  '6150204477533786121_121.jpg',
  '6150204477533786122_121.jpg'
];

const heroCandidates = [
  '6150204477533786107_121.jpg',
  '6150204477533786110_121.jpg',
  '6150204477533786109_121.jpg',
  '6150204477533786111_121.jpg',
  '6150204477533786112_121.jpg'
];

const vibeImages = [
  '6150204477533786112_121.jpg',
  '6150204477533786120_121.jpg',
  '6150204477533786119_121.jpg',
  '6150204477533786121_121.jpg',
  '6150204477533786122_121.jpg'
];

const roomImages = {
  'room-mixed-8': '6150204477533786107_121.jpg',
  'room-private': '6150204477533786110_121.jpg',
  'room-female-6': '6150204477533786109_121.jpg',
  'room-mixed-4': '6150204477533786111_121.jpg'
};

const rooftopImages = [
  '6150204477533786112_121.jpg',
  '6150204477533786120_121.jpg',
  '6150204477533786119_121.jpg',
  '6150204477533786121_121.jpg',
  '6150204477533786122_121.jpg'
];

async function enhanceForWeb(input, output, options = {}) {
  const {
    width = 1920,
    height = null,
    quality = 80,
    sharpen = true,
    normalize = true
  } = options;

  let pipeline = sharp(input);

  if (normalize) {
    pipeline = pipeline.normalize();
  }

  if (sharpen) {
    pipeline = pipeline.sharpen({ sigma: 0.5 });
  }

  if (height) {
    pipeline = pipeline.resize(width, height, { fit: 'cover', withoutEnlargement: true });
  } else {
    pipeline = pipeline.resize({ width, withoutEnlargement: true });
  }

  await pipeline
    .jpeg({ quality, mozjpeg: true, progressive: true })
    .toFile(output);

  console.log(`Enhanced: ${path.basename(input)} -> ${path.basename(output)}`);
}

async function createHeroComposite() {
  const images = [];
  for (const file of heroCandidates) {
    const fp = path.join(srcDir, file);
    if (fs.existsSync(fp)) {
      const meta = await sharp(fp).metadata();
      images.push({ file: fp, width: meta.width, height: meta.height });
    }
  }

  if (images.length === 0) {
    console.log('No hero images found, skipping hero composite');
    return;
  }

  const targetW = 1920;
  const targetH = 1080;
  const count = images.length;
  const cols = count > 1 ? 2 : 1;
  const rows = Math.ceil(count / cols);
  const cellW = Math.floor(targetW / cols);
  const cellH = Math.floor(targetH / rows);
  const gap = 24;

  const canvasW = cols * cellW + (cols - 1) * gap;
  const canvasH = rows * cellH + (rows - 1) * gap;

  const composites = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * (cellW + gap);
    const y = row * (cellH + gap);

    const resized = sharp(images[i].file)
      .resize(cellW, cellH, { fit: 'cover', withoutEnlargement: true })
      .jpeg({ quality: 90, mozjpeg: true });

    composites.push({
      input: await resized.toBuffer(),
      left: x,
      top: y
    });
  }

  const canvas = sharp({
    create: {
      width: canvasW,
      height: canvasH,
      channels: 3,
      background: { r: 15, g: 13, b: 11 }
    }
  });

  await canvas
    .composite(composites)
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(path.join(outDir, 'hero-composite.jpg'));

  console.log(`Hero composite saved: ${canvasW}x${canvasH}`);
}

async function createVibeGrid() {
  const images = [];
  for (const file of vibeImages) {
    const fp = path.join(srcDir, file);
    if (fs.existsSync(fp)) {
      const meta = await sharp(fp).metadata();
      images.push({ file: fp, width: meta.width, height: meta.height });
    }
  }

  if (images.length === 0) {
    console.log('No vibe images found, skipping vibe grid');
    return;
  }

  const targetW = 1200;
  const targetH = 800;
  const count = images.length;
  const cols = count > 1 ? 2 : 1;
  const rows = Math.ceil(count / cols);
  const cellW = Math.floor(targetW / cols);
  const cellH = Math.floor(targetH / rows);
  const gap = 16;

  const canvasW = cols * cellW + (cols - 1) * gap;
  const canvasH = rows * cellH + (rows - 1) * gap;

  const composites = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * (cellW + gap);
    const y = row * (cellH + gap);

    const resized = sharp(images[i].file)
      .resize(cellW, cellH, { fit: 'cover', withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true });

    composites.push({
      input: await resized.toBuffer(),
      left: x,
      top: y
    });
  }

  const canvas = sharp({
    create: {
      width: canvasW,
      height: canvasH,
      channels: 3,
      background: { r: 15, g: 13, b: 11 }
    }
  });

  await canvas
    .composite(composites)
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(path.join(outDir, 'vibe-grid.jpg'));

  console.log(`Vibe grid saved: ${canvasW}x${canvasH}`);
}

async function createRooftopCollage() {
  const images = [];
  for (const file of rooftopImages) {
    const fp = path.join(srcDir, file);
    if (fs.existsSync(fp)) {
      const meta = await sharp(fp).metadata();
      images.push({ file: fp, width: meta.width, height: meta.height });
    }
  }

  if (images.length === 0) {
    console.log('No rooftop images found, skipping rooftop collage');
    return;
  }

  const targetW = 1200;
  const targetH = 800;
  const count = images.length;
  const cols = 3;
  const rows = Math.ceil(count / cols);
  const cellW = Math.floor(targetW / cols);
  const cellH = Math.floor(targetH / rows);
  const gap = 12;

  const canvasW = cols * cellW + (cols - 1) * gap;
  const canvasH = rows * cellH + (rows - 1) * gap;

  const composites = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * (cellW + gap);
    const y = row * (cellH + gap);

    const resized = sharp(images[i].file)
      .resize(cellW, cellH, { fit: 'cover', withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true });

    composites.push({
      input: await resized.toBuffer(),
      left: x,
      top: y
    });
  }

  const canvas = sharp({
    create: {
      width: canvasW,
      height: canvasH,
      channels: 3,
      background: { r: 15, g: 13, b: 11 }
    }
  });

  await canvas
    .composite(composites)
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(path.join(outDir, 'rooftop-collage.jpg'));

  console.log(`Rooftop collage saved: ${canvasW}x${canvasH}`);
}

async function processAll() {
  console.log('Processing Mailala images with new venue shots...\n');

  await createHeroComposite();
  await createVibeGrid();
  await createRooftopCollage();

  for (const [key, file] of Object.entries(roomImages)) {
    const src = path.join(srcDir, file);
    const dst = path.join(outDir, `${key}.jpg`);
    if (fs.existsSync(src)) {
      await enhanceForWeb(src, dst, { width: 1200, quality: 85 });
    }
  }

  const allJpgs = fs.readdirSync(srcDir).filter(f => f.toLowerCase().endsWith('.jpg'));
  for (const file of allJpgs) {
    const src = path.join(srcDir, file);
    const dst = path.join(outDir, file);
    if (!fs.existsSync(dst)) {
      await enhanceForWeb(src, dst, { width: 1600, quality: 82 });
    }
  }

  console.log('\nAll images processed.');
}

processAll().catch(err => {
  console.error(err);
  process.exit(1);
});
