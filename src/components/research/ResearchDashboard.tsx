import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Book, ResearchData, ResearchTopic } from '@/models/types'
import {
  getResearchProvider,
  refreshResearchProvider,
} from '@/lib/research/mockProvider'
import type { FeedItem, TrendingItem } from '@/lib/research/provider'
import {
  cacheTimestamp,
  isStale,
  readCache,
  writeCache,
} from '@/lib/research/newsCache'
import { getTopicDef } from '@/lib/research/taxonomy'
import { formatDate, relativeTime } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'
import { TopicAutocomplete } from './TopicAutocomplete'
import './ResearchDashboard.css'

interface ResearchDashboardProps {
  book: Book
  /** Persist topic/source edits back to the book (book-level research data). */
  onSave: (research: ResearchData) => void
}

function emptyResearch(): ResearchData {
  return { topics: [], savedSources: [] }
}

interface Sections {
  news: FeedItem[]
  publications: FeedItem[]
  trending: TrendingItem[]
}

const EMPTY_SECTIONS: Sections = { news: [], publications: [], trending: [] }

/**
 * The Research Notebook's front page: a live, aggregated dashboard for the
 * notebook's topics, plus lightweight editing of the topics that drive it.
 * Content comes from a swappable ResearchProvider (see lib/research), so this
 * UI never changes when sources are added or replaced. Every section degrades
 * to a graceful empty state instead of an error.
 */
