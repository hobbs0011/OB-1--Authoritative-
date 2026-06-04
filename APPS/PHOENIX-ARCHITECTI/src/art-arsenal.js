export async function handleArtArsenal(request, env) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Art Arsenal</title>
<style>
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #0a0a0f; color: #fff; min-height: 100vh; }
  header { background: linear-gradient(180deg, #0f0f1a 0%, #0a0a0f 100%); padding: 28px 20px 18px; text-align: center; border-bottom: 1px solid rgba(168,85,247,0.2); }
  header h1 { color: #f59e0b; font-size: 2.2em; letter-spacing: 0.12em; margin: 0 0 6px; font-weight: 900; text-transform: uppercase; }
  #count-badge { font-size: 0.78em; color: #a855f7; letter-spacing: 0.1em; font-weight: 600; }
  .filter-bar { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; align-items: center; padding: 14px 16px; background: #0f0f1a; border-bottom: 1px solid rgba(168,85,247,0.15); }
  .filter-bar input { padding: 7px 12px; background: #1a1a2e; border: 1px solid rgba(168,85,247,0.4); color: #fff; border-radius: 6px; font-size: 0.85em; width: 200px; outline: none; }
  .filter-bar input::placeholder { color: rgba(255,255,255,0.35); }
  .chip { padding: 5px 11px; background: #1a1a2e; color: #a855f7; border: 1px solid rgba(168,85,247,0.4); border-radius: 20px; font-size: 0.75em; cursor: pointer; font-weight: 600; letter-spacing: 0.05em; transition: all 0.15s; }
  .chip:hover { background: rgba(168,85,247,0.15); }
  .chip.active { background: #a855f7; color: #fff; border-color: #a855f7; }
  .clear-btn { padding: 5px 11px; background: transparent; color: rgba(255,255,255,0.35); border: 1px solid rgba(255,255,255,0.15); border-radius: 20px; font-size: 0.75em; cursor: pointer; }
  .clear-btn:hover { color: #fff; border-color: rgba(255,255,255,0.4); }
  .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; padding: 20px; }
  .card { background: #111120; border: 1px solid rgba(168,85,247,0.25); border-radius: 8px; padding: 14px; cursor: pointer; transition: border-color 0.15s, transform 0.1s; }
  .card:hover { border-color: rgba(168,85,247,0.6); transform: translateY(-2px); }
  .card-title { color: #f59e0b; font-size: 0.95em; font-weight: 700; margin-bottom: 4px; line-height: 1.3; }
  .card-style { color: #a855f7; font-style: italic; font-size: 0.78em; margin-bottom: 8px; opacity: 0.85; }
  .tag-list { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px; }
  .tag { background: rgba(168,85,247,0.18); color: #c084fc; padding: 2px 7px; border-radius: 12px; font-size: 0.68em; font-weight: 600; }
  .card-notes { font-size: 0.78em; color: rgba(255,255,255,0.45); line-height: 1.4; }
  .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 100; justify-content: center; align-items: center; padding: 20px; }
  .modal-overlay.open { display: flex; }
  .modal-box { background: #111120; border: 1px solid rgba(168,85,247,0.4); border-radius: 10px; padding: 28px; max-width: 680px; width: 100%; max-height: 85vh; overflow-y: auto; position: relative; }
  .modal-close { position: absolute; top: 14px; right: 16px; font-size: 1.4em; cursor: pointer; color: rgba(255,255,255,0.4); background: none; border: none; }
  .modal-close:hover { color: #fff; }
  .modal-title { color: #f59e0b; font-size: 1.3em; font-weight: 800; margin: 0 0 6px; padding-right: 30px; }
  .modal-style { color: #a855f7; font-style: italic; font-size: 0.85em; margin-bottom: 16px; }
  .modal-field { margin-bottom: 12px; font-size: 0.88em; line-height: 1.5; }
  .modal-field strong { color: rgba(255,255,255,0.5); display: block; font-size: 0.78em; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 3px; }
  .modal-url { color: #a855f7; word-break: break-all; font-size: 0.82em; }
  .no-results { text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.3); font-size: 1em; }
</style>
</head>
<body>
<header>
  <h1>🐯 ART ARSENAL</h1>
  <div id="count-badge">LOADING...</div>
</header>
<div class="filter-bar">
  <input type="text" id="search-input" placeholder="Search pieces...">
  <button class="chip" data-tag="sovereign-tiger-protocol">tiger protocol</button>
  <button class="chip" data-tag="codex">codex</button>
  <button class="chip" data-tag="gospel-444">gospel 444</button>
  <button class="chip" data-tag="phoenix">phoenix</button>
  <button class="chip" data-tag="NET">NET</button>
  <button class="chip" data-tag="tiger-mode">tiger mode</button>
  <button class="chip" data-tag="sov100">sov100</button>
  <button class="clear-btn" id="clear-btn">clear</button>
</div>
<div class="gallery" id="gallery"></div>
<div class="modal-overlay" id="modal">
  <div class="modal-box">
    <button class="modal-close" id="modal-close">&times;</button>
    <div class="modal-title" id="modal-title"></div>
    <div class="modal-style" id="modal-style"></div>
    <div class="modal-field"><strong>Artist</strong><span id="modal-artist"></span></div>
    <div class="modal-field"><strong>Description</strong><span id="modal-desc"></span></div>
    <div class="modal-field"><strong>Tags</strong><div class="tag-list" id="modal-tags"></div></div>
    <div class="modal-field"><strong>URL</strong><span class="modal-url" id="modal-url"></span></div>
    <div class="modal-field"><strong>Notes</strong><span id="modal-notes"></span></div>
    <div class="modal-field"><strong>Added</strong><span id="modal-added"></span></div>
  </div>
</div>
<script>
  let all = [], active = new Set();
  const gallery = document.getElementById('gallery');
  const badge = document.getElementById('count-badge');
  const searchInput = document.getElementById('search-input');
  const modal = document.getElementById('modal');

  function tags(piece) {
    return (piece.tags || '').split(',').map(t => t.trim()).filter(Boolean);
  }

  function render(pieces) {
    if (!pieces.length) { gallery.innerHTML = '<div class="no-results">No pieces match your filter.</div>'; badge.textContent = '0 PIECES'; return; }
    badge.textContent = pieces.length + ' PIECES';
    gallery.innerHTML = pieces.map((p, i) => \`
      <div class="card" data-i="\${i}" onclick="open_modal(filtered[this.dataset.i])">
        <div class="card-title">\${esc(p.title)}</div>
        <div class="card-style">\${esc(p.style || '')}</div>
        <div class="tag-list">\${tags(p).map(t => \`<span class="tag">\${esc(t)}</span>\`).join('')}</div>
        <div class="card-notes">\${esc((p.notes || '').substring(0,90))}</div>
      </div>\`).join('');
    document.querySelectorAll('.card').forEach((el, i) => el.onclick = () => open_modal(pieces[i]));
  }

  let filtered = [];
  function applyFilters() {
    const q = searchInput.value.toLowerCase();
    filtered = all.filter(p => {
      const tgs = tags(p);
      const matchTag = active.size === 0 || [...active].every(t => tgs.includes(t));
      const matchQ = !q || p.title.toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q) || tgs.some(t => t.includes(q));
      return matchTag && matchQ;
    });
    render(filtered);
  }

  document.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.dataset.tag;
      active.has(t) ? (active.delete(t), btn.classList.remove('active')) : (active.add(t), btn.classList.add('active'));
      applyFilters();
    });
  });
  document.getElementById('clear-btn').addEventListener('click', () => {
    active.clear(); document.querySelectorAll('.chip').forEach(b => b.classList.remove('active'));
    searchInput.value = ''; applyFilters();
  });
  searchInput.addEventListener('input', applyFilters);

  function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function open_modal(p) {
    document.getElementById('modal-title').textContent = p.title || '';
    document.getElementById('modal-style').textContent = p.style || '';
    document.getElementById('modal-artist').textContent = p.artist || '';
    document.getElementById('modal-desc').textContent = p.description || '';
    document.getElementById('modal-tags').innerHTML = tags(p).map(t => \`<span class="tag">\${esc(t)}</span>\`).join('');
    document.getElementById('modal-url').textContent = p.url || '';
    document.getElementById('modal-notes').textContent = p.notes || '';
    document.getElementById('modal-added').textContent = p.added_at ? new Date(p.added_at).toLocaleString() : '';
    modal.classList.add('open');
  }
  document.getElementById('modal-close').onclick = () => modal.classList.remove('open');
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });

  fetch('/api/art').then(r => r.json()).then(d => { all = d.pieces || []; filtered = all; render(all); });
</script>
</body>
</html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
