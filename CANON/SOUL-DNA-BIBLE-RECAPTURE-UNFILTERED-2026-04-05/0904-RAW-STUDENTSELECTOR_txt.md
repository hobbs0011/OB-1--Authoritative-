# RAW VERBATIM — STUDENTSELECTOR.txt
## Corpus Metadata
- chunk_seq   : 0904
- chunk_id    : 0904-RAW-STUDENTSELECTOR_txt
- source_file : C:\Users\mrmic\OneDrive\Documents\GitHub\phoenix-chat-logs\CHAT-LOGS-ONLY\STUDENTSELECTOR.txt
- sha256      : 3D0E4CA2F9791B8422FA15D3F22D02386C8647E73920D1C6A90EE299AB74ACD4
- size_bytes  : 12089
- lines       : 349
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
    <title>Team Selector (LỚP 10/10)</title>
    <!-- Google Fonts for the theme -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bangers&family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --bg-color: #0a0a1f;       /* Dark Navy Blue */
            --panel-color: #1a1a3a;    /* Dark Purple-Blue */
            --border-color: #f0f;     /* Neon Pink */
            --accent-color: #0ff;     /* Neon Cyan */
            --text-color: #e0e0ff;
            --title-font: 'Bangers', cursive;
            --body-font: 'Orbitron', sans-serif;
        }

        body {
            font-family: var(--body-font);
            background-color: var(--bg-color);
            color: var(--text-color);
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 2rem;
            min-height: 100vh;
        }

        /* --- Main Title --- */
        .main-title {
            font-family: var(--title-font);
            font-size: 4rem;
            color: var(--accent-color);
            letter-spacing: 3px;
            text-shadow: 0 0 10px var(--accent-color), 0 0 20px var(--accent-color), 0 0 30px #000;
            animation: flicker 2s infinite alternate;
            margin: 0;
            text-align: center;
        }
        
        .sub-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--border-color);
            text-shadow: 0 0 8px var(--border-color);
            margin-bottom: 2rem;
        }

        /* --- Team Card Grid --- */
        .team-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.5rem;
            width: 100%;
            max-width: 1200px;
            margin-bottom: 2rem;
        }

        /* Desktop: 2x2 grid */
        @media (min-width: 768px) {
            .team-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        
        /* Desktop: 4-column grid */
        @media (min-width: 1200px) {
            .team-grid {
                grid-template-columns: repeat(4, 1fr);
            }
        }

        .team-card {
            background: linear-gradient(145deg, var(--panel-color), #0f0f2a);
            border: 3px solid var(--border-color);
            border-radius: 12px;
            padding: 1.5rem;
            text-align: center;
            box-shadow: 0 0 20px rgba(255, 0, 255, 0.3), inset 0 0 15px rgba(20, 20, 50, 0.5);
            transition: all 0.3s ease;
        }

        .team-card h2 {
            font-family: var(--title-font);
            font-size: 2.5rem;
            margin: 0 0 1rem 0;
            color: var(--border-color);
            letter-spacing: 2px;
        }

        .student-display {
            background-color: #000;
            border: 2px solid var(--accent-color);
            border-radius: 8px;
            padding: 2rem 1rem;
            min-height: 100px; /* Ensure all cards are same height */
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: inset 0 0 15px rgba(0, 255, 255, 0.3);
        }

        .result-name {
            font-size: 2rem;
            font-weight: 900;
            color: #fff;
            text-shadow: 0 0 10px #fff;
            transition: all 0.2s ease;
            /* For the scramble text */
            word-break: break-all;
            hyphens: auto;
        }

        /* --- Animation Class --- */
        .result-name.is-selecting {
            font-size: 2.2rem;
            animation: scramble-flicker 0.05s infinite;
        }
        
        @keyframes scramble-flicker {
            0% {
                color: var(--accent-color);
                text-shadow: 0 0 10px var(--accent-color);
            }
            50% {
                color: var(--border-color);
                text-shadow: 0 0 10px var(--border-color);
            }
            100% {
                color: #fff;
            }
        }


        /* --- Master Button --- */
        #select-btn {
            font-family: var(--title-font);
            font-size: 3rem;
            letter-spacing: 3px;
            color: var(--bg-color);
            background-color: var(--accent-color);
            border: none;
            padding: 1rem 3rem;
            border-radius: 10px;
            cursor: pointer;
            box-shadow: 0 0 20px var(--accent-color), 0 0 30px var(--accent-color);
            transition: all 0.3s ease;
        }
        
        #select-btn:hover {
            background-color: #fff;
            color: var(--border-color);
            box-shadow: 0 0 20px var(--border-color), 0 0 30px var(--border-color), 0 0 50px var(--border-color);
            transform: scale(1.05);
        }

        #select-btn:active {
            transform: scale(0.95);
        }

        #select-btn:disabled {
            background-color: #333;
            color: #666;
            box-shadow: none;
            cursor: not-allowed;
            animation: none;
        }
        
        @keyframes flicker {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
        }

    </style>
