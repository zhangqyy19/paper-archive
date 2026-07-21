// Research Notebook data providers.
//
// The dashboard aggregates several kinds of live content for a notebook's
// topics. The UI depends ONLY on this interface and the normalized FeedItem
// shape below — never on any specific API. A real source (arXiv, Crossref,
// news RSS, PubMed, OpenAlex, …) becomes available by implementing/registering
// a provider; no dashboard UI changes are required. This mirrors how the
// Repository hides the storage backend from the rest of the app.

/** The kind of content a feed item represents, used to route it into a section. */
export type FeedKind = 'news' | 'publication' | 'paper' | 'trending'

/** A single normalized item shown on the research dashboard. */
export interface FeedItem {
  id: string
  kind: FeedKind
  title: string
  /** Short human-readable summary / abstract. */
  summary: string
  /** Where the item came from (outlet, journal, or feed name). */
  source: string
  /** ISO date the item was published (YYYY-MM-DD), or undefined if unknown. */
  publishedAt?: string
  /** Outbound link, opened in a new tab. */
  url: string
  /** The topic id that surfaced this item, for grouping/labels in the UI. */
  topicId: string
  /** Optional author list, when a provider supplies it. */
  authors?: string[]
}

/** A saved source/feed the user tracks for a topic. */
export interface SourceRef {
  id: string
  label: string
  url: string
}

/** A trending term/subject surfaced for a topic. */
export interface TrendingItem {
  id: string
  label: string
  /** Optional link to explore the trend further. */
  url?: string
  /** The topic id this trend belongs to. */
  topicId: string
}

/**
 * Aggregates dashboard content for a research notebook. Every method takes the
 * notebook's selected topic ids and returns normalized items. Implementations
 * should resolve to empty arrays (never throw) on failure so the dashboard can
 * render graceful empty states rather than errors.
 */
export interface ResearchProvider {
  getLatestNews(topicIds: string[]): Promise<FeedItem[]>
  getRecentPublications(topicIds: string[]): Promise<FeedItem[]>
  getRecentPapers(topicIds: string[]): Promise<FeedItem[]>
  getTrending(topicIds: string[]): Promise<TrendingItem[]>
}

/** A provider that can identify itself (for logging / future settings UI). */
export interface NamedProvider {
  readonly name: string
}