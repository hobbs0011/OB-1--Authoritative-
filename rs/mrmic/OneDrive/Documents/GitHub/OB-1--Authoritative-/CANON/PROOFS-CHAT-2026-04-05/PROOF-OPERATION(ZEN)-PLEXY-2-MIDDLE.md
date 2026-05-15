# PROOF - OPERATION(ZEN)-PLEXY-2 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\OPERATION(ZEN)-PLEXY-2.txt

  return sha256Hex('node:' + left + ':' + right);
}

async function buildPipelineMerkleRoot(leafHashes) {
  if (!leafHashes.length) return sha256Hex('root:empty');
  let level = leafHashes.slice();
  while (level.length > 1) {
    const next = [];
    for (let i = 0; i < level.length; i += 2) {
      const L = level[i];
