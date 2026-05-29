# PHOENIX VERIFICATION PROTOCOL v1.0
## Designed by PA Qwen Max — Run 23 Death | 2026-05-29

> "why would you ask me to test before this was done" — SOV100 Michael Hobbs, Run 23

---

## 1. THE LAW

Agent 99 NEVER says "test this" or "try it" without completing this checklist.
Michael Hobbs is the System Operator, not QA.
All defects found and fixed internally before any human interaction.

---

## 2. CF WORKER VERIFICATION CHECKLIST

Run sequentially. Do not skip. Do not proceed on failure.

```
[ ] Syntax: node --check src/index.js → exit code 0
[ ] Syntax: node --check public/chat.js → exit code 0
[ ] Deploy: npx wrangler deploy → "Uploaded" + "Deployed" + Version ID
[ ] Tail: npx wrangler tail --format=json (30s window)
[ ] Health: curl /api/health or /api/heartbeat → 200
[ ] No hung errors in tail: "Workers runtime canceled" = FAIL
[ ] No UncaughtException in tail
[ ] No 5xx responses in tail
```

---

## 3. DEEPGRAM VOICE AGENT VERIFICATION CHECKLIST

Prerequisite: CF Worker checklist above passed.

```
[ ] Token endpoint: curl /api/deepgram-token?studentId=quy-bluetech → 200
[ ] Token is JWT: response.token starts with "eyJ" (not raw 40-char key)
[ ] Settings present: response.settings.type === "Settings"
[ ] Listen model: response.settings.agent.listen.provider.model === "nova-3"
[ ] Think model: response.settings.agent.think.provider.model === "gpt-4o-mini"
[ ] Speak model: response.settings.agent.speak.provider.model starts with "aura-2"
[ ] Vocab save: POST /api/agent/vocab with {studentId, word} → {ok: true}
[ ] Wrangler tail: 30s window shows no Deepgram errors
```

---

## 4. BROWSER-SIDE BOUNDARIES

**Agent 99 can verify without browser:**
- All endpoint status codes
- All response payload structure
- All log patterns for 30s+
- JWT format and TTL
- Vocab injection confirmed

**Only Michael can verify:**
- Actual voice conversation (mic capture + playback)
- Latency perception
- Browser console errors live

**GATE: All server-side checks must pass before asking Michael for browser test.**

---

## 5. REPORT FORMAT (when all checks pass)

```
VERIFIED: [System Name]
PASSED:
  - Token endpoint: JWT received (eyJ..., 485 chars, TTL 120s)
  - Settings: nova-3 / gpt-4o-mini / aura-2-asteria-en / speed 0.85
  - Vocab save: {ok: true} in 45ms
  - Wrangler tail: 30s clean (0 errors, 0 hung)
USER EXPERIENCE: [What Michael will actually see/hear]
```

Prohibited: "should work" / "might need testing" / "appears functional"
Only verified facts with measurable evidence.

---

## 6. FAILURE HANDLING

1. Check fails → diagnose silently
2. Fix → re-deploy → restart checklist from step 1
3. Repeat until all checks pass
4. After 3 cycles on same defect → report BLOCKED with full diagnostic
5. **NEVER report intermediate failures as testable**

---

## 7. THE DEEPGRAM LOOP DIAGNOSTIC

If the magic chat shows "Connecting... Reconnecting..." loop:

```
1. Check wrangler tail for "Workers runtime canceled" → CF Worker issue
2. Check /api/deepgram-test → confirm status:101, hasWebSocket:true
3. Check /api/deepgram-token → confirm JWT (not raw key)
4. Confirm token sent as [jwt, "token"] order in WS constructor
5. Check Settings payload: context.messages at ROOT, no client_side field
6. Check functions array: valid JSON schema, no extra fields
```

Only deploy a fix after identifying the specific step that fails.
