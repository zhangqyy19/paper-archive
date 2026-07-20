import type { BookFormatId } from './types'

/** A format preset: changes terminology and iconography of a book. */
export interface BookFormat {
  id: BookFormatId
  name: string
  subtitle: string
  /** Terminology for a single writing unit. */
  singular: string
  plural: string
  /** Simple inline SVG glyph name — resolved by the Icon component. */
  icon: string
  /** Subtle accent color (hex) for the format badge. */
  accent: string
}

export const FORMATS: readonly BookFormat[] = [
  {
    id: 'diary',
    name: 'Diary',
    subtitle: 'Daily entries, a gentle record of your days',
    singular: 'Entry',
    plural: 'Entries',
    icon: 'calendar',
    accent: '#8a9a7b',
  },
  {
    id: 'storybook',
    name: 'Storybook',
    subtitle: 'Chapters woven into something literary',
    singular: 'Chapter',
    plural: 'Chapters',
    icon: 'feather',
    accent: '#a8785d',
  },
  {
    id: 'novel',
    name: 'Novel',
    subtitle: 'A long-form work, told in chapters',
    singular: 'Chapter',
    plural: 'Chapters',
    icon: 'book',
    accent: '#6b7a99',
  },
  {
    id: 'travel',
    name: 'Travel Journal',
    subtitle: 'Entries from the road and places between',
    singular: 'Entry',
    plural: 'Entries',
    icon: 'compass',
    accent: '#c08457',
  },
  {
    id: 'dream',
    name: 'Dream Journal',
    subtitle: 'Fragments caught upon waking',
    singular: 'Dream',
    plural: 'Dreams',
    icon: 'moon',
    accent: '#8b7fae',
  },
  {
    id: 'recipe',
    name: 'Recipe Book',
    subtitle: 'A kitchen collection of things you love to cook',
    singular: 'Recipe',
    plural: 'Recipes',
    icon: 'bowl',
    accent: '#b56b57',
  },
  {
    id: 'research',
    name: 'Research Notebook',
    subtitle: 'Notes, findings, and threads to pull',
    singular: 'Note',
    plural: 'Notes',
    icon: 'flask',
    accent: '#5f7d8c',
  },
  {
    id: 'poetry',
    name: 'Poetry Collection',
    subtitle: 'Poems gathered, line by line',
    singular: 'Poem',
    plural: 'Poems',
    icon: 'quill',
    accent: '#9c6f8e',
  },
  {
    id: 'sketchbook',
    name: 'Sketchbook',
    subtitle: 'Pages for shapes, ideas, and marks',
    singular: 'Page',
    plural: 'Pages',
    icon: 'pencil',
    accent: '#7a8a7f',
  },
  {
    id: 'custom',
    name: 'Custom',
    subtitle: 'Name your own kind of book',
    singular: 'Entry',
    plural: 'Entries',
    icon: 'sparkle',
    accent: '#9a8c73',
  },
]

const FORMAT_MAP = new Map(FORMATS.map((f) => [f.id, f]))

export function getFormat(id: BookFormatId): BookFormat {
  return FORMAT_MAP.get(id) ?? FORMATS[0]
}