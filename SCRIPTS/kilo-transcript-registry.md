# KILO TASK — Session Transcript Persistence + Student Registry
## Tier: T2 Sonnet | Model: claude-sonnet-4-6 | Owner: SOV100 Michael Hobbs
## Repo: D:\OB-1-CANONICAL | App: APPS/NET-PET-AI

---

## CONTEXT — WHAT THIS IS

NET-PET-AI is a Cloudflare Workers app (no Node runtime — CF Workers only). Students talk to "Obi", an AI English tutor powered by Deepgram Voice Agent API. Each conversation session generates a `chatMessages` array of `{role, content}` objects (capped at 20 messages). Right now, only metadata is saved at session end (turns, duration, vocab). The full conversation text is lost when the page closes.

Michael (the teacher/operator) wants the full conversation transcript saved for every session so he can:
1. Review what was actually said
2. Feed past transcripts to Kilo for analysis
3. Give Obi memory of specific things said in prior sessions (not just a synthesized world model)

---

## WHAT TO BUILD — 3 PARTS

### Part 1: Server — POST /api/transcript (save)

**File:** `APPS/NET-PET-AI/src/index.js`

**Where to insert:** After the existing `POST /api/agent/session` handler at line ~1406. Use the same pattern.

**Pattern to follow (from existing code):**
```javascript
// existing pattern used throughout:
const idCheck = validateStudentId(studentId);
if (!idCheck.valid) return addCors(json({ error: idCheck.error }, 400), request);
const rosterCheck = validateActiveStudent(studentId);
if (!rosterCheck.valid) return addCors(json({ error: 'student not authorized', code: 'NOT_IN_ROSTER' }, 403), request);
// ...
await kvEncryptPut(env.STUDENT_MEMORY, key, value, env.ENCRYPTION_KEY);
```

**New endpoint spec:**
```javascript
if (path === "/api/transcript" && method === "POST") {
  const body = await request.json().catch(() => ({}));
  const { studentId, messages, mode, turns, durationMs, vocab } = body;

  // 1. Auth gates (same pattern as /api/agent/session)
  if (!studentId) return addCors(json({ error: "studentId required" }, 400), request);
  const _tidCheck = validateStudentId(studentId);
  if (!_tidCheck.valid) return addCors(json({ error: _tidCheck.error }, 400), request);
  const _trosterCheck = validateActiveStudent(studentId);
  if (!_trosterCheck.valid) return addCors(json({ error: 'student not authorized', code: 'NOT_IN_ROSTER' }, 403), request);

  // 2. Guard: only save if there's actual conversation content
  if (!Array.isArray(messages) || messages.length < 2) {
    return addCors(json({ ok: true, saved: false, reason: "too short" }), request);
  }

  // 3. Cap and sanitize messages
  const safeMessages = messages
    .slice(-20)
    .filter(m => m.role === "user" || m.role === "assistant")
    .map(m => ({ role: m.role, content: (m.content || "").slice(0, 2000) }));

  // 4. Build transcript record
  const ts = Date.now();
  const headline = safeMessages.find(m => m.role === "assistant")?.content?.slice(0, 80) || "Session";
  const transcriptKey = `transcript:${studentId}:${ts}`;
  const record = {
    studentId,
    ts,
    date: new Date(ts).toISOString(),
    mode: (mode || "free").slice(0, 20),
    turns: Math.min(turns || 0, 9999),
    durationMs: Math.min(durationMs || 0, 86400000),
    vocab: (vocab || []).slice(0, 50),
    headline: headline.slice(0, 120),
    messages: safeMessages
  };

  // 5. Size guard: reject if serialized > 100KB
  const serialized = JSON.stringify(record);
  if (serialized.length > 100000) {
    return addCors(json({ error: "transcript too large" }, 413), request);
  }

  try {
    // 6. Save full transcript (encrypted)
    if (!env.STUDENT_MEMORY) return addCors(json({ error: "storage unavailable" }, 503), request);
    await kvEncryptPut(env.STUDENT_MEMORY, transcriptKey, record, env.ENCRYPTION_KEY);

    // 7. Update index (lightweight list of session stubs, no messages)
    const indexKey = `transcript_index:${studentId}`;
    const index = await kvDecryptGet(env.STUDENT_MEMORY, indexKey, env.ENCRYPTION_KEY) ?? [];
    index.push({ key: transcriptKey, ts, date: record.date, mode: record.mode, turns: record.turns, headline: record.headline, vocab: record.vocab.slice(0, 5) });
    await kvEncryptPut(env.STUDENT_MEMORY, indexKey, index.slice(-50), env.ENCRYPTION_KEY);

    return addCors(json({ ok: true, saved: true, key: transcriptKey }), request);
  } catch (err) {
    return addCors(json({ error: err.message }, 500), request);
  }
}
```

