# THE FULL-STACK STUDENT EVALUATOR — what the ecosystem needs, and where this build stands

> **Status:** INVENTORY + GAP ANALYSIS (2026-09-20). 96 tools across 8 families, each marked **built / partial / missing**.
> **This file is GENERATED FROM `src/ecosystem.js`** — the app's own tool inventory is the single source of truth,
> so this map can never drift from the shipped code. Regenerate with the recipe in §6. `/tools` renders the same data live.
> Nothing here claims a capability that does not exist; `partial` means the primitive exists and the tool does not.

---

## 0. The five jobs

A student-evaluation ecosystem is not a chatbot with a transcript. Strip it to its jobs and there are five, in order:

1. **OBSERVE** the learning (capture evidence worth trusting).
2. **UNDERSTAND** it (turn raw into claims that can be checked).
3. **JUDGE** it (score, compare, and be able to defend every sentence).
4. **COMMUNICATE** it (parent, student, school, file — four audiences, four artifacts).
5. **IMPROVE** it (the judgement must change the next lesson, or the work was admin).

Everything else is scaffolding for those five. The 8 families below are the scaffolding mapped to the jobs,
plus the two things that decide whether the product may legally and honestly exist: **governance** and **platform**.

Two rules apply to every row, from the canon and from this build's doctrine:
- **verbatim-first** (L37/L55) — the raw is captured before it is interpreted and is never rewritten;
- **fail closed** — if it cannot be verified, the tool says so and stops; a documented gap beats a fabricated answer.

---

## 1. Coverage at a glance

| family | built | partial | missing | total |
|---|---|---|---|---|
| 🎙 CAPTURE — evidence in | 3 | 2 | 6 | 11 |
| 🧠 ANALYSIS — comprehension | 1 | 3 | 10 | 14 |
| ⚖ JUDGEMENT — evaluator quality | 3 | 3 | 7 | 13 |
| 📋 REPORT — communication out | 3 | 2 | 6 | 11 |
| 🗂 OPERATIONS — workflow | 5 | 2 | 6 | 13 |
| 🛡 GOVERNANCE — trust & compliance | 2 | 4 | 8 | 14 |
| 🔁 LEARNING LOOP — pedagogy | 0 | 1 | 7 | 8 |
| ⚙ PLATFORM — full-stack | 5 | 4 | 3 | 12 |
| **TOTAL** | **22** | **21** | **53** | **96** |

**22/96 built (23%) · 21 partial · 53 missing.**

Read that honestly: this build is strong exactly where it has been used (capture of long recordings,
verbatim preservation, evidence-cited reporting, archives, self-hosting) and empty exactly where the word
*evaluator* actually bites (rubrics, per-student attribution, fairness, consent, the learning loop).
The gap list **is** the roadmap.

---

## 2. The full inventory

### 🎙 CAPTURE — evidence in

_You cannot evaluate what you did not record. Every downstream claim is only as good as the capture, and capture is where a real classroom hurts: it is loud, long, multi-speaker, and mostly not typed._

| tool | status | where | note |
|---|---|---|---|
| `cap.longform` Long-form audio/video transcription (hours, not clips) | **BUILT** | `/transcribe · src/transcribe.js` | pause-split parts, resume/retry, partial saved honestly |
| `cap.diarize` Speaker diarization + speaker identity (who said what) | missing | — | without it a per-student review is inference, not evidence |
| `cap.ingest` Media ingest: file, URL, clipboard, drag-drop | **BUILT** | `/transcribe · src/transcribe.js` | picker + drop + paste + URL |
| `cap.live` Live/real-time in-room capture + live captions | missing | — | class ends, the evidence should already exist |
| `cap.photo` Photo/OCR of worksheets, essays, handwriting | missing | — | most student work never touches a keyboard |
| `cap.voiceself` Teacher voice notes / dictation | **BUILT** | `mic dictation (Web Speech) · src/app.js` | handsfree note-taking mid-lesson |
| `cap.attendance` Attendance / presence capture | missing | — | cheapest high-value signal in any classroom |
| `cap.scores` Quiz / test / exit-ticket result intake | missing | — | the objective half of the grade |
| `cap.curriculum` Syllabus / textbook TOC ingestion | missing | — | needed to judge coverage, not just activity |
| `cap.home` Home/parent input (practice logs, requests) | partial | `timmy-portal (worker)` | lives in the portal, not yet flowing into the evaluator |
| `cap.segment` Lesson/topic segmentation with timestamps | partial | `part indices · src/audio-split.js` | parts exist; topic boundaries do not |

