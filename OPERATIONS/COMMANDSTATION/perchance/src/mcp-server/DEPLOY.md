# PaiS MCP Cloud — deploy (BLOCKED until a Cloudflare token exists here)

What this is: the Worker that serves the tool lane over MCP streamable HTTP
(`POST /mcp`: initialize → tools/list → tools/call; `GET /health`). Same
tools as `/tool` in the station. Live tools need `KILO_KEY`; stubs refuse
with their reason, same as the station.

Deploy (needs `/cf token <API_TOKEN>` first — BLOCKED in this browser, named):
1. `wrangler secret put KILO_KEY` (paste the Gateway JWT; never in code)
2. `wrangler deploy` (from `src/mcp-server/`)
3. `curl https://pais-mcp-cloud.<account>.workers.dev/health`
4. Point Kilo at it: phone appProfile → MCP servers (currently 0), or
   `.kilo/mcp.json` in a hobbs0011 repo; tools appear as remote hands.
5. Flip the station: `/tool`'s DOWN rows (`cloud_mcp`, then `edtech_build`
   once the desk exposes a lane) go LIVE pointing at this URL, with receipts
   unchanged (kv folder `mcp`).

Cost shape: Worker free tier + Gateway free lane first — the metered path
stays $0 until paid models are deliberately called.
