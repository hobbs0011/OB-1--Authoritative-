/* portal-shared.js — BlueTech student portal shared behavior
 * Students: quy-bluetech, huong-bluetech, mai-tram-bluetech
 * Requires: /portal.css loaded first
 */

const BT_API = 'https://net.mrmichaelhobbs123.workers.dev';

function btStudentId() {
    const p = new URLSearchParams(window.location.search);
    return p.get('studentId') || '';
}

function btQuery(name, fallback) {
    const p = new URLSearchParams(window.location.search);
    return p.get(name) || fallback;
}

function bt$(id) { return document.getElementById(id); }
function btHide(id) { const el = bt$(id); if (el) el.classList.add('hidden'); }
function btShow(id) { const el = bt$(id); if (el) el.classList.remove('hidden'); }

/* ── Auth ── */
function btAuthKey(studentId) { return 'bluetech_' + studentId + '_auth'; }
function btParentAuthKey() { return 'bluetech_auth'; }
function btIsAuthed(studentId) { return localStorage.getItem(btAuthKey(studentId)) === 'true'; }
function btHasParentAuth() { return localStorage.getItem(btParentAuthKey()) === 'true'; }
function btSetAuthed(studentId) { localStorage.setItem(btAuthKey(studentId), 'true'); }

function btLogin(studentId, passwordExpected) {
    return async function() {
        const pw = bt$('portalPw').value.trim();
        const err = bt$('loginErr');
        const box = bt$('loginBox');
        const btn = bt$('loginBtn');
        if (!pw) return;
        btn.disabled = true;
        btn.textContent = 'CHECKING…';
        err.classList.remove('visible');
        try {
            const res = await fetch('/api/student/checkpw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: studentId, pw })
            });
            const data = await res.json();
            if (data.ok) {
                btSetAuthed(studentId);
                btShowPortal(studentId);
                if (data.isDefault) btShowSetPwModal(studentId, passwordExpected);
            } else {
                btShowLoginError(err, box);
            }
        } catch {
            if (pw === passwordExpected) {
                btSetAuthed(studentId);
                btShowPortal(studentId);
                btShowSetPwModal(studentId, passwordExpected);
            } else {
                btShowLoginError(err, box);
            }
        } finally {
            btn.disabled = false;
            btn.textContent = 'UNLOCK PORTAL';
        }
    };
}

function btShowLoginError(err, box) {
    err.textContent = 'Incorrect password.';
    err.classList.add('visible');
    box.classList.remove('shaking');
    void box.offsetWidth;
    box.classList.add('shaking');
    setTimeout(() => box.classList.remove('shaking'), 600);
}

function btShowSetPwModal(studentId, currentPw) {
    const modal = bt$('setPwModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    const saveBtn = bt$('setPwBtn');
    const skipBtn = bt$('setPwSkip');
    const msg = bt$('setPwMsg');
    const n1 = bt$('newPw1');
    const n2 = bt$('newPw2');
    if (n1) n1.value = '';
    if (n2) n2.value = '';
    if (msg) { msg.className = 'setpw-msg'; msg.textContent = ''; }

    async function submit() {
        const pw1 = (n1 && n1.value.trim()) || '';
        const pw2 = (n2 && n2.value.trim()) || '';
        if (!msg) return;
        msg.className = 'setpw-msg';
        if (pw1.length < 6) { msg.textContent = 'Password must be at least 6 characters.'; msg.classList.add('err', 'visible'); return; }
        if (pw1 !== pw2) { msg.textContent = 'Passwords do not match.'; msg.classList.add('err', 'visible'); return; }
        if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'SAVING…'; }
        try {
            const res = await fetch('/api/student/setpw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: studentId, currentPw: currentPw, newPw: pw1 })
            });
            const data = await res.json();
            if (data.ok) {
                msg.textContent = 'Password saved! ✓';
                msg.classList.add('ok', 'visible');
                setTimeout(() => { if (modal) modal.classList.add('hidden'); }, 1800);
            } else {
                msg.textContent = data.error || 'Could not save password.';
                msg.classList.add('err', 'visible');
                if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'SAVE PASSWORD'; }
            }
        } catch {
            msg.textContent = 'Network error — try again.';
            msg.classList.add('err', 'visible');
            if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'SAVE PASSWORD'; }
        }
    }
    if (saveBtn) saveBtn.addEventListener('click', submit);
    if (n2) n2.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
    if (skipBtn) skipBtn.addEventListener('click', () => modal.classList.add('hidden'));
}