### 🧠 ANALYSIS — comprehension

_Raw evidence is not a judgement. This family turns recordings and submissions into claims that can be checked, counted, and compared over time._

| tool | status | where | note |
|---|---|---|---|
| `ana.summary` Study summary derived from a recording, citing the raw | **BUILT** | `/summary · src/summary.js` | never replaces the transcript it came from |
| `ana.student` Per-student evidence extraction from a group recording | missing | — | the blocker for honest per-student reviews of a class |
| `ana.rubric` Rubric definition + rubric-based scoring with cited evidence | missing | — | the core evaluator instrument; everything else supports it |
| `ana.cefr` CEFR / can-do descriptors + level tracking | missing | — | the industry-standard lens for English training |
| `ana.errors` Error taxonomy (grammar/lexis/pronunciation/discourse) + frequency | missing | — | turn a transcript into a teachable list |
| `ana.vocab` Vocabulary profiling: new words, bands, retention | missing | — | measurable, motivating, cheap to compute |
| `ana.fluency` Fluency metrics: words/min, pause ratio, repairs | partial | `silence map · src/audio-split.js` | the pause map is the primitive; the metrics are unbuilt |
| `ana.pronounce` Pronunciation / phoneme assessment | missing | — | needs audio scoring, not just text |
| `ana.trend` Growth trends per student per skill over time | partial | `portal progress bars` | not in the evaluator; no term-level roll-up |
| `ana.coverage` Coverage vs syllabus: what was taught, what was skipped | missing | — | answers the parent question 'what did we pay for?' |
| `ana.authorship` Authorship/AI-origin check on submitted work | missing | — | increasingly required in schools |
| `ana.question` Comprehension question generation from the lesson | missing | — | turns evidence into the next lesson's material |
| `ana.identity` Longitudinal identity (same student across classes/aliases) | missing | — | without it growth data fractures |
| `ana.translate` Bilingual glossing / translation (EN↔VN) | partial | `flashcards in timmy-portal` | parents read in their first language |

### ⚖ JUDGEMENT — evaluator quality

_The differentiator. Any tool can generate text about a student; an evaluator must be fair, cited, calibrated, and auditable — and must fail closed when the evidence is thin._

| tool | status | where | note |
|---|---|---|---|
| `jud.evidence` Evidence-sufficiency gate (fail closed when thin) | **BUILT** | `TESTUDO gate · src/playbooks.js` | thin evidence is stated, never papered over |
| `jud.provenance` Provenance: every claim cites source + timestamp | **BUILT** | `/writeup /review · src/review.js` | the evidence list travels with the printable |
| `jud.quorum` Quorum sensing before a conclusion | **BUILT** | `src/pheromone.js` | below quorum the colony camps and asks |
| `jud.coverage` Omission audit: what was NOT observed | partial | `partial-flag on transcripts` | no systematic 'what I could not see' report |
| `jud.fairness` Fairness/bias audit (accent, gender, language, time) | missing | — | an evaluator that is not audited is not an evaluator |
| `jud.rater` Inter-rater reliability (two graders, same artifact) | missing | — | multi-agent structure makes this natural |
| `jud.calibrate` Confidence/calibration per judgement | missing | — | so you can tell a confident call from a coin flip |
| `jud.contradict` Contradiction detection across evidence sources | missing | — | two sources disagreeing is the most valuable signal |
| `jud.reasons` Adverse-action reason codes (exactly what lowered it) | missing | — | required for high-stakes decisions |
| `jud.override` Teacher override, recorded and fed back to the field | partial | `pheromone negative trail` | the primitive exists; no UI flow |
| `jud.second` Second-opinion protocol for borderline cases | partial | `Audit / DICTATOR roles` | doctrine without a workflow |
| `jud.drift` Evaluator drift detection over time | missing | — | canon has the doctrine (Ne0), not the code |
| `jud.rubricver` Versioned rubrics — every score cites its rubric version | missing | — | without it, comparability across terms is a guess |

### 📋 REPORT — communication out

