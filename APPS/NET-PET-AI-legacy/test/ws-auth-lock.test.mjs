// test/ws-auth-lock.test.mjs — WebSocket auth gate attack tests
// Targets: STT proxy auth, voice agent token endpoint roster check,
//          CSRF guard on WS upgrade path, inactive student rejection
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const indexSrc = readFileSync(resolve(__dirname, '../src/index.js'), 'utf8');
const routerSrc = readFileSync(resolve(__dirname, '../src/router.js'), 'utf8');
const securitySrc = readFileSync(resolve(__dirname, '../src/security.js'), 'utf8');

let pass = 0;
let fail = 0;

function assert(cond, msg) {
  if (cond) { console.log('✅ WS-AUTH:', msg); pass++; }
  else { console.error('❌ WS-AUTH:', msg); fail++; }
}

// 1. STT proxy checks validateActiveStudent before proxying
assert(
  indexSrc.includes('validateActiveStudent(sttStudentId)'),
  'STT proxy calls validateActiveStudent before opening Deepgram WS'
);

// 2. STT proxy returns 403 for inactive student
assert(
  indexSrc.includes('"student not authorized"') && indexSrc.includes('status: 403'),
  'STT proxy returns 403 for inactive student'
);

// 3. Voice agent token endpoint (/api/deepgram-token) checks active roster
const deepgramTokenSection = indexSrc.slice(indexSrc.indexOf('/api/deepgram-token'));
assert(
  deepgramTokenSection.includes('validateActiveStudent') || indexSrc.includes("NOT_IN_ROSTER"),
  'deepgram-token endpoint validates student roster (NOT_IN_ROSTER guard)'
);

// 4. CSRF x-pa-auth requires value match — not just header presence
assert(
  routerSrc.includes("c.req.header('x-pa-auth') === c.env?.PA_AUTH_KEY"),
  'x-pa-auth CSRF bypass requires key value match, not just header presence'
);

// 5. TRUSTED_ORIGINS does not contain wildcard (*) — wildcards bypass CORS
assert(
  !routerSrc.includes("'*'") || routerSrc.includes('TRUSTED_ORIGINS') && !routerSrc.match(/TRUSTED_ORIGINS\s*=.*\*/),
  'TRUSTED_ORIGINS does not contain wildcard'
);

// 6. TRUSTED_ORIGINS includes production domain
assert(
  routerSrc.includes('naturalenglishtraining.com'),
  'TRUSTED_ORIGINS includes naturalenglishtraining.com'
);

// 7. ACTIVE_STUDENT_ROSTER does NOT contain quy-bluetech (offboarded Run 107)
assert(
  !securitySrc.includes("'quy-bluetech'"),
  'quy-bluetech NOT in ACTIVE_STUDENT_ROSTER (offboarded)'
);

// 8. ACTIVE_STUDENT_ROSTER does NOT contain minh (offboarded)
assert(
  !securitySrc.includes("'minh-"),
  'minh-* NOT in ACTIVE_STUDENT_ROSTER (offboarded)'
);

// 9. sov100-* IDs always pass roster check (operator access)
assert(
  securitySrc.includes("studentId.startsWith('sov100-')") && securitySrc.includes('return { valid: true }'),
  'sov100-* operator IDs always pass roster check'
);

// 10. Admin routes gated by checkAdminKey at router level
assert(
  routerSrc.includes("checkAdminKey") && routerSrc.includes("delete('/api/student/:id/erase'"),
  'erasure route requires checkAdminKey at router level'
);

// 11. Admin key uses constant-time comparison (timing attack resistance)
assert(
  securitySrc.includes('diff |= a[i] ^ b[i]'),
  'admin key check uses constant-time XOR comparison'
);

// 12. Empty admin key allows dev access (not hardcoded secret)
assert(
  securitySrc.includes("if (!expected) return null"),
  'empty WORKER_ADMIN_KEY = dev mode open (not hardcoded fallback secret)'
);

if (fail > 0) {
  console.error(`\nws-auth-lock: ${fail} FAILURES`);
  process.exit(1);
}
console.log(`\nws-auth-lock: ALL ${pass} ASSERTIONS GREEN`);
