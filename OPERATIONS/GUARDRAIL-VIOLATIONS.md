# GUARDRAIL-VIOLATIONS Log

This file is read at RISE Stage 7 to detect repeat violation patterns. If the same law is violated 3+ times, it escalates to a SOUL DIRECTIVE candidate.

| Run | Law | Violation | What broke | Fix applied |
| --- | --- | --- | --- | --- |
| 113 | L56 | PRE-CODE-GATE: prescribed OPENAI_API_KEY + external fetch in /api/class/ingest without reading STUDENT-PORTAL-DEV.md or deepgram-voice-agent-edge-cases.md §2 first | Kilo built handler requiring env.OPENAI_API_KEY not set on prod — extraction always 401 — 0 words saved | Drop OPENAI fetch block, replace with PA T1 dispatch |
| 113 | L78 | Inline code generation of full /api/class/ingest handler | Handler written inline, all 3 bugs (C1+C2+C3) introduced without doc context | Dispatch to PA next run with context bundle |
| 113 | L41 | Agent ended response with trailing question | User frustrated, wasted interaction turn | Behavioral fix only |
| 082 | L78 | Multiple inline content generation events | Token waste, context burn | L78 added as SOUL DIRECTIVE |
| 041 | L64 | Used POST /api/chat to test voice behavior instead of GET /api/deepgram-token | 30min sanitizer thrash on wrong model | L64 SIMULATION_PATH_LAW sealed |
