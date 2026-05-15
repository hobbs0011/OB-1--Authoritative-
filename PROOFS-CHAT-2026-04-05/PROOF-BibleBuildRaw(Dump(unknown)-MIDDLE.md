# PROOF - BibleBuildRaw(Dump(unknown) MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\BibleBuildRaw(Dump(unknown).txt

        const limit = url.searchParams.get("limit") || 200;
        return responseJson(await auditExport(env, { limit }));
      }
      
      if (req.method === "GET" && path === "/ledger/verify"){
        assertAuth(env, req);
        const limit = url.searchParams.get("limit") || 5000;
        return responseJson(await verifyLedger(env, { limit }));
      }