---

### Part 1B: Server — GET /api/transcript (retrieve — admin only)

**File:** `APPS/NET-PET-AI/src/index.js`

**Add immediately after the POST handler above.**

```javascript
if (path === "/api/transcript" && method === "GET") {
  // Admin-only: requires WORKER_ADMIN_KEY header
  const adminCheck = checkAdminKey(request, env);
  if (!adminCheck.ok) return addCors(json({ error: "admin key required" }, 401), request);

  const studentId = url.searchParams.get("studentId") || "";
  const transcriptKey = url.searchParams.get("key") || "";

  if (!studentId) return addCors(json({ error: "studentId required" }, 400), request);
  const _gIdCheck = validateStudentId(studentId);
  if (!_gIdCheck.valid) return addCors(json({ error: _gIdCheck.error }, 400), request);

  if (!env.STUDENT_MEMORY) return addCors(json({ error: "storage unavailable" }, 503), request);

  try {
    // If specific key requested: return full transcript
    if (transcriptKey) {
      const record = await kvDecryptGet(env.STUDENT_MEMORY, transcriptKey, env.ENCRYPTION_KEY);
      if (!record) return addCors(json({ error: "not found" }, 404), request);
      return addCors(json({ transcript: record }), request);
    }

    // Otherwise: return index (session stubs, no messages)
    const indexKey = `transcript_index:${studentId}`;
    const index = await kvDecryptGet(env.STUDENT_MEMORY, indexKey, env.ENCRYPTION_KEY) ?? [];
    return addCors(json({ studentId, sessions: index.reverse(), count: index.length }), request);
  } catch (err) {
    return addCors(json({ error: err.message }, 500), request);
  }
}
```

---

### Part 1C: Obi Context Injection — last session headline into world model

**File:** `APPS/NET-PET-AI/src/index.js`

**Where:** In the `GET /api/deepgram-token` handler at line ~1139, inside the `Promise.all([...])` block.

**Current code (lines 1139-1148):**
```javascript
const [rawProfile, rawLang, rawVocab, rawArc, rawMemory, rawPhonics, rawSessionHistory, rawSrsData] = await Promise.all([
  env.NET_PET_KV.get("student_profile_" + studentId),
  env.NET_PET_KV.get("lang:" + studentId),
  env.NET_PET_KV.get("vocab_list_" + studentId),
  env.NET_PET_KV.get("vocab_arc_" + studentId),
  env.STUDENT_MEMORY ? env.STUDENT_MEMORY.get(`mem:${studentId}`) : Promise.resolve(null),
  sessionMode === 'phonics' ? env.NET_PET_KV.get("phonics_progress_" + studentId) : Promise.resolve(null),
  env.NET_PET_KV.get("session_history_" + studentId),
  env.NET_PET_KV.get("srs_data_" + studentId)
]);
```

**Change to (add rawTranscriptIndex as 9th element):**
```javascript
const [rawProfile, rawLang, rawVocab, rawArc, rawMemory, rawPhonics, rawSessionHistory, rawSrsData, rawTranscriptIndex] = await Promise.all([
  env.NET_PET_KV.get("student_profile_" + studentId),
  env.NET_PET_KV.get("lang:" + studentId),
  env.NET_PET_KV.get("vocab_list_" + studentId),
  env.NET_PET_KV.get("vocab_arc_" + studentId),
  env.STUDENT_MEMORY ? env.STUDENT_MEMORY.get(`mem:${studentId}`) : Promise.resolve(null),
  sessionMode === 'phonics' ? env.NET_PET_KV.get("phonics_progress_" + studentId) : Promise.resolve(null),
  env.NET_PET_KV.get("session_history_" + studentId),
  env.NET_PET_KV.get("srs_data_" + studentId),
  env.STUDENT_MEMORY ? env.STUDENT_MEMORY.get(`transcript_index:${studentId}`) : Promise.resolve(null)
]);
```

**Then add after the `memoryData` parse block (near line ~1165), a new block:**
```javascript
let lastTranscriptNote = "";
try {
  if (rawTranscriptIndex) {
    const txIdx = env.ENCRYPTION_KEY && rawTranscriptIndex.startsWith('v1:')
      ? JSON.parse(await decryptField(rawTranscriptIndex.slice(3), env.ENCRYPTION_KEY).catch(() => 'null'))
      : JSON.parse(rawTranscriptIndex);
    if (Array.isArray(txIdx) && txIdx.length > 0) {
      const last = txIdx[txIdx.length - 1];
      const d = last.date ? new Date(last.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "";
      const vocab = last.vocab?.length ? ` Words touched: ${last.vocab.slice(0,3).join(", ")}.` : "";
      lastTranscriptNote = `Last session (${d}, ${last.mode || "free"} mode, ${last.turns || 0} turns): "${last.headline || "session recorded"}".${vocab}`;
    }
  }
} catch (_) {}
```

