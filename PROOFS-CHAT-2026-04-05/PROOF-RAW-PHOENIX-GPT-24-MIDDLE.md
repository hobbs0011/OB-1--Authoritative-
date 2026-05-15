# PROOF - RAW-PHOENIX-GPT-24 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\RAW-PHOENIX-GPT-24.txt


  // mandatory fields gate
  const mandatory = ["parent_epoch", "monotonic_boot_wall", "monotonic_boot_mono", "build_id", "pod_uid", "restart_count", "random_nonce"];
  for (const k of mandatory) {
    if (bootFacts[k] === undefined || bootFacts[k] === null) PANIC("EPOCH_BOOT_FACT_MISSING", { key: k });
  }

  const epoch = computeEpoch(bootFacts);
  if (prev && epoch === prev.epoch) PANIC("EPOCH_COLLISION", { epoch });

