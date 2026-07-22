import type { FeedItem, TrendingItem } from './provider'
import { todayYmd } from '@/lib/utils'

// Persistent, browser-local cache for research dashboard sections.
//
// The dashboard should feel like Apple News / Google News: opening a notebook
// shows cached content instantly, and the data layer decides whether that
// cached content is still fresh or needs a background refresh. This module owns
// the "is it stale?" policy and the localStorage read/write; the provider and
// UI stay agnostic about storage details.
//
// Freshness policy: a cache entry is stale when it is older than 24 hours OR it
// was written on an earlier calendar day (so "today's news" appears each new
// day even if less than 24h has passed since last night's fetch).

const STORAGE_PREFIX = 'research-cache:'
const MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24 hours

/** The cached payload for one notebook's dashboard sections. */
export interface CachedSections {
  news: FeedItem[]
  publications: FeedItem[]
  trending: TrendingItem[]
}

interface CacheRecord {
  /** Epoch ms when the entry was written. */
  at: number
  /** Calendar day (YYYY-MM-DD, local) the entry was written. */
  day: string
  data: CachedSections
}

/** Stable key for a set of topic ids (order-independent). */
function keyFor(topicIds: string[]): string {
  return STORAGE_PREFIX + [...topicIds].sort().join(',')
}

function safeStorage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null
  } catch {
    return null
  }
}

/** Read the raw cache record for a topic set, or null if absent/corrupt. */
function readRecord(topicIds: string[]): CacheRecord | null {
  const store = safeStorage()
  if (!store) return null
  try {
    const raw = store.getItem(keyFor(topicIds))
    if (!raw) return null
    const rec = JSON.parse(raw) as CacheRecord
    if (!rec || typeof rec.at !== 'number' || !rec.data) return null
    return rec
  } catch {
    return null
  }
}

/** True when a cache record is missing, older than 24h, or from a prior day. */
export function isStale(topicIds: string[], nowMs = Date.now()): boolean {
  const rec = readRecord(topicIds)
  if (!rec) return true
  if (nowMs - rec.at > MAX_AGE_MS) return true
  if (rec.day !== todayYmd()) return true
  return false
}

/** Return cached sections regardless of freshness (for instant first paint). */
export function readCache(topicIds: string[]): CachedSections | null {
  const rec = readRecord(topicIds)
  return rec ? rec.data : null
}

/** The timestamp (epoch ms) the cache was last written, or null. */
export function cacheTimestamp(topicIds: string[]): number | null {
  const rec = readRecord(topicIds)
  return rec ? rec.at : null
}

/** Persist freshly fetched sections along with the current time and day. */
export function writeCache(topicIds: string[], data: CachedSections): number {
  const store = safeStorage()
  const at = Date.now()
  if (!store) return at
  const rec: CacheRecord = { at, day: todayYmd(), data }
  try {
    store.setItem(keyFor(topicIds), JSON.stringify(rec))
  } catch {
    // Quota or serialization failure — the app still works without the cache.
  }
  return at
}

/** Remove a topic set's cache entry (used when forcing a manual refresh). */
export function clearCache(topicIds: string[]): void {
  const store = safeStorage()
  if (!store) return
  try {
    store.removeItem(keyFor(topicIds))
  } catch {
    // Ignore — clearing is best-effort.
  }
}