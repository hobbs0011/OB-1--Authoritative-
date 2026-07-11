const fs = require('fs');
const path = require('path');
const TRANS = path.join(__dirname, '..', 'OPERATIONS', 'mai-tram-transcripts.json');
const VOCAB_OUT = path.join(__dirname, '..', 'OPERATIONS', 'mai-tram-vocab-list.json');
const data = JSON.parse(fs.readFileSync(TRANS, 'utf8'));

const STOP = new Set(['the','and','for','are','but','not','you','all','can','had','her','was','one','our','out','how','what','when','where','who','why','this','that','with','have','from','they','been','said','each','she','him','his','its','did','yes','yeah','just','more','most','only','over','such','also','very','well','back','being','because','before','after','between','their','there','these','those','through','where','which','while','would','write','your','about','into','them','then','some','make','like','time','look','see','know','think','right','yeah','okay','good','bad','get','got','come','came','want','went','mean','means','said','say','says','much','many','some','any','lot','lots','really','still','even','ever','never','always','often','sometimes','usually','maybe','perhaps','because','since','until','while','though','although','however','therefore','instead','actually','basically','definitely','probably','possibly','certainly','obviously','clearly','exactly','really','truly','simply','quite','rather','enough','almost','nearly','almost','already','yet','ago','today','tomorrow','yesterday','morning','afternoon','evening','night','week','month','year']);

function tokenize(text) {
  return (text || '').toLowerCase().replace(/[^a-z\s'-]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP.has(w));
}

function extractPhrases(text) {
  const words = tokenize(text);
  const phrases = new Set();
  // grab 2-3 word combos
  for (let i = 0; i < words.length - 1; i++) {
    phrases.add(words.slice(i, i + 2).join(' '));
    if (i < words.length - 2) phrases.add(words.slice(i, i + 3).join(' '));
  }
  return [...phrases];
}

const out = [];
for (const item of data) {
  const vocab = [...new Set(tokenize(item.transcript))];
  const phrases = extractPhrases(item.transcript);
  const topicWords = extractPhrases(item.transcript).filter(p => p.length > 5);
  const keyMoments = (item.teachMoments || []).slice(0, 20);
  out.push({
    id: item.id,
    date: item.date,
    title: item.title,
    utterances: item.utterances,
    vocab: vocab.slice(0, 120).filter(w => w.length > 2),
    phrases: phrases.slice(0, 60),
    topicWords: topicWords.slice(0, 40),
    keyMoments
  });
}

fs.writeFileSync(VOCAB_OUT, JSON.stringify(out, null, 2));
console.log('Saved to', VOCAB_OUT);
for (const r of out) {
  console.log(`\n=== ${r.title} ===`);
  console.log(`utterances: ${r.utterances}`);
  console.log(`vocab (${r.vocab.length}): ${r.vocab.join(', ')}`);
  console.log(`phrases (${r.phrases.length}): ${r.phrases.slice(0, 15).join(' | ')}`);
  console.log(`keyMoments (${r.keyMoments.length}):`);
  for (const m of r.keyMoments.slice(0, 3)) console.log(`  - "${m}"`);
}
