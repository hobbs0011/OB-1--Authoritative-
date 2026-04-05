# PROOF - OPERATION(ZEN)-GPT-11B MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\OPERATION(ZEN)-GPT-11B.txt

+async function requireSovereign(request, env) {
+  if (request.headers.has("x-deathstar-key")) {
+    return { ok: false, resp: badRequest("LEGACY_HEADER_REJECTED", "legacy poison header", 400) };
+  }
+  const provided = request.headers.get("x-sovereign-key");
+  const actual = env.SOVEREIGNKEY;
+  if (!actual) {
+    return { ok: false, resp: badRequest("MISSING_SOVEREIGNKEY", "env.SOVEREIGNKEY not configured", 500) };
+  }
+  const ok = await ctEq(provided || "", actual);
