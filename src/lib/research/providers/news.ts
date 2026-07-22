import type { FeedItem, NamedProvider, ResearchProvider, TrendingItem } from '../provider'
import { topicKeywords, topicQuery } from '../taxonomy'

// News provider — Google News RSS, free and no API key. Browsers can't read the
// feed directly (no CORS headers), so we route through a public CORS proxy and
// degrade to [] if the proxy or feed is unavailable. Swapping in a dedicated
// News API later means replacing only this file.

// Public CORS proxies that return the raw body. We try them in order and fall
// back to the next one if a proxy is down (e.g. allorigins started returning
// 520s), so a single flaky proxy no longer empties the whole dashboard. Each
// entry maps a target URL to a fully-formed proxied URL.
const PROXIES: Array<(target: string) => string> = [
  (t) => `https://corsproxy.io/?url=${encodeURIComponent(t)}`,
  (t) => `https://api.allorigins.win/raw?url=${encodeURIComponent(t)}`,
  (t) => `https://thingproxy.freeboard.io/fetch/${t}`,
]

// Fetch a URL through the proxy list, returning the first response body that
// looks like a valid RSS feed. Returns '' when every proxy fails.
async function fetchViaProxy(target: string): Promise<string> {
  for (const proxy of PROXIES) {
    try {
      const res = await fetch(proxy(target))
      if (!res.ok) continue
      const body = await res.text()
      // A working feed contains RSS items; anything else is an error page.
      if (body.includes('<item')) return body
    } catch {
      // Network/CORS error on this proxy — try the next one.
    }
  }
  return ''
}

function feedUrl(query: string): string {
  // Quote the query so Google News treats it as a phrase — a bare query like
  // "Political Science" otherwise matches unrelated pages (e.g. a university's
  // BS program). The phrase match keeps results on-topic.
  const phrase = query.includes(' ') ? `"${query}"` : query
  const q = encodeURIComponent(`${phrase} when:14d`)
  return `https://news.google.com/rss/search?q=${q}&hl=en-US&gl=US&ceid=US:en`
}

function textOf(el: Element | null, tag: string): string {
  const node = el?.getElementsByTagName(tag)[0]
  return node?.textContent?.trim() ?? ''
}

// Google News titles come as "Headline - Source"; split off the outlet.
function splitTitle(raw: string): { title: string; source: string } {
  const idx = raw.lastIndexOf(' - ')
  if (idx > 0) return { title: raw.slice(0, idx), source: raw.slice(idx + 3) }
  return { title: raw, source: 'Google News' }
}

function parseRss(xml: string, topicId: string, max: number): FeedItem[] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  if (doc.getElementsByTagName('parsererror').length > 0) return []
  const items = Array.from(doc.getElementsByTagName('item'))
  return items.slice(0, max).map((item, i) => {
    const raw = textOf(item, 'title')
    const { title, source } = splitTitle(raw)
    const pub = textOf(item, 'pubDate')
    const date = pub ? new Date(pub).toISOString().slice(0, 10) : undefined
    const desc = textOf(item, 'description')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    return {
      id: `news:${topicId}:${textOf(item, 'guid') || i}`,
      kind: 'news' as const,
      title,
      summary: desc.slice(0, 240),
      source,
      publishedAt: date,
      url: textOf(item, 'link'),
      topicId,
    }
  })
}

/** Keep only items whose title/summary actually mentions a topic keyword. */
function relevant(items: FeedItem[], keywords: string[]): FeedItem[] {
  if (keywords.length === 0) return items
  return items.filter((it) => {
    const hay = `${it.title} ${it.summary}`.toLowerCase()
    return keywords.some((kw) => hay.includes(kw))
  })
}

async function fetchTopic(topicId: string, max: number): Promise<FeedItem[]> {
  try {
    const target = feedUrl(topicQuery(topicId))
    const xml = await fetchViaProxy(target)
    if (!xml) return []
    // Over-fetch, then filter to genuinely on-topic items and trim to `max`.
    const parsed = parseRss(xml, topicId, max * 3)
    return relevant(parsed, topicKeywords(topicId)).slice(0, max)
  } catch {
    return []
  }
}

export class NewsProvider implements ResearchProvider, NamedProvider {
  readonly name = 'Google News'

  async getLatestNews(topicIds: string[]): Promise<FeedItem[]> {
    if (topicIds.length === 0) return []
    const perTopic = Math.max(4, Math.ceil(16 / topicIds.length))
    const batches = await Promise.all(topicIds.map((id) => fetchTopic(id, perTopic)))
    return batches.flat()
  }

  async getRecentPublications(): Promise<FeedItem[]> {
    return []
  }

  async getRecentPapers(): Promise<FeedItem[]> {
    return []
  }

  async getTrending(): Promise<TrendingItem[]> {
    return []
  }
}