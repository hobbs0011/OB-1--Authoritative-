# TODO / known rough edges

## Uploads can hang the editor (found by testing, fixed defensively)

Driving `<share link="true"/>` once wedged the tab: the tool call blew past 180 s and every eval
after it timed out until a reload. Probing directly, `await root.uploadPlugin(new Blob([...]))` was
**still pending after 25 s with no error**. The cause is inside the plugin, not the service: it
waits for a handshake with its embed iframe, and if that handshake is slow it tears the iframe
down and builds a new one — dropping the reply to the request that was already in flight, so that
promise never settles. It is intermittent, not fatal: a later `<share link="true"/>` returned a
real `https://user.uploads.dev/...` URL in **1.7 s**. (`editable.set` answers immediately, with
`error: "anti_bot_verification_needed"` — that one is a genuine refusal.)

So the fix is a bound, not avoidance:

- The **`<share>`** tool races the upload against 25 s and, on no answer, delivers the download
  button plus a result that explains there is no link this time (so the agent reports reality
  rather than inventing a URL).
- The **sandbox shim**'s `upload` RPC budget dropped from 180 s to 20 s and now rejects with an
  explanation, so a previewed app's upload button fails visibly instead of spinning forever.
- The **`uploads` skill** and the system prompt carry the rule: uploads *do* work in the editor,
  but never `await` one unguarded — race it and offer a retry.

## Every "nothing happens" button: native dialogs (fixed, verified)