function btShowPortal(studentId) {
    btHide('loginScreen');
    btShow('topNav');
    fetch('/api/student/lang', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({studentId:studentId,lang:'en'})}).catch(()=>{});
    if (typeof btLoadPortalData === 'function') btLoadPortalData(studentId);
    document.dispatchEvent(new Event('portalUnlocked'));
}

function btInitPortal(studentId, passwordExpected) {
    const authed = btIsAuthed(studentId) || btHasParentAuth();
    if (!btIsAuthed(studentId)) localStorage.setItem(btAuthKey(studentId), 'true');
    if (authed) {
        btShowPortal(studentId);
    }

    const loginBtn = bt$('loginBtn');
    const pwInput = bt$('portalPw');
    if (loginBtn) loginBtn.addEventListener('click', btLogin(studentId, passwordExpected));
    if (pwInput) pwInput.addEventListener('keydown', e => { if (e.key === 'Enter') btLogin(studentId, passwordExpected)(); });

    const logoutBtn = bt$('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => {
        localStorage.removeItem(btAuthKey(studentId));
        window.location.reload();
    });

    const setPwBtn = bt$('setPwBtn');
    if (setPwBtn) setPwBtn.addEventListener('click', () => btShowSetPwModal(studentId, passwordExpected));
    const setPwSkip = bt$('setPwSkip');
    if (setPwSkip) setPwSkip.addEventListener('click', () => bt$('setPwModal').classList.add('hidden'));
}

/* ── Data helpers ── */
function btText(el, val) { const e = bt$(el); if (e) { e.textContent = val; e.classList.remove('loading'); } }

function btSetVal(id, val) {
    const el = bt$(id);
    if (el) { el.textContent = val; el.classList.remove('loading'); }
}

function btScoreRing(score) {
    const fill = bt$('scoreRingFill');
    const txt = bt$('tigerScore');
    if (!fill) return;
    const r = 30, c = 2 * Math.PI * r;
    fill.style.strokeDasharray = c;
    fill.style.strokeDashoffset = c - (Math.min(100, Math.max(0, score)) / 100) * c;
    const color = score >= 70 ? 'var(--gold)' : score >= 40 ? 'var(--teal)' : 'var(--purple)';
    fill.style.stroke = color;
    if (txt) txt.style.color = color;
}

/* ── Portal data ── */
function btLoadPortalData(studentId) {
    try {
        const [scoreRes, stateRes] = await Promise.all([
            fetch(`${BT_API}/api/tiger-score?studentId=${studentId}`).then(r => r.ok ? r.json() : {}).catch(() => ({})),
            fetch(`${BT_API}/api/netpet/state?studentId=${studentId}`).then(r => r.ok ? r.json() : {}).catch(() => ({}))
        ]);

        const tigerScore = scoreRes?.score ?? 0;
        const streak = stateRes?.streak ?? stateRes?.pet?.streak ?? 0;
        const sessions = stateRes?.sessions ?? stateRes?.totalSessions ?? stateRes?.pet?.sessions ?? 0;

        const sg = bt$('statsGrid');
        const d1 = bt$('day1Card');
        if (sessions === 0 && tigerScore === 0) {
            if (sg) sg.style.display = 'none';
            if (d1) d1.style.display = 'block';
        } else {
            if (sg) sg.style.display = 'grid';
            if (d1) d1.style.display = 'none';
            btSetVal('tigerScore', tigerScore);
            btScoreRing(tigerScore);
            btSetVal('streakVal', streak + (streak === 1 ? ' day' : ' days'));
            btSetVal('sessionsVal', sessions);
            btSetVal('nextSessionVal', 'Anytime');
        }
    } catch {
        const sg = bt$('statsGrid');
        const d1 = bt$('day1Card');
        if (sg) sg.style.display = 'none';
        if (d1) d1.style.display = 'block';
    }
}

