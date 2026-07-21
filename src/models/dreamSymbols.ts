/**
 * A static reference library of common dream symbols and the interpretations
 * various traditions have attached to them. This is purely informational —
 * offered as a lens for reflection, never presented as fact or diagnosis.
 * Adding a new symbol is a single entry here; the editor renders it
 * automatically and it becomes searchable at once.
 *
 * Future: this same shape can back an AI-assisted interpretation feature —
 * the `interpretations` here are the human-curated baseline.
 */
export interface DreamSymbol {
  /** Stable key stored on the entry (DreamData.symbols). */
  id: string
  name: string
  /** One-line essence shown in the list and on the flagged chip. */
  tagline: string
  /** A short note on what the symbol commonly evokes. */
  meaning: string
  /** A few common symbolic readings — reflective prompts, not facts. */
  interpretations: string[]
  /** Broad themes this symbol tends to touch, for grouping/searching. */
  themes: string[]
}

export const DREAM_SYMBOLS: readonly DreamSymbol[] = [
  {
    id: 'water',
    name: 'Water',
    tagline: 'The shifting surface of feeling',
    meaning:
      'Water is one of the oldest symbols of the emotional and unconscious mind — its state often mirrors the dreamer’s inner weather.',
    interpretations: [
      'Calm water may reflect peace or emotional clarity.',
      'Turbulent or murky water can point to overwhelm or uncertainty.',
      'Depth may suggest something felt but not yet fully seen.',
    ],
    themes: ['emotion', 'unconscious', 'change'],
  },
  {
    id: 'flying',
    name: 'Flying',
    tagline: 'Rising above the ordinary',
    meaning:
      'To fly in a dream is often read as a symbol of freedom, perspective, or a wish to rise beyond a limit.',
    interpretations: [
      'Effortless flight may signal confidence or release.',
      'Struggling to stay aloft can mirror a fear of losing control.',
      'The height reached may reflect ambition or aspiration.',
    ],
    themes: ['freedom', 'control', 'aspiration'],
  },
  {
    id: 'falling',
    name: 'Falling',
    tagline: 'The ground giving way',
    meaning:
      'Falling is among the most common dream sensations, frequently tied to feelings of insecurity or a loss of footing in waking life.',
    interpretations: [
      'It may echo anxiety about a situation slipping from your grasp.',
      'The moment of letting go can suggest surrender or release.',
      'Where you land — or don’t — colours the meaning.',
    ],
    themes: ['insecurity', 'control', 'fear'],
  },
  {
    id: 'teeth',
    name: 'Teeth',
    tagline: 'Losing what feels fixed',
    meaning:
      'Dreams of losing teeth recur across cultures and are often linked to anxiety about appearance, communication, or change.',
    interpretations: [
      'They may reflect worry about how you are seen by others.',
      'Crumbling teeth can mirror a fear of things falling apart.',
      'Some traditions tie them to transition and renewal.',
    ],
    themes: ['anxiety', 'change', 'self-image'],
  },
  {
    id: 'death',
    name: 'Death',
    tagline: 'An ending that clears space',
    meaning:
      'Death in dreams is rarely read literally; it more often marks the close of a chapter or the shedding of an old self.',
    interpretations: [
      'It may signal transformation rather than loss.',
      'The end of one phase can make room for another.',
      'Who or what dies often points to what is being left behind.',
    ],
    themes: ['transformation', 'endings', 'renewal'],
  },
  {
    id: 'animals',
    name: 'Animals',
    tagline: 'Instinct wearing a face',
    meaning:
      'Animals often embody instincts, drives, or traits — the particular creature and its behaviour shade the meaning.',
    interpretations: [
      'A predator may represent a fear or an untamed impulse.',
      'A gentle animal can mirror comfort, loyalty, or vulnerability.',
      'A caged animal may suggest a suppressed part of yourself.',
    ],
    themes: ['instinct', 'nature', 'self'],
  },
  {
    id: 'fire',
    name: 'Fire',
    tagline: 'Destruction and renewal at once',
    meaning:
      'Fire is a double-edged symbol — it can consume and destroy, but also warm, purify, and transform.',
    interpretations: [
      'A contained flame may reflect passion or vitality.',
      'A raging fire can point to anger or a situation out of control.',
      'Ashes left behind may suggest a fresh start.',
    ],
    themes: ['passion', 'destruction', 'transformation'],
  },
  {
    id: 'house',
    name: 'House',
    tagline: 'The architecture of the self',
    meaning:
      'A house is often read as the dreamer themselves — its rooms and condition mapping different parts of the psyche.',
    interpretations: [
      'Unknown rooms may reflect undiscovered aspects of yourself.',
      'A crumbling house can mirror neglect or inner strain.',
      'The basement and attic often stand for the buried and the ideal.',
    ],
    themes: ['self', 'memory', 'psyche'],
  },
  {
    id: 'mirror',
    name: 'Mirror',
    tagline: 'The self, reflected and questioned',
    meaning:
      'Mirrors invite reflection on identity and self-perception — sometimes reassuring, sometimes unsettling.',
    interpretations: [
      'A clear reflection may point to self-acceptance.',
      'A distorted or empty mirror can suggest identity in flux.',
      'What you look for in the mirror often reveals a concern.',
    ],
    themes: ['identity', 'self', 'reflection'],
  },
  {
    id: 'forest',
    name: 'Forest',
    tagline: 'The unknown, entered on foot',
    meaning:
      'Forests are classic symbols of the unknown and the unconscious — a place of both danger and discovery.',
    interpretations: [
      'Being lost may mirror uncertainty about a path in life.',
      'A clearing can suggest insight or a moment of calm.',
      'What you meet among the trees often carries the meaning.',
    ],
    themes: ['unconscious', 'journey', 'mystery'],
  },
]

const SYMBOL_MAP = new Map(DREAM_SYMBOLS.map((s) => [s.id, s]))

export function getDreamSymbol(id: string): DreamSymbol | undefined {
  return SYMBOL_MAP.get(id)
}

/** Case-insensitive search across name, tagline, meaning, and themes. */
export function searchDreamSymbols(query: string): readonly DreamSymbol[] {
  const q = query.trim().toLowerCase()
  if (!q) return DREAM_SYMBOLS
  return DREAM_SYMBOLS.filter((s) => {
    const hay = [s.name, s.tagline, s.meaning, ...s.themes]
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
}