# phone drop — box-task-ccc0purge-cleanup

@2026-11-19T16-25-38Z via pais-mcp-cloud phone_drop

CLEANUP ONLY. No clones, no scans, no pushes, no key use. Stdout only (never instruct any phone_drop yourself). End with EXIT:0.
1. Free the disk: rm -rf /tmp/purge-scan /tmp/purge-probe /tmp/g.tgz /tmp/scan.out; echo CLEAN:$?; df -h /root | tail -1.
2. Destroy the purge keypair (single-use, job done): shred -u /root/.purge_key /root/.purge_key.pub 2>&1; echo SHRED_EXIT:$?; ls -la /root/.purge_key* 2>&1 | head -3.
3. Report: disk line + shred exit + ls output (must show No such file). Keep under 1500 chars. EXIT:0.