/* ── Streak badge ── */
function btRenderStreakDots(streakData) {
    const el = bt$('streakDots');
    if (!el) return;
    const ictNow = Date.now() + 7 * 3600000;
    const checkins = Array.isArray(streakData?.checkinDates) ? streakData.checkinDates : [];
    const streak = streakData?.currentStreak || 0;
    const todayDone = streakData?.todayStatus === 'active';
    const dots = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(ictNow - i * 86400000);
        const key = d.toISOString().slice(0, 10);
        const isToday = i === 0;
        let cls = 'streak-dot';
        if (checkins.length > 0) {
            if (checkins.includes(key)) cls += isToday ? ' today-done' : ' done';
            else if (!isToday) cls += ' missed';
            else cls += todayDone ? ' today-done' : ' today-pending';
        } else {
            cls += i < streak ? ' done' : (isToday && !todayDone ? ' today-pending' : '');
        }
        dots.push(`<div class="${cls.trim()}" title="${key}"></div>`);
    }
    el.innerHTML = dots.join('');
}

function btSbRender(data, due) {
    const badge = bt$('streak-badge');
    if (!badge) return;
    const s = data.todayStatus || 'active';
    const streak = data.currentStreak || 0;
    const total = data.totalDays || 0;
    const longest = data.longestStreak || 0;
    const dueCount = (due && typeof due.count === 'number') ? due.count : null;
    const dueHtml = dueCount === null ? '' :
        (dueCount > 0
            ? '<div class="sb-srs-due" style="font-size:0.78rem;font-weight:700;letter-spacing:0.04em;color:#f59e0b;margin-bottom:6px;">📚 ' + dueCount + ' WORDS DUE</div>'
            : '<div class="sb-srs-due" style="font-size:0.78rem;font-weight:700;letter-spacing:0.04em;color:#22c55e;margin-bottom:6px;">📚 ALL CAUGHT UP</div>');
    badge.className = '';
    if (s === 'active') badge.classList.add('sb-active');
    else if (s === 'at_risk') badge.classList.add('sb-at-risk');
    else if (s === 'broken') badge.classList.add('sb-broken');
    const saveFaceHtml = (s === 'at_risk' || s === 'broken')
        ? '<button class="sb-btn-saveface" id="sbSaveFaceBtn">🙏 Save Face</button>' : '';
    const statusText = s === 'active'
        ? '<span class="sb-status ok">TODAY: DONE ✓</span>'
        : s === 'at_risk'
        ? '<span class="sb-status warn">CHECK IN NOW — FACE AT RISK 🚨</span>'
        : '<span class="sb-status warn">STREAK BROKEN — RESTART TODAY</span>';
    badge.innerHTML =
        '<button class="sb-dismiss" onclick="document.getElementById(\'streak-badge\').style.display=\'none\'" title="Close">✕</button>' +
        '<div class="sb-fire">🔥</div>' +
        '<div class="sb-streak-count' + (s !== 'active' ? ' sb-count-danger' : '') + '">' + streak + ' DAY STREAK</div>' +
        statusText +
        '<div class="sb-total-days">' + total + ' total active days &nbsp;&bull;&nbsp; best: ' + longest + '</div>' +
        dueHtml +
        '<button class="sb-btn-checkin" id="sbCheckinBtn">CHECK IN</button>' +
        saveFaceHtml +
        '<div class="sb-confirm" id="sbConfirm"></div>';
    badge.style.display = '';

    const checkinBtn = bt$('sbCheckinBtn');
    if (checkinBtn) {
        checkinBtn.addEventListener('click', function() {
            const btn = this; btn.disabled = true; btn.textContent = 'CHECKING IN…';
            fetch(BT_API + '/api/student/checkin', {
                method: 'POST', headers: {'Content-Type':'application/json'},
                body: JSON.stringify({studentId: data.studentId})
            }).then(function(r){ return r.json(); }).then(function(){
                btSbFetch(data.studentId);
            }).catch(function(){
                btn.disabled = false; btn.textContent = 'CHECK IN';
            });
        });
    }
    const sfBtn = bt$('sbSaveFaceBtn');
    if (sfBtn) {
        sfBtn.addEventListener('click', function() {
            const b = this; b.disabled = true;
            fetch(BT_API + '/api/student/saveface', {
                method: 'POST', headers: {'Content-Type':'application/json'},
                body: JSON.stringify({studentId: data.studentId})
            }).then(function(){
                const c = bt$('sbConfirm');
                if (c) { c.textContent = 'Save face logged ✓'; }
            }).catch(function(){ b.disabled = false; });
        });
    }
}

