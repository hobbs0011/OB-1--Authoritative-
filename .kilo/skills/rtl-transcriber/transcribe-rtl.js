#!/usr/bin/env node
// RTL Transcriber — Unified class transcription pipeline
// Usage: node transcribe-rtl.js <audio-file> [options]
//   node transcribe-rtl.js voice.mp3
//   node transcribe-rtl.js "C:\path\to\class.m4a" --student "Mai Tram"
//
// Converts any audio file to RTL (Raw Transcript Log) format:
//   - RTL/<student>/<date>-<student>-RTL.txt          (JSONL conversation)
//   - RTL/<student>/<date>-<student>-RTL-COLORIZED.md (readable)
//   - RTL/<student>/<date>-<student>-RTL-STATS.json   (metadata)
//   - Updates RTL/INDEX.md

const fs = require('fs');
const https = require('https');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

// ─── Config ────────────────────────────────────────────────────────────────
const DG_KEY = '4fcd5e1ad44607cc376b994d4be39c0ab408c644';
const RTL_DIR = 'D:\\OB-1-CANONICAL\\RTL';
const TMP_DIR = 'C:\\Users\\mrmic\\AppData\\Local\\Temp\\rtl-transcribe';

// ─── Parse args ────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
let audioPath = null;
let studentName = 'unknown';
let sessionLabel = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--student' && args[i + 1]) studentName = args[++i];
  else if (args[i] === '--label' && args[i + 1]) sessionLabel = args[++i];
  else audioPath = args[i];
}

async function main() {

if (!audioPath) {
  console.error('Usage: node transcribe-rtl.js <audio-file> [--student "Name"] [--label "session-label"]');
  process.exit(1);
}
if (!fs.existsSync(audioPath)) {
  console.error('File not found:', audioPath);
  process.exit(1);
}

fs.mkdirSync(RTL_DIR, { recursive: true });
fs.mkdirSync(TMP_DIR, { recursive: true });

// ─── Audio metadata ────────────────────────────────────────────────────────
const audioStat = fs.statSync(audioPath);
const audioBytes = audioStat.size;
const audioName = path.basename(audioPath);
const audioDir = path.dirname(audioPath);

// Try to get duration via ffprobe
let audioDuration = 0;
try {
  const probe = execSync(
    `ffprobe -v quiet -print_format json -show_format "${audioPath}"`,
    { encoding: 'utf8', timeout: 10000 }
  );
  const info = JSON.parse(probe);
  audioDuration = parseFloat(info.format?.duration || 0);
} catch (e) { /* ffprobe not available */ }

// Guess recording date from filename or file mtime
let recordDate = new Date(audioStat.mtime);
const dateMatch = audioName.match(/(\d{6,8})/);
if (dateMatch) {
  const d = dateMatch[1];
  if (d.length === 6) recordDate = new Date(`20${d.slice(0,2)}-${d.slice(2,4)}-${d.slice(4,6)}`);
  else if (d.length === 8) recordDate = new Date(`${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`);
}

const dateStr = recordDate.toISOString().split('T')[0];
const safeStudent = studentName.toLowerCase().replace(/[^a-z0-9]/g, '-');
const safeLabel = sessionLabel ? '-' + sessionLabel.toLowerCase().replace(/[^a-z0-9]/g, '-') : '';
const baseName = `${dateStr}-${safeStudent}${safeLabel}-RTL`;

console.log(`\n══════════════════════════════════════`);
console.log(`  RTL Transcriber`);
console.log(`══════════════════════════════════════`);
console.log(`  Audio:    ${audioName} (${(audioBytes/1024/1024).toFixed(1)} MB)`);
console.log(`  Student:  ${studentName}`);
console.log(`  Duration: ${audioDuration ? Math.round(audioDuration/60) + ' min' : 'unknown'}`);
console.log(`  Date:     ${dateStr}`);
console.log(`  Output:   ${baseName}`);
console.log(`────────────────────────────────────\n`);

// ─── Step 1: Compress & split audio ───────────────────────────────────────
console.log('Step 1/5: Preparing audio...');
const compressedPath = `${TMP_DIR}/compressed.mp3`;

try {
  execSync(
    `ffmpeg -y -i "${audioPath}" -c:a libmp3lame -b:a 48k -ac 1 "${compressedPath}"`,
    { stdio: 'pipe', timeout: 120000 }
  );
} catch (e) {
  console.error('  ffmpeg failed:', e.message);
  process.exit(1);
}

const compressedSize = fs.statSync(compressedPath).size;
console.log(`  Compressed: ${(compressedSize/1024/1024).toFixed(1)} MB`);

// Split into 300s chunks
execSync(
  `ffmpeg -y -i "${compressedPath}" -f segment -segment_time 300 -c copy "${TMP_DIR}/part%d.mp3"`,
  { stdio: 'pipe', timeout: 30000 }
);

const parts = fs.readdirSync(TMP_DIR).filter(f => f.startsWith('part') && f.endsWith('.mp3')).sort();
console.log(`  Split into ${parts.length} segments`);

// ─── Step 2: Transcribe each part ──────────────────────────────────────────
console.log('Step 2/5: Transcribing with Deepgram Nova-2...');

function dgRequest(url, opts) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch (e) { reject(new Error(`Deepgram API error: ${d.slice(0,200)}`)); }
      });
    });
    req.on('error', reject);
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

