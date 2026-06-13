# Mission D — Transcript Persistence + Class Ingest Wiring

## Routes added

- `POST /api/transcript`
  - Added in `src/index.js` inside `handleAPI()`.
  - Auth relies on existing upstream `securityMiddleware` plus `validateStudentId()` and `validateActiveStudent()` inside the handler.
  - Stores transcript text in `STUDENT_MEMORY` as plaintext.

- `GET /api/admin/transcripts`
  - Added in `src/index.js` inside `handleAPI()`.
  - Covered by the existing `/api/admin/*` `checkAdminKey(request, env)` gate at the top of `handleAPI()`.
  - Requires `?studentId=` query parameter.

## KV keys

- Transcript records:
  - `transcript:${studentId}:${ts}`
  - Value: `{ transcript, mode, ts }`

- Transcript index:
  - `transcript_index:${studentId}`
  - Value: array capped to newest 50 entries:
    - `{ ts, mode, headline }`
    - `headline` is the first 120 characters of `transcript`.

## ACTIVE_STUDENTS check

- `POST /api/transcript` uses `validateStudentId(studentId)` and `validateActiveStudent(studentId)` from `src/security.js`.
- Active roster in `security.js` includes:
  - `mai-tram-bluetech`
  - `huong-bluetech`
  - `sov100-test-magic`
  - `keep-warm-ping`
- `validateActiveStudent()` also allows IDs starting with `sov100-`.

## Class ingest gate

- Existing `POST /api/class/ingest` already has this guard at the top:

```js
const authFail = checkAdminKey(request, env);
if (authFail) return addCors(authFail, request);
```

- It also validates `studentId` with `validateStudentId()` and `validateActiveStudent()` before processing.
- No rewrite was needed for the handler.

## Router note

- `router.js` does not need changes.
- `src/index.js` handles these routes via the existing `legacyWorker.fetch()` delegation path.

## One-line verification curls

```bash
curl -i -X POST https://<worker>/api/transcript -H 'Content-Type: application/json' -d '{"studentId":"mai-tram-bluetech","transcript":"hello world","mode":"free","ts":1710000000000}'
curl -i -H 'X-Admin-Key: <admin-key>' 'https://<worker>/api/admin/transcripts?studentId=mai-tram-bluetech'
curl -i -X POST https://<worker>/api/class/ingest -H 'Content-Type: application/json' -H 'X-Admin-Key: <admin-key>' -d '{"studentId":"mai-tram-bluetech","audioUrl":"https://example.invalid/class.wav"}'
```
