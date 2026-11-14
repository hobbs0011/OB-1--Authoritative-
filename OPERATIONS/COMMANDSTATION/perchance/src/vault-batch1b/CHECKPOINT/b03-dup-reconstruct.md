# B03 SEQ24 CLOSE
push_bytes=3066143
seq24_at=-1
seq23_at=-1
bm_seq24_at=175
bm_seq24_ctx=[{"v":1,"t":1792194717302,"iso":"2026-10-16T23:51:57.302Z","run":1,"kind":"brain","action":"index built","detail":"519 entries · census 343","result":"the auto lane is armed","seq":24,"seg":1,"prev":"a7b29c497fa5207e45ee13e5604fa93d9cf34187fac457e96aeacbc8bb0edf82","ok":true,"hash":"eab88cb805fd1147365c6d13a62fa84f0ce5c9010e265661ccc700cf6eceeecd","alg":"sha-256","stored":"kv","restored":{"at":1792444752617,"iso":"2026-10-19T21:19:12.617Z","note":"reconstructed and hash-verified"}},{"v":1,"t":1792194908056,"iso":"2026-10-16T23:55:08.056Z","run":1,"kind":"op","action":"background","ok":true,"detail":"away 110s · 67 beats · throttled 0x · worst 1s","result":"0 hold(s)","seq":25,"seg":1,"prev":"eab88cb805fd1147365c6d13a62fa84f0ce5c9010e265661ccc700cf6eceeecd","hash":"a0aace647010a3564b9504303123b8523f3f3b50af087739c3a91341dd5994ef","alg":"sha-256","stored":"kv","restored":{"at":1792444752623,"iso":"2026-10-19T21:19:12.623Z","note":"reconstructed and hash-verified"}},{"v":1,"t":1792196256222,"iso":"2026-10-17T00:17:36.222Z","run":1,"kind":"op","action":"backgroun
has_restored=false has_reconstruct=false has_redact=false


## FULL CTX
{
  "chain": [
    {
      "v": 1,
      "t": 1792194717302,
      "iso": "2026-10-16T23:51:57.302Z",
      "run": 1,
      "kind": "brain",
      "action": "index built",
      "detail": "519 entries · census 343",
      "result": "the auto lane is armed",
      "seq": 24,
      "seg": 1,
      "prev": "a7b29c497fa5207e45ee13e5604fa93d9cf34187fac457e96aeacbc8bb0edf82",
      "ok": true,
      "hash": "eab88cb805fd1147365c6d13a62fa84f0ce5c9010e265661ccc700cf6eceeecd",
      "alg": "sha-256",
      "stored": "kv",
      "restored": {
        "at": 1792444752617,
        "iso": "2026-10-19T21:19:12.617Z",
        "note": "reconstructed and hash-verified"
      }
    },
    {
      "v": 1,
      "t": 1792194908056,
      "iso": "2026-10-16T23:55:08.056Z",
      "run": 1,
      "kind": "op",
      "action": "background",
      "ok": true,
      "detail": "away 110s · 67 beats · throttled 0x · worst 1s",
      "result": "0 hold(s)",
      "seq": 25,
      "seg": 1,
      "prev": "eab88cb805fd1147365c6d13a62fa84f0ce5c9010e265661ccc700cf6eceeecd",
      "hash": "a0aace647010a3564b9504303123b8523f3f3b50af087739c3a91341dd5994ef",
      "alg": "sha-256",
      "stored": "kv",
      "restore


## CLOSE (measured 2026-11-11)
- Format is `"seq": 24` (with space); earlier no-space search undercounted. True markers in push/ilog.json: seq~5971, seg1~4270, seg2~1702.
- seq24 entry (first in chain): run 1 brain 'index built', 519 entries census 343, prev a7b29c.., hash eab88c.., WITH restored:{at:1792444752617, note:'reconstructed and hash-verified'}.
- Root-cause call: the entry carries its own reconstruction marker — it was rebuilt on 2026-10-19 (restore) and re-hashed then; the seq24 link break sits exactly on this restored boundary entry. Mechanism: post-hash rebuild/re-serialization (restored block added after original hash) breaks prev-link verification. Status: CLAIMED with direct entry evidence (marker inside the breaking entry itself); closer = compare pre-restore copy (browser-memory 20261029 has the same marker — check an older export without `restored` to prove the added block is the diff).
