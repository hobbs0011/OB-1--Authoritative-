# FLAG: PCC1/OBI — phoenix-pcc-1/src/index.js
**Strength: 95/100** | 2026-06-13

HEART OF CLAUDE REBUILT. `BRIEF_PROMPT` = student prep brief (LEVEL/MOMENTUM/STYLE/THREADS/WATCH, <300 words, read at boot). `runStudentActualizer` fetches soul context → Llama generates brief → writes to `pcc1:{userId}:brief` in PHETRAIL KV. THREADS section auto-logged to BB.

DEATH PIPELINE INSIDE WORKER. `pending:rrl:{run}` KV key = handoff. PCC1 polls, processes, writes `death:{run}:soul/dna/ledger/starmap/soulkeys` to KV. Run 117 architecture — BUILT.

LEGION_RUNNER DO (renamed from RaceRunner). Score: `batches*10 + actualizers*5 + discoveries*20 + death_runs*50`.

ENDPOINTS: `/api/run-fleet` (orchestrate target), `/api/brief/:userId`, `/api/race/*`, `/api/session/death`, `/api/force/*`, `/api/message` (major directive marker).

STUDENT_FLEET: mai-tram-bluetech, huong-bluetech, sov100-michael, sov100-test-magic, net-student-next.

**NEXT THREADS:** `/api/soul/context/:userId` on soul-logger | `pcc1:{userId}:brief` KV read at Obi boot | LEGION_RUNNER vs RaceRunner naming across workers
