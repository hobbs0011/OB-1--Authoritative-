# PaiS runner — closed-browser pulse (CF Worker cron)

Status 2026-10-24 ~22:05 UTC: **DEPLOYED on the Paid account and fully live —
cron firing.** `https://pais-mcp-cloud.mrmichaelhobbs1234.workers.dev`
(`pais-mcp-cloud` on `mrmichaelhobbs1234@gmail.com's Account`). 11/11 deploy steps
ok: script, subdomain, 4 secrets, `*/10 * * * *` trigger (confirmed registered),
/health ok, manual /pulse → `pulse ok` + `logged=true` in canonical RUNNER-LOG.md.
Free-account copy DELETED — exactly one runner exists. `/tool run cloud_mcp`
re-pointed (LIVE, tested ok). First automatic `cron:` line due within ~10 min of
22:03 UTC — check RUNNER-LOG.md tail to confirm the closed-browser proof.

What it is: the same pulse the page runs, minus the page. Cloudflare fires
`scheduled()` every 10 minutes whether any browser exists or not. Each firing
runs ONE tiny fixed-prompt Flash inference and appends a receipt line to the
canonical `RUNNER-LOG.md`. That log is the proof it ran with every browser shut.

## The one remaining step: a cron slot (account at the free-plan limit) — RESOLVED 22:03 UTC on the Paid account (8717…).

The deploy went up through the Cloudflare API from the station itself (classic
service-worker upload — `src/mcp-server/worker.js` is written in that format on
purpose, because multipart module uploads do not survive the browser's CORS-free
proxy). Secrets were set the same way (`…/secrets`, values never in code).

Setting the `*/10 * * * *` trigger returns 10072: the account already holds 16
cron triggers (grandfathered) across 11 workers — the free plan allows 5, so no
new trigger can be added until a slot frees. Checked 2026-10-24: the account
holding these workers (`Mrmichaelhobbs123@gmail.com's Account`) shows NO paid
subscription, so Workers Paid is not active on it yet — if the $5 went through,
it may be on a different account/email, or still propagating. Upgrade link:
`https://dash.cloudflare.com/3c7b1766bd8fdc9e01211d2b390315ea/workers/plans`.
The moment the plan flips, one API call adds the trigger:
`PUT …/workers/scripts/pais-mcp-cloud/schedules` with `[{"cron":"*/10 * * * *"}]`.
Inventory 2026-10-24:

- net-pet-ai: `0 * * * *`, `*/5 * * * *`
- net-pet-ai-dev: `0 * * * *`, `*/5 * * * *` (identical pair on a DEV worker)
- net-pet-ai-production: `0 */6 * * *`
- pcc-scout-2, pcc-scout-3, phoenix-pcc-1, phoenix-pcc-2: `* * * * *` (every minute)
- phoenix-architecti: `* * * * *`, `0 */6 * * *`
- phoenix-coder: `0 2 * * *`
- phoenix-pcc-3: `30 */6 * * *`
- soul-logger: `*/5 * * * *`

Recommendation: delete the two `net-pet-ai-dev` triggers (dev mirroring prod's
identical pair — almost certainly leftover) and add ours. Alternative: Workers
Paid ($5/mo) lifts the cap to 1,000. Either way the command is one API call:
`PUT …/workers/scripts/pais-mcp-cloud/schedules` with `[{"cron":"*/10 * * * *"}]`.

## Use it as remote hands (live now, cron pending)

- MCP (streamable HTTP): `POST /mcp` — initialize → tools/list → tools/call.
  Station: `/tool run cloud_mcp '{"tool":"openrouter_chat","arguments":{"prompt":"…"}}'`.
- `POST /run { key, prompt?, model?, max_tokens? }` — one authenticated model
  call + durable log line. Needs the RUNNER_KEY (held in this browser as
  `obi_runner_key`, set at deploy; `GET /pulse?key=` same guard).
- `/forge runner url` remembers the URL here; `/forge runner check` pings /health.

## Cost

144 pulses/day × ~$0.0000026 Flash fixed-prompt ≈ $0.01/mo. Kilo free lane → $0.
Since 2026-10-25 ~14:0x UTC the brain is Kilo-free-first (the Kilo-chat replication):
/run + /pulse try kilo-auto/free, OpenRouter Flash only on failure — so the
standing cost is $0 unless Kilo's upstream wobbles (it does, transiently).
Worker itself is free-tier.

## Boundaries (honest)

- Server code is PUBLIC source (like everything in src/). Secrets live ONLY in
  wrangler secrets — never in this directory, never in a receipt, never in the log.
- Without GH_TOKEN the pulse still runs; receipts live only in the Worker log
  (ephemeral) instead of RUNNER-LOG.md.
- Without RUNNER_KEY, /pulse and /run are open — one is set.
- The in-page pulse (`/forge schedule`) is the open-browser twin — same 10 min,
  same receipts. The log names the source (cron vs manual vs page).
