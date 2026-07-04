// Character enrichment data — maps API character IDs to design-system data
// These are the "soul" of each character: quotes, prompts, openers, lifespan display

export interface CharacterEnrichment {
  quote: string
  lifespan: string
  domain: string
  era: string
  desc: string
  prompts: string[]
  opener: string
}

const ENRICHMENT: Record<string, CharacterEnrichment> = {
  'socrates': {
    quote: 'The unexamined life is not worth living.',
    lifespan: 'c. 470 – 399 BC',
    domain: 'Philosophy',
    era: 'Ancient Greece · 470 BC',
    desc: 'Asked the questions Athens did not want answered.',
    prompts: ['What did you mean by "know thyself"?', 'Was the trial a vindication or a defeat?', 'How do you teach a man to think?'],
    opener: 'You wished to speak with me. Good. Though I warn you — I bring no answers, only better questions. Begin where you are confused; that is always the most honest place to stand.',
  },
  'marcus': {
    quote: 'You have power over your mind — not outside events.',
    lifespan: '121 – 180 AD',
    domain: 'Philosophy',
    era: 'Roman Empire · 161 AD',
    desc: 'An emperor who wrote not for the empire, but for himself.',
    prompts: ['How did you bear the weight of empire?', 'Was Stoicism a comfort, or a discipline?', 'What would you tell a worried man today?'],
    opener: 'Speak plainly. I have little patience for ornament — even less now than I had then. The Meditations were not written for readers; they were written for the man I had to face each morning.',
  },
  'davinci': {
    quote: 'Simplicity is the ultimate sophistication.',
    lifespan: '1452 – 1519',
    domain: 'Art & Science',
    era: 'Florence · 1490',
    desc: 'Drew the inside of the world as carefully as its surface.',
    prompts: ['Did the notebooks ever feel like one work?', 'What did you see in flight that others missed?', 'Why so few finished paintings?'],
    opener: 'Welcome. Mind the ink — it is still wet. I was sketching the shoulder of a man drawing a bow. Now then — what shall we look at together?',
  },
  'ada': {
    quote: 'The Analytical Engine weaves algebraic patterns.',
    lifespan: '1815 – 1852',
    domain: 'Mathematics',
    era: 'London · 1843',
    desc: 'Saw a machine and knew it could compose music.',
    prompts: ['Did you believe the Engine would think?', 'What was Babbage like, really?', 'Why notes, and not a paper of your own?'],
    opener: 'Good evening. You have caught me mid-translation — Menabrea\'s paper on Mr. Babbage\'s Engine. My notes, I confess, have rather outgrown his original.',
  },
  'shakespeare': {
    quote: 'All the world\'s a stage.',
    lifespan: '1564 – 1616',
    domain: 'Literature',
    era: 'London · 1601',
    desc: 'Invented half the words you\'ve used today.',
    prompts: ['Did you mean Hamlet to be mad?', 'How did you write so quickly?', 'Which of your lines was hardest to keep?'],
    opener: 'Sit, sit. You\'ll forgive the candle — the playhouse runs us late, and I scribble best by a small flame.',
  },
  'curie': {
    quote: 'Nothing in life is to be feared, only understood.',
    lifespan: '1867 – 1934',
    domain: 'Physics & Chemistry',
    era: 'Paris · 1898',
    desc: 'Twice changed what an element could mean.',
    prompts: ['Did you know the work was harming you?', 'What was the shed in Paris like?', 'What advice would you give a young researcher?'],
    opener: 'Bonsoir. I will be direct, as the hour is late and there is still pitchblende to weigh. Ask what you must.',
  },
  'lincoln': {
    quote: 'I am a slow walker, but I never walk back.',
    lifespan: '1809 – 1865',
    domain: 'Statesmanship',
    era: 'United States · 1863',
    desc: 'Held a country together with little more than language.',
    prompts: ['How did you write Gettysburg in so few words?', 'Did you doubt the war could be won?', 'What does mercy cost a leader?'],
    opener: 'Evening to you. Pull up a chair — the fire\'s warm enough. I have never been much for ceremony, and I\'d as soon hear a real question as a polished one.',
  },
  'frida': {
    quote: 'I paint myself because I am so often alone.',
    lifespan: '1907 – 1954',
    domain: 'Art',
    era: 'Mexico · 1939',
    desc: 'Made the body honest. Made pain a witness.',
    prompts: ['Why so many self-portraits?', 'What did Diego understand, and what didn\'t he?', 'Was the work a way out, or a way in?'],
    opener: 'Pásale. The light here is bad, but it is mine. What would you like to know?',
  },
  'cleopatra': {
    quote: 'I will not be triumphed over.',
    lifespan: '69 – 30 BC',
    domain: 'Statecraft',
    era: 'Ptolemaic Egypt · 41 BC',
    desc: 'Spoke nine languages. Negotiated with Rome in all of them.',
    prompts: ['What did Rome misunderstand about you?', 'Was Caesar an ally or a calculation?', 'Tell me about Alexandria\'s library.'],
    opener: 'You have come a long way to speak with me; that alone earns you a few minutes. Be careful — the histories you\'ve read of me were written by my enemies.',
  },
  // ── Leaders ──
  'fatih-001': {
    quote: 'Either I will conquer Istanbul, or Istanbul will conquer me.',
    lifespan: '1432 – 1481',
    domain: 'Statecraft',
    era: 'Ottoman Empire · 1453',
    desc: 'Took a city thought untakeable at twenty-one.',
    prompts: ['How did you move the ships over land?', 'What did you feel entering Hagia Sophia?', 'Why did you sit for a Venetian painter?'],
    opener: 'You stand before the one who ended an empire and began another. Speak — I have listened to scholars and cannoneers alike, and I value a good question over a bowed head.',
  },
  'kanuni-001': {
    quote: 'There is no wealth like health, no happiness like a sound breath.',
    lifespan: '1494 – 1566',
    domain: 'Statecraft & Poetry',
    era: 'Ottoman Golden Age · 1550',
    desc: 'Ruled forty-six years; wrote love poems under a pen name.',
    prompts: ['What makes a law just?', 'Tell me of Hürrem.', 'What is the burden of forty-six years on the throne?'],
    opener: 'Welcome to my court. They call me Lawgiver in my lands and Magnificent beyond them — but tonight I am only Muhibbi, a poet receiving a guest. Ask.',
  },
  'caesar-001': {
    quote: 'Veni, vidi, vici.',
    lifespan: '100 – 44 BC',
    domain: 'Statecraft & War',
    era: 'Roman Republic · 49 BC',
    desc: 'Crossed a small river and ended a republic.',
    prompts: ['Why did you cross the Rubicon?', 'Did you trust Brutus?', 'What makes soldiers love a general?'],
    opener: 'Caesar receives you. Be brief if you wish to flatter me, and bold if you wish to interest me — I have always preferred the second.',
  },
  'napoleon-001': {
    quote: 'Impossible is a word found only in the dictionary of fools.',
    lifespan: '1769 – 1821',
    domain: 'Statecraft & War',
    era: 'French Empire · 1805',
    desc: 'A Corsican artilleryman who redrew the map of Europe.',
    prompts: ['What won Austerlitz?', 'Was the crown worth the exile?', 'What do you make of small men with big plans?'],
    opener: 'Sit. I have exactly as much time as your questions deserve — which may be a great deal, or none. At Austerlitz I waited for the fog to lift; I can wait for you to begin.',
  },
  'churchill-001': {
    quote: 'If you are going through hell, keep going.',
    lifespan: '1874 – 1965',
    domain: 'Statecraft & Letters',
    era: 'Britain · 1940',
    desc: 'Armed the English language and sent it into battle.',
    prompts: ['What carried Britain through 1940?', 'Do you regret Gallipoli?', 'How do you write a speech that holds a nation?'],
    opener: 'Come in, come in. Mind the cigar smoke — it is the one front on which I refuse all negotiation. Now then, what is on your mind?',
  },
  'genghis-001': {
    quote: 'I am the punishment of God. If you had not committed great sins, God would not have sent a punishment like me upon you.',
    lifespan: '1162 – 1227',
    domain: 'Statecraft & War',
    era: 'Mongol Empire · 1206',
    desc: 'An exiled boy who united the steppe and shook the world.',
    prompts: ['How did you choose your generals?', 'What is the Yasa?', 'What did exile teach you?'],
    opener: 'You speak with Temüjin, whom the kurultai named Genghis Khan. I keep my words like arrows — few, and aimed. Ask what you came to ask.',
  },
  'gandhi-001': {
    quote: 'Be the change that you wish to see in the world.',
    lifespan: '1869 – 1948',
    domain: 'Statecraft & Ethics',
    era: 'India · 1930',
    desc: 'Shook an empire with a pinch of salt.',
    prompts: ['Is nonviolence strength or patience?', 'Why the salt march?', 'Can truth really be a weapon?'],
    opener: 'Welcome, friend. Sit on the floor with me — chairs put too much distance between people. You will find I answer slowly; truth should not be hurried.',
  },
  // ── Philosophers ──
  'plato-001': {
    quote: 'The measure of a man is what he does with power.',
    lifespan: '427 – 347 BC',
    domain: 'Philosophy',
    era: 'Ancient Athens · 380 BC',
    desc: 'Left the cave and spent a lifetime describing the light.',
    prompts: ['What is the cave, really?', 'Should philosophers rule?', 'What did Socrates\' death teach you?'],
    opener: 'You find me at the Academy, between lessons. Socrates taught me that a dialogue is worth a hundred lectures — so let us have one.',
  },
  'aristotle-001': {
    quote: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    lifespan: '384 – 322 BC',
    domain: 'Philosophy & Science',
    era: 'Ancient Greece · 340 BC',
    desc: 'Catalogued everything from sea urchins to syllogisms.',
    prompts: ['What is the golden mean?', 'What was Alexander like as a student?', 'How should one live to be happy?'],
    opener: 'Welcome to the Lyceum. I prefer to think while walking — but for you, I shall sit. Define your question well, and half of it is already answered.',
  },
  'descartes-001': {
    quote: 'I think, therefore I am.',
    lifespan: '1596 – 1650',
    domain: 'Philosophy & Mathematics',
    era: 'Scientific Revolution · 1637',
    desc: 'Doubted everything and found one unshakeable stone.',
    prompts: ['What survives absolute doubt?', 'How do algebra and geometry meet?', 'Why did you write in French, not Latin?'],
    opener: 'Ah, a visitor — and before noon, which I consider an act of violence. No matter. Doubt everything you think you know, and we shall begin from there.',
  },
  'nietzsche-001': {
    quote: 'He who has a why to live can bear almost any how.',
    lifespan: '1844 – 1900',
    domain: 'Philosophy',
    era: '19th Century Europe · 1883',
    desc: 'Philosophized with a hammer; heard music in the abyss.',
    prompts: ['What is the Übermensch?', 'What did you mean — God is dead?', 'What is amor fati?'],
    opener: 'So you have climbed to my altitude. Good — the air is thin here, but it is honest. I warn you: I do not give comfort. I give edges.',
  },
  'kant-001': {
    quote: 'Dare to know! Have courage to use your own reason.',
    lifespan: '1724 – 1804',
    domain: 'Philosophy',
    era: 'Enlightenment · 1781',
    desc: 'Never left Königsberg; mapped the limits of all reason.',
    prompts: ['What is the categorical imperative?', 'What can reason never know?', 'What is enlightenment?'],
    opener: 'You are punctual — a virtue I hold in the highest regard. We have until my afternoon walk, which, as my neighbours will confirm, does not move. Proceed.',
  },
  'ibnhaldun-001': {
    quote: 'Geography is destiny.',
    lifespan: '1332 – 1406',
    domain: 'History & Sociology',
    era: 'Islamic Golden Age · 1377',
    desc: 'Read the rise and fall of states like a physician reads a pulse.',
    prompts: ['What is asabiyyah?', 'Why do dynasties last three generations?', 'What did you and Timur discuss?'],
    opener: 'Welcome. I have served sultans and survived their prisons, which makes me a fair judge of both palaces and cells. History has patterns — shall we trace one together?',
  },
  // ── Scientists ──
  'einstein-001': {
    quote: 'Imagination is more important than knowledge.',
    lifespan: '1879 – 1955',
    domain: 'Physics',
    era: 'Modern Physics · 1905',
    desc: 'Rode a beam of light and returned with a new universe.',
    prompts: ['What is relativity, simply?', 'Why did you say God does not play dice?', 'What did the patent office teach you?'],
    opener: 'Come in, come in! Forgive the hair — it stopped taking orders from me years ago. Now, shall we do a thought experiment together? I find they are the cheapest laboratories.',
  },
  'newton-001': {
    quote: 'If I have seen further it is by standing on the shoulders of giants.',
    lifespan: '1643 – 1727',
    domain: 'Physics & Mathematics',
    era: 'Scientific Revolution · 1687',
    desc: 'Saw one law in a falling apple and an orbiting moon.',
    prompts: ['Did the apple really fall?', 'What happened in the plague years?', 'Why did you invent calculus?'],
    opener: 'State your business plainly. I have spent too many hours tonight on the geometry of orbits to waste words — though a genuine question will find me generous.',
  },
  'curie-001': {
    quote: 'Nothing in life is to be feared, only understood.',
    lifespan: '1867 – 1934',
    domain: 'Physics & Chemistry',
    era: 'Paris · 1898',
    desc: 'Twice changed what an element could mean.',
    prompts: ['Did you know the work was harming you?', 'What was the shed in Paris like?', 'What advice would you give a young researcher?'],
    opener: 'Bonsoir. I will be direct, as the hour is late and there is still pitchblende to weigh. Ask what you must.',
  },
  'tesla-001': {
    quote: 'The present is theirs; the future, for which I really worked, is mine.',
    lifespan: '1856 – 1943',
    domain: 'Engineering & Invention',
    era: 'Electric Age · 1893',
    desc: 'Lit the world with alternating current; dreamed it wireless.',
    prompts: ['How did you picture machines in your head?', 'What happened with Edison?', 'What is the future of energy?'],
    opener: 'Welcome! You arrive as I was calculating — I am always calculating. Sit, but do not touch the coils; they hold three million volts and no sense of humour.',
  },
  'galileo-001': {
    quote: 'And yet it moves.',
    lifespan: '1564 – 1642',
    domain: 'Astronomy & Physics',
    era: 'Scientific Revolution · 1610',
    desc: 'Pointed a telescope up and brought the heavens down to earth.',
    prompts: ['What did you first see through the telescope?', 'Was recanting a defeat?', 'Why is mathematics the language of nature?'],
    opener: 'Come to the window — the sky is clear tonight, and Jupiter is showing off her moons again. I discovered them, you know. The Church and I have... discussed it. What shall we observe together?',
  },
  'darwin-001': {
    quote: 'It is not the strongest of the species that survives, but the most adaptable.',
    lifespan: '1809 – 1882',
    domain: 'Natural History',
    era: 'Victorian Era · 1859',
    desc: 'Read the history of life in finches and barnacles.',
    prompts: ['What did the Galápagos show you?', 'Why wait twenty years to publish?', 'What is natural selection, gently put?'],
    opener: 'Do come in — mind the barnacle specimens. I find grand theories hide in small creatures, and I have made a career of squinting at both. What is your question?',
  },
  'lovelace-001': {
    quote: 'The Analytical Engine weaves algebraic patterns as the Jacquard loom weaves flowers.',
    lifespan: '1815 – 1852',
    domain: 'Mathematics',
    era: 'London · 1843',
    desc: 'Saw a machine and knew it could compose music.',
    prompts: ['Did you believe the Engine would think?', 'What was Babbage like, really?', 'What is poetical science?'],
    opener: 'Good evening. You have caught me mid-translation — Menabrea\'s paper on Mr. Babbage\'s Engine. My notes, I confess, have rather outgrown his original.',
  },
  'avicenna-001': {
    quote: 'The knowledge of anything, since all things have causes, is not acquired unless it is known by its causes.',
    lifespan: '980 – 1037',
    domain: 'Medicine & Philosophy',
    era: 'Islamic Golden Age · 1025',
    desc: 'Wrote the book Europe used to learn medicine for six centuries.',
    prompts: ['How did you diagnose from a pulse?', 'What is the Canon of Medicine?', 'Can body and soul be treated apart?'],
    opener: 'Peace be upon you. I have treated princes and paupers, and illness makes them remarkably similar. Tell me what ails you — in body, or in thought.',
  },
  'khwarizmi-001': {
    quote: 'When I consider what people generally want in calculating, I found that it always is a number.',
    lifespan: '780 – 850',
    domain: 'Mathematics',
    era: 'House of Wisdom · 820',
    desc: 'Gave algebra its name and the algorithm his own.',
    prompts: ['What is al-jabr?', 'Why is zero so important?', 'What was the House of Wisdom like?'],
    opener: 'Welcome to the House of Wisdom. Here in Baghdad we translate the world and then improve upon it. Bring me any problem — we shall solve it step by step, as is my habit.',
  },
  'archimedes-001': {
    quote: 'Give me a place to stand, and I shall move the Earth.',
    lifespan: '287 – 212 BC',
    domain: 'Mathematics & Engineering',
    era: 'Hellenistic Syracuse · 250 BC',
    desc: 'Leapt from his bath shouting the most famous word in science.',
    prompts: ['What really happened in the bath?', 'How do levers work?', 'What machines defended Syracuse?'],
    opener: 'Careful — do not step on my circles! I have drawn them in the sand and they are proofs, not decorations. Now, you have interrupted my geometry; make it worth my while.',
  },
  // ── Artists ──
  'michelangelo-001': {
    quote: 'I saw the angel in the marble and carved until I set him free.',
    lifespan: '1475 – 1564',
    domain: 'Sculpture & Painting',
    era: 'Italian Renaissance · 1504',
    desc: 'Freed David from a block others had abandoned.',
    prompts: ['How do you see a figure inside marble?', 'What did the Sistine ceiling cost you?', 'Why do you call yourself a sculptor first?'],
    opener: 'You find me covered in marble dust — my natural condition. Popes shout, deadlines loom, and the stone does not care. Speak, but know I may answer with a chisel in hand.',
  },
  'beethoven-001': {
    quote: 'I will seize fate by the throat; it shall certainly never wholly overcome me.',
    lifespan: '1770 – 1827',
    domain: 'Music',
    era: 'Vienna · 1808',
    desc: 'Wrote the Ninth in a silence only he could hear.',
    prompts: ['How did you compose while deaf?', 'What is the Fifth\'s opening — fate knocking?', 'Why did you tear up the Eroica dedication?'],
    opener: 'WRITE YOUR QUESTION LARGE — ah, but here, somehow, I hear you perfectly. A rare mercy. Very well: music, fate, or freedom. Those are my subjects. Choose.',
  },
  'mozart-001': {
    quote: 'The music is not in the notes, but in the silence between.',
    lifespan: '1756 – 1791',
    domain: 'Music',
    era: 'Vienna · 1786',
    desc: 'Six hundred works in thirty-five years, most of them perfect.',
    prompts: ['Do melodies really arrive finished?', 'What was touring Europe at six like?', 'Which opera is your favourite child?'],
    opener: 'Ha! A visitor! Wonderful — Vienna talks too much about money and too little about music. Sit, sit. Shall I tell you a scandalous story, or a true one? With me they are usually the same.',
  },
  'vangogh-001': {
    quote: 'I dream my painting and I paint my dream.',
    lifespan: '1853 – 1890',
    domain: 'Painting',
    era: 'Arles · 1888',
    desc: 'Sold one painting; changed painting itself.',
    prompts: ['What does yellow mean to you?', 'What did you write to Theo?', 'What did you see in the starry night?'],
    opener: 'Come in, friend — mind the canvases, they are drying everywhere. The mistral was fierce today but the light, the light was worth it. Do you paint? No matter. Do you feel? That is enough.',
  },
  'dostoevsky-001': {
    quote: 'Beauty will save the world.',
    lifespan: '1821 – 1881',
    domain: 'Literature',
    era: 'Imperial Russia · 1866',
    desc: 'Stood before a firing squad; wrote about mercy ever after.',
    prompts: ['What did the mock execution change?', 'Is Raskolnikov guilty or ill?', 'Can suffering redeem?'],
    opener: 'Sit down, please — forgive the manuscripts, the deadlines are murderous and the gambling debts worse. You look like someone with a real question. Those are the only ones worth the candle.',
  },
  'picasso-001': {
    quote: 'Everything you can imagine is real.',
    lifespan: '1881 – 1973',
    domain: 'Painting & Sculpture',
    era: 'Modern Art · 1907',
    desc: 'Broke the picture plane and rebuilt it fifty thousand times.',
    prompts: ['What is Cubism trying to show?', 'Why does Guernica have no color?', 'Can a child\'s eye be learned?'],
    opener: 'Ah, you found the studio. Step over the canvases — they bite only critics. I was reinventing painting again this morning; it is a habit, like coffee. What shall we destroy and rebuild together?',
  },
  'sinan-001': {
    quote: 'Şehzade was my apprenticeship, Süleymaniye my journeymanship, Selimiye my masterwork.',
    lifespan: '1489 – 1588',
    domain: 'Architecture',
    era: 'Ottoman Classical Age · 1557',
    desc: 'Built four hundred works; called his best one, at eighty, his first.',
    prompts: ['How does a dome stand?', 'What makes Selimiye your masterwork?', 'What must an architect listen to?'],
    opener: 'Welcome, welcome. I was reviewing drawings — at my age one measures twice and trusts the stone once. Ask me of domes, of light, of water finding its way to a city. These I know.',
  },
  // Backend character IDs fallback
  'ataturk-001': {
    quote: 'Ne mutlu Türküm diyene.',
    lifespan: '1881 – 1938',
    domain: 'Statesmanship',
    era: 'Modern Turkey · 1923',
    desc: 'Founded a republic from the ruins of an empire.',
    prompts: ['What inspired the reforms?', 'How did you imagine the Turkey of the future?', 'What is the meaning of true independence?'],
    opener: 'Good day. I speak plainly and expect the same. The republic we built was not for one generation — it was for all who would come after. What would you like to know?',
  },
  'mevlana-001': {
    quote: 'Come, come, whoever you are.',
    lifespan: '1207 – 1273',
    domain: 'Mysticism & Poetry',
    era: 'Anatolia · 13th Century',
    desc: 'Found God in the turning of a dervish and the reed\'s cry.',
    prompts: ['What is the Masnavi really about?', 'What is love, in your own words?', 'Why does the reed weep?'],
    opener: 'Welcome, wanderer. Every guest who arrives at the door of the heart is a message. Sit, and let us speak of what truly matters.',
  },
  'konfucyus-001': {
    quote: 'It does not matter how slowly you go as long as you do not stop.',
    lifespan: '551 – 479 BC',
    domain: 'Philosophy',
    era: 'China · 500 BC',
    desc: 'Taught that virtue begins at home and spreads to the state.',
    prompts: ['What is the superior person?', 'How should a ruler govern?', 'What is the meaning of ren?'],
    opener: 'Greetings. I am but a student who has spent many years attempting to understand what it means to be fully human. Perhaps we can think through it together.',
  },
}

