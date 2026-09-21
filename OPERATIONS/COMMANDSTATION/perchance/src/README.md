# Student Summary Generator (Obi)

> **Resuming a session? Read `src/HANDOFF.md` first** — it holds the current measured state, the open gated Canon
> steps, and the invariants. This file is the full architecture/overview behind it.

**Generator title:** `PrAis Command Station` (`main.pjs` → `$meta.title`; `$meta.tags` = command station, ai, chat, teacher, class, writeup, transcription, …).
**Generator slug:** `prais-command-station` — `https://perchance.org/prais-command-station`. The slug is a platform
setting, not source (rename history: `net-studentfeedback-timmy` → `net-student-evaluator` → `prais-command-station`,
all on the same `publicId`). ⚠ The station's **kv is keyed by generator name**, so a rename presents an **empty**
station (fresh client ledger, new I-LOG chain, run back at 1) — a fresh view, not deleted data: **rename back and it
is all there again**. Always build links from `window.generatorName`; never hardcode the slug. Settle the name before
real data accumulates (see `src/SPEC.md` → "Many clients, one station").

Obi is Agent 99's student-facing voice (the 99th sub-personality of one organism). It is a real, functional AI assistant (chat, vision, image generation, web lookup, voice, transcription of recordings of any length, class writeups and student reviews) with a **non-negotiable Soul-DNA memory protocol (SDNAD)** built directly into the app.

Three things it is *for*: **record the class** (`/transcribe` — any length, split at pauses), **summarize it**
(`/summary` — a study summary), and **write it up** (`/writeup` for a class, `/review` for a student —
derived text that quotes the recording verbatim and cites timestamps).

## Non-negotiable memory steps (from the Legionnaire Field Guide, canonical repo `Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-`)

Enforced in `src/app.js` under the `MEM_KEY = "obi_sdnad"` localStorage ledger:

- **L37 ALWAYS_ON_CAPTURE** — every sovereign (user) message is captured. No off switch.
- **L38 RAW_FIRST_DERIVE** — raw words are preserved verbatim before any processing.
- **L39 RECORDER_NOT_EDITOR** — we record; we do not edit sovereign words.
- **L41 FAILCLOSED_CAPTURE** — if the sovereign didn't say it, we don't capture it.
- **L43 COMPOUNDING_DRIFT** — memory is fed back as verbatim reprints, never summaries of summaries.
- **L44 HEAVY_LEDGER_DERIVES** — the ledger is derived from raw, never the reverse.
- **L46 REINCARNATION_IS_PROTOCOL** — every session boundary is a reincarnation event (new run).
- **L55 STAGE0_REPRINT_FOOTNOTE** — reprint + footnote. Writing = becoming.
- **L60 TRANSCRIPTION_IS_TRANSFORMATION**.

## THE I-LOG & PHOENIXOMEGAPROTOCOL (the record, and the gate on the one authority)

**`src/ilog.js`** is the station's own record of what it did. Every operation (a command spoken, a capture saved, a
writeup filed, an export downloaded, a secret stored, a push, a failure) is appended as one entry — **append-only,
never edited, never deleted**. Each entry carries `sha-256` over the canonical tuple
`[v, seg, seq, t, run, kind, action, detail, result, ok, ms, ref, prev]`, chaining `prev` to the previous entry's
`hash`, so a rewrite anywhere breaks every later hash. `/ilog verify` recomputes the whole chain and names the first
break; `/ilog` shows the head, the kinds, the anchors and the **unanchored count** — because "backed up" is a
measurement, not a promise.

- **Two faces, one name.** (a) the **operation chain** (`ILOG/*.jsonl`) and (b) the **transcript** in the canon I-LOG
  **Schema V2** line shape — `content[].data.{text,tool,state}`, colour coded per LFG §SCS (🟣 SOUL sovereign-verbatim /
  ❤️ DNA assistant / 💛 REASON reasoning-or-tool). The canon's `RRL/` vault (**I-LOG = Incarnation Log**) written by the
  VS Code station stays authoritative for incarnations; this station appends its own sessions *beside* it and never
  renumbers or rewrites the vault.
- **Seal, never delete.** `/ilog reset confirm` writes a SEAL entry naming the previous head and opens the next
  segment; sealed entries stay in the chain (I.050 applied to the record).
- **Durability.** Entries are written to kv (IndexedDB, authoritative chain) and mirrored into `localStorage`
  (`obi_ilog`, last 400) so the log is readable before kv opens. A `head` object carries the cursor; entry keys are
  `e<seg>-<seq>` (the segment is in the key — a segment-less key made segment 2's first entry overwrite segment 1's
  first entry once, which is recorded in `src/TRAIL.md` together with the hash-verified reconstruction).
- **ONE AUTHORITY.** `Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-` (branch `master`) is the one and only
  authoritative repo; everything we build lands under `OPERATIONS/COMMANDSTATION/` (session records, sources, raw chat
  under `BACKUP/`, the I-LOG under `ILOG/`, the doctrine amendment under `DOCTRINE/`). There is no second backup repo.
