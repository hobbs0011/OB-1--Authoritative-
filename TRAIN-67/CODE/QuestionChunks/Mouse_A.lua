--[[
=====================================================================
Mouse_A.lua — Question Chunk v2 | Tier: Mouse | Sub-Tier: A
Module: QuestionChunks/Mouse_A.lua
Type: Server ModuleScript (ServerStorage > QuestionChunks)
Purpose: First 15 Mouse-tier beginner English questions.
         v2-native format — requires QuestionBankV2 (Register Chunk API).

FTUE: Questions M_A_001 thru M_A_008 have ftueWeight=1.0.
      They form the guided first-run sequence for new players.

L1 Support:
  vi = Vietnamese (primary product market)
  th = Thai (fallback; DEFAULT_L1 in QuestionBankV2 CONFIG)

Generates: April 5, 2026 | Anakin SUPER_SAIYAN | Run 65
Platform Death Test: PASS
Gospel 444 Compliant — NO BLUE, NO DRIFT
=====================================================================
]]

--[[ CHUNK SCHEMA (array format → RegisterChunk auto-discovers via Init)
  Each entry:
    id          (string)  unique question ID — "M_A_NNN"
    tier        (string)  "Mouse"
    subTier     (string)  "A"
    format      (string)  see QuestionBankV2 CONFIG.FORMATS
    skillType   (string)  "vocabulary" | "grammar" | "pronunciation"
    vocabCategory (string) topic tag
    baseElo     (number)  900 = Mouse mid-point
    ftueWeight  (number)  >0 = appears in FTUE guided sequence
    ftueOrder   (number)  sort order within FTUE (lower = shown first)
    targetWord  (string)  canonical English word being taught
    isPremium   (bool)    false = free tier
    prompt      (table)   { en=string, vi=string, th=string }
    hint        (table)   { en=string, vi=string, th=string } | nil
    options     (table)   [{ text=string, isCorrect=bool }] for MC
    answer      (string)  correct answer text
    acceptedAnswers (table) list of accepted answer strings
    explanation (string)  shown after incorrect attempt
    questionBody (table)  { en=string, vi=string, th=string } L1 equiv overlay
]]

