# PROOF - Phoenix-Transend-GPT-3C FIRST

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\Phoenix-Transend-GPT-3C.txt

async _auth(req) {

    const key = safeStr(this.env.PHOENIX_MASTER_KEY || this.env.SOVEREIGN_KEY);

    const tok = req.headers.get("x-phx-internal");

    const reqId = req.headers.get("x-phx-request-id");

    const exp = await sha256Hex(${key}::PHX_INTERNAL_V2::${reqId});

