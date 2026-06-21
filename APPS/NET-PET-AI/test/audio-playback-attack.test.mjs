/**
 * audio-playback-attack.test.mjs
 * Safari/iOS autoplay policy attack surface + playAgentChunk() hardening
 */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const chatJs = readFileSync(new URL('../public/chat.js', import.meta.url), 'utf8');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try { fn(); console.log(`  ✓ ${name}`); passed++; }
  catch (e) { console.error(`  ✗ ${name}: ${e.message}`); failed++; }
}

console.log('\naudio-playback-attack.test.mjs');

// ── iOS unlock: volume must be > 0 ──────────────────────────────────────────
test('EC-safarivolume: triggerMicOnGesture unlock audio volume is NOT 0', () => {
  const triggerFn = chatJs.slice(
    chatJs.indexOf('function triggerMicOnGesture'),
    chatJs.indexOf('function triggerMicOnGesture') + 500
  );
  // volume=0 is the bug: Safari ignores zero-volume plays for autoplay unlock
  assert(!triggerFn.includes('volume=0;') && !triggerFn.includes('volume = 0;'),
    'volume=0 found — Safari will silently fail autoplay unlock');
});

test('EC-safarivolume: triggerMicOnGesture unlock uses volume > 0', () => {
  const triggerFn = chatJs.slice(
    chatJs.indexOf('function triggerMicOnGesture'),
    chatJs.indexOf('function triggerMicOnGesture') + 500
  );
  // Must have non-zero volume value
  assert(/volume=0\.\d+/.test(triggerFn) || /volume = 0\.\d+/.test(triggerFn),
    'No positive fractional volume found — iOS autoplay unlock may silently fail');
});

// ── userHasInteracted must be set before playAgentChunk can play audio ───────
test('EC-autoplay-guard: userHasInteracted is set inside triggerMicOnGesture', () => {
  const triggerFn = chatJs.slice(
    chatJs.indexOf('function triggerMicOnGesture'),
    chatJs.indexOf('function triggerMicOnGesture') + 800
  );
  assert(triggerFn.includes('userHasInteracted = true'),
    'userHasInteracted never set inside triggerMicOnGesture');
});

test('EC-autoplay-guard: triggerMicOnGesture is registered on touchstart', () => {
  assert(chatJs.includes('"touchstart", triggerMicOnGesture') || chatJs.includes("'touchstart', triggerMicOnGesture"),
    'touchstart listener for triggerMicOnGesture not found');
});

test('EC-autoplay-guard: triggerMicOnGesture is registered on click', () => {
  assert(chatJs.includes('"click",      triggerMicOnGesture') || chatJs.includes('"click", triggerMicOnGesture') || chatJs.includes("'click', triggerMicOnGesture"),
    'click listener for triggerMicOnGesture not found');
});

// ── playAgentChunk() watchdog hardening ──────────────────────────────────────
test('EC-watchdog-floor: playAgentChunk watchdog has min floor of 2500ms', () => {
  const playFn = chatJs.slice(
    chatJs.indexOf('async function playAgentChunk'),
    chatJs.indexOf('async function playAgentChunk') + 2000
  );
  assert(playFn.includes('2500'),
    'watchdog minimum of 2500ms not found in playAgentChunk — short MP3 clips may timeout before playing');
});

test('EC-watchdog-cleanup: playAgentChunk watchdog calls cleanup on fire', () => {
  const playFn = chatJs.slice(
    chatJs.indexOf('async function playAgentChunk'),
    chatJs.indexOf('async function playAgentChunk') + 2000
  );
  // The watchdog setTimeout block must contain cleanup logic (not just silence)
  const watchdogBlock = playFn.slice(playFn.indexOf('const watchdog = setTimeout'));
  assert(watchdogBlock.includes('agentPlaying') || watchdogBlock.includes('cleanup'),
    'watchdog does not reset agentPlaying state — hung audio will block future chunks');
});

// ── Gapless audio merge ───────────────────────────────────────────────────────
test('EC-gapless: playAgentChunk drains entire agentAudioQ in one blob', () => {
  const playFn = chatJs.slice(
    chatJs.indexOf('async function playAgentChunk'),
    chatJs.indexOf('async function playAgentChunk') + 2000
  );
  assert(playFn.includes('agentAudioQ.splice(0)'),
    'splice(0) not found — partial queue drain would cause repeated playback gaps');
});

test('EC-gapless: merged blob is type audio/mpeg not audio/webm', () => {
  const playFn = chatJs.slice(
    chatJs.indexOf('async function playAgentChunk'),
    chatJs.indexOf('async function playAgentChunk') + 2000
  );
  assert(playFn.includes('audio/mpeg'),
    'blob type is not audio/mpeg — Safari requires explicit MP3 MIME for playback');
});