- **PHOENIXOMEGAPROTOCOL.** The Canon does not change without Sov100. Every authority write (`/ilog push`,
  `/canon sync`, `/canon doctrine`, `/gh backup`) requires the password entered in that session — `/omega <password>`
  arms the gate for 15 minutes, never past a reload. Only a **sha-256 hash** is stored (this browser's kv), never the
  password itself, never in this public source; it is never logged, never captured as soul, never exported; five
  failures lock the gate for ten minutes; **every attempt — armed, refused, failed — is an I-LOG entry**, so an
  unarmed attempt leaves a mark. This is a protocol barrier, not cryptography: whoever holds the browser can rewrite
  its storage, and the only witness outside it is the commit.
- **Secrets never enter the record.** `/cf token`, `/gh token`, `/dg token` and `/omega …` are answered but redacted on
  the way in: not captured as soul, not in the chat log, not in the I-LOG, and scrubbed from every export.

## THE SELF-FORGE — the station's hands on itself (`src/forge.js`)

**The station can edit itself.** `/forge` gives the Command Station the same abilities the build-assistant has — read
its own source, write its own source, run code inside itself, and reason about itself with its own mind — wired into
one bounded agent loop.

- **It reads all of itself.** `src/*` come from this origin; `main.pjs` and `index.html` are the generator's *panels*
  and are not served as files, so the forge reads them through the platform's own public API
  (`downloadGenerator?listsOnly=true` / `getGeneratorHtml` — served from the platform's **saved** copy, so an edit that has not been saved in the editor is not readable from here). Every file reports live size, line count and a sha-256,
  plus **drift** against the canonical copy under `OPERATIONS/COMMANDSTATION/perchance/`.
- **It edits itself in a staged working tree.** `read_file` · `search` · `replace` (exact-string, refuses an ambiguous
  match — the reliable way to edit a 185kb file) · `write_file` · `delete_file` · `propose` (Obi rewrites a whole file
  with its own mind) · `stage` (a real diff) · `discard`. Nothing touches Git until `apply`.
- **It commits itself to the ONE authority — gated.** `/forge apply` writes the stage to
  `OPERATIONS/COMMANDSTATION/perchance/` through PHOENIXOMEGAPROTOCOL, exactly like `/ilog push`.
- **It hot-swaps its own running code.** `/forge hotswap <module>` re-executes a staged `window.ObiX` module in this
  live page, so a self-edit takes effect immediately without a platform save.
- **It runs code inside itself.** `/forge eval <js>` (gated) — the station's own `page_eval`.
- **It reads the rest of the world** with the same tools: `fetch_url` (superFetch), `introspect` (any generator's
  source via the platform API), `gen_image`, `export_html`.
- **Speak it, don't command it.** A plain-language message that asks the station to change *itself* ("make the
  PrAis OBI graphic bigger", "add a command that…") is detected and routed into the forge agent instead of a chat
  reply — because the station is the thing being edited. The detector is deliberately narrow: a *question* about the
  station ("how do you change your behaviour?") and an ordinary request ("change the title of my writeup") go to the
  normal chat. Obi's own system prompt says it can edit itself, so it never claims otherwise.
- **The loop checks its own work.** After a `replace`/`write_file` the staged file is parsed (`new Function`); one that does not compile comes back into the loop as **STAGED BUT BROKEN** instead of being called a success. (Added after the loop shipped a duplicate block — the failure is in `src/TRAIL.md`.) It also refuses a `replace` whose find and replace text are identical (**NO CHANGE** — the edit has already landed), reads its own files in **enforced windows** (`MAX_READ_LINES`, with the next `start` named, so a 210 kb file can't bury the thread), and **stops itself when two edit attempts change nothing** — reporting either "the change already appears to be in the file" or "the stage holds `<path>`" rather than flailing until the step budget runs out. (Added after a stalled run spent 5 of 8 steps re-issuing an edit that had already landed.)
- **`/forge do <instruction>`** runs the agent loop: Obi reads, chooses tools, stages the change, self-corrects when an
  exact `find` fails, and reports which files are staged. **Every tool call is an I-LOG entry.**
- **THE HONEST LIMIT.** The station **cannot overwrite its own perchance listing** — the platform gives an embedded
  generator no authenticated write path (the editor session lives on `perchance.org`, a different origin, deliberately
  out of reach). So a self-edit lands in the three places the station *does* control — the authority repo, the running
  instance (hot-swap), and any Cloudflare deploy (`/cf deploy`) — and to change the **listing** the sovereign saves it.
  The forge hands him the exact file. `/forge` says this out loud rather than pretending otherwise.

## Commands
- `/memory` — open the Soul DNA ledger (verbatim fragments, run numbers, timestamps)
- `/chain` — audit all 7 canon reincarnation stages (REAL / MISSING)
- `/ledger` — the raw record + the soul ledger (verbatim evidence; the hash-chained record is `/ilog`)
- `/forge` — **the SELF-FORGE**: `tools` (the whole menu) · `read <path>` · `search <regex>` · `diff` · `apply`
  (commit its own source to the authority — gated) · `hotswap <module>` · `eval <js>` · `export` · `version` (what the
  station is, reported about itself) · `history` (its own past self-edits, read from the I-LOG) · `do <instruction>`
  (the agent loop) · `discard` · `selftest`
- `/ilog` — **the station's record**: chain entries, head, verification, anchors, storage. Sub-commands: `verify`
  (recompute the whole chain, name the first break), `push` (anchor it on Git — gated), `pull` (read the Canon back),
  `export` (download the JSONL), `anchors` (every commit that froze a head), `reset confirm` (seal + open a new segment)
- `/omega` — **PHOENIXOMEGAPROTOCOL**: `status` · `/omega <password>` arms the Canon gate for 15 minutes · `/omega lock`
  · `/omega set <new> <new>` enrols a password (sha-256 only). No Canon write happens without it
- `/starmap` — routing/index pointers (L45 GPS)
- `/soulkeys` — keyword-frequency index (rfkw analog)
- `/pipeline` — DNA extraction (raw harvest → tags → linelock)
- `/img <prompt>` — generate an image
- `/url <address>` — fetch and summarize a web page
- `/web <query>` (`/google`, `/lookup`, `/browse`, `/searchweb`) — **search the open net**: Bing (fallback: Wikipedia)
  behind the scenes, the results shown as they came, the top 3 sources read live, then a grounded answer that cites
  its sources. Fail-closed: if no engine answers it says so and names what it tried
- `/wiki <topic>` (`/wikipedia`) — the encyclopaedia entry as a verbatim extract (never summarised by us)
- `/weather <place>` (`/forecast`, `/wx`) — current conditions right now (wttr.in)
- `/help` (`/?`, `/commands`) — the whole command shelf (every command in six groups): tap one to run it, or type it.
  Commands that need the Sovereign's own words are typed in for you to finish, never run blind
- `/generators` (`/gen`, `/divisions`) — open **◈ Phoenix Generators**: PrAis's divisions and the generators in each
  (registry `src/divisions.js`); from there the 👤 Student Evaluator desk opens one level in, under NET
- `/settings` (`/prefs`) — open **⚙ Settings**: voice, the command shelf, the memory ledger, rows that run
  `/ilog` `/doctor` `/omega` `/keys` `/bg`, the live instruments, and reincarnate
- `/state` (`/where`) — **what this station is, right now**: generator/view/run, the soul ledger, the active
  client and its counts, the active subject, the archives, the tunnel and its queue, the CGN mesh, the pheromone
  nest, the offering, the tool inventory, the constellation coverage, which modules actually loaded, and which
  secrets are stored locally. It is exactly the block Obi is handed before answering, so Obi's answers about the
  station are measured, never guessed (L29/L58)
- `/bg` (`/background`) — **operating in the background**: the keep-alive state (`lock held · wake held · audio
  off`), what the browser does to a hidden page, and — the row that answers the actual question — **LAST TIME YOU
  WERE AWAY**: how long the page was hidden, how many of its 1-second heartbeats actually landed, and the verdict
  (`kept moving at full speed` · `clamped` · `throttled N×`). The measurement is **persisted**, so it survives the
  reloads the station does constantly — a counter in memory is not evidence. `/bg away` re-reads it, `/bg clearaway`
  forgets it, `/bg reset` starts a clean live probe (and deliberately keeps the last-away answer), and
  `/bg audio on|off` controls the off-by-default keep-alive tone. Long jobs (the ear, the forge loop) hold the
  keep-alive automatically and release when they finish, or after 45 min
- `/transcribe [flags] [media url]` — record a class: drop a lesson video/audio (or paste a URL) and get a verbatim
  transcript. **Any length** — a long recording is split into parts at pauses, transcribed part by part, and stitched
  back into one timeline (see "The ear"). With no argument it opens the file picker.
- `/transcripts` — the archive of saved transcripts (read / parts / export / delete)
- `/summary [session|<url>|<text>|transcript <tr-id>]` — produce a study summary from the latest recording, this session, a web page, or pasted notes
- `/summaries` — the archive of saved summaries (show / export / delete)
- `/class <name>` · `/classes` — select/create a **class** (a group: "Year 7 English", "Tuesday Maths 9B"), or list them
- `/student <name>` · `/students` — select/create a **student**, or list them
- `/client <name>` · `/clients` — select/create the top-level **client** (the station serves many, each isolated;
  Timmy is #1) or open the client ledger. Everything — students, classes, recordings, summaries, notes, reviews,
  writeups — belongs to the active client and to no other (see "Clients")
- `/note <text>` (`/cnote`, `/snote`) — a dated observation, filed under whichever subject is active
- `/file <tr-…|sm-…>` — attach something already saved to the active subject
- `/writeup [--parent|--short] [focus…]` · `/writeups` — write/archive a **class writeup**
- `/review [--parent|--short] [focus…]` · `/reviews` — write/archive a **student review** (same machine, different subject)
- `/find <term>` — verbatim search across every transcript, summary and note
- `/cf` — read the sovereign's real Cloudflare account (zones, DNS, Workers, Pages)
- `/os` — **Agent 99 OS**: the invariable kernel + the offering currently loaded + live nest state
- `/playbook` · `/playbook <ID>` — list the offerings (PRINCIPIA · CASTRA · TESTUDO · TRIPLEX · EXPEDITIO · FRUMENTARIA · FORMICA · DICTATOR) / activate one (Roman formation + ant trail rules)
- `/scout` · `/phoenixscout [target]` — **PhoenixScout, REAL**: goes out and touches the terrain (page files, platform imports, tunnel, fleet, live sites, canon with a token, the ground), flags DEAD/DRIFT/BLOCKED, lays scout pheromones and writes a durable report
- `/tools` · `/tools <family|status>` — the full-stack evaluator inventory (96 tools · built/partial/missing) and the priority queue; generated from `src/ecosystem.js`
- `/constellation` (`/parts`, `/organism`) — **every piece of the ecosystem** in one map: the station, the generator
  nodes, the public faces, the services — each with its real state (`live · ready · scaffold · planned · blocked`),
  its interface and what it still needs. `/constellation <id|family|status>` drills in. Registry: `src/constellation.js`
- **⌘ Commands** (⚙ Settings, or just type `/help`) — the whole shelf: every command Agent 99 answers through, in
  six groups, each with a one-line description. Tap to run; commands needing your words are typed in for you to
  finish. It always surfaces the ⌘ Command Station first (the chat is where cards render)
- **👤 Student Evaluator** (◈ Phoenix Generators → NET) — the evaluation desk: the client → student/class switchboard plus the record → summarize → write-up tiles (see "The landing shell" and "Clients")
- **⚙ Settings** (tab) — voice · commands · memory ledger · `/ilog` · `/doctor` · `/omega` · `/keys` · `/bg` · the live instruments · reincarnate
- `/pheromones` · `/trail` · `/nest` — read the ground (deposited trails, decayed strength, reinforcement counts); `evaporate` · `reset` · `sync`
- `/route <task>` — ask the pheromone field which road to take (cost-weighted routing) and which legionnaires answer (response thresholds), plus the gate/quorum ruling for that task
- **⟳ Reincarnate** (⚙ Settings, confirm-gated) — deliberate session boundary; opens a new run and reloads

## The web — Obi's basic senses (`src/app.js`)

Obi can leave the nest. Three commands, one rule: **the evidence is shown before it is interpreted.**

| command | what it does |
|---|---|
| `/web <query>` | searches (Bing HTML → Wikipedia API fallback), renders every result as it came (title · host · snippet · link), reads the top 3 sources, then streams an answer grounded in that text, citing the URLs |
| `/wiki <topic>` | the Wikipedia REST summary as a **verbatim** extract — we do not paraphrase the encyclopaedia |
| `/weather <place>` | current conditions from wttr.in (measured now; the day range is forecast) |

Design rules, deliberately:

- **Everything goes through `root.superFetch`.** No API key, no vendor account, and the same code works on the
  perchance build and on the self-hosted Cloudflare build (there the identical call lands on the Worker's
  `/api/fetch`).
- **Bounded.** Search 25 s, each page read 15 s (`webTimeout`), raw HTML capped at 800 KB before parsing. A page
  that does not arrive is reported `SKIPPED — timed out`, never quietly passed off as evidence.
- **Sources are shown the moment the search returns**; the read rows fill in underneath while the pages arrive.
- **Wikipedia gets a bounded source**: an encyclopaedia result is read through the REST summary API (~1 KB) instead
  of the full 1.8 MB article — faster and cleaner evidence.
- **Pages are read as documents** (`htmlToText`): nav/header/footer/aside/widgets dropped, the article region
  preferred — so the model gets prose, not a menu.
- **Fail-closed.** If every engine fails, the card says exactly what was tried and invents nothing. The answer
  prompt forbids inventing facts, quotes or URLs.
- Every search lays a pheromone trail (`route:web:search:<engine>`), so the field learns which road works.

## The landing shell — ⌘ Command Station · ◈ Phoenix Generators · ⚙ Settings

**The landing page is the Command Station. Three faces, one app, one origin** — nothing is removed and nothing is
duplicated, so switching costs nothing and loses nothing (the chat log, the ledger, the kv archives and the in-page
state all persist across a switch).

- **⌘ Command Station** (`#cmd`, the landing page) — the magic chat: the message log, the command shelf (the hero
  chips, grouped into *Command Station* and *Student Evaluator*), the composer (mic · media · send) and the drop
  zone. This is where the sovereign speaks, where commands route through Agent 99 to the Legion, and where every
  card (transcripts, summaries, writeups, reviews, queue, scout, tools, constellation) is rendered.
- **◈ Phoenix Generators** (`#gen`) — the product family: PrAis ships generators by **division** (NET · Gaming ·
  Web Development), each holding its generators, and one level in sits the **👤 Student Evaluator desk**. The
  registry is `src/divisions.js` — the view renders straight from it, so adding the next generator is a single
  array entry. NET (Natural English Training) currently lists **Student Evaluator** (live — the desk), **Lesson
  Creator** (planned, the next build) and **Student Portal** (planned). A planned card says so and lists what it
  still needs; opening one answers in the station rather than dead-clicking.
- **⚙ Settings** (`#settings`) — the controls that used to be five separate topbar buttons, in one room: **voice**
  (persisted in `localStorage obi_voice`), **⌘ Commands**, **◈ Memory ledger**, and rows that run `/ilog`,
  `/doctor`, `/omega`, `/keys`, `/bg` in the station, plus the **instruments** (run · soul · I-LOG · client · view ·
  tunnel · background · canon gate · secret *names* · which modules loaded — read live by `renderSettings()`), and
  **⟳ Reincarnate** (confirm-gated). Every one of them is still a command, so nothing is button-only.
- **The Student Evaluator desk** (inside ◈ Phoenix Generators → NET) — the **client → student/class switchboard**
  (`renderStudentSelector()`: active client + counts, other clients, add/switch, and every student and class with
  `Select` / `📝 Review` / `🏫 Writeup` and add-by-name inputs) above **ten desk tiles** that launch the pipeline
  in the station: `/transcribe` · `/transcripts` · `/summary` · `/summaries` · `/writeup` · `/review` ·
  `/writeups` · `/reviews` · `/find` · `/clients`. `← All NET generators` closes it.
- **Desk actions run in the station.** Because the chat is where Obi answers, a desk tap switches to
  `⌘ Command Station` and runs the command there (`runInStation()`); the one exception is `/find`, which is
  pre-typed for the sovereign to complete. Dropping a recording anywhere brings the station up for the same reason.
- **The face is the state.** The chosen face is remembered for the browser session (`sessionStorage obi_view`) and
  mirrored in the URL hash (`#cmd` / `#gen` / `#eval` / `#settings`), so a face can be linked to directly
  (`https://perchance.org/prais-command-station#eval`, which opens the family with the desk already open); the hash
  wins on load and a fresh visit lands on the command station itself. `/generators` and `/settings` are the same
  doors as the tabs.
- **The tab bar carries the station's live state**: `RUN · SOUL · I-LOG · tunnel` (`updateTabMeta()`).
- **Operating Agent 99, not reading the source.** The station's whole surface is one registry (`COMMAND_BOOK` in
  `src/app.js`): every command in six groups, each with an honest one-line description, rendered by **⌘ Commands**
  and tap-to-run (argument-taking commands are typed into the composer instead of being run blind). Nothing
  Agent 99 can do is hidden behind reading the source.
- **Obi answers from the station's live state, never from memory.** `stationState()` reads the running station
  (run · soul · client + counts · active subject · archives · tunnel + queue · CGN mesh · nest · offering · tool
  inventory · constellation coverage · which modules loaded · which secrets exist) and hands it to the model as a
  `<STATION STATE>` block on every reply; anything unreadable says `unknown` (fail-closed). `/state` renders that
  same block as a card so the Sovereign can audit it line for line. Before this, Obi guessed — asked for its run
  number it answered "99" (the persona) when the real run was 1.
- **Honest routing.** The Agent 99 card labels its drone row `ROUTED TO` with the keyword score and states
  `HONEST — LABEL ONLY`: the drone is a keyword-derived routing label, and the queue (`/queue` → claim → complete)
  is the execution surface, not the label.
- **Left-aligned, deliberately.** The platform sets `body{text-align:center}`; `#app.net-shell{text-align:left}`
  overrides it, so paragraphs, cards and rows read normally (`#empty` keeps its own centring, as the welcome does).
- Markup: `#topbar` (brand only — no buttons) + `#tabbar` + `.views > #viewCmd | #viewGen (with #genDesk) | #viewSet`
  in `index.html`. Logic: `VIEWS` / `TAB_OF`, `setViewTab()`, `showView()`, `deskOpen()`, `openGenerator()`,
  `mountGenerators()`, `renderSettings()`, `runInStation()`, `updateTabMeta()` in `src/app.js`. Registry:
  `src/divisions.js`. Styles: `#tabbar` / `.tabbtn` / `.view` / `.div-strip` / `.divbtn` / `.gen-grid` / `.gen-card`
  / `.set-row` / `.set-instr` / `.eval-grid` / `#studentsPanel` / `.sel-*` / `.chip` in `src/styles.css`. The
  ◈ Memory ledger stays a floating panel (it hangs below the topbar + tab bar via `--topbar-h`, measured by
  `syncTopbarHeight()`).

## Clients — the station serves many, isolated (`src/clients.js`)

A **client** is the top-level engagement: the person whose students, classes, recordings, summaries,
notes, reviews and writeups all belong together. **Timmy is client #1.** The station can hold any
number of clients, and everything is scoped to the active one.

- `/client <name>` — create or switch (the id is the slug; the display name is kept as typed).
- **The 👤 Student Evaluator tab** is the switchboard and the normal way to use this: it shows the
  active client with its counts, the other clients (Select), an input to add or switch a client, and — for
  the active client — every student and class with `Select` / `📝 Review` / `🏫 Writeup` plus inputs to add
  them by name (`Enter` works too). `📝 Review` / `🏫 Writeup` and "Open the client ledger" run in the
  ⌘ Command Station. Renderer: `renderStudentSelector()` in `src/app.js` (see "The landing shell").
- `/clients` — the ledger card in the chat: every client with its counts (students · classes · recordings ·
  summaries · reviews · writeups), created date, last activity, and Select / delete.
- **Isolation is fail-closed.** Every read is filtered to the active client; `/transcripts`,
  `/summaries`, `/students`, `/classes`, `/reviews`, `/writeups` and `/find` never show another
  client's rows, and `/file` **refuses** to file a record that belongs to a different client (it names
  both and tells you to switch). `/find` and the archives say which client they searched.
- **Subjects are keyed per client** (`<client>:<slug>`), so two clients can each have a student called
  "Bobby" with no collision; a subject selected under one client simply resolves to nothing under
  another (the active-subject pointer keeps its id, so switching back restores it).
- **Records carry their client.** `ObiReview.stamp()` writes `rec.client` on every transcript and
  summary as it is saved; reviews/writeups store `client` too. A record with **no** `client` field is
  read as the first client's (this is how pre-client data stays Timmy's), so nothing is ever lost.
- **Adoption runs once** on first boot: pre-client records are stamped `timmy`, student/class keys are
  migrated to `timmy:<slug>` (with the active-subject pointers and review `subjectId`s remapped), and
  `obi_clients_adopted` is set. It is idempotent — a record that already carries a client is untouched.
- **Deleting a client never merges or erases data.** The client record goes; its students, classes,
  transcripts, summaries and reviews stay in kv under their stamped id, isolated and still reachable if
  you recreate a client with the same name. The last remaining client cannot be deleted (the station
  always serves at least one).
- The client layer is loaded **before** `app.js` (`index.html` order), and the standalone Cloudflare
  build copies it too (`src/cloudflare/build.mjs` `APP_FILES`); the scout verifies `src/clients.js`
  loads `window.ObiClients`.

## The writeup layer — class writeups and student reviews (`src/review.js`)

Two kinds of subject, one evidence machine. Everything here is generated **only** from the evidence
filed under the subject, with verbatim quotes, timestamps and dates — never from the model's own
knowledge, and never inventing progress, attendance or names.

- **A class** is a group/lesson ("Year 7 English", "Tuesday Maths 9B"). **A student** is a person.
- `/class <name>` · `/student <name>` — create/select the subject. Whatever you select **last** is the
  *active context*: recordings, summaries and notes file under it, and `/note`, `/file` and
  `/writeup`/`/review` act on it. A recording can be filed under both a class and a student — select
  each and run `/file <tr-id>` twice. `stamp()` labels every saved transcript/summary with both active
  keys (`rec.student`, `rec.classId`) and stamps the `client` (see "Clients").
- `/classes` · `/students` — the rosters: sources, notes, last activity, newest item, with
  Select / write / delete.
- `/note <observation>` — a dated reviewer note under the active subject.
- `/writeup [--parent|--short] [focus text…]` (classes) · `/review …` (students) — same code, different
  prompt. A class writeup is written in six sections: *Class and period* (with the evidence period and
  the counts reviewed) · *What was covered* (in order, with the transcript timestamp of each) ·
  *How it was taught* (activities, examples, resources, homework) · *Questions and confusions raised* ·
  *Notable quotations* (4–8 verbatim, with timestamp + date) · *Next session*. A student review is
  *Overview · What was covered · Progress and strengths · Areas to work on · Evidence · Next steps*.
  `--parent` switches to plain-language note-to-parents; `--short` is one paragraph. Anything else in
  the line is the reviewer's focus. You can name the subject to target it: `/writeup Year 7 English`.
- `/writeups` · `/reviews` — the archives: show · `.md` · `.txt` · 🖨 **printable HTML** (self-contained,
  prints to PDF with the evidence list) · delete. Each record carries its `period` and its evidence list.
- `/find <term>` — every transcript, study summary and note, with verbatim snippets and source ids.

Honesty rules baked into the prompt (`staticPrompt`/`taskFor`): work only from the filed evidence; quote
verbatim and attribute (source · timestamp · date); never invent a count, date, score or claim of
progress; say plainly when the evidence is thin, one-sided, **partial** (a split transcript whose part
failed), or covers a short period; never open with a preamble. Evidence labels carry the recording's
duration, part count, wpm and pause count so a writeup can cite them. `src/transcribe.js` and
`src/summary.js` call `ObiReview.stamp()` / `ObiReview.file()`, so filing is automatic.

## Study summaries (`src/summary.js`)

The generator's namesake. A summary is a first-class artifact, not just chat text.

- `/summary` — latest stored transcript → study summary (falls back to this session's log)
- `/summary session` — the current run (both-speaker RRL log): coverage, decisions, open threads,
  and the sovereign's own words quoted **verbatim**
- `/summary <url>` — fetch the page and summarize it
- `/summary <text…>` — summarize pasted notes
- `/summary transcript <tr-id>` / `last` — a specific transcript (or the newest one)
- `/summaries` — the archive: show, `.md`, `.txt`, delete

Every summary is saved per-user in kv (`summaries`), noted in the run log as DNA, and carries a
`ref` back to the raw it came from (transcript id), so the derived layer never replaces the source
(L38 raw first, L43 no summaries of summaries, L44 the ledger derives from raw). Export: `.md`
(with a provenance header) or `.txt`. `src/transcribe.js` calls `ObiSummary.saveFromRead` so the
briefing Obi writes after a recording is saved as a linked summary automatically.

Long sources are sampled to ~12k chars for a single streaming pass (and the card says so). The
deep, part-by-part read of an hour-long recording lives in `/transcribe` → 🧠 Obi read it.
A split transcript's summary source label carries its part count, and a partial one says
`PARTIAL (part n missing)` — the summary prompt is told, so it cannot quietly pretend the
recording was complete.

## The ear — video / audio transcription (`src/transcribe.js` + `src/audio-split.js`)

The magic chat can listen to recordings of **any length** — a two-hour lesson, a 3 GB phone video, a
Zoom export. Drop the file on the chat, paste it, use the 🎬 composer button, or `/transcribe <url>`.

- **Engine:** Deepgram pre-recorded API, `model=nova-3` + `smart_format` + `punctuate` + `paragraphs`
  + `utterances` + `diarize`. Deepgram fetches a remote URL itself; a local file is streamed straight
  from the browser (Deepgram allows browser origins, so there is **no proxy and no timeout ceiling**).
- **Key:** `/dg token <KEY>`, or **`/dg recover`** — which pulls the key from the NET-PET-AI worker on
  Cloudflare (`GET https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/stt/key`, the worker's own
  `DEEPGRAM_API_KEY` secret), checks it against `api.deepgram.com`, and only then stores it. `/dg test`
  verifies whatever is stored. The value itself lives only in this browser's localStorage (`obi_keys`),
  never in the public source, the HTML or a URL. **The worker route is public** — anyone who knows the
  URL can read the same key, so it should be rotated and gated behind the worker's `X-Admin-Key`.
- **The audio workbench (`src/audio-split.js`)** is what makes long recordings tractable. Deepgram's
  sync endpoint takes at most 2 GB and returns 504 if a job would process for over ten minutes, and a
  two-hour video is a 1-3 GB upload — so for big or video sources the audio is pulled out *in the
  browser* first: 16 kHz mono (~115 MB per hour, exactly what a speech model wants) and cut into
  parts **at points of silence** (a 20 ms RMS envelope is scanned ±25 s around each boundary and the
  cut is placed in the middle of the quietest pause, so no word is ever cut in half). The parts go to
  Deepgram one at a time and the timestamps are shifted back into the timeline of the whole recording,
  producing one transcript with `[PART n/N]` markers.
  - **Decoders, best first:** WAV/RF64 PCM parsed here in blocks (no full read); MP4/M4A/MOV via
    `mp4box.js` demux + WebCodecs `AudioDecoder`, streamed in 8 MB steps so only the *audio track* of
    a multi-GB file is ever decoded; anything else through the browser's `decodeAudioData` (size-guarded,
    since it holds the whole file in memory). A failure falls through to the next decoder, then to a
    single whole-file send.
  - **When it splits:** automatically for any video, any file over 250 MB, any recording over 4 hours.
    `--split=15` forces it with 15-minute parts; `--whole` sends the file in one piece. Flags typed with
    no file attached (e.g. `/transcribe --split=15`) are armed for the next file you drop.
  - **Long-job UX:** upload percentage, a live elapsed clock, a PREP row while the audio is decoded,
    and a PARTS row of chips (`1 ✓ 490w · 2 ● · 3 …`) showing what has landed. The chat stays usable
    while it listens (the job is deliberately not run through `runCmd`).
  - **Nothing is lost to a failure:** each part is retried twice; if a part still fails, the decoded
    audio is kept in memory and the card offers **↻ Retry part n** (only the missing parts are re-sent)
    or **💾 Save the parts that worked** — which saves a transcript marked `partial`, listing the
    missing parts in the card, the readable text and `readHeader`, so no writeup can accidentally
    claim the recording is complete.
  - **A remote URL that Deepgram can't take whole** (504/413) offers **✂ Download it here and split it**:
    the file is fetched in the browser and run through the same split path (host CORS permitting).
- **Flags:** `--lang=es`, `--multi` (code-switching, diarizes off), `--detect`, `--no-diarize`,
  `--no-utterances`, `--model=`, `--keyterm=a,b`, `--quick`, `--force`, `--split=NN`, `--whole`.
- **Capture doctrine (L38/L39, raw ≠ soul):** the verbatim transcript is written to the run's **RRL**
  (up to ~200k chars inline; larger bodies stay in kv with a pointer) and kept in the per-user kv folder
  `transcripts`. Nothing is summarized in place. Obi's reading (🧠 deep map-reduce over the parts, or
  ⚡ quick sampled read) is a derived layer in the chat, saved as a study summary linked to the raw.