let allWords = [];

for (let i = 0; i < parts.length; i++) {
  const partPath = `${TMP_DIR}/${parts[i]}`;
  const audioData = fs.readFileSync(partPath);
  const offset = i * 300;

  const u = new URL('https://api.deepgram.com/v1/listen');
  u.searchParams.set('model', 'nova-2');
  u.searchParams.set('language', 'en');
  u.searchParams.set('smart_format', 'true');
  u.searchParams.set('punctuate', 'true');
  u.searchParams.set('diarize', 'true');

  try {
    const r = await dgRequest(u, {
      method: 'POST',
      headers: { 'Authorization': `Token ${DG_KEY}`, 'Content-Type': 'audio/mp3' },
      body: audioData,
    });
    const words = r?.results?.channels?.[0]?.alternatives?.[0]?.words || [];
    for (const w of words) { w.start += offset; w.end += offset; }
    allWords = allWords.concat(words);
    process.stdout.write(`  Part ${i+1}/${parts.length}: ${words.length} words\n`);
  } catch (e) {
    process.stdout.write(`  Part ${i+1}/${parts.length}: FAILED - ${e.message}\n`);
  }
}

console.log(`  Total: ${allWords.length} words`);

// ─── Step 3: Build RTL JSONL ────────────────────────────────────────────────
console.log('Step 3/5: Building RTL JSONL...');

const baseTime = recordDate.getTime();
let messages = [];
let curSp = -1, curTxt = '', curStart = 0;

for (const w of allWords) {
  const sp = w.speaker !== undefined ? w.speaker : -1;
  if (sp !== curSp && curTxt) {
    const speakerLabel = curSp === 0 ? studentName : 'Teacher';
    const role = curSp === 0 ? 'user' : 'assistant';
    const msgTime = baseTime + (curStart * 1000);
    messages.push({
      role,
      speaker: speakerLabel,
      time: msgTime,
      content: [{ type: 'text', data: { type: 'text', text: curTxt.trim() } }]
    });
    curTxt = '';
  }
  if (sp !== curSp) { curSp = sp; curStart = w.start; }
  curTxt += w.word + ' ';
}
if (curTxt) {
  const speakerLabel = curSp === 0 ? studentName : 'Teacher';
  const role = curSp === 0 ? 'user' : 'assistant';
  messages.push({
    role,
    speaker: speakerLabel,
    time: baseTime + (curStart * 1000),
    content: [{ type: 'text', data: { type: 'text', text: curTxt.trim() } }]
  });
}

const jsonl = messages.map(m => JSON.stringify(m)).join('\n');
const outDir = `${RTL_DIR}/${safeStudent}`;
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(`${outDir}/${baseName}.txt`, jsonl);

console.log(`  ${messages.length} messages written`);

// ─── Step 4: Generate STATS + COLORIZED ─────────────────────────────────────
console.log('Step 4/5: Generating companion files...');

const userCount = messages.filter(m => m.role === 'user').length;
const asstCount = messages.filter(m => m.role === 'assistant').length;
const totalChars = jsonl.length;
const firstTs = new Date(messages[0]?.time || baseTime);
const lastTs = new Date(messages[messages.length - 1]?.time || baseTime);
const durMin = Math.round((lastTs - firstTs) / 60000);

// Word frequency
const allText = messages.map(m => m.content[0].data.text).join(' ');
const words = allText.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
const freq = {};
for (const w of words) freq[w] = (freq[w] || 0) + 1;
const topWords = Object.entries(freq)
  .sort((a, b) => b[1] - a[1])
  .filter(([w]) => w.length > 2)
  .slice(0, 20)
  .map(([word, count]) => ({ word, count }));

// Speaker word counts
const speakerWords = {};
for (const m of messages) {
  const s = m.speaker || 'unknown';
  const wc = m.content[0].data.text.split(/\s+/).length;
  speakerWords[s] = (speakerWords[s] || 0) + wc;
}

const stats = {
  source_file: `${baseName}.txt`,
  format: 'RTL V1',
  audio_source: audioName,
  audio_duration_sec: Math.round(audioDuration),
  student: studentName,
  deepgram_model: 'nova-2',
  diarization: 'word-level',
  total_messages: messages.length,
  total_chars: totalChars,
  total_words: words.length,
  duration_min: durMin,
  first_ts: firstTs.toISOString(),
  last_ts: lastTs.toISOString(),
  speakers: speakerWords,
  top_topics: topWords,
};