// ── Safari: onerror cleanup path ─────────────────────────────────────────────
test('EC-safari-onerror: a.onerror handler calls cleanup and continues queue', () => {
  const playFn = chatJs.slice(
    chatJs.indexOf('async function playAgentChunk'),
    chatJs.indexOf('async function playAgentChunk') + 2000
  );
  // Must have onerror that calls cleanup (not just silently hangs)
  assert(playFn.includes('a.onerror') && playFn.includes('playAgentChunk'),
    'a.onerror handler missing or does not chain to next chunk');
});

// ── chatMessages cap consistency ─────────────────────────────────────────────
test('EC-chatcap-asst: assistant chatMessages cap is 20, not 40', () => {
  // Check no remaining > 40 caps in ConversationText assistant handler
  const convTextIdx = chatJs.indexOf("msg.type === \"ConversationText\" && msg.role === \"assistant\"");
  const convTextBlock = chatJs.slice(convTextIdx, convTextIdx + 300);
  assert(!convTextBlock.includes('> 40') && !convTextBlock.includes('> 39'),
    'assistant chatMessages cap still set to 40 (should be 20 to match user path)');
});

test('EC-chatcap-asst: assistant cap is explicitly 20', () => {
  const convTextIdx = chatJs.indexOf("msg.type === \"ConversationText\" && msg.role === \"assistant\"");
  const convTextBlock = chatJs.slice(convTextIdx, convTextIdx + 500);
  assert(convTextBlock.includes('> 20') || convTextBlock.includes('>20'),
    'assistant chatMessages cap 20 not found in ConversationText handler');
});

// ── blobUrl revocation ────────────────────────────────────────────────────────
test('EC-bloburlleak: agentCurrentBlobUrl is revoked on cleanup', () => {
  const playFn = chatJs.slice(
    chatJs.indexOf('async function playAgentChunk'),
    chatJs.indexOf('async function playAgentChunk') + 2000
  );
  assert(playFn.includes('URL.revokeObjectURL') || chatJs.includes('revokeObjectURL(agentCurrentBlobUrl)'),
    'blobUrl never revoked — iOS Safari memory will leak on long sessions');
});

// ── Dual-audio prevention ──────────────────────────────────────────────────────
test('EC-dualaudio: agentGreetingSent flag guards duplicate InjectAgentMessage', () => {
  assert(chatJs.includes('agentGreetingSent'),
    'agentGreetingSent flag not found — duplicate greeting inject will cause dual audio on reconnect');
});

test('EC-dualaudio: agentGreetingSent checked before InjectAgentMessage send', () => {
  const guardIdx = chatJs.indexOf('if (agentGreetingSent) return;');
  const settingsIdx = chatJs.indexOf("msg.type === \"SettingsApplied\"");
  assert(guardIdx > settingsIdx && guardIdx < settingsIdx + 5000,
    'agentGreetingSent guard absent from SettingsApplied handler — greeting can fire twice');
});

test('EC-dualaudio: agentInjectInFlight flag guards silence timer inject', () => {
  assert(chatJs.includes('agentInjectInFlight'),
    'agentInjectInFlight flag not found — silence timer can fire while inject still in-flight');
});

test('EC-dualaudio: agentGreetingSent reset on agent drop prevents stale guard', () => {
  // agentGreetingSent and agentInjectInFlight must reset in the onAgentDrop handler
  const dropFnIdx = chatJs.indexOf('onAgentDrop');
  const dropFn = chatJs.slice(dropFnIdx, dropFnIdx + 800);
  assert(dropFn.includes('agentGreetingSent = false') || dropFn.includes('agentInjectInFlight = false'),
    'agentGreetingSent/agentInjectInFlight not reset on drop — stale guards will prevent greeting on reconnect');
});

test('EC-dualaudio: playAgentChunk has re-entrant guard', () => {
  const playFn = chatJs.slice(
    chatJs.indexOf('async function playAgentChunk'),
    chatJs.indexOf('async function playAgentChunk') + 2000
  );
  assert(playFn.includes('agentCurrentAudio') && playFn.includes('.paused'),
    'playAgentChunk re-entrant guard missing — parallel calls create concurrent Audio elements');
});

test('EC-dualaudio: audio queue cap raised to 100 for long-form responses', () => {
  const handlerFn = chatJs.slice(
    chatJs.indexOf('// Binary: MP3 audio chunk'),
    chatJs.indexOf('// Binary: MP3 audio chunk') + 600
  );
  // Must check for 100, not 30 (the old stale cap)
  assert(handlerFn.includes('100') && !handlerFn.includes('30'),
    'queue cap still 30 (or not found) — short cap truncates long audio responses mid-sentence');
});

test('EC-dualaudio: agentInjectInFlight cleared on UserStartedSpeaking (barge-in)', () => {
  const bargeIdx = chatJs.indexOf("msg.type === \"UserStartedSpeaking\"");
  const afterBarge = chatJs.slice(bargeIdx, bargeIdx + 2000);
  assert(afterBarge.includes('agentInjectInFlight'),
    'agentInjectInFlight not cleared in UserStartedSpeaking handler — stale flag silences future nudges');
});

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