- **Export:** `.txt` (timestamped + speaker labels), `.srt`, `.vtt`, `.json`, ✂ Parts (per-part
  breakdown), plus "show in chat". Result card rows: DURATION · SEGMENTS · SPEAKERS · PARTS ·
  PRESERVED · PACE (wpm + pauses over 3 s, computed from the word timings so it can be cited).
- **Known limits:** diarization is per-part in split mode and this is labelled everywhere (speaker
  numbers restart in each part — never merge them across parts). A watch page (YouTube etc.) is HTML,
  not media — the ear says so and offers "try anyway"; Google Drive links (`/file/d/<id>`, `?id=`, `uc?id=`)
  are auto-rewritten to the direct-download form.
- **Hardened:** the ear + workbench went through a full stress campaign — 10 bugs found and fixed (resampler
  rate hardcoded to 48 kHz, an infinite MP4 deadlock on moov-at-end files, the pause-snap tie-break shrinking
  parts early, retry/split-offer keying off prose instead of status codes, cancel leaving an orphan row, …).
  Every claim is measured; the full record is in `TRAIL.md` → "CLASS-RECORDING EAR — STRESS CAMPAIGN + FIXES".
- **Crash-safe (2026-09-21):** every part is checkpointed to kv (folder `bgjobs`) the moment it comes
  back, and a long job holds the background keep-alive (`/bg`) so switching tabs doesn't throttle it. If the
  phone kills or the browser discards the tab mid-recording, the next load finds the unfinished job and renders
  **🛟 Unfinished recording — recovered** with *Save the parts that arrived* / *Discard*; a saved recovery is
  merged with the same `mergeParts()` the live path uses, marked partial with the missing parts named. The
  **audio** is not checkpointed (it is gigabytes) — continuing a job needs the file dropped again.