`rename project`, `delete project`, `delete file` and "discard the custom version" all asked
with `confirm()` / `prompt()`. Those are the wrong tool in an embedded page: the editor iframe is
allowed to refuse native dialogs, and a *refused* one just returns `false` — so the button does
nothing at all, with no error anywhere (the same reason the preview sandbox has always stubbed
them). `ui.askText()` / `ui.askConfirm()` (`ui.js`) now render the question in the page as a
`.gx-modal.gx-ask` — Enter submits, Escape/backdrop cancels, the field is focused and selected,
danger actions get `.gx-btn-danger`, and the project rename can no longer leave a half-renamed
name behind. The zip-failure `alert()` became a status line. Verified: the rename dialog returned
`"Dialog Test Renamed"` and the store followed; `delete file` cancelled kept the file and
confirmed removed it; `delete project` removed it from the library (throwaway projects only —
the user's ten are untouched). The `self-edit` skill now tells the agent never to use
`confirm()`/`prompt()`/`alert()` in its own UI, with the replacement call shapes. A second ask
cancels any open one instead of stacking (a stranded overlay nobody can reach is worse than a
dropped request), and on a phone the dialog fits with no overflow (390×844 checked).

## The exported pair did not work (fixed, verified, attacked)

The one bug that survived every audit, because nothing in the project itself looks wrong:
a project keeps its styles in `styles.css` and its logic in `app.js`, index.html links them
relatively, the **preview** resolves those to blob URLs and everything is fine — and then a real
generator (which has exactly two pasteable files and serves extras from `src/`) loaded **neither**,
so the published page was an unstyled, dead shell. `export.js` now makes the exported pair
genuinely stand alone:

- A `<link rel="stylesheet">` pointing at a project file is folded into a `<style>` in place, and
  a `<script src="…">` pointing at a project file into an inline `<script>` — **keeping its
  `type`**. Evidence that this is safe in production: Agent 99's own index.html ends in an inline
  `<script type="module">` with top-level `await` and a dynamic import, and the engine-rendered
  page shows that module script executing (26 script tags there, 25 of them the engine's own).
- A data-URL asset (`<img src="art/hero.png">`, `url("art/bg.png")`) is substituted with the data
  URL itself, instead of being written to a `.png` file containing a URL string.
- Every remaining reference is rewritten to `src/<path>` — attributes, `url()` inside styles, and
  `fetch()`/`new Worker()`/`new Audio()` inside a folded script. Refs inside a folded file resolve
  against **that file's** directory, so `url("../img/bg.png")` in `styles/site.css` lands on
  `src/img/bg.png` rather than a path one level above the generator root.
- Rewriting is textual, so `<script>` bodies and HTML comments are set aside first — an app whose
  template string contains `<link rel="stylesheet" …>` must not have its own code rewritten as if
  it were the page — and `</script`/`</style` inside a folded body is escaped so a string cannot
  terminate its own tag.
- `.md` notes ride along as `docs/…` in the zip; `.txt`/`.json`/images stay **runtime** files (a
  project that `fetch("words.txt")` must not lose it to a docs folder).
- A file referenced by **two** tags stays a file (one fold cannot satisfy both), a classic
  `<script>` whose code uses `import`/`export` is refused rather than folded into a page where it
  cannot run, an unquoted `src=app.js` still comes out as `src=src/app.js`, `?v=2` suffixes
  survive, and an index.html over 300 KB after folding gets called out.

**Adversarial pass over this code — 21 cases, all green** (kept as a checklist so a future session
can re-derive it in one `page_eval`; the harness that session was `scratch/attack-export.js`):
markup inside an inline `<script>` string · commented-out tag stays a comment · `</script>` in a JS
string · `</style>` in CSS `content` · nested `url()` · `fetch()` re-point · unquoted `src` ·
the same script twice · `?v=2` · a missing file left alone · `.txt` runtime vs `.md` doc · CSS
data-URL · building twice byte-identical and mutating nothing · empty index.html · orphan css/js ·
classic+`import` refused / module+`import` folded with its attribute · index.html's own inline
module script intact · and the exported artifact still renders, drives `root.kv` and logs zero
errors. Two bugs the pass caught in this work: the CSS branch read `extras[key]` **after** deleting
it (every folded stylesheet would have come out empty), and the double-click dialog stacking above.

## Loop guard + the test/attack modes (done, verified this session)

- **`src/genesis/guard.js` — the loop guard.** Every loop body in project-owned code is
  rewritten to call a tick, so one continuous synchronous stretch longer than
  `genesisSettings.loopBudgetMs` (default 4000 ms) throws instead of freezing the editor.
  Verified live: a project whose inline `<script>` is `while (true) { n++ }` previews with a
  single clean console error (`Agent 99 guard: a loop ran for more than 4000 ms without
  yielding…`) and the tab stays responsive; a 200 000-iteration loop and a timer chain still
  run normally. The guard also covers the pjs runtime, `<script src>` files and the `<eval>`
  snippets (which run on the host, hence `installGuardInRealm`). Uses acorn (lazy, esm.sh) with
  a scanner fallback; unparseable code is left alone.
- **Two new run modes** — 🧪 `test` (drive the app with `<eval>`, report ✅/❌/❓ with repros,
  write `TEST-REPORT.md`) and 🔥 `attack` (red-team it, rank findings
  `[CRITICAL]`/`[MAJOR]`/`[MINOR]`/`[NIT]`, prove each with a repro, write `FLAWS.md`). Both are
  report-only (`REPORT_PATHS` in `tools.js`); when the run ends the core posts a
  **🔧 fix the flaws** button that hands the report back as a build job.
  Buttons live in `index.html` next to 🔍 audit; help modal updated.
- The "preview froze last time" boot note now offers a one-click **🔧 fix the hang** run.

## Grounding the test/attack runs (done, verified this session)

The first real 🔥 attack run produced a report about **an app that did not exist** — a url-input
form with one button and an `alert`, in a dropzone app that has neither — and the **🔧 fix the
flaws** button then rewrote the working `app.js` from scratch and broke it (it lost its bundle
import, so the preview died with `lab is not defined`). Root causes and fixes:

- **The preview promised ids it never sent.** `ATTACK_TASK` said "<preview/> gives you the element
  ids", but `formatPreview` never included any. So the model guessed (`document.querySelector('input')`)
  and "proved" things about a page it had never looked at. Now a test/attack preview appends a live
  **`sandbox.domMap()`**: the visible controls with their real ids/labels/disabled state plus a
  "hidden right now" list of the ids that appear as the app is used. The preview result also carries
  `meta.previewErrors`, and the agent loop pushes any load-time error back into the next step's task
  ("that is a headline finding — quote it verbatim").
- **A critic that probes before it reads is guessing.** In test/attack, `<eval>` is now **refused**
  until the run has `<read>` at least one project file (it can read a slice with
  `offset`/`limit` to stay small).
- **The files ride in the prompt tail.** `appContract()` in `core.js` builds a compact static digest
  (declared ids + labels + hidden/disabled, handlers assigned, APIs called, and *ids the JS reaches
  for that the HTML never declares*). It is injected as `<app_contract>` in the tail, which is
  rebuilt every step and never trimmed — unlike a `<read>`, which the context window drops.
- **The report is now treated as claims, not gospel.** The fix-handoff message says: read the file
  each entry names, confirm the problem exists before changing anything, say so and leave the code
  alone for a claim you cannot reproduce, and never rewrite a working file from scratch to "fix"
  something you have not confirmed.
- **The mode no longer outlives the run.** `currentRunMode` (core.js) was set at run start and never
  reset, so after any 🧪/🔥 run *every later `<write>` was silently refused* — the user's ▶ build
  worked but nothing else did. `onFinished` now reads it into `finishedMode` and resets it to `build`.

**Verified end to end on the Upscaler:** the 🧪 run read `index.html` and `app.js` first, previewed,
drove the real ids, ran a real upscale (`Done — 800×800`), and wrote `TEST-REPORT.md`. The 🔥 run
read three files and made ~25 probes before writing `FLAWS.md` — and its top finding was **real**:
the "Working…" state only disabled the button, so the model/scale selects and the drop zone stayed
live mid-run and the finished image disagreed with the controls. I verified each entry by hand
(1 real, 2 false — the run button *is* disabled synchronously, and the select cannot hold an invalid
value), fixed the real one (lock `#modelSel`/`#scaleSel`, refuse a new image mid-run, friendlier
non-image error), and re-verified: mid-run `{model:true, scale:true, run:true}`, after-run
`{model:false, scale:false}`, result still correct.

## The audit was blind to the ONE bug that matters: files nothing loads (fixed, verified)

Diagnosed from a real user project (`UnrestrictedContentCreator` — an "Omni Creator" dark-mode
workspace Agent 99 had been building across several days): the app had **never worked once**, and
**the audit kept scoring it 100/100**. `index.html` contained no `<script>` tag at all, so `app.js`
and `core.js` were never executed and the page was a static shell — with **zero console errors**,
because nothing ran to have an error. On top of that the dead code was broken in four other ways
(none of which were caught either): it called `perchance.generateText` / `perchance.kv.getAll`
(invented global — there is no `perchance` object), `root.upscale(...)` (a *Agent 99 tool*, gone in
the exported page), it declared `initApp` **twice** at top level (the second silently replaced the
first), and it called `initVault()` / `initSettings()` which no file defines.

Every check only read file *bodies*, so nothing could see the missing wiring between them. New
checks in `src/genesis/audit.js` (`AUDIT_CHECKS` grows from 8 to 12):

- **`scripts`** — `reachableScripts(files)` follows `index.html`'s `<script src>` tags and then
  `import`s out of whatever they load, and compares that against the JS/CSS actually in the project:
  - `script-unwired` (error): a `.js` file nothing loads → "not one line of it runs and the page is
    a static shell".
  - `css-unlinked` (warn): a `.css` file index.html never links → the page renders unstyled.
  - `script-classic-module` (error): loaded as a classic `<script>` but the file uses
    `import`/`export` → the browser refuses it with a SyntaxError and nothing runs.
- **`globals`** — `invented-global` (error): `perchance.*` / `firebase.*` (skipped if the project
  declares its own binding). The `perchance.…` hallucination is *systematic* — the model reaches for
  it because the platform is called perchance — and it costs the user a whole debugging session.
- **`root-calls`** — `not-a-page-api` (error): `root.upscale(…)`/`root.audit(…)`/`root.<tool>(…)`,
  Agent 99 tools that do not exist in the exported generator, each with the correct replacement
  (e.g. upscale → import the Image Lab engine and `await lab.upscaleImage(canvas, {factor:4})`).
  (Plain `root.<listName>` and `root.<importedPlugin>` are untouched — those are legitimate.)
- **`duplicates`** — `duplicate-decl` (error): the same name declared twice at the top level of one
  file. The last declaration silently wins, so the earlier body never runs — which is exactly why a
  "fixed" file can behave precisely as it did before.
- **`undefined-call`** — calls to `initX()`/`setupX()`/`renderX()`-shaped helpers that no file
  declares (a ReferenceError on the first line of startup). Deliberately limited to that verb shape,
  and it counts function parameters and element ids as declared, so it does not fire on library
  imports or DOM globals.
- **`inert-controls` now counts only LOADED code** — a listener in a file index.html never
  references used to look like a wired-up page. (That false negative is why the audit was quiet.)

**Verified live** on that exact project: **score 0/100 — 9 errors, 2 warnings**, naming every one of
the bugs above, and deterministic across repeat runs (9/9/9). The same project scored 100/100 before.
Also verified it does **not** false-positive: the Upscaler (real `<script type="module">` tags,
1 plugin import) and both new scaffolds stay clean.

The structural consequence: the audit is a **gate** (a run may not finish while it reports errors),
so Agent 99 can no longer declare a dead app "fully operational" — it now has to load the file first.

**Running the new audit over every project in the library immediately found two more bugs — in the
scaffolds themselves:**

- **No scaffold ever linked its stylesheet.** All three `index.html`s had the `<script type="module">`
  tag (the lesson from the last pass) but no `<link rel="stylesheet" href="style.css">`, so `.up-…` /
  `.ig-…` / `.ie-…` app chrome never applied and only the kit's injected styles showed. The apps
  looked "plain" rather than broken, which is exactly why it survived a preview-and-screenshot pass
  last time. Fixed in all three; the audit reports the class as `css-unlinked`.
- **`[hidden]` lost to a class with a `display` rule.** `<section class="ie-panel" hidden>` was
  visible anyway, because the platform's default `[hidden]{display:none}` is a UA-sheet rule that any
  author `display:flex` beats — so the empty "Result" panel and the upscaler's model panel rendered
  before there was anything to show. Each scaffold's `style.css` now opens with
  `[hidden] { display: none !important; }` (with a comment saying why), and the `image-editor`'s live
  DOM was re-checked: `outHidden: true, outDisplay: "none", h: 0`.
- **A scaffold's plugin access must be spelled out.** Both new scaffolds reached the plugins through
  a name lookup (`requireRoot("generateText"…)`) or a local (`typeof r.generateImage`), which the
  audit's and the exporter's `root.<name>` scan cannot see — so a correct app reported
  `plugin-unused` and export could have missed the import. Both now use literal
  `typeof root.generateImage !== "function"` guards, with a comment saying the longhand form is
  deliberate.
- Also tightened a **false positive found by the same run**: the `native-dialog` rule matched
  `prompt (` in the *prose* of a prompt template ("…a single dense prompt (at most 90 words)…"),
  because `\s*` spans a space. It now requires `prompt(` with no gap.

**All three scaffolds re-verified by scaffolding them into throwaway projects**: audit **100/100,
0 findings** each, preview with **0 console errors**, and the rendered page looked at
(`scratch` screenshot: header, bordered panels, dashed dropzone, 12 chips, styled buttons). The
`image-editor` app is kept as a working demo project called **"Edit by Text"** (its generation step
is the one thing that still has to be judged in the export — see the caveat above).

## Repairing every project in the library ("fix all")

With the audit finally able to see wiring, the user asked for **every** project to be fixed. Ten
projects, all now **100/100 and error-free** in the preview (each one rendered and driven, not just
audited):

- **`UnrestrictedContentCreator`** — the app its own `BLUEPRINT.md` describes, written from scratch:
  a dark "Omni Creator" workspace with a nav rail and four modules. Streamed chat
  (`root.generateText` + `onChunk`, Stop, Copy, transcript persisted in kv), an Image Studio
  (`root.generateImage` → cards with **on-device 2× upscale** via `lab.upscaleImage` and download),
  a Data Vault (real `root.kv` set/get/entries/delete round-trip), and Settings (live accent colour
  driven through a CSS variable, system prompt, `deviceReport()`). `core.js` (dead, wrong selectors),
  plus the two stale reports, deleted. Verified by hand: nav switches, vault save→row→delete, accent
  picker → `--accent`, and a live chat turn that streamed back "hello from omni" (browser 0 errors).
- **`Upscaler`** (was named "Text to Image" — the contents were a stale copy of the upscaler
  scaffold, so the label was wrong): the page's `app.js` called `progress.show(…)`, a method
  `createProgress()` has never had — **the upscale button was dead** ("Upscale failed: progress.show
  is not a function"). Replaced the whole app with the current scaffold (link + `[hidden]` rule +
  mid-run lock). Re-verified end to end: sample → `Done — 800×800 · 7.4 s · wasm · 4 workers`.
- **`Secret Flower`** (was named "Upscaler", and was three apps glued together: a flower UI, a
  literal `<write path="style.css">` block pasted into the HTML, a second flower copy after
  `</style></head><body>`, and leftover upscaler code in `app.js`/`style.css`) — rebuilt from
  `main.pjs` (which is where the intent was: `$meta.title = Secret Flower` + a `secret` list). Pour
  three times → the bud blooms → one secret it has never told you appears, and what it has told you
  is kept in kv ("it has told you 1 thing so far — and remembers"). Verified by clicking it.
- **`Mastermind`** — a real repair: the director-board selects had **no `.dir-input` class**, so the
  population loop never ran; the subject lookup used `subject-input` (the id is `subject`); the
  `#loader` element did not exist; `root.generateImage(prompt)` was used as a URL string
  (`img src="[object Object]"`) instead of `.dataUrl`; `list.selectAll()` was called as a function
  (it is a property); and the prompt template referenced a `stock` field with no list behind it.
  All fixed + a `stock` list added. Verified: all five selects populate (7/7/7/6/6) and the prompt
  line updates live.
- **`TheFruitsofEDEN`** — was a whole `<!DOCTYPE html>…</html>` document (perchance supplies those),
  and it `alert()`ed on an empty prompt (blocking, and blocked in the preview). Unwrapped to body
  content, alert replaced with an inline message; 3 plugin imports + `$meta` added.
- **`Star Catcher`** — game.js wrote into `#overlay`, which no element defined (the game-over screen
  would have thrown); a duplicate static `#restartBtn` was removed, the overlay added with its CSS,
  `$meta` added. Verified: canvas, HUD, and the kv-loaded "Best: 10".
- **`AI Oracle`**, **`Imported lists`**, **`Random Story Sparks`** — missing plugin import and
  missing `$meta.description`, fixed.

**Two more audit gaps closed while doing this** (both found by the repairs):

- `idScan` could not see `$("someId")`, the idiom every generated app uses (a one-character
  `getElementById` wrapper), so a large class of broken lookups was invisible. It now also scans
  `$("x")` / `byId("x")` / `getElById("x")` — **but only when the project actually defines `$` that
  way**, so a jQuery-style `$("button")` is not mistaken for an id.
- The `native-dialog` rule matched prose (`prompt (` inside a prompt template). It now requires
  `prompt(` with no gap, so a template full of text about prompts does not trip it.

## Not freezing the editor tab (hardening, this session)

- **Captures are bounded and canvas-first.** `capturePage()` races html2canvas against a 12 s
  deadline and, above ~120k px, returns the biggest canvas's own `toDataURL` instead of re-rendering
  the DOM at that size (the suspected wedge). `imageTimeout` added. Screenshots are now taken **only
  on explicit previews** — the auto-preview fires on every edit and was paying for a full page
  render each time.
- **Layout-awareness.** The preview iframe lives in a pane the editor hides at narrow widths, so it
  can be 0×0 — and then *every* element reports `offsetWidth 0` / `checkVisibility() false`,
  `innerText` is empty, `biggestCanvas` finds nothing, and html2canvas is asked to render a
  degenerate document. `frameRendered()` now gates all of it: the map says "the layout cannot be
  judged" instead of listing nothing, and `capturePage` returns null rather than rendering. (Set a
  desktop viewport before a test/attack run, or the layout checks are meaningless: the harness
  reports `window.innerWidth` 0 in the preview.)
- **`<eval>` has a 45 s deadline**, so a snippet that never settles becomes a reported fact instead
  of a stalled run.
- **`compare.js`** coalesces its ResizeObserver into `requestAnimationFrame`, which removes the
  benign-but-noisy `ResizeObserver loop completed with undelivered notifications` console error that
  an audit would otherwise report as a finding. (Needs a bundle rebuild to ship.)

## Plugin shim: `generateImage` behaved like `generateText` (fixed, this session)

`makePluginShim` in `pjs.js` built a callable whose body *always* called `api.generateText`, so an
imported `text-to-image-plugin` answered as a text plugin: `await root.generateImage(...)` came back
as a string with no `.dataUrl`, and an image app silently never produced an image. It now dispatches
by plugin **name** (image vs text), normalises a string prompt into `{prompt}`, and returns the
**kv registry proxy directly** for a kv plugin (it is used as `root.kv.anyFolder.set(…)`). Found by
building the `image-generator` scaffold — nothing to do with that scaffold.

## RPC timeouts (this session)

`call()` in the sandbox had a blanket 60 s timeout, which turned a working slow generation into
`genesis rpc timeout: image`. Slow methods now have their own budget (`ai.start` 240 s, `image`
300 s, `upload` 180 s).

## `image-generator` scaffold (added, wiring verified)

Text→image: prompt box + one-click style chips, shape/seed controls with re-roll and **Variation**,
an honest moving spinner for the unmeasurable wait, a zoomable result with download, and a session
strip. Details in `src/scaffolds/README.md`. Two lessons worth keeping:

- A scaffold's `index.html` **must** end with `<script type="module" src="app.js"></script>`. Without
  it nothing runs and there is **no error at all** — that cost a debug cycle.
- `kit.js`'s `imageInfo()` returns **`bytes`**, not `size`, and its `label` already reads
  `512×512 · 24 KB`; use those.
- The seed is always rolled client-side when the box is `-1`, so the number shown is always the
  number that made the image (the plugin echoes `-1` straight back otherwise, which reproduces nothing).

**Blocking caveat (important):** the platform's image plugin, invoked from inside the editor tab,
has twice **blocked the whole tab for several minutes** while generating (evals, file tools and the
agent all stop; it did recover both times, but only after ~5 minutes, and one run never returned a
result at all). So a text→image project can be *built* here but its generation is best verified in
the exported generator. `src/skills/images.md` now leads with this.



- Core loop: prompt → tool blocks → files → preview → export.
- Mini pjs engine + sandbox injection (`root.list`, bare list names) — **including
  `{import:x}`**: an imported generator's `$output` now resolves (it used to render the
  literal text `import:animal`, then nothing at all).
