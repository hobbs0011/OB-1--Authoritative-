// test/safari-compat.test.mjs — Safari/iOS + Chrome browser compat attack tests
// Targets: AudioContext unlock pattern, iOS detection, WebSocket binary type handling,
//          visibilitychange keepalive, BroadcastChannel fallback
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const chatJs = readFileSync(resolve(__dirname, '../public/chat.js'), 'utf8');

let pass = 0;
let fail = 0;

function assert(cond, msg) {
  if (cond) { console.log('✅ SAFARI-COMPAT:', msg); pass++; }
  else { console.error('❌ SAFARI-COMPAT:', msg); fail++; }
}

// 1. iOS detection uses correct UA string (not MSStream — avoids Windows tablet false positive)
assert(
  chatJs.includes('/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream'),
  'iOS detection excludes Windows tablets via MSStream guard'
);

// 2. AudioContext statechange → touchstart resume registered for iOS (background tab lock)
assert(
  chatJs.includes('"statechange"') && chatJs.includes('"touchstart"') && chatJs.includes('resumeAgentCtx'),
  'AudioContext statechange → touchstart resume registered for iOS re-unlock'
);

// 3. sendKeepAlive sends Int16Array binary frame (WebSocket binary type — Safari requires ArrayBuffer)
assert(
  chatJs.includes('new Int16Array(160).buffer'),
  'keepalive sends Int16Array.buffer (ArrayBuffer) not Blob — Safari WebSocket compat'
);

// 4. keepAliveHandler is module-level, not inline closure (prevents listener accumulation across Safari reconnects)
const keepAliveHandlerModule = /^function keepAliveHandler\(\)/m.test(chatJs);
assert(keepAliveHandlerModule, 'keepAliveHandler is module-level function, not inline closure');

// 5. visibilitychange listeners are module-level — NOT inside function declarations that add per-reconnect listeners
// 3 are expected: (a) AudioContext resume, (b) keepAliveHandler, (c) hot-mic stop
// Key check: no visibilitychange listener inside openVoiceAgent or its closures (the old leak pattern)
const vchangeCount = (chatJs.match(/addEventListener\("visibilitychange"/g) || []).length;
const openVoiceAgentFn = chatJs.slice(chatJs.indexOf('function openVoiceAgent'), chatJs.indexOf('function openVoiceAgent') + 8000);
const vchangeInsideOpenAgent = openVoiceAgentFn.includes('"visibilitychange"');
assert(vchangeCount >= 1 && vchangeCount <= 3 && !vchangeInsideOpenAgent,
  `${vchangeCount} visibilitychange listeners, none inside openVoiceAgent closure (EC-15 fixed)`);

// 6. BroadcastChannel wrapped in try/catch (Safari <15.4 and some iOS versions lack it)
assert(
  chatJs.includes('try { micChannel = new BroadcastChannel'),
  'BroadcastChannel wrapped in try/catch for Safari compatibility'
);

// 7. navigator.sendBeacon used with fetch fallback for error reporting (Safari ITP blocks fetch on unload)
assert(
  chatJs.includes('navigator.sendBeacon') && chatJs.includes("keepalive: true"),
  'error reporting uses sendBeacon with fetch+keepalive fallback'
);

// 8. pagehide event handled (iOS Safari fires pagehide, not unload, when navigating away)
assert(
  chatJs.includes('"pagehide"'),
  'pagehide event handler registered (iOS Safari navigation)'
);

// 9. getUserMedia pendingMicStream cached for reconnect (iOS Safari kills mic on tab switch)
assert(
  chatJs.includes('pendingMicStream'),
  'pendingMicStream cached for iOS Safari mic re-acquisition after tab switch'
);

// 10. showChatTigerWin (was showTigerWin) not overwritten by voice-mode definition
const chatTigerDef = chatJs.indexOf('function showChatTigerWin');
const voiceTigerDef = chatJs.indexOf('function showTigerWin');
assert(
  chatTigerDef !== -1 && voiceTigerDef !== -1 && chatTigerDef !== voiceTigerDef,
  'chat TigerWin (showChatTigerWin) and voice TigerWin (showTigerWin) are separate — no silent overwrite'
);

if (fail > 0) {
  console.error(`\nsafari-compat: ${fail} FAILURES`);
  process.exit(1);
}
console.log(`\nsafari-compat: ALL ${pass} ASSERTIONS GREEN`);