export function ResearchDashboard({ book, onSave }: ResearchDashboardProps) {
  const research = book.research ?? emptyResearch()
  const topics = research.topics ?? []
  const topicIds = useMemo(() => topics.map((t) => t.id), [topics])

  const [sections, setSections] = useState<Sections>(EMPTY_SECTIONS)
  const [loading, setLoading] = useState(false)
  const [refreshedAt, setRefreshedAt] = useState<number | null>(null)

  // A monotonically-increasing token guards against out-of-order fetches: if
  // the topic set changes (or a manual refresh fires) while a slower request is
  // still in flight, the stale response is discarded instead of overwriting the
  // newer one.
  const fetchToken = useRef(0)

  // Fetch fresh sections from the providers and persist them to the cache.
  // `force` bypasses both the provider's in-memory cache and our persisted one
  // — the manual Refresh button always shows what's newest right now.
  const fetchLive = useCallback(
    async (force: boolean) => {
      if (topicIds.length === 0) {
        setSections(EMPTY_SECTIONS)
        setRefreshedAt(null)
        return
      }
      const token = ++fetchToken.current
      setLoading(true)
      const provider = force ? refreshResearchProvider() : getResearchProvider()
      const [news, publications, trending] = await Promise.all([
        provider.getLatestNews(topicIds),
        provider.getRecentPublications(topicIds),
        provider.getTrending(topicIds),
      ])
      // A newer request superseded this one — drop the result.
      if (token !== fetchToken.current) return
      const next: Sections = { news, publications, trending }
      setSections(next)
      const at = writeCache(topicIds, next)
      setRefreshedAt(at)
      setLoading(false)
    },
    [topicIds],
  )

  // On mount / topic change: paint cached content instantly for a responsive
  // feel, then auto-refresh in the background only when the cache is stale
  // (older than 24h or from a previous calendar day). The user never has to
  // manually refresh just to see today's news.
  useEffect(() => {
    if (topicIds.length === 0) {
      setSections(EMPTY_SECTIONS)
      setRefreshedAt(null)
      return
    }
    const cached = readCache(topicIds)
    if (cached) {
      setSections(cached)
      setRefreshedAt(cacheTimestamp(topicIds))
    }
    if (isStale(topicIds)) {
      void fetchLive(false)
    }
  }, [topicIds, fetchLive])

  // Manual refresh always bypasses every cache. Scroll position is naturally
  // preserved because we mutate section state in place rather than remounting.
  const refresh = () => void fetchLive(true)

  const addTopic = (topic: ResearchTopic) => {
    if (topics.some((t) => t.id === topic.id)) return
    onSave({ ...research, topics: [...topics, topic] })
  }

  const removeTopic = (id: string) => {
    onSave({ ...research, topics: topics.filter((t) => t.id !== id) })
  }

  const hasTopics = topics.length > 0

  // Re-render every 30s so the relative "Updated …" label keeps ticking
  // ("just now" → "2 minutes ago") without any user interaction.
  const [, forceTick] = useState(0)
  useEffect(() => {
    if (!refreshedAt) return
    const id = setInterval(() => forceTick((n) => n + 1), 30_000)
    return () => clearInterval(id)
  }, [refreshedAt])

  return (
    <div className="research">
      <header className="research__head">
        <div>
          <h1 className="research__title">{book.title}</h1>
          <p className="research__sub">
            A living dashboard for your topics — news, publications, and trends.
          </p>
        </div>
        <div className="research__head-actions">
          {refreshedAt && (
            <span className="research__refreshed">
              {loading
                ? 'Updating…'
                : `Updated ${relativeTime(new Date(refreshedAt).toISOString())}`}
            </span>
          )}
          <button
            type="button"
            className="research__refresh"
            onClick={refresh}
            disabled={!hasTopics || loading}
          >
            <Icon
              name="refresh"
              size={15}
              className={loading ? 'research__refresh-icon--spin' : undefined}
            />{' '}
            Refresh
          </button>
        </div>
      </header>

      <section className="research__topics">
        <div className="research__chips">
          {topics.map((t) => (
            <span key={t.id} className="research__chip">
              {getTopicDef(t.id)?.label ?? t.label}
              <button
                type="button"
                className="research__chip-x"
                onClick={() => removeTopic(t.id)}
                aria-label={`Remove ${t.label}`}
              >
                <Icon name="close" size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="research__topic-input">
          <TopicAutocomplete selected={topics} onAdd={addTopic} />
        </div>
      </section>

      {!hasTopics ? (
        <div className="research__blank">
          <Icon name="compass" size={28} />
          <p>Add a topic above to start aggregating live research.</p>
        </div>
      ) : (
        <div className="research__grid">
          <FeedColumn
            title="Latest News"
            icon="newspaper"
            items={sections.news}
            loading={loading}
          />
          <FeedColumn
            title="Recent Publications"
            icon="book"
            items={sections.publications}
            loading={loading}
          />
          <TrendingColumn items={sections.trending} loading={loading} />
        </div>
      )}
    </div>
  )
}

function topicLabel(id: string): string {
  return getTopicDef(id)?.label ?? id
}

function FeedColumn({
  title,
  icon,
  items,
  loading,
}: {
  title: string
  icon: 'newspaper' | 'book'
  items: FeedItem[]
  loading: boolean
}) {
  return (
    <section className="research__col">
      <h2 className="research__col-title">
        <Icon name={icon} size={16} /> {title}
      </h2>
      {loading && items.length === 0 ? (
        <p className="research__hint">Gathering the latest…</p>
      ) : items.length === 0 ? (
        <p className="research__hint">Nothing here yet.</p>
      ) : (
        <ul className="research__items">
          {items.map((it) => (
            <li key={it.id} className="research__item">
              <a
                href={it.url}
                target="_blank"
                rel="noreferrer"
                className="research__item-title"
              >
                {it.title}
              </a>
              {it.summary && <p className="research__item-summary">{it.summary}</p>}
              <div className="research__item-meta">
                <span className="research__item-source">{it.source}</span>
                <span className="research__item-topic">{topicLabel(it.topicId)}</span>
                {it.publishedAt && (
                  <span className="research__item-date">{formatDate(it.publishedAt)}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function TrendingColumn({ items, loading }: { items: TrendingItem[]; loading: boolean }) {
  return (
    <section className="research__col">
      <h2 className="research__col-title">
        <Icon name="trending" size={16} /> Trending Topics
      </h2>
      {loading && items.length === 0 ? (
        <p className="research__hint">Gathering the latest…</p>
      ) : items.length === 0 ? (
        <p className="research__hint">Nothing trending yet.</p>
      ) : (
        <ul className="research__trends">
          {items.map((it) => (
            <li key={it.id}>
              {it.url ? (
                <a href={it.url} target="_blank" rel="noreferrer" className="research__trend">
                  {it.label}
                </a>
            ) : (
                <span className="research__trend">{it.label}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}