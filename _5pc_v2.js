const https = require('https');
const fs = require('fs');
const c = fs.readFileSync('D:/OB-1-CANONICAL/Voice 260521_181606.txt', 'utf8');
const ctx = c.slice(0, 5000);

const sweeps = [
  { id: 'S1', task: 'List EVERY distinct alphabetical instruction step from this BlueTech English class transcript with Michael. Count from 1 to 50. Include: phonics definition, 44 sounds, app name, daily hours, split, fit-it-in slots, habit loop, 21 days, streak/badges, profile page, portal page, OBI button, hold vs click problem, hold-to-speak fix, offline, first-session name injection, comprehension %, 44 phonics program, teacher model, minimal pair structure, sound repetition, cool code structure, next action. No paraphrasing — verbatim labels.', ctx: c.slice(0, 5000) },
  { id: 'S2', task: 'Student production error log. Extract ALL errors from the student: wrong articles, wrong plurals, wrong verb tense, pronunciation flags, and teacher corrections. Format: N. [student wrong] → [teacher correct]. If teacher silently models (doesnt say "thats wrong"), show both sides. Only what is in transcript.', ctx: c.slice(3000, 8000) },
  { id: 'S3', task: 'Extract ALL app/UI/Platform features named or described. Format: N. [feature name] — [what it does]. Every label, button name, page name, and function mentioned. Exact words from transcript.', ctx: c.slice(6000, 11000) },
  { id: 'S4', task: 'Extract all schedule analysis: time, daily slots, listening windows, breakfast, commute, brush+makeup, walking, end-of-day checkin. Format: N. SLOT: [description] | TIME: [verbatim]. Also capture: non-class days, two-week gap before regroup, vocabulary bank feeds.', ctx: c.slice(9000, 14000) },
  { id: 'S5', task: 'Extract all teacher quotes, hard rules, and rules changes. Every numbered rule, deal, agreement, explicit use-change, qualification, call out. Format: N. TEACHER: [verbatim]', ctx: c.slice(12000, 17000) }
];

const results = [];
let done = 0;

sweeps.forEach(s => {
  const body = JSON.stringify({
    task: s.task,
    context: s.ctx,
    targetfile: 'Voice_transcript_extraction',
    maxTokens: 4096
  });
  const req = https.request({
    hostname: 'phoenix-coder.mrmichaelhobbs123.workers.dev',
    path: '/api/code',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      try {
        const r = JSON.parse(d);
        results.push({ id: s.id, ok: r.code_patch !== 'GENERATION_FAILED', d1: r.d1_row_id, patch: (r.code_patch || '').slice(0, 800) });
      } catch(e) { results.push({ id: s.id, ok: false, raw: d.slice(0, 200) }); }
      done++;
      if (done === sweeps.length) {
        fs.writeFileSync('D:/OB-1-CANONICAL/_5pc_results2.json', JSON.stringify(results, null, 2));
        console.log(results.map(r => `${r.id}: ${r.ok?'PASS':'FAIL'} ${r.d1||''}`).join('\n'));
      }
    });
  });
  req.write(body);
  req.on('error', e => { results.push({ id: s.id, ok: false, err: e.message }); done++; if(done===5) console.log(results); });
  req.end();
});
