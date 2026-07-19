# RAW VERBATIM — BATCH_14.txt
## Corpus Metadata
- chunk_seq   : 0241
- chunk_id    : 0241-RAW-BATCH_14_txt
- source_file : C:\Users\mrmic\OneDrive\Documents\GitHub\phoenix-chat-logs\CHAT-LOGS-ONLY\BATCH_14.txt
- sha256      : 42EF845CEB53A377A6069781F69B4A73ABD64A6D69BFD24532C4007AB83B20A5
- size_bytes  : 42923
- lines       : 701
- ingested    : 2026-04-05
- phase       : Phase 2 — Raw Chat Log Ingest
- policy      : VERBATIM — No edits, no summaries, no AI overlays
- keywords    : SUPER_SAIYAN, VIETNAM

---

--- FILE: C:\Users\mrmic\Desktop\DropFiles\SINGULARITYPROGRAM.html ---

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Geopolitics: The Singularity Program</title>
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
        }
        .container { max-width: 1400px; }
        
        /* --- V11 Singularity Styles --- */
        @keyframes saiyan-glow {
            0% { box-shadow: 0 0 5px rgba(212, 175, 55, 0.2); }
            50% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.5); }
            100% { box-shadow: 0 0 5px rgba(212, 175, 55, 0.2); }
        }
        .lesson-card {
            background: var(--color-bg-card);
            border: 1px solid rgba(212, 175, 55, 0.2);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
            overflow: hidden;
        }
        .lesson-card:not(.expanded):hover {
            transform: translateY(-5px) scale(1.03);
            box-shadow: 0 8px 30px rgba(212, 175, 55, 0.3);
            border-color: var(--color-primary-gold);
        }
        .lesson-card.minimized {
            transform: scale(0);
            opacity: 0;
            width: 0;
            height: 0;
            margin: 0 !important;
            padding: 0 !important;
            border: none;
        }
        .lesson-card.expanded {
            position: fixed;
            top: 5vh;
            left: 5vw;
            width: 90vw;
            height: 90vh;
            cursor: default;
            z-index: 50;
            overflow-y: auto;
            animation: saiyan-glow 4s infinite ease-in-out;
        }
        .lesson-card .overview-content {
             transition: opacity 0.3s ease;
        }
        .lesson-card.expanded .overview-content {
            opacity: 0;
            height: 0;
        }
        .lesson-card .full-lesson-content {
            visibility: hidden;
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.4s ease 0.3s, transform 0.4s ease 0.3s, visibility 0s 0.7s;
        }
        .lesson-card.expanded .full-lesson-content {
            visibility: visible;
            opacity: 1;
            transform: translateY(0);
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
        /* Scrollbar for expanded lesson */
        .lesson-card.expanded::-webkit-scrollbar { width: 8px; }
        .lesson-card.expanded::-webkit-scrollbar-track { background: transparent; }
        .lesson-card.expanded::-webkit-scrollbar-thumb { background: var(--color-primary-gold); border-radius: 10px; }
    </style>
</head>
<body class="p-4 md:p-8">

    <div class="container mx-auto">
        <header class="net-header text-center mb-10">
            <h1>THE GEOPOLITICS PROGRAM</h1>
            <p class="text-xl mt-1 text-purple-light">The Singularity Edition</p>
        </header>

        <section id="singularity-canvas" class="mb-12">
            <div class="text-center max-w-3xl mx-auto mb-8">
                <h2 class="text-2xl font-bold text-primary-gold mb-4">Engage the Canvas</h2>
                <p class="text-md text-text-muted">Select any lesson module. The canvas will transform.</p>
            </div>
            <div id="lesson-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                <!-- Lesson cards will be dynamically inserted here -->
            </div>
        </section>
    </div>
    
    <div id="backdrop" class="fixed inset-0 bg-black bg-opacity-70 z-40 transition-opacity duration-500 opacity-0 pointer-events-none"></div>

    <script type="application/json" id="geopolitics-data-json">
    [
        {
            "lesson": 1, "pillar": "Foundations", "title": "The State & Sovereignty",
            "introduction": "Before analyzing the global chess game, we must understand the board and the pieces. This lesson explores the fundamental concepts of the State and its right to rule, Sovereignty, which shape borders, authority, and international relations.",
            "tabs": [
                {"name": "Key Concepts", "icon": "🎯", "content": [{"term": "State", "def": "A politically organized territory with a government, defined borders, and a permanent population."}, {"term": "Sovereignty", "def": "The supreme authority within a territory, meaning a state is independent and not controlled by outside forces."}, {"term": "Nation-State", "def": "An ideal form where a state's political borders coincide with the cultural boundaries of a single ethnic or cultural group."}]},
                {"name": "Deeper Analysis", "icon": "🧠", "content": "The modern state system, often called the Westphalian system, originated in 17th century Europe. It assumes that each state has exclusive sovereignty over its territory. However, this is constantly challenged by globalization, international law, and powerful non-state actors. The tension between the theoretical ideal of sovereignty and the practical reality of an interconnected world is a central theme in all of geopolitics."},
                {"name": "Hypothetical Scenario", "icon": "⚙️", "content": "A powerful tech company creates a self-sustaining floating city in international waters with its own laws and security. Is it a state? Does it have sovereignty? What happens when it projects its power onto existing nations? This scenario forces us to question if our centuries-old definitions are adequate for the future."},
                {"name": "Critical Thinking", "icon": "🤔", "content": ["Is the concept of a 'Nation-State' becoming obsolete in a globalized world?", "Can sovereignty exist when multinational corporations are more powerful than some states?", "How does the internet challenge traditional notions of borders and state control?"]}
            ],
            "takeaway": "The difference between a 'State' (political entity) and a 'Nation' (cultural group) is critical to understanding global conflicts."
        }
    ]
    </script>

    <script>
    document.addEventListener('DOMContentLoaded', () => {
        let LESSON_DATA = JSON.parse(document.getElementById('geopolitics-data-json').textContent);
        // Procedurally generate placeholder data for demo purposes
        if (LESSON_DATA.length < 20) {
            for (let i = 2; i <= 20; i++) {
                LESSON_DATA.push({
                    "lesson": i, "pillar": "Placeholder", "title": `Lesson ${i}: Placeholder Title`,
                    "introduction": `This is a placeholder for the full narrative content of Lesson ${i}.`,
                    "tabs": [
                        { "name": "Key Concepts", "icon": "🎯", "content": [{"term": `Concept for L${i}`, "def": "Detailed definition."}] },
                        { "name": "Deeper Analysis", "icon": "🧠", "content": `In-depth analysis for Lesson ${i}.` },
                        { "name": "Hypothetical Scenario", "icon": "⚙️", "content": `A compelling what-if scenario for Lesson ${i}.` },
                        { "name": "Critical Thinking", "icon": "🤔", "content": [`Core assumption of Lesson ${i}?`, `Modern application?`] }
                    ],
                    "takeaway": `Key takeaway for Lesson ${i}.`
                });
            }
        }
        
        const lessonGrid = document.getElementById('lesson-grid');
        const backdrop = document.getElementById('backdrop');

        function renderOverviewCards() {
            lessonGrid.innerHTML = '';
            LESSON_DATA.forEach(lesson => {
                const card = document.createElement('div');
                card.className = 'lesson-card';
                card.id = `lesson-card-${lesson.lesson}`;
                card.dataset.lessonId = lesson.lesson;

                // Overview Content (always present)
                const overviewContent = document.createElement('div');
                overviewContent.className = 'overview-content p-4 text-center';
                overviewContent.innerHTML = `
                    <p class="font-bold text-lg text-primary-gold">Lesson ${lesson.lesson}</p>
                    <p class="text-sm text-text-muted">${lesson.title}</p>
                `;
                
                // Full Lesson Content (initially hidden)
                const fullLessonContent = document.createElement('div');
                fullLessonContent.className = 'full-lesson-content';

                card.appendChild(overviewContent);
                card.appendChild(fullLessonContent);
                lessonGrid.appendChild(card);
            });
        }

        function expandLesson(lessonId) {
            const allCards = document.querySelectorAll('.lesson-card');
            const targetCard = document.getElementById(`lesson-card-${lessonId}`);
            
            if (targetCard.classList.contains('expanded')) return; // Already expanded

            const lesson = LESSON_DATA.find(l => l.lesson == lessonId);
            if (!lesson) return;
            
            // Inject full lesson HTML
            let tabsHtml = lesson.tabs.map((tab, index) => `<button class="lesson-nav-button ${index === 0 ? 'active' : ''}" data-target="tab-${lessonId}-${index}">${tab.icon} ${tab.name}</button>`).join('');
            let tabContentHtml = lesson.tabs.map((tab, index) => {
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

            targetCard.querySelector('.full-lesson-content').innerHTML = `
                <div class="p-4 md:p-8">
                    <header class="text-center pb-8">
                        <h1 class="text-3xl font-bold text-primary-gold">Lesson ${lesson.lesson}: ${lesson.title}</h1>
                        <p class="text-lg mt-2 text-text-muted">${lesson.introduction}</p>
                    </header>
                    <nav class="sticky top-0 z-10 p-2 flex flex-wrap justify-center gap-2 mb-6 bg-bg-dark rounded-lg">${tabsHtml}</nav>
                    <div class="lesson-tab-container">${tabContentHtml}</div>
                    <div class="mt-8 pt-4 border-t border-primary-purple">
                        <p class="font-bold text-lg text-primary-gold">💡 Key Takeaway:</p>
                        <p class="text-text-muted italic">${lesson.takeaway}</p>
                    </div>
                </div>
            `;
            
            // Animate
            backdrop.classList.remove('opacity-0');
            backdrop.classList.remove('pointer-events-none');
            allCards.forEach(card => {
                if (card.id !== targetCard.id) {
                    card.classList.add('minimized');
                }
            });
            targetCard.classList.add('expanded');

            // Add tab listeners
            targetCard.querySelectorAll('.lesson-nav-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation(); // prevent card from closing
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
            
            backdrop.classList.add('opacity-0');
            backdrop.classList.add('pointer-events-none');
            
            expandedCard.classList.remove('expanded');
            setTimeout(() => {
                expandedCard.querySelector('.full-lesson-content').innerHTML = '';
            }, 500); // clear content after transition
            
            document.querySelectorAll('.lesson-card.minimized').forEach(card => {
                card.classList.remove('minimized');
            });
        }
        
        // --- INITIALIZATION ---
        renderOverviewCards();

        lessonGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.lesson-card');
            if (card && !card.classList.contains('expanded')) {
                expandLesson(card.dataset.lessonId);
            }
        });
        
        backdrop.addEventListener('click', collapseAllLessons);
    });
    </script>
</body>
</html>




--- FILE: C:\Users\mrmic\Desktop\DropFiles\VIETNAM-SUPERLESSON.html ---

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vietnamese History: The Magnum Opus Program</title>
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
            /* --- Ultra Instinct Style --- */
            --color-ui-aura: #7dd3fc; /* sky-300 */
        }
        html { scroll-behavior: smooth; }
        body { 
            font-family: 'Poppins', sans-serif;
            background: var(--color-bg-dark);
            color: var(--color-text-light);
            background-image: 
                radial-gradient(circle at 20% 50%, rgba(107, 76, 154, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(125, 211, 252, 0.1) 0%, transparent 50%);
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
        
        @keyframes ui-glow {
            0% { box-shadow: 0 0 8px rgba(125, 211, 252, 0.3); }
            50% { box-shadow: 0 0 25px rgba(125, 211, 252, 0.6); }
            100% { box-shadow: 0 0 8px rgba(125, 211, 252, 0.3); }
        }
        .title-pop {
            letter-spacing: 0.025em;
            text-shadow: 0 0 8px rgba(212, 175, 55, 0.4);
        }
        .lesson-card {
            background: var(--color-bg-card);
            border: 1px solid rgba(125, 211, 252, 0.2);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
            position: relative;
        }
        .lesson-card:not(.expanded):hover {
            transform: translateY(-5px) scale(1.03);
            box-shadow: 0 8px 30px rgba(125, 211, 252, 0.2);
            border-color: var(--color-ui-aura);
        }
        .lesson-card.minimized {
            transform: scale(0); opacity: 0; width: 0; height: 0;
            margin: 0 !important; padding: 0 !important; border: none;
        }
        .lesson-card.expanded {
            position: fixed; top: 5vh; left: 5vw;
            width: 90vw; height: 90vh;
            cursor: default; z-index: 50; overflow-y: auto;
            animation: ui-glow 4s infinite ease-in-out;
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
            border-radius: 8px; transition: all 0.3s ease; border: 1px solid transparent;
        }
        .lesson-nav-button.active {
            background: var(--color-primary-purple); color: var(--color-gold-light);
            box-shadow: 0 0 8px rgba(107, 76, 154, 0.5); border-color: var(--color-purple-light);
        }
        .lesson-card.expanded::-webkit-scrollbar { width: 8px; }
        .lesson-card.expanded::-webkit-scrollbar-track { background: transparent; }
        .lesson-card.expanded::-webkit-scrollbar-thumb { background: var(--color-ui-aura); border-radius: 10px; }
        .cosmic-glyph {
            position: absolute;
            top: 0.75rem;
            right: 0.75rem;
            width: 2.5rem;
            height: 2.5rem;
            opacity: 0.1;
            filter: drop-shadow(0 0 5px var(--color-ui-aura));
        }
        /* Quiz Styles */
        .quiz-option {
            border: 1px solid var(--color-purple-light);
            transition: all 0.2s ease;
        }
        .quiz-option:hover {
            background: var(--color-primary-purple);
        }
        .quiz-option.selected {
            background: var(--color-primary-purple);
            border-color: var(--color-gold-light);
        }
        .quiz-option.correct {
            background: #10B981; border-color: #10B981;
        }
        .quiz-option.incorrect {
            background: #EF4444; border-color: #EF4444;
        }
    </style>
</head>
<body class="p-4 md:p-8">

    <div class="container mx-auto">
        <header class="net-header text-center mb-10">
            <h1>A HIGHLIGHT REEL OF VIETNAMESE HISTORY</h1>
            <p class="text-xl mt-1 text-purple-light tracking-wider">The Magnum Opus Edition</p>
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

    <script type="application/json" id="vietnam-data-json">
    [
        {"lesson": 1, "pillar": "Ancient Roots", "title": "The Bronze Age: Dawn of a Civilization"},
        {"lesson": 2, "pillar": "Ancient Roots", "title": "1000 Years of Chinese Domination"},
        {"lesson": 3, "pillar": "Ancient Roots", "title": "The Golden Age: Lý & Trần Dynasties"},
        {"lesson": 4, "pillar": "Ancient Roots", "title": "The Confucian Citadel: Later Lê Dynasty"},
        {"lesson": 5, "pillar": "Colonial Resistance", "title": "The French Arrival & Conquest"},
        {"lesson": 6, "pillar": "Colonial Resistance", "title": "Life Under the Tricolore"},
        {"lesson": 7, "pillar": "Colonial Resistance", "title": "Ho Chi Minh & The Rise of Nationalism"},
        {"lesson": 8, "pillar": "Colonial Resistance", "title": "The August Revolution & Independence"},
        {"lesson": 9, "pillar": "The Great War", "title": "The First Indochina War"},
        {"lesson": 10, "pillar": "The Great War", "title": "A Nation Divided: North & South"},
        {"lesson": 11, "pillar": "The Great War", "title": "The American War: Escalation"},
        {"lesson": 12, "pillar": "The Great War", "title": "Reunification and Aftermath"},
        {"lesson": 13, "pillar": "Economic Rebirth", "title": "The Hardship Era (1975-1985)"},
        {"lesson": 14, "pillar": "Economic Rebirth", "title": "Đổi Mới: The Great Renovation"},
        {"lesson": 15, "pillar": "Economic Rebirth", "title": "The Economic Miracle"},
        {"lesson": 16, "pillar": "Economic Rebirth", "title": "Joining the World Stage"},
        {"lesson": 17, "pillar": "Modern Ascent", "title": "The New Vietnam: A Balancing Act"},
        {"lesson": 18, "pillar": "Modern Ascent", "title": "Cultural Renaissance"},
        {"lesson": 19, "pillar": "Modern Ascent", "title": "Navigating the Future: Challenges"},
        {"lesson": 20, "pillar": "Modern Ascent", "title": "Final Synthesis: The Bamboo That Bends"}
    ]
    </script>

    <script>
    document.addEventListener('DOMContentLoaded', () => {
        const LESSON_DATA = JSON.parse(document.getElementById('vietnam-data-json').textContent);
        const lessonGrid = document.getElementById('lesson-grid');
        const backdrop = document.getElementById('backdrop');

        const cosmicGlyphs = {
            "Ancient Roots": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="cosmic-glyph"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.5v3c0 1.027.845 1.99 1.976 2.084 1.327.11 2.669.166 4.024.166m0 0c1.355 0 2.697-.056 4.024-.166C17.155 15.49 18 14.527 18 13.5v-3c0-1.027-.845-1.99-1.976-2.084A48.423 48.423 0 0012 8.25zm0 0V6" /></svg>`,
            "Colonial Resistance": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="cosmic-glyph"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>`,
            "The Great War": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="cosmic-glyph"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9.75v.001M12 12.75v.001M12 15.75v.001M3.75 4.5h16.5M3.75 19.5h16.5" /></svg>`,
            "Economic Rebirth": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="cosmic-glyph"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>`,
            "Modern Ascent": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="cosmic-glyph"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V8.25a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 8.25v10.5A2.25 2.25 0 006.75 21z" /></svg>`
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
        
        // --- ULTRA INSTINCT CONTENT ENGINE ---
        function generateFullLessonContent(lessonId) {
            const lesson = LESSON_DATA.find(l => l.lesson == lessonId);
            let tabs, introduction, takeaway;

            if (lesson.lesson === 2) { // ULTRA INSTINCT DEMONSTRATION
                introduction = `This lesson confronts the longest and most transformative period in Vietnamese history: the millennium of domination by Chinese dynasties. We will not see this as a simple story of victimhood, but as a crucible where the Vietnamese identity was forged in the fires of resistance, adaptation, and defiance. It is the story of how a culture refused to die.`;
                takeaway = `The 1000 years of domination failed to erase the Vietnamese identity because that identity had already been forged in the Bronze Age. Instead of being assimilated, the Vietnamese people selectively absorbed and adapted Chinese technology, administration, and philosophy, ultimately using these tools to sharpen their own resistance and reclaim their independence.`;
                tabs = [
                    { "name": "The Briefing (5m)", "icon": "🎯", "content": `
                        <ul class="list-none pl-0 space-y-4">
                            <li><strong class="text-gold-light">Key Period:</strong> 111 BCE - 938 CE. A span of over a thousand years, from the Han Dynasty's conquest to the decisive Battle of Bạch Đằng River.</li>
                            <li><strong class="text-gold-light">Key Theme:</strong> A constant cycle of Sinicization (imposition of Chinese culture) and Vietnamese resistance.</li>
                            <li><strong class="text-gold-light">Key Figures:</strong> The Trưng Sisters, Lady Triệu, Lý Bí. These are not just historical figures; they are immortal symbols of Vietnamese defiance who led major rebellions.</li>
                            <li><strong class="text-gold-light">Central Thesis:</strong> This era was not a dark age, but a formative period where Vietnam, through relentless struggle, developed the political and cultural tools necessary for eventual, permanent independence.</li>
                        </ul>` 
                    },
                    { "name": "The Deep Dive (20m)", "icon": "🧠", "content": `The Chinese domination began with the Han Dynasty's military conquest, driven by a desire to secure its southern frontier and control lucrative trade routes. For centuries, Chinese governors attempted a policy of "Sinicization"—imposing the Chinese language, Confucian bureaucracy, art, and even clothing upon the local Viets. This was not a passive process. It was met with fierce and repeated resistance.<br><br>The most famous uprising was led by the Trưng Sisters in 40 CE. After a Chinese governor executed Trưng Trắc's husband, she and her sister Trưng Nhị rallied local lords and raised an army, driving the Chinese out and establishing themselves as queens. Their rebellion, though ultimately crushed, sent a shockwave through history, proving that the Viet people would not be easily assimilated. They were followed by figures like Lady Triệu, a 9-foot-tall warrior who famously said, "I'd like to ride storms, kill sharks in the open sea, drive out the aggressors, reconquer the country, undo the ties of serfdom, and never bend my back to be the concubine of whatever man."<br><br>While resisting politically, the Vietnamese were pragmatic. They absorbed and "Vietnamized" Chinese innovations: advanced agricultural techniques, centralized administrative systems, the Confucian examination system for selecting officials, and Mahayana Buddhism. This selective adoption was a form of soft resistance; they took what was useful from their rulers, made it their own, and used it to build a society capable of one day governing itself.` 
                    },
                    { "name": "The Global Nexus (15m)", "icon": "🌍", "content": `This millennium was not isolated. While Vietnam was locked in its struggle with the Chinese Empire, the Roman Empire rose, reached its peak, and collapsed in the West. The Silk Road connected East and West, and goods and ideas flowed across continents. The powerful Tang Dynasty in China (618-907 CE), which ruled Vietnam for a significant portion of this era, was a cosmopolitan superpower whose influence was felt from Japan to Persia. The Vietnamese struggle was not against a local power, but against the most powerful empire on Earth at the time, making their eventual victory all the more remarkable.` 
                    },
                    { "name": "The Crucible (15m)", "icon": "🤔", "content": `
                        <ul class="list-disc pl-5 space-y-4 text-text-muted">
                            <li>How did the very tools of Chinese control (like a centralized bureaucracy and a written language) ironically become the tools Vietnam used to achieve independence?</li>
                            <li>The Trưng Sisters are national heroes in Vietnam but a minor footnote in Chinese history. How does the same event get remembered so differently, and what does that tell us about the nature of history?</li>
                            <li>Is it possible for a smaller nation to be neighbors with a superpower without being either completely dominated or perpetually in conflict? What is the "third way"?</li>
                        </ul>`
                    },
                    {
                        "name": "Knowledge Check (5m)", "icon": "✅",
                        "quiz": [
                            {
                                "q": "Who led the first major rebellion against Chinese rule in 40 CE?",
                                "options": ["Lady Triệu", "The Hùng Kings", "The Trưng Sisters", "Lý Bí"],
                                "answer": "The Trưng Sisters"
                            },
                            {
                                "q": "The Chinese policy of imposing its culture was called:",
                                "options": ["Vietnamization", "Sinicization", "Domination", "Confucianism"],
                                "answer": "Sinicization"
                            },
                            {
                                "q": "What was the primary benefit Vietnam gained from this period, despite the domination?",
                                "options": ["Complete cultural assimilation", "A new religion", "Access to new weapons", "Selective adoption of advanced technology and administration"],
                                "answer": "Selective adoption of advanced technology and administration"
                            }
                        ]
                    }
                ];
            } else { // Previous Super Saiyan 3 logic for other lessons
                introduction = `A comprehensive, multi-faceted exploration of "${lesson.title}". This lesson is designed to be a deep dive.`;
                takeaway = `The central, unforgettable truth of "${lesson.title}" is a testament to the resilience and complexity of the Vietnamese spirit.`;
                tabs = [
                    { "name": "Key Figures & Events", "icon": "🎯", "content": `This section provides a detailed explanation of the most pivotal figures, battles, and turning points related to ${lesson.title}.` },
                    { "name": "Deep Analysis", "icon": "🧠", "content": `Here we go 4x deeper into the 'why'. This analysis explores the complex socio-political, economic, and cultural forces that drove the events of ${lesson.title}.` },
                    { "name": "Global Context", "icon": "🌍", "content": `This section places ${lesson.title} within the wider international context.` },
                    { "name": "Legacy & Lessons", "icon": "🤔", "content": [`What is the long-term, tangible legacy of this period on modern Vietnam?`, `How does this chapter of history inform Vietnam's current political and cultural identity?`] }
                ];
            }

            let tabsHtml = tabs.map((tab, index) => `<button class="lesson-nav-button ${index === 0 ? 'active' : ''}" data-target="tab-${lessonId}-${index}">${tab.icon} ${tab.name}</button>`).join('');
            let tabContentHtml = tabs.map((tab, index) => {
                let contentHtml = '';
                if (tab.quiz) {
                    contentHtml = `<div class="space-y-6" id="quiz-${lessonId}">` + tab.quiz.map((q, qIndex) => `
                        <div>
                            <p class="font-semibold text-gold-light mb-2">${qIndex + 1}. ${q.q}</p>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                                ${q.options.map(o => `<button class="quiz-option p-2 rounded-md text-left" data-question="${qIndex}" data-answer="${o}">${o}</button>`).join('')}
                            </div>
                        </div>
                    `).join('') + `</div><div id="quiz-result-${lessonId}" class="mt-6 text-center font-bold"></div>`;
                } else if (Array.isArray(tab.content)) {
                    contentHtml = `<ul class="list-disc pl-5 space-y-4 text-text-muted">${tab.content.map(q => `<li>${q}</li>`).join('')}</ul>`;
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

            // Add tab listeners
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

            // Add quiz listeners if quiz exists
            const quizContainer = document.getElementById(`quiz-${lessonId}`);
            if (quizContainer) {
                const quizData = LESSON_DATA.find(l=>l.lesson==lessonId).tabs.find(t=>t.quiz).quiz;
                quizContainer.addEventListener('click', e => {
                    if (e.target.classList.contains('quiz-option')) {
                        const qIndex = e.target.dataset.question;
                        const selectedAnswer = e.target.dataset.answer;
                        const correctAnswer = quizData[qIndex].answer;
                        const options = quizContainer.querySelectorAll(`[data-question="${qIndex}"]`);
                        
                        options.forEach(opt => {
                            opt.disabled = true;
                            if (opt.dataset.answer === correctAnswer) {
                                opt.classList.add('correct');
                            } else if (opt === e.target) {
                                opt.classList.add('incorrect');
                            }
                        });

                        // Check score
                        let score = 0;
                        const total = quizData.length;
                        for(let i=0; i<total; i++) {
                            const correctOpt = quizContainer.querySelector(`[data-question="${i}"].correct`);
                            if (correctOpt) {
                                score++;
                            }
                        }
                        if(score === total) {
                           document.getElementById(`quiz-result-${lessonId}`).textContent = `Result: ${score} / ${total}. Perfect Score!`;
                        } else {
                           document.getElementById(`quiz-result-${lessonId}`).textContent = `Result: ${score} / ${total}`;
                        }
                    }
                });
            }
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





