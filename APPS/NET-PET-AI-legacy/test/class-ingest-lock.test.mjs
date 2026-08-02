import { readFileSync } from 'fs';
const src = readFileSync('src/index.js', 'utf8');

// I1: No OPENAI_API_KEY fetch block in class/ingest (health checks may reference)
const ingestBlock = src.slice(src.indexOf('/api/class/ingest'), src.indexOf('/api/class/ingest') + 3000);
if (ingestBlock.includes('api.openai.com')) throw new Error('I1 FAIL: OPENAI API call still present in class/ingest');

// I2: utterances=true present in Deepgram query
if (!src.includes('utterances=true')) throw new Error('I2 FAIL: utterances=true missing from Deepgram query');

// I3: seedVocabBatch function exists
if (!src.includes('async function seedVocabBatch')) throw new Error('I3 FAIL: seedVocabBatch not defined');

// I4: seedVocabBatch called in class/ingest (not Promise.all map)
if (src.includes('extracted.map(w => seedVocab')) throw new Error('I4 FAIL: parallel seedVocab race still present');

// I5: validateActiveStudent called in class/ingest
if (!ingestBlock.includes('validateActiveStudent')) throw new Error('I5 FAIL: no roster check in class/ingest');

console.log('class-ingest-lock: ALL 5 ASSERTIONS GREEN');