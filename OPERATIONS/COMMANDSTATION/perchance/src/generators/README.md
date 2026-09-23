# src/generators/ — the role scaffolds

One organism, many generators. Each folder here is a **ready-to-paste generator** for one role in
the constellation. Nothing in this folder is loaded by the station — these are templates you copy
into a new Perchance generator (or a Cloudflare Worker) when you build that piece.

The registry of every piece — what exists, what is scaffold, what is planned, what it needs — is
`src/constellation.js` (`/constellation` in the chat). The tool-level inventory is `src/ecosystem.js`
(`/tools`). This folder is the *body* of the planned generator roles.

## The recipe (every role follows it)

1. Create a new Perchance generator (name it per the role, e.g. `obi-practice`).
2. Paste `main.pjs` (the role's `$meta` + its imports).
3. Paste `index.html` (the shell).
4. In that generator's own `src/` folder, add:
   - `app.js` — the role's logic (fork the station's `src/app.js` when the role needs the same machinery)
   - `styles.css` — reuse the station's theme so the family looks like one family
   - `cgn-node.js` — **the node kit** (`src/cgn-node.js` here). Set `CONFIG.role` to this role.
5. Open the new generator once. It writes its node file and announces itself to the mesh.
6. On the station: `/netadd <generatorName> <role>` — now the station knows the role exists and
   will route work to it.

## The contracts every role obeys

- **Soul capture (L37–L39).** Whatever a human types into a role is captured **verbatim** before
  anything else happens, into that node's own ledger. No role is exempt, and no role edits words.
- **CGN node.** `cgn-node.js` with `CONFIG.role` set; it pulls the hub (whole-organism soul + laws)
  and pushes only its own new captures. Raw stays local (L44 raw ≠ soul).
- **Deep links.** A role must be openable from the station with its work pre-filled:
  - image — `?p=<prompt>` (generate this now)
  - ear — `?rec=<media url>` (listen to this now)
  - portal — `?student=<name>` (this is whose portal it is)
  - practice — `?topic=<x>&student=<name>`
  - watchtower — `?term=<label>`
- **Fail closed.** No role answers with something it did not measure or record. Missing input is
  reported, never invented.
- **Host-agnostic.** Anything a role fetches goes through `superFetch`, anything it stores that must
  outlive the tab goes through the ledger/kv — so a role can be moved to the self-hosted Cloudflare
  build (`src/cloudflare/`) without rewriting it. See `src/constellation.js` → `svc.host`.

## The roles

| role | folder | state | what it is |
|---|---|---|---|
| `image` | `src/image-node/` | **written** (reference implementation — the eye) | makes the pictures; the station routes `/img` here |
| `portal` | `student-portal/` | spec + shell | one per student — the student's own world (generalizes Timmy's Portal) |
| `ear` | `ear/` | spec | a disposable listener left in the room to capture long recordings |
| `practice` | `practice/` | spec | turns this week's evidence into drills the student can actually do |
| `watchtower` | `watchtower/` | spec | the teacher's board: every student, term progress, coverage vs syllabus |
| `site` | `site-builder/` | **built** (README + main.pjs + index.html + its own `src/`) — never yet pasted into a generator | the hand that puts a page on the web: a brief becomes one real, self-contained site, in the frozen brand or a client's colours |
| `video` | `video-node/` | **built** (README + main.pjs + index.html + its own `src/` — app.js · pulse.js · reel.js · story.js · drop.js · cgn-node.js) — exercised end to end in a harness, never yet pasted into a generator | **the drop station**: four doors in (**video · pictures · links · the owner's own words**) → stills, a timecoded sheet, **the pulse** (where the life in the footage actually is), vertical clips cut from the measured peaks, and the look in words; a live read of every link with **the link audit**; then research, a blueprint for the first prototype, orders, and **the three hands (image · copy · video) run for real** and re-audited — finished by **the gate**: READY TO EXECUTE / NOT YET COMPLETE / BLOCKED. Reads files off the disk, so the ~20 MB chat-attachment cap does not exist in it |

The `video` role is the **Web Development** division's second generator (`src/divisions.js` → `webdev`). It is the
front door of a client build and the eye that feeds the `site` role — one vision pass over a contact sheet
returns the brief the builder takes (`?brief=`) — and it is also the other half of that build: the reel that sells
the thing, the words that sell it, and the audit that says whether any of it may go out. Its deep link is
outbound only (`?brief=` into the builder); everything it takes in comes from the disk or from a page it fetched
live, not from the URL. Like every role it captures soul before it reads anything, and it fails closed: a browser
that cannot encode says so, a vision model that never received the picture is refused rather than filed as a
vibe, an unread page is recorded as **unproven** rather than absent, and the gate will not say *ready* while
anything in its own output is broken. **There is no separate `copy` role** — the copy hand is the register,
`video-node/src/story.js` (see `video-node/README.md` → *the three hands*).

The `site` role is the **Web Development** division's first generator (`src/divisions.js` → `webdev`). It
stands on the website machinery already in the tree — `src/cloudflare/` (the asserting host build), the
PrAis storefront on Cloudflare Pages, Timmy's Portal on a Cloudflare Worker, and the build-in-parts
machinery proven in `src/freephoenix.js` — and it is a *node*, so it captures soul and joins the mesh like
every other role. See `site-builder/README.md` for what it reuses and the two paths it deliberately does
not take itself (publishing, and writing the authority).

## The one thing blocking the mesh

`src/cgn-node.js` defaults to `anchorName: "obi"`, and **no generator named `obi` exists on
Perchance** (verified: the platform API returns `unfound` for `obi`, `obi-image`, `obi-station`, …).
The station is `net-studentfeedback-timmy`, and no hub file exists under either name. So before any
node can join:

1. Agree the anchor's real generator name (rename the station, or point the kit at its current name).
2. Set it in **one** place: `CONFIG.anchorName` in `src/cgn-node.js` **and** the default in this
   generator's `src/cgn.js` (the hub URL is built from it).
3. `/netjoin obi-network` on the station → creates the hub in *its* namespace.
4. Open each node once, then `/netadd <gen> <role>`.

Until then every role works **standalone** — it just does not know the whole organism yet.
