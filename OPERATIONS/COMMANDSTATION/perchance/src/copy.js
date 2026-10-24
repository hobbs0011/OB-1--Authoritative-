/* ============================================================================
   THE COPY DISTILLERY — the words half of the marketing wing.

   The pictures are half the archive (src/brand/assets + src/brand.js ASSETS +
   the ingest pipeline in src/marketing/README.md). This file is the other
   half: the codex's lines and the creatives' copy as queryable STOCK, plus
   the VOICE protocol (Gospel 444) that rewrites any draft in the codex voice.

   Law it obeys:
   - Stock is TRANSCRIBED, never polished. A line here reads exactly as the
     codex or the creative rendered it (src/sites/net/CODEX.md is the record).
   - The business's claims (80-vs-30, the Lakeview free diagnostic) ride as
     the BUSINESS'S words — the distillery never upgrades them into station
     measurements.
   - Vietnamese diacritics are precise (Gospel 444 body rule) — never
     retyped from memory; copied off the pixels via CREATIVES.md.
   - Extraction rules, sources and standing debts: src/marketing/COPY-ARCHIVE.md.
   ========================================================================== */
(function(){
  "use strict";

  /* THE VOICE PROTOCOL — Gospel 444, codex p14. */
  var VOICE = {
    clarity: "Canadian Clarity — direct, sharp, witty. Say the true thing in the fewest words.",
    candor: "Radical Candor — the truth hurts, but it sets you free. Name the wound, never the person.",
    permission: "Permission Culture — empowering, acknowledging the wound. The reader leaves bigger than they arrived.",
    antishame: "ANTI-SHAME DOCTRINE — there is no 'wrong', only calibrate. The word 'wrong' does not exist here.",
    palette: "Purple and Gold are the Empire. Blue is the Matrix — never reach for corporate blue words (synergy, leverage, utilize) either.",
    ask: "Every piece demands ONE action. A piece with no ask is a diary."
  };

  /* THE STOCK — first stock, 2026-10-21: the Full Stack Codex + six creatives.
     Second stock: batch 003 Tiger Protocol frames. Third stock: batch 004
     (velocity/battle-cry, dual-mastery, full mouse+tiger portraits,
     differentiators trio, M2 pipeline, buddy/crucible/Saigon, memory math).
     Fourth stock: batch 005, the Tiger Dossier (Vietnamese-market cut).
     Fifth stock: batch 008 (cognitive engine, locked curriculum, AI-PET
     engine, matrix, doctrine).
     id, lane, words (verbatim off the codex/creative), use. */
  var STOCK = [
    { id:"arsenal-urgency", lane:"arsenal", words:"Relying on your current English skills in 2026 is like sitting on a sinking ship, sipping a cocktail, 45 minutes before you go underwater.", use:"openers, hooks, first lines" },
    { id:"arsenal-objection", lane:"arsenal", words:"How much does it cost you to NOT speak English right now? That promotion? That client?", use:"objection handling, mid-copy pivots" },
    { id:"arsenal-reframe", lane:"arsenal", words:"There are no mistakes at NET. Only discoveries. The word 'wrong' does not exist here — we only calibrate.", use:"reassurance beats, post-CTA softeners" },
    { id:"arsenal-guarantee", lane:"arsenal", words:"We don't promise perfect grammar. We promise 100% confidence.", use:"closers, risk reversal, guarantees" },
    { id:"positioning", lane:"law", words:"We do not sell English. We sell a new identity. Authentic, direct, and zero-shame.", use:"positioning, about pages, pitch decks" },
    { id:"tagline", lane:"law", words:"English centers teach you grammar rules. NET teaches you how to TALK.", use:"comparisons, headers, ad subheads" },
    { id:"habit", lane:"pillars", words:"1 Hour a Day. No Homework. Just Habit.", use:"schedule objections, lifestyle framing" },
    { id:"formula", lane:"pillars", words:"10 Vocab words. 5 Idioms. 5 Slang. 3 Games.", use:"lesson anatomy, method proof" },
    { id:"input45", lane:"pillars", words:"Listen & Understand to fun content during your commute. No pause.", use:"the 45 — input half" },
    { id:"output15", lane:"pillars", words:"Speak & Mimic. Activate the Tiger Voice.", use:"the 15 — output half" },
    { id:"pillar-listen", lane:"pillars", words:"Stop translating. Start understanding.", use:"the 60% rule in one breath" },
    { id:"pillar-speak", lane:"pillars", words:"Loud mistakes are progress.", use:"permission beats" },
    { id:"pillar-context", lane:"pillars", words:"Real conversations.", use:"context proof" },
    { id:"pillar-confidence", lane:"pillars", words:"A safe space to calibrate.", use:"safety proof" },
    { id:"mouse", lane:"ladder", words:"Hesitant, apologetic, translates in head, terrified of judgment.", use:"diagnosis copy, the before-state (0–40)" },
    { id:"cub", lane:"ladder", words:"Building momentum, natural reflexes emerging, starting to take risks.", use:"progress copy, the middle (41–79)" },
    { id:"tiger", lane:"ladder", words:"High velocity, owns the room, speed over syntax.", use:"aspiration copy, the top (80–100)" },
    { id:"elephant", lane:"wound", words:"You could break it in a second, but you forgot you're an elephant.", use:"the wound — mistake-punishing past" },
    { id:"cage-open", lane:"wound", words:"CHIẾC LỒNG ĐÃ MỞ. LỰA CHỌN LÀ CỦA BẠN.", use:"Vietnamese closers, the open cage" },
    { id:"lakeview-offer", lane:"offer", words:"Nhận ngay 1 buổi đánh giá năng lực & chẩn đoán “Điểm Nghẽn” (30 phút) hoàn toàn MIỄN PHÍ. Không chèo kéo. Không cam kết mua.", use:"the Lakeview free diagnostic — the business's offer, verbatim" },
    { id:"lakeview-cta", lane:"offer", words:"NHẮN TIN TRỰC TIẾP NGAY BÂY GIỜ", use:"the direct-message CTA, verbatim" },
    { id:"completion", lane:"proof", words:"Tỷ lệ hoàn thành chương trình tại NET (So với 30% trung bình ngành).", use:"the 80-vs-30 claim — the business's words, never the station's measurement" },
    { id:"environment", lane:"proof", words:"Môi trường mạnh hơn ý chí. Bạn không đơn độc chiến đấu.", use:"community proof, Vietnamese" },
    { id:"environment-en", lane:"proof", words:"Environment beats willpower. Lifetime value through community.", use:"community proof, English" },
    { id:"learn-vn", lane:"method", words:"Learn English the exact same way you learned Vietnamese.", use:"method headers" },
    { id:"quiet-mouse", lane:"wound", words:"Lỗi không phải do bạn. Đó là hậu quả của 10 năm bị giam lỏng trong “Nhà Tù Ngữ Pháp” của giáo dục truyền thống.", use:"absolution beats, Vietnamese" },
    { id:"trapped-pro", lane:"avatars", words:"Grammar is my prison.", use:"the trapped professional, 24–35" },
    { id:"parent", lane:"avatars", words:"Traditional centers failed us.", use:"the ambitious parent, LakeView City D2" },
    { id:"decision", lane:"avatars", words:"Lost international contracts.", use:"the decision maker, HR/CEO 50–500" },
    { id:"funnel-close", lane:"funnel", words:"The Puppy Dog Close — 1st month risk-free reversal.", use:"decision stage (terms still backburnered)" },
    { id:"snowman", lane:"wound", words:"The translate-in-head bottleneck triggers the Snowman Freeze: whispered volume, the apology reflex, total cognitive freeze under pressure.", use:"diagnosis copy, score 0-40" },
    { id:"truth-filter", lane:"wound", words:"You are not broken. Your method was.", use:"the truth filter, absolution in one breath" },
    { id:"captive-power", lane:"wound", words:"You have the power of an adult professional, but the mind of a captive.", use:"affluent-avatar wound" },
    { id:"babies-quote", lane:"method", words:"Babies don't use dictionaries to learn Vietnamese. Stop treating your brain like a filing cabinet.", use:"the single best argument, closers" },
    { id:"optimize-time", lane:"pillars", words:"We don't add time to your life. We optimize the time you already have.", use:"schedule objection, the pitch" },
    { id:"consistency", lane:"pillars", words:"Consistency beats intensity.", use:"habit proof" },
    { id:"goldfish", lane:"proof", words:"The brain acts as a leaky bucket, losing 80% of new information within 48 hours without reinforcement.", use:"the Goldfish Problem — the business's claim, quarantined" },
    { id:"tough-love", lane:"proof", words:"Tough Love Mode: 24/7 accountability. Miss a day, the streak decays.", use:"accountability proof" },
    { id:"strike-days", lane:"proof", words:"Strikes at 1, 3, 7, 14, and 30 days to embed data permanently.", use:"spaced-repetition proof" },
    { id:"msg-node1", lane:"funnel", words:"What is your biggest Elephant Chain? Translate-in-Head or Fear of mistakes?", use:"messenger hook and qualification" },
    { id:"msg-node2", lane:"funnel", words:"The Truth Filter diagnoses the mechanical failure and unlocks permission.", use:"messenger diagnosis" },
    { id:"msg-node4", lane:"funnel", words:"Calendaring for instant booking versus seamless manual takeover for specific questions.", use:"messenger execution branch" },
    { id:"trojan-mask", lane:"funnel", words:"The Mask is community trust; the Payload is the thud factor.", use:"Trojan Horse go-to-market" },
    { id:"lakeview-enclave", lane:"avatars", words:"20.1 hectares of premium enclave in District 2; Metro Line 2 at the door.", use:"Lakeview place proof — the business's numbers, quarantined" },
    { id:"metro-captive", lane:"avatars", words:"A dense, hyper-local pocket of high-net-worth professionals.", use:"why Lakeview first" },
    { id:"dominance", lane:"law", words:"We sell 2026 Professional Dominance.", use:"headers, campaign spine" },
    { id:"architecture-scales", lane:"law", words:"Willpower fails. Architecture scales. We do not hope for success; we engineer it.", use:"closers, infrastructure proof" },
    { id:"wake-tiger", lane:"law", words:"WAKE UP THE TIGER. THE CAGE IS OPEN. / ĐÁNH THỨC MÃNH HỔ. CHIẾC LỒNG ĐÃ MỞ.", use:"bilingual battle cry" },
    { id:"pressure-test", lane:"proof", words:"Fluency is only valuable if you can execute it under pressure.", use:"networking, execution zone" },
    { id:"student-code", lane:"method", words:"The I-Don't-Know Rule: communicate lack of understanding immediately. Open questions keep conversations alive.", use:"classroom method" },
    { id:"ledger-law", lane:"law", words:"THE LEDGER IS LAW.", use:"Gospel operational seal" },
    { id:"fail-closed", lane:"law", words:"The system halts on ambiguity; it never guesses sovereign intent.", use:"fail-closed protocol" },
    { id:"four-agents", lane:"law", words:"Gemini maps, GPT builds, Claude refines — governed strictly by the Executor.", use:"four-agent constitution" },
    { id:"phonics-42", lane:"method", words:"UK Jolly Phonics Base Code: 42 core sounds, fixing interference before the roof.", use:"phonetic foundation" },
    { id:"velocity", lane:"law", words:"Confident velocity will always defeat quiet, fearful accuracy.", use:"the velocity hook, headers" },
    { id:"velocity-vi", lane:"law", words:"Tốc độ tự tin sẽ luôn đánh bại sự chính xác nhưng rụt rè và sợ hãi.", use:"the velocity hook, Vietnamese" },
    { id:"loud-wrong", lane:"law", words:"LOUD AND WRONG beats QUIET AND RIGHT.", use:"the permission battle cry, verbatim" },
    { id:"fuel", lane:"method", words:"Mistakes are fuel. The red pen is dead.", use:"classroom permission beats" },
    { id:"flip-phone", lane:"arsenal", words:"In 2026, knowing only English is like holding a flip-phone.", use:"the 2026 hook, openers" },
    { id:"employable", lane:"law", words:"The two most employable skills on Earth.", use:"dual-mastery closers" },
    { id:"employable-vi", lane:"law", words:"Hai kỹ năng dễ xin việc nhất trên thế giới.", use:"dual-mastery closers, Vietnamese" },
    { id:"ai-multiplier", lane:"law", words:"English opens doors, but AI proficiency multiplies your total market value.", use:"the AI multiplier, headers" },
    { id:"ai-multiplier-vi", lane:"law", words:"Tiếng Anh mở ra cơ hội, nhưng sự Thành thạo AI nhân giá trị thị trường của bạn lên nhiều lần.", use:"the AI multiplier, Vietnamese" },
    { id:"sovereign-operator", lane:"law", words:"Command a supercomputer to do the work of 10 people, and report on it fluently in English. Become the Sovereign Operator.", use:"the operator promise — the business's numbers, quarantined" },
    { id:"shift-3", lane:"proof", words:"Move from a replaceable manual worker to an irreplaceable architect of systems.", use:"the shift, aspiration copy" },
    { id:"mouse-full", lane:"ladder", words:"Frozen by “Translate-in-Head”. Stuck in “Grammar Prison”. Low volume, hesitant. Apologetic and insecure.", use:"the before-state, full portrait (0–40)" },
    { id:"tiger-full", lane:"ladder", words:"Instant pattern recognition. Confident and fast — speed over perfection. Commanding volume. Owns the room.", use:"the after-state, full portrait (80–100)" },
    { id:"useful-words", lane:"method", words:"USEFUL WORDS: only the exact language used in the boardroom and on the streets.", use:"method headers, differentiators" },
    { id:"spaced-def", lane:"method", words:"SPACED REPETITION: interrupting memory decay and forcing long-term mastery.", use:"method headers, differentiators" },
    { id:"immersion", lane:"method", words:"COMMUNITY IMMERSION: surround yourself with native speakers for natural acquisition.", use:"method headers, differentiators" },
    { id:"bypass", lane:"method", words:"The 60% Rule bypasses the dictionary to build pattern recognition.", use:"anti-translation proof" },
    { id:"bypass-vi", lane:"method", words:"Quy tắc 60% bỏ qua từ điển để xây dựng nhận diện mẫu", use:"anti-translation proof, Vietnamese" },
    { id:"engine-rule", lane:"method", words:"Focus on speed and confidence. Embrace mistakes as learning, achieve total ownership.", use:"the tiger engine, method proof" },
    { id:"infrastructure", lane:"method", words:"AI-powered sound repetition for 24/7 personalized accountability and reinforcement.", use:"infrastructure proof — the business's words, quarantined" },
    { id:"base-41", lane:"method", words:"Master the 41 core sounds of UK Jolly Phonics to permanently fix pronunciation issues.", use:"phonetic variant — this frame says 41, the codex says 42; the business's words, quarantined" },
    { id:"pressure-vi", lane:"proof", words:"Sự lưu loát chỉ có giá trị khi được thực hiện dưới áp lực.", use:"execution-zone proof, Vietnamese" },
    { id:"bucket-vi", lane:"proof", words:"Não bộ của bạn là một chiếc xô thủng, tự động xóa những gì không được củng cố.", use:"the leaky bucket, Vietnamese" },
    { id:"cramming", lane:"proof", words:"You do not have a bad memory. Traditional weekend cramming is a biological lie.", use:"absolution beats, memory proof" },
    { id:"spaced-math", lane:"proof", words:"Spaced Repetition mathematically interrupts memory decay to build permanent mastery.", use:"memory proof, the battery cut" },
    { id:"spaced-math-vi", lane:"proof", words:"Kỹ thuật Lặp Lại Ngắt Quãng dùng toán học để đánh chặn sự lãng quên, xây dựng sự làm chủ vĩnh viễn.", use:"memory proof, Vietnamese" },
    { id:"plugs-leaks", lane:"proof", words:"The AI-PET plugs the leaks in a forgetting brain.", use:"AI-PET headers" },
    { id:"pocket-coach", lane:"proof", words:"24/7 pocket coach ensuring the 45/15 daily habit.", use:"accountability proof" },
    { id:"buddy", lane:"proof", words:"Peer-to-peer accountability to ensure you never fight alone in the ecosystem.", use:"buddy-system proof, English" },
    { id:"buddy-vi", lane:"proof", words:"Trách nhiệm ngang hàng để đảm bảo bạn không bao giờ giờ chiến đấu một mình trong hệ sinh thái.", use:"buddy-system proof, Vietnamese — transcribed with the frame's doubled word" },
    { id:"crucible", lane:"offer", words:"Step out of the zero-judgment coaching zone. Practice boardroom-level communication and prove to yourself that the hesitation is permanently gone.", use:"the pressure-test event" },
    { id:"crucible-vi", lane:"offer", words:"Bước ra khỏi vùng an toàn không phán xét. Thực hành giao tiếp cấp độ phòng họp và chứng minh với bản thân rằng sự do dự đã vĩnh viễn biến mất.", use:"the pressure-test event, Vietnamese" },
    { id:"saigon", lane:"offer", words:"Monthly in-person events in Saigon with other driven business professionals.", use:"the monthly event, ecosystem proof" },
    { id:"saigon-vi", lane:"offer", words:"Sự kiện trực tiếp hàng tháng tại Sài Gòn với các chuyên gia kinh doanh đầy nhiệt huyết.", use:"the monthly event, Vietnamese" },
    { id:"real-world", lane:"proof", words:"True fluency is pressure-tested in the real world, not in a simulated classroom.", use:"execution proof" },
    { id:"real-world-vi", lane:"proof", words:"Sự thử cháy thực sự được thử lửa trong thế giới thực, không phải trong một lớp học mô phỏng.", use:"execution proof, Vietnamese — transcribed with the frame's wording" },
    { id:"m2", lane:"funnel", words:"THE M2 AUTOMATION PIPELINE: a fail-closed system to convert Mouse Mode into pipeline revenue.", use:"pipeline headers" },
    { id:"m2-hook", lane:"funnel", words:"The Hook and Qualification: instant validation of pain points — Grammar Prison, Translate-in-Head.", use:"messenger hook and qualification" },
    { id:"m2-diagnosis", lane:"funnel", words:"The Diagnosis and Truth: shift blame from the user to the traditional method.", use:"messenger diagnosis" },
    { id:"m2-win", lane:"funnel", words:"The Initial Win: a free 30-minute in-home diagnostic and one immediate win.", use:"messenger conversion — the business's offer, quarantined" },
    { id:"m2-branch", lane:"funnel", words:"The Scheduling Branch: Book goes to Calendly; Question gets a manual takeover.", use:"messenger execution branch" },
    { id:"wealth", lane:"offer", words:"THE WEALTH OPPORTUNITY: position yourself at the nexus of exponential growth in tech and crypto wealth. Seize your share.", use:"Lakeview place proof — the business's claim, quarantined" },
    { id:"d-hook", lane:"arsenal", words:"Tiếng Anh đang cản bước sự nghiệp của bạn đến mức nào?", use:"the dossier hook, openers" },
    { id:"d-av", lane:"avatars", words:"Dành riêng cho các chuyên gia và phụ huynh tại Quận 2 không có thời gian cho những phương pháp cũ.", use:"the Lakeview reader, who this is for" },
    { id:"d-mousedis", lane:"wound", words:"Bạn đọc hiểu hoàn hảo. Bạn viết email chuyên nghiệp. Nhưng khi phải mở miệng giao tiếp? Đóng băng. Dịch thầm trong đầu. Sợ sai ngữ pháp.", use:"the mouse disease, full portrait" },
    { id:"d-elephant", lane:"wound", words:"Một con voi trưởng thành có thể nhổ bật gốc cây. Nhưng nó vẫn đứng yên vì bị trói bởi một sợi dây thừng nhỏ giam giữ nó từ lúc bé.", use:"the elephant chain" },
    { id:"d-programmed", lane:"wound", words:"Bạn cũng vậy. Bạn đã đủ năng lực để giao tiếp, chỉ là bạn đã bị lập trình để tin rằng mình không thể.", use:"the wound, named" },
    { id:"d-breakchain", lane:"wound", words:"Đã đến lúc giật đứt sợi xích.", use:"the turn, closers" },
    { id:"d-turning", lane:"method", words:"BƯỚC NGOẶT: NGỪNG DỊCH THẦM. BẮT ĐẦU HIỂU.", use:"the turn, method headers" },
    { id:"d-rule60", lane:"method", words:"Quy luật 60%: Não bộ học ngôn ngữ tự nhiên nhất khi chỉ cần hiểu 60% ngữ cảnh. Đừng cố dịch từng từ.", use:"the 60% rule, Vietnamese" },
    { id:"d-context", lane:"method", words:"Ngữ cảnh > Từ vựng: Học trọn vẹn một câu trong tình huống thực tế, không học vẹt danh sách từ.", use:"context over vocabulary" },
    { id:"d-future5", lane:"law", words:"Tương lai không chờ đợi ai. 5 năm nữa, các công ty không quan tâm đến bằng cấp của bạn. Họ chỉ quan tâm: Bạn có thể xử lý khối lượng công việc của 10 người bằng AI, và báo cáo nó bằng Tiếng Anh lưu loát không?", use:"the 5-year question — the business's numbers, quarantined" },
    { id:"d-onlysys", lane:"law", words:"Natural English Training (NET) là hệ thống duy nhất dạy bạn làm chủ CẢ HAI kỹ năng này cùng lúc.", use:"the only-system claim — the business's words, quarantined" },
    { id:"d-nap45", lane:"pillars", words:"45 PHÚT NẠP (Input). Nghe tiếng Anh thụ động qua podcast/video trong lúc lái xe, nấu ăn, tập gym.", use:"the 45, Vietnamese" },
    { id:"d-xa15", lane:"pillars", words:"15 PHÚT XẢ (Output). Phản xạ nói tốc độ cao, sửa lỗi phát âm.", use:"the 15, Vietnamese" },
    { id:"d-nohw", lane:"pillars", words:"Không bài tập về nhà vô nghĩa. Không nhồi nhét. Chỉ là thói quen.", use:"habit proof, Vietnamese" },
    { id:"d-discipline", lane:"proof", words:"Kỷ luật vượt xa động lực.", use:"discipline beats, closers" },
    { id:"d-steel", lane:"proof", words:"Kỷ luật thép: Không chấp nhận viện cớ, nhắc nhở liên tục để duy trì 'chuỗi' (streak) của bạn.", use:"accountability proof, Vietnamese" },
    { id:"d-mouse", lane:"ladder", words:"Chế độ Chuột (0-40): Sợ hãi, xin lỗi vì tiếng Anh kém, nói nhỏ, dịch thầm.", use:"the before-state, Vietnamese (0–40)" },
    { id:"d-cub", lane:"ladder", words:"Chế độ Báo (41-79): Bắt đầu phản xạ tự nhiên, tăng âm lượng, chấp nhận rủi ro.", use:"the middle, Vietnamese (41–79)" },
    { id:"d-tiger", lane:"ladder", words:"Chế độ Hổ (80-100): Tốc độ cao, không dịch trong đầu, kiểm soát hoàn toàn phòng họp.", use:"the top, Vietnamese (80–100)" },
    { id:"d-sellpower", lane:"law", words:"Chúng tôi không bán tiếng Anh. Chúng tôi bán Quyền Năng Tự Tin.", use:"positioning, Vietnamese" },
    { id:"d-loudvi", lane:"law", words:"LỚN TIẾNG VÀ SAI > IM LẶNG VÀ ĐÚNG.", use:"the permission battle cry, Vietnamese" },
    { id:"d-redpen", lane:"method", words:"Trong thế giới thực, không ai cầm bút đỏ chấm điểm ngữ pháp của bạn. Họ chấm điểm sự tự tin của bạn.", use:"the red pen is dead, Vietnamese" },
    { id:"d-dataevolve", lane:"method", words:"Tốc độ quan trọng hơn cú pháp. Sai lầm không phải là thất bại, sai lầm là dữ liệu để tiến hóa. Lên tiếng là mệnh lệnh.", use:"speed over syntax, Vietnamese" },
    { id:"d-buddywk", lane:"proof", words:"Thực hành hàng tuần cùng đối tác trình độ tương đương.", use:"buddy-system proof, Vietnamese" },
    { id:"d-combat", lane:"proof", words:"Môi trường giả lập áp lực (networking, thuyết trình).", use:"combat-event proof" },
    { id:"d-safezone", lane:"proof", words:"Tuyệt đối không phán xét, tự do mắc lỗi.", use:"safe-zone proof" },
    { id:"d-hobbs", lane:"avatars", words:"CHÀO HÀNG XÓM LAKEVIEW. TÔI LÀ MICHAEL HOBBS.", use:"the founder greeting" },
    { id:"d-hobbs500", lane:"avatars", words:"Đã huấn luyện hơn 500 học viên phá vỡ giới hạn ngôn ngữ.", use:"founder proof — the business's number, quarantined" },
    { id:"d-zerorisk", lane:"offer", words:"CAM KẾT RỦI RO BẰNG 0.", use:"the guarantee, headers" },
    { id:"d-promise", lane:"offer", words:"Chúng tôi HỨA rằng nếu bạn theo đúng Giao thức 45/15, bạn sẽ hoàn toàn đánh mất nỗi sợ hãi khi phải mở miệng nói tiếng Anh.", use:"the promise — the business's words, quarantined" },
    { id:"d-refund", lane:"offer", words:"Trải nghiệm tháng đầu tiên. Nếu bạn không cảm nhận được sự tự tin tăng lên rõ rệt, chúng tôi hoàn lại 100% học phí. Bạn không mất gì cả.", use:"first-month reversal — the business's terms, quarantined" },
    { id:"d-scroll", lane:"funnel", words:"Bạn có thể tiếp tục lướt Facebook và giữ nguyên “Chế Độ Chuột” thêm một năm nữa. Hoặc, bạn có thể dành ra 30 phút để thay đổi quỹ đạo sự nghiệp của mình.", use:"the closer, decision stage" },
    { id:"e-titanic", lane:"arsenal", words:"In 2026, knowing English alone is a “flip-phone.” Ignoring AI is drinking on the deck of the Titanic.", use:"the 2026 hook, full cut" },
    { id:"e-sovarch", lane:"proof", words:"Transitioning from a replaceable manual worker to an irreplaceable Sovereign Architect.", use:"the result, aspiration copy" },
    { id:"e-teach10", lane:"law", words:"We teach professionals to command a supercomputer to do the work of 10 people, automate grunt work, and report on it fluently in English.", use:"dual mastery, the teach — the business's numbers, quarantined" },
    { id:"e-nostudy", lane:"pillars", words:"No 'studying'. Listen to high-interest content (YouTube, Netflix, podcasts) during commutes to District 1 or while cooking.", use:"the 45, no-study proof" },
    { id:"e-intervene", lane:"proof", words:"The AI-PET (Personal English Trainer) logs exact Key Struggle Points and executes Spaced Repetition to intercept memory decay at mathematically optimal intervals.", use:"the intervention — acronym expanded, quarantined" },
    { id:"e-notrophies", lane:"proof", words:"No participation trophies.", use:"tough-love closers" },
    { id:"e-locked", lane:"method", words:"The Mathematically Locked Curriculum. Giáo trình Được Khóa chặt bằng Toán học.", use:"lesson-anatomy headers, bilingual" },
    { id:"e-valueadd", lane:"method", words:"Value Add: We ruthlessly curate only the language that native speakers actually use. No fluff. Just utility.", use:"curation proof, closers" },
    { id:"e-gamesdef", lane:"method", words:"3 Games: The psychological engine for maximum brain retention.", use:"games proof" },
    { id:"e-idiomsdef", lane:"method", words:"5 Idioms: The conversational glue used in real boardrooms.", use:"idioms proof" },
    { id:"e-strugglelogs", lane:"proof", words:"STRUGGLE DATA LOGS: The system tracks and logs every hesitation, stumble, and 'Key Struggle Point' during sessions.", use:"accountability proof" },
    { id:"e-spaced60", lane:"proof", words:"SPACED REPETITION: Re-introduces weak points at mathematically optimized intervals right before memory decay hits 60%.", use:"memory proof — the 60% decay line, quarantined" },
    { id:"e-toughslip", lane:"proof", words:"TOUGH LOVE MODE: Fail-closed logic. Miss a day, the streak decays. Like having a coach in your pocket, preventing a slip back into Mouse Mode.", use:"streak proof" },
    { id:"e-outcome", lane:"method", words:"The Outcome: Flooding the brain with comprehensible input destroys the translation bottleneck, forcing logic to arrive after confidence.", use:"cognitive proof" },
    { id:"e-directive", lane:"method", words:"The Directive: “Stop translating in your head. Start understanding with your ears.”", use:"ears-first proof" },
    { id:"e-floodbypass", lane:"method", words:"By flooding the brain with context, we build real-time pattern recognition, completely bypassing the cognitive bottleneck of traditional reading/writing. Logic comes AFTER confidence.", use:"anti-translation proof" },
    { id:"e-matrixfear", lane:"funnel", words:"Traditional centers sell fear, while NET scales transformation.", use:"comparison headers" },
    { id:"e-matrixenv", lane:"funnel", words:"30:1 packed, sterile rooms versus 1-on-1 / Micro-groups in premium spaces.", use:"environment comparison — the business's words, quarantined" },
    { id:"e-matrixmethod", lane:"funnel", words:"Textbooks & Red Pens versus AI-PET & Real-world Context.", use:"method comparison" },
    { id:"e-ultimatelaw", lane:"law", words:"THE ULTIMATE LAW: Loud & Wrong > Quiet & Right.", use:"permission battle cry, doctrine cut" },
    { id:"e-truthvi", lane:"wound", words:"Lỗi không phải do bạn, Đó là do phương pháp.", use:"truth filter, short Vietnamese cut" }
  ];

  /* THE FUNNEL — the Dung Conversion Blueprint, codex p10, as working stages. */
  var FUNNEL = [
    { stage:"Awareness", move:"Facebook organic groups (Hội cư dân LakeView City).", ask:"join the conversation" },
    { stage:"Interest", move:"Metaphor-heavy storytelling (The Sinking Ship, The Elephant Chain).", ask:"feel the wound" },
    { stage:"Consideration", move:"5-part email sequence.", ask:"stay for the next part" },
    { stage:"Assessment", move:"30-min diagnostic call (diagnose the Mouse-to-Tiger score).", ask:"book the diagnostic" },
    { stage:"Decision", move:"The Puppy Dog Close (1st month risk-free reversal).", ask:"say yes with nothing to lose" },
    { stage:"Onboarding", move:"AI-PET activation.", ask:"start the habit" }
  ];

  function stock(id){
    if(!id) return STOCK.slice();
    var q = String(id).toLowerCase();
    return STOCK.filter(function(s){ var hay = (s.id + " " + s.lane + " " + s.use + " " + s.words).toLowerCase(); return hay.indexOf(q) !== -1; });
  }

  /* Rewrite a draft in the codex voice: Canadian Clarity + Radical Candor +
     Permission Culture, anti-shame, one ask. Streams into an element when
     given one, like the station's other instruments. */
  async function voice(draft, el){
    var d = String(draft || "").trim();
    if(!d) return "";
    var instruction = "You are the NET copy desk. Rewrite the draft below in the house voice — "
      + VOICE.clarity + " " + VOICE.candor + " " + VOICE.permission + " " + VOICE.antishame
      + " House stock you may draw on (never invent numbers): "
      + STOCK.filter(function(s){ return /arsenal|positioning|tagline|habit|pillar/i.test(s.lane); })
        .map(function(s){ return s.words; }).join(" / ")
      + " " + VOICE.ask
      + " Keep Vietnamese diacritics precise if the draft has Vietnamese. Output ONLY the rewritten copy, no commentary."
      + "\n\nDRAFT:\n" + d;
    var p = root.generateText({ instruction:instruction });
    if(el){ el.innerHTML = p; }
    var res = await p;
    var txt = String((res && res.text) || res || "");
    if(el) el.innerHTML = txt.replace(/</g, "&lt;");
    return txt;
  }

  window.ObiCopy = { voice:VOICE, stock:stock, funnel:function(){ return FUNNEL.slice(); }, rewrite:voice };
})();