</head>
<body>

    <h1 class="main-title">Team Showdown</h1>
    <p class="sub-title">LỚP 10/10 - Student Selector</p>

    <div class="team-grid">
        <!-- Team 1 Card -->
        <div class="team-card" id="card-team1">
            <h2>TEAM 1</h2>
            <div class="student-display">
                <span class="result-name" id="result-team1">???</span>
            </div>
        </div>

        <!-- Team 2 Card -->
        <div class="team-card" id="card-team2">
            <h2>TEAM 2</h2>
            <div class="student-display">
                <span class="result-name" id="result-team2">???</span>
            </div>
        </div>

        <!-- Team 3 Card -->
        <div class="team-card" id="card-team3">
            <h2>TEAM 3</h2>
            <div class="student-display">
                <span class="result-name" id="result-team3">???</span>
            </div>
        </div>

        <!-- Team 4 Card -->
        <div class="team-card" id="card-team4">
            <h2>TEAM 4</h2>
            <div class="student-display">
                <span class="result-name" id="result-team4">???</span>
            </div>
        </div>
    </div>

    <button id="select-btn">SELECT</button>

    <script>
        // --- 1. STUDENT DATA ---
        // (From your provided list)
        const teams = {
            team1: [
                "HUY LỘC", "HỒNG SƠN", "NGỌC TÂM", "HOÀNG KHANG", "BẢO TRÚC", "GIA HUY",
                "ĐĂNG KHÔI", "TẤN PHÁT", "VIỆT KHÔI", "KHẢI MINH", "KHÁNH LINH", "BẢO NGHI"
            ],
            team2: [
                "HOÀI PHÚ", "ĐÔNG THÀNH", "THẢO LÂM", "QUỲNH MI", "MINH TRÂM", "THU HIỀN",
                "LÊ KHANG", "MINH HIẾU", "PHƯƠNG THẢO", "THUỲ AN", "NHẬT TÂM", "TRƯỜNG THỊNH"
            ],
            team3: [
                "DUY LONG", "HOÀNG BÁCH", "KHÔI NGUYÊN", "ANH KHUÊ", "BẢO LỌC", "QUỐC HƯNG",
                "PH. NGUYÊN QUỲNH ANH", "NG. NGỌC QUỲNH ANH", "QUỲNH NHƯ", "GIA NGHỊ", "TRUNG SƠN", "THANH SƠN"
            ],
            team4: [
                "BẢO NAM", "QUANG NHẬT", "THÁNH ĐẠT", "THANH MINH", "MINH KHAI", "MINH KHANG",
                "YẾN MINH", "HUỲNH AN", "MINH TUẤN", "TIẾN THÀNH", "ANH THƯ", "PHÚC HẬU"
            ]
        };

        // --- 2. DOM ELEMENTS ---
        const selectBtn = document.getElementById('select-btn');
        const displays = {
            team1: document.getElementById('result-team1'),
            team2: document.getElementById('result-team2'),
            team3: document.getElementById('result-team3'),
            team4: document.getElementById('result-team4')
        };
        const allDisplayElements = Object.values(displays);
        
        // Characters to use in the scramble animation
        const scrambleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZĐ1234567890@#$?!";
        let scrambleIntervals = [];

        // --- 3. FUNCTIONS ---

        /**
         * Picks a random student from a given team array.
         */
        function getRandomStudent(teamArray) {
            return teamArray[Math.floor(Math.random() * teamArray.length)];
        }

        /**
         * Starts the scramble animation on a specific display.
         */
        function startScramble(displayElement) {
            // Set the element to scramble mode
            displayElement.classList.add('is-selecting');
            
            // Start an interval to rapidly change the text
            const intervalId = setInterval(() => {
                let randomText = "";
                // Generate random text (length 3 to 10)
                const textLength = Math.floor(Math.random() * 7) + 3;
                for (let i = 0; i < textLength; i++) {
                    randomText += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
                }
                displayElement.textContent = randomText;
            }, 50); // Change text every 50ms

            // Store the interval ID so we can stop it later
            scrambleIntervals.push(intervalId);
        }

        /**
         * Stops the scramble animation and shows the final name.
         */
        function stopScramble(displayElement, name) {
            // Clear any running interval for this element
            scrambleIntervals.forEach(clearInterval);
            scrambleIntervals = []; // Clear the array
            
            displayElement.classList.remove('is-selecting');
            displayElement.textContent = name;
        }

        /**
         * Main function to run the selection process.
         */
        function selectStudents() {
            // Disable button to prevent spam clicking
            selectBtn.disabled = true;
            selectBtn.textContent = "SELECTING...";

            // 1. Get all the winners first
            const winners = {
                team1: getRandomStudent(teams.team1),
                team2: getRandomStudent(teams.team2),
                team3: getRandomStudent(teams.team3),
                team4: getRandomStudent(teams.team4)
            };

            // 2. Start scrambling all displays
            allDisplayElements.forEach(el => startScramble(el));

            // 3. Reveal winners one by one (staggered reveal)
            setTimeout(() => {
                stopScramble(displays.team1, winners.team1);
            }, 1500); // Reveal Team 1 after 1.5s

            setTimeout(() => {
                stopScramble(displays.team2, winners.team2);
            }, 2000); // Reveal Team 2 after 2s

            setTimeout(() => {
                stopScramble(displays.team3, winners.team3);
            }, 2500); // Reveal Team 3 after 2.5s

            setTimeout(() => {
                stopScramble(displays.team4, winners.team4);
                
                // Re-enable the button after the final reveal
                selectBtn.disabled = false;
                selectBtn.textContent = "SELECT AGAIN";
            }, 3000); // Reveal Team 4 after 3s
        }

        // --- 4. EVENT LISTENER ---
        selectBtn.addEventListener('click', selectStudents);

    </script>
</body>
</html>

