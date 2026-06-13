// Serve the gallery HTML directly from the worker.
// Avoids CF edge cache issues with --assets middleware.
// The HTML is embedded as a template literal at build time.

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>PHOENIX ARSENAL</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box}:root{--purple:#a855f7;--gold:#f59e0b;--void:#0A0A0A;--panel:#111120;--radius:10px}body{margin:0;font-family:Inter,system-ui,sans-serif;background:var(--void);color:#fff;min-height:100vh}body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse 80% 60% at 20% 20%,rgba(168,85,247,0.06),transparent 60%),radial-gradient(ellipse 60% 50% at 80% 80%,rgba(245,158,11,0.04),transparent 60%);pointer-events:none;z-index:0}.z-above{position:relative;z-index:1}header{background:linear-gradient(180deg,#0f0f1a 0%,var(--void)100%);padding:32px 24px 16px;border-bottom:1px solid rgba(168,85,247,0.2);text-align:center;overflow:hidden}header h1{color:var(--gold);font-size:1.8em;font-weight:900;letter-spacing:.08em;margin:0 0 4px;text-transform:uppercase}header h1::before{content:"\\25C6";color:var(--purple);margin-right:10px;font-size:.7em;vertical-align:middle}#substats{font-family:JetBrains Mono,monospace;font-size:.75em;color:rgba(168,85,247,0.7);letter-spacing:.05em}#substats span{color:rgba(255,255,255,0.35)}.mode-rail{display:flex;justify-content:center;gap:4px;padding:14px 16px 10px;background:var(--panel);border-bottom:1px solid rgba(168,85,247,0.12);flex-wrap:wrap}.mode-btn{padding:8px 20px;background:transparent;color:rgba(255,255,255,0.4);border:1px solid rgba(168,85,247,0.2);border-radius:8px;font-family:Inter;font-size:.82em;font-weight:700;cursor:pointer;transition:all .15s;letter-spacing:.04em}.mode-btn:hover{border-color:rgba(168,85,247,0.5);color:rgba(255,255,255,0.7)}.mode-btn.active{background:var(--purple);color:#fff;border-color:var(--purple)}.filter-bar{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-items:center;padding:10px 16px 14px;background:var(--panel);border-bottom:1px solid rgba(168,85,247,0.1)}.filter-bar input{padding:6px 12px;background:#1a1a2e;border:1px solid rgba(168,85,247,0.35);color:#fff;border-radius:6px;font-size:.82em;width:180px;outline:none;font-family:Inter}.filter-bar input::placeholder{color:rgba(255,255,255,0.3)}.filter-bar input:focus{border-color:var(--purple)}.chip{padding:4px 10px;background:#1a1a2e;color:var(--purple);border:1px solid rgba(168,85,247,0.3);border-radius:20px;font-size:.72em;cursor:pointer;font-weight:600;letter-spacing:.03em;transition:all .12s;font-family:Inter}.chip:hover{background:rgba(168,85,247,0.12)}.chip.active{background:var(--purple);color:#fff;border-color:var(--purple)}.clear-btn{padding:4px 10px;background:transparent;color:rgba(255,255,255,0.3);border:1px solid rgba(255,255,255,0.1);border-radius:20px;font-size:.72em;cursor:pointer;font-family:Inter}.clear-btn:hover{color:#fff}.gallery-wrap{padding:20px;max-width:1400px;margin:0 auto}.gallery{display:grid;gap:16px;transition:opacity .15s}.gallery.mode-composites{grid-template-columns:repeat(auto-fill,minmax(280px,1fr))}.gallery.mode-core{grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}.gallery.mode-icons{grid-template-columns:repeat(auto-fill,minmax(120px,1fr))}.card{--card-border:rgba(168,85,247,0.2);background:var(--panel);border:1px solid var(--card-border);border-radius:var(--radius);overflow:hidden;cursor:pointer;transition:border-color .15s,transform .12s,box-shadow .15s}.card:hover{border-color:var(--purple);transform:translateY(-3px);box-shadow:0 4px 24px rgba(168,85,247,0.15)}.card-img{width:100%;display:block;background:var(--void);object-fit:cover}.card.composite .card-img{aspect-ratio:16/9}.card.core .card-img{aspect-ratio:1/1;padding:8px;background:repeating-conic-gradient(rgba(255,255,255,0.03) 0% 25%,transparent 0% 50%)0 0/16px 16px}.card.core{border-color:rgba(168,85,247,0.35);box-shadow:0 0 12px rgba(168,85,247,0.08)}.card.core:hover{border-color:var(--purple);box-shadow:0 0 20px rgba(168,85,247,0.2)}.card.icon{border-color:rgba(168,85,247,0.15)}.card.icon:hover{border-color:var(--gold)}.card-body{padding:10px 12px 12px}.card-title{color:var(--gold);font-size:.85em;font-weight:700;margin-bottom:2px;line-height:1.3}.card-family{color:var(--purple);font-size:.68em;font-weight:600;letter-spacing:.04em;margin-bottom:4px;opacity:.7;text-transform:uppercase}.card-tags{display:flex;flex-wrap:wrap;gap:3px}.card-tag{background:rgba(168,85,247,0.14);color:#c084fc;padding:1px 6px;border-radius:10px;font-size:.62em;font-weight:600}.card-icon-preview{width:56px;height:56px;margin:8px auto;display:block;object-fit:contain}.no-results{text-align:center;padding:60px 20px;color:rgba(255,255,255,0.25);font-size:.9em;grid-column:1/-1}.modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:100;justify-content:center;align-items:center;padding:20px;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}@supports not (backdrop-filter:blur()){.modal-overlay{background:rgba(0,0,0,0.92)}}.modal-overlay.open{display:flex}.modal-box{background:var(--panel);border:1px solid rgba(168,85,247,0.3);border-radius:12px;padding:24px;max-width:720px;width:100%;max-height:88vh;overflow-y:auto;position:relative}.modal-close{position:absolute;top:12px;right:14px;font-size:1.5em;cursor:pointer;color:rgba(255,255,255,0.35);background:none;border:none;font-family:Inter;z-index:2}.modal-close:hover{color:#fff}.modal-preview{width:100%;border-radius:8px;margin-bottom:16px;display:block;background:var(--void)}.modal-preview.checker{background:repeating-conic-gradient(rgba(255,255,255,0.04) 0% 25%,transparent 0% 50%)0 0/20px 20px}.modal-header{display:flex;justify-content:space-between;margin-bottom:12px;gap:20px}.modal-title{color:var(--gold);font-size:1.2em;font-weight:800;margin:0}.modal-style{color:var(--purple);font-style:italic;font-size:.8em;opacity:.8}.modal-meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;font-size:.78em}.modal-meta-item{font-family:JetBrains Mono;color:rgba(255,255,255,0.45)}.modal-meta-item strong{color:rgba(255,255,255,0.6);font-family:Inter;display:block;font-size:.7em;text-transform:uppercase;letter-spacing:.06em;margin-bottom:1px}.modal-desc{font-size:.85em;line-height:1.55;color:rgba(255,255,255,0.75);margin-bottom:14px}.modal-variants{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}.modal-variant-btn{padding:5px 12px;background:#1a1a2e;border:1px solid rgba(168,85,247,0.3);border-radius:6px;color:#fff;font-size:.75em;cursor:pointer;text-decoration:none;font-family:JetBrains Mono;transition:all .12s}.modal-variant-btn:hover{background:var(--purple);border-color:var(--purple)}.modal-tags{display:flex;flex-wrap:wrap;gap:4px}.modal-tag{background:rgba(168,85,247,0.14);color:#c084fc;padding:2px 8px;border-radius:12px;font-size:.72em;font-weight:600;cursor:pointer;transition:background .12s}.modal-tag:hover{background:var(--purple);color:#fff}.toast{position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:var(--panel);color:var(--gold);border:1px solid rgba(245,158,11,0.3);padding:10px 20px;border-radius:8px;font-size:.82em;z-index:200;opacity:0;transition:opacity .2s;pointer-events:none;font-family:JetBrains Mono}.toast.show{opacity:1}@media(max-width:768px){header h1{font-size:1.4em}.gallery.mode-composites{grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}.gallery.mode-core{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}.gallery.mode-icons{grid-template-columns:repeat(auto-fill,minmax(80px,1fr))}.modal-meta{grid-template-columns:1fr}.mode-btn{padding:6px 12px;font-size:.75em}.filter-bar input{width:140px}}@media(max-width:480px){.gallery.mode-composites{grid-template-columns:1fr}.gallery.mode-core{grid-template-columns:repeat(2,1fr)}.gallery.mode-icons{grid-template-columns:repeat(3,1fr)}}
</style></head><body>
<header><h1>PHOENIX ARSENAL</h1><div id="substats">\\u2014 <span id="s-composites">\\u2014</span> composites \\u00b7 <span id="s-core">\\u2014</span> core \\u00b7 <span id="s-icons">\\u2014</span> icons \\u2014</div></header>
<div class="mode-rail z-above"><button class="mode-btn active" data-mode="composites">COMPOSITES</button><button class="mode-btn" data-mode="core">CORE ISOLATES</button><button class="mode-btn" data-mode="icons">ICONS</button></div>
<div class="filter-bar z-above"><input type="text" id="search-input" placeholder="Search..."><div id="family-chips"></div><button class="clear-btn" id="clear-btn">clear</button></div>
<div class="gallery-wrap z-above"><div class="gallery mode-composites" id="gallery"></div></div>
<div class="modal-overlay" id="modal"><div class="modal-box"><button class="modal-close" id="modal-close">&times;</button><img class="modal-preview checker" id="modal-img" style="display:none"><div class="modal-header"><div><div class="modal-title" id="modal-title"></div><div class="modal-style" id="modal-style"></div></div></div><div class="modal-meta"><div class="modal-meta-item"><strong>Family</strong><span id="modal-family"></span></div><div class="modal-meta-item"><strong>Textless</strong><span id="modal-textless"></span></div><div class="modal-meta-item"><strong>Source</strong><span id="modal-source"></span></div><div class="modal-meta-item"><strong>Added</strong><span id="modal-added"></span></div></div><div class="modal-desc" id="modal-desc"></div><div id="modal-variants" class="modal-variants"></div><div class="modal-fields"><strong>Tags</strong><div class="modal-tags" id="modal-tags"></div></div><div class="modal-fields"><strong>Artist</strong> <span id="modal-artist"></span></div><div class="modal-fields"><strong>URL</strong> <span class="modal-url" id="modal-url"></span></div><div class="modal-fields"><strong>Notes</strong> <span id="modal-notes"></span></div></div></div>
<div class="toast" id="toast"></div>
<script>
(function(){var API="/api/art",CDN="https://net-art-arsenal.pages.dev",all=[],active=new Set(),currentMode="composites";
function qs(s){return document.querySelector(s)}
function qsa(s){return document.querySelectorAll(s)}
function T(p){return(p.tags||"").split(",").map(function(t){return t.trim().toLowerCase()}).filter(Boolean)}
function F(p){
 var t=T(p);
 for(var i=0;i<t.length;i++){var x=t[i]
  if(x.indexOf("tiger")>=0&&x.indexOf("phoenix")<0)return"tiger"
  if(x.indexOf("mouse")>=0||x.indexOf("elephant")>=0)return"mouse"
  if(x.indexOf("phoenix")>=0||x.indexOf("crest")>=0)return"phoenix"
  if(x.indexOf("dna")>=0||x.indexOf("helix")>=0)return"dna"
  if(x.indexOf("game")>=0||x.indexOf("train")>=0||x.indexOf("boss")>=0||x.indexOf("enemy")>=0||x.indexOf("class")>=0)return"game"
  if(x.indexOf("glyph")>=0||x.indexOf("icon")>=0||x.indexOf("waveform")>=0||x.indexOf("circuit")>=0||x.indexOf("gear")>=0)return"glyph"}
 return"other"}
function U(url,thumb){
 if(!url)return null
 var u=url.replace(/\\\\\\\\/g,"/"),b=thumb?CDN+"/thumbs":CDN,m
 if(url.indexOf("http")===0)return thumb?url.replace("https://net-art-arsenal.pages.dev/",b+"/"):url
 if((m=u.match(/^CANON\\/ARTWORK\\/(.+)/)))return b+"/artwork/"+m[1].replace(/\\.(png|jpg|jpeg)$/,thumb?".webp":"")
 if((m=u.match(/^CANON\\/GAME-DESIGN\\/(.+)/)))return b+"/game-design/"+m[1].replace(/\\.(png|jpg|jpeg)$/,thumb?".webp":"")
 if((m=u.match(/^ASSETS\\/(.+)/)))return b+"/assets/"+m[1].replace(/\\.(png|jpg|jpeg|webp)$/,thumb?".webp":"")
 if((m=u.match(/^codex_preview\\/(.+)/)))return b+"/codex/"+m[1].replace(/\\.(png|jpg|jpeg)$/,thumb?".webp":"")
 if((m=u.match(/^protocols\\/(.+)/)))return b+"/protocols/"+m[1].replace(/\\.(png|jpg|jpeg)$/,thumb?".webp":"")
 if((m=u.match(/^isolated\\/(.+)/)))return b+"/isolated/"+m[1]
 if((m=u.match(/^icons\\/(.+)/)))return b+"/icons/"+m[1]
 // Fallback: bare filenames (unnamed.png) — not local paths
 if(u.indexOf(":")<0&&u.indexOf("/")<0&&u.indexOf("\\\\")<0)return CDN+"/"+(thumb?"thumbs/":"")+u
 return null}
var MD={composites:[],core:[],icons:[]}
function P(){
 MD={composites:[],core:[],icons:[]}
 for(var i=0;i<all.length;i++){var p=all[i]
  if(p.url&&p.url.indexOf("icons/")>=0)MD.icons.push(p)
  else if(p.url&&p.url.indexOf("isolated")>=0)MD.core.push(p)
  else MD.composites.push(p)}
 qs("#s-composites").textContent=MD.composites.length
 qs("#s-core").textContent=MD.core.length
 qs("#s-icons").textContent=MD.icons.length}
function BC(pieces){
 var freq={},c=qs("#family-chips");c.innerHTML=""
 for(var i=0;i<pieces.length;i++){var f=F(pieces[i]);freq[f]=(freq[f]||0)+1}
 var sorted=Object.entries(freq).sort(function(a,b){return b[1]-a[1]})
 for(var i=0;i<sorted.length;i++){
  var btn=document.createElement("button");btn.className="chip";btn.dataset.family=sorted[i][0];btn.textContent=sorted[i][0]+" "+sorted[i][1]
  btn.onclick=function(){var f=this.dataset.family;if(active.has(f)){active["delete"](f);this.classList.remove("active")}else{active.add(f);this.classList.add("active")}A()}
  c.appendChild(btn)}}
function R(pieces){
 if(!pieces.length){qs("#gallery").innerHTML="<div class=\\"no-results\\">No pieces match.</div>";return}
 var h=""
 for(var i=0;i<pieces.length;i++){
  var p=pieces[i],img=U(p.url,false),t=U(p.url,true),cCls=currentMode==="icons"?"card icon":currentMode==="core"?"card core":"card composite",fam=F(p)
  if(currentMode==="icons"){
   h+="<div class=\\""+cCls+"\\">"+(img?"<img class=\\"card-icon-preview\\" src=\\""+img+"\\" alt=\\""+E(p.title)+"\\">":"")+"<div class=\\"card-body\\"><div class=\\"card-title\\">"+E(p.title)+"</div></div></div>"
  }else{
   h+="<div class=\\""+cCls+"\\">"+(t||img?'<img class="card-img" src="'+(t||img)+'" alt="'+E(p.title)+'" onerror="this.hidden=true">':"")+"<div class=\\"card-body\\"><div class=\\"card-title\\">"+E(p.title)+"</div>"+(currentMode!=="core"?"<div class=\\"card-family\\">"+E(fam)+"</div>":"")+"<div class=\\"card-tags\\">"+T(p).slice(0,3).map(function(t){return"<span class=\\"card-tag\\">"+E(t)+"</span>"}).join("")+"</div></div></div>"
  }
 }
 qs("#gallery").innerHTML=h
 qsa(".card").forEach(function(el,i){el.onclick=function(){OM(pieces[i])}})}
function A(){
 var source=MD[currentMode]||[],q=qs("#search-input").value.toLowerCase(),filtered=[]
 for(var i=0;i<source.length;i++){
  var p=source[i],tgs=T(p),fam=F(p)
  var mf=active.size===0||(function(){for(var f of active){if(fam===f)return true}return false})()
  var mq=!q||p.title.toLowerCase().indexOf(q)>=0||(p.description||"").toLowerCase().indexOf(q)>=0||tgs.some(function(t){return t.indexOf(q)>=0})
  if(mf&&mq)filtered.push(p)}
 R(filtered)}
qsa(".mode-btn").forEach(function(btn){
 btn.onclick=function(){qsa(".mode-btn").forEach(function(b){b.classList.remove("active")});btn.classList.add("active");currentMode=btn.dataset.mode;qs("#gallery").className="gallery mode-"+currentMode;BC(MD[currentMode]||[]);active.clear();qsa(".chip").forEach(function(b){b.classList.remove("active")});qs("#search-input").value="";A()}})
qs("#clear-btn").onclick=function(){active.clear();qsa(".chip").forEach(function(b){b.classList.remove("active")});qs("#search-input").value="";A()}
qs("#search-input").oninput=A
function E(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function OM(p){
 var img=U(p.url,false),mi=qs("#modal-img")
 mi.style.display=img?"block":"none";if(img)mi.src=img
 qs("#modal-title").textContent=p.title||"";qs("#modal-style").textContent=p.style||""
 qs("#modal-family").textContent=F(p);qs("#modal-textless").textContent=p.url&&p.url.indexOf("isolated")>=0?"Yes":"\\u2014"
 qs("#modal-source").textContent=p.url||"\\u2014";qs("#modal-added").textContent=p.added_at?new Date(p.added_at).toLocaleDateString():"\\u2014"
 qs("#modal-desc").textContent=p.description||"";qs("#modal-url").textContent=p.url||"\\u2014";qs("#modal-notes").textContent=p.notes||"\\u2014"
 qs("#modal-tags").innerHTML=T(p).map(function(t){return'<span class="modal-tag" onclick="(function(){document.getElementById(\\'search-input\\').value=\\''+E(t)+'\\';document.getElementById(\\'modal-close\\').click();document.getElementById(\\'search-input\\').dispatchEvent(new Event(\\'input\\'))})()">'+E(t)+"</span>"}).join("")
 qs("#modal-variants").innerHTML=["hd","hd-dark","svg","512","256","128","64"].map(function(v){return'<a class="modal-variant-btn" href="'+(img?img.replace(/\\.(png|webp)$/,"-"+v+".png"):"#")+'" target="_blank" download>'+v+"</a>"}).join("")
 qs("#modal").classList.add("open")}
qs("#modal-close").onclick=function(){qs("#modal").classList.remove("open")}
qs("#modal").onclick=function(e){if(e.target===qs("#modal"))qs("#modal").classList.remove("open")}
document.onkeydown=function(e){if(e.key==="Escape")qs("#modal").classList.remove("open")}
fetch(API).then(function(r){return r.json()}).then(function(d){all=d.pieces||[];P();BC(MD.composites);A()})
})();
</script></body></html>`;

export async function handleArtArsenal(request, env) {
  return new Response(HTML, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