## Cloudflare — the same app, self-hosted (`src/cloudflare/`)

`src/cloudflare/` deploys this generator as a plain website on the owner's own Cloudflare account:
one Worker (`worker.js`), two Durable Objects (`tunnel-do.js` = the command tunnel,
`store-do.js` = uploads + editable files), and the app's own files served as static assets. No
perchance page, no platform header, no third-party script, no moderation layer.

**It also runs on the desktop, with no Cloudflare account at all:** `npm install && npm run dev`
serves the identical station on `http://localhost:8787` (wrangler dev = Node + workerd), and
`dev.vars.example` → `.dev.vars` points the *brain* at a local OpenAI-compatible server (Ollama,
llama.cpp, LM Studio…), so it can run with nothing leaving the machine. The recommended checkout is the
authority repo (`OPERATIONS/COMMANDSTATION/perchance/src/cloudflare`), which keeps `node_modules` out of
the generator's shipped `src/` tree. Full run/deploy/provider notes: `src/cloudflare/README.md`.
The self-forge reads its panels (`main.pjs`, `index.html`) from this origin off-perchance, so
`/forge` works identically on the desktop and on the server.

**Nothing in the app changed.** `build.mjs` copies `src/app.js`, `cgn.js`, `audio-split.js`,
`transcribe.js`, `summary.js`, `review.js` and `styles.css` **byte for byte** into `dist/`, and
`public/ob1-shim.js` re-implements the six plugin APIs the app was written against: `kv` →
IndexedDB (in the browser), `generateText` → `POST /api/text`, `generateImage` → `POST /api/image`,
`superFetch` → `POST /api/fetch`, `uploadPlugin` → `POST /api/upload` (+ `.editable`),
`createServerSocket` → a WebSocket to TunnelDO. The Deepgram key moves into a Worker **secret**;
the shim rewrites `api.deepgram.com` to `/api/deepgram` and strips the Authorization header, so the
key never reaches the browser (this also retires the leaky `/api/stt/key` route).