_A judgement nobody understands changes nothing. This family is the parent, the student, the school, and the file — each needs a different artifact from the same evidence._

| tool | status | where | note |
|---|---|---|---|
| `rep.writeup` Class writeup (covered / how taught / notable quotes) | **BUILT** | `/writeup · src/review.js` | six sections, cited |
| `rep.review` Student review (teacher / parent / short registers) | **BUILT** | `/review · src/review.js` | same evidence machine, different voice |
| `rep.print` Printable / PDF export | **BUILT** | `🖨 Printable · src/review.js` | self-contained HTML, print to PDF |
| `rep.trend` Term/period progress report with trend | missing | — | the artifact parents actually pay for |
| `rep.student` Student-facing self-assessment + goals | missing | — | evaluation the learner owns |
| `rep.next` Actionable next-step plan (practice prescription) | partial | `manual gameplan in the portal` | should be derived from the errors |
| `rep.deliver` Delivery: email / Zalo / SMS / share link | missing | — | a report in an app nobody opens is invisible |
| `rep.meeting` Pre-meeting brief (one page before a parent call) | missing | — | cheap: it is a projection of existing evidence |
| `rep.voice` Spoken report (TTS) for parents | partial | `speak() · src/app.js` | voice output exists, not applied to reports |
| `rep.portfolio` Portfolio assembly (best work + growth narrative) | missing | — | the long-run proof of value |
| `rep.cert` Verifiable certificate / credential | missing | — | matters for adult learners |

### 🗂 OPERATIONS — workflow

_The daily machinery: rosters, filing, archives, search, batch. This is where a good tool becomes usable or dies, and where a class of thirty becomes thirty sittings._

| tool | status | where | note |
|---|---|---|---|
| `ops.roster` Students / classes / active context | **BUILT** | `/student /class · src/review.js` | the subject model |
| `ops.file` Evidence filing + attachment to a subject | **BUILT** | `/file · auto-file · src/review.js` | one recording can file under two subjects |
| `ops.notes` Dated observations | **BUILT** | `/note · src/review.js` | human judgement alongside machine evidence |
| `ops.search` Search across all evidence | **BUILT** | `/find · src/review.js` | verbatim search |
| `ops.archive` Archives with read / export / delete | **BUILT** | `/transcripts /summaries /reviews · kv` | verified button-by-button |
| `ops.schedule` Scheduling / calendar of lessons | missing | — | the portal shows a schedule; the evaluator does not know it |
| `ops.tasks` Assignment tracking (assigned → submitted → graded) | missing | — | closes the loop between lesson and evaluation |
| `ops.templates` Rubric / lesson / report template library | missing | — | consistency across teachers comes from templates |
| `ops.batch` Batch operation over a whole class | missing | `FORMICA playbook (doctrine only)` | 30 students must not mean 30 manual passes |
| `ops.team` Multi-teacher accounts + permissions | missing | — | a school is not one login |
| `ops.interop` Import/export: CSV, LTI, OneRoster, gradebook | missing | — | schools live on other systems |
| `ops.backup` Backup / restore / portability | partial | `kv + /ilog push + /gh backup + JSON export` | one authority repo, gated (`/omega`); no restore path |
| `ops.cost` Cost & quota governance per class/term | partial | `playbook supply gauge` | counts commands, not real tokens |

### 🛡 GOVERNANCE — trust & compliance

_The students are minors and the recordings are of children. Consent, retention, residency, access, dispute, and ASR-error handling are not features — they are the licence to operate._