- Sandbox RPC to the real plugins: `root.generateText` (streaming, incl. tolerating
  `onChunk: (text) => …`), `root.generateImage`, `root.kv.*` (set/get/entries/update),
  `root.superFetch`.
- `<self>` self-modification end-to-end: the agent read its own `prompt.js`, installed
  `src/skills/sound.md` into the overlay, reloaded itself, and the new skill appeared in its
  catalogue while running on the **custom core** (partial override over shipped sources). Now
  extended to *adding a capability*, not just editing text — see "Self-upgrade pass (done)".
- Freeze recovery: simulate a hung preview → next boot pauses auto-preview, shows the note,
  ▶ run resumes; `<check>` / "looks UNFINISHED" hints catch truncated files; native dialogs
  are blocked and reported.
- Error recovery: the agent found a planted `document.getElementByid` TypeError via
  `<preview/>`, fixed it with a single `<replace>`, and re-verified.
- Built apps play: the Star Catcher game animates, responds to keys, and uses `root.kv`;
  the AI Oracle streams a generated answer; the pjs project renders static and runtime list
  picks.
- Export: plugin imports detected from the app's code (`kv`, `generateText`), extras listed
  with a warning, zip produced; `$meta` preserved.
- Mobile 390×844: chat/work switching, chips, composer, no horizontal overflow.
- `<image>` asset generation into a project, `<define>` custom tools + invoking them.

