# PROOF - HIGHSCHOOLLESSON2 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\HIGHSCHOOLLESSON2.txt

            let completedTasks = 0;
            if (lessonProgress.reading) completedTasks++;
            if (lessonProgress.game1) completedTasks++;
            if (lessonProgress.game2) completedTasks++;
            if (lessonProgress.game3) completedTasks++; // Added game3
            
            const percentage = Math.round((completedTasks / lessonProgress.totalTasks) * 100);
            const progressBar = document.getElementById('lesson-progress-bar');
            
            progressBar.style.width = percentage + '%';
