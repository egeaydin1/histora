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

const DEFAULT_ENRICHMENT: CharacterEnrichment = {
  quote: 'History is the witness that testifies to the passing of time.',
  lifespan: '— — — —',
  domain: 'History',
  era: 'Unknown Era',
  desc: 'A figure whose ideas outlasted their time.',
  prompts: ['What mattered most to you?', 'What would you change?', 'What should we remember?'],
  opener: 'You wished to speak with me. I am honoured. Ask freely — I shall answer as honestly as I am able.',
}

export function getEnrichment(characterId: string, character?: {
  category?: string
  era?: string
  birth_year?: number
  death_year?: number
  short_bio_en?: string
  short_bio_tr?: string
}): CharacterEnrichment {
  // Check direct match
  if (ENRICHMENT[characterId]) return ENRICHMENT[characterId]

  // Check partial match (e.g. 'socrates' matches 'socrates-001')
  const partial = Object.keys(ENRICHMENT).find(k => characterId.includes(k) || k.includes(characterId))
  if (partial) return ENRICHMENT[partial]

  // Build from API data
  const lifespan = character?.birth_year
    ? `${Math.abs(character.birth_year)}${character.birth_year < 0 ? ' BC' : ' AD'} – ${character.death_year ? `${Math.abs(character.death_year)}${character.death_year < 0 ? ' BC' : ' AD'}` : 'present'}`
    : DEFAULT_ENRICHMENT.lifespan

  return {
    ...DEFAULT_ENRICHMENT,
    lifespan,
    domain: character?.category || DEFAULT_ENRICHMENT.domain,
    era: character?.era || DEFAULT_ENRICHMENT.era,
    desc: character?.short_bio_en || character?.short_bio_tr || DEFAULT_ENRICHMENT.desc,
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
