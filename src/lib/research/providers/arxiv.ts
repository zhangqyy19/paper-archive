import type { FeedItem, NamedProvider, ResearchProvider, TrendingItem } from '../provider'
import { topicArxivCats, topicQuery } from '../taxonomy'

// arXiv provider — free, no API key. The public Atom API returns recent
// e-prints for a category or search query. We map arXiv results to the
// normalized `paper` kind. Only topics that declare arXiv categories in the
// taxonomy are queried here; everything else is skipped (returns []).
//
// Docs: https://info.arxiv.org/help/api/user-manual.html

const API = 'https://export.arxiv.org/api/query'

function textOf(el: Element | null, tag: string): string {
  const node = el?.getElementsByTagName(tag)[0]
  return node?.textContent?.trim() ?? ''
}

function parseAtom(xml: string, topicId: string, max: number): FeedItem[] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  if (doc.getElementsByTagName('parsererror').length > 0) return []
  const entries = Array.from(doc.getElementsByTagName('entry'))
  return entries.slice(0, max).map((entry) => {
    const id = textOf(entry, 'id') || `${topicId}-${Math.random()}`
    // Prefer the canonical abstract link.
    let url = id
    const links = Array.from(entry.getElementsByTagName('link'))
    const alt = links.find((l) => l.getAttribute('rel') === 'alternate')
    if (alt?.getAttribute('href')) url = alt.getAttribute('href') as string
    const authors = Array.from(entry.getElementsByTagName('author'))
      .map((a) => textOf(a, 'name'))
      .filter(Boolean)
    const published = textOf(entry, 'published').slice(0, 10) || undefined
    return {
      id: `arxiv:${id}`,
      kind: 'paper' as const,
      title: textOf(entry, 'title').replace(/\s+/g, ' '),
      summary: textOf(entry, 'summary').replace(/\s+/g, ' ').slice(0, 280),
      source: 'arXiv',
      publishedAt: published,
      url,
      topicId,
      authors: authors.length ? authors : undefined,
    }
  })
}

async function fetchTopic(topicId: string, max: number): Promise<FeedItem[]> {
  const cats = topicArxivCats(topicId)
  // Category search when the topic maps to arXiv; otherwise an all-fields query.
  const searchQuery = cats.length
    ? cats.map((c) => `cat:${c}`).join('+OR+')
    : `all:${encodeURIComponent(topicQuery(topicId))}`
  const url =
    `${API}?search_query=${searchQuery}` +
    `&sortBy=submittedDate&sortOrder=descending&max_results=${max}`
  const res = await fetch(url)
  if (!res.ok) return []
  const xml = await res.text()
  return parseAtom(xml, topicId, max)
}

export class ArxivProvider implements ResearchProvider, NamedProvider {
  readonly name = 'arXiv'

  // arXiv only maps to topics with categories; skip ones without to save calls.
  private eligible(topicIds: string[]): string[] {
    return topicIds.filter((id) => topicArxivCats(id).length > 0)
  }

  async getRecentPapers(topicIds: string[]): Promise<FeedItem[]> {
    const ids = this.eligible(topicIds)
    if (ids.length === 0) return []
    const perTopic = Math.max(3, Math.ceil(12 / ids.length))
    const batches = await Promise.all(ids.map((id) => fetchTopic(id, perTopic)))
    return batches.flat()
  }

  // arXiv doubles as a "publications" source for scientific topics.
  async getRecentPublications(topicIds: string[]): Promise<FeedItem[]> {
    const items = await this.getRecentPapers(topicIds)
    return items.map((it) => ({ ...it, kind: 'publication' as const }))
  }

  async getLatestNews(): Promise<FeedItem[]> {
    return []
  }

  async getTrending(): Promise<TrendingItem[]> {
    return []
  }
}