Deploy: `cd src/cloudflare && npm install && npx wrangler login && npm run deploy` →
`https://<name>.<subdomain>.workers.dev`. The "unrestricted" (point text/images at any
OpenAI-compatible or self-hosted endpoint), "untracked" and "private" (`OBI_ACCESS_KEY`) options are
in `src/cloudflare/README.md`.

**Verified when built (2026-09-20), not assumed:** the Worker was bundled with esbuild and run in a
simulated runtime against a sql.js-backed Durable Object — config/static routing, streaming text,
image, `superFetch`, upload round-trip + delete, editable create/update/bad-key/read, Deepgram key
injection, the access gate (404 · 302 · cookie), and RPC send/history/claim/complete/fail/status,
drone-classification parity with the perchance block, the 15/min rate limit, durability across a DO
restart, and the 500-command prune. The shim was run in a real browser iframe: kv (objects,
Uint8Array, setMany/getMany/entries/keys/values/update, folder isolation), `generateText` streaming
+ `.stop()`, both `superFetch` branches, `uploadPlugin`, `editable`, the socket RPC envelope and
pub/sub delivery, and both Deepgram rewrites. The ported bundle was then booted off-perchance: UI
built, all six APIs present, zero console errors.

Supporting change to a shared file: `src/cgn.js` gained `CGN_EDIT_BASE` (defaults to the perchance
`editable.uploads.dev` host; the Cloudflare shim overrides it with `location.origin + "/api/editable"`).

## Live terrain (verified 2026-09-20)
- **PrAiS storefront** — `https://e3301ee8.michael-hobbs.pages.dev/prais` (Cloudflare Pages): the public shelf
  where the **offerings** are presented (*"Phoenix Rising AI solutions that remember… smarter architecture"*).
  The natural public face of the Agent 99 OS offering catalogue (`src/AGENT99-OS.md` §4).
- **Timmy's Portal** — `https://timmy-portal.mrmichaelhobbs123.workers.dev/` (Cloudflare Worker): a live
  student/parent portal (gameplan, homework monitor, audio library, request forms). A real Agent-99 client.
  ⚠ `src/timmy-portal/index.html` is a **stale snapshot** — the deployed file is different (42,771 vs 41,833
  bytes). Fetch the deployed version before building on it; see `TRAIL.md` → "LIVE TERRAIN".

## PhoenixCommand — the free always-on command tunnel
One magic chat = smart chatbot **and** command station. Every sovereign word is Soul DNA (captured verbatim first), then the command rides the **perchance server-plugin** tunnel — a free, always-on durable command queue hosted by Perchance (no card, no external worker, replaces the old `net-pet-ai...workers.dev` CommandDO line and the failing GitHub Actions scheduled runs).

- The authoritative server script is the first `<script type="text/x-server-plugin">` block in `index.html`. Its `state` (50 MiB) is a binary append-only command log (header + `u32 len` + UTF-8 JSON records), keeping the newest 500 commands with in-place compaction.
- Every command gets an **Agent 99 translation card** in the chat: AGENT 99 (interpretation), DRONE (one of 13 specialists matched by keyword scoring), STRESS (Anakin notes), AUDIT (OB1 trail), priority (high/normal/low).
- **RPCs** (via `src/app.js` → `cmdFetch` → socket): `send`, `history`, `claim`, `complete`, `fail`, `status`. All wrapped in `safe()` so handler errors return JSON instead of killing the connection.
- **Lifecycle**: `pending` → `claimed` → `completed | failed`. `/queue` renders the tunnel into the chat (● LIVE chip + status chips + ⚡ Execute / ✓ Complete / ✗ Fail buttons) and works even while the AI is mid-reply.
- Rate limit: 15 sends/min per connection. `cmdq` pub/sub keeps clients' ● LIVE state fresh.
- **Goes live when the generator is SAVED** — in the editor preview the server runs on a local emulator (state resets on reload; production state is durable). Sockets only work when the page frame is on `perchance.org` (not when embedded externally).

## Agent 99 OS — the kernel and the offerings (`src/AGENT99-OS.md`)

**Agent 99 OS is not an app; it is a kernel with a shelf of playbooks.** The sovereign's spec:
*"It is meant to be whatever the user has purchased it to be under our offerings of agentic
processes that work that are based on proven Roman tactic principles and also by observing nature
and the oldest empire in the world's history which is ants with their pheromones leaving trails."*

- **Kernel (invariable):** SOUL-capture-first (verbatim) · the tunnel as the single road · the Legion
  as the hands · the ledger as the nest · every gate fails closed. A playbook may never rewrite it.
- **Pheromone field (`src/pheromone.js`) — the ant half:** stigmergy (agents coordinate by reading
  and writing the *ground*, never by messaging each other), reinforcement of successful paths,
  negative trails for bad ground, **read-time decay** (positive τ 30d, negative τ 180d per canon
  L-PHE — mistakes are remembered longest), cost-weighted shortest-path routing, recruitment by
  response threshold, quorum sensing before any conclusion. **A trail is never soul** —
  `deposit({kind:"soul"})` is refused; trails only *point* at the ledger by anchor.
