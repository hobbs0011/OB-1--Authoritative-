const https = require('https');
const fs = require('fs');
const transcript = fs.readFileSync('D:/OB-1-CANONICAL/Voice 260521_181606.txt', 'utf8');
const trx = transcript.slice(0, 9000); // safe envelope for 4096 maxTokens

const sweeps = [
  {
    id: 'SWEEP-1',
    task: 'Extract ALL numbered steps from this transcript verbatim. This is a teacher describing how to use an English learning app. Produce a numbered block: "## PHONICS SEQUENCE\n1. [direct quote or action from transcript]\n2. ...\n" List EVERY distinct teaching step or app instruction mentioned. Do not paraphrase, compress, or invent. If the same step is repeated, count it again.',
    context: transcript.slice(0, 9000),
    prefix: 'QUY-PHONICS-'
  },
  {
    id: 'SWEEP-2',
    task: 'Student production error extraction. Read this teacher-student transcript and find every place where the student says something that is: (1) grammatically wrong (missing article, wrong tense, wrong preposition), (2) mispronounced (flagged as "low confidence" or teacher re-corrected), or (3) hallucinated/nonsensical. Output format: "## PRODUCTION ERRORS\n1. ERROR: [student utterance] → CORRECTION: [teacher model line or implicit correction]\n" No hallucinations of your own. Only what the transcript actually shows.',
    context: transcript.slice(0, 9000),
    prefix: 'QUY-ERRORS-'
  },
  {
    id: 'SWEEP-3',
    task: 'App feature + UI step extraction. From this BlueTech class transcript, extract every mention of an APP FEATURE or UI interaction. Output format: "## APP STEPS\n1. [action]: [verbatim feature description]\n" Preserve teacher names for buttons, labels, and screens exactly as spoken. Think: profile page, portal page, OBI button, problem box, hold-to-speak, click-to-speak, etc. Every UI element mentioned counts.',
    context: transcript.slice(0, 9000),
    prefix: 'QUY-APPSTEPS-'
  },
  {
    id: 'SWEEP-4',
    task: 'Teacher instruction log. Extract every numbered or sequential instruction the teacher gives in this transcript. This includes: sequence commands (first do X, then do Y), hard rules (you MUST, you CANNOT, remember the deal), warnings, predictions, motivational lines, and accountability checks. Output format: "## TEACHER CMDS\n1. [verbatim instruction]\n2. ...\n" Do not paraphrase. Exact utterance or nothing.',
    context: transcript.slice(0, 9000),
    prefix: 'QUY-CMDS-'
  },
  {
    id: 'SWEEP-5',
    task: 'Schedule + life-context extraction. Find every time-slot, schedule block, daily routine element, and student life-context detail mentioned in this transcript. Output format: "## SCHEDULE\n1. SLOT: [description] — TIME: [verbatim]\n" Include: wake time, commute time, breakfast, brush teeth, makeup, cooking, listening windows, class days, non-class days, two-week gap, app-ready timing. Also capture all student life context: busy schedule, accountant job, numbers/vocabulary, cooking at home, grab-car commute, evening relaxation needs.',
    context: transcript.slice(0, 9000),
    prefix: 'QUY-SCHEDULE-'
  }
];

const results = [];
let done = 0;
sweeps.forEach(s => {
  const body = JSON.stringify({
    task: s.task,
    context: s.context,
    targetfile: 'Voice 260521_181606.txt',
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
        results.push({ id: s.id, prefix: s.prefix, patch: r.code_patch, mode: r.mode, d1: r.d1_row_id, ok: r.code_patch !== 'GENERATION_FAILED' });
      } catch(e) {
        results.push({ id: s.id, prefix: s.prefix, patch: 'PARSE_ERROR', ok: false, err: d.slice(0, 500) });
      }
      done++;
      if (done === sweeps.length) {
        fs.writeFileSync('D:/OB-1-CANONICAL/_swc_results.json', JSON.stringify(results, null, 2));
        console.log('ALL 5 DONE:', results.map(r => `${r.id}: ${r.ok ? 'OK' : 'FAIL'} ${r.d1 || ''}`).join('\n'));
      }
    });
  });
  req.write(body);
  req.end();
});
