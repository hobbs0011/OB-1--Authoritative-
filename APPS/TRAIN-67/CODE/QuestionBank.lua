--[[
    QuestionBank.lua — 200+ English Questions, 5 Difficulty Tiers
    Skibidi Zombie: Survive the Brainrots
    
    GOAL: MAKE MONEY. English is the game mechanic.
    This is not NET. This is a money-making machine.
    Teaching Law: Mouse → Tiger (permission over perfection)
    
    Tiers:
    1. Mouse  — basics, confidence builders
    2. Cat    — common usage, simple grammar
    3. Wolf   — intermediate grammar, vocabulary
    4. Lion   — advanced vocabulary, idioms
    5. Tiger  — literary devices, nuance, mastery
    
    Architecture: ModuleScript (ServerStorage)
    Version: 1.0.0
    Date: 2026-03-26
--]]

local QuestionBank = {}

local questions = {
    -- TIER 1: MOUSE (Beginner — build confidence)
    {id="m01", prompt="What does 'Hello' mean?", options={"A greeting","Goodbye","Thank you","Sorry"}, correctAnswer="A greeting", targetWord="hello", explanation="'Hello' is a friendly way to greet someone!", tier=1},
    {id="m02", prompt="Fill in: 'I ___ a student'", options={"am","is","are","be"}, correctAnswer="am", targetWord="am", explanation="'I am' — always use 'am' with 'I'.", tier=1},
    {id="m03", prompt="Which is a color?", options={"Blue","Happy","Run","Chair"}, correctAnswer="Blue", targetWord="blue", explanation="Blue is a color — like the sky!", tier=1},
    {id="m04", prompt="What's the opposite of 'hot'?", options={"Cold","Big","Fast","Loud"}, correctAnswer="Cold", targetWord="hot", explanation="Hot ↔ Cold — they're opposites!", tier=1},
    {id="m05", prompt="Choose the animal:", options={"Dog","Table","Book","Shirt"}, correctAnswer="Dog", targetWord="dog", explanation="A dog is an animal. The others are objects.", tier=1},
    {id="m06", prompt="What number comes after 5?", options={"6","4","7","3"}, correctAnswer="6", targetWord="six", explanation="5, 6, 7... six comes right after five!", tier=1},
    {id="m07", prompt="Fill in: 'She ___ a teacher'", options={"is","am","are","be"}, correctAnswer="is", targetWord="is", explanation="'She is' — use 'is' with he/she/it.", tier=1},
    {id="m08", prompt="Which is a fruit?", options={"Apple","Car","Pen","House"}, correctAnswer="Apple", targetWord="apple", explanation="An apple is a fruit!", tier=1},
    {id="m09", prompt="What do you say when you leave?", options={"Goodbye","Hello","Please","Sorry"}, correctAnswer="Goodbye", targetWord="goodbye", explanation="'Goodbye' is what we say when leaving.", tier=1},
    {id="m10", prompt="Fill in: 'They ___ friends'", options={"are","is","am","be"}, correctAnswer="are", targetWord="are", explanation="'They are' — use 'are' with they/we/you.", tier=1},
    {id="m11", prompt="Which is a body part?", options={"Hand","Sky","River","Music"}, correctAnswer="Hand", targetWord="hand", explanation="Your hand has five fingers!", tier=1},
    {id="m12", prompt="What's the opposite of 'big'?", options={"Small","Tall","Wide","Long"}, correctAnswer="Small", targetWord="big", explanation="Big ↔ Small. Easy!", tier=1},
    {id="m13", prompt="Fill in: 'I ___ hungry'", options={"am","is","are","was"}, correctAnswer="am", targetWord="hungry", explanation="'I am hungry' — feeling like you need food!", tier=1},
    {id="m14", prompt="Which is something you drink?", options={"Water","Rock","Paper","Cloud"}, correctAnswer="Water", targetWord="water", explanation="Water is essential — drink up!", tier=1},
    {id="m15", prompt="What color is grass?", options={"Green","Red","Blue","Yellow"}, correctAnswer="Green", targetWord="green", explanation="Grass is green!", tier=1},
    {id="m16", prompt="Fill in: 'The cat ___ on the mat'", options={"is","am","are","be"}, correctAnswer="is", targetWord="cat", explanation="'The cat is' — one cat = singular = 'is'.", tier=1},
    {id="m17", prompt="Which word means 'not old'?", options={"Young","Tall","Strong","Fast"}, correctAnswer="Young", targetWord="young", explanation="Young is the opposite of old!", tier=1},
    {id="m18", prompt="What's 'brainrot' in normal English?", options={"Nonsense content","A disease","A food","A sport"}, correctAnswer="Nonsense content", targetWord="brainrot", explanation="'Brainrot' = silly internet content. Like this game! 🧟", tier=1},
    {id="m19", prompt="What does 'skibidi' mean?", options={"It's a meme word","A type of food","A country","A sport"}, correctAnswer="It's a meme word", targetWord="skibidi", explanation="'Skibidi' is an internet meme — no real dictionary meaning!", tier=1},
    {id="m20", prompt="Fill in: 'We ___ happy'", options={"are","is","am","was"}, correctAnswer="are", targetWord="happy", explanation="'We are happy' — 'are' goes with 'we'.", tier=1},
    {id="m21", prompt="Which is a day of the week?", options={"Monday","January","Summer","Morning"}, correctAnswer="Monday", targetWord="monday", explanation="Monday is the first day of the work week!", tier=1},
    {id="m22", prompt="What do you use to write?", options={"Pen","Cup","Shoe","Hat"}, correctAnswer="Pen", targetWord="pen", explanation="A pen is for writing!", tier=1},
    {id="m23", prompt="What's the opposite of 'happy'?", options={"Sad","Angry","Tired","Hungry"}, correctAnswer="Sad", targetWord="happy_opp", explanation="Happy ↔ Sad.", tier=1},
    {id="m24", prompt="Fill in: 'He ___ a boy'", options={"is","am","are","were"}, correctAnswer="is", targetWord="boy", explanation="'He is' — singular = 'is'.", tier=1},
    {id="m25", prompt="Which is something you wear?", options={"Shirt","Pizza","Tree","Song"}, correctAnswer="Shirt", targetWord="shirt", explanation="You wear a shirt on your body.", tier=1},
    {id="m26", prompt="What's the opposite of 'fast'?", options={"Slow","Tall","Heavy","Bright"}, correctAnswer="Slow", targetWord="fast", explanation="Fast ↔ Slow.", tier=1},
    {id="m27", prompt="Fill in: 'There ___ a zombie!'", options={"is","am","are","be"}, correctAnswer="is", targetWord="zombie", explanation="'There is' for one thing. 'There are' for many.", tier=1},
    {id="m28", prompt="What does 'sigma' mean in slang?", options={"Independent/cool person","A math symbol only","A type of food","A dance move"}, correctAnswer="Independent/cool person", targetWord="sigma", explanation="In slang, 'sigma' = independent and confident. In math, it's a Greek letter!", tier=1},
    {id="m29", prompt="Which is a room in a house?", options={"Kitchen","Mountain","Ocean","Forest"}, correctAnswer="Kitchen", targetWord="kitchen", explanation="The kitchen is where you cook food!", tier=1},
    {id="m30", prompt="Fill in: 'The dogs ___ running'", options={"are","is","am","was"}, correctAnswer="are", targetWord="dogs", explanation="Multiple dogs = 'are'. One dog = 'is'.", tier=1},
    {id="m31", prompt="What does 'rizz' mean in slang?", options={"Charm/charisma","A dance","Being angry","Running fast"}, correctAnswer="Charm/charisma", targetWord="rizz", explanation="'Rizz' = charisma. Real English word: charisma!", tier=1},
    {id="m32", prompt="What does 'W' mean in slang?", options={"Win","Water","Wrong","Weird"}, correctAnswer="Win", targetWord="w_slang", explanation="'W' = Win. 'L' = Loss. Internet shorthand!", tier=1},
    {id="m33", prompt="Which is a feeling?", options={"Excited","Table","Pencil","Roof"}, correctAnswer="Excited", targetWord="excited", explanation="Excited is a feeling!", tier=1},
    {id="m34", prompt="Fill in: 'I ___ like brainrot'", options={"don't","doesn't","isn't","aren't"}, correctAnswer="don't", targetWord="dont", explanation="'I don't' — negative with I/you/we/they.", tier=1},
    {id="m35", prompt="What does 'NPC' mean in slang?", options={"Someone on autopilot","A type of computer","A school subject","A music genre"}, correctAnswer="Someone on autopilot", targetWord="npc", explanation="'NPC' in games = Non-Player Character. In slang = someone not thinking for themselves!", tier=1},
    {id="m36", prompt="What's the plural of 'cat'?", options={"Cats","Cates","Caties","Catses"}, correctAnswer="Cats", targetWord="plural", explanation="Most plurals just add 's'. Cat → Cats!", tier=1},
    {id="m37", prompt="Fill in: 'Do you ___ English?'", options={"speak","speaks","speaking","spoke"}, correctAnswer="speak", targetWord="speak", explanation="'Do you speak...' — base form after 'do'.", tier=1},
    {id="m38", prompt="Which is NOT a color?", options={"Brave","Red","Purple","Orange"}, correctAnswer="Brave", targetWord="brave", explanation="'Brave' means courageous — not a color!", tier=1},
    {id="m39", prompt="Fill in: 'My name ___ Michael'", options={"is","am","are","were"}, correctAnswer="is", targetWord="name", explanation="'My name is...' — how we introduce ourselves!", tier=1},
    {id="m40", prompt="What time of day is breakfast?", options={"Morning","Night","Afternoon","Midnight"}, correctAnswer="Morning", targetWord="breakfast", explanation="Breakfast = 'break' + 'fast'. You break your overnight fast in the morning!", tier=1},

    -- TIER 2: CAT (Elementary — common usage, simple grammar)
    {id="c01", prompt="Which sentence is correct?", options={"She doesn't like pizza","She don't like pizza","She no like pizza","She not likes pizza"}, correctAnswer="She doesn't like pizza", targetWord="doesnt", explanation="'She doesn't' — use 'doesn't' with he/she/it.", tier=2},
    {id="c02", prompt="What does 'literally' actually mean?", options={"In the exact sense","Figuratively","Maybe","Never"}, correctAnswer="In the exact sense", targetWord="literally", explanation="'Literally' means exactly/actually.", tier=2},
    {id="c03", prompt="Choose the past tense: 'I ___ to school yesterday'", options={"went","go","goes","going"}, correctAnswer="went", targetWord="went", explanation="Go → Went (irregular past tense).", tier=2},
    {id="c04", prompt="'your' vs 'you're'?", options={"your = possession, you're = you are","They're the same","your = you are, you're = possession","Only 'your' is correct"}, correctAnswer="your = possession, you're = you are", targetWord="your_youre", explanation="YOUR book (belongs to you). YOU'RE cool (you are cool).", tier=2},
    {id="c05", prompt="Fill in: 'I have ___ eaten breakfast'", options={"already","yet","ever","still"}, correctAnswer="already", targetWord="already", explanation="'Already' = it's done. 'Yet' = not done (questions/negatives).", tier=2},
    {id="c06", prompt="What does 'sus' mean?", options={"Suspicious","Super","Sudden","Successful"}, correctAnswer="Suspicious", targetWord="sus", explanation="'Sus' = suspicious. Made famous by Among Us!", tier=2},
    {id="c07", prompt="Which is correct?", options={"There are many zombies","There is many zombies","There am many zombies","There be many zombies"}, correctAnswer="There are many zombies", targetWord="there_are", explanation="Many = plural = 'there are'.", tier=2},
    {id="c08", prompt="Fill in: 'She ___ been studying all day'", options={"has","have","had","is"}, correctAnswer="has", targetWord="has_been", explanation="'She has been' — present perfect continuous with she/he/it = 'has'.", tier=2},
    {id="c09", prompt="'then' vs 'than'?", options={"then = time, than = comparison","They're the same","then = comparison, than = time","Only 'then' is real"}, correctAnswer="then = time, than = comparison", targetWord="then_than", explanation="THEN: First this, THEN that. THAN: Better THAN that.", tier=2},
    {id="c10", prompt="Fill in: 'If I ___ you, I'd study more'", options={"were","was","am","is"}, correctAnswer="were", targetWord="subjunctive", explanation="'If I were you' — subjunctive mood.", tier=2},
    {id="c11", prompt="What does 'cap' mean in slang?", options={"A lie","A hat only","A bottle top","Being the best"}, correctAnswer="A lie", targetWord="cap", explanation="'No cap' = no lie, I'm serious.", tier=2},
    {id="c12", prompt="Fill in: 'I wish I ___ fly'", options={"could","can","will","am"}, correctAnswer="could", targetWord="could", explanation="Wishes use past tense: 'I wish I could'.", tier=2},
    {id="c13", prompt="Which word means 'very tired'?", options={"Exhausted","Excited","Exited","Extended"}, correctAnswer="Exhausted", targetWord="exhausted", explanation="Exhausted = extremely tired.", tier=2},
    {id="c14", prompt="'___ going to the store' (their/there/they're)", options={"They're","Their","There","Theyre"}, correctAnswer="They're", targetWord="theyre", explanation="They're = they are. Their = belongs to them. There = a place.", tier=2},
    {id="c15", prompt="Fill in: 'I've been ___ for an hour'", options={"waiting","wait","waited","waits"}, correctAnswer="waiting", targetWord="waiting", explanation="Present perfect continuous: have been + -ing.", tier=2},
    {id="c16", prompt="What does 'low-key' mean?", options={"Secretly/quietly","Very loudly","Sadly","Quickly"}, correctAnswer="Secretly/quietly", targetWord="lowkey", explanation="'Low-key' = secretly or not intensely.", tier=2},
    {id="c17", prompt="Which is an adjective?", options={"Beautiful","Run","Quickly","The"}, correctAnswer="Beautiful", targetWord="adjective", explanation="Adjectives describe nouns: a BEAUTIFUL day.", tier=2},
    {id="c18", prompt="Fill in: 'He ___ to work every day'", options={"goes","go","going","gone"}, correctAnswer="goes", targetWord="goes", explanation="He/She/It + goes (third person -s/-es).", tier=2},
    {id="c19", prompt="What's a synonym for 'happy'?", options={"Joyful","Angry","Sad","Bored"}, correctAnswer="Joyful", targetWord="synonym", explanation="Synonyms = similar meanings. Happy = Joyful!", tier=2},
    {id="c20", prompt="What does 'slay' mean in slang?", options={"To do something really well","To fight with a sword","To sleep","To run away"}, correctAnswer="To do something really well", targetWord="slay", explanation="'Slay' in slang = absolutely crushing it.", tier=2},
    {id="c21", prompt="Fill in: 'Neither you ___ I can go'", options={"nor","or","and","but"}, correctAnswer="nor", targetWord="neither_nor", explanation="Neither...nor (negative pair). Either...or (positive pair).", tier=2},
    {id="c22", prompt="Past tense of 'buy'?", options={"Bought","Buyed","Buied","Boughted"}, correctAnswer="Bought", targetWord="bought", explanation="Buy → Bought. Irregular verbs!", tier=2},
    {id="c23", prompt="Fill in: 'I'm looking forward ___ seeing you'", options={"to","for","at","on"}, correctAnswer="to", targetWord="looking_forward", explanation="'Looking forward TO' — always 'to'.", tier=2},
    {id="c24", prompt="What does 'bussin' mean?", options={"Really good/delicious","Riding a bus","Being busy","Running late"}, correctAnswer="Really good/delicious", targetWord="bussin", explanation="'This food is bussin!' = This food is amazing!", tier=2},
    {id="c25", prompt="'affect' vs 'effect'?", options={"affect = verb, effect = noun","They're the same","affect = noun, effect = verb","Only 'effect' is real"}, correctAnswer="affect = verb, effect = noun", targetWord="affect_effect", explanation="Affect = verb (to influence). Effect = noun (the result).", tier=2},
    {id="c26", prompt="Fill in: 'She speaks English ___ than me'", options={"better","more good","gooder","best"}, correctAnswer="better", targetWord="better", explanation="Good → Better → Best. Not 'more good'!", tier=2},
    {id="c27", prompt="What's an antonym for 'ancient'?", options={"Modern","Old","Historic","Dusty"}, correctAnswer="Modern", targetWord="antonym", explanation="Antonyms = opposite meanings. Ancient ↔ Modern.", tier=2},
    {id="c28", prompt="Fill in: 'I ___ study harder if I had time'", options={"would","will","can","do"}, correctAnswer="would", targetWord="conditional", explanation="Second conditional: If + past, would + base verb.", tier=2},
    {id="c29", prompt="Contraction of 'I have'?", options={"I've","I'v","Iv'","I'ave"}, correctAnswer="I've", targetWord="contraction", explanation="I have → I've. Contractions make English flow!", tier=2},
    {id="c30", prompt="What does 'bet' mean in slang?", options={"Okay/sure/agreement","A gamble only","Being wrong","A challenge"}, correctAnswer="Okay/sure/agreement", targetWord="bet", explanation="'Bet' = okay, sure, I agree.", tier=2},

    -- TIER 3: WOLF (Intermediate — grammar patterns, richer vocabulary)
    {id="w01", prompt="Subjunctive: 'I suggest he ___ harder'", options={"study","studies","to study","studying"}, correctAnswer="study", targetWord="subjunctive_adv", explanation="After suggest/recommend: base form (no -s).", tier=3},
    {id="w02", prompt="What does 'ephemeral' mean?", options={"Lasting a very short time","Extremely large","Very beautiful","Deeply meaningful"}, correctAnswer="Lasting a very short time", targetWord="ephemeral", explanation="Ephemeral = fleeting, short-lived.", tier=3},
    {id="w03", prompt="Fill in: 'By the time you arrive, I ___ finished'", options={"will have","will be","have","had"}, correctAnswer="will have", targetWord="future_perfect", explanation="Future perfect: will have + past participle.", tier=3},
    {id="w04", prompt="'who' vs 'whom'?", options={"who = subject, whom = object","They're identical","who = formal, whom = casual","whom = subject, who = object"}, correctAnswer="who = subject, whom = object", targetWord="who_whom", explanation="WHO did it? (subject). To WHOM? (object). Trick: him→whom, he→who.", tier=3},
    {id="w05", prompt="What does 'pragmatic' mean?", options={"Practical and realistic","Dramatic","Quiet and shy","Fast and energetic"}, correctAnswer="Practical and realistic", targetWord="pragmatic", explanation="Pragmatic = dealing with things practically.", tier=3},
    {id="w06", prompt="Fill in: 'Not only ___ she smart, but also kind'", options={"is","does","was","has"}, correctAnswer="is", targetWord="inversion", explanation="'Not only is she...' — inversion after 'not only'.", tier=3},
    {id="w07", prompt="What's a 'paradigm'?", options={"A model or pattern","A type of graph","A paragraph","A paradox"}, correctAnswer="A model or pattern", targetWord="paradigm", explanation="Paradigm = a framework. 'Paradigm shift' = fundamental change.", tier=3},
    {id="w08", prompt="'Each of the students ___ a book'", options={"has","have","having","had"}, correctAnswer="has", targetWord="each", explanation="'Each' = singular. Each student HAS.", tier=3},
    {id="w09", prompt="What does 'juxtaposition' mean?", options={"Placing side by side to compare","Putting in order","Destroying","Agreeing"}, correctAnswer="Placing side by side to compare", targetWord="juxtaposition", explanation="Juxtaposition = placing two things together to show contrast.", tier=3},
    {id="w10", prompt="Fill in: 'Had I known, I ___ have come earlier'", options={"would","will","could","should"}, correctAnswer="would", targetWord="third_conditional", explanation="Third conditional: Had + PP, would have + PP.", tier=3},
    {id="w11", prompt="Noun form of 'decide'?", options={"Decision","Decisive","Decidedly","Deciding"}, correctAnswer="Decision", targetWord="nominalization", explanation="Decide (verb) → Decision (noun). Word families!", tier=3},
    {id="w12", prompt="Fill in: 'I'd rather you ___ here'", options={"stayed","stay","staying","stays"}, correctAnswer="stayed", targetWord="rather", explanation="'I'd rather + person + past tense.'", tier=3},
    {id="w13", prompt="What does 'ambiguous' mean?", options={"Having more than one meaning","Very clear","Dangerous","Wrong"}, correctAnswer="Having more than one meaning", targetWord="ambiguous", explanation="Ambiguous = unclear, could mean multiple things.", tier=3},
    {id="w14", prompt="Correct semicolon use?", options={"I love games; they teach me English","I love; games they teach me","I love games; and they teach","I; love games they teach me"}, correctAnswer="I love games; they teach me English", targetWord="semicolon", explanation="Semicolons connect two related independent clauses.", tier=3},
    {id="w15", prompt="What's 'cognitive dissonance'?", options={"Mental discomfort from conflicting beliefs","A type of music","Extreme intelligence","Memory loss"}, correctAnswer="Mental discomfort from conflicting beliefs", targetWord="cognitive_dissonance", explanation="Believing two contradictory things creates mental tension.", tier=3},
    {id="w16", prompt="Fill in: 'Hardly ___ I arrived when it rained'", options={"had","have","did","was"}, correctAnswer="had", targetWord="inversion_hardly", explanation="'Hardly had I...' — negative adverb + inversion.", tier=3},
    {id="w17", prompt="What's a 'euphemism'?", options={"A mild word replacing a harsh one","A compliment","A grammar error","A loud statement"}, correctAnswer="A mild word replacing a harsh one", targetWord="euphemism", explanation="'Passed away' instead of 'died' — that's a euphemism.", tier=3},
    {id="w18", prompt="Which has a dangling modifier?", options={"Walking to school, the rain started","While I walked, it rained","The rain started while I walked","I walked and it rained"}, correctAnswer="Walking to school, the rain started", targetWord="dangling_modifier", explanation="Who was walking? The rain? The modifier 'dangles.'", tier=3},
    {id="w19", prompt="What does 'eloquent' mean?", options={"Fluent and persuasive","Very quiet","Extremely fast","Deeply confused"}, correctAnswer="Fluent and persuasive", targetWord="eloquent", explanation="An eloquent speaker makes words flow beautifully.", tier=3},
    {id="w20", prompt="Fill in: 'The more you practice, the ___ you get'", options={"better","more better","best","good"}, correctAnswer="better", targetWord="comparative_pattern", explanation="The more...the better. Never 'more better'!", tier=3},

    -- TIER 4: LION (Advanced — idioms, nuance, sophisticated grammar)
    {id="l01", prompt="What does 'break a leg' mean?", options={"Good luck","Get injured","Stop trying","Run fast"}, correctAnswer="Good luck", targetWord="idiom_breakaleg", explanation="'Break a leg!' = Good luck! (Theater superstition.)", tier=4},
    {id="l02", prompt="What's an 'oxymoron'?", options={"Two contradictory words together","A smart person","A chemical","A long sentence"}, correctAnswer="Two contradictory words together", targetWord="oxymoron", explanation="'Jumbo shrimp', 'deafening silence' — contradictions together.", tier=4},
    {id="l03", prompt="What does 'ubiquitous' mean?", options={"Found everywhere","Extremely rare","Very loud","Quite small"}, correctAnswer="Found everywhere", targetWord="ubiquitous", explanation="Smartphones are ubiquitous — everywhere you look.", tier=4},
    {id="l04", prompt="'It's essential that he ___ there'", options={"be","is","was","were"}, correctAnswer="be", targetWord="mandative_subjunctive", explanation="After 'essential that...' use base form: 'that he BE there'.", tier=4},
    {id="l05", prompt="What does 'sanguine' mean?", options={"Optimistic and positive","Bloody and violent","Dark and gloomy","Quiet and calm"}, correctAnswer="Optimistic and positive", targetWord="sanguine", explanation="Sanguine = cheerfully optimistic.", tier=4},
    {id="l06", prompt="What's a 'non sequitur'?", options={"A conclusion that doesn't follow logically","A math proof","A type of sequel","A musical note"}, correctAnswer="A conclusion that doesn't follow logically", targetWord="non_sequitur", explanation="Latin: 'it does not follow.' A random logical jump.", tier=4},
    {id="l07", prompt="What does 'gaslighting' mean?", options={"Manipulating someone to question reality","Lighting gas lamps","Lying once","Being confused"}, correctAnswer="Manipulating someone to question reality", targetWord="gaslighting", explanation="Making someone doubt their own memory and perception.", tier=4},
    {id="l08", prompt="Fill in: 'Were he to arrive, we ___ begin'", options={"would","will","can","do"}, correctAnswer="would", targetWord="inverted_conditional", explanation="'Were he to...' = 'If he were to...' — formal inverted conditional.", tier=4},
    {id="l09", prompt="What does 'perfunctory' mean?", options={"Done without care","Done perfectly","Done with energy","Done secretly"}, correctAnswer="Done without care", targetWord="perfunctory", explanation="A perfunctory handshake — quick, careless, going through the motions.", tier=4},
    {id="l10", prompt="What's 'Occam's Razor'?", options={"Simplest explanation is usually correct","A type of knife","A logical fallacy","A debate technique"}, correctAnswer="Simplest explanation is usually correct", targetWord="occams_razor", explanation="Don't multiply explanations beyond necessity.", tier=4},
    {id="l11", prompt="What does 'dichotomy' mean?", options={"A division into two contrasting parts","A type of dictionary","A surgical procedure","A chemical reaction"}, correctAnswer="A division into two contrasting parts", targetWord="dichotomy", explanation="Good vs. Evil is a dichotomy.", tier=4},
    {id="l12", prompt="What's 'synergy'?", options={"Combined effect greater than sum of parts","An energy drink","Working alone","Musical harmony"}, correctAnswer="Combined effect greater than sum of parts", targetWord="synergy", explanation="1 + 1 = 3. That's synergy.", tier=4},
    {id="l13", prompt="What does 'anachronism' mean?", options={"Something from the wrong time period","A type of anarchy","A spelling error","An instrument"}, correctAnswer="Something from the wrong time period", targetWord="anachronism", explanation="A knight wearing a wristwatch = anachronism.", tier=4},
    {id="l14", prompt="'imply' vs 'infer'?", options={"imply = suggest, infer = conclude","They're the same","imply = conclude, infer = suggest","Only 'imply' is real"}, correctAnswer="imply = suggest, infer = conclude", targetWord="imply_infer", explanation="Speaker IMPLIES. Listener INFERS.", tier=4},
    {id="l15", prompt="What does 'sardonic' mean?", options={"Grimly mocking or cynical","Very happy","Deeply sad","Extremely confused"}, correctAnswer="Grimly mocking or cynical", targetWord="sardonic", explanation="A sardonic smile — dark and mocking.", tier=4},
    {id="l16", prompt="What's a 'red herring'?", options={"Something that misleads","A type of fish","An angry statement","A logical proof"}, correctAnswer="Something that misleads", targetWord="red_herring", explanation="A red herring is a false clue that distracts from the truth.", tier=4},
    {id="l17", prompt="What does 'vicarious' mean?", options={"Experienced through someone else","Extremely violent","Very viscous","Deeply vicious"}, correctAnswer="Experienced through someone else", targetWord="vicarious", explanation="Living vicariously = experiencing someone else's life.", tier=4},
    {id="l18", prompt="What's 'Dunning-Kruger effect'?", options={"Unskilled people overestimate ability","Skilled people overestimate others","An optical illusion","A memory technique"}, correctAnswer="Unskilled people overestimate ability", targetWord="dunning_kruger", explanation="The less you know, the more confident you feel.", tier=4},
    {id="l19", prompt="Fill in: 'So engrossed ___ he that he forgot to eat'", options={"was","is","had","did"}, correctAnswer="was", targetWord="so_inversion", explanation="'So + adj + was + subject' — dramatic inversion.", tier=4},
    {id="l20", prompt="Fill in: 'Scarcely ___ she spoken when the door opened'", options={"had","has","did","was"}, correctAnswer="had", targetWord="inversion_scarcely", explanation="Scarcely had + subject + past participle.", tier=4},

    -- TIER 5: TIGER (Mastery — literary devices, philosophy, deep nuance)
    {id="t01", prompt="Identify: 'The wind whispered through the trees'", options={"Personification","Simile","Metaphor","Alliteration"}, correctAnswer="Personification", targetWord="personification", explanation="Giving human qualities to non-human things.", tier=5},
    {id="t02", prompt="'irony' vs 'coincidence'?", options={"Irony = opposite of expected; coincidence = random","They're the same","Irony = funny; coincidence = sad","Irony = planned; coincidence = natural"}, correctAnswer="Irony = opposite of expected; coincidence = random", targetWord="irony", explanation="Fire station burning = ironic. Meeting a friend randomly = coincidence.", tier=5},
    {id="t03", prompt="What's a 'chiasmus'?", options={"Reversed parallel structure (ABBA)","A type of cactus","A Greek god","A musical chord"}, correctAnswer="Reversed parallel structure (ABBA)", targetWord="chiasmus", explanation="'Ask not what your country can do for you...' — JFK. AB→BA.", tier=5},
    {id="t04", prompt="What does 'verisimilitude' mean?", options={"The appearance of being true","Extreme speed","Perfect similarity","Absolute truth"}, correctAnswer="The appearance of being true", targetWord="verisimilitude", explanation="Good fiction has verisimilitude — it FEELS real.", tier=5},
    {id="t05", prompt="What's a 'paradox'?", options={"A self-contradicting truth","A type of paradise","Two parallel lines","A math proof"}, correctAnswer="A self-contradicting truth", targetWord="paradox", explanation="'I know that I know nothing.' — Socrates.", tier=5},
    {id="t06", prompt="What's 'litotes'?", options={"Understatement via double negatives","A type of stone","Exaggeration","A logical fallacy"}, correctAnswer="Understatement via double negatives", targetWord="litotes", explanation="'Not bad' meaning 'good.' Understatement by negating the opposite.", tier=5},
    {id="t07", prompt="What does 'solipsism' mean?", options={"Only one's own mind is certain","Study of the sun","A solo performance","Extreme loneliness"}, correctAnswer="Only one's own mind is certain", targetWord="solipsism", explanation="Only your mind is sure to exist. Everything else MIGHT be illusion.", tier=5},
    {id="t08", prompt="What's an 'unreliable narrator'?", options={"A narrator with compromised credibility","A quiet narrator","An author who makes mistakes","A character who lies once"}, correctAnswer="A narrator with compromised credibility", targetWord="unreliable_narrator", explanation="You can't trust their version. 'Gone Girl', 'Fight Club.'", tier=5},
    {id="t09", prompt="What does 'Kafkaesque' mean?", options={"Nightmarishly complex and illogical","Very beautiful","Extremely simple","Deeply peaceful"}, correctAnswer="Nightmarishly complex and illogical", targetWord="kafkaesque", explanation="Bureaucracy so absurd it feels like a nightmare.", tier=5},
    {id="t10", prompt="What's 'anaphora'?", options={"Repetition at the start of clauses","A type of allergy","Referring back","A rhetorical question"}, correctAnswer="Repetition at the start of clauses", targetWord="anaphora", explanation="'I have a dream... I have a dream...' — MLK.", tier=5},
    {id="t11", prompt="What does 'epistemology' mean?", options={"The study of knowledge itself","Study of diseases","Study of letters","Study of episodes"}, correctAnswer="The study of knowledge itself", targetWord="epistemology", explanation="How do we KNOW things? That's epistemology.", tier=5},
    {id="t12", prompt="What's 'pathetic fallacy'?", options={"Attributing emotions to nature","A logical error","Being overly emotional","A sad mistake"}, correctAnswer="Attributing emotions to nature", targetWord="pathetic_fallacy", explanation="'The angry storm' — nature doesn't feel anger.", tier=5},
    {id="t13", prompt="What does 'sycophant' mean?", options={"A person who flatters for gain","A type of elephant","An instrument","A wise philosopher"}, correctAnswer="A person who flatters for gain", targetWord="sycophant", explanation="Tells you what you want to hear for their own benefit.", tier=5},
    {id="t14", prompt="What's 'metonymy'?", options={"Using a related word as substitute","A type of memory","Extremely small","A math method"}, correctAnswer="Using a related word as substitute", targetWord="metonymy", explanation="'The pen is mightier than the sword' — pen = writing, sword = war.", tier=5},
    {id="t15", prompt="'sympathy' vs 'empathy'?", options={"Sympathy = feeling for; empathy = feeling with","They're the same","Sympathy = feeling with; empathy = feeling for","Only empathy is real"}, correctAnswer="Sympathy = feeling for; empathy = feeling with", targetWord="sympathy_empathy", explanation="Sympathy: 'I feel sorry FOR you.' Empathy: 'I feel what you feel.'", tier=5},
    {id="t16", prompt="What does 'zeitgeist' mean?", options={"The spirit of an era","A type of ghost","A German greeting","A time machine"}, correctAnswer="The spirit of an era", targetWord="zeitgeist", explanation="German: Zeit (time) + Geist (spirit). The cultural vibe of an era.", tier=5},
    {id="t17", prompt="What's 'synecdoche'?", options={"A part representing the whole","A type of syndrome","A Greek city","A musical scale"}, correctAnswer="A part representing the whole", targetWord="synecdoche", explanation="'All hands on deck!' — hands = people.", tier=5},
    {id="t18", prompt="What does 'ontological' relate to?", options={"The nature of existence","Study of sounds","Medical treatment","Online technology"}, correctAnswer="The nature of existence", targetWord="ontological", explanation="What DOES it mean to exist? Ontology.", tier=5},
    {id="t19", prompt="What's 'dramatic irony'?", options={"Audience knows what characters don't","Actors are too dramatic","A play has a twist","Dialogue is ironic"}, correctAnswer="Audience knows what characters don't", targetWord="dramatic_irony", explanation="You KNOW the killer is behind the door but the character doesn't.", tier=5},
    {id="t20", prompt="What does 'apotheosis' mean?", options={"The highest point/becoming godlike","A type of disease","The lowest point","A hypothesis"}, correctAnswer="The highest point/becoming godlike", targetWord="apotheosis", explanation="The peak, the moment of ultimate glory. Literally: becoming a god.", tier=5},
}

