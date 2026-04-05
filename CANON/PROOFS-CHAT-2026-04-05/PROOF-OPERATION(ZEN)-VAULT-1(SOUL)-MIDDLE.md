# PROOF - OPERATION(ZEN)-VAULT-1(SOUL) MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\OPERATION(ZEN)-VAULT-1(SOUL).txt

}

// Constant-time compare to reduce timing leaks
function ctEq(a, b) {
  const aa = safeStr(a);
  const bb = safeStr(b);
  if (aa.length !== bb.length) return false;
  let out = 0;
  for (let i = 0; i < aa.length; i++) out |= aa.charCodeAt(i) ^ bb.charCodeAt(i);
  return out === 0;
