# QuestionBankV2 — Studio Integration Notes (Chunking + Registration)

## Goal
Get `QuestionBankV2.lua` loading cleanly in Roblox Studio with **chunked questions** (so we can scale past a single giant Lua table) while staying compatible with `UnifiedServer.lua` boot order.

This doc is **Studio-first**: it tells Michael exactly what folders/names to create in Studio and what the code expects.

---

## Required Studio Structure
Create this folder tree in **ServerScriptService** (or wherever `UnifiedServer.lua` lives, as long as the module paths match your require calls):

- `ServerScriptService`
	- `QuestionChunks` *(Folder)*
		- `Chunk_001` *(ModuleScript)*
		- `Chunk_002` *(ModuleScript)*
		- ...

### Chunk module contract
Each chunk ModuleScript must return either:

### Option A — list of question objects
```lua
return {
	{ id = "Q001", prompt = "...", answer = "...", tier = 1 },
	{ id = "Q002", prompt = "...", answer = "...", tier = 1 },
}
```

### Option B — map keyed by id
```lua
return {
	Q001 = { id = "Q001", prompt = "...", answer = "...", tier = 1 },
	Q002 = { id = "Q002", prompt = "...", answer = "...", tier = 1 },
}
```

Both are acceptable as long as every question has a stable `id`.

---

## Naming Rules (Fail-Closed)
- Chunk modules must be named: `Chunk_###` (3 digits)
	- Valid: `Chunk_001`, `Chunk_012`, `Chunk_130`
	- Invalid: `chunk_1`, `Chunk1`, `Chunk-001`
- Question IDs must be **unique globally** across all chunks.
- If a chunk fails to load, the system should:
	- log the chunk name
	- skip the chunk
	- continue booting (unless you want hard-fail; choose one behavior and keep it consistent)

---

## Boot Order Expectation
Recommended boot order inside `UnifiedServer.lua`:
1. Load / init `QuestionBankV2`
2. Then init gameplay systems that consume questions (FTUE, Elo, Combat-English bridge)

If `QuestionBankV2` loads lazily, make sure consumers can handle `GetQuestionById(id) == nil` without crashing.

---

## Studio Smoke Test (2 minutes)
Run in **Server** test mode:
1. Start server
2. Confirm output prints:
	- `QuestionBankV2: loaded chunks = N`
	- `QuestionBankV2: total questions = M`
3. Call a small query from the command line / a temporary test script:
	- `print(QuestionBankV2.GetRandomQuestion(1))`
4. Verify it returns a real question object

---

## Common Failure Modes
- **Module path mismatch** — Studio folder location not matching `require()` path.
- **Chunk returns wrong type** — returns a single object instead of table.
- **Duplicate IDs** — later chunk overwrites earlier one (or triggers assertion if you add one).
- **Syntax artifacts** — any `&gt;` / `&lt;` remnants will hard-break Lua.

---

## Minimal Decision Needed From Michael
Pick one:
- **Soft-fail chunks** (skip bad chunk, boot continues) — recommended for speed
- **Hard-fail chunks** (error and stop boot) — recommended for early QA discipline

If you do not decide, default = `Soft-fail`.
