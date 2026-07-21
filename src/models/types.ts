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

/** A geolocated place attached to a travel entry. */
export interface GeoLocation {
  /** Human-readable place name, e.g. "Kyoto, Japan". */
  name: string
  lat?: number
  lng?: number
  /** Whether lat/lng were resolved via geocoding (vs. entered manually). */
  geocoded?: boolean
}

/** Structured data for travel entries: a place + a date visited. */
export interface TravelData {
  location?: GeoLocation
  /** The day this place was visited, as "YYYY-MM-DD". */
  dateVisited?: string
}

/** An available poetry form the user can compose in. */
export type PoemStyleId =
  | 'free-verse'
  | 'haiku'
  | 'sonnet'
  | 'limerick'
  | 'villanelle'
  | 'blank-verse'
  | 'concrete'

/** Structured data for poem entries. */
export interface PoetryData {
  styleId?: PoemStyleId
}

/** Structured data for dream entries. */
export interface DreamData {
  /** Symbol keys (from the reference library) the writer flagged. */
  symbols?: string[]
}

/** One or more research topics that drive a notebook's dashboard. */
export interface ResearchData {
  topics: ResearchTopic[]
  /** User-saved source URLs / feeds shown in the dashboard. */
  savedSources?: { id: string; label: string; url: string }[]
}

/**
 * A standardized research topic chosen from a curated taxonomy. The notebook
 * stores the stable `id` (so notebooks about the same subject share the same
 * underlying category and providers) and displays the human-readable `label`.
 */
export interface ResearchTopic {
  id: string
  label: string
}

/** A single freeform object on a sketchbook canvas. */
export interface SketchNode {
  id: string
  kind: 'stroke' | 'text' | 'image' | 'shape'
  /** Serialized stroke points, text, image src, or shape geometry. */
  data: unknown
  x: number
  y: number
  /** Optional layer index for future layer support. */
  layer?: number
}

/** Structured data for a sketchbook page: a freeform canvas. */
export interface SketchData {
  nodes: SketchNode[]
  /** Canvas viewport hint (last pan/zoom), for restoring the view. */
  viewport?: { x: number; y: number; zoom: number }
}

/**
 * A cross-journal reference. Stored by IDs (never text) so that if the
 * referenced entry's title changes, the rendered card updates automatically.
 * Future: power backlinks (Obsidian-style) from these records.
 */
export interface EntryRef {
  id: string
  bookId: string
  entryId: string
  /** Optional anchor to a heading/section within the entry. */
  anchor?: string
}

/** A single writing unit inside a book (an entry, chapter, poem, etc.). */
export interface Entry {
  id: string
  bookId: string
  title: string
  content: string
  /** Structured recipe fields; only present for entries in a recipe book. */
  recipe?: RecipeData
  /** Structured travel fields; only present in a travel journal. */
  travel?: TravelData
  /** Structured poem fields; only present in a poetry collection. */
  poetry?: PoetryData
  /** Structured dream fields; only present in a dream journal.*/
  dream?: DreamData
  /** Freeform canvas data; only present in a sketchbook. */
  sketch?: SketchData
  /** Cross-journal references inserted into this entry. */
  refs?: EntryRef[]
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
  /** Research notebooks store their topics/sources at the book level. */
  research?: ResearchData
  // Future-proofing:
  tags?: string[]
  favorite?: boolean
  archived?: boolean
  folderId?: string
}

/** Sorting options for the library view. */
export type LibrarySort = 'recent' | 'title' | 'created'