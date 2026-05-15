# PROOF - OB(1)-B-07-MONOLITH-LEDGER-OTHER MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\OB(1)-B-07-MONOLITH-LEDGER-OTHER.txt


    // Compute hash outside txn
    const blockObj = {
      height: snap.height,
      parent_hash: snap.parent_hash,
      ts_utc: snap.ts_utc,
      actor, op, nonce, commandid,
      payload_json: payloadCanon,
      payload_sha256: payloadSha,
      req_id: reqId,
