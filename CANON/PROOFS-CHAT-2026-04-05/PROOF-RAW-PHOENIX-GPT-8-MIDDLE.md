# PROOF - RAW-PHOENIX-GPT-8 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\RAW-PHOENIX-GPT-8.txt

    /* ----- TIME GUARD ----- */
    const now = Date.now();
    if (Math.abs(now - body.timestamp) > PROTOCOL.NONCE_TTL_MS) {
      return fault("TIME_SKEW", "Timestamp outside window", 409);
    }

    /* ----- NONCE GUARD ----- */
    if (STATE.nonces.has(body.nonce)) {
      return fault("REPLAY_DETECTED", body.nonce, 409);
    }
