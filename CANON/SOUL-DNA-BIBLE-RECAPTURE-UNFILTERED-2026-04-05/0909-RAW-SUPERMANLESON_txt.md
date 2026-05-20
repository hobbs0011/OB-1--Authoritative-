# RAW VERBATIM — SUPERMANLESON.txt
## Corpus Metadata
- chunk_seq   : 0909
- chunk_id    : 0909-RAW-SUPERMANLESON_txt
- source_file : C:\Users\mrmic\OneDrive\Documents\GitHub\phoenix-chat-logs\CHAT-LOGS-ONLY\SUPERMANLESON.txt
- sha256      : 7F763D0F38B4503B81F52E73CF394CF4124690E10F7096A1B3DD3BE7C64188B3
- size_bytes  : 17840
- lines       : 295
- ingested    : 2026-04-05
- phase       : Phase 2 — Raw Chat Log Ingest
- policy      : VERBATIM — No edits, no summaries, no AI overlays
- keywords    : 

---

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Superman: The Perfection Program</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --color-primary-gold: #D4AF37;
            --color-primary-purple: #6B4C9A;
            --color-purple-light: #9B7CB8;
            --color-bg-dark: #1A1A2E;
            --color-bg-card: #2D2D44;
            --color-text-light: #FFFFFF;
            --color-gold-light: #F4E4A6;
            --color-text-muted: #C8C8D8;
        }
        html { scroll-behavior: smooth; }
        body { 
            font-family: 'Poppins', sans-serif;
            background: var(--color-bg-dark);
            color: var(--color-text-light);
            background-image: 
                radial-gradient(circle at 20% 50%, rgba(107, 76, 154, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(212, 175, 55, 0.1) 0%, transparent 50%);
        }
        .net-header h1 {
            font-size: 2.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--color-gold-light) 0%, var(--color-primary-gold) 50%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 0 15px rgba(212, 175, 55, 0.3);
        }
        .container { max-width: 1400px; }
        
        /* --- V13 Cosmic Styles --- */
        @keyframes saiyan-glow {
            0% { box-shadow: 0 0 5px rgba(212, 175, 55, 0.2); }
            50% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.5); }
            100% { box-shadow: 0 0 5px rgba(212, 175, 55, 0.2); }
        }
        @keyframes title-shimmer {
            0% { text-shadow: 0 0 15px rgba(212, 175, 55, 0.3); }
            50% { text-shadow: 0 0 25px rgba(244, 228, 166, 0.5); }
            100% { text-shadow: 0 0 15px rgba(212, 175, 55, 0.3); }
        }
        .net-header h1 {
            animation: title-shimmer 5s infinite ease-in-out;
        }
        .title-pop {
            letter-spacing: 0.025em;
            text-shadow: 0 0 8px rgba(212, 175, 55, 0.4);
        }
        .lesson-card {
            background: var(--color-bg-card);
            border: 1px solid rgba(212, 175, 55, 0.2);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
            position: relative;
        }
        .lesson-card:not(.expanded):hover {
            transform: translateY(-5px) scale(1.03);
            box-shadow: 0 8px 30px rgba(212, 175, 55, 0.3);
            border-color: var(--color-primary-gold);
        }
        .lesson-card.minimized {
            transform: scale(0); opacity: 0; width: 0; height: 0;
            margin: 0 !important; padding: 0 !important; border: none;
        }
        .lesson-card.expanded {
            position: fixed; top: 5vh; left: 5vw;
            width: 90vw; height: 90vh;
            cursor: default; z-index: 50; overflow-y: auto;
            animation: saiyan-glow 4s infinite ease-in-out;
        }
        .lesson-card .overview-content { transition: opacity 0.3s ease; }
        .lesson-card.expanded .overview-content { opacity: 0; height: 0; }
        .lesson-card .full-lesson-content {
            visibility: hidden; opacity: 0; transform: translateY(20px);
            transition: opacity 0.4s ease 0.3s, transform 0.4s ease 0.3s, visibility 0s 0.7s;
        }
        .lesson-card.expanded .full-lesson-content {
            visibility: visible; opacity: 1; transform: translateY(0);
            transition-delay: 0.3s;
        }
        .lesson-nav-button {
            color: var(--color-text-muted); background-color: transparent; padding: 0.5rem 1rem;
            border-radius: 8px; transition: all 0.3s ease;
        }
        .lesson-nav-button.active {
            background: var(--color-primary-purple); color: var(--color-gold-light);
            box-shadow: 0 0 8px rgba(107, 76, 154, 0.5);
        }
        .lesson-card.expanded::-webkit-scrollbar { width: 8px; }
        .lesson-card.expanded::-webkit-scrollbar-track { background: transparent; }
        .lesson-card.expanded::-webkit-scrollbar-thumb { background: var(--color-primary-gold); border-radius: 10px; }
        .cosmic-glyph {
            position: absolute;
            top: 0.75rem;
            right: 0.75rem;
            width: 2.5rem;
            height: 2.5rem;
            opacity: 0.1;
            filter: drop-shadow(0 0 5px var(--color-primary-gold));
        }
    </style>
