# PROOF - OP(ZEN)-DEPLOY.FAIL1 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\OP(ZEN)-DEPLOY.FAIL1.txt

    # VERIFY hammer
    if (( VERIFY_EVERY_N > 0 )) && (( iter % VERIFY_EVERY_N == 0 )); then
      local v="$(curl_get "$VERIFY_URL")"
      local vcode="${v%%|*}"; local vms="$(cut -d'|' -f2 <<<"$v")"
      log_stat "verify" "$vcode"
      echo "$vms" >> "$LAT_VERIFY"
    fi

    # HEAD hammer
    if (( HEAD_EVERY_N > 0 )) && (( iter % HEAD_EVERY_N == 0 )); then