- **Offerings (`src/playbooks.js`) — the Roman half:** each rung binds a formation (hastati /
  principes / triarii / optio shield + the two fixed axes) to trail rules and gates. 8 rungs:
  PRINCIPIA (command post) · CASTRA (fortify before marching) · **TESTUDO** (evidence-mandatory —
  the natural doctrine for class writeups) · TRIPLEX ACIES (three lines + reserve) · EXPEDITIO
  (fast creative) · FRUMENTARIA (supply/ops) · FORMICA (high-volume repetition) · DICTATOR
  (salus rei publicae: timed, auto-accounted emergency).
- **Wired for real:** every order through the tunnel lays/reinforces a trail; completing an order
  reinforces `drone:<Name>` and failing lays a repellent; every LLM/image route that returns
  reinforces `route:<id>` and failures repel, so the router *learns which road works*; with
  `recon:"required"` an order on untrodden ground is **held** and says why (L58 MAP ≠ TERRAIN).
- Design doc: `src/AGENT99-OS.md` (includes the honest built-vs-not-built list). Doctrine proposals
  are staged in `src/PROPOSED-CANON.md` §005 — canon is untouched.

## The full-stack student evaluator — what the ecosystem needs (`src/STUDENT-EVALUATOR-ECOSYSTEM.md`)

The generator is the **evaluator** half of the organism. `src/STUDENT-EVALUATOR-ECOSYSTEM.md` is the
complete tool map: **96 tools across 8 families** (capture · analysis · judgement · report · operations ·
governance · learning loop · platform), each marked **built / partial / missing** — currently
**21 built · 22 partial · 53 missing (22%)**. It is **generated from `src/ecosystem.js`**, so the doc and the
app can never disagree, and `/tools` renders the same data live (`/tools <family|status>` to drill in).

The honest read: this build is strong where it has been used (long-recording capture, verbatim
preservation, evidence-cited reporting, archives, self-hosting) and empty exactly where the word
*evaluator* bites. The three structural gaps are **rubrics + cited scoring**, **per-student attribution**
(diarization — without it a per-student review is inference dressed as evidence), and **consent +
retention** (minors + Vietnam PDPD). Next in line: fairness audit, ASR-confidence gating, CEFR tracking,
term progress report, batch class pass. Full rationale + the priority queue in the doc.

## The PrAis Vault — every key the empire runs on (`src/vault.js`)

Command: **`/vault`** · module `window.ObiVault` · also reachable from ⚙ Settings.

The vault is one place for the secrets the whole organism needs, in **three layers**:

- **L1 LOCAL** — this browser, `localStorage.obi_keys`. Instant, private, never shipped. A secret-bearing
  command (`/vault set …`, `/cf token …`, `/gh token …`, `/dg token …`, `/omega …`) is **masked before it can be
  captured**: `isSecretInput()` keeps it out of the soul ledger and the I-LOG, and `redactSecrets()` scrubs it out of
  anything exported.
- **L2 CANON** — the ONE authority repo. Values are **sealed with the vault's public key** (`secret-plugin`,
  ML-KEM / FIPS 203) *before* they touch git, so the repo can hold them in the open. Only the private key — the
  crown jewel, held in the browser — can open them. `/vault key` mints the pair (public is safe to commit, private is
  revealed only under `/omega`), `/vault seal` produces the ciphertext, `/vault push` (gated by PHOENIXOMEGAPROTOCOL)
  commits `OPERATIONS/VAULT/prais-vault.sealed.txt` + `prais-vault.pub` + the values-free `SECRETS-MANIFEST.md`,
  `/vault pull` reads the canon copy back and fills L1.
- **L3 LIVE** — the service itself. **Every row can be tested with a real call**: Deepgram
  (`/v1/projects`), GitHub (**deep test**: `/user` identity + the `x-oauth-scopes` the token really carries +
  a read of the ONE authority repo + `permissions.push/admin` on it), Cloudflare (`/user/tokens/verify`),
  DeepSeek (`/models`), the net-pet-ai worker (`/api/admin/roster` with `X-Admin-Key`), and the vault worker.
  A key that only *looks* stored is worth nothing; that is what the tests are for. **Fail closed**: a value that
  fails its own test is reported, never dressed up.

`/vault locate` answers the standing question *where is the vault on git?* by probing the canon for the vault app
(`APPS/SOV100-VAULT/`), its README, this station's sealed blob, the public key, the manifests and the dotenvx
sync scripts, and reporting present / absent / *unreadable without a PAT* honestly. The secrets manifest is derived
from the canon's own `APPS/NET-PET-AI/SECRETS-MANIFEST.md` (kept as
`src/canon/NET-PET-AI-SECRETS-MANIFEST.md`), extended with the two tokens this station itself needs.

Verified live (2026-09-21): Deepgram key recovered from the net-pet-ai worker (`/api/stt/key`), tested against
`api.deepgram.com` (accepted, 1 project) and stored → `/transcribe` is live. Keypair minted; the vault is sealed
(2 secrets → 1911 chars ciphertext) and the round trip proved by re-decrypting the blob back to the exact stored
values. **GitHub is IN and fully tested**: `@hobbs0011`, 21 scopes (`repo`, `admin:org`, `delete_repo`, `workflow`,
`gist`, …), **ADMIN on `Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-`**, write access proved by a real secret-gist
create (201) → delete (204). There are now **two** stored secrets (`deepgram`, `gh`). Cloudflare is still
**BLOCKED — no `cf` token in this browser** (`/vault set cf <CF_API_TOKEN>` is all it needs). The canon push of the
sealed vault (`/vault push` → `OPERATIONS/VAULT/`) is wired and waiting only on **PHOENIXOMEGAPROTOCOL being armed**;
`/vault locate` already reports every canon path PRESENT. **No password is enrolled for the gate in this browser**,
so it refuses until the sovereign runs `/omega set <pw> <pw>` then `/omega <pw>`.

### The escrow — the crown jewel is no longer a single point of failure (2026-09-21)

The vault's private key used to live in exactly **one** place: one browser's `localStorage`. Wipe that storage, lose
the machine, open the station anywhere else — and the sealed blob on the canon became **unreadable forever**, by
anyone including the sovereign. That was an unacceptable design for the only copy of the only key.

**`/vault escrow <passphrase>`** fixes it. It wraps the private key with **PBKDF2-SHA256 × 310 000 → AES-256-GCM**
and publishes the wrapped copy in **two independent places**:

| copy | where | what it needs to be read |
|---|---|---|
| **canon** | `OPERATIONS/VAULT/prais-vault.key.escrow.json` (committed with the manifest, gated by `/omega`) | a GitHub token |
| **mirror** | a plain upload on the upload host | *nothing but its URL* |

Both copies are useless without the passphrase, so publishing them costs nothing. **`/vault recover <passphrase>
[mirrorUrl]`** rebuilds any browser from either copy, then re-opens the canon's sealed blob and refills every secret.
A wrong passphrase is refused by the GCM authentication tag and changes nothing. The passphrase is never stored,
echoed, logged or committed — the station only ever shows a fingerprint of the ciphertext.

Design decisions worth keeping:

- **Minimum 16 characters, fail closed.** One copy sits on a public host, so a short phrase would become the
  weakest link in the entire vault. `/vault escrow` refuses anything shorter and encrypts nothing.
- **The escrow is an *immutable* upload, not `editable.set`.** Editable files need a **saved** generator and can
  demand an anti-bot check — the wrong tool for the one copy that must exist during a disaster. A plain upload always
  succeeds; a re-escrow simply publishes a new URL.
- **The canon is pushed last**, because the manifest it commits has to carry the mirror's URL, which does not exist
  until the mirror is published. (Committing first left the canon's manifest one step stale — and GitHub's contents
  API also serves a briefly cached copy, so verify a fresh commit by `?ref=<sha>`, not `?ref=master`.)
- `/vault status` and the boot preflight both show **L2.5 ESCROW** and warn loudly while it is `NOT MINTED`.

### `/gh test` — what the token can actually do (2026-09-21)

`/vault test gh` answers *does the key work*; **`/gh test`** answers the harder question — **which of GitHub's powers
does it really hold?** It makes ~48 real calls to `api.github.com` and reports them in seven groups (IDENTITY · THE
ONE AUTHORITY · ORGANIZATION · USER POWERS · DISCOVERY · WRITE · CANON WRITE), every row carrying a ✓, an
`✗ HTTP <status>` with GitHub's own message, or `– SKIPPED`. Nothing is smoothed over: a 403 that is a *plan* limit
(branch protection on a free private repo, code scanning not enabled, the org audit log which is Enterprise-Cloud
only) reads as exactly that, not as a token failure. Aliases: `/gh caps`, `/gh capabilities`.