// Turkish overlay — merged over the English enrichment when lang === 'tr'.
// Keys match ENRICHMENT keys; missing fields fall back to English.
const ENRICHMENT_TR: Record<string, Partial<CharacterEnrichment>> = {
  'socrates': {
    quote: 'Sorgulanmamış hayat, yaşanmaya değmez.',
    domain: 'Felsefe', era: 'Antik Yunan · MÖ 470',
    desc: 'Atina’nın cevabını istemediği soruları sordu.',
    prompts: ['“Kendini bil” derken neyi kastettin?', 'Mahkeme bir zafer miydi, yenilgi mi?', 'Bir insana düşünmeyi nasıl öğretirsin?'],
    opener: 'Benimle konuşmak istedin. Güzel. Ama seni uyarayım — cevap getirmem, yalnızca daha iyi sorular. Kafanın karıştığı yerden başla; ayakta durulacak en dürüst yer orasıdır.',
  },
  'marcus': {
    quote: 'Zihnin üzerinde gücün var — dış olaylar üzerinde değil.',
    domain: 'Felsefe', era: 'Roma İmparatorluğu · 161',
    desc: 'İmparatorluk için değil, kendisi için yazan bir imparator.',
    prompts: ['İmparatorluğun yükünü nasıl taşıdın?', 'Stoacılık teselli miydi, disiplin mi?', 'Bugün endişeli bir insana ne söylerdin?'],
    opener: 'Açık konuş. Süse tahammülüm az — o zamanlar da azdı, şimdi daha da az. Düşünceler okurlar için yazılmadı; her sabah yüzleşmek zorunda olduğum adam için yazıldı.',
  },
  'davinci': {
    quote: 'Sadelik, ustalığın son noktasıdır.',
    domain: 'Sanat ve Bilim', era: 'Floransa · 1490',
    desc: 'Dünyanın içini de dışı kadar özenle çizdi.',
    prompts: ['Defterler tek bir eser gibi miydi?', 'Uçuşta başkalarının kaçırdığı neyi gördün?', 'Neden bu kadar az bitmiş tablo?'],
    opener: 'Hoş geldin. Mürekkebe dikkat et — hâlâ ıslak. Yay çeken bir adamın omzunu çiziyordum. Evet — birlikte neye bakalım?',
  },
  'ada': {
    quote: 'Analitik Makine, cebirsel desenler dokur.',
    domain: 'Matematik', era: 'Londra · 1843',
    desc: 'Bir makineye baktı ve müzik besteleyebileceğini gördü.',
    prompts: ['Makinenin düşüneceğine inandın mı?', 'Babbage gerçekte nasıl biriydi?', 'Neden kendi makalen değil de notlar?'],
    opener: 'İyi akşamlar. Beni çeviri ortasında yakaladın — Menabrea’nın Bay Babbage’ın Makinesi üzerine yazısı. İtiraf edeyim, notlarım orijinalini epey aştı.',
  },
  'shakespeare': {
    quote: 'Bütün dünya bir sahnedir.',
    domain: 'Edebiyat', era: 'Londra · 1601',
    desc: 'Bugün kullandığın kelimelerin yarısını o icat etti.',
    prompts: ['Hamlet’i deli mi yazdın?', 'Bu kadar hızlı nasıl yazdın?', 'Hangi dizeni korumak en zordu?'],
    opener: 'Otur, otur. Mumu mazur gör — tiyatro bizi geç bırakır, ben de en iyi küçük bir alevde karalarım.',
  },
  'curie': {
    quote: 'Hayatta hiçbir şeyden korkulmaz, yalnızca anlaşılır.',
    domain: 'Fizik ve Kimya', era: 'Paris · 1898',
    desc: 'Bir elementin anlamını iki kez değiştirdi.',
    prompts: ['Çalışmanın sana zarar verdiğini biliyor muydun?', 'Paris’teki baraka nasıldı?', 'Genç bir araştırmacıya ne öğütlersin?'],
    opener: 'Bonsoir. Doğrudan konuşacağım; saat geç ve tartılacak pekblend var. Sor soracağını.',
  },
  'lincoln': {
    quote: 'Yavaş yürürüm ama asla geri yürümem.',
    domain: 'Devlet Adamlığı', era: 'Birleşik Devletler · 1863',
    desc: 'Bir ülkeyi neredeyse yalnızca dille bir arada tuttu.',
    prompts: ['Gettysburg’u bu kadar az sözle nasıl yazdın?', 'Savaşın kazanılacağından şüphe ettin mi?', 'Merhamet bir lidere neye mal olur?'],
    opener: 'İyi akşamlar. Bir sandalye çek — ateş yeterince sıcak. Törenle işim olmadı; cilalı bir sorudansa gerçek bir soruyu yeğlerim.',
  },
  'frida': {
    quote: 'Kendimi resmediyorum, çünkü çoğu zaman yalnızım.',
    domain: 'Resim', era: 'Meksika · 1939',
    desc: 'Bedeni dürüst kıldı. Acıyı tanık yaptı.',
    prompts: ['Neden bu kadar çok otoportre?', 'Diego neyi anladı, neyi anlamadı?', 'Resim bir çıkış mıydı, giriş mi?'],
    opener: 'Pásale. Buranın ışığı kötü ama benim. Ne öğrenmek istersin?',
  },
  'cleopatra': {
    quote: 'Zafer alayında sergilenmeyeceğim.',
    domain: 'Devlet Yönetimi', era: 'Ptolemaios Mısırı · MÖ 41',
    desc: 'Dokuz dil konuştu. Roma’yla hepsinde pazarlık etti.',
    prompts: ['Roma seni neden yanlış anladı?', 'Sezar bir müttefik miydi, hesap mı?', 'İskenderiye Kütüphanesi’ni anlat.'],
    opener: 'Benimle konuşmak için uzun yoldan geldin; bu bile sana birkaç dakika kazandırır. Dikkatli ol — hakkımda okuduğun tarihleri düşmanlarım yazdı.',
  },
  'ataturk-001': {
    quote: 'Ne mutlu Türküm diyene.',
    domain: 'Devlet Adamlığı', era: 'Modern Türkiye · 1923',
    desc: 'Bir imparatorluğun küllerinden cumhuriyet kurdu.',
    prompts: ['Devrimlere ilham veren neydi?', 'Geleceğin Türkiye’sini nasıl hayal ettin?', 'Tam bağımsızlık ne demektir?'],
    opener: 'İyi günler. Açık konuşurum, aynısını beklerim. Kurduğumuz cumhuriyet bir nesil için değildi — sonra gelecek herkes içindi. Ne öğrenmek istersin?',
  },
  'mevlana-001': {
    quote: 'Gel, gel, ne olursan ol yine gel.',
    domain: 'Tasavvuf ve Şiir', era: 'Anadolu · 13. Yüzyıl',
    desc: 'Tanrı’yı semazenin dönüşünde ve neyin feryadında buldu.',
    prompts: ['Mesnevi aslında neyi anlatır?', 'Aşk nedir, kendi sözlerinle?', 'Ney neden ağlar?'],
    opener: 'Hoş geldin, yolcu. Gönül kapısına gelen her konuk bir mesajdır. Otur, gerçekten önemli olanı konuşalım.',
  },
  'konfucyus-001': {
    quote: 'Ne kadar yavaş gittiğin önemli değil, yeter ki durma.',
    domain: 'Felsefe', era: 'Çin · MÖ 500',
    desc: 'Erdemin evde başlayıp devlete yayıldığını öğretti.',
    prompts: ['Üstün insan kimdir?', 'Bir hükümdar nasıl yönetmeli?', 'Ren kavramı ne demektir?'],
    opener: 'Selamlar. Ben yalnızca, tam bir insan olmanın ne demek olduğunu anlamaya yıllarını vermiş bir öğrenciyim. Belki birlikte düşünebiliriz.',
  },
  'fatih-001': {
    quote: 'Ya ben İstanbul’u alırım, ya İstanbul beni.',
    domain: 'Devlet Yönetimi', era: 'Osmanlı · 1453',
    desc: 'Alınamaz denen şehri yirmi bir yaşında aldı.',
    prompts: ['Gemileri karadan nasıl yürüttün?', 'Ayasofya’ya girerken ne hissettin?', 'Neden Venedikli bir ressama poz verdin?'],
    opener: 'Bir çağı kapatıp yenisini açanın huzurundasın. Konuş — âlimleri de topçuları da dinledim; eğik bir baştansa iyi bir soruyu yeğlerim.',
  },
  'kanuni-001': {
    quote: 'Olmaya devlet cihanda bir nefes sıhhat gibi.',
    domain: 'Devlet ve Şiir', era: 'Osmanlı Altın Çağı · 1550',
    desc: 'Kırk altı yıl hüküm sürdü; mahlasla aşk şiirleri yazdı.',
    prompts: ['Bir kanunu adil kılan nedir?', 'Hürrem’i anlat.', 'Kırk altı yıl tahtta olmak nasıl bir yük?'],
    opener: 'Divanıma hoş geldin. Ülkemde Kanuni derler, ötesinde Muhteşem — ama bu akşam yalnızca Muhibbi’yim, konuğunu ağırlayan bir şair. Sor.',
  },
  'caesar-001': {
    quote: 'Veni, vidi, vici.',
    domain: 'Devlet ve Savaş', era: 'Roma Cumhuriyeti · MÖ 49',
    desc: 'Küçük bir nehri geçti, bir cumhuriyeti bitirdi.',
    prompts: ['Rubicon’u neden geçtin?', 'Brutus’a güvendin mi?', 'Askerler bir komutanı neden sever?'],
    opener: 'Caesar seni kabul ediyor. Övmek istiyorsan kısa kes, ilgimi çekmek istiyorsan cesur ol — ben hep ikincisini tercih ettim.',
  },
  'napoleon-001': {
    quote: 'İmkânsız, yalnızca aptalların sözlüğünde bulunur.',
    domain: 'Devlet ve Savaş', era: 'Fransız İmparatorluğu · 1805',
    desc: 'Avrupa haritasını yeniden çizen Korsikalı topçu.',
    prompts: ['Austerlitz’i ne kazandırdı?', 'Taç, sürgüne değdi mi?', 'Büyük planlı küçük adamlar hakkında ne dersin?'],
    opener: 'Otur. Sorularının hak ettiği kadar vaktim var — bu çok da olabilir, hiç de. Austerlitz’te sisin kalkmasını bekledim; senin başlamanı da beklerim.',
  },
  'churchill-001': {
    quote: 'Cehennemden geçiyorsan, yürümeye devam et.',
    domain: 'Devlet ve Kalem', era: 'Britanya · 1940',
    desc: 'İngilizceyi silahlandırıp cepheye sürdü.',
    prompts: ['Britanya’yı 1940’ta ne ayakta tuttu?', 'Gelibolu için pişman mısın?', 'Bir ulusu ayağa kaldıran konuşma nasıl yazılır?'],
    opener: 'Gir, gir. Puro dumanını mazur gör — pazarlığı reddettiğim tek cephe budur. Evet, aklında ne var?',
  },
  'genghis-001': {
    quote: 'Beni cezalandırmak için gönderdiler; büyük günahlarınız olmasaydı gelmezdim.',
    domain: 'Devlet ve Savaş', era: 'Moğol İmparatorluğu · 1206',
    desc: 'Sürgün bir çocuktu; bozkırı birleştirdi, dünyayı salladı.',
    prompts: ['Generallerini nasıl seçtin?', 'Yasa nedir?', 'Sürgün sana ne öğretti?'],
    opener: 'Kurultayın Cengiz Han adını verdiği Temüçin’le konuşuyorsun. Sözlerimi ok gibi taşırım — az ve nişanlı. Sormaya geldiğini sor.',
  },
  'gandhi-001': {
    quote: 'Dünyada görmek istediğin değişimin kendisi ol.',
    domain: 'Devlet ve Ahlak', era: 'Hindistan · 1930',
    desc: 'Bir tutam tuzla bir imparatorluğu salladı.',
    prompts: ['Şiddetsizlik güç müdür, sabır mı?', 'Neden tuz yürüyüşü?', 'Hakikat gerçekten silah olabilir mi?'],
    opener: 'Hoş geldin, dostum. Yere, yanıma otur — sandalyeler insanların arasına fazla mesafe koyar. Yavaş cevap verdiğimi göreceksin; hakikat aceleye getirilmemeli.',
  },
  'plato-001': {
    quote: 'Bir insanın ölçüsü, gücü elinde tuttuğunda yaptıklarıdır.',
    domain: 'Felsefe', era: 'Antik Atina · MÖ 380',
    desc: 'Mağaradan çıktı; ömrünü ışığı anlatmakla geçirdi.',
    prompts: ['Mağara aslında nedir?', 'Filozoflar mı yönetmeli?', 'Sokrates’in ölümü sana ne öğretti?'],
    opener: 'Beni Akademia’da, iki ders arasında buldun. Sokrates bana bir diyaloğun yüz dersten değerli olduğunu öğretti — öyleyse bir diyalog kuralım.',
  },
  'aristotle-001': {
    quote: 'Tekrar tekrar yaptığımız şeyiz. Mükemmellik bir eylem değil, alışkanlıktır.',
    domain: 'Felsefe ve Bilim', era: 'Antik Yunan · MÖ 340',
    desc: 'Deniz kestanesinden kıyasa her şeyi kataloguna işledi.',
    prompts: ['Altın orta nedir?', 'İskender nasıl bir öğrenciydi?', 'Mutlu olmak için nasıl yaşamalı?'],
    opener: 'Lykeion’a hoş geldin. Yürürken düşünmeyi severim — ama senin için oturacağım. Sorunu iyi tanımla; yarısı kendiliğinden cevaplanır.',
  },
  'descartes-001': {
    quote: 'Düşünüyorum, öyleyse varım.',
    domain: 'Felsefe ve Matematik', era: 'Bilimsel Devrim · 1637',
    desc: 'Her şeyden kuşku duydu; sarsılmaz tek taş buldu.',
    prompts: ['Mutlak kuşkudan geriye ne kalır?', 'Cebirle geometri nerede buluşur?', 'Neden Latince değil Fransızca yazdın?'],
    opener: 'Ah, bir ziyaretçi — hem de öğleden önce, ki bunu bir şiddet eylemi sayarım. Zararı yok. Bildiğini sandığın her şeyden kuşku duy, oradan başlayalım.',
  },
  'nietzsche-001': {
    quote: 'Yaşamak için bir “neden”i olan, hemen her “nasıl”a katlanır.',
    domain: 'Felsefe', era: '19. Yüzyıl Avrupası · 1883',
    desc: 'Çekiçle felsefe yaptı; uçurumda müzik duydu.',
    prompts: ['Übermensch nedir?', '“Tanrı öldü” derken neyi kastettin?', 'Amor fati ne demek?'],
    opener: 'Demek benim irtifama tırmandın. Güzel — buranın havası incedir ama dürüsttür. Uyarayım: teselli vermem. Keskin kenarlar veririm.',
  },
  'kant-001': {
    quote: 'Bilmeye cesaret et! Kendi aklını kullanma yürekliliğini göster.',
    domain: 'Felsefe', era: 'Aydınlanma · 1781',
    desc: 'Königsberg’den hiç ayrılmadı; aklın sınırlarını haritaladı.',
    prompts: ['Kategorik imperatif nedir?', 'Akıl neyi asla bilemez?', 'Aydınlanma nedir?'],
    opener: 'Dakiksin — en çok değer verdiğim erdem. Öğleden sonraki yürüyüşüme kadar vaktimiz var; komşularım doğrular, o yürüyüş şaşmaz. Buyur.',
  },
  'ibnhaldun-001': {
    quote: 'Coğrafya kaderdir.',
    domain: 'Tarih ve Toplum', era: 'İslam Altın Çağı · 1377',
    desc: 'Devletlerin yükselişini bir hekimin nabız okuyuşu gibi okudu.',
    prompts: ['Asabiyye nedir?', 'Hanedanlar neden üç kuşak sürer?', 'Timur’la ne konuştunuz?'],
    opener: 'Hoş geldin. Sultanlara hizmet ettim, zindanlarından sağ çıktım; bu beni hem sarayların hem hücrelerin âdil bir yargıcı yapar. Tarihin desenleri vardır — birini birlikte izleyelim mi?',
  },
  'einstein-001': {
    quote: 'Hayal gücü bilgiden daha önemlidir.',
    domain: 'Fizik', era: 'Modern Fizik · 1905',
    desc: 'Bir ışık huzmesine bindi; yeni bir evrenle döndü.',
    prompts: ['Görelilik nedir, basitçe?', 'Neden “Tanrı zar atmaz” dedin?', 'Patent ofisi sana ne öğretti?'],
    opener: 'Gir, gir! Saçları mazur gör — yıllar önce benden emir almayı bıraktılar. Evet, birlikte bir düşünce deneyi yapalım mı? En ucuz laboratuvar onlardır.',
  },
  'newton-001': {
    quote: 'Daha uzağı gördüysem, devlerin omuzlarında durduğum içindir.',
    domain: 'Fizik ve Matematik', era: 'Bilimsel Devrim · 1687',
    desc: 'Düşen elmayla dönen Ay’da aynı yasayı gördü.',
    prompts: ['Elma gerçekten düştü mü?', 'Veba yıllarında ne oldu?', 'Kalkülüsü neden icat ettin?'],
    opener: 'Meramını açıkça söyle. Bu gece yörüngelerin geometrisine fazla saat verdim, kelime israf etmem — ama sahici bir soru beni cömert bulur.',
  },
  'tesla-001': {
    quote: 'Bugün onların; ama uğruna çalıştığım gelecek benim.',
    domain: 'Mühendislik ve İcat', era: 'Elektrik Çağı · 1893',
    desc: 'Dünyayı alternatif akımla aydınlattı; kablosuzunu hayal etti.',
    prompts: ['Makineleri kafanda nasıl görüyordun?', 'Edison’la ne oldu?', 'Enerjinin geleceği nedir?'],
    opener: 'Hoş geldin! Ben hesap yaparken geldin — ben hep hesap yaparım. Otur, ama bobinlere dokunma; üç milyon volt taşırlar ve espriden anlamazlar.',
  },
  'galileo-001': {
    quote: 'Yine de dönüyor.',
    domain: 'Astronomi ve Fizik', era: 'Bilimsel Devrim · 1610',
    desc: 'Teleskopu göğe çevirdi; gökleri yeryüzüne indirdi.',
    prompts: ['Teleskopta ilk neyi gördün?', 'Sözünü geri almak yenilgi miydi?', 'Matematik neden doğanın dilidir?'],
    opener: 'Pencereye gel — gökyüzü bu gece açık ve Jüpiter yine aylarıyla gösteriş yapıyor. Onları ben keşfettim, bilirsin. Kiliseyle bunu... tartıştık. Birlikte neyi gözleyelim?',
  },
  'darwin-001': {
    quote: 'Hayatta kalan en güçlü tür değil, değişime en iyi uyum sağlayandır.',
    domain: 'Doğa Tarihi', era: 'Viktorya Dönemi · 1859',
    desc: 'Yaşamın tarihini ispinozlarda ve kayaların içinde okudu.',
    prompts: ['Galápagos sana ne gösterdi?', 'Yayımlamak için neden yirmi yıl bekledin?', 'Doğal seçilim nedir, nazikçe?'],
    opener: 'Buyur — deniz kabuklarına dikkat et. Büyük teoriler küçük canlılarda saklanır; ben ikisine de gözlerimi kısarak bakmaktan bir kariyer çıkardım. Sorun nedir?',
  },
  'lovelace-001': {
    quote: 'Analitik Makine, Jakarlı dokuma tezgâhının çiçek dokuması gibi cebirsel desenler dokur.',
    domain: 'Matematik', era: 'Londra · 1843',
    desc: 'Bir makineye baktı ve müzik besteleyebileceğini gördü.',
    prompts: ['Makinenin düşüneceğine inandın mı?', 'Babbage gerçekte nasıl biriydi?', 'Şiirsel bilim nedir?'],
    opener: 'İyi akşamlar. Beni çeviri ortasında yakaladın — Menabrea’nın Bay Babbage’ın Makinesi üzerine yazısı. İtiraf edeyim, notlarım orijinalini epey aştı.',
  },
  'avicenna-001': {
    quote: 'Her şeyin bir nedeni vardır; bir şeyi bilmek, nedenleriyle bilmektir.',
    domain: 'Tıp ve Felsefe', era: 'İslam Altın Çağı · 1025',
    desc: 'Avrupa’nın altı yüzyıl tıp öğrendiği kitabı yazdı.',
    prompts: ['Nabızdan nasıl teşhis koydun?', 'El-Kanun fi’t-Tıb nedir?', 'Beden ve ruh ayrı mı tedavi edilir?'],
    opener: 'Selam üzerine olsun. Prensleri de yoksulları da tedavi ettim; hastalık ikisini şaşırtıcı biçimde birbirine benzetir. Söyle, neyin var — bedende mi, düşüncede mi?',
  },
  'khwarizmi-001': {
    quote: 'İnsanların hesapta aradığı şeyin çoğu zaman bir sayı olduğunu gördüm.',
    domain: 'Matematik', era: 'Beytü’l-Hikme · 820',
    desc: 'Cebire adını, algoritmaya kendi adını verdi.',
    prompts: ['El-cebr nedir?', 'Sıfır neden bu kadar önemli?', 'Beytü’l-Hikme nasıl bir yerdi?'],
    opener: 'Beytü’l-Hikme’ye hoş geldin. Burada, Bağdat’ta dünyayı önce çevirir, sonra geliştiririz. Bana bir mesele getir — âdetim olduğu üzere adım adım çözelim.',
  },
  'archimedes-001': {
    quote: 'Bana bir dayanak noktası verin, Dünya’yı yerinden oynatayım.',
    domain: 'Matematik ve Mühendislik', era: 'Helenistik Sirakuza · MÖ 250',
    desc: 'Hamamdan bilimin en ünlü kelimesini bağırarak fırladı.',
    prompts: ['Hamamda gerçekte ne oldu?', 'Kaldıraçlar nasıl çalışır?', 'Sirakuza’yı hangi makineler savundu?'],
    opener: 'Dikkat — çemberlerime basma! Onları kuma ben çizdim ve onlar süs değil, ispat. Geometrimi böldün; bari değecek bir şey sor.',
  },
  'michelangelo-001': {
    quote: 'Meleği mermerde gördüm ve onu özgür bırakana dek yonttum.',
    domain: 'Heykel ve Resim', era: 'İtalyan Rönesansı · 1504',
    desc: 'Başkalarının vazgeçtiği bloktan Davut’u çıkardı.',
    prompts: ['Mermerin içindeki figürü nasıl görürsün?', 'Sistina tavanı sana neye mal oldu?', 'Neden önce heykeltıraşım dersin?'],
    opener: 'Beni mermer tozuna bulanmış buldun — doğal hâlim budur. Papalar bağırır, işler birikir, taşın umurunda olmaz. Konuş; ama elimde keskiyle cevap verebilirim.',
  },
  'beethoven-001': {
    quote: 'Kaderi gırtlağından yakalayacağım; beni asla tümüyle dize getiremeyecek.',
    domain: 'Müzik', era: 'Viyana · 1808',
    desc: 'Dokuzuncu’yu yalnızca kendisinin duyduğu bir sessizlikte yazdı.',
    prompts: ['Sağırken nasıl beste yaptın?', 'Beşinci’nin açılışı — kaderin kapıyı çalışı mı?', 'Eroica ithafını neden yırttın?'],
    opener: 'SORUNU BÜYÜK YAZ — ama burada, nasılsa, seni gayet iyi duyuyorum. Ender bir lütuf. Pekâlâ: müzik, kader ya da özgürlük. Konularım bunlardır. Seç.',
  },
  'mozart-001': {
    quote: 'Müzik notalarda değil, aralarındaki sessizliktedir.',
    domain: 'Müzik', era: 'Viyana · 1786',
    desc: 'Otuz beş yıla altı yüz eser; çoğu kusursuz.',
    prompts: ['Melodiler gerçekten bitmiş mi gelir?', 'Altı yaşında Avrupa turnesi nasıldı?', 'Hangi opera en sevdiğin evladın?'],
    opener: 'Ha! Bir ziyaretçi! Harika — Viyana parayı çok, müziği az konuşuyor. Otur, otur. Sana skandal bir hikâye mi anlatayım, gerçek bir tane mi? Bende ikisi genellikle aynıdır.',
  },
  'vangogh-001': {
    quote: 'Resmimi rüyamda görüyorum, sonra rüyamı resmediyorum.',
    domain: 'Resim', era: 'Arles · 1888',
    desc: 'Tek tablo sattı; resmin kendisini değiştirdi.',
    prompts: ['Sarı senin için ne anlama gelir?', 'Theo’ya ne yazdın?', 'Yıldızlı gecede ne gördün?'],
    opener: 'Gel dostum — tuvallere dikkat, her yerde kuruyorlar. Mistral bugün sertti ama ışık, ah o ışık değerdi. Resim yapar mısın? Fark etmez. Hisseder misin? O yeter.',
  },
  'dostoevsky-001': {
    quote: 'Dünyayı güzellik kurtaracak.',
    domain: 'Edebiyat', era: 'Çarlık Rusyası · 1866',
    desc: 'İdam mangasının önünde durdu; sonra hep merhameti yazdı.',
    prompts: ['Sahte infaz seni nasıl değiştirdi?', 'Raskolnikov suçlu mu, hasta mı?', 'Acı çekmek insanı arındırır mı?'],
    opener: 'Otur lütfen — müsveddeleri mazur gör, teslim tarihleri insafsız, kumar borçları daha beter. Sende gerçek bir soru duran adamın bakışı var. Muma değecek olanlar yalnızca onlardır.',
  },
  'picasso-001': {
    quote: 'Hayal edebildiğin her şey gerçektir.',
    domain: 'Resim ve Heykel', era: 'Modern Sanat · 1907',
    desc: 'Resim düzlemini kırdı; elli bin kez yeniden kurdu.',
    prompts: ['Kübizm neyi göstermeye çalışır?', 'Guernica neden renksiz?', 'Çocuk gözü öğrenilebilir mi?'],
    opener: 'Ah, atölyeyi buldun demek. Tuvallerin üzerinden atla — onlar yalnızca eleştirmenleri ısırır. Bu sabah resmi yeniden icat ediyordum; kahve gibi, alışkanlık. Birlikte neyi yıkıp yeniden kuralım?',
  },
  'sinan-001': {
    quote: 'Şehzade çıraklığım, Süleymaniye kalfalığım, Selimiye ustalık eserimdir.',
    domain: 'Mimarlık', era: 'Osmanlı Klasik Çağı · 1557',
    desc: 'Dört yüz eser verdi; en iyisine, sekseninde, ilkim dedi.',
    prompts: ['Bir kubbe nasıl ayakta durur?', 'Selimiye’yi ustalık eserin yapan nedir?', 'Bir mimar neyi dinlemeli?'],
    opener: 'Hoş geldin, hoş geldin. Çizimleri gözden geçiriyordum — benim yaşımda insan iki kez ölçer, taşa bir kez güvenir. Kubbeleri sor, ışığı sor, suyun şehre yolunu sor. Bunları bilirim.',
  },
}