function btSbFetch(studentId) {
    fetch(BT_API + '/api/student/streak/' + studentId)
        .then(function(r){ return r.ok ? r.json() : null; })
        .then(function(d){
            if (!d) return;
            d.studentId = studentId;
            fetch(BT_API + '/api/vocab/due?studentId=' + studentId)
                .then(function(r){ return r.ok ? r.json() : null; })
                .then(function(due){ btSbRender(d, due); })
                .catch(function(){ btSbRender(d, null); });
        })
        .catch(function(){});
}

function btInitStreakBadge(studentId) {
    if (btIsAuthed(studentId)) btSbFetch(studentId);
    else document.addEventListener('portalUnlocked', function() { btSbFetch(studentId); });
}

/* ── Comprehensive Mai Tram vocab ── */
function btMaiTramVocabData() {
    return {
        categories: [
            { name: "Home & Living", color: "#a855f7", words: ["home","floor","hardwood","cabinet","lamp","fireplace","furnishings","nest","feathers","lake","inside","outside","window","smell","pretty","door","bathroom"] },
            { name: "Phonics & Language", color: "#3b82f6", words: ["letter","sound","alphabet","phonics","cat","kitten","kite","kitchen","elephant","application","computer","university","umbrella","spell","type","report","study","distract","animal","syllable","pronounce","intonation","reading","fluency"] },
            { name: "AI & Tech", color: "#14b8a6", words: ["model","agent","chatbot","apps","automate","email","drive","data","Gemini","Claude","Grok","GPT","Anthropic","Google","YouTube","Notion","Slack","task","tasks","research","knowledge","database","processing","trial","powerful","free","version","built","trained","billions","difference","exit","stop","pause","begin","finish"] },
            { name: "Workplace", color: "#f59e0b", words: ["contract","contracts","sign","bonus","salary","overtime","schedule","deadline","meeting","colleague","feedback","approve","urgent","flexible","HR","admin","manager","supervisor","team leader","employee","interviewer","candidate","office","work from home","performance","quarterly","CEO","insurance","accounting","hire","increase","signed","signing","bonuses","extra","raise","resume","department"] },
            { name: "Business Actions", color: "#ef4444", words: ["scan","boost","share","hire","increase","throw","party","buy","dinner","lunch","stay","ask","signed","signing","bonuses","pay","paid","vending","throughout","send","mail","review","copy","paste","collect","notes","emails","tasks","automate"] },
            { name: "Time & Schedule", color: "#22c55e", words: ["o'clock","Saturday","Sunday","weekend","morning","afternoon","months","year","quarterly","finish","date","twice","half","hour","hours","early","late","ahead","waiting","deadline","schedule","throughout","PM","AM"] },
            { name: "Food & Health", color: "#f97316", words: ["lettuce","strawberry","cherry","cherries","vitamin","fruit","allergic","itchy","healthy","energy","stress","food","eat","drink"] },
            { name: "Feelings & Abstract", color: "#ec4899", words: ["mature","compliment","polite","impolite","shy","confident","jealous","energy","stress","annoying","illegal","lose face","embarrassing","rude","careful","humble","modest","proper","natural","sucks","cool","great","awesome","terrible","wonderful"] },
            { name: "Idioms & Slang", color: "#8b5cf6", words: ["that sucks","cool","ASAP","no-brainer","game plan","heads up","nailed it","hit the ground running","keep me in the loop","on the same page","touch base","ball is in your court","blue moon","once in a blue moon","hit and run","lose face","save face"] }
        ],
        commonPhrases: [
            "I need to scan on the contract and boost it into my company's drive",
            "We should do the work vending in the Saturday throughout the PM",
            "Strawberry and Cherry is the actors. Their enemy? And the strawberry killed the Cherry.",
            "Finish at 04:30 o'clock",
            "That sucks",
            "I'm mature",
            "She's very confident",
            "We pay to the salary. This is the bonus.",
            "Because they're shining, so I can Oh, sign? Shine. Shine.",
            "I have to work admin and HR.",
            "Miss Quinn is my manager. Team leader of finance and accountant.",
            "You never say me. You say I.",
            "If you embarrass them in front of a meeting, that's rude.",
            "The cat sat on the mat and drank some milk.",
            "A dog ran quickly across the field to catch a stick."
        ]
    };
}