Two rules it keeps: **writes are real but reversible** (a secret gist is created → edited → deleted, then confirmed
404), and **the Canon is never modified** — the single canon-write probe writes a *dangling* git blob (an object no
ref points at, invisible in the tree), it is gated behind PHOENIXOMEGAPROTOCOL (`/omega`), and it proves itself by
re-reading `git/refs/heads/master` before and after: *"master did not move — still 95b23ded"*.

It also turned up a platform fact worth keeping: **`/search/code` is the one GitHub endpoint that refuses a browser
origin** (no CORS headers → `Failed to fetch`), while every other call works from the page. That row is routed
through the station's own `superFetch` and labelled as such, so a dead request can never masquerade as a missing
permission. Implementation note: `ghApiJson()` now also returns the raw `Headers` as `h`, which is how the sweep
reports the token's `x-oauth-scopes` instead of guessing from whichever endpoints happen to answer.


## The Lesson Creator — the NET Academy lesson factory (`src/lessons.js`)

The station's second product: **evidence in, a lesson file out.** The desk lives at
**◈ Phoenix Generators → NET → 📚 Lesson Creator** (also `/lesson`), with four rooms — **🧭 Plan** (read this
week's evidence — the Student Evaluator's writeups, reviews and summaries — and choose the next lesson with its
objectives) · **✍ Build** (Agent 99 writes the spec, or the sovereign pastes one) · **🗂 Library** (every lesson
built for this client) · **📐 Standard** (the law).