## UX pass (done)

- First-run welcome block in the chat: what Agent 99 is, a 3-step loop, and example prompt
  cards that start a build on click (replaces the old one-line chips).
- `?` help modal in the header with a plain-language tour of every tab.
- Preview errors surface as an inline alert above the frame with **ask Agent 99 to fix**
  (and a console shortcut), instead of only living in the console.
- Re-worded chrome: tool cards read "wrote index.html"; status bar says "saved"; Self pane
  explains shipped / custom / failed states; Export pane copy rewritten.
- Inline "new project" form in the projects modal (no more native `prompt`).
- Mobile view toggle is now a labelled button; buttons no longer wrap.
- The shipped starter project is restored to its intended "Random Story Sparks" demo if a
  test run clobbers it (`makeStarterProject()`), so a fresh visitor sees a working example.

## Chat capabilities pass (done)

- **🧭 blueprint mode** — a button beside ▶ build. Mutating tools are refused, the run ends in
  `<blueprint>…</blueprint>` → `BLUEPRINT.md`, a "▶ build it" action appears, and later build
  runs get the plan as `<agreed_blueprint>`.
- **📎 attachments** — images, video (sampled into frames) and text files; visuals are folded
  into one labelled reference image and delivered correctly for vision, text files are inlined.
- **🎙 dictation / 🔈 read-aloud** — SpeechRecognition into the composer, speechSynthesis for
  replies (persisted setting), with friendly handling when the mic is blocked.
