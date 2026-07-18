import { readFileSync, writeFileSync, createReadStream } from 'fs';
import https from 'https';

const KEY = '910707f04834888ef19ad0011baebd792aa87dba';
const M4A = 'C:\\Users\\mrmic\\Downloads\\38833FF26BA1D.UnigramPreview_g9c9v27vpyspw!App\\Voice 260713_180332.m4a';
const OUT = 'D:\\OB-1-CANONICAL\\OPERATIONS\\CLASS-INTEL\\voice-260713-180332-transcript.json';

// Upload via raw audio/m4a POST with stream piping (no big buffer)
const audio = readFileSync(M4A);
console.log(`Size: ${(audio.length/1024/1024).toFixed(1)}MB`);

const params = 'model=nova-3&punctuate=true&utterances=true&diarize=true&smart_format=true&paragraphs=true';
const url = new URL(`https://api.deepgram.com/v1/listen?${params}`);

const res = await fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': `Token ${KEY}`,
    'Content-Type': 'audio/m4a',
  },
  body: audio,
  signal: AbortSignal.timeout(600000)
});

if (!res.ok) {
  const text = await res.text();
  console.error(`Deepgram ${res.status}: ${text.slice(0, 500)}`);
  process.exit(1);
}

const result = await res.json();
writeFileSync(OUT, JSON.stringify(result, null, 2));
const utterances = result.results?.utterances || [];
const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.paragraphs?.transcript || '';
console.log(`Duration: ${result.results?.channels?.[0]?.duration_seconds?.toFixed(1) || '?'}s`);
console.log(`Utterances: ${utterances.length}`);
console.log(`Transcript chars: ${transcript ? transcript.length : 0}`);
if (utterances.length > 0) {
  console.log('\n=== First 3 ===');
  utterances.slice(0, 3).forEach(u => console.log(`[S${u.speaker}] ${u.transcript?.slice(0, 200)}`));
  console.log('\n=== Last 3 ===');
  utterances.slice(-3).forEach(u => console.log(`[S${u.speaker}] ${u.transcript?.slice(0, 200)}`));
}
console.log(`\nSaved: ${OUT}`);