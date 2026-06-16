# PHEROMONE TRAIL — CONTAMINATION AND TEST BOUNDARIES
**Run 122 | 2026-06-13 | Append-only defect/test reinforcement**
**Strength: 95/100** | Connects to: `phetrail-soul-contamination.md`, `phetrail-run106.md`, `phetrail-netpetai.md`

---

## SOUL CONTAMINATION PATTERN

`OPERATIONS/phetrail-soul-contamination.md:7-23`

Two contamination events share the same diagnostic signature:

- wrong envelope read,
- user extraction empty,
- fallback dumps entire file as SOV100 soul,
- `delta == rrlBytes`,
- no void endpoint exists to purge contaminated event.

`OPERATIONS/phetrail-soul-contamination.md:43-50`

Negative law:

- never trust `$obj.role` for Claude Code JSONL,
- never trust `$obj.role` for Kilo JSONL,
- always check `$delta == $rrlBytes`,
- no void endpoint means contamination cannot be purged via API,
- L32 ASSUME_FAILURE must hold during DEATH execution too.

---

## RUN 106 TEST BOUNDARY

`OPERATIONS/phetrail-run106.md:37-41`

Class preflight was shallow:

- 200 OK + truthy token/settings is not enough,
- robot-voice regression could pass,
- provider lock assertions are required.

`OPERATIONS/phetrail-run106.md:63-72`

Two lock tests were aimed at the wrong file:

- CORS/security lives in `router.js`,
- `index.js` tests can false-pass,
- F1-B proof using `sov100-` bypassed real quota path.

---

## NET-PET-AI TEST DISCIPLINE

`OPERATIONS/phetrail-netpetai.md:203-214`

Test suite lied until guards were made realistic:

- Playwright auto-scroll hid off-screen dead-end,
- websocket-opened guard was tautological,
- token-fetched guard checked request made, not response OK,
- failure-mode banner detection was text-scan false-positive.

Reinforced law:

- thumb-fidelity,
- every guard must be proven red on real failure mode,
- ground truth regression is the literal git commit that broke.

---

## CONNECTING KEYWORDS

`delta == rrlBytes` → `full file dumped as soul` → `no void endpoint`

`wrong envelope` → `Claude Code $obj.message.role` → `Kilo JSONL varies`

`test green` → `must fail on real broken commit` → `thumb-fidelity`

`sov100 exemption` → `F1-B proof bypass` → `real student quota path required`