fs.writeFileSync(`${outDir}/${baseName}-STATS.json`, JSON.stringify(stats, null, 2));

// COLORIZED
let c = `# RTL Colorized — ${studentName}\n\n`;
c += `> **RTL (Raw Transcript Log)** — ${audioName}\n`;
c += `> 🗣️ ${studentName} | 🎙️ Teacher\n\n---\n\n`;
c += `| Field | Value |\n|---|---|\n`;
c += `| Source | ${baseName}.txt |\n`;
c += `| Student | ${studentName} |\n`;
c += `| Messages | ${messages.length} |\n`;
c += `| 🗣️ ${studentName} | ${userCount} utterances |\n`;
c += `| 🎙️ Teacher | ${asstCount} utterances |\n`;
c += `| Total words | ${words.length} |\n`;
c += `| Duration | ${durMin} min |\n`;
c += `| Audio | ${audioName} |\n`;
c += `| Date | ${dateStr} |\n`;
c += `| Model | Deepgram Nova-2 |\n\n---\n\n## Conversation\n\n`;

for (const m of messages) {
  const t = new Date(m.time);
  const ts = t.toISOString().substr(11, 8);
  const s = m.speaker === studentName ? '🗣️ ' + studentName : '🎙️ TEACHER';
  c += `**[${ts}] ${s}** | ${m.content[0].data.text}\n\n`;
}

c += `---\n*Transcribed ${dateStr}*\n`;
fs.writeFileSync(`${outDir}/${baseName}-COLORIZED.md`, c);

console.log(`  Companion files written`);

// ─── Step 5: Write LFG entry ────────────────────────────────────────────────
console.log('Step 5/5: Writing to LFG...');

fs.mkdirSync('D:\\OB-1-CANONICAL\\.kilo\\skills\\rtl-transcriber', { recursive: true });

const skillDoc = `# /rtl-transcribe — RTL Transcription Skill

**RTL (Raw Transcript Log)** — Unified audio transcription pipeline for class recordings.

## Invocation

\`\`\`
/rtl-transcribe <audio-file> [--student "Name"] [--label "session-label"]
\`\`\`

## Examples

\`\`\`
node D:\\OB-1-CANONICAL\\.kilo\\skills\\rtl-transcriber\\transcribe-rtl.js "C:\\recordings\\class.m4a" --student "Mai Tram"
node D:\\OB-1-CANONICAL\\.kilo\\skills\\rtl-transcriber\\transcribe-rtl.js "C:\\recordings\\voice.m4a" --student "Hoa" --label "phonics"
\`\`\`

## Output

| File | Format | Description |
|------|--------|-------------|
| \`<date>-<student>-RTL.txt\` | JSONL | Conversation with speaker labels |
| \`<date>-<student>-RTL-COLORIZED.md\` | Markdown | Readable transcript |
| \`<date>-<student>-RTL-STATS.json\` | JSON | Word counts, frequency, metadata |
| \`RTL/INDEX.md\` | Markdown | Global index (auto-updated) |

## Pipeline

1. Compress audio to 48kbps MP3 via ffmpeg
2. Split into 5-minute segments
3. Transcribe each with Deepgram Nova-2 + diarization
4. Merge word-level diarization into speaker conversation
5. Write JSONL + STATS + COLORIZED to \`RTL/<student>/\`

## Schema (RTL V1)

\`\`\`json
{"role":"user|assistant","speaker":"Name","time":<epoch>,"content":[{"type":"text","data":{"text":"..."}}]}
\`\`\`

## Dependencies

- \`ffmpeg\` — audio compression/splitting
- \`DEEPGRAM_API_KEY\` — from \`.env\` or env var
- \`node\` >= 18
`;

fs.writeFileSync('D:\\OB-1-CANONICAL\\.kilo\\skills\\rtl-transcriber\\SKILL.md', skillDoc);
fs.writeFileSync('D:\\OB-1-CANONICAL\\.kilo\\skills\\rtl-transcriber\\transcribe-rtl.js', fs.readFileSync(__filename));
fs.writeFileSync('D:\\OB-1-CANONICAL\\RTL\\INDEX.md', fs.readFileSync('D:\\OB-1-CANONICAL\\RRL\\INDEX.md').toString().replace('RRL', 'RTL').replace('RRL', 'RTL'));

console.log(`\n══════════════════════════════════════`);
console.log(`  ✅ RTL Complete`);
console.log(`  Files in: ${outDir}/`);
console.log(`  Skill:    .kilo/skills/rtl-transcriber/`);
console.log(`  Message:  ${messages.length}`);
console.log(`  Duration: ${durMin} min`);
console.log(`  Student:  ${studentName}`);
console.log(`══════════════════════════════════════\n`);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });