const fs = require('fs');
const path = require('path');

const REPO = 'D:\\OB-1-CANONICAL';
const OUT = path.join(REPO, 'CANON', 'SOUL-KEYWORDS');

const categories = {
  portal: /\b(portal|login|password|student|teacher|dashboard|profile|career|action plan|methodology|transcript)\b/i,
  audio: /\b(deepgram|voice|tts|stt|audio|mic|microphone|recording|session|utterance|nova-3|whisper|stream|opus|mp3)\b/i,
  auth: /\b(auth|login|password|secret|api[_ ]?key|token|jwt|cors|oauth|user|role|admin)\b/i,
  phonics: /\b(phonics|drill|sound|group|jolly|phoneme|gospel|satnip|drumble|hogfez|wyvex|chushang|beehive|oyster)\b/i,
  pipeline: /\b(pipeline|ledger|starmap|keyword|soul|dna|rrl|death|rise|merkle|index|artifact|stage|run|hl)\b/i,
  system: /\b(worker|wrangler|deploy|kv|durable|object|binding|cron|cloudflare|route|endpoint|api)\b/i,
  student: /\b(quy|mai tram|huong|lam|quan|quang|minh|bluetech|blue[_ ]?tech|class|review|points|streak|badge)\b/i,
  revenue: /\b(payment|momo|bank|price|plan|employer|invoice|checkout|success|pending|subscription)\b/i,
  security: /\b(security|drift|telemetry|error|log|anti-cheat|ratelimit|blacklist|firewall|sanitize)\b/i,
  chrome: /\b(chrome|extension|install|manifest|popup|icon|webstore|crx)\b/i,
  mobile: /\b(mobile|ios|safari|reconnect|gesture|viewport|responsive|pwa)\b/i,
  curriculum: /\b(listening|speaking|reading|writing|assessment|submission|pack|tiger|streaming|youtube|shadowing)\b/i,
};

const stopWords = new Set([
  'the','and','that','have','for','with','this','were','would','from','been',
  'but','not','you','all','can','had','her','was','one','our','out','has',
  'just','know','take','people','into','year','your','good','some','could',
  'than','then','look','only','come','its','over','think','also','back',
  'after','use','two','how','our','work','first','well','way','even','new',
  'want','because','any','these','give','day','most','thing','very','still',
  'need','make','what','when','where','who','why','much','more','may','get',
  'got','put','let','say','said','does','going','really','something','anything','everything','nothing',
  'like','just','even','still','much','many','each','every','both','few','more'
]);

const suffix = (n) => `RRL/RRL-${n}.txt`;

function multiGlob(parts) {
  for (const p of parts) {
    const full = path.join(REPO, p);
    if (fs.existsSync(full) && fs.statSync(full).isFile()) return full;
  }
  return null;
}

function deathPath(n) {
  const a = path.join(REPO, 'CANON', 'REINCARNATION', `run${n}-reincarnateDEATH.md`);
  if (fs.existsSync(a)) return a;
  return null;
}

function pipePath(n) {
  const a = path.join(REPO, 'CANON', 'PIPELINE', `pipeline-run${n}.json`);
  if (fs.existsSync(a)) return a;
  return null;
}

function readFile(p) {
  try { if (!p) return ''; return fs.readFileSync(p, 'utf8'); } catch (e) { return ''; }
}

function tokenize(text) {
  const re = /\b[a-zA-Z][a-zA-Z0-9-]{2,}\b/g;
  const arr = [];
  let m;
  while ((m = re.exec(text)) !== null) arr.push(m[0].toLowerCase());
  return arr;
}

function categoryOf(word) {
  for (const [k, r] of Object.entries(categories)) {
    if (r.test(word)) return k;
  }
  return 'core';
}

function freqCount(tokens) {
  const f = new Map();
  for (const t of tokens) {
    if (stopWords.has(t) || t.length < 3) continue;
    f.set(t, (f.get(t) || 0) + 1);
  }
  return f;
}

function topTerms(freq, n = 15) {
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

function ledgerMatches(run, runStr) {
  try {
    const dir = path.join(REPO, 'CANON', 'HEAVY-LEDGER');
    if (!fs.existsSync(dir)) return '';
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && (f.includes(`run${run}`)));
    const out = [];
    for (const f of files) {
      const c = readFile(path.join(dir, f));
      if (c.includes(runStr)) out.push(c);
    }
    return out.join(' ');
  } catch (e) { return ''; }
}

function main() {
  const maxRun = 42;
  const manifest = [];
  const globalIndex = new Map();

  for (let run = 0; run <= maxRun; run++) {
    const runStr = `Run ${run}`;
    let combined = [
      readFile(multiGlob([`RRL/RRL-${run}.txt`])),
      readFile(deathPath(run)),
      readFile(pipePath(run)),
      ledgerMatches(run, runStr)
    ].join('\n');

    if (!combined.trim()) continue;

    const tokens = tokenize(combined);
    const freq = freqCount(tokens);
    const top = topTerms(freq, 20);
    if (!top.length) continue;

    const lines = top.map(([term, count]) => {
      const w = Math.max(1, Math.min(5, count));
      return `${w} | ${categoryOf(term)} | ${term}`;
    });

    const outFile = path.join(OUT, `rfkw-run${run}.txt`);
    fs.writeFileSync(outFile, lines.join('\n') + '\n', 'utf8');

    manifest.push({ run, tokens: top.length, file: outFile, generated: new Date().toISOString() });

    for (const [term, count] of top) {
      const w = Math.max(1, Math.min(5, count));
      if (!globalIndex.has(term)) globalIndex.set(term, []);
      globalIndex.get(term).push({ run, category: categoryOf(term), weight: w });
    }
  }

  fs.writeFileSync(path.join(OUT, 'soulkeys-manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  const indexObj = {};
  for (const [term, entries] of globalIndex.entries()) {
    indexObj[term] = entries;
  }
  fs.writeFileSync(path.join(OUT, 'inverted-index.json'), JSON.stringify(indexObj, null, 2), 'utf8');

  console.log(`SOULKEYS RECOVERY COMPLETE\n  Runs processed: ${manifest.length}\n  Manifest: ${path.join(OUT, 'soulkeys-manifest.json')}\n  Index  : ${path.join(OUT, 'inverted-index.json')}`);
}

main();
