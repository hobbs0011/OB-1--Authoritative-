/* PORTED 2026-10-22 from phoenix-rising-ai-solutions-agent99-webapp (webapp station, save 5) — THE ARCHIVE, one room over everything the station is handed or makes (kv folder `archive`, mirrored to localStorage). Byte-identical below this header; wired as /archive in app.js dispatch + help table, loaded in index.html after gamedivision.js. window.Obi refs in the original are guarded (provenance run only); uses window.ilog + addBubble + root.kv, same harness. */
/* ============================================================================
   THE ARCHIVE — everything this station is handed or makes, in one room
   (src/archive.js)

   WHY THIS FILE EXISTS
   The station keeps its work in five or six different places — the I-LOG, the
   key log, the master's handoffs, the images it generates, the sites it
   builds — and none of them could be seen, counted or handed over together.
   The archive is that one room: a durable index (kv folder `archive`, mirrored
   into localStorage) over every item, each with its own id, its real measured
   size, its provenance, a download, and — when the platform allows it — a URL.

   IMAGE SHARING, SAID HONESTLY
   An image the station makes is HELD (its bytes are stored here, so it cannot
   rot away behind a dead link). An image the MASTER holds is LINKED (this
   station stores the master's own URL to it — `user.uploads.dev/file/<key>` —
   because the master's bytes are the master's and re-hosting them here would
   double the storage for no gain).
   Publishing is a different thing and it is MEASURED, never assumed: `/archive
   share <id>` attempts the platform's own upload and prints what came back.
   In this browser that lane is currently refused (`anti_bot_verification_needed`
   — see `/masterlink`), so the honest answer is NOT PUBLISHED plus the file
   itself. A shared URL that was never verified is never called live.

   WHAT IT IS NOT
   It is THIS BROWSER's kv: it does not ship with a save and it is not uploaded
   anywhere by existing. `/archive export` writes the whole room as ONE
   self-contained .html you can keep or hand over.

   Commands: /archive · /archive list [kind] · /archive show <id>
             /archive image <url|data-url> · /archive share <id>
             /archive export · /archive drop <id>
   ========================================================================== */