-- Build indexes
local questionById = {}
local questionsByTier = { {}, {}, {}, {}, {} }

for _, q in ipairs(questions) do
    questionById[q.id] = q
    local tier = q.tier or 1
    if tier >= 1 and tier <= 5 then
        table.insert(questionsByTier[tier], q)
    end
end

function QuestionBank.GetQuestion(tier, mastered, struggling)
    tier = math.max(1, math.min(5, tier or 1))
    local pool = questionsByTier[tier]
    if not pool or #pool == 0 then
        pool = questionsByTier[1]
    end
    
    -- Prioritize struggling words (adaptive — keeps them playing longer)
    if struggling then
        for _, q in ipairs(pool) do
            if q.targetWord and struggling[q.targetWord] and (struggling[q.targetWord] >= 2) then
                if math.random() < 0.5 then
                    return QuestionBank._shuffleOptions(q)
                end
            end
        end
    end
    
    -- Deprioritize mastered words
    local unmastered = {}
    for _, q in ipairs(pool) do
        if not mastered or not mastered[q.targetWord] or mastered[q.targetWord] < 3 then
            table.insert(unmastered, q)
        end
    end
    
    local source = #unmastered > 0 and unmastered or pool
    local selected = source[math.random(#source)]
    return QuestionBank._shuffleOptions(selected)
end

function QuestionBank.ValidateAnswer(questionId, answer)
    local q = questionById[questionId]
    if not q then return false end
    local correct = string.lower(tostring(q.correctAnswer)):gsub("^%s+", ""):gsub("%s+$", "")
    local given = string.lower(tostring(answer)):gsub("^%s+", ""):gsub("%s+$", "")
    return correct == given
end

function QuestionBank.GetStats()
    local stats = {}
    for tier = 1, 5 do
        stats[tier] = #questionsByTier[tier]
    end
    stats.total = #questions
    return stats
end

function QuestionBank._shuffleOptions(question)
    local q = {}
    for k, v in pairs(question) do
        q[k] = v
    end
    if q.options and #q.options > 1 then
        local shuffled = {}
        for _, opt in ipairs(q.options) do
            table.insert(shuffled, opt)
        end
        for i = #shuffled, 2, -1 do
            local j = math.random(i)
            shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
        end
        q.options = shuffled
    end
    return q
end

return QuestionBank
