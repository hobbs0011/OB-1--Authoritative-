# PROOF - Phoenix-Transend-GEM-4E MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\Phoenix-Transend-GEM-4E.txt

enforcePayloadStrings(body.payload);

 const stub = env.LEDGER.get(env.LEDGER.idFromName("ledger"));
 const tok = await internalTokenForReq(env, reqId);
 const res = await stub.fetch("https://do/append", {
   method: "POST",
   headers: { "Content-Type": "application/json", "x-phx-internal": tok, "x-phx-request-id": reqId },
   body: JSON.stringify(body)
 });
 return new Response(await res.text(), { status: res.status, headers: corsHeaders() });