**Then inject `lastTranscriptNote` into the Obi system prompt.** Find where `MEMORY CONTEXT` is built (line ~3813). The pattern is:
```javascript
memory.world_model ? `Student vibe: ${memory.world_model}.` : ""
```

Append `lastTranscriptNote` to the MEMORY CONTEXT string:
```javascript
${lastTranscriptNote ? ` ${lastTranscriptNote}` : ""}
```

Add it after `memory.struggles` in the template literal at line ~3813.

---

### Part 2: Client — POST transcript at session end

**File:** `APPS/NET-PET-AI/public/chat.js`

**Where:** In `showChatTigerWin()` (look for `fetch('/api/agent/session'...` around line 329). Add the transcript POST right after the existing session POST, using the same pattern and `keepalive: true`.

**Find this block (exact text):**
```javascript
  fetch('/api/agent/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({ studentId: urlStudentId, turns: agentSessionTurns, durationMs: dur * 60000, vocab: agentSessionVocab, topic: sessionTopic, avg_turn_length: agentSessionTurns > 0 ? Math.round(totalTurnWords / agentSessionTurns) : 0, barge_in_count: bargeInCount })
  }).catch(() => {});
```

**Add immediately after it:**
```javascript
  // Save full transcript for student registry
  if (chatMessages.length >= 2) {
    fetch('/api/transcript', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        studentId: urlStudentId,
        messages: chatMessages.slice(-20),
        mode: currentMode,
        turns: agentSessionTurns,
        durationMs: dur * 60000,
        vocab: agentSessionVocab
      })
    }).catch(() => {});
  }
```

---

### Part 3: Admin Transcript Viewer

**File:** `APPS/NET-PET-AI/public/admin/bluetech-dashboard.html`

**What to add:** In the student activity table, after each student row, add a "📋 Transcripts" link that opens a simple modal showing the session index for that student.

Find the admin dashboard's student row rendering. Add:

```html
<!-- In the student row actions area -->
<button class="btn-transcript" onclick="loadTranscripts('STUDENT_ID_HERE')">📋 Transcripts</button>
```

**Add a modal + JS at the bottom of the file (before `</body>`):**

```html
<!-- Transcript Viewer Modal -->
<div id="transcriptModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;align-items:center;justify-content:center">
  <div style="background:#0f1120;border:1px solid rgba(168,85,247,0.3);border-radius:16px;padding:28px;max-width:680px;width:90%;max-height:80vh;overflow-y:auto">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <h3 style="color:#a855f7;margin:0" id="txModalTitle">Transcripts</h3>
      <button onclick="document.getElementById('transcriptModal').style.display='none'" style="background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer">×</button>
    </div>
    <div id="txSessionList" style="display:flex;flex-direction:column;gap:10px"></div>
    <div id="txFullView" style="display:none;margin-top:16px;padding:16px;background:rgba(168,85,247,0.05);border-radius:10px;border:1px solid rgba(168,85,247,0.15)"></div>
  </div>
</div>

<script>
const ADMIN_KEY = localStorage.getItem('adminKey') || prompt('Admin key:');
if (ADMIN_KEY) localStorage.setItem('adminKey', ADMIN_KEY);

async function loadTranscripts(studentId) {
  document.getElementById('txModalTitle').textContent = `Transcripts — ${studentId}`;
  document.getElementById('txSessionList').innerHTML = '<p style="color:#94a3b8">Loading...</p>';
  document.getElementById('txFullView').style.display = 'none';
  document.getElementById('transcriptModal').style.display = 'flex';

  const res = await fetch(`/api/transcript?studentId=${encodeURIComponent(studentId)}`, {
    headers: { 'x-admin-key': ADMIN_KEY }
  });
  const data = await res.json();

  if (!data.sessions || data.sessions.length === 0) {
    document.getElementById('txSessionList').innerHTML = '<p style="color:#94a3b8">No transcripts saved yet.</p>';
    return;
  }

  document.getElementById('txSessionList').innerHTML = data.sessions.map((s, i) => `
    <div style="background:rgba(168,85,247,0.06);border:1px solid rgba(168,85,247,0.2);border-radius:10px;padding:12px 16px;cursor:pointer" onclick="loadFullTranscript('${studentId}','${s.key}')">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:13px;color:#e2e8f0;font-weight:600">${s.date ? new Date(s.date).toLocaleString() : 'Session'}</span>
        <span style="font-size:11px;color:#94a3b8;background:rgba(168,85,247,0.1);padding:2px 8px;border-radius:12px">${s.mode || 'free'} · ${s.turns || 0} turns</span>
      </div>
      <div style="font-size:12px;color:#94a3b8;margin-top:4px">"${(s.headline || '').slice(0, 100)}"</div>
      ${s.vocab?.length ? `<div style="font-size:11px;color:#14b8a6;margin-top:4px">${s.vocab.join(' · ')}</div>` : ''}
    </div>
  `).join('');
}

async function loadFullTranscript(studentId, key) {
  document.getElementById('txFullView').innerHTML = '<p style="color:#94a3b8">Loading full transcript...</p>';
  document.getElementById('txFullView').style.display = 'block';

  const res = await fetch(`/api/transcript?studentId=${encodeURIComponent(studentId)}&key=${encodeURIComponent(key)}`, {
    headers: { 'x-admin-key': ADMIN_KEY }
  });
  const data = await res.json();
  if (!data.transcript) { document.getElementById('txFullView').innerHTML = '<p style="color:#ef4444">Failed to load.</p>'; return; }

  const msgs = data.transcript.messages || [];
  document.getElementById('txFullView').innerHTML = `
    <div style="font-size:11px;color:#64748b;margin-bottom:12px">${data.transcript.date} · ${data.transcript.mode} · ${data.transcript.turns} turns · ${Math.round((data.transcript.durationMs||0)/60000)}min</div>
    ${msgs.map(m => `
      <div style="margin-bottom:10px;display:flex;gap:10px;align-items:flex-start">
        <span style="font-size:10px;font-weight:700;color:${m.role==='assistant'?'#a855f7':'#14b8a6'};min-width:36px;padding-top:2px">${m.role==='assistant'?'OBI':'YOU'}</span>
        <span style="font-size:13px;color:#e2e8f0;line-height:1.5">${m.content}</span>
      </div>
    `).join('')}
  `;
}
</script>
```