</head>
<body class="p-4 md:p-8">

    <div class="container mx-auto">
        <header class="net-header text-center mb-10">
            <h1>THE SUPERMAN THESIS</h1>
            <p class="text-xl mt-1 text-purple-light tracking-wider">The Cosmic Edition</p>
        </header>

        <section id="singularity-canvas" class="mb-12">
            <div class="text-center max-w-3xl mx-auto mb-8">
                <h2 class="text-2xl font-bold text-primary-gold mb-4 title-pop">Engage the Canvas</h2>
                <p class="text-md text-text-muted">Select any lesson module. The canvas will transform.</p>
            </div>
            <div id="lesson-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                <!-- Lesson cards will be dynamically inserted here -->
            </div>
        </section>
    </div>
    
    <div id="backdrop" class="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-40 transition-opacity duration-500 opacity-0 pointer-events-none"></div>

    <script type="application/json" id="superman-data-json">
    [
        {"lesson": 1, "pillar": "The Alien", "title": "The Last Son: An Immigrant's Story"},
        {"lesson": 2, "pillar": "The Morality", "title": "Smallville: The Crucible of Character"},
        {"lesson": 3, "pillar": "The Alien", "title": "The Fortress of Solitude: A Heritage of Hope"},
        {"lesson": 4, "pillar": "The Hope", "title": "The 'S': Forging a Global Symbol"},
        {"lesson": 5, "pillar": "The Morality", "title": "Truth, Justice, and The American Way"},
        {"lesson": 6, "pillar": "The Power", "title": "The Never-Ending Battle: A Moral Imperative"},
        {"lesson": 7, "pillar": "The Hope", "title": "Inspiration vs. Intervention"},
        {"lesson": 8, "pillar": "The Power", "title": "The World of Cardboard: The Burden of Power"},
        {"lesson": 9, "pillar": "The Duality", "title": "The Luthor Problem: Humanity's Envy"},
        {"lesson": 10, "pillar": "The Alien", "title": "The Brainiac Incursion: Alien Intellect"},
        {"lesson": 11, "pillar": "The Alien", "title": "Kneel Before Zod: A Clash of Ideologies"},
        {"lesson": 12, "pillar": "The Duality", "title": "The Batman Paradox: Hope vs. Fear"},
        {"lesson": 13, "pillar": "The Duality", "title": "The Clark Kent Deception"},
        {"lesson": 14, "pillar": "The Morality", "title": "Lois Lane: The Human Anchor"},
        {"lesson": 15, "pillar": "The Morality", "title": "The Daily Planet: The Power of the Press"},
        {"lesson": 16, "pillar": "The Hope", "title": "The Death of Superman: A World Without Hope"},
        {"lesson": 17, "pillar": "The Power", "title": "Kingdom Come: An Unchecked God"},
        {"lesson": 18, "pillar": "The Power", "title": "Red Son: Nature vs. Nurture"},
        {"lesson": 19, "pillar": "The Hope", "title": "All-Star Superman: The Myth Made Real"},
        {"lesson": 20, "pillar": "The Duality", "title": "Final Synthesis: The Man of Tomorrow"}
    ]
    </script>

    <script>
    document.addEventListener('DOMContentLoaded', () => {
        const LESSON_DATA = JSON.parse(document.getElementById('superman-data-json').textContent);
        
        const lessonGrid = document.getElementById('lesson-grid');
        const backdrop = document.getElementById('backdrop');

        // --- V13 Cosmic Glyphs ---
        const cosmicGlyphs = {
            "The Alien": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="cosmic-glyph"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 15.75l-3.75-3.75M8.25 15.75L12 12m0 0l3.75 3.75M12 12l-3.75 3.75M12 3v8.25m0 0l3.75-3.75M12 11.25L8.25 7.5" /></svg>`,
            "The Hope": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="cosmic-glyph"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>`,
            "The Power": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="cosmic-glyph"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>`,
            "The Morality": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="cosmic-glyph"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.153.24c-1.095 0-2.14-.23-3.13-.652m-2.62-10.726c.122.499.106 1.028-.028 1.45l-2.032 3.863a1.125 1.125 0 01-1.357 1.357l-3.863-2.032a1.45 1.45 0 01-.028-1.45l10.726-2.62z" /></svg>`,
            "The Duality": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="cosmic-glyph"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a3 3 0 00-3-3H6a3 3 0 00-3 3v5.25M12 18v-5.25m0 0a3 3 0 013-3h3a3 3 0 013 3v5.25" /><path stroke-linecap="round" stroke-linejoin="round" d="M9 9.75h6" /></svg>`
        };

        function renderOverviewCards() {
            lessonGrid.innerHTML = '';
            LESSON_DATA.forEach(lesson => {
                const card = document.createElement('div');
                card.className = 'lesson-card';
                card.id = `lesson-card-${lesson.lesson}`;
                card.dataset.lessonId = lesson.lesson;
                card.innerHTML = `
                    <div class="overview-content p-4 text-center flex flex-col justify-center items-center h-full">
                        <p class="font-black text-2xl text-primary-gold">${lesson.lesson}</p>
                        <p class="font-semibold text-sm text-text-light mt-1">${lesson.title}</p>
                    </div>
                    <div class="full-lesson-content"></div>
                    ${cosmicGlyphs[lesson.pillar] || ''}
                `;
                lessonGrid.appendChild(card);
            });
        }

        function generateFullLessonContent(lessonId) {
            const lesson = LESSON_DATA.find(l => l.lesson == lessonId);
            const tabs = [
                { "name": "Key Concepts", "icon": "🎯", "content": [{"term": "Primary Theme", "def": `Exploration of ${lesson.title}'s core idea.`}, {"term": "Secondary Theme", "def": "A related concept for deeper understanding."}] },
                { "name": "Deeper Analysis", "icon": "🧠", "content": `This section provides a deep, nuanced analysis of "${lesson.title}", exploring its mythological roots, literary significance, and impact on popular culture.` },
                { "name": "Hypothetical Scenario", "icon": "⚙️", "content": `Imagine a world where the central conflict of "${lesson.title}" was resolved differently. What would the long-term consequences be for Superman and humanity?` },
                { "name": "Critical Thinking", "icon": "🤔", "content": [`What does this story teach us about our own world?`, `Is the lesson of "${lesson.title}" still relevant today? Why or why not?`] }
            ];
            const introduction = `An immersive exploration into the archetype of "${lesson.title}", designed to provide a comprehensive understanding of its role in the Superman mythos.`;
            const takeaway = `The central, unforgettable truth of "${lesson.title}" is that great power forces even greater choices.`;

            let tabsHtml = tabs.map((tab, index) => `<button class="lesson-nav-button ${index === 0 ? 'active' : ''}" data-target="tab-${lessonId}-${index}">${tab.icon} ${tab.name}</button>`).join('');
            let tabContentHtml = tabs.map((tab, index) => {
                 let contentHtml = '';
                if (Array.isArray(tab.content)) {
                    if (tab.name === "Key Concepts") {
                        contentHtml = tab.content.map(c => `<li class="mb-3"><strong class="text-gold-light">${c.term}:</strong> <span class="text-text-muted">${c.def}</span></li>`).join('');
                        contentHtml = `<ul class="list-none pl-0 space-y-2">${contentHtml}</ul>`;
                    } else { // Critical Thinking
                        contentHtml = tab.content.map(q => `<li class="mb-2">${q}</li>`).join('');
                        contentHtml = `<ul class="list-disc pl-5 space-y-2 text-text-muted">${contentHtml}</ul>`;
                    }
                } else {
                    contentHtml = `<p class="text-text-muted leading-relaxed">${tab.content}</p>`;
                }
                return `<div id="tab-${lessonId}-${index}" class="lesson-tab-content ${index === 0 ? '' : 'hidden'} mt-6">${contentHtml}</div>`;
            }).join('');

            return `
                <div class="p-4 md:p-8">
                    <header class="text-center pb-8">
                        <div class="flex justify-center items-center gap-4">
                           ${cosmicGlyphs[lesson.pillar] ? cosmicGlyphs[lesson.pillar].replace('cosmic-glyph', 'w-10 h-10 text-purple-light opacity-50') : ''}
                           <h1 class="text-3xl font-bold text-primary-gold title-pop">Lesson ${lesson.lesson}: ${lesson.title}</h1>
                        </div>
                        <p class="text-lg mt-2 text-text-muted">${introduction}</p>
                    </header>
                    <nav class="sticky top-0 z-10 p-2 flex flex-wrap justify-center gap-2 mb-6 bg-bg-dark rounded-lg">${tabsHtml}</nav>
                    <div class="lesson-tab-container">${tabContentHtml}</div>
                    <div class="mt-8 pt-4 border-t border-primary-purple">
                        <p class="font-bold text-lg text-primary-gold title-pop">💡 Key Takeaway:</p>
                        <p class="text-text-muted italic">${takeaway}</p>
                    </div>
                </div>
            `;
        }
        
        function expandLesson(lessonId) {
            const allCards = document.querySelectorAll('.lesson-card');
            const targetCard = document.getElementById(`lesson-card-${lessonId}`);
            if (targetCard.classList.contains('expanded')) return;
            
            targetCard.querySelector('.full-lesson-content').innerHTML = generateFullLessonContent(lessonId);
            
            backdrop.classList.remove('opacity-0', 'pointer-events-none');
            allCards.forEach(card => {
                if (card.id !== targetCard.id) card.classList.add('minimized');
            });
            targetCard.classList.add('expanded');

            targetCard.querySelectorAll('.lesson-nav-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const targetId = e.currentTarget.dataset.target;
                    targetCard.querySelectorAll('.lesson-tab-content').forEach(el => el.classList.add('hidden'));
                    targetCard.querySelectorAll('.lesson-nav-button').forEach(el => el.classList.remove('active'));
                    document.getElementById(targetId).classList.remove('hidden');
                    e.currentTarget.classList.add('active');
                });
            });
        }
        
        function collapseAllLessons() {
            const expandedCard = document.querySelector('.lesson-card.expanded');
            if (!expandedCard) return;
            
            backdrop.classList.add('opacity-0', 'pointer-events-none');
            expandedCard.classList.remove('expanded');
            setTimeout(() => {
                expandedCard.querySelector('.full-lesson-content').innerHTML = '';
            }, 500);
            
            document.querySelectorAll('.lesson-card.minimized').forEach(card => {
                card.classList.remove('minimized');
            });
        }
        
        renderOverviewCards();
        lessonGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.lesson-card');
            if (card && !card.classList.contains('expanded')) expandLesson(card.dataset.lessonId);
        });
        backdrop.addEventListener('click', collapseAllLessons);
    });
    </script>
</body>
</html>