- **`<share path>` tool + share cards** — the agent can hand the user any project file as a
  download (or a public link with `link="true"`).
- **Chat-array aliasing fix** — the live chat list is now mutated in place and `persistChat`
  writes a copy, so a reply can no longer land in the wrong project's chat.

## Agent-competence pass (done)

- **Whole-page screenshots** — `capturePage()` renders the preview document (html2canvas,
  lazy, canvas fallback). The agent is no longer blind to DOM apps.
- **`<eval>` tool** — runs JS in the live preview and returns the value + any console errors
  it caused, so the agent can click buttons and assert behaviour. `domSummary` lists the
  clickable controls.
- **Forced verification** — one `VERIFY_INSTRUCTION` step before any build run that changed
  files can end; it must preview, drive the app, re-read and compare.
- **Honest output budget** — measured the real ~2500-char reply cut, rewrote the budget rules
  (files <1800 chars, prefer small files, walking skeleton), and added size warnings on
  oversized writes.
- **Reference + build side by side** — when the user attached an image, a preview screenshot
  is composed with it into one grid so the agent can compare target vs result.

## Audit pass (done)

- **`src/genesis/audit.js`** — a deterministic project audit: structure (unparseable/truncated
  JS, unbalanced tags, forbidden wrappers), element-id cross-checks (every lookup must have a
  matching id; bare `fooEl` globals included), plugin imports vs `root.*` usage, missing assets,
  safety (`while(true)`, native dialogs, `localStorage`), `$meta`, and a live pass (load errors,
  blank render, inert controls). Scored 0–100.
- **`<audit/>` tool** — the agent can run it any time (`path="…"` to focus a file,
  `run="false"` to skip the live pass); a dirty result comes back as an error so it can't be
  ignored.
- **Automatic audit at the verification step** — `agent.js` runs it once before a build run
  that changed files may end, and hands the agent the error list alongside `VERIFY_INSTRUCTION`.
  Verified with a stubbed model: the injected verify instruction contains the audit findings.
- **🔍 audit button + findings card** — runs the audit instantly for the user (no model call),
  posts a scored card of findings, and offers a one-click "ask Agent 99 to fix these".
- Mobile: the composer keeps its buttons on one line at 390px (labels collapse to icons) and
  the header no longer overflows (the project pill caps at 32vw).

## Self-upgrade pass (done)

The user's complaint: *"I asked it to build the blueprint function on itself and it wasn't
able to"* — a self-edit could reword the prompt, but adding a real **capability** failed. Root
causes were mechanical, not conceptual: the agent had to read 6–50 KB files to find anything,
a run had the same step budget as a normal build, and `index.html` (where all UI lives) is
unreachable by design with no alternative.

- **`<self op="list"/>` → a file map.** Returns `SELF_MAP`: each core file's size and one line
  on what it holds, so the agent knows where to look instead of paging through reads.
- **`<self op="grep" pattern="…"/>`** — searches its own source and returns
  `path:line: <verbatim text>` (plus `context="n"`), so it can land on the exact line and copy
  it into a SEARCH block. This is the single biggest step-saver for a self-edit.
- **8 bonus steps for a self-edit** — `agent.js` raises `stepLimit` past `maxSteps` as soon as
  a run uses `<self op="write|patch|revert">`, because a self-edit must find code, patch
  several files and then reload within one run.
- **`boot.js` refused** — `index.html` imports it directly, so a custom copy is inert; the tool
  says so rather than letting the agent burn steps on a no-op.
- **`ui.addToolButton` / `ui.addPane`** — new `ui.js` extension points, backed by `#extraTools`
  (composer row) and `#extraTabs`/`#extraPanes` (work area) in `index.html`. A self-edit can now
  add UI without touching the shell it can't edit. Feature buttons are disabled while busy.
- **`self-edit` skill** — the recipe book: workflow, file map, and copy-paste recipes for adding
  a tool, a button, a panel and a skill, plus the hard limits.
