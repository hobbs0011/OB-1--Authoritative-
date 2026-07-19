# RAW VERBATIM — HIGHSCHOOLLESSON2.txt
## Corpus Metadata
- chunk_seq   : 0345
- chunk_id    : 0345-RAW-HIGHSCHOOLLESSON2_txt
- source_file : C:\Users\mrmic\OneDrive\Documents\GitHub\phoenix-chat-logs\CHAT-LOGS-ONLY\HIGHSCHOOLLESSON2.txt
- sha256      : 6E2954F94783BA97855E890C4F78D6BED0BF1D9A5B4CBA2A558155622E7B07FF
- size_bytes  : 56170
- lines       : 1206
- ingested    : 2026-04-05
- phase       : Phase 2 — Raw Chat Log Ingest
- policy      : VERBATIM — No edits, no summaries, no AI overlays
- keywords    : VIETNAM

---

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lesson: What's Your Passion? (B1/B2 Intermediate)</title>
    <style>
        :root {
            --bg-dark: #05020D;
            --purple-dark: #1B0A3A;
            --purple-bright: #9D00FF;
            --gold: #FFD700;
            --cyan: #00FFAA;
            --text-light: #E0E0E0;
            --text-dark: #05020D;
            --danger: #FF4500;
            --success: #00FFAA;
            --warning: #FFA500;
        }
        * {
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: linear-gradient(135deg, var(--bg-dark) 0%, #0a0420 100%);
            color: var(--gold);
            margin: 0;
            padding: 0;
            min-height: 100vh;
        }
        header {
            background: linear-gradient(90deg, var(--purple-dark) 0%, #2a0a5a 100%);
            color: var(--cyan);
            text-align: center;
            padding: 1.5em 1em;
            border-bottom: 3px solid var(--purple-bright);
            box-shadow: 0 4px 20px rgba(157, 0, 255, 0.3);
        }
        header h1 {
            margin: 0;
            font-size: 2em;
            text-shadow: 0 0 10px var(--cyan);
        }
        main {
            padding: 2em;
            max-width: 1000px;
            margin: auto;
        }
        h1 { color: var(--cyan); }
        h2 {
            color: var(--gold);
            border-bottom: 2px solid var(--purple-bright);
            padding-bottom: 8px;
            margin-top: 2em;
            font-size: 1.6em;
        }
        h3 {
            color: var(--cyan);
            margin-top: 0;
        }
        p {
            font-size: 1.1em;
            line-height: 1.7em;
            color: var(--text-light);
        }
        .progress-container {
            width: 100%;
            background: linear-gradient(90deg, var(--purple-dark) 0%, #1a0a30 100%);
            border-radius: 10px;
            border: 2px solid var(--purple-bright);
            margin-bottom: 1.5em;
            box-shadow: 0 4px 15px rgba(157, 0, 255, 0.2);
            overflow: hidden;
        }
        .progress-bar {
            width: 0%;
            height: 30px;
            background: linear-gradient(90deg, var(--cyan) 0%, #00cc88 100%);
            border-radius: 8px;
            text-align: center;
            line-height: 30px;
            color: var(--text-dark);
            font-weight: bold;
            transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 0 20px rgba(0, 255, 170, 0.5);
        }
        .progress-stats {
            display: flex;
            justify-content: space-around;
            margin-top: 1em;
            padding: 1em;
            background: rgba(27, 10, 58, 0.5);
            border-radius: 8px;
            border: 1px solid var(--purple-bright);
        }
        .stat-item {
            text-align: center;
            flex-basis: 0;
            flex-grow: 1;
        }
        .stat-label {
            font-size: 0.9em;
            color: var(--text-light);
            margin-bottom: 0.3em;
        }
        .stat-value {
            font-size: 1.5em;
            font-weight: bold;
            color: var(--cyan);
        }
        .stat-item.completed .stat-value {
            color: var(--success);
        }
        #global-mission-complete {
            display: none;
            font-size: 2.5em;
            text-align: center;
            padding: 1.5em;
            background: linear-gradient(135deg, var(--purple-bright) 0%, var(--gold) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: pulse 2s infinite, shimmer 3s infinite;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .vocab-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1em;
            margin-top: 1em;
        }
        .vocab-item {
            background: linear-gradient(135deg, var(--purple-dark) 0%, #1a0a40 100%);
            padding: 1em;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 2px solid var(--purple-bright);
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .vocab-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(157, 0, 255, 0.3), transparent);
            transition: left 0.5s;
        }
        .vocab-item:hover::before {
            left: 100%;
        }
        .vocab-item:hover {
            transform: translateY(-5px) scale(1.02);
            box-shadow: 0 8px 25px rgba(157, 0, 255, 0.5);
            border-color: var(--cyan);
        }
        .vocab-details {
            display: none; 
            margin-top: 0.75em;
            padding: 0.75em;
            background: rgba(0, 0, 0, 0.6);
            border-radius: 6px;
            text-align: left;
            border-left: 3px solid var(--cyan);
        }
        .vocab-details .definition {
            font-style: italic;
            color: var(--text-light);
            font-weight: normal;
            cursor: pointer;
            padding: 0.5em;
            border-radius: 4px;
            transition: background-color 0.2s;
        }
        .vocab-details .definition:hover {
            color: var(--cyan);
            background: rgba(157, 0, 255, 0.2);
        }
        .vocab-details .translation {
            display: none;
            font-style: normal;
            color: var(--cyan);
            font-weight: bold;
            margin-top: 0.5em;
            padding: 0.5em;
            background: rgba(0, 255, 170, 0.1);
            border-radius: 4px;
            animation: fadeIn 0.3s;
        }
        .vocab-item.active {
            background: linear-gradient(135deg, var(--purple-bright) 0%, #7700cc 100%);
            box-shadow: 0 0 30px rgba(157, 0, 255, 0.7);
        }
        .vocab-item.active .vocab-details {
            display: block;
            animation: slideDown 0.3s;
        }
        .module-container {
            background: linear-gradient(135deg, #0a0420 0%, #1a0a40 100%);
            padding: 2em;
            margin-top: 1.5em;
            border-radius: 12px;
            border-left: 6px solid var(--purple-bright);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
            position: relative;
        }
        .module-container::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 100px;
            height: 100px;
            background: radial-gradient(circle, rgba(157, 0, 255, 0.1) 0%, transparent 70%);
            pointer-events: none;
        }
        button {
            margin-top: 1em;
            padding: 0.8em 1.5em;
            background: linear-gradient(135deg, var(--purple-bright) 0%, #7700cc 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            font-size: 1em;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 15px rgba(157, 0, 255, 0.4);
            position: relative;
            overflow: hidden;
        }
        button::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
        }
        button:hover::before {
            width: 300px;
            height: 300px;
        }
        button:hover {
            background: linear-gradient(135deg, var(--cyan) 0%, #00cc88 100%);
            color: var(--text-dark);
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(0, 255, 170, 0.6);
        }
        button:active {
            transform: translateY(0) scale(0.98);
        }
        button:disabled {
            background: #333;
            cursor: not-allowed;
            box-shadow: none;
            opacity: 0.5;
        }
        input[type="text"], select {
            padding: 0.75em;
            border-radius: 8px;
            border: 2px solid var(--purple-bright);
            background: linear-gradient(135deg, var(--bg-dark) 0%, #0a0420 100%);
            color: var(--gold);
            font-size: 1em;
            margin: 0.5em 0;
            width: 100%;
            transition: all 0.3s;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFD700%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20128c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4l128-128c3.6-3.6%205.4-7.8%205.4-12.8%200-5-1.8-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E');
            background-repeat: no-repeat, repeat;
            background-position: right .7em top 50%, 0 0;
            background-size: .65em auto, 100%;
        }
        select {
            cursor: pointer;
        }
        select option {
            background: var(--bg-dark);
            color: var(--text-light);
            padding: 10px;
        }
        input[type="text"]:focus, select:focus {
            outline: none;
            border-color: var(--cyan);
            box-shadow: 0 0 20px rgba(0, 255, 170, 0.4);
            background: linear-gradient(135deg, #0a0420 0%, #1a0a40 100%);
        }
        .feedback {
            margin-top: 1em;
            font-style: italic;
            font-weight: bold;
            min-height: 1.5em;
            padding: 0.75em;
            border-radius: 6px;
            transition: all 0.3s;
        }
        .feedback.success { 
            color: var(--success);
            background: rgba(0, 255, 170, 0.1);
            border-left: 4px solid var(--success);
        }
        .feedback.error { 
            color: var(--danger);
            background: rgba(255, 69, 0, 0.1);
            border-left: 4px solid var(--danger);
        }
        .feedback.warning {
            color: var(--warning);
            background: rgba(255, 165, 0, 0.1);
            border-left: 4px solid var(--warning);
        }
        .mission-complete {
            display: none;
            font-size: 2em;
            color: var(--success);
            text-align: center;
            padding: 2em;
            font-weight: bold;
            animation: pulse 1.5s infinite, confetti 0.5s;
            text-shadow: 0 0 15px var(--success);
        }
        .match-game-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5em;
        }
        .match-col {
            display: flex;
            flex-direction: column;
            gap: 0.75em;
        }
        .match-col-header {
            font-weight: bold;
            font-size: 1.1em;
            color: var(--cyan);
            text-align: center;
            padding: 0.5em;
            background: rgba(157, 0, 255, 0.2);
            border-radius: 6px;
            margin-bottom: 0.5em;
        }
        .match-item {
            background: linear-gradient(135deg, var(--purple-dark) 0%, #1a0a40 100%);
            border: 2px solid var(--purple-bright);
            padding: 1em;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            min-height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        .match-item:hover:not(.matched) {
            background: linear-gradient(135deg, var(--purple-bright) 0%, #7700cc 100%);
            transform: translateX(5px);
            box-shadow: 0 4px 20px rgba(157, 0, 255, 0.5);
        }
        .match-item.selected {
            background: linear-gradient(135deg, var(--gold) 0%, #ffed4e 100%);
            color: var(--text-dark);
            border-color: var(--gold);
            transform: scale(1.05);
            box-shadow: 0 6px 25px rgba(255, 215, 0, 0.6);
            font-weight: bold;
        }
        .match-item.matched {
            background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
            color: #666;
            border-color: #333;
            cursor: not-allowed;
            opacity: 0.5;
            transform: scale(0.95);
        }
        .gap-fill-container .gap-item {
            display: flex;
            align-items: center;
            margin-bottom: 1em;
            gap: 10px;
        }
        .gap-fill-container .gap-item label {
            flex-basis: 60%;
            line-height: 1.6;
            color: var(--text-light);
        }
        .gap-fill-container .gap-item select {
            flex-basis: 40%;
        }
        .tip-box {
            background: linear-gradient(135deg, rgba(157, 0, 255, 0.2) 0%, rgba(0, 255, 170, 0.2) 100%);
            padding: 1.5em;
            border-radius: 10px;
            border: 2px solid var(--cyan);
            margin-top: 1em;
            box-shadow: 0 0 30px rgba(0, 255, 170, 0.3);
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideDown {
            from { 
                opacity: 0;
                transform: translateY(-10px);
            }
            to { 
                opacity: 1;
                transform: translateY(0);
            }
        }
        @keyframes confetti {
            0% { transform: scale(0.5) rotate(-45deg); }
            50% { transform: scale(1.2) rotate(45deg); }
            100% { transform: scale(1) rotate(0deg); }
        }
        @media (max-width: 768px) {
            main {
                padding: 1em;
            }
            .vocab-list {
                grid-template-columns: 1fr;
            }
            .match-game-container {
                grid-template-columns: 1fr;
            }
            header h1 {
                font-size: 1.5em;
            }
            .gap-fill-container .gap-item {
                flex-direction: column;
                align-items: flex-start;
            }
            .gap-fill-container .gap-item select {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <header>
        <h1>B1/B2 Intermediate: What's Your Passion?</h1>
    </header>
    <main>
        <section>
            <h2>📊 Lesson Progress</h2>
            <div class="progress-container">
                <div class="progress-bar" id="lesson-progress-bar">0%</div>
            </div>
            <div class="progress-stats">
                <div class="stat-item" id="stat-reading">
                    <div class="stat-label">Reading</div>
                    <div class="stat-value">○</div>
                </div>
                <div class="stat-item" id="stat-game1">
                    <div class="stat-label">Game 1</div>
                    <div class="stat-value">○</div>
                </div>
                <div class="stat-item" id="stat-game2">
                    <div class="stat-label">Game 2</div>
                    <div class="stat-value">○</div>
                </div>
                <div class="stat-item" id="stat-game3">
                    <div class="stat-label">Game 3</div>
                    <div class="stat-value">○</div>
                </div>
            </div>
            <div id="global-mission-complete" class="mission-complete">
                🎉 LESSON PROTOCOL COMPLETE! 🎉
            </div>
        </section>

        <section>
            <h2>📖 Lesson Overview</h2>
            <p>
                Welcome! This lesson explores 'passion'. Passion is that strong, deep feeling that pushes you to do amazing things. It is more than just a simple interest or hobby.
            </p>
            <p>
                We will explore what <strong>motivation</strong> and <strong>drive</strong> truly mean. You will learn 10 key vocabulary words and 5 new idioms to help you talk about your goals and your <strong>ambition</strong>. Let's begin!
            </p>
        </section>

        <section>
            <h2>📚 Key Vocabulary & Idioms</h2>
            <p style="color: var(--text-light); font-style: italic;">Click on any word to see its definition. Click the definition to reveal the Vietnamese translation.</p>
            <div class="vocab-list" id="vocab-list-container">
                </div>
        </section>

        <section>
            <h2>✍️ Long Reading: The Anatomy of Passion</h2>
            <div class="module-container">
                <h3>The Anatomy of Passion</h3>
                <p>
                    What is the difference between a simple hobby and a true <strong>passion</strong>? A hobby is something you enjoy, but a <strong>passion</strong> is something you feel you *must* do. It is the internal fire that guides your choices. It is often linked to your <strong>ambition</strong>, which is the external goal you want to achieve. Passion is the 'why', while ambition is the 'what'.
                </p>
                <p>
                    This fire often starts from a spark of <strong>curiosity</strong>. You ask a question: "Could I do that?" or "How does that work?" This initial interest, if you feed it, grows into <strong>enthusiasm</strong>. You start to enjoy the process of learning and improving, and this positive feeling becomes a powerful cycle.
                </p>
                <p>
                    This cycle creates internal <strong>motivation</strong>—the desire to act without an external reward. You do it because you love the activity itself. This motivation is the fuel for your <strong>drive</strong>, which is the energy you apply to move forward, even when it isn't easy. A person with strong drive is proactive and doesn't wait to be told what to do.
                </p>
                <p>
                    However, drive is not enough. You will always face challenges. This is where <strong>perseverance</strong> becomes essential. Perseverance is the ability to continue when things are difficult. It is closely related to <strong>resilience</strong>, which is your ability to recover—or 'bounce back'—after a failure or a setback.
                </p>
                <p>
                    To build this resilience, you need <strong>dedication</strong>. This means you *pour your heart and soul into* your work, giving it time and energy. This is not a part-time feeling; it is a full-time <strong>commitment</strong> to your goal. People with this level of focus often *burn the midnight oil* to get the job done.
                </p>
                <p>
                    When you combine <strong>passion</strong>, <strong>motivation</strong>, and <strong>perseverance</strong>, you find more than just a job; you *find your calling*. It is the result of *blood, sweat, and tears*, but it leads to a feeling of deep fulfillment. This is the ultimate goal of following your passion.
                </p>

                <hr style="border-color: var(--purple-bright); margin-top: 2em;">

                <h3 style="margin-top: 1.5em;">Vocabulary Check (Gap-Fill)</h3>
                <p>Your writing task is to complete the sentences below. This is better for a big class! Use the 10 vocabulary words to fill the gaps. Each word is used only once.</p>
                <div class="gap-fill-container" id="gap-fill-container">
                    </div>
                <button id="writing-prompt-submit">Check Answers</button>
                <div id="writing-feedback" class="feedback" role="status" aria-live="polite"></div>

            </div>
        </section>

        <section>
            <h2>🎮 Game Module 1: Vocab Scramble</h2>
            <p style="color: var(--text-light); font-style: italic;">Unscramble the vocabulary words. Complete 5 words to finish this module.</p>
            <div class="module-container" id="gameContainer1">
                </div>
            <div id="game-feedback-1" class="feedback" role="status" aria-live="polite"></div>
            <div id="mission-complete-1" class="mission-complete">
                ✅ MODULE 1 COMPLETE!
            </div>
        </section>

        <section>
            <h2>🧩 Game Module 2: Definition Match</h2>
            <p style="color: var(--text-light); font-style: italic;">Match each word to its correct definition. Select one word and one definition to make a pair.</p>
            <div class="module-container" id="gameContainer2">
                </div>
            <div id="game-feedback-2" class="feedback" role="status" aria-live="polite"></div>
            <div id="mission-complete-2" class="mission-complete">
                ✅ MODULE 2 COMPLETE!
            </div>
        </section>

        <section>
            <h2>🚀 Game Module 3: Idiom Match</h2>
            <p style="color: var(--text-light); font-style: italic;">Match the idiom to its correct meaning. These are common in business and professional life.</p>
            <div class="module-container" id="gameContainer3">
                </div>
            <div id="game-feedback-3" class="feedback" role="status" aria-live="polite"></div>
            <div id="mission-complete-3" class="mission-complete">
                ✅ MODULE 3 COMPLETE!
            </div>
        </section>

        <section>
            <h2>💡 Interactive Reflection</h2>
            <p>Discover a practical tip on cultivating passion in your daily life:</p>
            <button onclick="showTip()" id="tip-button">Reveal Wisdom</button>
            <div id="tip" class="feedback success" style="display: none;"></div>
        </section>
    </main>
    <script>
        // Updated Progress Bar for 4 tasks
        const lessonProgress = {
            reading: false, // Changed 'writing' to 'reading' for the gap-fill
            game1: false,
            game2: false,
            game3: false, // Added game3
            totalTasks: 4
        };

        function updateLessonProgress() {
            let completedTasks = 0;
            if (lessonProgress.reading) completedTasks++;
            if (lessonProgress.game1) completedTasks++;
            if (lessonProgress.game2) completedTasks++;
            if (lessonProgress.game3) completedTasks++; // Added game3
            
            const percentage = Math.round((completedTasks / lessonProgress.totalTasks) * 100);
            const progressBar = document.getElementById('lesson-progress-bar');
            
            progressBar.style.width = percentage + '%';
            progressBar.textContent = percentage + '%';
            
            document.getElementById('stat-reading').classList.toggle('completed', lessonProgress.reading);
            document.getElementById('stat-reading').querySelector('.stat-value').textContent = lessonProgress.reading ? '✓' : '○';
            
            document.getElementById('stat-game1').classList.toggle('completed', lessonProgress.game1);
            document.getElementById('stat-game1').querySelector('.stat-value').textContent = lessonProgress.game1 ? '✓' : '○';
            
            document.getElementById('stat-game2').classList.toggle('completed', lessonProgress.game2);
            document.getElementById('stat-game2').querySelector('.stat-value').textContent = lessonProgress.game2 ? '✓' : '○';
            
            // Added game3
            document.getElementById('stat-game3').classList.toggle('completed', lessonProgress.game3);
            document.getElementById('stat-game3').querySelector('.stat-value').textContent = lessonProgress.game3 ? '✓' : '○';
            
            if (percentage === 100) {
                document.getElementById('global-mission-complete').style.display = 'block';
                progressBar.style.background = 'linear-gradient(90deg, var(--gold) 0%, var(--cyan) 100%)';
                document.getElementById('global-mission-complete').scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        // B1/B2 Intermediate Vocabulary (10) and Idioms (5)
        const vocabData = {
            passion: { def: "A very strong feeling of love, enthusiasm, or desire for something.", trans: "Đam mê: Cảm giác yêu thích, nhiệt tình hoặc ham muốn mãnh liệt đối với một điều gì đó." },
            motivation: { def: "The internal reason or desire that makes you do something.", trans: "Động lực: Lý do nội tại hoặc mong muốn khiến bạn làm điều gì đó." },
            drive: { def: "A strong natural need or desire that makes you want to achieve things.", trans: "Nỗ lực/Thúc đẩy: Nhu cầu hoặc mong muốn tự nhiên mạnh mẽ khiến bạn muốn đạt được mọi thứ." },
            dedication: { def: "A willingness to give a lot of time and energy to something because it is important.", trans: "Sự cống hiến: Sẵn sàng dành nhiều thời gian và năng lượng cho điều gì đó vì nó quan trọng." },
            perseverance: { def: "Continuing to try to achieve something difficult, even when there are problems.", trans: "Sự kiên trì: Tiếp tục cố gắng đạt được điều gì đó khó khăn, ngay cả khi có vấn đề." },
            ambition: { def: "A strong desire to be successful, powerful, or famous.", trans: "Tham vọng: Mong muốn mạnh mẽ để trở nên thành công, quyền lực hoặc nổi tiếng." },
            curiosity: { def: "A strong desire to know or learn about something.", trans: "Sự tò mò: Mong muốn mạnh mẽ để biết hoặc tìm hiểu về điều gì đó." },
            enthusiasm: { def: "A strong feeling of excitement and interest in something.", trans: "Lòng nhiệt tình: Cảm giác phấn khích và thích thú mạnh mẽ đối với một điều gì đó." },
            commitment: { def: "A promise to do something; a strong belief in an idea.", trans: "Sự cam kết: Lời hứa làm điều gì đó; một niềm tin mạnh mẽ vào một ý tưởng." },
            resilience: { def: "The ability to become strong, happy, or successful again after a difficult situation.", trans: "Sự kiên cường: Khả năng trở nên mạnh mẽ, hạnh phúc hoặc thành công trở lại sau một tình huống khó khăn." },
            // Idioms
            'find your calling (idiom)': { def: "To discover the type of work or career that you are perfect for.", trans: "Tìm thấy tiếng gọi (thành ngữ): Khám phá ra loại công việc hoặc sự nghiệp mà bạn hoàn toàn phù hợp." },
            'pour your heart and soul into (idiom)': { def: "To do something with the maximum amount of energy and passion.", trans: "Dồn hết tâm huyết (thành ngữ): Làm điều gì đó với tối đa năng lượng và đam mê." },
            'go the extra mile (idiom)': { def: "To do more work or make more effort than is expected of you.", trans: "Nỗ lực hơn nữa (thành ngữ): Làm nhiều việc hơn hoặc nỗ lực nhiều hơn những gì được mong đợi ở bạn." },
            'burn the midnight oil (idiom)': { def: "To work or study very late into the night.", trans: "Thức khuya làm việc (thành ngữ): Làm việc hoặc học tập rất muộn vào ban đêm." },
            'blood, sweat, and tears (idiom)': { def: "A very large amount of effort, hard work, and suffering.", trans: "Máu, mồ hôi và nước mắt (thành ngữ): Một nỗ lực rất lớn, làm việc chăm chỉ và chịu đựng gian khổ." }
        };

        function createVocabList() {
            const container = document.getElementById('vocab-list-container');
            container.innerHTML = ''; 
            for (const [word, data] of Object.entries(vocabData)) {
                const item = document.createElement('div');
                item.className = 'vocab-item';
                // Capitalize first letter of each word in the term
                item.textContent = word.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '); 
                item.setAttribute('role', 'button');
                item.setAttribute('tabindex', '0');
                
                const details = document.createElement('div');
                details.className = 'vocab-details';
                
                const definition = document.createElement('div');
                definition.className = 'definition';
                definition.textContent = '📖 ' + data.def;
                definition.setAttribute('role', 'button');
                definition.setAttribute('tabindex', '0');
                
                const translation = document.createElement('div');
                translation.className = 'translation';
                translation.textContent = '🇻🇳 ' + data.trans;
                
                definition.onclick = (e) => {
                    e.stopPropagation();
                    const isVisible = translation.style.display === 'block';
                    translation.style.display = isVisible ? 'none' : 'block';
                };
                
                definition.onkeypress = (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        definition.onclick(e);
                    }
                };
                
                details.appendChild(definition);
                details.appendChild(translation);
                item.appendChild(details);
                
                const toggleVocab = () => {
                    document.querySelectorAll('.vocab-item.active').forEach(activeItem => {
                        if(activeItem !== item) {
                            activeItem.classList.remove('active');
                            activeItem.querySelector('.translation').style.display = 'none';
                        }
                    });
                    item.classList.toggle('active');
                    if (!item.classList.contains('active')) {
                        translation.style.display = 'none';
                    }
                };
                
                item.onclick = toggleVocab;
                item.onkeypress = (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleVocab();
                    }
                };
                
                container.appendChild(item);
            }
        }

        function showTip() {
            const tipEl = document.getElementById('tip');
            const tipButton = document.getElementById('tip-button');
            tipEl.style.display = 'block';
            tipEl.innerHTML = `<div class="tip-box"><strong>💎 Wisdom for Cultivating Passion:</strong><br><br>Passion is not found, it is built. You build it with <strong>curiosity</strong> (asking questions), <strong>dedication</strong> (practicing), and <strong>resilience</strong> (learning from failure). If you want to find your passion, don't wait for a special feeling—start doing something you find interesting.</div>`;
            tipButton.disabled = true;
            tipButton.textContent = 'Wisdom Revealed ✓';
            tipEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // --- New "Writing" Task: Gap-Fill ---
        
        const gapFillData = [
            { id: 'gap1', text: 'She had a strong ___ to become a doctor.', answer: 'ambition' },
            { id: 'gap2', text: 'You must have ___ and keep practicing, even when it is hard.', answer: 'perseverance' },
            { id: 'gap3', text: 'His ___ for science started when he was a child.', answer: 'passion' },
            { id: 'gap4', text: 'What is your ___ for working so hard?', answer: 'motivation' },
            { id: 'gap5', text: 'The team showed great ___ to the project.', answer: 'commitment' },
            { id: 'gap6', text: 'It takes ___ to start a new business from nothing.', answer: 'drive' },
            { id: 'gap7', text: 'He showed great ___ after losing his job; he found a new one quickly.', answer: 'resilience' },
            { id: 'gap8', text: 'Her ___ led her to explore the old library.', answer: 'curiosity' },
            { id: 'gap9', text: 'They showed a lot of ___ for the new plan.', answer: 'enthusiasm' },
            { id: 'gap10', text: 'Becoming a musician requires years of ___.', answer: 'dedication' }
        ];
        
        const vocabList = ['passion', 'motivation', 'drive', 'dedication', 'perseverance', 'ambition', 'curiosity', 'enthusiasm', 'commitment', 'resilience'];

        function createGapFill() {
            const container = document.getElementById('gap-fill-container');
            container.innerHTML = '';
            
            gapFillData.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'gap-item';
                
                const label = document.createElement('label');
                label.htmlFor = item.id;
                label.textContent = item.text.replace('___', ' _____ ');
                
                const select = document.createElement('select');
                select.id = item.id;
                select.name = item.id;
                select.dataset.answer = item.answer;
                
                const defaultOption = document.createElement('option');
                defaultOption.value = "";
                defaultOption.textContent = "--- Select a word ---";
                select.appendChild(defaultOption);
                
                vocabList.forEach(word => {
                    const option = document.createElement('option');
                    option.value = word;
                    option.textContent = word.charAt(0).toUpperCase() + word.slice(1);
                    select.appendChild(option);
                });
                
                itemDiv.appendChild(label);
                itemDiv.appendChild(select);
                container.appendChild(itemDiv);
            });
        }
        
        document.getElementById('writing-prompt-submit').onclick = () => {
            const feedback = document.getElementById('writing-feedback');
            let correctCount = 0;
            const total = gapFillData.length;
            
            gapFillData.forEach(item => {
                const select = document.getElementById(item.id);
                if (select.value === item.answer) {
                    correctCount++;
                    select.style.borderColor = 'var(--success)';
                } else {
                    select.style.borderColor = 'var(--danger)';
                }
            });
            
            if (correctCount === total) {
                feedback.textContent = `✅ Perfect! You got ${correctCount}/${total} correct. Your understanding of this vocabulary is excellent!`;
                feedback.className = "feedback success";
                if (!lessonProgress.reading) {
                    lessonProgress.reading = true;
                    updateLessonProgress();
                }
            } else if (correctCount >= total * 0.7) {
                feedback.textContent = `📝 Good job! You got ${correctCount}/${total} correct. Review the words you missed.`;
                feedback.className = "feedback warning";
                if (!lessonProgress.reading) {
                    lessonProgress.reading = true;
                    updateLessonProgress();
                }
            } else {
                feedback.textContent = `❌ Not quite. You got ${correctCount}/${total}. Please review the vocabulary and try again.`;
                feedback.className = "feedback error";
            }
            feedback.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };

        // --- Game 1: Vocab Scramble ---
        class VocabScrambleGame {
            constructor(containerId, wordList, feedbackId, onSuccessCallback) {
                this.container = document.getElementById(containerId);
                this.feedbackEl = document.getElementById(feedbackId);
                this.wordList = this.shuffleArray([...wordList]);
                this.currentWordIndex = 0;
                this.attempts = 0;
                this.correctAnswers = 0;
                this.onSuccess = onSuccessCallback;
                this.init();
            }

            init() {
                this.container.innerHTML = '';
                this.setFeedback('');
                this.createScrambleUI();
            }

            shuffleArray(array) {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
                return array;
            }

            scrambleWord(word) {
                if (word.length <= 2) return word.split('').reverse().join('');
                
                let scrambled;
                let attempts = 0;
                do {
                    const arr = word.split('');
                    for (let i = arr.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [arr[i], arr[j]] = [arr[j], arr[i]];
                    }
                    scrambled = arr.join('');
                    attempts++;
                } while (scrambled === word && attempts < 10);
                
                return scrambled;
            }

            setFeedback(message, className = '') {
                if (this.feedbackEl) {
                    this.feedbackEl.textContent = message;
                    this.feedbackEl.className = className ? 'feedback ' + className : 'feedback';
                }
            }

            createScrambleUI() {
                if (this.currentWordIndex >= this.wordList.length) {
                    this.container.innerHTML = '';
                    const accuracy = Math.round((this.correctAnswers / Math.max(1, this.attempts)) * 100);
                    this.setFeedback(`🎉 All words unscrambled! Accuracy: ${accuracy}% (${this.correctAnswers}/${this.attempts} attempts)`, 'success');
                    this.onSuccess(); 
                    return;
                }

                const word = this.wordList[this.currentWordIndex];
                const scrambled = this.scrambleWord(word);
                
                this.container.innerHTML = ''; 
                
                const progressText = document.createElement('p');
                progressText.style.color = 'var(--cyan)';
                progressText.style.fontSize = '0.9em';
                progressText.style.marginBottom = '0.5em';
                progressText.textContent = `Progress: ${this.currentWordIndex + 1} / ${this.wordList.length}`;
                
                const prompt = document.createElement('p');
                prompt.textContent = `Unscramble this word: "${scrambled}"`;
                prompt.style.color = 'var(--gold)';
                prompt.style.fontSize = '1.3em';
                prompt.style.fontWeight = 'bold';
                prompt.style.margin = '1em 0';
                
                const hintText = document.createElement('p');
                hintText.style.color = 'var(--text-light)';
                hintText.style.fontSize = '0.9em';
                hintText.style.fontStyle = 'italic';
                hintText.textContent = `Hint: This is a vocabulary word from the lesson (${word.length} letters)`;
                
                const input = document.createElement('input');
                input.type = 'text';
                input.id = 'scramble-input';
                input.placeholder = 'Type the unscrambled word...';
                input.setAttribute('aria-label', 'Unscrambled word input');
                input.style.textTransform = 'lowercase';
                
                const button = document.createElement('button');
                button.textContent = 'Submit Answer';
                button.style.marginRight = '0.5em';
                
                const skipButton = document.createElement('button');
                skipButton.textContent = 'Skip Word';
                skipButton.style.background = 'linear-gradient(135deg, #333 0%, #555 100%)';
                skipButton.onclick = () => {
                    this.setFeedback(`⏭️ Skipped "${word}". Moving to next word...`, 'warning');
                    this.currentWordIndex++;
                    setTimeout(() => this.createScrambleUI(), 800);
                };
                
                const submitAnswer = () => this.checkAnswer(input.value);
                button.onclick = submitAnswer;
                input.onkeypress = (e) => { if (e.key === 'Enter') submitAnswer(); };
                
                this.container.appendChild(progressText);
                this.container.appendChild(prompt);
                this.container.appendChild(hintText);
                this.container.appendChild(input);
                
                const buttonContainer = document.createElement('div');
                buttonContainer.appendChild(button);
                buttonContainer.appendChild(skipButton);
                this.container.appendChild(buttonContainer);
                
                input.focus();
            }

            checkAnswer(answer) {
                this.attempts++;
                const correctWord = this.wordList[this.currentWordIndex];
                if (answer.toLowerCase().trim() === correctWord.toLowerCase()) {
                    this.correctAnswers++;
                    this.setFeedback(`✅ Correct! "${correctWord}" is right!`, 'success');
                    this.currentWordIndex++;
                    setTimeout(() => this.createScrambleUI(), 1000);
                } else {
                    if (answer.trim().length === 0) {
                        this.setFeedback('❌ Please enter an answer.', 'error');
                    } else {
                        this.setFeedback(`❌ Not quite. "${answer}" is incorrect. Try again!`, 'error');
                    }
                    const inputEl = document.getElementById('scramble-input');
                    if(inputEl) { 
                        inputEl.focus(); 
                        inputEl.select(); 
                    }
                }
            }
        }

        // --- Game 2 & 3: Definition Match ---
        class DefinitionMatchGame {
            constructor(containerId, vocab, feedbackId, onSuccessCallback) {
                this.container = document.getElementById(containerId);
                this.feedbackEl = document.getElementById(feedbackId);
                this.vocab = vocab;
                this.onSuccess = onSuccessCallback;
                this.words = Object.keys(vocab);
                this.definitions = this.words.map(word => ({ word, def: vocab[word].def }));
                this.selectedWord = null;
                this.selectedDef = null;
                this.matchedPairs = 0;
                this.attempts = 0;
                this.correctMatches = 0;
                this.init();
            }

            shuffleArray(array) {
                const newArray = [...array];
                for (let i = newArray.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
                }
                return newArray;
            }

            setFeedback(message, className = '') {
                if (this.feedbackEl) {
                    this.feedbackEl.textContent = message;
                    this.feedbackEl.className = className ? 'feedback ' + className : 'feedback';
                }
            }

            init() {
                this.container.innerHTML = '';
                this.setFeedback('🎯 Match each item to its definition. Select one item and one definition to make a pair.');
                
                const gameBox = document.createElement('div');
                gameBox.className = 'match-game-container';
                
                const wordCol = document.createElement('div');
                wordCol.className = 'match-col';
                const wordHeader = document.createElement('div');
                wordHeader.className = 'match-col-header';
                wordHeader.textContent = '📝 ITEMS'; // Changed from WORDS
                wordCol.appendChild(wordHeader);
                
                const defCol = document.createElement('div');
                defCol.className = 'match-col';
                const defHeader = document.createElement('div');
                defHeader.className = 'match-col-header';
                defHeader.textContent = '📖 DEFINITIONS';
                defCol.appendChild(defHeader);
                
                const shuffledWords = this.shuffleArray([...this.words]);
                const shuffledDefs = this.shuffleArray([...this.definitions]);
                
                shuffledWords.forEach(word => {
                    const el = document.createElement('div');
                    el.className = 'match-item';
                    el.textContent = word.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    el.dataset.word = word;
                    el.setAttribute('role', 'button');
                    el.setAttribute('tabindex', '0');
                    el.onclick = () => this.selectWord(el);
                    el.onkeypress = (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            this.selectWord(el);
                        }
                    };
                    wordCol.appendChild(el);
                });
                
                shuffledDefs.forEach(defObj => {
                    const el = document.createElement('div');
                    el.className = 'match-item';
                    el.textContent = defObj.def;
                    el.dataset.def = defObj.def;
                    el.dataset.word = defObj.word;
                    el.setAttribute('role', 'button');
                    el.setAttribute('tabindex', '0');
                    el.onclick = () => this.selectDef(el);
                    el.onkeypress = (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            this.selectDef(el);
                        }
                    };
                    defCol.appendChild(el);
                });
                
                gameBox.appendChild(wordCol);
                gameBox.appendChild(defCol);
                this.container.appendChild(gameBox);
                
                const statsBox = document.createElement('div');
                statsBox.style.marginTop = '1em';
                statsBox.style.padding = '1em';
                statsBox.style.background = 'rgba(157, 0, 255, 0.1)';
                statsBox.style.borderRadius = '8px';
                statsBox.style.textAlign = 'center';
                statsBox.id = `match-stats-${this.container.id}`;
                statsBox.innerHTML = `<strong>Progress:</strong> ${this.matchedPairs} / ${this.words.length} pairs matched`;
                this.container.appendChild(statsBox);
            }

            updateStats() {
                const statsBox = document.getElementById(`match-stats-${this.container.id}`);
                if (statsBox) {
                    const accuracy = this.attempts > 0 ? Math.round((this.correctMatches / this.attempts) * 100) : 0;
                    statsBox.innerHTML = `<strong>Progress:</strong> ${this.matchedPairs} / ${this.words.length} pairs | <strong>Accuracy:</strong> ${accuracy}%`;
                }
            }

            selectWord(el) {
                if (el.classList.contains('matched')) return;
                this.container.querySelectorAll('.match-item[data-word]').forEach(item => {
                    if (item !== el) item.classList.remove('selected');
                });
                
                if (this.selectedWord === el) {
                    el.classList.remove('selected');
                    this.selectedWord = null;
                } else {
                    el.classList.add('selected');
                    this.selectedWord = el;
                }
                this.checkMatch();
            }

            selectDef(el) {
                if (el.classList.contains('matched')) return;
                this.container.querySelectorAll('.match-item[data-def]').forEach(item => {
                    if (item !== el) item.classList.remove('selected');
                });
                
                if (this.selectedDef === el) {
                    el.classList.remove('selected');
                    this.selectedDef = null;
                } else {
                    el.classList.add('selected');
                    this.selectedDef = el;
                }
                this.checkMatch();
            }

            checkMatch() {
                if (!this.selectedWord || !this.selectedDef) return;
                
                this.attempts++;
                const word = this.selectedWord.dataset.word;
                const defWord = this.selectedDef.dataset.word;
                
                if (word === defWord) {
                    this.correctMatches++;
                    this.setFeedback(`✅ Perfect match!`, 'success');
                    this.selectedWord.classList.add('matched');
                    this.selectedDef.classList.add('matched');
                    this.selectedWord.classList.remove('selected');
                    this.selectedDef.classList.remove('selected');
                    this.matchedPairs++;
                } else {
                    this.setFeedback(`❌ Not a match. Try again!`, 'error');
                    this.selectedWord.classList.remove('selected');
                    this.selectedDef.classList.remove('selected');
                }
                
                this.selectedWord = null;
                this.selectedDef = null;
                this.updateStats();
                
                if (this.matchedPairs === this.words.length) {
                    const accuracy = Math.round((this.correctMatches / this.attempts) * 100);
                    this.setFeedback(`🎉 All definitions matched! Final accuracy: ${accuracy}%`, 'success');
                    this.onSuccess();
                }
            }
        }

        // --- Initialize Everything ---
        window.onload = () => {
            
            createVocabList();
            createGapFill();
            
            // --- Game 1 Setup (5 words) ---
            new VocabScrambleGame(
                'gameContainer1',
                ['passion', 'drive', 'ambition', 'curiosity', 'commitment'],
                'game-feedback-1',
                () => {
                    const completeEl = document.getElementById('mission-complete-1');
                    completeEl.style.display = 'block';
                    completeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    if (!lessonProgress.game1) {
                        lessonProgress.game1 = true;
                        updateLessonProgress();
                    }
                }
            );
            
            // --- Game 2 Setup (Other 5 words) ---
            const matchVocab = {};
            ['motivation', 'dedication', 'perseverance', 'enthusiasm', 'resilience'].forEach(word => {
                matchVocab[word] = vocabData[word];
            });
            new DefinitionMatchGame(
                'gameContainer2',
                matchVocab,
                'game-feedback-2',
                () => {
                    const completeEl = document.getElementById('mission-complete-2');
                    completeEl.style.display = 'block';
                    completeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    if (!lessonProgress.game2) {
                        lessonProgress.game2 = true;
                        updateLessonProgress();
                    }
                }
            );

            // --- Game 3 Setup (5 Idioms) ---
            const idiomVocab = {};
            ['find your calling (idiom)', 'pour your heart and soul into (idiom)', 'go the extra mile (idiom)', 'burn the midnight oil (idiom)', 'blood, sweat, and tears (idiom)'].forEach(word => {
                idiomVocab[word] = vocabData[word];
            });
            new DefinitionMatchGame(
                'gameContainer3',
                idiomVocab,
                'game-feedback-3',
                () => {
                    const completeEl = document.getElementById('mission-complete-3');
                    completeEl.style.display = 'block';
                    completeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    if (!lessonProgress.game3) {
                        lessonProgress.game3 = true;
                        updateLessonProgress();
                    }
                }
            );
            
            updateLessonProgress();
        };
    </script>
</body>
</html>
