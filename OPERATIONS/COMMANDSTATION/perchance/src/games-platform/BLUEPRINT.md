# PAI S GAMING PLATFORM — BLUEPRINT (the estate's own EdTech games)

> Status: SCAFFOLD. The blueprint is decided, the first playable prototype
> (`arena.html`) runs in this tree. It is not a shipped generator yet — the path
> to one is step 7 below. Ported from the edtech station's prototype 2026-10-21
> (Hobbs {ALOT+MMM}: take the honed work, keep training it). Nothing here is
> called live that is not.

## 1. What was measured (not invented)
- **Baamboozle SSR** (read live 2026-10-21, 16 `/game/<id>` URLs): classic board
  is 16 tiles (`cardCount = 16`), Q&A modals carry point values, play surface
  supports 7 teams, modes are Play/Study/Slideshow, `powerUpIds` run 1–17 (names
  live in the play bundle, NOT in SSR — unmeasured, never claimed). The search
  page serves the identical Next.js shell — no scrapeable library.
- **Classroom shape**: single screen, teacher-operated, no student devices.
  That is the format to beat — it is why Baamboozle won classrooms.
- **Sibling gaming station** (`…-agent99-gamingcommand`, measured live via the
  generators API 2026-10-21): 2105 chars of code, NO Roblox refs, NO game
  division — a stub. The platform is OURS to build; the seat is empty.
- **Lesson engine** (this station): scramble/match/sort/order/odd/flip runtime
  + battle + storm (hidden-tile risk) + board (category cells), 10-5-5-3 method,
  coins HUD, KSU outcomes + support/extend differentiation, game lifelines. The
  arena reuses the coin vocabulary and the differentiation contract.
- **Open seat**: GitHub classroom-game field measured empty (jeopardy 1 repo,
  tornado 2, all 0★). No incumbent tooling.
- **Baamboozle is proprietary.** Mechanics were OBSERVED (tile counts, point
  values, team play). No Baamboozle code, assets, questions, or power-up names
  are copied. `arena.html` is original code + original sample questions.

## 2. The platform (three bodies, one OS)
1. **Web arena** (this shelf's build): single-screen classroom games that run
   from one file, offline. Game 1 is the tile board (`arena.html`).
2. **Lesson blades**: arena games fed by lesson evidence — Q&A banks generated
   from a class's OWN transcripts (verbatim-first: a question cites the line
   it came from). The Student Evaluator grows the question bank every class.
3. **Roblox mirror**: the Tiger fantasy carries the same palette (G444) and the
   same coin vocabulary; the shared Q&A bank format is JSON:
   `{"q":"…","answers":["…"],"support":"lifeline hint","extend":"stretch follow-up","source":"transcript line or lesson ref"}`.
   Sample bank ships inside `arena.html`. Real banks come from `/transcribe` →
   `/summary` evidence, one bank per class, filed in kv beside the writeups.

## 3. Game 1 — tile board (SHIPPED as prototype)
4×4 tiles. Most hide point values (10/15/20); five hide specials of our own
design: 2× Double (+30), 1× Half (+8), 1× Swap (steal 15 from the other team),
1× Storm (−20 own, floor 0 — the class groans, the room wakes up). Teacher
opens a tile, asks the room, marks Correct/Wrong; points land on the active
team (tap a team to hand over). First to 150 takes the round. Every question
carries a lifeline hint (support) and a stretch follow-up (extend) — the LPG
differentiation contract, on the board. Pheromone trails point at every
adoption; each death (bad cut) is fuel for the next round.

## 4. Doctrine bindings
- Verbatim-first: bank questions cite their source line; invented questions are
  labelled invented, never filed as evidence.
- Fail-closed: a tile with no question behind it does not open.
- No student data in public source: banks built from real classes live in kv,
  never in `src/`. The shipped sample bank is synthetic.
- Brand: G444 tokens only; the arena never restyles lessons.
- Clone mechanics, link out optionally, depend on nothing (sandbox rule).

## 5. What is NOT yet built
Power-up names (unmeasured — next exterior probe), bank generator from
transcripts, Study/Slideshow modes, online multiplayer (server-plugin mesh),
the PaiS Gaming generator itself, the Roblox Q&A bridge.

## 6. Path to live (in order)
1. Playtest `arena.html` in classrooms; fix by evidence. 2. Bank generator:
   transcript → Q&A bank filed in kv. 3. Two more arena games from the same
   bank format (jeopardy-style board, storm variants — the lesson engine
   already ships both). 4. Paste `src/games-platform/` into its own generator
   → PaiS Gaming opens → this shelf entry flips to live. 5. Roblox bridge: same
   bank JSON drives the quiz gates.
