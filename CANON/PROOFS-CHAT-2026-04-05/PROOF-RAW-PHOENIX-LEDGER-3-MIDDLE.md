# PROOF - RAW-PHOENIX-LEDGER-3 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\RAW-PHOENIX-LEDGER-3.txt

        const id = mustString(url.searchParams.get("id") ?? "", "id", 1, 256);
        return this.journalStatus(id, cors);
      }

      return notFound(cors);
    } catch (e) {
      const msg = (e && e.message) ? e.message : "ERROR";
      return json(500, { ok: false, code: "INTERNAL", detail: msg }, cors);
    }
  }
