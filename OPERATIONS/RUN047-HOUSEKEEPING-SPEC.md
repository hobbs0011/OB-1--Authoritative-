# RUN 047 HOUSEKEEPING SPEC — BUG-3 + system-map HEAD

**Run:** 047
**Owner:** Kilo (PA T1 / PCClaw)
**Mission:** Two surgical fixes. No deploy needed — both are backend guard + metadata.

---

## TASK A — BUG-3: Guard legacy routes (src/index.js)

### Context

`/student/resolve` (L410) and `/student/create` (L426) call `env.PROFILES.get(...)` without checking if `env.PROFILES` is bound. Both are inside try/catch so they return 500, not a hard crash — but 503 with a clear message is correct behavior when a binding is absent.

`env.PROFILES` is NOT bound in the current wrangler config (legacy DO, replaced by NET_PET_KV). These routes are NOT on the funnel hot path but are dangerous if an admin calls them.

### Edit 1 — /student/resolve (around L417)

Find:
```js
    if (path === "/student/resolve" && request.method === "POST") {
      try {
        const body = await request.json();
        const studentId = body.studentId || "";
        if (!studentId) return addCors(json({ error: "studentId required" }, 400), request);
        const idCheck = validateStudentId(studentId);
        if (!idCheck.valid) return addCors(json({ error: idCheck.error }, 400), request);
        const stub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
```

Replace with (insert one guard line before the stub call):
```js
    if (path === "/student/resolve" && request.method === "POST") {
      try {
        const body = await request.json();
        const studentId = body.studentId || "";
        if (!studentId) return addCors(json({ error: "studentId required" }, 400), request);
        const idCheck = validateStudentId(studentId);
        if (!idCheck.valid) return addCors(json({ error: idCheck.error }, 400), request);
        if (!env.PROFILES) return addCors(json({ error: "Profile store not available" }, 503), request);
        const stub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
```

### Edit 2 — /student/create (around L433)

Find:
```js
    if (path === "/student/create" && request.method === "POST") {
      try {
        const body = await request.json();
        if (!body.studentId) return addCors(json({ error: "studentId required" }, 400), request);
        const idCheck = validateStudentId(body.studentId);
        if (!idCheck.valid) return addCors(json({ error: idCheck.error }, 400), request);
        const stub = env.PROFILES.get(env.PROFILES.idFromName(body.studentId));
```

Replace with:
```js
    if (path === "/student/create" && request.method === "POST") {
      try {
        const body = await request.json();
        if (!body.studentId) return addCors(json({ error: "studentId required" }, 400), request);
        const idCheck = validateStudentId(body.studentId);
        if (!idCheck.valid) return addCors(json({ error: idCheck.error }, 400), request);
        if (!env.PROFILES) return addCors(json({ error: "Profile store not available" }, 503), request);
        const stub = env.PROFILES.get(env.PROFILES.idFromName(body.studentId));
```

### Gate
`node --check APPS/NET-PET-AI/src/index.js` → exit 0.

---

## TASK B — system-map.json HEAD field

**File:** `CANON/SYSTEM/system-map.json`

**Current value:** `"head": "1e6b8fdc"` (run 045 HEAD — two runs stale)

**Correct value:** `"head": "c2dec4a8"` (run 046 final feat commit, per run046-reincarnateDEATH.md §12)

Single field update. No other changes to this file.

### Gate
Grep confirms `"head": "c2dec4a8"` present in system-map.json after edit.

---

## OUT OF SCOPE

- No deploy.
- Do not refactor other routes that use `env.PROFILES` with an existing guard — those are already safe.
- Do not touch any other field in system-map.json.