---

## CRITICAL CONSTRAINTS — DO NOT VIOLATE

1. **VOICE BRAIN LOCK** — Do NOT touch any Deepgram Voice Agent settings. think=`gpt-4o-mini` (no endpoint), listen=`nova-3`, speak=`aura-2-zeus-en`. These are hard-locked.
2. **ENCRYPTION_KEY** is set on prod. Always use `kvEncryptPut`/`kvDecryptGet` for anything written to `STUDENT_MEMORY`. Never write raw JSON.
3. **ACTIVE_STUDENT_ROSTER** — `validateActiveStudent(studentId)` must be called before any write. If it fails, return 403.
4. **No paid API keys** on phoenix-architecti worker. This is a Cloudflare Worker — all secrets are CF Worker secrets.
5. **addCors wrapper** — every return statement must be wrapped: `return addCors(json({...}, statusCode), request)`.
6. **keepalive: true** on the client fetch — it must fire even on page unload/close.
7. **`chatMessages` is already capped at 20** — just use `chatMessages.slice(-20)` at send time.

---

## HOW TO VERIFY

After implementing and deploying:

```powershell
# 1. Check the endpoint exists
Invoke-RestMethod "https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/transcript?studentId=sov100-test-magic" -Headers @{"x-admin-key"="YOUR_ADMIN_KEY"}

# 2. Test POST manually
$body = @{
  studentId = "sov100-test-magic"
  messages = @(@{role="assistant";content="Hello! What did you do today?"},@{role="user";content="I go to work today"})
  mode = "free"; turns = 2; durationMs = 120000; vocab = @("work","today")
} | ConvertTo-Json
Invoke-RestMethod "https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/transcript" -Method POST -ContentType "application/json" -Body $body

# 3. Fetch index back
Invoke-RestMethod "https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/transcript?studentId=sov100-test-magic" -Headers @{"x-admin-key"="YOUR_ADMIN_KEY"}
```

Expected: `{ ok: true, saved: true, key: "transcript:sov100-test-magic:..." }` from POST, then index shows the entry on GET.

---

## DEPLOY

```powershell
cd D:\OB-1-CANONICAL\APPS\NET-PET-AI
node --check src/index.js   # syntax check
node --check public/chat.js # syntax check
npx wrangler deploy
```

Confirm: "Deployed net-pet-ai" + new Version ID. Post the Version ID.

---

## FILES CHANGED SUMMARY

| File | Change |
|------|--------|
| `src/index.js` | +POST /api/transcript, +GET /api/transcript, +rawTranscriptIndex in deepgram-token Promise.all, +lastTranscriptNote injected into Obi system prompt |
| `public/chat.js` | +transcript fetch in showChatTigerWin() |
| `public/admin/bluetech-dashboard.html` | +transcript viewer modal + JS |