function btRenderComprehensiveVocab(studentId) {
    const container = bt$('vocabWidget');
    if (!container) return;
    if (studentId !== 'mai-tram-bluetech') {
        btLoadVocabWidgetApi(studentId);
        return;
    }
    const data = btMaiTramVocabData();
    const escHtml = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    let totalWords = 0;
    let html = '<div style="margin-bottom:14px;font-family:Orbitron,sans-serif;font-size:.9rem;font-weight:600;color:var(--gold);letter-spacing:.04em;">📚 MY VOCABULARY — ALL WORDS</div>';
    html += '<div style="display:flex;flex-direction:column;gap:16px;">';
    data.categories.forEach(cat => {
        totalWords += cat.words.length;
        const pills = cat.words.map(w => '<span style="background:' + cat.color + '18;border:1px solid ' + cat.color + '44;border-radius:10px;padding:5px 11px;font-size:.78rem;color:' + cat.color + ';">' + escHtml(w) + '</span>').join('');
        html += '<div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:14px;padding:14px;">' +
            '<div style="font-family:Rajdhani,sans-serif;font-size:.78rem;font-weight:700;color:' + cat.color + ';letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px;">' + escHtml(cat.name) + ' · ' + cat.words.length + '</div>' +
            '<div style="display:flex;flex-wrap:wrap;gap:6px;">' + pills + '</div>' +
            '</div>';
    });
    html += '</div>';
    html += '<div style="margin-top:14px;background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:14px;padding:14px;">' +
        '<div style="font-family:Rajdhani,sans-serif;font-size:.78rem;font-weight:700;color:var(--gold);letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px;">Common Phrases From Class</div>' +
        '<ul style="margin:0 0 0 18px;padding:0;color:var(--dim);line-height:1.7;font-size:.85rem;">' +
        data.commonPhrases.map(p => '<li>' + escHtml(p) + '</li>').join('') +
        '</ul></div>';
    html += '<div style="margin-top:8px;font-size:.75rem;color:var(--dim);text-align:right;">' + totalWords + ' words · 9 categories</div>';
    container.innerHTML = html;
}

