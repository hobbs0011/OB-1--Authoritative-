// Revenue capture logic for Phoenix Omega
export function captureRevenue(sql, amount, source) {
  // Get current height
  const heightResult = sql.exec("SELECT MAX(height) as max_height FROM blocks");
  const currentHeight = heightResult?.toArray?.()?.[0]?.max_height ?? 0;
  const newHeight = currentHeight + 1;
  
  // Create revenue block
  const timestamp = Date.now();
  const hash = `REV_${newHeight}_${timestamp}_${amount}`;
  
  sql.exec(`
    INSERT INTO blocks (height, hash, timestamp)
    VALUES (${newHeight}, '${hash}', ${timestamp})
  `);
  
  // Store revenue metadata
  sql.exec(`
    CREATE TABLE IF NOT EXISTS revenue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      block_height INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      source TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    )
  `);
  
  sql.exec(`
    INSERT INTO revenue (block_height, amount, source, timestamp)
    VALUES (${newHeight}, ${amount}, '${source}', ${timestamp})
  `);
  
  return {
    ok: true,
    block_height: newHeight,
    amount: amount,
    source: source,
    hash: hash
  };
}

export function getTotalRevenue(sql) {
  const result = sql.exec("SELECT COALESCE(SUM(amount), 0) as total FROM revenue");
  return result?.toArray?.()?.[0]?.total ?? 0;
}
