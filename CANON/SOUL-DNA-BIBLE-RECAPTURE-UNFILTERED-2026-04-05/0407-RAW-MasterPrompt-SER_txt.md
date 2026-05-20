# RAW VERBATIM — MasterPrompt-SER.txt
## Corpus Metadata
- chunk_seq   : 0407
- chunk_id    : 0407-RAW-MasterPrompt-SER_txt
- source_file : C:\Users\mrmic\OneDrive\Documents\GitHub\phoenix-chat-logs\CHAT-LOGS-ONLY\MasterPrompt-SER.txt
- sha256      : 289E8B92FF7506F178264E526318B917539344D98C12D628781E79C13F3A187A
- size_bytes  : 6410
- lines       : 107
- ingested    : 2026-04-05
- phase       : Phase 2 — Raw Chat Log Ingest
- policy      : VERBATIM — No edits, no summaries, no AI overlays
- keywords    : VIETNAM

---
```
**Hey Gemini, please remember my student report format. I need you to generate reports for my students following these exact instructions:**

* **Report Title:** `[Student Name] - Student Evaluation Report - [Month]` (Approx. 40-60 characters)

* **Numerical Scores:**
    * **L, S, R, W** (Listening, Speaking, Reading, Writing) will be provided on a **1.00-10.00 EEL scale (.25 increments)**. The total score for these will be calculated as: `(L * 2) + (S * 2) + R + W`.
    * **C, M, B** (Confidence, Motivation, Behavior) will be provided on a **1.00-10.00 EEL scale (.25 increments)**. The average score for these will be calculated as: `(C + M + B) / 3`.

* **Score Level Mapping:** I will use the following ranges to determine the student's level for automatic skill description generation:
    * **Elementary (B):**
        * B1: 1.00 - 2.75
        * B2: 3.00 - 3.75
        * B3: 4.00 - 4.75
    * **Intermediate (I):**
        * I1: 5.00 - 5.75
        * I2: 6.00 - 6.75
        * I3: 7.00 - 7.75
    * **Advanced (A):**
        * A1: 8.00 - 8.75
        * A2: 9.00 - 9.25
        * A3: 9.50 - 9.75
    * **Native Speaker (N):**
        * N1, N2, N3: 10.00 (All scores of 10.00 will fall under Native Speaker level)

* **Content and Length:**
    * **Skill Evaluations (7 skills: L, S, R, W, C, M, B):** These will be **automatically generated** by me based on the numerical score provided for each skill and the corresponding pre-programmed descriptive text for that sub-level. Each description will aim for approximately **250-350 characters**.
    * **Summary (Overview):** This will be **automatically generated** by me. It will be a concise 5-6 sentence paragraph summarizing the student's overall performance based on the numerical scores and the generated skill evaluations. It will aim for approximately **300-400 characters**.
    * **3-Month Action Plan:** You will provide the breakdown of learning goals and topics for the next three months, organized by month. I will edit these for efficiency to aim for approximately **200-300 characters per month**. If your input exceeds this, I will edit for efficiency. If further reduction is needed, I will ask for your guidance on what to remove.

* **Input Process:** When you are ready for a new student report, you will provide **all necessary information in a single, consolidated prompt** using the format below. I will *not* prompt you step-by-step for individual skill descriptions.

    ```
    **Student Report Information Input**

    **Student's Name:** `[Insert Student's Full Name Here]`
    **Report Month:** `[Insert Report Month Here (e.g., May 2025)]`

    **Numerical Skill Scores (1.00 - 10.00, in .25 increments):**
    * **Listening (L):** `[Insert Score (e.g., 7.25)]`
    * **Speaking (S):** `[Insert Score (e.g., 6.50)]`
    * **Reading (R):** `[Insert Score (e.g., 5.75)]`
    * **Writing (W)::** `[Insert Score (e.g., 6.00)]`
    * **Confidence (C):** `[Insert Score (e.g., 8.50)]`
    * **Motivation (M):** `[Insert Score (e.g., 9.00)]`
    * **Behavior (B):** `[Insert Score (e.g., 7.75)]`

    **3-Month Action Plan (Approx. 200-300 characters per month):**
    * **Month 1 Goals:** `[Insert learning goals and topics for Month 1 here]`
    * **Month 2 Goals:** `[Insert learning goals and topics for Month 2 here]`
    * **Month 3 Goals:** `[Insert learning goals and topics for Month 3 here]`
    ```

* **Output Format:** Once all information is provided, I will generate the complete report in **both English and Vietnamese versions**.
* **No Prior Examples:** I will not refer to specific scores or details from past examples; I will treat each new report uniquely.
```



Notepad input:

---

**Student Report Information Input**

**Student's Name:** `[Insert Student's Full Name Here]`
**Report Month:** `[Insert Report Month Here (e.g., May 2025)]`

**Numerical Skill Scores (1.00 - 10.00, in .25 increments):**
* **Listening (L):** `[Insert Score (e.g., 7.25)]`
* **Speaking (S):** `[Insert Score (e.g., 6.50)]`
* **Reading (R):** `[Insert Score (e.g., 5.75)]`
* **Writing (W):** `[Insert Score (e.g., 6.00)]`
* **Confidence (C):** `[Insert Score (e.g., 8.50)]`
* **Motivation (M):** `[Insert Score (e.g., 9.00)]`
* **Behavior (B):** `[Insert Score (e.g., 7.75)]`

**3-Month Action Plan (Approx. 200-300 characters per month):**
* **Month 1 Goals:** `[Insert learning goals and topics for Month 1 here]`
* **Month 2 Goals:** `[Insert learning goals and topics for Month 2 here]`
* **Month 3 Goals:** `[Insert learning goals and topics for Month 3 here]`




Skill Explanation Page Evaluation

Score Based On: Listening, Speaking, Reading, Writing. .......................... Dựa Trên Điểm Số: Nghe, Nói, Đọc, Viết.
Levels Explanation: Elementary (B1-B3), Intermediate (I1-I3), Advanced (A1-A3), Native (N1-N3). Refer to 1-10 EEL scale on left of this page (e.g., 4.5 = B3). .............................................................................................. Giải Thích Cấp Độ: Sơ cấp (B1-B3), Trung cấp (I1-I3), Cao cấp (A1-A3), Bản ngữ (N1-N3). Tham khảo thang điểm 1-10 EEL ở bên trái trang này (ví dụ: 4.5 = B3 Sơ cấp 3).
Influence on Score: Listening/Speaking (75%) Reading/Writing (25%). Ảnh Hưởng Đến Điểm Số: Nghe/Nói: (75%) Đọc/Viết (25%).
Score Not Effected By: Although not scored Confidence/Motivation/Behavior is still very important..................................................................................................................... Không Ảnh Hưởng Đến Điểm Số: Mặc dù sự tự tin/động lực rất quan trọng, nhưng không được tính điểm.

Levels BL1: 1 BL2: 3 BL3: 4 IL1: 5 IL2: 6 IL3: 7 AL1: 8 AL2: 9 AL3: 9.5 NS: 10




NET Classnotes Update Prompt Info

"Hey Gemini, please review this youtube video for me, and summarize all of it's points, in very simple to understand english, include all the key sayings found in the western language, especially in the Autralia area. Organize them into easy to understand lists for my review, do not give me timestamps, I just want simple lists with summary of the conversation so I (an intermediate ESL student) can full understand the content, especially from an Australian persepective. Thanks Gemini!"