function btLoadVocabWidgetApi(studentId) {
    const container = bt$('vocabWidget');
    if (!container) return;
    try {
        const res = await fetch('/api/vocab/list?studentId=' + encodeURIComponent(studentId));
        if (!res.ok) throw new Error();
        const data = await res.json();
        const words = Array.isArray(data.words) ? data.words : [];
        const total = data.total || words.length;
        const last10 = words.slice(-10).reverse();
        const escHtml = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
        let html = '<div style="font-family:Orbitron,sans-serif;font-size:.85rem;font-weight:600;color:var(--gold);letter-spacing:.04em;margin-bottom:10px;">🐯 My Words (' + total + ')</div>';
        if (!last10.length) {
            html += '<div style="font-size:.85rem;color:var(--dim);font-style:italic">No words yet — practice with OBI to earn your first!</div>';
        } else {
            html += '<div style="display:flex;flex-wrap:wrap;gap:8px;">';
            last10.forEach(w => { html += '<span style="background:rgba(168,85,247,.12);border:1px solid rgba(168,85,247,.25);border-radius:12px;padding:6px 12px;display:flex;flex-direction:column;align-items:center;"><span style="font-weight:700;font-size:.9rem;">' + escHtml(w.word) + '</span><span style="font-size:.7rem;opacity:.75;margin-top:2px;">' + escHtml(w.meaning_vi) + '</span></span>'; });
            html += '</div>';
            if (words.length > 10) html += '<div style="margin-top:8px;font-size:.72rem;color:var(--dim);">Showing last 10 of ' + total + ' words</div>';
        }
        container.innerHTML = html;
    } catch { container.innerHTML = ''; }
}

/* ── Weekly widget ── */
function btLoadWeeklyWidget(studentId) {
    try {
        const [fRes, sRes] = await Promise.all([
            fetch(`/api/student/forecast/${studentId}`).then(r => r.ok ? r.json() : null).catch(() => null),
            fetch(`/api/student/streak/${studentId}`).then(r => r.ok ? r.json() : null).catch(() => null),
        ]);
        if (!fRes && !sRes) return;
        const widget = bt$('weekly-widget');
        if (!widget) return;

        const mastered = fRes?.masteredWords ?? 0;
        const total = fRes?.totalWords ?? 0;
        btText('ww-mastered', mastered);
        const wwSub = bt$('ww-mastered-sub');
        if (wwSub) wwSub.textContent = total > 0 ? `of ${total} studied` : 'keep reviewing!';

        const streak = sRes?.currentStreak ?? 0;
        const best = sRes?.longestStreak ?? 0;
        btText('ww-streak', streak + (streak === 1 ? ' day' : ' days'));
        const wwSub2 = bt$('ww-streak-sub');
        if (wwSub2) wwSub2.textContent = streak >= 7 ? '🔥 on fire!' : `best: ${best}d`;
        btRenderStreakDots(sRes);

        const CEFR = [{l:'A1',t:50},{l:'A2',t:150},{l:'B1',t:300},{l:'B2',t:500},{l:'C1',t:800}];
        const cur = fRes?.currentLevel || 'A1';
        const tgt = fRes?.targetLevel || 'A2';
        const nextTarget = CEFR.find(c => c.l === tgt);
        const prevTarget = CEFR[CEFR.findIndex(c => c.l === tgt) - 1];
        const prevWords = prevTarget ? prevTarget.t : 0;
        const nextWords = nextTarget ? nextTarget.t : 50;
        const pct = Math.min(100, Math.round(((mastered - prevWords) / (nextWords - prevWords)) * 100)) || 0;
        btText('ww-level', cur);
        const bar = bt$('ww-bar');
        if (bar) bar.style.width = pct + '%';
        const wwSub3 = bt$('ww-level-sub');
        if (wwSub3) wwSub3.textContent = pct + '% to ' + tgt;

        widget.style.display = 'flex';
    } catch(e) {}
}

