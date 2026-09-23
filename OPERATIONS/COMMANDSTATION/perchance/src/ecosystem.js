/* ObiEcosystem — the full-stack student-evaluator tool inventory (single source of truth).

   Every tool a complete student-evaluation ecosystem needs, one row each, with an
   HONEST status: built | partial | missing. The markdown design doc
   (src/STUDENT-EVALUATOR-ECOSYSTEM.md) is GENERATED from this data, so the map can
   never drift from the app. `/tools` renders it live in the chat.

   Row: [id, family, name, status, where, note]
   Doctrine that binds every row here: verbatim-first (L37/L55), raw != derived,
   fail-closed, every claim cites its raw, never rewrite a record — annotate it. */
(function(){
  const F = {
    capture:    { id:"capture",    icon:"🎙", name:"CAPTURE — evidence in",      why:"you cannot evaluate what you did not record" },
    analysis:   { id:"analysis",   icon:"🧠", name:"ANALYSIS — comprehension",   why:"turn raw evidence into claims that can be checked" },
    judgement:  { id:"judgement",  icon:"⚖", name:"JUDGEMENT — evaluator quality", why:"the differentiator: fair, cited, auditable decisions" },
    report:     { id:"report",     icon:"📋", name:"REPORT — communication out",  why:"a judgement nobody understands changes nothing" },
    operations: { id:"operations", icon:"🗂", name:"OPERATIONS — workflow",       why:"rosters, filing, archives, batch: the daily machinery" },
    governance: { id:"governance", icon:"🛡", name:"GOVERNANCE — trust & compliance", why:"minors, recordings, high-stakes: non-negotiable" },
    learning:   { id:"learning",   icon:"🔁", name:"LEARNING LOOP — pedagogy",    why:"evaluation that does not change the next lesson is admin" },
    platform:   { id:"platform",   icon:"⚙", name:"PLATFORM — full-stack",        why:"ownership, scale, cost, verifiability" }
  };

  const TOOLS = [
    /* ---- CAPTURE ---- */
    ["cap.longform",   "capture", "Long-form audio/video transcription (hours, not clips)", "built", "/transcribe · src/transcribe.js", "pause-split parts, resume/retry, partial saved honestly"],
    ["cap.diarize",    "capture", "Speaker diarization + speaker identity (who said what)", "missing", "—", "without it a per-student review is inference, not evidence"],
    ["cap.ingest",     "capture", "Media ingest: file, URL, clipboard, drag-drop", "built", "/transcribe · src/transcribe.js", "picker + drop + paste + URL"],
    ["cap.live",       "capture", "Live/real-time in-room capture + live captions", "missing", "—", "class ends, the evidence should already exist"],
    ["cap.photo",      "capture", "Photo/OCR of worksheets, essays, handwriting", "missing", "—", "most student work never touches a keyboard"],
    ["cap.voiceself",  "capture", "Teacher voice notes / dictation", "built", "mic dictation (Web Speech) · src/app.js", "handsfree note-taking mid-lesson"],
    ["cap.attendance", "capture", "Attendance / presence capture", "missing", "—", "cheapest high-value signal in any classroom"],
    ["cap.scores",     "capture", "Quiz / test / exit-ticket result intake", "missing", "—", "the objective half of the grade"],
    ["cap.curriculum", "capture", "Syllabus / textbook TOC ingestion", "built", "/curriculum /curriculum import · src/curriculum.js", "the school's own pacing guides, parsed — PRIMARY grade 1-5 (Ecogreen) and SECONDARY grade 6-9, every book, every section; a newer .xlsx is ingested in the browser. /curriculum scope holds whose books and whose periods they are"],
    ["cap.home",       "capture", "Home/parent input (practice logs, requests)", "partial", "retired 2026-09-22 (client dropped)", "lives in the portal, not yet flowing into the evaluator"],
    ["cap.segment",    "capture", "Lesson/topic segmentation with timestamps", "partial", "part indices · src/audio-split.js", "parts exist; topic boundaries do not"],

    /* ---- ANALYSIS ---- */
    ["ana.summary",    "analysis", "Study summary derived from a recording, citing the raw", "built", "/summary · src/summary.js", "never replaces the transcript it came from"],
    ["ana.student",    "analysis", "Per-student evidence extraction from a group recording", "missing", "—", "the blocker for honest per-student reviews of a class"],
    ["ana.rubric",     "analysis", "Rubric definition + rubric-based scoring with cited evidence", "missing", "—", "the core evaluator instrument; everything else supports it"],
    ["ana.cefr",       "analysis", "CEFR / can-do descriptors + level tracking", "missing", "—", "the industry-standard lens for English training"],
    ["ana.errors",     "analysis", "Error taxonomy (grammar/lexis/pronunciation/discourse) + frequency", "missing", "—", "turn a transcript into a teachable list"],
    ["ana.vocab",      "analysis", "Vocabulary profiling: new words, bands, retention", "missing", "—", "measurable, motivating, cheap to compute"],
    ["ana.fluency",    "analysis", "Fluency metrics: words/min, pause ratio, repairs", "partial", "silence map · src/audio-split.js", "the pause map is the primitive; the metrics are unbuilt"],
    ["ana.pronounce",  "analysis", "Pronunciation / phoneme assessment", "missing", "—", "needs audio scoring, not just text"],
    ["ana.trend",      "analysis", "Growth trends per student per skill over time", "partial", "portal progress bars", "not in the evaluator; no term-level roll-up"],
    ["ana.coverage",   "analysis", "Coverage vs syllabus: what was taught, what was skipped", "built", "/coverage · src/curriculum.js", "evidence-driven, never assumed: the guide's sections against the client's transcripts + summaries — counted over the sovereign's OWN sections (the teaching scope), with everything else reported beside them"],
    ["ana.authorship", "analysis", "Authorship/AI-origin check on submitted work", "missing", "—", "increasingly required in schools"],
    ["ana.question",   "analysis", "Comprehension question generation from the lesson", "missing", "—", "turns evidence into the next lesson's material"],
    ["ana.identity",   "analysis", "Longitudinal identity (same student across classes/aliases)", "missing", "—", "without it growth data fractures"],
    ["ana.translate",  "analysis", "Bilingual glossing / translation (EN↔VN)", "partial", "retired 2026-09-22 (client dropped)", "parents read in their first language"],

    /* ---- JUDGEMENT ---- */
    ["jud.evidence",   "judgement", "Evidence-sufficiency gate (fail closed when thin)", "built", "TESTUDO gate · src/playbooks.js", "thin evidence is stated, never papered over"],
    ["jud.provenance", "judgement", "Provenance: every claim cites source + timestamp", "built", "/writeup /review · src/review.js", "the evidence list travels with the printable"],
    ["jud.quorum",     "judgement", "Quorum sensing before a conclusion", "built", "src/pheromone.js", "below quorum the colony camps and asks"],
    ["jud.coverage",   "judgement", "Omission audit: what was NOT observed", "partial", "partial-flag on transcripts", "no systematic 'what I could not see' report"],
    ["jud.fairness",   "judgement", "Fairness/bias audit (accent, gender, language, time)", "missing", "—", "an evaluator that is not audited is not an evaluator"],
    ["jud.rater",      "judgement", "Inter-rater reliability (two graders, same artifact)", "missing", "—", "multi-agent structure makes this natural"],
    ["jud.calibrate",  "judgement", "Confidence/calibration per judgement", "missing", "—", "so you can tell a confident call from a coin flip"],
    ["jud.contradict", "judgement", "Contradiction detection across evidence sources", "missing", "—", "two sources disagreeing is the most valuable signal"],
    ["jud.reasons",    "judgement", "Adverse-action reason codes (exactly what lowered it)", "missing", "—", "required for high-stakes decisions"],
    ["jud.override",   "judgement", "Teacher override, recorded and fed back to the field", "partial", "pheromone negative trail", "the primitive exists; no UI flow"],
    ["jud.second",     "judgement", "Second-opinion protocol for borderline cases", "partial", "Audit / DICTATOR roles", "doctrine without a workflow"],
    ["jud.drift",      "judgement", "Evaluator drift detection over time", "missing", "—", "canon has the doctrine (Ne0), not the code"],
    ["jud.rubricver",  "judgement", "Versioned rubrics — every score cites its rubric version", "missing", "—", "without it, comparability across terms is a guess"],

    /* ---- REPORT ---- */
    ["rep.writeup",    "report", "Class writeup (covered / how taught / notable quotes)", "built", "/writeup · src/review.js", "six sections, cited"],
    ["rep.review",     "report", "Student review (teacher / parent / short registers)", "built", "/review · src/review.js", "same evidence machine, different voice"],
    ["rep.print",      "report", "Printable / PDF export", "built", "🖨 Printable · src/review.js", "self-contained HTML, print to PDF"],
    ["rep.trend",      "report", "Term/period progress report with trend", "missing", "—", "the artifact parents actually pay for"],
    ["rep.student",    "report", "Student-facing self-assessment + goals", "missing", "—", "evaluation the learner owns"],
    ["rep.next",       "report", "Actionable next-step plan (practice prescription)", "partial", "manual gameplan in the portal", "should be derived from the errors"],
    ["rep.deliver",    "report", "Delivery: email / Zalo / SMS / share link", "missing", "—", "a report in an app nobody opens is invisible"],
    ["rep.meeting",    "report", "Pre-meeting brief (one page before a parent call)", "missing", "—", "cheap: it is a projection of existing evidence"],
    ["rep.voice",      "report", "Spoken report (TTS) for parents", "partial", "speak() · src/app.js", "voice output exists, not applied to reports"],
    ["rep.portfolio",  "report", "Portfolio assembly (best work + growth narrative)", "missing", "—", "the long-run proof of value"],
    ["rep.cert",       "report", "Verifiable certificate / credential", "missing", "—", "matters for adult learners"],

    /* ---- OPERATIONS ---- */
    ["ops.roster",     "operations", "Students / classes / active context", "built", "/student /class · src/review.js", "the subject model"],
    ["ops.file",       "operations", "Evidence filing + attachment to a subject", "built", "/file · auto-file · src/review.js", "one recording can file under two subjects"],
    ["ops.notes",      "operations", "Dated observations", "built", "/note · src/review.js", "human judgement alongside machine evidence"],
    ["ops.search",     "operations", "Search across all evidence", "built", "/find · src/review.js", "verbatim search"],
    ["ops.archive",    "operations", "Archives with read / export / delete", "built", "/transcripts /summaries /reviews · kv", "verified button-by-button"],
    ["ops.schedule",   "operations", "Scheduling / calendar of lessons", "missing", "—", "the portal shows a schedule; the evaluator does not know it"],
    ["ops.tasks",      "operations", "Assignment tracking (assigned → submitted → graded)", "missing", "—", "closes the loop between lesson and evaluation"],
    ["ops.templates",  "operations", "Rubric / lesson / report template library", "missing", "—", "consistency across teachers comes from templates"],
    ["ops.batch",      "operations", "Batch operation over a whole class", "missing", "FORMICA playbook (doctrine only)", "30 students must not mean 30 manual passes"],
    ["ops.team",       "operations", "Multi-teacher accounts + permissions", "missing", "—", "a school is not one login"],
    ["ops.interop",    "operations", "Import/export: CSV, LTI, OneRoster, gradebook", "missing", "—", "schools live on other systems"],
    ["ops.backup",     "operations", "Backup / restore / portability", "partial", "kv + /gh backup + JSON export", "no restore path"],
    ["ops.cost",       "operations", "Cost & quota governance per class/term", "partial", "playbook supply gauge", "counts commands, not real tokens"],

    /* ---- GOVERNANCE ---- */
    ["gov.verbatim",   "governance", "Verbatim-capture-first; raw preserved untouched", "built", "ledger + RRL · src/app.js (L37/L55)", "the non-negotiable one"],
    ["gov.chain",      "governance", "Provenance chain raw → derived → report", "built", "summary/review refs · src/review.js", "every derived artifact points back"],
    ["gov.consent",    "governance", "Recording consent register (parent/guardian, minors)", "missing", "—", "legally required before you record a child"],
    ["gov.retention",  "governance", "Retention policy + scheduled deletion", "missing", "—", "how long may a child's recording live?"],
    ["gov.pii",        "governance", "PII minimisation / redaction in transcripts", "missing", "—", "names, addresses, faces"],
    ["gov.residency",  "governance", "Data residency / localisation (VN PDPD)", "missing", "—", "the operator is in Vietnam; students are minors"],
    ["gov.access",     "governance", "Access control on evidence (who may read a minor's file)", "partial", "retired 2026-09-22 (client dropped)", "the evaluator app has no gate"],
    ["gov.moderate",   "governance", "Moderation of uploaded media", "missing", "upload-plugin fileInfo API", "the API exists and is unused"],
    ["gov.disclose",   "governance", "AI-assistance disclosure to parents/schools", "missing", "—", "say plainly that a machine helped"],
    ["gov.human",      "governance", "Human sign-off required for high-stakes output", "partial", "doctrine only (Audit/DICTATOR)", "no enforced signature"],
    ["gov.tamper",     "governance", "Tamper-evident records (hash chain)", "partial", "/ledger merkle chain · src/app.js", "exists for the ledger, not for reports"],
    ["gov.dispute",    "governance", "Dispute/correction workflow (annotate, never rewrite)", "missing", "—", "'recorder not editor' applied to the record's life"],
    ["gov.asrerror",   "governance", "ASR-error awareness (never score from a low-confidence span)", "missing", "—", "a misheard word must not become a grade"],
    ["gov.selftest",   "governance", "Self-audit report on the evaluator's own behaviour", "partial", "PhoenixScout + Devil's Advocate", "run on demand, not yet scheduled"],

    /* ---- LEARNING LOOP ---- */
    ["lrn.practice",   "learning", "Practice generation from the student's own errors", "missing", "—", "evaluation that generates the next drill"],
    ["lrn.srs",        "learning", "Spaced-repetition scheduling of vocabulary", "missing", "retired 2026-09-22 (client dropped)", "cards exist without scheduling"],
    ["lrn.gap",        "learning", "Curriculum gap analysis (covered vs required)", "built", "/coverage · src/curriculum.js", "the same engine read the other way: the sections the record has no evidence of are the next lessons"],
    ["lrn.plan",       "learning", "Lesson planning derived from past evaluations", "missing", "—", "the loop closes here"],
    ["lrn.adaptive",   "learning", "Adaptive difficulty for the next lesson", "missing", "—", "no two classes need the same lesson"],
    ["lrn.peer",       "learning", "Peer / self assessment workflows", "missing", "—", "scales teacher attention"],
    ["lrn.goal",       "learning", "Goal setting + progress check-ins", "partial", "portal gameplan", "manual in the portal"],
    ["lrn.remedial",   "learning", "Remediation playbooks for stuck students", "missing", "—", "the 'what do I do now' answer"],

    /* ---- PLATFORM ---- */
    ["pl.own",         "platform", "Data ownership / self-hosting (no platform middleman)", "built", "src/cloudflare", "Cloudflare Worker + DOs, verified"],
    ["pl.mobile",      "platform", "Phone-first capture and use", "built", "responsive UI · voice dictation", "record in the room, not at a desk"],
    ["pl.queue",       "platform", "Long-job queue with progress + resume", "partial", "tunnel + part-level retry", "no general job queue"],
    ["pl.ratelimit",   "platform", "Rate limiting / abuse protection", "built", "15 sends/min · server-plugin", "per-connection"],
    ["pl.realtime",    "platform", "Realtime presence / live classroom view", "partial", "server-plugin + tunnel", "pub/sub exists, no UI"],
    ["pl.observ",      "platform", "Observability: what broke, what is slow, what it cost", "partial", "PhoenixScout probes", "no metrics history"],
    ["pl.version",     "platform", "Record schema versioning + migrations", "missing", "—", "records will outlive the code that wrote them"],
    ["pl.canary",      "platform", "Automated test/verification harness (canaries)", "missing", "—", "this inventory is checked by hand today"],
    ["pl.multitenant", "platform", "Multi-tenant (many clients, isolated)", "built", "/clients /client · src/clients.js", "clients own their students, classes, evidence, reviews; Timmy #1; legacy adopted; nothing crosses"],
    ["pl.auth",        "platform", "Identity & roles (teacher / parent / student)", "missing", "—", "the portal has PINs; the evaluator has nothing"],
    ["pl.offline",     "platform", "Offline / low-bandwidth operation", "partial", "client-side + kv", "LLM/ASR still need a network"],
    ["pl.web",         "platform", "Open-web retrieval: search + read a source, cited", "built", "/web /wiki /url · src/app.js", "grounds answers in live sources; no API key, bounded, fail-closed"]
  ];

  const PRIORITY = [
    ["ana.rubric",   "Rubrics + cited scoring", "the word 'evaluator' means this. Everything else either feeds it or reports it."],
    ["ana.student",  "Per-student attribution", "a class recording cannot honestly produce individual reviews without it."],
    ["gov.consent",  "Consent + retention register", "recording minors without a permission record is a legal problem, not a feature gap."],
    ["jud.fairness", "Fairness audit", "an unevaluated evaluator is the one failure mode that destroys the product."],
    ["gov.asrerror", "ASR-confidence gating", "never let a mis-transcribed word become a judgement."],
    ["ana.cefr",     "CEFR level tracking", "the shared language parents and schools already speak."],
    ["rep.trend",    "Term progress report", "the artifact that renews the subscription."],
    ["ops.batch",    "Batch class pass (FORMICA)", "30 students must not cost 30 sittings."]
  ];

  const STATUS_META = { built:{ c:"#4cd97b", label:"BUILT" }, partial:{ c:"#f5a623", label:"PARTIAL" }, missing:{ c:"#ff5a5a", label:"MISSING" } };

  function rows(){ return TOOLS.map(t => ({ id:t[0], family:t[1], name:t[2], status:t[3], where:t[4], note:t[5] })); }
  function coverage(){
    const out = { total:TOOLS.length, built:0, partial:0, missing:0, byFamily:{} };
    for (const k in F) out.byFamily[k] = { name:F[k].name, icon:F[k].icon, why:F[k].why, built:0, partial:0, missing:0, total:0 };
    for (const t of TOOLS){ out[t[3]]++; out.byFamily[t[1]][t[3]]++; out.byFamily[t[1]].total++; }
    out.pct = Math.round((out.built / out.total) * 100);
    return out;
  }
  function filter(q){
    q = String(q || "").trim().toLowerCase();
    if(!q) return rows();
    return rows().filter(r => r.family.indexOf(q) !== -1 || r.status.indexOf(q) !== -1 || r.id.indexOf(q) !== -1 || r.name.toLowerCase().indexOf(q) !== -1);
  }

  window.ObiEcosystem = { F, TOOLS, PRIORITY, STATUS_META, rows, coverage, filter };

  if(window.ObiScout){
    window.ObiScout.hooks.ecosystem = () => {
      const c = coverage();
      return { verdict: "INFO",
        summary: c.built + "/" + c.total + " tools built (" + c.pct + "%) · " + c.partial + " partial · " + c.missing + " missing",
        rows: Object.values(c.byFamily).map(f => [f.name.replace(/^[^ ]+ /, ""), f.built + "/" + f.total, f.missing + " missing · " + f.why]),
        cache: [] };
    };
  }
})();
