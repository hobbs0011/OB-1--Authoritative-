# PROOF - OPERATION(ZEN)-PLEXY-1 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\OPERATION(ZEN)-PLEXY-1.txt

        const head   = this.sql.exec('SELECT * FROM ledger ORDER BY height DESC LIMIT 1').one();
        const nextH  = Number(head.height) + 1;
        const prevH  = safeStr(head.hash);
        const ts     = nowIso();
        const pStr   = canonJSON(pl);
        const hStr   = `${nextH}|${ts}|PHEROMONE_TRAIL|${pStr}|${prevH}`;
        const hash   = await sha256Hex(hStr);
        const mmrRoot = await this._appendMMR(nextH, hash);
        this.sql.exec(
          `INSERT INTO ledger(height,ts,type,payload,prevhash,hash) VALUES(?,?,?,?,?,?)`,