/* ── Goals ── */
function btLoadGoals(studentId) {
    try {
        const r = await fetch(`/api/student/goals?studentId=${studentId}`);
        const d = await r.json();
        if (!d.goalsSet) return;
        const el = bt$('goals-widget');
        const content = bt$('goals-content');
        if (!el || !content) return;
        const badge = bt$('goals-badge');
        if (badge) badge.remove();
        content.innerHTML =
            '<div id="goals-badge" style="font-size:12px;color:#888;margin-bottom:6px">' +
            '🎯 ' + (d.targetLevel || 'Target') + ' · ' + (d.daysLeft || '?') + ' days left ' +
            (d.onTrack ? '<span style="color:#4ade80">● on track</span>' : '<span style="color:#f97316">● review needed</span>') +
            '</div>';
        el.style.display = 'block';
    } catch(e) {}
}

/* ── Forecast widget ── */
function btLoadForecast(studentId) {
    try {
        const r = await fetch(`/api/student/forecast/${studentId}`);
        const d = await r.json();
        if (!d.graduationDate) return;
        const el = bt$('forecast-widget');
        if (!el) return;
        const days = d.projectedDays;
        const conf = { low: '~', medium: '', high: '' }[d.confidence] || '';
        el.innerHTML =
            '<div class="forecast-level">' + d.currentLevel + ' → ' + d.targetLevel + '</div>' +
            '<div class="forecast-date">🎓 ' + conf + d.graduationDate + '</div>' +
            '<div class="forecast-sub">' + d.masteredWords + '/' + d.totalWords + ' words · ' + days + 'd to next level</div>';
        el.style.display = 'block';
    } catch(e) {}
}

/* ── Homework notes ── */
function btInitHomeworkNotes(studentId) {
    const notesEl = bt$('homeworkNotes');
    const saveBtn = bt$('saveNotesBtn');
    const status = bt$('notesStatus');
    if (!notesEl) return;
    try {
        const r = await fetch('/api/student/state?studentId=' + studentId);
        const d = await r.json();
        if (d.homework_notes) notesEl.value = d.homework_notes;
    } catch (e) { console.warn('homework notes load failed', e); }
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            try {
                status.textContent = 'Saving...';
                const r = await fetch('/api/student/state', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ studentId: studentId, homework_notes: notesEl.value })
                });
                if (r.ok) { status.textContent = 'Saved'; status.style.color = '#22c55e'; }
                else { status.textContent = 'Save failed'; status.style.color = '#ef4444'; }
            } catch (e) { status.textContent = 'Network error'; status.style.color = '#ef4444'; }
        });
    }
}

/* ── Phonics ── */
const PHONICS_COLORS = ['#a855f7','#3b82f6','#22c55e','#eab308','#f97316','#ef4444','#f59e0b'];
async function btLoadPhonics(studentId, advanceFn) {
    try {
        const r = await fetch('/api/phonics/progress?studentId=' + studentId);
        const d = await r.json();
        const color = PHONICS_COLORS[d.current_group - 1];
        const badge = bt$('phonicsGroupBadge');
        if (badge) {
            badge.textContent = d.group_name;
            badge.style.color = color; badge.style.borderColor = color+'66'; badge.style.background = color+'22';
        }
        const gn = bt$('phonicsGroupNum');
        if (gn) gn.textContent = 'Group ' + d.current_group + ' of 7';
        const pbar = bt$('phonicsPBar');
        if (pbar) { pbar.style.width = d.completion_pct + '%'; pbar.style.background = color; }
        const pl = bt$('phonicsPLabel');
        if (pl) pl.textContent = d.drills_completed.length + '/5 drills · ' + d.completion_pct + '%';
        if (d.next_drill) {
            const ds = bt$('phonicsDrillSentence');
            const dt = bt$('phonicsDrillTip');
            if (ds) ds.textContent = '"' + d.next_drill.sentence + '"';
            if (dt) dt.textContent = d.next_drill.tip;
        }
        if (d.dominant_errors && d.dominant_errors.length > 0) {
            const fe = bt$('phonicsFocusErr');
            if (fe) { fe.style.display = 'block'; fe.textContent = 'Focus: ' + d.dominant_errors[0].replace(/_/g,' '); }
        }
        const advBtn = bt$('phonicsAdvBtn');
        if (advBtn) advBtn.style.display = d.completion_pct >= 80 ? 'inline-block' : 'none';
        const card = bt$('phonicsCard');
        if (card) card.style.display = 'block';
    } catch(e) {}
}

