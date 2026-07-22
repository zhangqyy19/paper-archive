import type {
  FeedItem,
  NamedProvider,
  ResearchProvider,
  TrendingItem,
} from './provider'
import { getTopicDef } from './taxonomy'
import { cleanFeedItems } from './sanitize'

// Aggregates several ResearchProviders behind the single ResearchProvider the
// dashboard talks to. Responsibilities:
//   • fan out each request to every registered provider in parallel
//   • tolerate individual provider failures (a rejected/erroring provider
//     contributes [] instead of failing the whole dashboard)
//   • de-duplicate, sort newest-first, and cap results
//   • derive "trending" terms from the aggregated titles when no provider
//     supplies them, so the section is never empty for a healthy feed
//   • cache each section briefly to avoid hammering APIs on re-renders
//
// Adding a new source later = implement ResearchProvider and add it to the
// PROVIDERS list in mockProvider.ts's getResearchProvider(). No UI changes.

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

type Section = 'news' | 'publications' | 'papers' | 'trending'

interface CacheEntry {
  at: number
  data: unknown
}

// A word list to skip when deriving trending terms from titles.
const STOP = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'for', 'to', 'in', 'on', 'with', 'from',
  'new', 'how', 'why', 'what', 'is', 'are', 'as', 'at', 'by', 'its', 'this',
  'that', 'using', 'study', 'research', 'analysis', 'via', 'toward', 'towards',
])

async function settle<T>(p: Promise<T[]>): Promise<T[]> {
  try {
    return await p
  } catch {
    return []
  }
}

function byNewest(a: FeedItem, b: FeedItem): number {
  // Items with a known date sort newest-first; undated items sink to the bottom
  // so the freshest, verifiable content always leads each section.
  const da = a.publishedAt ?? ''
  const db = b.publishedAt ?? ''
  if (da && !db) return -1
  if (!da && db) return 1
  return db.localeCompare(da)
}

function dedupe(items: FeedItem[]): FeedItem[] {
  const seen = new Set<string>()
  const out: FeedItem[] = []
  for (const it of items) {
    const key = it.url || it.id || it.title
    if (seen.has(key)) continue
    seen.add(key)
    out.push(it)
  }
  return out
}

export class AggregateProvider implements ResearchProvider, NamedProvider {
  readonly name: string
  private cache = new Map<string, CacheEntry>()

  constructor(private providers: ResearchProvider[]) {
    this.name = providers
      .map((p) => (p as Partial<NamedProvider>).name ?? 'provider')
      .join(' + ')
  }

  /** Clear cached results so the next call refetches (used by manual refresh). */
  clearCache() {
    this.cache.clear()
  }

  private cacheKey(section: Section, topicIds: string[]): string {
    return `${section}:${[...topicIds].sort().join(',')}`
  }

  private async cached<T>(
    section: Section,
    topicIds: string[],
    run: () => Promise<T>,
  ): Promise<T> {
    const key = this.cacheKey(section, topicIds)
    const hit = this.cache.get(key)
    if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data as T
    const data = await run()
    this.cache.set(key, { at: Date.now(), data })
    return data
  }

  private async gather(
    call: (p: ResearchProvider) => Promise<FeedItem[]>,
    cap: number,
  ): Promise<FeedItem[]> {
    const batches = await Promise.all(this.providers.map((p) => settle(call(p))))
    // Sanitize in the data layer so every provider's output is normalized to
    // clean plain text before the UI ever sees it, then de-dupe, sort
    // newest-first, and cap.
    const cleaned = cleanFeedItems(batches.flat())
    return dedupe(cleaned).sort(byNewest).slice(0, cap)
  }

  async getLatestNews(topicIds: string[]): Promise<FeedItem[]> {
    if (topicIds.length === 0) return []
    return this.cached('news', topicIds, () =>
      this.gather((p) => p.getLatestNews(topicIds), 12),
    )
  }

  async getRecentPublications(topicIds: string[]): Promise<FeedItem[]> {
    if (topicIds.length === 0) return []
    return this.cached('publications', topicIds, () =>
      this.gather((p) => p.getRecentPublications(topicIds), 12),
    )
  }

  async getRecentPapers(topicIds: string[]): Promise<FeedItem[]> {
    if (topicIds.length === 0) return []
    return this.cached('papers', topicIds,() =>
      this.gather((p) => p.getRecentPapers(topicIds), 12),
    )
  }

  async getTrending(topicIds: string[]): Promise<TrendingItem[]> {
    if (topicIds.length === 0) return []
    return this.cached('trending', topicIds, async () => {
      // Prefer providers that supply trends; otherwise derive from titles.
      const supplied = (
        await Promise.all(this.providers.map((p) => settle(p.getTrending(topicIds))))
      ).flat()
      if (supplied.length > 0) return supplied.slice(0, 10)

      const news = await this.gather((p) => p.getLatestNews(topicIds), 40)
      const freq = new Map<string, number>()
  for (const it of news) {
        for (const w of it.title.toLowerCase().match(/[a-z][a-z-]{2,}/g) ?? []) {
          if (STOP.has(w)) continue
          freq.set(w, (freq.get(w) ?? 0) + 1)
        }
      }
      return [...freq.entries()]
        .filter(([, n]) => n > 1)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([w], i) => ({
          id: `trend:${w}`,
          label: w.replace(/\b\w/g, (c) => c.toUpperCase()),
          topicId: topicIds[i % topicIds.length],
          url: `https://news.google.com/search?q=${encodeURIComponent(w)}`,
        }))
    })
  }
}

// Re-export for callers that want a topic label from an id (dashboard chips).
export { getTopicDef }