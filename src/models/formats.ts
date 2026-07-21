import type { BookFormatId } from './types'

/**
 * Which specialized editor a format uses.The BookDetailPage reads this to
 * dispatch to the right editor component. Adding a new editor kind here plus
 * a case in the dispatcher is all it takes to introduce a new journal type.
 */
export type EditorKind =
  | 'text' // generic rich-text editor (diary, novel, storybook, custom)
  | 'recipe'
  | 'travel'
  | 'poetry'
  | 'dream'
  | 'sketch'
  | 'research' // notebook uses a dashboard as its "entry" surface

/**
 * The primary views a format exposes in its detail page. 'entries' is the
 * default writing surface; others are format-specific extra views.
 */
export type FormatView = 'entries' | 'timeline' | 'map' | 'dashboard'

/**
 * Declarative capabilities for a journal format. Core UI branches on these
 * flags rather than hardcoding per-format logic, keeping the app scalable:
 * a brand-new journal type is a data entry here + its editor component.
 */
export interface FormatCapabilities {
  /** Which editor component handles this format's entries. */
  editor: EditorKind
  /** Extra views beyond the default entry writing surface. */
  views: FormatView[]
  /** Whether entries carry a user-editable date (diary / travel). */
  datedEntries?: boolean
  /** Whether the front page is a non-editable aggregated dashboard. */
  hasDashboard?: boolean
  /** Whether cross-journal references can be inserted while writing. */
  supportsRefs?: boolean
}

/** A format preset: terminology, iconography, and capabilities of a book. */
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
  /** Declarative feature set — see FormatCapabilities. */
  capabilities: FormatCapabilities
  /**
   * Whether the format is offered to users in the creation UI. Disabled
   * formats stay fully wired (data model, editor) but hidden — e.g. Storybook
   * is behind this flag so it can be re-enabled with a single change.
   */
  enabled: boolean
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
    capabilities: { editor: 'text', views: ['entries'], datedEntries: true, supportsRefs: true },
    enabled: true,
  },
  {
    // Fiction format kept behind a flag. The architecture still supports
    // multiple fiction formats — flip `enabled` to re-expose Storybook.
    id: 'storybook',
    name: 'Storybook',
    subtitle: 'Chapters woven into something literary',
    singular: 'Chapter',
    plural: 'Chapters',
    icon: 'feather',
    accent: '#a8785d',
    capabilities: { editor: 'text', views: ['entries'], supportsRefs: true },
    enabled: false,
  },
  {
    id: 'novel',
    name: 'Novel',
    subtitle: 'A long-form work, told in chapters',
    singular: 'Chapter',
    plural: 'Chapters',
    icon: 'book',
    accent: '#6b7a99',
    capabilities: { editor: 'text', views: ['entries'], supportsRefs: true },
    enabled: true,
  },
  {
    id: 'travel',
    name: 'Travel Journal',
    subtitle: 'Places, pins, and the road between them',
    singular: 'Entry',
    plural: 'Entries',
    icon: 'compass',
    accent: '#c08457',
    capabilities: {
      editor: 'travel',
      views: ['timeline', 'map'],
      datedEntries: true,
      supportsRefs: true,
    },
    enabled: true,
  },
  {
    id: 'dream',
    name: 'Dream Journal',
    subtitle: 'Fragments caught upon waking',
    singular: 'Dream',
    plural: 'Dreams',
    icon: 'moon',
    accent: '#8b7fae',
    capabilities: { editor: 'dream', views: ['entries'], datedEntries: true, supportsRefs: true },
    enabled: true,
  },
  {
    id: 'recipe',
    name: 'Recipe Book',
    subtitle: 'A kitchen collection of things you love to cook',
    singular: 'Recipe',
    plural: 'Recipes',
    icon: 'bowl',
    accent: '#b56b57',
    capabilities: { editor: 'recipe', views: ['entries'], supportsRefs: true },
    enabled: true,
  },
  {
    id: 'research',
    name: 'Research Notebook',
    subtitle: 'A living dashboard of news and publications',
    singular: 'Note',
    plural: 'Notes',
    icon: 'flask',
    accent: '#5f7d8c',
    capabilities: {
      editor: 'research',
      views: ['dashboard', 'entries'],
      hasDashboard: true,
      supportsRefs: true,
    },
    enabled: true,
  },
  {
    id: 'poetry',
    name: 'Poetry Collection',
    subtitle: 'Poems gathered, line by line',
    singular: 'Poem',
    plural: 'Poems',
    icon: 'quill',
    accent: '#9c6f8e',
    capabilities: { editor: 'poetry', views: ['entries'], supportsRefs: true },
    enabled: true,
  },
  {
    id: 'sketchbook',
    name: 'Sketchbook',
    subtitle: 'An infinite canvas for marks and ideas',
    singular: 'Page',
    plural: 'Pages',
    icon: 'pencil',
    accent: '#7a8a7f',
    capabilities: { editor: 'sketch', views: ['entries'] },
    enabled: true,
  },
  {
    id: 'custom',
    name: 'Custom',
    subtitle: 'Name your own kind of book',
    singular: 'Entry',
    plural: 'Entries',
    icon: 'sparkle',
    accent: '#9a8c73',
    capabilities: { editor: 'text', views: ['entries'], supportsRefs: true },
    enabled: true,
  },
]

const FORMAT_MAP = new Map(FORMATS.map((f) => [f.id, f]))

export function getFormat(id: BookFormatId): BookFormat {
  return FORMAT_MAP.get(id) ?? FORMATS[0]
}

/** Formats offered to users in the creation UI (hides flagged-off ones). */
export function selectableFormats(): BookFormat[] {
  return FORMATS.filter((f) => f.enabled)
}