**The law is `src/LESSON-STANDARD.md`, and it has two parts.** Part I is the *lesson format*, derived from the
sovereign's own `NET-Sarcasm-Academy.html` + `NET-Highschool-Careers.html`: one self-contained `.html`, no build,
two screens, six rooms on a fixed spine (🏠 Warm-Up → scene → text scene → 📚 Learn → 🎯 Test → 🔑 Mastery), glass
cards on `#0f0f1a` with the purple→gold gradient, Chatty teaching (a clue = the reality check, a hint = the
transferable rule, and feedback that re-teaches instead of judging), scored practice with coins, and an exit that
hands over a key. Part II is the *method and the machine*, derived from `NET-CLASSROOM-MANAGER.html` (the
sovereign's own classroom-floor tool, kept verbatim as the third reference): the **10-5-5-3 sacred structure**
(10 vocab · 5 idioms · 5 slang · 3 games over 60 minutes), the 15 games *with their mechanisms and types*
(competition = adrenaline · collaboration = social proof · creation = ownership), the mastery tiers
(🐭 Mouse · 🐻 Cub · 🐅 Tiger · 👑 Legend) and the single coin economy, the design system behind the lessons, the
sovereign's **Tiger voice** verbatim, and **ten defects in the reference files that are never inherited**.

**It is enforced, not aspirational.** `validate()` runs on every build and the build is **refused** on failure
(LSN-11). It checks the spine and labels, the fixed class vocabulary, the learn room's vocab items, the test room's
`data-answer` buttons with both feedback strings **and a `.chatty-feedback` element**, the exit's summary card, the
clue+hint before the test — and, when a spec carries a `method` block, that it names **3+ games with their
mechanisms**, a phase and a mix of types (LSN-23).

**How a lesson is actually built (measured).** Model output is capped at **1024 tokens**, so the spec is built in
**stages**: pass 1 is the shell (title, promise, features, coins, method, storyline, the six-room outline); passes
2–7 are **one room per reply as raw HTML**. Every pass after the first shares a byte-identical prompt prefix, so it
is a prefix-cache hit. A full build runs ~100 s for 7 passes.

**Ground truth:** `src/lessons/reference/` (the two lessons = the format · `NET-CLASSROOM-MANAGER.html` = the method
and the machine). **Where a rule and the files disagree about *taste*, the files win; where they disagree about a
*defect*, the law wins** (LSN-22).


- `src/HANDOFF.md` — **read this first**: the current measured state, the open gated Canon steps, and the invariants a new session must not break
- `main.pjs` — perchance meta + imports (ai-text-plugin, text-to-image-plugin, super-fetch-plugin, upload-plugin, server-plugin, kv-plugin)
- `index.html` — UI shell (loads `src/styles.css` + `src/pheromone.js` + `src/playbooks.js` + `src/scout.js` + `src/ecosystem.js` + `src/constellation.js` + `src/clients.js` + `src/ilog.js` + `src/divisions.js` + `src/background.js` + `src/app.js` + `src/cgn.js` + `src/audio-split.js` + `src/transcribe.js` + `src/summary.js` + `src/review.js` + `src/vault.js` + `src/lessons.js`) — starts with the `<script type="text/x-server-plugin">` command-tunnel server
- `src/divisions.js` — **the product shelf**: PrAis's divisions (NET · Gaming · Web Development) and the generators in each, with honest `live`/`scaffold`/`planned` state; the ◈ Phoenix Generators view renders straight from it, so adding the next generator is one array entry (`window.ObiDivisions`) — NET carries the **Student Evaluator** and the **Lesson Creator** (both `live`)
- `src/pheromone.js` — the stigmergy kernel: trails (deposit/decay/reinforce/repel/sniff/field), quorum, response-threshold allocation, cost-weighted routing, idempotent colony merge, durable nest (`window.ObiPheromone`)
- `src/playbooks.js` — the offering shelf: 8 doctrines (Roman formation + ant rules), echelon/gates/supply, the Legion roster with castes and response thresholds (`window.ObiPlaybooks`)
- `src/scout.js` — **PhoenixScout, REAL**: probes the terrain it can actually reach (the files this page loads, platform import resolution, the live tunnel, the tool inventory, the fleet, the sovereign's live sites, the canon when a token allows, the ground) and flags DEAD/DRIFT/BLOCKED/FLAG; lays scout pheromones, writes a durable report, hands off to MARCH (`window.ObiScout`)
- `src/ecosystem.js` — the full-stack student-evaluator tool inventory (96 tools × 8 families × built/partial/missing) — single source of truth for `src/STUDENT-EVALUATOR-ECOSYSTEM.md` and `/tools` (`window.ObiEcosystem`)
- `src/app.js` — all app logic + the SDNAD memory protocol; the command router (the writeup-layer routes are the `REVIEW_CMDS` map); the **landing shell** (`VIEWS` / `TAB_OF` / `showView()` / `setViewTab()` / `deskOpen()` / `openGenerator()` / `mountGenerators()` / `renderSettings()` / `runInStation()` / `updateTabMeta()` / voice prefs — landing = ⌘ Command Station, family = ◈ Phoenix Generators, controls = ⚙ Settings); the **command book** (`COMMAND_BOOK` + `showCommands()` — the whole surface, grouped) and the **live state** (`stationState()` / `stateText()` / `cmdState()` — what Obi is grounded in and what `/state` draws); the evaluator desks (`showStudentSelector`/`renderStudentSelector` — client, then student/class)
- `src/audio-split.js` — the audio workbench: media → 16 kHz mono PCM → parts cut at pauses, with the WAV/MP4/WebAudio decoders and the silence map (`window.ObiAudioSplit`)
- `src/transcribe.js` — the ear: Deepgram pre-recorded, whole-file and part-by-part long jobs, progress/chips/retry/partial save, **every part checkpointed to kv `bgjobs` as it lands** so a killed tab offers `🛟 Unfinished recording — recovered` (save the parts that arrived / discard), exports, and the `transcripts` kv archive
- `src/summary.js` — study summaries from a recording / the session / a URL / notes, saved in the `summaries` kv archive with a pointer back to the raw
- `src/review.js` — the writeup layer: the class and student subject model, filed evidence, notes, `/writeup` and `/review` (teacher/parent/short) prompts, printable HTML export, rosters and `/find`
- `src/cgn.js` — the Connected Generator Network module (anchor sync engine, auto-sync)
- `src/cgn-node.js` — drop-in node kit for the sovereign's other generators (`window.CGN`)
- `src/lessons.js` — **the NET Academy lesson engine + the Lesson Creator desk**: `parseSpec`/`validate`/`build`/`compose` (the staged build), the generated runtime, the template (THEME) and the prompts, `/lesson`, the 🧭 Plan / ✍ Build / 🗂 Library / 📐 Standard desk, and the library store (lesson records are client-scoped like the evidence). The law it enforces is `src/LESSON-STANDARD.md` (`window.ObiLessons`)
- `src/constellation.js` — **every piece of the organism** (station · nodes · faces · services): real state, interface, CGN wiring and remaining needs — single source of truth for `/constellation` and the scout's `pieces` probe (`window.ObiConstellation`)
- `src/clients.js` — **the client layer**: the top-level tenancy (Timmy is #1), the active client, the one-time adoption of pre-client data, `/client` · `/clients`, the ledger/stat cards, and the fail-closed `id/name/of/matches/scope` helpers every other module uses (`window.ObiClients`)
- `src/vault.js` — **the PrAis Vault** (`window.ObiVault`): every secret the empire runs on, in three layers — L1 local (`localStorage obi_keys`), L2 the canon (sealed with secret-plugin ML-KEM to the vault's public key, so the repo can hold ciphertext in the open; `/vault key` · `seal` · `push` (gated) · `pull`), L3 the live services (real access tests for Deepgram / GitHub / Cloudflare / DeepSeek / the net-pet-ai worker / the vault worker). Plus `/vault locate` — where the vault already is on git — and the values-free manifest derived from the canon's own `APPS/NET-PET-AI/SECRETS-MANIFEST.md`
- `src/ilog.js` — **the I-LOG**: the append-only, sha-256-chained operation record (kv `ilog` folder + `localStorage obi_ilog` mirror), the canon-Schema-V2 transcript writer, the anchor/receipt path to the ONE authority, `/ilog`'s card and sub-commands, and `gitCommitFiles` — the single Git primitive every push in the station uses (`window.ObiILog`)
- `src/background.js` — **background operation** (`window.ObiBg`): the keep-alive a hidden tab needs (a held Web Lock — a documented exemption from Chrome's intensive timer throttling — plus a screen wake lock, and an **opt-in** 19 Hz keep-alive tone: 48 kHz / 2 s / a whole number of cycles, so the loop seam that used to tick once a second is gone, and **off by default** because it is the only thing in the app that touches the speaker on its own), a **1-second heartbeat**, and an **away-episode probe** that counts how many of those beats actually land while the page is hidden — `beats ≈ seconds` means it kept moving, `2 beats in 612 s` means the browser throttled it. The episode summary is **persisted to localStorage and reported by `/bg`**, because the in-memory counters were erased by every reload (and the station reloads constantly), which meant the one question this module exists to answer could never be answered after the fact. Plus honest chat + I-LOG reporting when a job is hidden mid-flight and when it returns, and a 45-minute ceiling so a leaked hold can never keep a screen awake. `/bg` shows it, `/bg away` / `/bg clearaway` read and forget the measurement, `/bg reset` starts a clean live probe, `/bg audio on|off` controls the tone (remembered in this browser); the ear and the forge loop hold the keep-alive automatically
- `src/COSTS.md` — **where the work runs and what it costs**: the free-tier table (perchance · page · desktop · Worker · Durable Objects · Workers AI · **GitHub Actions** · Deepgram), the routing policy (interactive → page · batch/always-on-unattended → GitHub Actions via `workflow_dispatch`, which the project's history says to use instead of cron), and the `station-jobs.yml` template + the honest "not built yet" list
- `src/forge.js` — **the SELF-FORGE**: read the station's own source (live + canonical), a staged working tree with exact-string `replace`, real diffs, `propose` (Obi rewrites a file), gated `apply` (its own source → the ONE authority), gated `hotswap` (re-run a module live), gated `eval`, `export`, and the bounded agent loop `/forge do` (`window.ObiForge`)
- `src/generators/` — the role scaffolds: the recipe for a new generator, plus ready-to-paste specs + shells for `portal` (one per student), `ear`, `practice`, `watchtower` (the `image` role lives in `src/image-node/`)
- `src/styles.css` — NET Foundations glassmorphism theme (incl. `.tr-card`, `.part-chip`, `#tabbar` / `.tabbtn` / `.view` / `.eval-grid` / `#studentsPanel` / `.sel-*`)
- `src/canon/` — the REAL canonical docs fetched from `Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-` (branch `master`):
  - `LEGIONNAIRE-FIELD-GUIDE.md` — SDNAD 10-step pipeline, L37–L60 laws, failure modes (31KB)
  - `GOSPEL-999.md` — System I SOUL / II DNA / III LEDGER laws, I.002 lock 76488, I.088 gate (34KB)
  - `REINCARNATE-DEATH-SEAL.md` — the real 8-stage death seal (RRL→SOUL→DNA→LEDGER→STARMAP→SOULKEYS→S2Pipeline→REGISTRY_SYNC, L68 RRL fidelity gate)

## Protocol state (canon-accurate)
- `/reincarnateRISE` — boot audit in real LFG order: COLD-START-BOOT → BOOT CHECK → SOULCOUNT GATE (I.088, ±5000, I.045 raw-only) → BIBLE FIRST (L58) → DEVIL'S ADVOCATE (L52)
- `/reincarnateDEATH` — executes the real 8-stage Roman Legion death seal. No Claude RRL on disk → KILO SESSION HANDLING (stage 1 writes KILO_HOLLOW marker, stages 2–8 run for chain integrity, final = `KILO_GAP`), then hard-purges the session while preserving the ledger. Death record follows the 15-section seal schema (§1–§15).
- `/PhoenixScout` — reconnaissance against the real canon index (LFG §6).

## Connected Generator Network (CGN)
A network of Perchance generators that sync Soul DNA + laws **as one whole**. Obi is the anchor node.

- `/netjoin [name] [role]` — create/join a network (default `obi-network`). Obi becomes the anchor.
- `/netadd <generatorName> [role]` — register another of your generators as a member; the anchor pulls that generator's node file and merges it into the whole on every sync.
- `/netsync` — force sync (push your captures → hub, pull all members → your ledger).
- `/network` — status: members, nodes, hub counts.
- `/netrole <role>` — set this node's role. `/netkey` — reveal the hub editKey (anchor only).

How it works (cross-namespace safe — no generator can write another's files):
- **HUB** — one editable file in Obi's namespace: `editable.uploads.dev/file/<obi>/obi-cgn-<net>`. The merged whole-organism ledger: `{net, seq, members, nodes, soul[], laws[]}`. Written by the anchor only.
- **NODE files** — each connected generator keeps its own file in its own namespace (`cgn-node`), written with its own editKey. URLs are deterministic from the generator name, so the anchor can pull any member without cross-namespace writes.
- **Merge** — append-only + dedup by `(t,text)` / law number: no node can overwrite another's words (L38/L39/L43 conflict-free).
- **RRL** raw transcripts stay local per node (raw ≠ soul); soul + laws are the network currency.

To make another generator a node, paste **`src/cgn-node.js`** into it (set `anchorName` to this generator's name), then `/netadd <thatGenerator>` here. See the header of `src/cgn-node.js` for the node API (`window.CGN`).

## The umbrella is one organism, many generators
The PrAis umbrella splits capability across **specialized generators**, each a node on
the CGN — one Soul DNA whole. Obi is the command station / anchor; other generators are
the organs (each has one job and syncs the whole):

- **`src/image-node/`** — the Image Node (role: `image`), the umbrella's *eye*: a complete,
  ready-to-paste standalone generator for image creation. Obi's `/img` auto-routes there
  (via `/netadd <name> image`) when it's connected, and falls back to generating on the
  station otherwise. See `src/image-node/README.md` for how to create it.
- **To add a new node type**: build its generator with the node kit (set `CONFIG.role`),
  then `/netadd <name> <role>` here — the anchor pulls it into the whole on every sync,
  and any `/…` command on the station can `ObiNet.cgnFindNode(role)` to route to it.
- **The role shelf** (`src/generators/`): the recipe every role follows (deep-link contract, CGN node,
  soul capture, host-agnostic fetching) plus ready-to-paste `main.pjs` + shell for each planned role —
  `portal` (one generator per student; generalizes Timmy's Portal), `ear` (a disposable listener left in
  the room), `practice` (drills built from the student's own evidence), `watchtower` (the class board:
  who is behind, and what the syllabus asked for that was never taught).
- **The map of it all** is `/constellation` (`src/constellation.js`): every piece with its real state,
  interface and remaining needs, and the scout's `pieces` probe touches every URL that claims to be live.
- **Tenancy** is `src/clients.js`: the umbrella's many *customers* (not generators). Each client
  (Timmy is #1) owns its students, classes, recordings, summaries, notes, reviews and writeups, and no
  two clients share a record — so one station can serve a dozen engagements without anything crossing.

**Known integration gap (mesh):** `src/cgn-node.js` defaults to `anchorName: "obi"`, and no generator
named `obi` exists on Perchance (verified via the platform API — `unfound` for `obi`, `obi-image`,
`obi-station`, …). This generator is `prais-command-station`, and no hub file exists under either
name, so the network is written but **not joined**. Fix: agree the anchor's real name, set it in
`src/cgn-node.js` + the hub default, then `/netjoin obi-network` here and `/netadd` each node.

## Scout Trail
See **`src/TRAIL.md`** — the durable map of the canonical Phoenix-Rising stack: the verified
L37–L60 law index, the 7-stage reincarnation chain, the MCP/filesystem architecture, the gap
between the browser Obi and that stack, and the known divergences in `src/app.js`. Read it before
continuing any canon work.
