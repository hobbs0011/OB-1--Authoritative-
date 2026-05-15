# PROOF - GENESISLog1 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\GENESISLog1.txt

  document.getElementById('export-btn')?.addEventListener('click',()=>utils.download(JSON.stringify(seeds.map(s=>s.logs)),'rising_phoenix_logs.json'));
  document.getElementById('copy-js-btn')?.addEventListener('click',async()=>{ try{ await navigator.clipboard.writeText(document.querySelector('script').innerText); alert('JS Seed copied!'); } catch{ alert('Clipboard copy failed'); } });
  document.getElementById('soul-test-btn')?.addEventListener('click',()=>utils.logActivity('[SOUL TEST] Sample lesson generated: Lorem Ipsum + Narrative'));

  // ---------------- CHEAT SHEET ----------------
  const cheatSheet=document.getElementById('cheat-sheet'); 
  if(cheatSheet){ 
    const btn=document.createElement('button'); 
    btn.innerText='Toggle Cheat Sheet'; 
    btn.onclick=()=>{cheatSheet.style.display=cheatSheet.style.display==='none'?'block':'none'; btn.setAttribute('aria-expanded',cheatSheet.style.display==='block');};
