import type { FeedItem, NamedProvider, ResearchProvider, TrendingItem } from '../provider'
import { topicQuery } from '../taxonomy'

// Crossref provider — free, no API key, JSON REST API over scholarly metadata
// across virtually every discipline. Used as the cross-domain "publications"
// source (complements arXiv, which only covers STEM preprints).
//
// Docs: https://api.crossref.org/swagger-ui/index.html

const API = 'https://api.crossref.org/works'

interface CrossrefAuthor {
  given?: string
  family?: string
}

interface CrossrefItem {
  DOI?: string
  title?: string[]
  abstract?: string
  author?: CrossrefAuthor[]
  'container-title'?: string[]
  URL?: string
  published?: { 'date-parts'?: number[][] }
  created?: { 'date-time'?: string }
}

function dateOf(item: CrossrefItem): string | undefined {
  // Prefer `created` (when the record actually went online) over `published`:
  // journals often stamp `published` with a future issue date (e.g. a 2100
  // "volume year"), which would wrongly sort ahead of genuinely recent work.
  const created = item.created?.['date-time']?.slice(0, 10)
  const parts = item.published?.['date-parts']?.[0]
  let published: string | undefined
  if (parts && parts.length) {
    const [y, m = 1, d = 1] = parts
    published = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }
  // Use the earlier of the two when both exist, so a future `published` can't win.
  if (created && published) return created < published ? created : published
  return created ?? published
}

/** Drop items with no date or a date in the future (bad/preprint metadata). */
function isReal(item: FeedItem): boolean {
  if (!item.publishedAt) return false
  const today = new Date().toISOString().slice(0, 10)
  return item.publishedAt <= today
}

// Crossref registers DOIs before publishers backfill metadata, so many recent
// records carry placeholder titles (the link works, but the title isn't real
// yet). Reject those so only items with genuine titles surface.
const PLACEHOLDER_TITLE = /^(title\s*pending|no\s*title|untitled|n\/?a|\[?no title (available|found)\]?|placeholder)\b/i

function hasRealTitle(raw: string | undefined): boolean {
  const t = (raw ?? '').replace(/\s+/g, ' ').trim()
  if (t.length < 6) return false // too short to be a real article title
  if (PLACEHOLDER_TITLE.test(t)) return false
  return true
}

function authorsOf(item: CrossrefItem): string[] | undefined {
  const list = (item.author ?? [])
    .map((a) => [a.given, a.family].filter(Boolean).join(' '))
    .filter(Boolean)
  return list.length ? list : undefined
}

async function fetchTopic(topicId: string, rows: number): Promise<FeedItem[]> {
  const q = encodeURIComponent(topicQuery(topicId))
  // Over-fetch (×3) because we drop placeholder-title and future-dated records
  // below; ordering by most recent keeps genuinely new work on top.
  const url = `${API}?query=${q}&rows=${rows * 3}&sort=published&order=desc&select=DOI,title,abstract,author,container-title,URL,published,created`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) return []
  const json = (await res.json()) as { message?: { items?: CrossrefItem[] } }
  const items = json.message?.items ?? []
  return items
    .filter((it) => hasRealTitle(it.title?.[0]))
    .map((it, i) => ({
      id: `crossref:${it.DOI ?? `${topicId}-${i}`}`,
      kind: 'publication' as const,
      title: (it.title?.[0] ?? '').replace(/\s+/g, ' '),
      summary: (it.abstract ?? '')
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 280),
      source: it['container-title']?.[0] ?? 'Crossref',
      publishedAt: dateOf(it),
      url: it.URL ?? (it.DOI ? `https://doi.org/${it.DOI}` : API),
      topicId,
      authors: authorsOf(it),
    }))
    .filter(isReal)
    .slice(0, rows)
}

export class CrossrefProvider implements ResearchProvider, NamedProvider {
  readonly name = 'Crossref'

  async getRecentPublications(topicIds: string[]): Promise<FeedItem[]> {
    if (topicIds.length === 0) return []
    const perTopic = Math.max(3, Math.ceil(12 / topicIds.length))
    const batches = await Promise.all(topicIds.map((id) => fetchTopic(id, perTopic)))
    return batches.flat()
  }

  async getRecentPapers(): Promise<FeedItem[]> {
    return []
  }

  async getLatestNews(): Promise<FeedItem[]> {
    return []
  }

  async getTrending(): Promise<TrendingItem[]> {
    return []
  }
}