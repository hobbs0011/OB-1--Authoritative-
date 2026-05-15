# PROOF - Gem2Jan28 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\Gem2Jan28.txt

const head = s.exec(`SELECT height, hash FROM blocks ORDER BY height DESC LIMIT 1`).toArray()[0] || { height: -1, hash: "0".repeat(64) };

if (head.height !== snap.height - 1) return { kind: "DRIFT" };

if (head.hash !== snap.parent) return { kind: "DRIFT" };



s.exec(`INSERT INTO blocks VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

