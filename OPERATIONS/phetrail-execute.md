# phetrail-execute.md — Pheromone Trail: NET-PET-AI Execution

---
## Run 114 Audit — 2026-06-10

### L77 TRIGGER: MISTAKES_MADE — BUG-NEW-1 (regression from Bug 2 fix)
Bug 2 fix (mode screen always-shown) introduced a new regression.
confirmLandingMode() at chat.js:1929-1932 calls window.history.replaceState injecting ?mode=X into URL.
On next page load, urlMode is non-null → if(urlMode) branch at chat.js:2009 skips landing.
Original bug returns one session later. Fix: remove url.searchParams.set('mode', currentMode) from confirmLandingMode(). Mode stays in localStorage only, never URL.

### L77 TRIGGER: BUG_ROOT_CAUSED — EC-15 keepAliveHandler leak confirmed
keepAliveHandler defined inside SettingsApplied closure (chat.js:1143). Reference lost on exit.
document.addEventListener('visibilitychange', keepAliveHandler) at line 1152 adds permanent listener each reconnect.
onAgentDrop cannot removeEventListener — different closure reference. After N reconnects = N concurrent handlers.
Fix: move keepAliveHandler to module scope, store ref, call removeEventListener in onAgentDrop.

### AUDIT FINDINGS SUMMARY — Run 114

P0 - BUG-NEW-1: mode landing regression (chat.js:1929-1932) — replaceState pollutes URL
P0 - EC-15: visibilitychange listener leak (chat.js:1152) — confirmed, closure scope issue

P1 - SEC3: admin PIN = student password 'bluetech2026' (index.js:2183, 2349) — exploitable NOW
P1 - x-pa-auth CSRF bypass: any value accepted (router.js:39) — needs value validation vs PA_AUTH_KEY

P2 - CORS DELETE missing (security.js:177) — GDPR erasure from browser fails preflight
P2 - class_transcript plaintext (index.js:2119) — no kvEncryptPut, inconsistent with other PII
P2 - GDPR export missing class_transcript (router.js:203-214) — verbatim speech PII not exported
P2 - TRUSTED_ORIGINS missing naturalenglishtraining.com (router.js:31-35) — POST blocks if portal on main domain

P3 - EC-21: CLIENT_MESSAGE_TIMEOUT (chat.js:1135) — JSON KeepAlive only, needs binary PCM16 during agentPlaying
P3 - EC-22: silence nudge no watchdog (chat.js:1469) — InjectAgentMessage silent drop = OBI silent forever

P4 - DEATH EC-43: JSONL grabs wrong file (Get-ChildItem -Recurse on full tree)
P4 - DEATH EC-44: soulcount=0 no retry
P4 - RISE EC-45: kiloGap reads pipeline-run{N}.json not pipeline-run{N-1}.json

P5 - index.js:5 stale OPENAI_API_KEY in header comment
P5 - admin subscriptions hardcode [huong,mai-tram] not roster-driven (index.js:2158)
P5 - landingSeen dead code (chat.js:2007) — declared not used, still written at 1929/1945
P5 - EC-37: audit_log vs audit_log_v2 mismatch in metrics
P5 - EC-47: sov100 prefix bypass unbounded
P5 - ScriptProcessor deprecated (chat.js:1563)
