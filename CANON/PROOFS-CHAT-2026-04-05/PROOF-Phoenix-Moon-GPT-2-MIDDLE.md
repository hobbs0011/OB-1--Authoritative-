# PROOF - Phoenix-Moon-GPT-2 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\Phoenix-Moon-GPT-2.txt

  const heightResult = sql.exec("SELECT MAX(height) as max_height FROM blocks");
  const currentHeight = heightResult?.toArray?.()?.[0]?.max_height ?? 0;
  const newHeight = currentHeight + 1;
  
  // Create revenue block
  const timestamp = Date.now();
  const hash = REV_${newHeight}_${timestamp}_${amount};
  
  sql.exec(
    INSERT INTO blocks (height, hash, timestamp)
