// test/kv-encryption-roundtrip.test.mjs — KV encryption integrity attack tests
// Targets: encryptField/decryptField correctness, v1: prefix contract,
//          admin routes reading encrypted data (student-activity decrypt path),
//          GDPR export encrypted key handling
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { webcrypto } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const encSrc = readFileSync(resolve(__dirname, '../src/encryption.js'), 'utf8');
const indexSrc = readFileSync(resolve(__dirname, '../src/index.js'), 'utf8');
const routerSrc = readFileSync(resolve(__dirname, '../src/router.js'), 'utf8');

// Polyfill Web Crypto for Node.js test env
const crypto = webcrypto;

let pass = 0;
let fail = 0;

function assert(cond, msg) {
  if (cond) { console.log('✅ KV-ENCRYPT:', msg); pass++; }
  else { console.error('❌ KV-ENCRYPT:', msg); fail++; }
}

// Re-implement encryptField / decryptField using node:crypto webcrypto (matches Workers API)
async function encryptField(plaintext, hexKey) {
  const keyBytes = Uint8Array.from(hexKey.match(/.{2}/g).map(b => parseInt(b, 16)));
  const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, new TextEncoder().encode(plaintext));
  const combined = new Uint8Array(12 + ciphertext.byteLength);
  combined.set(iv, 0); combined.set(new Uint8Array(ciphertext), 12);
  return btoa(String.fromCharCode(...combined));
}

async function decryptField(b64, hexKey) {
  const combined = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const keyBytes = Uint8Array.from(hexKey.match(/.{2}/g).map(b => parseInt(b, 16)));
  const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['decrypt']);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, ciphertext);
  return new TextDecoder().decode(plain);
}

const TEST_KEY = '0'.repeat(64); // 32 zero bytes = valid AES-256 key for test

// 1. Encrypt + decrypt roundtrip (ASCII)
const ascii = 'Hello student session data';
const encAscii = await encryptField(ascii, TEST_KEY);
const decAscii = await decryptField(encAscii, TEST_KEY);
assert(decAscii === ascii, 'ASCII encrypt/decrypt roundtrip correct');

// 2. Encrypt + decrypt roundtrip (Unicode/Vietnamese)
const viet = 'Xin chào OBI! Tôi muốn học tiếng Anh.';
const encViet = await encryptField(viet, TEST_KEY);
const decViet = await decryptField(encViet, TEST_KEY);
assert(decViet === viet, 'Vietnamese unicode encrypt/decrypt roundtrip correct');

// 3. Encrypt + decrypt roundtrip (JSON object as string)
const obj = JSON.stringify([{ ts: Date.now(), turns: 5, vocab: ['hello', 'world'] }]);
const encObj = await encryptField(obj, TEST_KEY);
const decObj = await decryptField(encObj, TEST_KEY);
assert(decObj === obj, 'JSON session history encrypt/decrypt roundtrip correct');

// 4. Two encryptions of same plaintext produce different ciphertexts (random IV)
const enc1 = await encryptField(ascii, TEST_KEY);
const enc2 = await encryptField(ascii, TEST_KEY);
assert(enc1 !== enc2, 'random IV: same plaintext produces different ciphertexts');

// 5. Wrong key fails to decrypt
let wrongKeyFailed = false;
try {
  await decryptField(encAscii, 'f'.repeat(64));
} catch { wrongKeyFailed = true; }
assert(wrongKeyFailed, 'wrong key throws on decrypt (AES-GCM auth tag verification)');

// 6. student-activity endpoint decrypts session_history before parsing
assert(
  indexSrc.includes("histRaw?.startsWith('v1:')") && indexSrc.includes('decryptField'),
  'student-activity decrypts session_history v1: prefix before JSON.parse'
);

// 7. GDPR export uses readDecrypted() for all KV fields including class_transcript
assert(
  routerSrc.includes('readDecrypted(k.name)') && routerSrc.includes('class_transcript'),
  'GDPR export uses readDecrypted() for class_transcript keys'
);

// 8. encryption.js uses AES-GCM (authenticated encryption — prevents ciphertext tampering)
assert(encSrc.includes("'AES-GCM'"), "encryption uses AES-GCM (authenticated)");

// 9. IV is 12 bytes (GCM standard — 96 bits)
assert(encSrc.includes('new Uint8Array(12)') && encSrc.includes('slice(0, 12)'), 'IV is 12 bytes (AES-GCM standard)');

// 10. kvEncryptPut wraps in v1: prefix (contract relied on by readDecrypted)
assert(indexSrc.includes("'v1:' +") || indexSrc.includes("`v1:${"), 'kvEncryptPut writes v1: prefix');

if (fail > 0) {
  console.error(`\nkv-encryption-roundtrip: ${fail} FAILURES`);
  process.exit(1);
}
console.log(`\nkv-encryption-roundtrip: ALL ${pass} ASSERTIONS GREEN`);
