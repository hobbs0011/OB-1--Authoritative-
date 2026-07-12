# Edgecase Findings — SupplyLines Protocol v1.0
**Created:** 2026-07-12T13:57:39+07:00  
**Run:** 157  
**File:** `SCRIPTS/supply-lines.ps1`  
**Scope:** Diegetic protocol review — no state mutated

---

## Summary
10 edge cases identified across 6-stage Roman Legion pipeline script. Severity rated HIGH/MEDIUM. Findings documented in `CANON/REINCARNATION/run157-reincarnateDEATH.md` §16.

## Edgecase Inventory

### EC-01 — HEALTH-GATE Source Mismatch
| Field | Value |
|-------|-------|
| Severity | HIGH |
| Stage | I — Router |
| User Impact |文档中的 Phase 1 明确检查本地文件系统路径；脚本在 Phase 0/targets 依赖 D1 `/self-test`。D1 故障会中止本地健康的Supply chain。 |

### EC-02 — STRICT Mode Unconditional
| Field | Value |
|-------|-------|
| Severity | MEDIUM |
| Stage | I — Router |
| User Impact | 只读命令 (`status`, `scout`, `garrison`) 与生产级 `full-march` 共享同样的 `-Strict` 硬中止逻辑。在 D1 降级期间无法检查状态。 |

### EC-03 — Stage II-VI D1 Dependency
| Field | Value |
|-------|-------|
| Severity | HIGH |
| Stage | II-VI |
| User Impact | 仅侦察（Stage I）能在离线时运行。II-VI 都依赖来自 D1 的 session ID。D1 故障会在 Stage I 成功后造成级联失败。 |

### EC-04 — PheTrail Run ID Derivation Fragile
| Field | Value |
|-------|-------|
| Severity | MEDIUM |
| Stage | All (Post-stage) |
| User Impact | `git log --grep "^death:"` 是精确锚定且大小写敏感的；任何格式偏差都会返回 0，导致运行编号重置为 `run000` 并覆盖现有制品。 |

### EC-05 — Stage I Exit-Code Blindness
| Field | Value |
|-------|-------|
| Severity | MEDIUM |
| Stage | I — EXPLORATORES |
| User Impact | 对 `phoenix-scout.ps1` 的 Scout 调用是“发射后不管”。不检查 `LASTEXITCODE`，不验证报告路径。阶段 II+ 在盲进。 |

### EC-06 — `status` Not Read-Only
| Field | Value |
|-------|-------|
| Severity | HIGH |
| Stage | Router |
| User Impact | `/SupplyLines status` 执行阶段 I-VI，包括 D1 变更（crunch, skeleton, truth, shadow, merkle），写入 PheTrails，并在开关设置时运行 MerkleRefresh。 |

### EC-07 — Merkle Refresh Fabricates Synthetic Roots
| Field | Value |
|-------|-------|
| Severity | HIGH |
| Stage | V — PRAESIDIA |
| User Impact | `Invoke-MerkleRefresh` 基于索引计数器生成虚假的 merkle_root 十六进制值；这不是内容哈希，会破坏链连续性，并使缺少真实默克尔字段的情况被掩盖。 |

### EC-08 — Stage VI Ignores Verification Exit Codes
| Field | Value |
|-------|-------|
| Severity | HIGH |
| Stage | VI — LIMITANEI |
| User Impact | `obi doctor`, `obi verify`, `obi soul-check` 通过 `& $obi` 启动，但其退出代码或输出均未被捕获。脚本在本地健康降级时仍报告 STAGE-VI OK。 |

### EC-09 — PheTrail Write Lacks Atomic Rollback
| Field | Value |
|-------|-------|
| Severity | MEDIUM |
| Stage | All (Post-stage) |
| User Impact | `Set-Content` 直接写入最终制品路径。磁盘空间不足、流中断或 JSON 序列化错误会导致文件损坏，且没有重试、临时暂存或 SHA 保护。 |

### EC-10 — PRAESIDIA Does Not Verify `pipeline-run{N}.json`
| Field | Value |
|-------|-------|
| Severity | HIGH |
| Stage | V — PRAESIDIA |
| User Impact | 文档称阶段 V 必须验证 `CANON/PIPELINE/pipeline-run{N}.json` 存在且为有效 JSON。实现仅调用 D1 `merkle` 和 `apex`。缺少磁盘上 pipeline 的验证。 |

---

*End of edgecase report.*