local chunk = {

  -- ============================================================
  -- FTUE SEQUENCE (M_A_001 – M_A_008) ftueWeight = 1.0
  -- Shown to new players in ftueOrder sequence
  -- ============================================================

  {
    id             = "M_A_001",
    tier           = "Mouse",
    subTier        = "A",
    format         = "multiple_choice",
    skillType      = "vocabulary",
    vocabCategory  = "greetings",
    baseElo        = 850,
    ftueWeight     = 1.0,
    ftueOrder      = 1,
    targetWord     = "hello",
    isPremium      = false,
    prompt = {
      en = "What is the English word for a basic greeting?",
      vi = "Từ tiếng Anh dùng để chào hỏi cơ bản là gì?",
      th = "คำภาษาอังกฤษสำหรับการทักทายพื้นฐานคืออะไร?",
    },
    hint = {
      en = "You say this when you first meet someone.",
      vi = "Bạn nói từ này khi gặp ai đó lần đầu.",
      th = "คุณพูดสิ่งนี้เมื่อพบใครเป็นครั้งแรก",
    },
    options = {
      { text = "Hello",   isCorrect = true  },
      { text = "Goodbye", isCorrect = false },
      { text = "Please",  isCorrect = false },
      { text = "Sorry",   isCorrect = false },
    },
    answer          = "Hello",
    acceptedAnswers = { "Hello", "hello", "Hi", "hi" },
    explanation     = "'Hello' (Xin chào / สวัสดี) — the most basic English greeting.",
    questionBody    = { en = "Hello", vi = "Xin chào", th = "สวัสดี" },
  },

  {
    id             = "M_A_002",
    tier           = "Mouse",
    subTier        = "A",
    format         = "multiple_choice",
    skillType      = "vocabulary",
    vocabCategory  = "greetings",
    baseElo        = 850,
    ftueWeight     = 1.0,
    ftueOrder      = 2,
    targetWord     = "thank you",
    isPremium      = false,
    prompt = {
      en = "How do you say 'Cảm ơn' in English?",
      vi = "'Cảm ơn' trong tiếng Anh là gì?",
      th = "'ขอบคุณ' ในภาษาอังกฤษคืออะไร?",
    },
    hint = {
      en = "Two words. You say this when someone helps you.",
      vi = "Hai từ. Bạn nói khi ai đó giúp bạn.",
      th = "สองคำ คุณพูดเมื่อมีคนช่วยเหลือคุณ",
    },
    options = {
      { text = "Thank you", isCorrect = true  },
      { text = "Excuse me", isCorrect = false },
      { text = "Good job",  isCorrect = false },
      { text = "You're it", isCorrect = false },
    },
    answer          = "Thank you",
    acceptedAnswers = { "Thank you", "thank you", "Thanks", "thanks" },
    explanation     = "'Thank you' (Cảm ơn / ขอบคุณ) — express gratitude.",
    questionBody    = { en = "Thank you", vi = "Cảm ơn", th = "ขอบคุณ" },
  },

  {
    id             = "M_A_003",
    tier           = "Mouse",
    subTier        = "A",
    format         = "fill_blank",
    skillType      = "grammar",
    vocabCategory  = "introductions",
    baseElo        = 870,
    ftueWeight     = 1.0,
    ftueOrder      = 3,
    targetWord     = "name",
    isPremium      = false,
    prompt = {
      en = "Complete: 'My ___ is Lan.'",
      vi = "Điền vào chỗ trống: 'My ___ is Lan.'",
      th = "เติมคำ: 'My ___ is Lan.'",
    },
    hint = {
      en = "This word means 'tên' in Vietnamese.",
      vi = "Từ này nghĩa là 'tên'.",
      th = "คำนี้แปลว่า 'ชื่อ' ในภาษาไทย",
    },
    answer          = "name",
    acceptedAnswers = { "name", "Name" },
    explanation     = "'My name is...' (Tên tôi là...) — the standard English self-introduction opener.",
    questionBody    = { en = "name", vi = "tên", th = "ชื่อ" },
  },

  {
    id             = "M_A_004",
    tier           = "Mouse",
    subTier        = "A",
    format         = "multiple_choice",
    skillType      = "vocabulary",
    vocabCategory  = "numbers",
    baseElo        = 860,
    ftueWeight     = 1.0,
    ftueOrder      = 4,
    targetWord     = "one",
    isPremium      = false,
    prompt = {
      en = "Which number is 'one'?",
      vi = "'One' là số mấy?",
      th = "'One' คือตัวเลขอะไร?",
    },
    hint = {
      en = "The first counting number.",
      vi = "Số đếm đầu tiên.",
      th = "ตัวเลขนับตัวแรก",
    },
    options = {
      { text = "1", isCorrect = true  },
      { text = "2", isCorrect = false },
      { text = "3", isCorrect = false },
      { text = "0", isCorrect = false },
    },
    answer          = "1",
    acceptedAnswers = { "1", "one" },
    explanation     = "'One' = 1. (Một / หนึ่ง). Counting starts here!",
    questionBody    = { en = "one", vi = "một", th = "หนึ่ง" },
  },

  {
    id             = "M_A_005",
    tier           = "Mouse",
    subTier        = "A",
    format         = "multiple_choice",
    skillType      = "vocabulary",
    vocabCategory  = "greetings",
    baseElo        = 870,
    ftueWeight     = 1.0,
    ftueOrder      = 5,
    targetWord     = "good morning",
    isPremium      = false,
    prompt = {
      en = "What do you say to greet someone in the morning?",
      vi = "Bạn chào ai đó vào buổi sáng như thế nào?",
      th = "คุณทักทายใครในตอนเช้าอย่างไร?",
    },
    hint = {
      en = "Two words. 'Good ___'",
      vi = "Hai từ. 'Good ___'",
      th = "สองคำ 'Good ___'",
    },
    options = {
      { text = "Good morning", isCorrect = true  },
      { text = "Good night",   isCorrect = false },
      { text = "Good luck",    isCorrect = false },
      { text = "Good game",    isCorrect = false },
    },
    answer          = "Good morning",
    acceptedAnswers = { "Good morning", "good morning" },
    explanation     = "'Good morning' (Chào buổi sáng / อรุณสวัสดิ์) — morning greeting 5am-12pm.",
    questionBody    = { en = "Good morning", vi = "Chào buổi sáng", th = "อรุณสวัสดิ์" },
  },

  {
    id             = "M_A_006",
    tier           = "Mouse",
    subTier        = "A",
    format         = "multiple_choice",
    skillType      = "vocabulary",
    vocabCategory  = "colors",
    baseElo        = 880,
    ftueWeight     = 1.0,
    ftueOrder      = 6,
    targetWord     = "red",
    isPremium      = false,
    prompt = {
      en = "What color is the word 'red' describing?",
      vi = "'Red' mô tả màu gì?",
      th = "'Red' หมายถึงสีอะไร?",
    },
    hint = {
      en = "Think of blood, fire, or stop signs.",
      vi = "Hãy nghĩ đến máu, lửa, hoặc biển báo dừng.",
      th = "คิดถึงเลือด ไฟ หรือป้ายหยุด",
    },
    options = {
      { text = "Red (đỏ)",    isCorrect = true  },
      { text = "Blue (xanh)", isCorrect = false },
      { text = "Green (xanh lá)", isCorrect = false },
      { text = "Yellow (vàng)",   isCorrect = false },
    },
    answer          = "Red (đỏ)",
    acceptedAnswers = { "Red (đỏ)", "red", "Red", "đỏ" },
    explanation     = "'Red' (Đỏ / แดง) — the color of fire! Remember: RED = traffic STOP.",
    questionBody    = { en = "red", vi = "đỏ", th = "แดง" },
  },

  {
    id             = "M_A_007",
    tier           = "Mouse",
    subTier        = "A",
    format         = "multiple_choice",
    skillType      = "vocabulary",
    vocabCategory  = "basic_responses",
    baseElo        = 860,
    ftueWeight     = 1.0,
    ftueOrder      = 7,
    targetWord     = "yes",
    isPremium      = false,
    prompt = {
      en = "How do you say 'Có' (agree/confirm) in English?",
      vi = "'Có' (đồng ý/xác nhận) trong tiếng Anh là gì?",
      th = "'ใช่' ในภาษาอังกฤษคืออะไร?",
    },
    hint = {
      en = "Opposite of 'No'.",
      vi = "Trái nghĩa với 'No'.",
      th = "ตรงข้ามกับ 'No'",
    },
    options = {
      { text = "Yes", isCorrect = true  },
      { text = "No",  isCorrect = false },
      { text = "OK",  isCorrect = false },
      { text = "Hmm", isCorrect = false },
    },
    answer          = "Yes",
    acceptedAnswers = { "Yes", "yes", "Yeah", "yeah", "Yep", "yep" },
    explanation     = "'Yes' (Có / ใช่) — agreement and confirmation. The power word!",
    questionBody    = { en = "yes", vi = "có", th = "ใช่" },
  },

  {
    id             = "M_A_008",
    tier           = "Mouse",
    subTier        = "A",
    format         = "multiple_choice",
    skillType      = "vocabulary",
    vocabCategory  = "basic_responses",
    baseElo        = 860,
    ftueWeight     = 1.0,
    ftueOrder      = 8,
    targetWord     = "no",
    isPremium      = false,
    prompt = {
      en = "How do you say 'Không' (refuse/deny) in English?",
      vi = "'Không' (từ chối/phủ nhận) trong tiếng Anh là gì?",
      th = "'ไม่' ในภาษาอังกฤษคืออะไร?",
    },
    hint = {
      en = "Opposite of 'Yes'. One short word.",
      vi = "Trái nghĩa với 'Yes'. Một từ ngắn.",
      th = "ตรงข้ามกับ 'Yes' คำสั้นๆ",
    },
    options = {
      { text = "No",   isCorrect = true  },
      { text = "Yes",  isCorrect = false },
      { text = "Not",  isCorrect = false },
      { text = "None", isCorrect = false },
    },
    answer          = "No",
    acceptedAnswers = { "No", "no", "Nope", "nope" },
    explanation     = "'No' (Không / ไม่) — also the word that saves your life. Learn it well.",
    questionBody    = { en = "no", vi = "không", th = "ไม่" },
  },

  -- ============================================================
  -- STANDARD POOL (M_A_009 – M_A_015) ftueWeight = 0
  -- Appear in regular rotation after FTUE completes
  -- ============================================================

  {
    id             = "M_A_009",
    tier           = "Mouse",
    subTier        = "A",
    format         = "multiple_choice",
    skillType      = "vocabulary",
    vocabCategory  = "politeness",
    baseElo        = 890,
    ftueWeight     = 0,
    targetWord     = "please",
    isPremium      = false,
    prompt = {
      en = "Which word do you add to make a polite request in English?",
      vi = "Từ nào thêm vào để yêu cầu lịch sự trong tiếng Anh?",
      th = "คำใดที่เติมเพื่อทำให้คำขอสุภาพในภาษาอังกฤษ?",
    },
    hint = {
      en = "'Can I have water, ___?' — fills the blank.",
      vi = "'Can I have water, ___?' — điền vào chỗ trống.",
      th = "'Can I have water, ___?' — เติมช่องว่าง",
    },
    options = {
      { text = "Please",  isCorrect = true  },
      { text = "Sorry",   isCorrect = false },
      { text = "Okay",    isCorrect = false },
      { text = "Thanks",  isCorrect = false },
    },
    answer          = "Please",
    acceptedAnswers = { "Please", "please" },
    explanation     = "'Please' (Làm ơn / กรุณา) — magic word that makes requests polite.",
    questionBody    = { en = "please", vi = "làm ơn", th = "กรุณา" },
  },

  {
    id             = "M_A_010",
    tier           = "Mouse",
    subTier        = "A",
    format         = "multiple_choice",
    skillType      = "vocabulary",
    vocabCategory  = "greetings",
    baseElo        = 880,
    ftueWeight     = 0,
    targetWord     = "goodbye",
    isPremium      = false,
    prompt = {
      en = "What do you say when leaving someone?",
      vi = "Bạn nói gì khi chia tay ai đó?",
      th = "คุณพูดอะไรเมื่อลาจากใครสักคน?",
    },
    hint = {
      en = "The opposite of 'Hello'. Used when parting.",
      vi = "Trái nghĩa với 'Hello'. Dùng khi chia tay.",
      th = "ตรงข้ามกับ 'Hello' ใช้ตอนแยกจากกัน",
    },
    options = {
      { text = "Goodbye",      isCorrect = true  },
      { text = "Hello",        isCorrect = false },
      { text = "Good morning", isCorrect = false },
      { text = "Come back",    isCorrect = false },
    },
    answer          = "Goodbye",
    acceptedAnswers = { "Goodbye", "goodbye", "Bye", "bye", "See you", "see you" },
    explanation     = "'Goodbye' (Tạm biệt / ลาก่อน) — used when leaving. Short form: 'Bye!'",
    questionBody    = { en = "goodbye", vi = "tạm biệt", th = "ลาก่อน" },
  },

  {
    id             = "M_A_011",
    tier           = "Mouse",
    subTier        = "A",
    format         = "multiple_choice",
    skillType      = "vocabulary",
    vocabCategory  = "greetings",
    baseElo        = 900,
    ftueWeight     = 0,
    targetWord     = "how are you",
    isPremium      = false,
    prompt = {
      en = "Which phrase asks about someone's wellbeing?",
      vi = "Câu nào hỏi thăm sức khỏe của ai đó?",
      th = "ประโยคใดถามเกี่ยวกับความเป็นอยู่ของใครสักคน?",
    },
    hint = {
      en = "A common question after 'Hello'.",
      vi = "Câu hỏi thường gặp sau 'Hello'.",
      th = "คำถามที่พบบ่อยหลังจาก 'Hello'",
    },
    options = {
      { text = "How are you?",  isCorrect = true  },
      { text = "What is this?", isCorrect = false },
      { text = "Where are you?",isCorrect = false },
      { text = "Who are you?",  isCorrect = false },
    },
    answer          = "How are you?",
    acceptedAnswers = { "How are you?", "how are you", "How are you" },
    explanation     = "'How are you?' (Bạn có khỏe không? / เป็นอย่างไรบ้าง?) — polite check-in.",
    questionBody    = { en = "How are you?", vi = "Bạn có khỏe không?", th = "เป็นอย่างไรบ้าง?" },
  },

  {
    id             = "M_A_012",
    tier           = "Mouse",
    subTier        = "A",
    format         = "multiple_choice",
    skillType      = "vocabulary",
    vocabCategory  = "greetings",
    baseElo        = 900,
    ftueWeight     = 0,
    targetWord     = "fine",
    isPremium      = false,
    prompt = {
      en = "How do you respond: 'I'm ___, thank you!'?",
      vi = "Bạn trả lời như thế nào: 'I'm ___, thank you!'?",
      th = "คุณตอบอย่างไร: 'I'm ___, thank you!'?",
    },
    hint = {
      en = "This word means you're doing well / okay.",
      vi = "Từ này có nghĩa là bạn đang ổn.",
      th = "คำนี้แปลว่าคุณสบายดี / โอเค",
    },
    options = {
      { text = "Fine",  isCorrect = true  },
      { text = "Bad",   isCorrect = false },
      { text = "Tired", isCorrect = false },
      { text = "Lost",  isCorrect = false },
    },
    answer          = "Fine",
    acceptedAnswers = { "Fine", "fine", "Good", "good", "Great", "great", "OK", "okay" },
    explanation     = "'I'm fine, thank you!' (Tôi khỏe, cảm ơn! / ฉันสบายดี ขอบคุณ!) — standard response.",
    questionBody    = { en = "fine", vi = "khỏe", th = "สบายดี" },
  },

  {
    id             = "M_A_013",
    tier           = "Mouse",
    subTier        = "A",
    format         = "multiple_choice",
    skillType      = "vocabulary",
    vocabCategory  = "colors",
    baseElo        = 910,
    ftueWeight     = 0,
    targetWord     = "green",
    isPremium      = false,
    prompt = {
      en = "What English color word matches 'màu xanh lá'?",
      vi = "Màu 'xanh lá' trong tiếng Anh là gì?",
      th = "สีอะไรในภาษาอังกฤษตรงกับ 'สีเขียว'?",
    },
    hint = {
      en = "Think of grass, trees, nature.",
      vi = "Hãy nghĩ đến cỏ, cây cối, thiên nhiên.",
      th = "คิดถึงหญ้า ต้นไม้ ธรรมชาติ",
    },
    options = {
      { text = "Green",  isCorrect = true  },
      { text = "Red",    isCorrect = false },
      { text = "Purple", isCorrect = false },
      { text = "Orange", isCorrect = false },
    },
    answer          = "Green",
    acceptedAnswers = { "Green", "green" },
    explanation     = "'Green' (Xanh lá / เขียว) — color of nature, money, and GO signals.",
    questionBody    = { en = "green", vi = "xanh lá", th = "เขียว" },
  },

  {
    id             = "M_A_014",
    tier           = "Mouse",
    subTier        = "A",
    format         = "word_builder",
    skillType      = "vocabulary",
    vocabCategory  = "numbers",
    baseElo        = 920,
    ftueWeight     = 0,
    targetWord     = "ten",
    isPremium      = false,
    prompt = {
      en = "Arrange the letters to spell the number 10 in English.",
      vi = "Sắp xếp các chữ cái để viết số 10 trong tiếng Anh.",
      th = "เรียงตัวอักษรเพื่อสะกดตัวเลข 10 ในภาษาอังกฤษ",
    },
    hint = {
      en = "3 letters: T-E-N",
      vi = "3 chữ cái: T-E-N",
      th = "3 ตัวอักษร: T-E-N",
    },
    answer          = "ten",
    acceptedAnswers = { "ten", "Ten", "TEN" },
    explanation     = "'Ten' = 10. (Mười / สิบ). After nine comes ten — you can count!",
    questionBody    = { en = "ten", vi = "mười", th = "สิบ" },
  },

  {
    id             = "M_A_015",
    tier           = "Mouse",
    subTier        = "A",
    format         = "multiple_choice",
    skillType      = "vocabulary",
    vocabCategory  = "politeness",
    baseElo        = 910,
    ftueWeight     = 0,
    targetWord     = "excuse me",
    isPremium      = false,
    prompt = {
      en = "What do you say to politely get someone's attention or pass by?",
      vi = "Bạn nói gì để lịch sự thu hút sự chú ý hoặc đi qua ai đó?",
      th = "คุณพูดอะไรเพื่อดึงความสนใจอย่างสุภาพหรือผ่านใครไป?",
    },
    hint = {
      en = "Two words. Used when you bump into someone or need to pass.",
      vi = "Hai từ. Dùng khi va vào ai đó hoặc cần đi qua.",
      th = "สองคำ ใช้เมื่อคุณชนใครหรือต้องการผ่านไป",
    },
    options = {
      { text = "Excuse me", isCorrect = true  },
      { text = "Sorry",     isCorrect = false },
      { text = "Move it",   isCorrect = false },
      { text = "Thank you", isCorrect = false },
    },
    answer          = "Excuse me",
    acceptedAnswers = { "Excuse me", "excuse me", "Pardon", "pardon" },
    explanation     = "'Excuse me' (Xin lỗi/Cho qua / ขอโทษ/ขออนุญาต) — polite interrupt or passage.",
    questionBody    = { en = "excuse me", vi = "xin lỗi / cho qua", th = "ขอโทษ / ขออนุญาต" },
  },

} -- end chunk

--[[ CHUNK STATS
  Total questions : 15
  Tier            : Mouse
  Sub-tier        : A
  FTUE questions  : 8 (M_A_001 – M_A_008, ftueWeight=1.0)
  Standard pool   : 7 (M_A_009 – M_A_015, ftueWeight=0)
  Formats used    : multiple_choice (12), fill_blank (1), word_builder (1), speed_type (0)
  Skill types     : vocabulary (13), grammar (1)
  ELO range       : 850 – 920
  Categories      : greetings, numbers, colors, politeness, basic_responses, introductions
  L1 langs        : vi (Vietnamese primary), th (Thai fallback)
  isPremium       : false (all free tier)
]]

return chunk