- **Verified end-to-end**: a scripted run drove the real agent loop — `list` → `skill` → `grep`
  ×2 → one `patch` (two edits to `tools.js`) → `reload` — and the reloaded custom core served
  the new `<coin>` tool (`executeTool("coin")` → "🪙 tails"). Extension points verified in the
  live DOM and visually. The overlay was then cleared (factory core) for the user.

## Truncation / honesty pass (done)

The user's verdict on the agent was *"I feel it's still stupid"* — and the project chat showed
why: one user request produced ~30 consecutive turns of "the previous turn was truncated"
(item 45→54: *"the previous turns were plagued by truncated files and failed replacements"*),
each pass leaving `index.html`/`app.js` more fragmented, and the run still ending on a confident
"fully operational". The model wasn't the only problem — the loop let a cut reply become a
half-written file, and let a run finish over a project the audit had just flagged as broken.

- **Truncated bodies are refused.** `CONTENT_TOOLS` + `seg.unclosed` in `agent.js`: if a reply's
  closing `</write>`/`</append>`/`</replace>`/`</define>`/`</self>` never arrived, nothing is
  installed. (Later superseded in part by the auto-continue pass above, which tries to *finish*
  the body first and only then falls back to this refusal.) The result says
  the platform cut the reply and how to resend it (~700-char `<write>` + ~700-char `<append>`
  blocks). Previously the partial body was installed on purpose ("so the work isn't thrown
  away") — that was exactly the disease.
- **`<project_health>` in every step's tail.** A static audit (`healthBrief`, refreshed after
  each tool batch) surfaces a broken file immediately. Verified: it reports
  "`[index.html] has 1 <style> but 0 </style> — an unclosed <style> swallows everything after
  it`" — the exact Mastermind bug.
- **Truncation-loop breaker.** `meta.unfinished` is set by `write`/`append`; two in one run and
  the task text is replaced with a change of tactics (minimal skeleton → `<preview/>` → one
  ~900-char piece per step). Verified: the loop-breaker task appeared after two unfinished
  appends.
- **The verify/audit step is now a gate.** While the audit reports errors the run cannot end:
  up to 3 rounds of "the audit STILL reports N error(s) — you may NOT finish yet", then an
  `unfinished` event → a plain **"⚠ Not finished"** card in the chat. Verified with a project
  holding a dead `getElementById`: the run never claimed success and the user was told.
- The prompt's budget section now says what actually happens to a cut body (it is completed
  automatically, and refused only if that fails), keeps bodies under ~1200 characters anyway
  because each extra call costs ~10s, and points at `<project_health>`.

## Auto-continue pass (done)

The last structural weakness in the truncation story: the agent knew how to *refuse* a cut
body, but not how to *save* one — so a genuinely long file still had to be hand-split into
~700-char pieces by a model that is bad at counting characters. This pass makes the loop finish
the job itself.

- **`completeCutReply` (agent.js).** A reply that arrives with a write-ish block still open is
  continued in-process: `host.ai` is called again with a *mechanical continuation* prompt —
  "output ONLY the raw remaining characters, starting at the exact character where this text
  stops; no preamble, no repetition, no code fences; write the closing tag when the body is
  done" — anchored on the last 1000 characters already emitted. Up to `MAX_CONTINUATIONS = 4`
  rounds, each streamed into the same chat message (`continuing` / `continued` events) so the
  user watches the file complete.
- **`cutPoint`** covers both shapes of cut: an open write block (`cutWriteBody`) *and* an
  opening tag truncated before its `>` (e.g. `<write path="sm`) — the second used to be
  invisible, because the block never parsed and the agent believed it had finished.
- **`stripContinuationOverlap`** de-duplicates each piece against the text before it (longest
  suffix of what we have == longest prefix of what came back, ≥48 chars). Verified byte-exact
  with a deliberate 90-char overlap and with a clean split.
- **The trailing `.trim()` had to go.** The first scripting pass found the assembled file was
  *exactly one space short*; the cause was `(full || "").trim()` on the reply — a platform cut
  lands right after a space, and trimming deleted it from the middle of the file. The reply is
  now kept verbatim (only `text.trim()` is used for the emptiness test).
- **A failed continuation still ends safely**: after 4 unclosed rounds the write is refused as
  before, the `continued` note drops to a warning ("that body was not saved"), and the refusal
  now sets `meta.unfinished` so two of them trip the loop-breaker.
- **The refusal advice is now tool-aware** (`truncatedWarning`). It used to tell the agent to
  resend *any* cut body as `<write>` + `<append>` — which for a cut `<self>` body pointed it at
  `<append path="src/genesis/…">`, i.e. at the *project*, not at its own core. Now a cut
  `<self>` says "send several small `<self op=\"patch\">` edits", a cut `<replace>` says "send
  smaller single-pair replacements", and `<define>` says one smaller tool block.
- **The auto-continue/refusal set is all content blocks** (`CONTENT_TOOLS` = `write`, `append`,
  `replace`, `define`, `self`). `replace` was added after finding that a cut one produced a
  bare "you never closed the tag" with no hint that the reply had been truncated (and, before,
  no way to recover it).
- **Verified** with a scripted model stub on a `page_refresh`ed page (no console errors):
  a 5.4 KB file split across three cut replies assembled byte-exact (clean split AND with
  overlap); a cut inside the opening tag recovered and wrote `small.js`; a cut `<replace>` body
  was completed and applied exactly; a continuation that never closes left the file untouched,
  warned the user, delivered a `<self op="patch">`-shaped truncation warning to the model, and
  tripped the loop-breaker on the second attempt. Prompt tokens: 3633 of a 4320 budget.

## Self-edit pre-flight (done)

The remaining way a self-edit could still hurt: a single missing `)` in a patched module made
the whole custom core fail to load, so boot silently fell back to the shipped source and the
agent's edit *appeared to do nothing at all* — the worst possible feedback, because it invites
the agent to "try again differently" on a change that was already correctly applied.

