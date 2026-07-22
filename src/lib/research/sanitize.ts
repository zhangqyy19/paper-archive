import type { FeedItem } from './provider'

// Text sanitization for content coming from external providers (news RSS,
// scholarly APIs, …). Feeds routinely embed HTML tags and encoded entities in
// titles and summaries — e.g. "Book Review: <em>Euler</em>". This
// module normalizes everything to clean, presentation-ready plain text so the
// UI never has to think about escaping. Applied in the data layer immediately
// after fetching, so every provider benefits from the same logic.

// Common named HTML entities we decode without needing the DOM. Numeric
// entities (&#39;, &#x27;) are handled separately below.
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '\u2013',
  mdash: '\u2014',
  hellip: '\u2026',
  laquo: '\u00ab',
  raquo: '\u00bb',
  lsquo: '\u2018',
  rsquo: '\u2019',
  ldquo: '\u201c',
  rdquo: '\u201d',
  copy: '\u00a9',
  reg: '\u00ae',
  trade: '\u2122',
  deg: '\u00b0',
  times: '\u00d7',
}

/** Decode HTML entities (named + decimal + hex numeric) into their characters. */
function decodeEntities(input: string): string {
  return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, body: string) => {
    if (body[0] === '#') {
      const isHex = body[1] === 'x' || body[1] === 'X'
      const code = parseInt(body.slice(isHex ? 2 : 1), isHex ? 16 : 10)
      if (Number.isNaN(code)) return match
      try {
        return String.fromCodePoint(code)
      } catch {
        return match
      }
    }
    const named = NAMED_ENTITIES[body.toLowerCase()]
    return named ?? match
  })
}

/**
 * Clean a raw string from an external provider into readable plain text:
 * strip HTML tags, decode entities (running twice to catch double-encoding
 * like "&lt;"), remove leftover markup, and normalize whitespace.
 */
export function cleanText(raw: string | undefined | null): string {
  if (!raw) return ''
  let text = raw
  // Decode first so entity-encoded tags like "<em>" become real tags,
  // then strip the tags. Decode again afterwards for double-encoded content.
  text = decodeEntities(text)
  text = text.replace(/<[^>]*>/g, '')
  text = decodeEntities(text)
  // Drop any stray angle-bracket fragments and control characters left behind.
  text = text.replace(/<\/?[a-zA-Z][^>]*$/g, '')
  text = text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
  // Collapse all whitespace runs (including newlines) into single spaces.
  text = text.replace(/\s+/g, ' ').trim()
  return text
}

/** Return a normalized copy of a FeedItem with clean title/summary/source. */
export function cleanFeedItem(item: FeedItem): FeedItem {
  return {
    ...item,
    title: cleanText(item.title),
    summary: cleanText(item.summary),
    source: cleanText(item.source),
    authors: item.authors?.map((a) => cleanText(a)).filter(Boolean),
  }
}

/** Normalize a batch of feed items. */
export function cleanFeedItems(items: FeedItem[]): FeedItem[] {
  return items.map(cleanFeedItem)
}