| tool | status | where | note |
|---|---|---|---|
| `gov.verbatim` Verbatim-capture-first; raw preserved untouched | **BUILT** | `ledger + RRL · src/app.js (L37/L55)` | the non-negotiable one |
| `gov.chain` Provenance chain raw → derived → report | **BUILT** | `summary/review refs · src/review.js` | every derived artifact points back |
| `gov.consent` Recording consent register (parent/guardian, minors) | missing | — | legally required before you record a child |
| `gov.retention` Retention policy + scheduled deletion | missing | — | how long may a child's recording live? |
| `gov.pii` PII minimisation / redaction in transcripts | missing | — | names, addresses, faces |
| `gov.residency` Data residency / localisation (VN PDPD) | missing | — | the operator is in Vietnam; students are minors |
| `gov.access` Access control on evidence (who may read a minor's file) | partial | `PIN in timmy-portal` | the evaluator app has no gate |
| `gov.moderate` Moderation of uploaded media | missing | `upload-plugin fileInfo API` | the API exists and is unused |
| `gov.disclose` AI-assistance disclosure to parents/schools | missing | — | say plainly that a machine helped |
| `gov.human` Human sign-off required for high-stakes output | partial | `doctrine only (Audit/DICTATOR)` | no enforced signature |
| `gov.tamper` Tamper-evident records (hash chain) | partial | `/ilog` (sha-256 chain + Git anchors) · `src/ilog.js` | the operation record and every export are covered; anchored only once pushed |
| `gov.dispute` Dispute/correction workflow (annotate, never rewrite) | missing | — | 'recorder not editor' applied to the record's life |
| `gov.asrerror` ASR-error awareness (never score from a low-confidence span) | missing | — | a misheard word must not become a grade |
| `gov.selftest` Self-audit report on the evaluator's own behaviour | partial | `PhoenixScout + Devil's Advocate` | run on demand, not yet scheduled |

### 🔁 LEARNING LOOP — pedagogy

_Evaluation that does not change the next lesson is administration. This family closes the loop: errors become drills, gaps become plans, progress becomes difficulty._

| tool | status | where | note |
|---|---|---|---|
| `lrn.practice` Practice generation from the student's own errors | missing | — | evaluation that generates the next drill |
| `lrn.srs` Spaced-repetition scheduling of vocabulary | missing | `flashcards in timmy-portal` | cards exist without scheduling |
| `lrn.gap` Curriculum gap analysis (covered vs required) | missing | — | what the class still needs |
| `lrn.plan` Lesson planning derived from past evaluations | missing | — | the loop closes here |
| `lrn.adaptive` Adaptive difficulty for the next lesson | missing | — | no two classes need the same lesson |
| `lrn.peer` Peer / self assessment workflows | missing | — | scales teacher attention |
| `lrn.goal` Goal setting + progress check-ins | partial | `portal gameplan` | manual in the portal |
| `lrn.remedial` Remediation playbooks for stuck students | missing | — | the 'what do I do now' answer |

### ⚙ PLATFORM — full-stack

_Ownership, mobile capture, queueing, rate limits, tenancy, schema versioning, cost, and a way to verify any of it. Invisible when right, fatal when wrong._

| tool | status | where | note |
|---|---|---|---|
| `pl.own` Data ownership / self-hosting (no platform middleman) | **BUILT** | `src/cloudflare` | Cloudflare Worker + DOs, verified |
| `pl.mobile` Phone-first capture and use | **BUILT** | `responsive UI · voice dictation` | record in the room, not at a desk |
| `pl.queue` Long-job queue with progress + resume | partial | `tunnel + part-level retry` | no general job queue |
| `pl.ratelimit` Rate limiting / abuse protection | **BUILT** | `15 sends/min · server-plugin` | per-connection |
| `pl.realtime` Realtime presence / live classroom view | partial | `server-plugin + tunnel` | pub/sub exists, no UI |
| `pl.observ` Observability: what broke, what is slow, what it cost | partial | `PhoenixScout probes` | no metrics history |
| `pl.version` Record schema versioning + migrations | missing | — | records will outlive the code that wrote them |
| `pl.canary` Automated test/verification harness (canaries) | missing | — | this inventory is checked by hand today |
| `pl.multitenant` Multi-tenant (many clients, isolated) | **BUILT** | `/clients /client · src/clients.js` | clients own their students, classes, evidence, reviews; Timmy #1; legacy adopted; nothing crosses |
| `pl.auth` Identity & roles (teacher / parent / student) | missing | — | the portal has PINs; the evaluator has nothing |
| `pl.offline` Offline / low-bandwidth operation | partial | `client-side + kv` | LLM/ASR still need a network |
| `pl.web` Open-web retrieval: search + read a source, cited | **BUILT** | `/web /wiki /url · src/app.js` | grounds answers in live sources; no API key, bounded, fail-closed |

---

## 3. The priority queue (what to build next, and why)

Ranked by (value for this exact product) × (how much of the rest of the map it unblocks).

| # | tool | why it is here |
|---|---|---|
| 1 | **Rubric definition + rubric-based scoring with cited evidence** (`ana.rubric`) | the word 'evaluator' means this. Everything else either feeds it or reports it. |
| 2 | **Per-student evidence extraction from a group recording** (`ana.student`) | a class recording cannot honestly produce individual reviews without it. |
| 3 | **Recording consent register (parent/guardian, minors)** (`gov.consent`) | recording minors without a permission record is a legal problem, not a feature gap. |
| 4 | **Fairness/bias audit (accent, gender, language, time)** (`jud.fairness`) | an unevaluated evaluator is the one failure mode that destroys the product. |
| 5 | **ASR-error awareness (never score from a low-confidence span)** (`gov.asrerror`) | never let a mis-transcribed word become a judgement. |
| 6 | **CEFR / can-do descriptors + level tracking** (`ana.cefr`) | the shared language parents and schools already speak. |
| 7 | **Term/period progress report with trend** (`rep.trend`) | the artifact that renews the subscription. |
| 8 | **Batch operation over a whole class** (`ops.batch`) | 30 students must not cost 30 sittings. |

### The three that are structural

1. **Rubrics + cited scoring (`ana.rubric`).** Without a rubric there is no evaluator, only a summarizer.
   The evidence machine already produces citations; the missing half is a rubric object (criteria, levels,
   descriptors) and a scoring pass that must attach a quote + timestamp to every criterion it scores.
   Every report format, every trend, every fairness check then has something concrete to stand on.
2. **Per-student attribution (`ana.student`).** One class recording is currently one undifferentiated mass of
   text. Without diarization (or time-coded manual attribution) a per-student review is inference dressed as
   evidence — which is exactly what the doctrine forbids. This is the biggest honesty gap in the product as it stands.
3. **Consent + retention (`gov.consent`, `gov.retention`).** Recording children requires a permission record and
   an agreed lifetime for the recording. Neither exists. Until they do, scale is not a growth decision, it is a liability.

Two more deserve their own line because they are cheap and they protect everything else:
**ASR-confidence gating (`gov.asrerror`)** — never let a mis-transcribed word become a judgement, and
**fairness audit (`jud.fairness`)** — an evaluator that is not audited is the one failure mode that ends the product.

---

## 4. How this maps onto Agent 99 OS

The ecosystem is the *content*; `src/AGENT99-OS.md` is the *machinery*. The mapping is direct:

| ecosystem need | OS mechanism |
|---|---|
| evidence-mandatory judgements | **TESTUDO** playbook — optio shield + quorum + speculatores-first |
| batch evaluation of a whole class | **FORMICA** playbook — response thresholds, quorum per batch |
| checkpointed long jobs (a 3-hour lesson) | **CASTRA** playbook — fortify before marching; parts + resume |
| supply/cost per class and term | FRUMENTARIA supply gauge (per-day counts today, tokens tomorrow) |
| high-stakes or disputed output | **DICTATOR** — timed authority, mandatory Audit rollback + account |
| provenance and omission auditing | pheromone trails (`canon:`, `target:`, `src:`) + the scout's evidence rows |
| teacher override of a machine judgement | negative trail on the route + `drone:` trust, already wired |

New drones this map implies (none of them built yet): **Diarize**, **Rubric**, **CEFR**, **Trend**, **Consent**,
**FairAudit**, **PracticeGen**, **Batch**. Each is a specialist with a threshold, not a new app.

---

## 5. What is verified about the built rows

Every `built` row above was exercised live in the shipped generator (2026-09-19/20): transcripts with
part-level retry and honest partial saves; summaries that cite their raw; writeups and reviews with
printable exports; rosters, filing, notes, search, archives — including **every button** on every card
(read/parts/txt/srt/chat/del, show/md/txt/html/del, select/write/del, claim/complete/fail) clicked and
confirmed, with the destructive and LLM-running ones verified as wired and deliberately not fired.
The OS rows (`jud.evidence`, `jud.provenance`, `jud.quorum`) were verified by holding a real order until a
recon trail existed, and by routing a real command through the live tunnel.

---

## 6. Regenerating this file

The inventory is data in `src/ecosystem.js` (`TOOLS` rows: `[id, family, name, status, where, note]`,
plus `PRIORITY`). To regenerate this document, parse that array (acorn) and re-emit the tables above —
or simply run `/tools` in the app for the live version, and `/tools <family|status>` to drill in.
Update a row's status only when the code that earns it ships.