- **`selfEditGuard` (tools.js)** compiles the candidate source with `new Function` — parsed but
  never executed, so there are no side effects — after `stripModuleSyntax` neutralises
  `import`/`export` lines. A `SyntaxError` refuses the write with the parser's own message.
  Verified: `/^[ \t]*export\s+default/`, `export {…}`, `export function|class|const|let|var` and
  both `import … from "…"` and `import "…"` forms are all handled, and **all 13 core modules
  were checked to pass**, so the gate cannot false-positive on legitimate code.
- **Relative imports are resolved too** (`resolveModulePath` vs. `self.list()`), catching the
  other common self-edit mistake — a patch that imports `./utils.js` when the file is
  `util.js` — with the resolved path in the message.
- **Only NEW problems are refused.** If the previous version of the file was already broken
  (or already had that bad import), the edit is allowed, so the agent can iterate on a broken
  overlay instead of being locked out of fixing it. Verified by seeding a broken overlay through
  the store and then patching it twice.
- Markdown skills are exempt (they aren't compiled), and a clean install/patch now says
  "Pre-checked: it compiles and its imports resolve" so the agent knows the change is sound.
- Verified live via `executeTool("self", …)`: syntax error → refused with
  "missing ) after argument list"; `import … from "./ghost.js"` → refused with the resolved
  path; valid patch → installed, exactly one overlay file, then reverted to the factory core
  (state left clean: `selfIndex.length === 0`).

## Image engine + upscale tool (done)

The user's instruction was blunt: *"Are you doing the work genesis can do? You upgrade genesis."* So the image work became a **capability of Agent 99**, not a hand-built app.

- **`src/imagelab/`** — a verified in-browser neural upscaler (Real-ESRGAN on onnxruntime-web): a worker pool, tiled inference with smoothstep-feathered blending, a Cache-Storage model cache, 2/3/4/8x factors, transparency, abort, live per-tile partials, honest ETA. `README.md` in there documents the API, the measured numbers, the model licences, the rebuild recipe and the gotchas that cost hours (the tile row-index bug especially).
- **Named a real bug it took a diagnosis to find**: the accumulator indexed the tile's own output with the *input* row, so every tile read its top quarter — invisible to single-tile and origin-sampled tests and only obvious on a row-dependent channel. The coordinate-ramp test (`R=x, G=y` in, expect `X/4, Y/4` out) is the regression test; keep it.
- **One URL for built generators** — `api.js` is bundled (esbuild-wasm) to a ~30 KB ESM file, hosted, and verified standalone from the live page: `import * as lab from "https://user.uploads.dev/file/c0f6b7a40862febee037b413a9d20d42.js"`, 200² → 800² in 5.4 s. So any generator Agent 99 builds can upscale with one line.
- **`<upscale>` tool** (`factor`/`src`/`model`/`path`) — Agent 99 can itself upscale the image the user attached and write the result into the project. Verified end-to-end through `executeTool`: 96² → 192² in 1.8 s, a real PNG in the project.
- **`src/skills/image-engine.md`** — the agent's manual for building image tools (drop zone → live tile fill-in → draggable before/after → download → honest ETA). Registered in the skill catalogue, `SELF_MAP`, and the prompt's tool table.
- Two 200 px demo samples ship with it so an image tool is usable the instant it opens.

## Next

- [x] Staged pipeline (shipped): 🔭 scout → 🧭 blueprint → 🎯 align → ▶ build → 🧪 test (with 🙋 HANDOFF) → 🔥 attack → 📋 PIPELINE.md. Report-only modes with chained reports, read-before-probe gate on align, handoff detection on test finish.
- [ ] Shim `commentsPlugin` and `createServerSocket` for real (today: a labelled placeholder and
      an offline socket that fires `close`), so multiplayer/chat apps can be exercised in the
      sandbox rather than only after export.
- [ ] Share/import a project by URL (upload-plugin editable file, gzip+base64).
- [ ] Extend the audit: audit Agent 99's own core files before a `<self>` install (needs a
      project-aware overlay so index.html's ids are visible to the check), and add a
      "drive every control automatically" mode that clicks buttons and reports which throw.
- [ ] Diff view of each step's file changes.
- [ ] Warn the user when the editor and the agent both touch a file (currently the agent may
      overwrite an in-progress edit).
- [ ] Expose `maxStepsPerRun` / elapsed time in the UI; a run currently takes ~40s per step.
- [x] Give the agent a cheap way to *see* non-canvas layout → the preview now returns a live
      **controls map** (`domMap`) for test/attack runs plus the static `appContract` digest, and
      `capturePage` prefers a canvas's own pixels when the page is canvas-centric. Still worth
      doing: an explicit "measure this element's rect" helper so layout claims can cite numbers.
- [x] Rebuild the Image Lab bundle (`src/imagelab/build.mjs`) and swap the URL in every file.
      **v1.3.0** — `https://user.uploads.dev/file/c0f6b7a40862febee037b413a9d20d42.js` (51.6 KB):
      ships the `compare.js` ResizeObserver fix (coalesced into `requestAnimationFrame`) and the new
      kit `createSpinner()`. (Where the RO warning came from: the upscaler still logged
      `ResizeObserver loop completed with undelivered notifications` ×35 on the **old** hosted 1.2.1;
      the new bundle is what removes it — re-verified after the swap.)
- [x] Image family piece **image edited by text** — shipped as the `image-editor` scaffold + the
      `image-edit` skill (there is no img2img API, so it is a vision→redraw pipeline: the text plugin
      *looks at* the photo and rewrites it as one dense prompt with the change applied, then the image
      plugin draws that). The derived prompt is shown in an editable box so the pipeline is
      inspectable, and the result lands in a draggable before/after slider. Wiring verified live
      (audits 100/100, renders, 12 preset chips, compare widget mounted); the two model calls still
      have to be judged in the export because of the tab-blocking caveat above.
- [ ] Image family, next piece: **multi-image → one scene** (drop several, composite). Wants the kit
      (the editor scaffold is the closest base) plus a scaffold; same export-only caveat for its
      generation step.
- [x] A kit `createSpinner()` (indeterminate) — added in v1.3.0; the `image-generator` scaffold should
      now use it instead of its hand-rolled spinner (see the scaffold entry).
- [ ] Attached AUDIO files: we can't transcribe a file yet (the 🎙 path only covers live
      speech). Either decode + hash it into a labelled reference image, or find an STT route.
