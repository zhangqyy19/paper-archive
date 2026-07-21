// Core domain models for the Library app.
// These are storage-agnostic: the same shapes flow from IndexedDB today
// and could flow from a cloud backend tomorrow without UI changes.

/** A stable identifier for a book format preset. */
export type BookFormatId =
  | 'diary'
  | 'storybook'
  | 'novel'
  | 'travel'
  | 'dream'
  | 'recipe'
  | 'research'
  | 'poetry'
  | 'sketchbook'
  | 'custom'

/** A stable identifier for a preset cover color. */
export type CoverColorId =
  | 'forest'
  | 'navy'
  | 'burgundy'
  | 'cream'
  | 'charcoal'
  | 'dusty-blue'
  | 'sage'
  | 'terracotta'
  | 'lavender'
  | 'sand'
  | 'midnight'
  | 'olive'

/**
 * How the book's cover is rendered. Today this is always a preset color.
 * The `image` variant is reserved for future uploaded covers — the shape
 * is defined now so components can be structured for it.
 */
export type BookCover =
  | { kind: 'color'; colorId: CoverColorId }
  | { kind: 'image'; url: string; colorId?: CoverColorId }

/** A media attachment on a recipe: an embedded video or a saved link. */
export interface RecipeMedia {
  id: string
  /** 'video' embeds an iframe; 'link' is a saved reference (future: crawler source). */
  kind: 'video' | 'link'
  /** The raw URL the user pasted. */
  url: string
  /** Optional human label shown for a link. */
  label?: string
}

/**
 * Structured data for recipe entries. Ingredients and instructions live in
 * separate rich-text areas. `content` (on Entry) stays available for free-form
 * notes, keeping the shape backward compatible with non-recipe entries.
 */
export interface RecipeData {
  /** Rich-text HTML for the ingredient list. */
  ingredients: string
  /** Rich-text HTML for the preparation steps. */
  instructions: string
  /** Embedded videos and attached links. */
  media?: RecipeMedia[]
  /** Optional metadata, structured now for a future recipe crawler. */
  servings?: string
  prepTime?: string
  cookTime?: string
  /** The URL a recipe was (or will be) imported from. */
  sourceUrl?: string
}

/** A single writing unit inside a book (an entry, chapter, poem, etc.). */
export interface Entry {
  id: string
  bookId: string
  title: string
  content: string
  /** Structured recipe fields; only present for entries in a recipe book. */
  recipe?: RecipeData
  /** Manual ordering position within the book (lower comes first). */
  order: number
  createdAt: string // ISO string
  updatedAt: string // ISO string
  /**
   * A user-chosen date for the entry (e.g. the day a diary entry is about),
   * as a calendar date string "YYYY-MM-DD". Distinct from createdAt/updatedAt,
   * which track when the record was made or last edited.
   */
  entryDate?: string
  // Future-proofing (unused for now, structured for later):
  tags?: string[]
  favorite?: boolean
  archived?: boolean
}

/** A book / journal in the user's library. */
export interface Book {
  id: string
  title: string
  description?: string
  format: BookFormatId
  /** Only meaningful when format === 'custom'. */
  customTerms?: { singular: string; plural: string }
  cover: BookCover
  createdAt: string // ISO string
  updatedAt: string // ISO string
  // Future-proofing:
  tags?: string[]
  favorite?: boolean
  archived?: boolean
  folderId?: string
}

/** Sorting options for the library view. */
export type LibrarySort = 'recent' | 'title' | 'created'