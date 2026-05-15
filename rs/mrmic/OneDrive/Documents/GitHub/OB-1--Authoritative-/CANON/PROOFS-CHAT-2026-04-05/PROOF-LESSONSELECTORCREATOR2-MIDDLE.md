# PROOF - LESSONSELECTORCREATOR2 MIDDLE

Source: D:\phoenix-chat-logs\CHAT-LOGS-ONLY\LESSONSELECTORCREATOR2.txt

            const indicator = document.getElementById('save-indicator');
            const status = document.getElementById('save-status');
            
            if (isSaved) {
                indicator.className = 'save-indicator saved';
                status.textContent = 'Saved';
            } else {
                indicator.className = 'save-indicator unsaved';
                status.textContent = 'Unsaved Changes';
            }
