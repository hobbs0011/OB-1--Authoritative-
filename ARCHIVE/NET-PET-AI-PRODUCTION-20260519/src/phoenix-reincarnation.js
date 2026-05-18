// src/phoenix-reincarnation.js
// Service layer around snapshot capture/store/rehydrate.

import { createSnapshot, storeSnapshot, rehydrate } from './star-map.js';

export async function capturePhoenixSnapshot(studentId, env) {
  const snapshot = await createSnapshot(studentId, env);
  const stored = await storeSnapshot(studentId, snapshot, env);
  return { snapshot, stored };
}

export async function resetFromPhoenixSnapshot(studentId, env, snapshotTs) {
  const preResetSnapshot = await createSnapshot(studentId, env);
  await storeSnapshot(studentId, preResetSnapshot, env);

  let snapshotToRestore = preResetSnapshot;

  if (snapshotTs && env.LEDGER) {
    try {
      const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
      const res = await stub.fetch(new Request("https://do/history?limit=100&eventType=phoenix_snapshot"));
      const data = await res.json();
      const match = (data.entries || []).find(e => {
        try { return JSON.parse(e.payload).ts === snapshotTs; } catch { return false; }
      });
      if (match) snapshotToRestore = JSON.parse(match.payload);
    } catch (_) {}
  }

  const result = await rehydrate(snapshotToRestore, env);
  return {
    restoredFrom: snapshotToRestore.ts,
    preResetSnapshot: { ts: preResetSnapshot.ts },
    result,
  };
}