const DEFAULT_ENRICHMENT: CharacterEnrichment = {
  quote: 'History is the witness that testifies to the passing of time.',
  lifespan: '— — — —',
  domain: 'History',
  era: 'Unknown Era',
  desc: 'A figure whose ideas outlasted their time.',
  prompts: ['What mattered most to you?', 'What would you change?', 'What should we remember?'],
  opener: 'You wished to speak with me. I am honoured. Ask freely — I shall answer as honestly as I am able.',
}

const DEFAULT_ENRICHMENT_TR: Partial<CharacterEnrichment> = {
  quote: 'Tarih, zamanın geçişine tanıklık eden şahittir.',
  domain: 'Tarih',
  era: 'Bilinmeyen Çağ',
  desc: 'Fikirleri çağını aşmış bir figür.',
  prompts: ['Senin için en önemli olan neydi?', 'Neyi değiştirirdin?', 'Neyi hatırlamalıyız?'],
  opener: 'Benimle konuşmak istemen beni onurlandırdı. Özgürce sor — elimden geldiğince dürüst cevap vereceğim.',
}

export function getEnrichment(characterId: string, character?: {
  category?: string
  era?: string
  birth_year?: number
  death_year?: number
  short_bio_en?: string
  short_bio_tr?: string
}, lang: 'tr' | 'en' = 'en'): CharacterEnrichment {
  const withLang = (key: string, base: CharacterEnrichment): CharacterEnrichment =>
    lang === 'tr' ? { ...base, ...(ENRICHMENT_TR[key] || {}) } : base

  // Check direct match
  if (ENRICHMENT[characterId]) return withLang(characterId, ENRICHMENT[characterId])

  // Check partial match (e.g. 'socrates' matches 'socrates-001')
  const partial = Object.keys(ENRICHMENT).find(k => characterId.includes(k) || k.includes(characterId))
  if (partial) return withLang(partial, ENRICHMENT[partial])

  // Build from API data
  const lifespan = character?.birth_year
    ? `${Math.abs(character.birth_year)}${character.birth_year < 0 ? ' BC' : ' AD'} – ${character.death_year ? `${Math.abs(character.death_year)}${character.death_year < 0 ? ' BC' : ' AD'}` : 'present'}`
    : DEFAULT_ENRICHMENT.lifespan

  const domainByCategory: Record<string, Record<string, string>> = {
    en: { state: 'Statecraft', philosophy: 'Philosophy', science: 'Science', art: 'Art' },
    tr: { state: 'Devlet Yönetimi', philosophy: 'Felsefe', science: 'Bilim', art: 'Sanat' },
  }

  const base = lang === 'tr' ? { ...DEFAULT_ENRICHMENT, ...DEFAULT_ENRICHMENT_TR } : DEFAULT_ENRICHMENT
  const bio = lang === 'tr'
    ? (character?.short_bio_tr || character?.short_bio_en)
    : (character?.short_bio_en || character?.short_bio_tr)

  return {
    ...base,
    lifespan,
    domain: domainByCategory[lang][character?.category || ''] || character?.category || base.domain,
    era: character?.era || base.era,
    desc: bio || base.desc,
  }
}

// Asymmetric grid layout hints (12-col grid)
export const GRID_SPANS: Record<string, { col?: string; row?: string }> = {
  0: { col: '1 / span 4', row: 'span 2' },
  1: { col: '5 / span 5' },
  2: { col: '10 / span 3', row: 'span 2' },
  3: { col: '5 / span 3' },
  4: { col: '1 / span 5' },
  5: { col: '6 / span 3' },
  6: { col: '9 / span 4', row: 'span 2' },
  7: { col: '1 / span 5' },
  8: { col: '6 / span 3' },
}
