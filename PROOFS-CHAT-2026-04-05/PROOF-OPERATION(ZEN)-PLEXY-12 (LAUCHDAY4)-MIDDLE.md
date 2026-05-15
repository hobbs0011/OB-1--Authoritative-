# PROOF - OPERATION(ZEN)-PLEXY-12 (LAUCHDAY4) MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\OPERATION(ZEN)-PLEXY-12 (LAUCHDAY4).txt

  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (request.method === "GET" && (path === "/info" || path === "/ledger/info")) {
        return new Response(JSON.stringify(await this.info()), {
          headers: { "Content-Type": "application/json; charset=utf-8" }
        });
      }
