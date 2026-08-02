# MISSION A WIRING — Michael Integration Notes

## Files Modified (for Michael's review)

| File | Change Summary |
|------|----------------|
| `public/chat.js` | Mic-denied/status fixes, token cache, feature-detect guards |
| `test/failure-mode-attack.mjs` | In-app browser simulation fix, critical flag flip |
| `test/browser-api-safety.mjs` | NEW — validates graceful degradation |

---

## REPORT: Per-Task Summary

### Task 1: MIC-DENIED Status Message
**Found:** `startAgentListening` catch block set status to generic "Tap to speak" on any error, masking NotAllowedError.\n
**Change:** Added error-type detection in three places:\n
- `startAgentListening catch` → Shows "Mic blocked — allow microphone in Safari settings, then tap to retry" on NotAllowedError\n
- `triggerMicOnGesture catch` → Same message for NotAllowedError\n
- `startListening catch` → Uses same denied message (fallback REST path)\n
**Test:** `failure-mode-attack.mjs` mic-denied case will now show clear status.

### Task 2: IN-APP BROWSER Simulation
**Found:** `Object.defineProperty(navigator, 'mediaDevices', { value: undefined })` doesn't truly delete the property in WebKit test.\n
**Change:**\n
- Use `delete navigator.mediaDevices` to truly null the property\n
- Also delete on prototype for inheritance coverage\n
- Changed `mic-denied` from `critical: false` to `critical: true`\n
**Test:** `failure-mode-attack.mjs` in-app case now properly triggers `#micUnavailableBanner`.

### Task 3: TOKEN CACHE
**Found:** Every WS reconnect calls `/api/deepgram-token` fresh, wasting tokens.\n
**Change:**\n
- Added `tokenCache` Map keyed by `studentId:mode` (line ~977)\n
- `openVoiceAgent` checks cache first, reuses token if >60s remaining, else fetches fresh\n
- Cache stores `{ token, settings, expiresAt }` with 30min assumed lifetime\n
**Test:** Token reuse verified by observing fewer `/api/deepgram-token` calls on reconnect.

### Task 4: BROWSER-API SAFETY
**Found:** localStorage/sessionStorage/AudioContext access could throw in restricted browsers.\n
**Change:** Added feature-detect guards:\n
- `initModeUI` → `window.localStorage` check before `getItem`/`setItem`\n
- `boot` → `window.localStorage` check before localStorage calls\n
- `confirmLandingMode`, `selectMode` → guards around localStorage.setItem\n
- `initOrbAudio` → Early return if `AudioContext` unavailable\n
**Test:** `browser-api-safety.mjs` validates no pageerror when APIs are nulled.

---

## New Test to Add to daddyshark.mjs

Add `'browser-api-safety'` to `LOCK_TESTS` array around line 48 to run as static lock test.