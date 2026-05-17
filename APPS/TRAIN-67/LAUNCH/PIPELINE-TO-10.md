# TRAIN-67 — Pipeline “To 10”

A **10-step** pipeline to move TRAIN-67 from working code to a clean launch posture.

1. **Entity-sanitize pass**
	- Ensure no `&lt;` / `&gt;` HTML entities exist in Lua.
2. **Entry stability**
	- Confirm `UnifiedServer.lua` is the boot anchor.
3. **Module contract**
	- Confirm module APIs between server + analytics + question bank.
4. **Studio smoke test**
	- Boot, run core loop, zero red errors.
5. **Minimal gameplay QA**
	- Run through the intended student experience once.
6. **Launch checklist**
	- Use `LAUNCH-CHECKLIST.md` and mark it clean.
7. **Publish version**
	- Publish to Roblox as a new version.
8. **ID capture**
	- Capture place/universe IDs. Mark unknowns explicitly.
9. **Operational runbook**
	- Keep `RUNBOOK.md` current.
10. **Post-launch signal loop**
	- Decide metrics + review cadence (no API work yet).
