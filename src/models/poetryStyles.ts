import type { PoemStyleId } from './types'

/**
 * A poetic form and the non-intrusive guidance shown alongside it. This is a
 * static reference library — purely informational, never enforced on the
 * writer. Adding a new form is a single entry here; the editor renders it
 * automatically.
 */
export interface PoemStyle {
  id: PoemStyleId
  name: string
  /** One-line essence shown in the selector. */
  tagline: string
  /** The shape of the form: line count, stanza structure. */
  structure: string
  /** Metre / syllable guidance, if the form has one. */
  meter?: string
  /** Rhyme scheme, if any. */
  rhyme?: string
  /** A short note on the form's origin and tradition. */
  history: string
  /** A few practical tips for writing in this form. */
  tips: string[]
}

export const POEM_STYLES: readonly PoemStyle[] = [
  {
    id: 'free-verse',
    name: 'Free Verse',
    tagline: 'No fixed rules — let the line follow the breath',
    structure: 'Open form. No required line count, stanza length, or pattern.',
    history:
      'Emerging in the late 19th century and championed by poets like Whitman and the Modernists, free verse abandons regular metre and rhyme in favour of natural cadence and organic form.',
    tips: [
      'Let line breaks carry meaning — end lines on strong words.',
      'Rhythm still matters; read aloud to feel the pulse.',
      'White space and stanza breaks are your punctuation.',
    ],
  },
  {
    id: 'haiku',
    name: 'Haiku',
    tagline: 'Three lines, a single caught moment',
    structure: 'Three lines of 5, 7, and 5 syllables.',
    meter: '5 / 7 / 5 syllables',
    history:
      'A Japanese form perfected by Bashō in the 17th century. Traditionally evokes nature and a season, pivoting on a single vivid image or moment of awareness.',
    tips: [
      'Capture one concrete image, not an abstract idea.',
      'Include a seasonal or natural reference (kigo).',
      'Aim for a turn or juxtaposition between the images.',
    ],
  },
  {
    id: 'sonnet',
    name: 'Sonnet',
    tagline: 'Fourteen lines that argue and resolve',
    structure:
      'Fourteen lines. Shakespearean: three quatrains + a couplet. Petrarchan: an octave + a sestet.',
    meter: 'Iambic pentameter (ten syllables per line)',
    rhyme: 'ABAB CDCD EFEF GG (Shakespearean)',
    history:
      'Originating in 13th-century Italy and refined by Petrarch, then reshaped in English by Shakespeare. Traditionally explores love, time, or mortality with a decisive turn (volta).',
    tips: [
      'Build tension across the quatrains, then turn at the volta.',
      'Let the closing couplet land the argument or twist.',
      'Keep to iambic pentameter for the classic music.',
    ],
  },
  {
    id: 'limerick',
    name: 'Limerick',
    tagline: 'Five lines of playful, bouncing wit',
    structure: 'Five lines. Lines 1, 2, 5 are longer; lines 3, 4 are shorter.',
    meter: 'Anapestic — a bouncing da-da-DUM rhythm',
    rhyme: 'AABBA',
    history:
      'A light, humorous English form popularised by Edward Lear in the 19th century. Almost always comic, often absurd, and traditionally opens by naming a person or place.',
    tips: [
      'Keep it light and end on a punchline.',
      'Lean into the bouncy anapestic rhythm.',
      'Lines 3 and 4 are shorter — a quick internal beat.',
    ],
  },
  {
    id: 'villanelle',
    name: 'Villanelle',
    tagline: 'Nineteen lines woven from two refrains',
    structure:
      'Nineteen lines: five tercets and a final quatrain. Two refrains repeat in a fixed pattern.',
    rhyme: 'ABA throughout, with two alternating refrain lines',
    history:
      'A French form crystallised in the 19th century. Its circling refrains suit themes of obsession and loss — Dylan Thomas’s “Do not go gentle into that good night” is the best-known example.',
    tips: [
      'Choose two strong, flexible refrain lines — they repeat often.',
      'Let the refrains shift in meaning as context changes.',
      'The final quatrain brings both refrains together.',
    ],
  },
  {
    id: 'blank-verse',
    name: 'Blank Verse',
    tagline: 'Unrhymed lines with a steady heartbeat',
    structure: 'Unrhymed lines, no fixed stanza length.',
    meter: 'Iambic pentameter (ten syllables per line)',
    history:
      'The metre of Shakespeare’s plays and Milton’s Paradise Lost. Its unrhymed pentameter mirrors the natural rhythm of English speech, giving it grandeur without artifice.',
    tips: [
      'Hold the iambic pentameter; vary it only for effect.',
      'No rhyme — let the metre and imagery carry the line.',
      'Use enjambment to keep the verse flowing like speech.',
    ],
  },
  {
    id: 'concrete',
    name: 'Concrete Poem',
    tagline: 'Words shaped into the thing they describe',
    structure:
      'Free of metre — the visual arrangement on the page is the form.',
    history:
      'A visual form with ancient roots, revived by the Concrete Poetry movement of the 1950s. Meaning arises as much from the shape and layout as from the words themselves.',
    tips: [
      'Let the layout echo the subject — a spiral, a wave, a fall.',
      'Whitespace and position carry meaning here.',
      'Read it with your eyes as much as your ears.',
    ],
  },
]

const STYLE_MAP = new Map(POEM_STYLES.map((s) => [s.id, s]))

export function getPoemStyle(id: PoemStyleId): PoemStyle | undefined {
  return STYLE_MAP.get(id)
}