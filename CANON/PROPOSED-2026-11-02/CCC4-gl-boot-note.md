# CCC4 BLUEPRINT NOTE — gl true boot (2026-11-02)

Files: `src/gl-boot.js` (window.ObiGlBoot: build/cmd), `/gl` route in `src/app.js`, script tag in `index.html`.

Boot order (fail-closed, any step HALTs the rest):
1. CANON — fetch 3 local canon files, sha-256, anchor check (DO NOT EDIT / SOV100_ONLY / SCS).
2. FGA99 — fetch 5 staged corpus files (proposal, manifest, phoenix-fire, dedication, LFG addendum), sha-256, anchor check. Verdict STAGED, authority absence said aloud.
3. FGA99-AUTH — fetch authority `FGAgent999.MD` from canon branch live, anchor (BOOT GATE), pin version+sha.
4. POINT — normalize URL (strip trailing `/mcp`/slashes), enforce host pin (`pais-mcp-cloud.mrmichaelhobbs1234.workers.dev`), remember in `obi_runner_url`.
5. CONNECT — GET /health, POST initialize, POST tools/list. No inference spent. 5 tools expected.
6. RISE — audit prior DEATH from `obi_scs` (same seal SCS Stage 1 reads). Missing/invalid = gated.

MCP: Streamable HTTP, POST /mcp, JSON-RPC (initialize → tools/list → tools/call). Proven live: gateway_chat, openrouter_chat, edtech_build, phone_drop, git_read.