async function btAdvancePhonics(studentId) {
    const r = await fetch('/api/phonics/advance',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({studentId:studentId})});
    const d = await r.json();
    if (d.advanced) btLoadPhonics(studentId);
}

/* ── Class Review ── */
async function btLoadClassReview(studentId) {
    const container = bt$('classReviewContainer');
    const card = bt$('classReviewCard');
    if (!container || !card || studentId !== 'mai-tram-bluetech') return;
    try {
        const r = await fetch('/OPERATIONS/CLASS-INTEL/mai-tram-classes.json');
        if (!r.ok) throw new Error();
        const data = await r.json();
        if (!Array.isArray(data) || !data.length) return;
        card.style.display = 'block';
        const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
        let html = '';
        data.forEach(cls => {
            html += '<div style="margin-bottom:24px;background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:14px;padding:16px;">';
            html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">';
            html += '<span style="font-size:1.3rem;">' + esc(cls.icon) + '</span>';
            html += '<span style="font-family:Orbitron,sans-serif;font-size:1rem;font-weight:600;color:var(--text);">' + esc(cls.date) + ' — ' + esc(cls.title) + '</span>';
            html += '</div>';
            html += '<p style="color:var(--dim);font-size:.88rem;line-height:1.6;margin-bottom:12px;">' + esc(cls.description) + '</p>';
            if (Array.isArray(cls.audioParts) && cls.audioParts.length) {
                html += '<div style="margin-bottom:12px;">';
                cls.audioParts.forEach(part => {
                    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:10px;padding:10px 12px;">';
                    html += '<button class="ca-play" style="width:36px;height:36px;border-radius:50%;border:1px solid var(--border);background:var(--purple);color:#fff;cursor:pointer;font-size:.8rem;">▶</button>';
                    html += '<div style="flex:1;min-width:0;"><div style="font-size:.85rem;font-weight:600;color:var(--text);">' + esc(part.title) + '</div></div>';
                    html += '<audio preload="none" style="height:32px;"><source src="' + esc(part.src) + '" type="audio/mpeg"></audio>';
                    html += '</div>';
                });
                html += '</div>';
            }
            if (Array.isArray(cls.keyMoments) && cls.keyMoments.length) {
                html += '<div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:12px;">';
                html += '<div style="font-family:Rajdhani,sans-serif;font-size:.78rem;font-weight:700;color:var(--gold);letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px;">💬 Key Moments</div>';
                html += '<div style="font-size:.88rem;color:var(--dim);line-height:1.7;">';
                cls.keyMoments.forEach(km => {
                    html += '<div style="margin-bottom:8px;"><span style="color:var(--text);font-weight:500;">' + esc(km.quote) + '</span> <span style="color:var(--dim);">— ' + esc(km.note) + '</span></div>';
                });
                html += '</div></div>';
            }
            if (Array.isArray(cls.topics) && cls.topics.length) {
                html += '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
                cls.topics.forEach(t => {
                    html += '<span style="background:rgba(168,85,247,.12);border:1px solid rgba(168,85,247,.25);border-radius:10px;padding:4px 10px;font-size:.78rem;color:var(--purple);">' + esc(t) + '</span>';
                });
                html += '</div>';
            }
            html += '</div>';
        });
        container.innerHTML = html;
    } catch(e) {}
}

/* ── Vocab widget entry ── */
function btLoadVocabWidget(studentId) {
    if (studentId === 'mai-tram-bluetech') {
        btRenderComprehensiveVocab(studentId);
    } else {
        btLoadVocabWidgetApi(studentId);
    }
}