(function(){
"use strict";

const KV_FOLDER = "archive";
const LS_KEY = "obi_archive";
const VERSION = 1;
const TAIL = 600;                 /* index entries mirrored into localStorage */
const IMG_HELD_CAP = 2600000;      /* one held image */
const TEXT_CAP = 120000;           /* one held text item */
const MAX_SHARED_IMAGES = 160;     /* the master's images listed as links */
const FILE_BASE = "https://user.uploads.dev/file/";

const KINDS = {
  image:   { icon:"🖼", label:"image" },
  handoff: { icon:"📥", label:"handoff from the master" },
  note:    { icon:"🗒", label:"note" },
  site:    { icon:"🌐", label:"built site" },
  export:  { icon:"📦", label:"export" }
};

/* ------------------------------- helpers -------------------------------- */
function kvFolder(){ try{ return (window.root && root.kv) ? root.kv[KV_FOLDER] : null; }catch(e){ return null; } }
function esc(s){ return String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }
function clamp(s, n){ s = String(s == null ? "" : s); return s.length > n ? s.slice(0, n) + "…" : s; }
function short(e){ return clamp((e && e.message) || e, 140); }
function bytes(n){
  if(typeof n !== "number" || !isFinite(n)) return "?";
  if(n < 1024) return n + " B";
  if(n < 1048576) return (n / 1024).toFixed(1) + " KB";
  return (n / 1048576).toFixed(2) + " MB";
}
function when(t){ try{ return t ? new Date(t).toLocaleString() : "never"; }catch(e){ return "?"; } }
function fnv(str){ let h = 5381; for(let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0; return h.toString(36); }
async function sha(s){
  try{
    if(typeof crypto !== "undefined" && crypto.subtle && crypto.subtle.digest){
      const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
      return { alg:"sha-256", hex: Array.from(new Uint8Array(d)).map(x => x.toString(16).padStart(2,"0")).join("") };
    }
  }catch(e){}
  return { alg:"fnv32", hex: fnv(s) };
}
function say(html){ try{ if(typeof window.addBubble === "function") return window.addBubble("ass", html); }catch(e){} }
function ilog(o){ try{ if(typeof window.ilog === "function") window.ilog(o); }catch(e){} }
function download(name, text, mime){
  try{
    const blob = new Blob([text], { type: mime || "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { try{ URL.revokeObjectURL(a.href); a.remove(); }catch(e){} }, 4000);
    return true;
  }catch(e){ return false; }
}
function isDataUrl(s){ return /^data:[^,]*;base64,/i.test(String(s || "")); }
function isHttp(s){ return /^https?:\/\//i.test(String(s || "")); }

/* arrayBuffer -> data URL in chunks (a 2 MB image as one spread blows the stack) */
function bufToDataUrl(buf, mime){
  try{
    const u8 = new Uint8Array(buf);
    let s = "";
    const CH = 0x8000;
    for(let i = 0; i < u8.length; i += CH) s += String.fromCharCode.apply(null, u8.subarray(i, i + CH));
    return "data:" + (mime || "application/octet-stream") + ";base64," + btoa(s);
  }catch(e){ return null; }
}
async function fetchBytes(url){
  if(!window.root || !root.superFetch) return { ok:false, why:"super-fetch-plugin is not loaded" };
  try{
    const r = await root.superFetch(url);
    if(!r || !r.ok) return { ok:false, why:"HTTP " + (r && r.status) };
    const mime = (r.headers && r.headers.get && r.headers.get("content-type")) || "image/png";
    const buf = await r.arrayBuffer();
    return { ok:true, buf:buf, mime:mime.split(";")[0] };
  }catch(e){ return { ok:false, why:short(e) }; }
}

/* ------------------------------- the store ------------------------------ */
function mirrorRead(){ try{ return JSON.parse(localStorage.getItem(LS_KEY) || "null") || { index:[] }; }catch(e){ return { index:[] }; } }
function mirrorWrite(m){ try{ localStorage.setItem(LS_KEY, JSON.stringify(m)); }catch(e){} }

async function index(){
  let idx = [];
  const f = kvFolder();
  if(f){ try{ const i = await f.get("index"); if(Array.isArray(i)) idx = i; }catch(e){} }
  if(!idx.length){ const m = mirrorRead(); idx = Array.isArray(m.index) ? m.index : []; }
  return idx;
}
async function saveIndex(idx){
  const trimmed = idx.slice(-TAIL);
  mirrorWrite({ index: trimmed });
  const f = kvFolder();
  if(f){ try{ await f.set("index", trimmed); }catch(e){} }
  return trimmed;
}
async function saveItem(rec){
  const f = kvFolder();
  if(!f) return false;
  try{ await f.set("item:" + rec.id, rec); return true; }catch(e){ return false; }
}
async function getItem(id){
  const f = kvFolder();
  if(f){ try{ const r = await f.get("item:" + id); if(r) return r; }catch(e){} }
  return null;
}

/* --------------------------------- put ---------------------------------- */
async function put(o){
  o = o || {};
  const kind = KINDS[o.kind] ? o.kind : "note";
  const idx = await index();
  const n = idx.length + 1;
  const id = o.id || ("ar-" + Date.now().toString(36) + "-" + n.toString(36));
  const at = Date.now();
  const text = o.text == null ? null : String(o.text).slice(0, TEXT_CAP);
  const dataUrl = o.dataUrl || null;
  const bytes_ = dataUrl ? dataUrl.length : (text != null ? text.length : 0);
  const h = await sha(dataUrl ? dataUrl.slice(0, 4000) + "|" + dataUrl.length : String(text || o.url || id));
  const rec = {
    id:id, kind:kind, name:o.name || (kind === "image" ? "image.png" : "item.txt"),
    mime:o.mime || (kind === "image" ? "image/png" : "text/plain"), at:at, run:(() => { try{ return window.Obi && window.Obi.run ? window.Obi.run() : null; }catch(e){ return null; } })(),
    held: o.held || (dataUrl ? "bytes" : (text != null ? "bytes" : "link")),
    bytes:bytes_, digest:h.hex, alg:h.alg, url:o.url || null, source:o.source || null, meta:o.meta || null,
    dataUrl:dataUrl, text:text
  };
  await saveItem(rec);
  idx.push({ id:rec.id, kind:kind, name:rec.name, mime:rec.mime, at:at, held:rec.held, bytes:bytes_, url:rec.url, source:rec.source, digest:h.hex });
  await saveIndex(idx);
  return rec;
}

async function putImage(src, meta){
  const s = String(src || "").trim();
  if(!s) return { ok:false, why:"no image given" };
  if(isDataUrl(s)){
    if(s.length > IMG_HELD_CAP) return { ok:false, why:"the image is " + bytes(s.length) + " — over the " + bytes(IMG_HELD_CAP) + " per-image cap; link it instead" };
    const rec = await put({ kind:"image", name:(meta && meta.name) || "image", mime:"image/png", dataUrl:s, held:"bytes", source:(meta && meta.source) || "this station", meta:meta || null });
    ilog({ kind:"archive", action:"hold image", detail:rec.id + " · " + rec.name, result:bytes(rec.bytes) + " held in this browser's archive" });
    return { ok:true, rec:rec };
  }
  if(!isHttp(s)) return { ok:false, why:"that is not a data URL or an http(s) URL" };
  const got = await fetchBytes(s);
  if(got.ok && got.buf && got.buf.byteLength){
    if(got.buf.byteLength > IMG_HELD_CAP){
      const rec = await put({ kind:"image", name:(meta && meta.name) || s.split("/").pop().split("?")[0], mime:got.mime, url:s, held:"link", source:(meta && meta.source) || "link", meta:meta || null });
      ilog({ kind:"archive", action:"link image", detail:rec.id + " · " + rec.name, result:bytes(got.buf.byteLength) + " is over the per-image cap — LINKED, not held" });
      return { ok:true, rec:rec, note:"over the cap — stored as a LINK to its own URL, not as bytes" };
    }
    const d = bufToDataUrl(got.buf, got.mime);
    if(d){
      const rec = await put({ kind:"image", name:(meta && meta.name) || s.split("/").pop().split("?")[0], mime:got.mime, dataUrl:d, held:"bytes", url:s, source:(meta && meta.source) || s, meta:meta || null });
      ilog({ kind:"archive", action:"hold image", detail:rec.id + " · " + rec.name, result:bytes(got.buf.byteLength) + " read and held" });
      return { ok:true, rec:rec };
    }
  }
  const rec = await put({ kind:"image", name:(meta && meta.name) || s.split("/").pop().split("?")[0], mime:(meta && meta.mime) || "image/*", url:s, held:"link", source:(meta && meta.source) || s, meta:meta || null });
  return { ok:true, rec:rec, note:"could not read the bytes (" + (got.why || "unknown") + ") — stored as a LINK to its own URL" };
}

/* --------------------- the master's images and handoffs ----------------- */
async function ingestMaster(master){
  if(!master || !master.srcManifest) return { ok:false, why:"no master tree", added:0, listed:0 };
  const man = master.srcManifest;
  const idx = await index();
  const known = {};
  for(const it of idx) if(it.source) known[it.source] = true;
  const paths = Object.keys(man).filter(p => /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(p)).sort();
  let listed = 0, added = 0;
  for(const p of paths.slice(0, MAX_SHARED_IMAGES)){
    const entry = man[p] || {};
    const key = entry.key;
    if(!key) continue;
    const url = FILE_BASE + key;
    listed++;
    if(known[url] || known[p]) continue;
    const rec = await put({
      kind:"image", name:p.split("/").pop(), mime:"image/*", url:url, held:"link",
      source:url, meta:{ path:p, key:key, size:entry.size || null, from:master.name, note:"the master's own image — linked, never re-hosted" }
    });
    idx.push({ id:rec.id, kind:"image", name:rec.name, at:rec.at, held:"link", bytes:0, url:url, source:url });
    added++;
  }
  if(added) ilog({ kind:"archive", action:"master images", detail:added + " new · " + listed + " in the master's tree", result:"listed as links to the master's own URLs (no bytes copied)" });
  return { ok:true, added:added, listed:listed };
}
async function putHandoffs(handoffs){
  let n = 0;
  const idx = await index();
  const known = {};
  for(const it of idx) if(it.meta && it.meta.path) known[it.meta.path] = true;
  for(const h of (handoffs || [])){
    if(!h || !h.path || !h.text) continue;
    if(known[h.path]) continue;
    const rec = await put({ kind:"handoff", name:h.path, mime:"text/markdown", text:h.text, held:"bytes", source:h.from || "the master", meta:{ path:h.path, key:h.key, from:h.from } });
    idx.push({ id:rec.id, kind:"handoff", name:rec.name, at:rec.at, held:"bytes", bytes:rec.bytes, source:rec.source });
    n++;
  }
  if(n) ilog({ kind:"archive", action:"handoffs filed", detail:n + " handoff(s)", result:"the master's words, verbatim, in this browser's archive" });
  return { ok:true, added:n };
}

/* ------------------------------ the share lane -------------------------- */
const SHARE_REASONS = {
  anti_bot_verification_needed: "the platform's human-verification for uploads did not complete in this browser context — the share cannot be published from here",
  anti_bot_verification_failed: "the platform's human-verification failed (an ad/privacy blocker can stop the challenge)",
  over_daily_allowance: "the daily upload allowance is used up — it resets on the platform's own clock",
  file_too_big: "the file is over the upload limit",
  invalid_filetype: "the platform refuses that file type"
};
async function share(id){
  const rec = await getItem(id);
  if(!rec) return { ok:false, why:"no such item — /archive list" };
  if(!window.root || !root.uploadPlugin) return { ok:false, why:"the upload plugin is not loaded in this page" };
  if(rec.held === "link" && rec.url && isHttp(rec.url)) return { ok:true, url:rec.url, already:true };
  if(!rec.dataUrl) return { ok:false, why:"this item holds no bytes to publish (it is a link or a text record)" };
  let blob = null;
  try{
    const res = await fetch(rec.dataUrl);
    blob = await res.blob();
  }catch(e){ return { ok:false, why:"the held bytes could not be turned back into a file (" + short(e) + ")" }; }
  try{
    const r = await root.uploadPlugin(blob, { expires: Date.now() + 1000 * 60 * 60 * 24 * 365 });
    if(r && r.url){
      rec.url = r.url; rec.held = "bytes";
      await saveItem(rec);
      ilog({ kind:"archive", action:"share", detail:rec.id + " · " + rec.name, result:"published · " + r.url });
      return { ok:true, url:r.url, deletionUrl:r.deletionUrl || null };
    }
    const err = (r && r.error) || "the platform returned no URL";
    return { ok:false, why:SHARE_REASONS[err] || ("the platform refused the upload: " + err) };
  }catch(e){
    const m = String((e && e.message) || e);
    const hit = Object.keys(SHARE_REASONS).find(k => m.indexOf(k) !== -1);
    return { ok:false, why:(hit ? SHARE_REASONS[hit] : "the upload threw: " + short(e)) };
  }
}

/* -------------------------------- reading ------------------------------- */
async function list(kind){
  const idx = await index();
  return kind ? idx.filter(i => i.kind === kind) : idx;
}
async function stats(){
  const idx = await index();
  const by = {};
  let total = 0;
  for(const i of idx){
    const k = i.kind || "note";
    by[k] = by[k] || { count:0, bytes:0, held:0, links:0 };
    by[k].count++;
    by[k].bytes += i.bytes || 0;
    if(i.held === "link") by[k].links++; else by[k].held++;
    total += i.bytes || 0;
  }
  return { items: idx.length, bytes: total, kinds: by, kv: !!kvFolder(), newest: idx.length ? idx[idx.length - 1] : null };
}

/* -------------------------------- the card ------------------------------ */
function row(k, v, d, bad){ return '<div class="rrow' + (bad ? " bad" : "") + '"><b>' + esc(k) + '</b><span class="vd">' + esc(v) + '</span><div class="rd">' + (d || "") + "</div></div>"; }

async function card(){
  const s = await stats();
  let html = '<div class="rise"><div class="rhead">🗂 /archive — everything kept, in one room</div>';
  html += row("THE ARCHIVE", s.items ? (s.items + " ITEMS · " + bytes(s.bytes)) : "EMPTY",
    s.kv ? "kv folder <b>" + KV_FOLDER + "</b> + a localStorage index — <b>this browser's</b>, it does not ship with a save and it is not uploaded by existing"
         : "MIRROR ONLY — kv is not loaded, so this browser's host will not keep it");
  if(s.items){
    html += row("BY KIND", String(Object.keys(s.kinds).length),
      Object.keys(s.kinds).map(k => {
        const x = s.kinds[k], K = KINDS[k] || { icon:"•", label:k };
        return '<div class="sc-line">' + K.icon + " <b>" + esc(K.label) + "</b> · " + x.count + " · " + bytes(x.bytes)
          + (x.links ? " · " + x.links + " linked" : "") + (x.held ? " · " + x.held + " held" : "") + "</div>";
      }).join(""));
    const recent = (await list()).slice(-6).reverse();
    html += row("NEWEST", String(recent.length), recent.map(i =>
      '<div class="sc-line"><b>' + esc(i.id) + "</b> " + esc(i.name) + " · " + esc((KINDS[i.kind] || {}).label || i.kind)
      + " · " + (i.held === "link" ? "LINKED" : bytes(i.bytes)) + " · " + when(i.at) + "</div>").join(""));
  }
  html += row("HELD vs LINKED", "a held item's bytes are here; a linked item points at its own URL",
    "an image this station makes is <b>held</b> (its bytes are stored, so a dead link cannot lose it). An image the <b>master</b> holds is <b>linked</b> to the master's own URL (<b>user.uploads.dev/file/…</b>) — its bytes are the master's, and re-hosting them here would double the storage for no gain.");
  html += row("PUBLISHING (the share lane)", "NOT PUBLISHED unless it was verified",
    "the platform's upload refuses this browser right now (<b>anti_bot_verification_needed</b> — the same refusal the master link's push lane reports), so <b>/archive share &lt;id&gt;</b> will most likely answer NOT PUBLISHED and hand you the file. When it does publish, it prints the verified URL; a URL that was not read back is never called live.");
  html += '<div class="rfoot"><b>/archive list [image|handoff|note|site|export]</b> · <b>/archive show &lt;id&gt;</b> · <b>/archive image &lt;url&gt;</b> keeps or links a picture · <b>/archive share &lt;id&gt;</b> · <b>/archive export</b> the whole room as ONE .html · <b>/archive drop &lt;id&gt;</b>.</div></div>';
  return html;
}

async function listCard(kind){
  const items = (await list(kind)).slice().reverse();
  let html = '<div class="rise"><div class="rhead">🗂 /archive list — ' + items.length + " item(s)" + (kind ? " · " + esc(kind) : "") + "</div>";
  if(!items.length) html += row("EMPTY", "0 ITEMS", "nothing kept yet — the master link files the master's handoffs and images here, and <b>/archive image &lt;url&gt;</b> keeps a picture");
  else for(const i of items.slice(0, 40)){
    html += row(i.id + " · " + i.name, (i.held === "link" ? "LINKED" : bytes(i.bytes)),
      esc((KINDS[i.kind] || {}).label || i.kind) + " · " + when(i.at) + (i.source ? " · " + esc(clamp(i.source, 90)) : ""));
  }
  if(items.length > 40) html += row("—", items.length - 40 + " more", "the card shows the newest 40 — <b>/archive export</b> has them all");
  html += '<div class="rfoot"><b>/archive show &lt;id&gt;</b> opens one item.</div></div>';
  say(html);
}

async function show(id){
  const rec = await getItem(id);
  if(!rec){ const idx = await list(id); if(idx.length) return listCard(id); say('<div class="rise"><div class="rhead">🗂 /archive show</div>' + row("NO SUCH ITEM", String(id || ""), "run <b>/archive list</b>", true) + "</div>"); return; }
  let html = '<div class="rise"><div class="rhead">🗂 ' + esc(rec.id) + " — " + esc(rec.name) + "</div>";
  html += row("KIND", (KINDS[rec.kind] || {}).label || rec.kind, "kept " + when(rec.at) + (rec.run != null ? " · run " + esc(rec.run) : ""));
  html += row("HELD", rec.held === "link" ? "LINKED (bytes not copied)" : bytes(rec.bytes), esc(rec.alg || "?") + " " + esc(String(rec.digest || "").slice(0, 12)) + "…" + (rec.source ? " · source " + esc(clamp(rec.source, 120)) : ""));
  if(rec.meta && rec.meta.path) html += row("FROM THE MASTER", esc(rec.meta.path), "content key <b>" + esc(String(rec.meta.key || "").slice(0, 14)) + "…</b> · " + (rec.meta.note ? esc(rec.meta.note) : ""));
  if(rec.kind === "image" && (rec.dataUrl || rec.url)){
    html += '<div style="margin:10px 0"><img src="' + esc(rec.dataUrl || rec.url) + '" alt="' + esc(rec.name) + '" style="max-width:100%;border-radius:8px;border:1px solid rgba(255,255,255,.14)"></div>';
    html += row("URL", rec.url || "(held bytes — no URL yet; /archive share " + rec.id + ")",
      rec.url ? '<a href="' + esc(rec.url) + '" target="_blank" rel="noopener">open</a> — ' + (rec.held === "link" ? "the master's own copy" : "published")
        : "this item is held in this browser only — the share lane would attempt the platform's upload");
  }
  if(rec.text != null) html += '<div class="sc-pre" style="max-height:420px;overflow:auto">' + esc(String(rec.text).slice(0, 30000)) + "</div>";
  html += '<div class="rfoot"><b>/archive share ' + esc(rec.id) + "</b> attempts the platform's upload · <b>/archive drop " + esc(rec.id) + "</b> removes it from this browser's index (the I-LOG keeps the fact).</div></div>";
  say(html);
}

/* ------------------------------- the export -----------------------------
   ONE self-contained .html: the measured header, the images (held ones
   inlined as data URLs, linked ones by their own URL) and the text items
   verbatim. This is the "archiving" made handable. */
async function exportBundle(){
  const idx = await list();
  if(!idx.length){ say(await card()); return; }
  const s = await stats();
  const H = [];
  H.push('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">');
  H.push("<title>Archive — " + esc(window.generatorName || "station") + "</title><style>");
  H.push(":root{color-scheme:dark}body{margin:0;background:#0f0f1a;color:#efe6d2;font:15px/1.6 Inter,system-ui,sans-serif;text-align:left}");
  H.push(".w{max-width:1080px;margin:0 auto;padding:28px 18px 60px}h1{font:700 26px/1.2 Orbitron,Inter,sans-serif;letter-spacing:.04em;margin:0 0 4px}");
  H.push(".k{font:600 11px/1.6 ui-monospace,Menlo,monospace;letter-spacing:.16em;text-transform:uppercase;color:#c9a758}");
  H.push(".m{font:14px/1.6 ui-monospace,Menlo,monospace;color:#a89ec7;margin:6px 0 22px}");
  H.push(".g{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin:14px 0 26px}");
  H.push(".c{background:#171127;border:1px solid rgba(201,167,88,.28);border-radius:10px;padding:8px;font:12px/1.5 ui-monospace,Menlo,monospace;color:#cfc6e6}");
  H.push(".c img{width:100%;display:block;border-radius:6px;margin-bottom:6px}");
  H.push("pre{background:#130f20;border:1px solid rgba(201,167,88,.22);border-radius:8px;padding:12px;white-space:pre-wrap;word-break:break-word;font:12.5px/1.6 ui-monospace,Menlo,monospace;max-height:520px;overflow:auto}");
  H.push("h2{font:700 15px/1.4 Orbitron,Inter,sans-serif;letter-spacing:.06em;margin:26px 0 6px;color:#f7edd2}");
  H.push("</style></head><body><div class='w'>");
  H.push("<div class='k'>THE ARCHIVE · " + esc(window.generatorName || "station") + " · EXPORTED " + new Date().toISOString() + "</div>");
  H.push("<h1>Everything this station kept</h1>");
  H.push("<div class='m'>" + s.items + " items · " + bytes(s.bytes) + " of held bytes · this browser's kv, written out as one file.<br>"
    + Object.keys(s.kinds).map(k => ((KINDS[k] || {}).label || k) + " " + s.kinds[k].count).join(" · ") + "</div>");

  const imgs = idx.filter(i => i.kind === "image");
  if(imgs.length){
    H.push("<div class='k'>IMAGES · " + imgs.length + "</div><div class='g'>");
    for(const i of imgs){
      const rec = await getItem(i.id);
      const src = rec && rec.dataUrl ? rec.dataUrl : (i.url || null);
      H.push("<div class='c'>" + (src ? "<img src='" + esc(src) + "' alt='" + esc(i.name) + "'>" : "") + esc(i.id) + "<br>" + esc(i.name)
        + "<br>" + (i.held === "link" ? "linked" : bytes(i.bytes)) + " · " + esc(when(i.at)) + "</div>");
    }
    H.push("</div>");
  }
  const texts = idx.filter(i => i.kind !== "image");
  for(const i of texts){
    const rec = await getItem(i.id);
    H.push("<h2>" + esc((KINDS[i.kind] || {}).label || i.kind) + " — " + esc(i.name) + " <span class='k'>" + esc(i.id) + " · " + esc(when(i.at)) + "</span></h2>");
    H.push("<pre>" + esc(rec && rec.text != null ? String(rec.text) : "(bytes were not readable from kv in this browser)") + "</pre>");
  }
  H.push("</div></body></html>");
  const body = H.join("\n");
  const name = "archive-" + (window.generatorName || "station") + "-" + new Date().toISOString().slice(0, 10) + ".html";
  const ok = download(name, body, "text/html;charset=utf-8");
  ilog({ kind:"archive", action:"export", detail: s.items + " items", result: ok ? "written to disk (" + bytes(body.length) + ")" : "the browser refused the download" });
  say('<div class="rise"><div class="rhead">🗂 /archive export</div>'
    + row(ok ? "WRITTEN" : "REFUSED", name, ok ? s.items + " items · " + imgs.length + " image(s) · one self-contained .html (" + bytes(body.length) + ")" : "the browser refused the download") + "</div>");
}

async function drop(id){
  const rec = await getItem(id);
  if(!rec){ say('<div class="rise"><div class="rhead">🗂 /archive drop</div>' + row("NO SUCH ITEM", String(id || ""), "run <b>/archive list</b>", true) + "</div>"); return; }
  const idx = (await index()).filter(i => i.id !== id);
  await saveIndex(idx);
  const f = kvFolder();
  if(f){ try{ await f.delete("item:" + id); }catch(e){} }
  ilog({ kind:"archive", action:"drop", detail:id + " · " + rec.name, result:"removed from this browser's index (" + (rec.held === "link" ? "linked" : bytes(rec.bytes)) + ") · the I-LOG keeps the fact and its digest " + String(rec.digest).slice(0, 16) + "…" });
  say('<div class="rise"><div class="rhead">🗂 /archive drop</div>' + row("DROPPED", id, "gone from this browser's index — the I-LOG keeps the fact and its digest, and a linked image's bytes were never here to lose.") + "</div>");
}

async function cmd(arg){
  const a = String(arg || "").trim();
  const low = a.toLowerCase();
  if(!a){ say(await card()); return; }
  if(low === "export"){ await exportBundle(); return; }
  if(low === "list"){ await listCard(); return; }
  if(low.indexOf("list ") === 0){ await listCard(a.slice(5).trim().toLowerCase()); return; }
  if(low.indexOf("show ") === 0){ await show(a.slice(5).trim()); return; }
  if(low.indexOf("drop ") === 0){ await drop(a.slice(5).trim()); return; }
  if(low.indexOf("image ") === 0){ const r = await putImage(a.slice(6).trim(), { source:"commanded by the sovereign" }); say('<div class="rise"><div class="rhead">🗂 /archive image</div>' + row(r.ok ? "KEPT" : "REFUSED", r.rec ? r.rec.id : "—", r.ok ? (esc(r.rec.name) + " · " + (r.rec.held === "link" ? "LINKED" : bytes(r.rec.bytes)) + (r.note ? " · " + esc(r.note) : "")) : esc(r.why), !r.ok) + "</div>"); return; }
  if(low.indexOf("share ") === 0){
    const id = a.slice(6).trim();
    const r = await share(id);
    say('<div class="rise"><div class="rhead">🗂 /archive share</div>' + row(r.ok ? (r.already ? "ALREADY PUBLISHED" : "PUBLISHED") : "NOT PUBLISHED", id,
      r.ok ? (r.url ? '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.url) + "</a>" + (r.already ? " — the item is a link to its own copy" : "") : "")
        : esc(r.why) + "<br><span class='rfoot'>The file itself is not lost: <b>/archive export</b> writes every held item into one .html.</span>", !r.ok) + "</div>");
    return;
  }
  say(await card());
}

/* ------------------------------- export -------------------------------- */
window.ObiArchive = {
  VERSION: VERSION, KV_FOLDER: KV_FOLDER, KINDS: KINDS, FILE_BASE: FILE_BASE,
  put: put, putImage: putImage, get: getItem, list: list, stats: stats,
  card: card, cmd: cmd, show: show, exportBundle: exportBundle, share: share, drop: drop,
  ingestMaster: ingestMaster, putHandoffs: putHandoffs
};
})();