- [ ] Re-attach an old attachment's reference image when the user refers back to it — today the
      image is only present on the run that carried it.

## Known limitations

- A reply is cut off at ~1000 tokens. A cut **write** body is now completed automatically
  (up to 4 chained calls) and assembled byte-exact, and a body that still arrives unclosed is
  refused rather than installed — so truncation no longer corrupts files. What remains is
  *cost*: a multi-KB file takes several extra model calls, and a run can still stop early (the
  step limit) with the work unfinished (the "looks UNFINISHED" hint and `<project_health>` are
  the safety nets). Auto-continue covers every block whose body becomes real content —
  `<write>`, `<append>`, `<replace>`, `<define>` and `<self>` — so only a cut `<blueprint>` or
  `<ask>` body (both short by construction) falls through to the generic "you never closed the
  tag" note.
- The pjs engine is a subset: template-literal lists inside conditionals, most of the
  standard function library, and some `$meta` niceties are missing. Exotic imported
  generators may preview imperfectly (exports are unaffected).
- A custom core shadows `src/` until the user restores the factory core.
- Same-thread previews mean a *synchronous* infinite loop in a built app freezes the tab
  until the user reloads; Agent 99 then boots with auto-preview paused. A worker-isolated
  preview would fix this properly.

## Two probes that made Agent 99 call a working app broken (fixed, verified)

A 🧪 test run on the Omni Creator app concluded in prose that "the application is effectively a
non-functional prototype… the core features are severed from the runtime", and the user was then
asked to work through a `TEST-REPORT.md` full of invented breakage. Every control actually worked
(driven by hand: streamed chat, a real 512×512 image in 7.8 s, kv save/delete, accent persistence,
nav), so both conclusions came from **probes that cannot fail honestly**:

- **`Object.keys(root)`.** In the preview this returns `[]` — plugin accessors are not enumerable own
  properties. On a *real* perchance page it does not even return: it throws
  `TypeError: 'ownKeys' on proxy: trap result did not include 'prototype'` (reproduced on the live
  page). A critic that reads the empty list as "the runtime exposes nothing" concludes the exact
  opposite of the truth. Fixes: `sandbox.js` now exports `ROOT_PLUGIN_NAMES` and `run()` returns a
  `plugins` probe (`typeof root.<name>` for each), the host prints it as
  "plugins reachable right now: …" in every `<preview/>`, and both critic tasks carry an explicit
  "TWO PROBES LIE" paragraph. There is also a new audit check.
- **`el.onclick === null`.** True for every app that wires itself with `addEventListener` — the
  normal way — so "the primary buttons' handlers are null" was never evidence of anything. Rule now
  stated in both critic tasks: click the control and read the state back.

New audit check **`root-enumeration`** (`AUDIT_CHECKS` 12 → 13) flags `Object.keys(root)` /
`Object.values(root)` / `JSON.stringify(root)` / `for (k in root)` — but only in a file that also
uses a real `root.<plugin>`, so a local `root` variable (`#root` div, THREE.js object) never trips
it. Verified: 6 synthetic cases behave (warn on enumeration + real plugin use; silent for a local
`root`; silent for a clean `typeof` probe), and all ten real projects still audit **100/100** with
the new check in place.

## The user's projects collapsed into one umbrella (done, verified)

The user's instruction: *"I want them all under the umbrella UnrestrictedContentCreator."* Four of
the saved projects — **Upscaler**, **Mastermind** ("Cinematic Shot Extractor"), **TheFruitsOfEDEN**
and **Secret Flower** — were folded into the `UnrestrictedContentCreator` workspace (the "Omni
Creator" shell) as rail modules, and the originals were deleted afterwards:

- **Text** (chat, unchanged) · **Image** (unchanged) · **Upscale** (the whole upscaler: drop/paste,
  model + 2/3/4/8× factor, live tiles, before/after *and* vs-plain-resize compare, zoom, download,
  open-in-tab) · **Cinema** (subject + five selects built from new pjs lists `shotType`/`lighting`/
  `gear`/`stock`/`composition`, live prompt line, randomise, copy, "shoot it") · **Eden** (streamed
  story or an image, coloured by the lore facts in `root.kv.eden`; the original's "Video" button,
  which was a claim with no code behind it, is gone, as is its `exportManifestation()` call that
  threw a ReferenceError) · **Flower** (three pours, a line from the new `secret` list, memory in
  `root.kv.flower`) · **Data** · **Settings**.
- `app.js` gained one clearly marked block per module; the upscaler's widgets are built **the first
  time its tab is opened** (`ensureUpscale()` from `show()`), because the Image Lab widgets need a
  panel that actually has a box. The rail wraps to two rows under 640px (no horizontal overflow at
  390px).
- `main.pjs` now carries the two pjs lists (cinema's five, the flower's `secret`) beside the three
  plugin imports and an updated `$meta`.

**Verified by driving the live preview**: chat replies, a 512×512 image (18.5 s), a real neural
upscale (200×200 → 400×400 in 5.9 s, wasm, 4 workers), a 768×768 "shot", a streamed 1.5 KB Eden
passage, the flower blooming and remembering, a codex fact saved and deleted, the vault, accent
persistence, and the audit **100/100 / 0 findings**. Then the exported pair was installed into a
throwaway project and driven the same way (cinema's lists 8/9/7/6/6 populated, flower bloomed with
a secret, upscale widgets built, codex saved) — **no extras, two files, zero console errors**. Both
layouts were looked at (845px and 390px).
