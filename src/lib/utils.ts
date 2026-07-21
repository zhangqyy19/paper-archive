/** Generate a stable unique id (uses crypto.randomUUID when available). */
export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/** Current time as an ISO string. */
export function now(): string {
  return new Date().toISOString()
}

/** Join class names, skipping falsy values. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

/** A human, cozy "last edited" phrasing. */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diff = Date.now() - then
  const min = 60_000
  const hour = 60 * min
  const day = 24 * hour

  if (diff < min) return 'just now'
  if (diff < hour) {
    const m = Math.floor(diff / min)
    return `${m} minute${m === 1 ? '' : 's'} ago`
  }
  if (diff < day) {
    const h = Math.floor(diff / hour)
    return `${h} hour${h === 1 ? '' : 's'} ago`
  }
  if (diff < 7 * day) {
    const d = Math.floor(diff / day)
    return `${d} day${d === 1 ? '' : 's'} ago`
  }
  return formatDate(iso)
}

/** A calm, readable full date, e.g. "April 18, 2026". */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** A compact date + time, e.g. "Apr 18, 2:07 PM" — used for "Updated" stamps. */
export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** Today as a calendar date string "YYYY-MM-DD" in the user's local time. */
export function todayYmd(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Format a calendar date string "YYYY-MM-DD" as "YYYY/MM/DD" — a locale-neutral
 * English numeric format. Parsed manually to avoid timezone drift (which a bare
 * `new Date("YYYY-MM-DD")` would introduce by assuming UTC).
 */
export function formatYmd(ymd: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd)
  if (!match) return ''
  const [, y, m, d] = match
  return `${y}/${m}/${d}`
}

/** Debounce a function by `wait` ms. Returns a cancelable wrapper. */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  wait: number,
): ((...args: A) => void) & { cancel: () => void; flush: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null
  let lastArgs: A | null = null
  const wrapped = (...args: A) => {
    lastArgs = args
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      if (lastArgs) fn(...lastArgs)
    }, wait)
  }
  wrapped.cancel = () => {
    if (timer) clearTimeout(timer)
    timer = null
  }
  wrapped.flush = () => {
    if (timer && lastArgs) {
      clearTimeout(timer)
      timer = null
      fn(...lastArgs)
    }
  }
  return wrapped
}

/**
 * Replace plain typed fractions like "3/4" or "1 1/2" with a typographic
 * fraction wrapped in a styled span, so it renders as one number over another.
 * Only touches whole-number/whole-number patterns on word boundaries, leaving
 * things like dates ("2026/07/21") or paths untouched by requiring the whole
 * token to be a bare fraction.
 *
 * Returns HTML. Callers apply it to freshly typed text in the ingredients area.
 */
export function formatFractions(html: string): string {
  // Match a numerator/denominator not already inside our fraction span and not
  // part of a longer number (e.g. avoid 12/2026). Optional leading whole number.
  return html.replace(
    /(^|[\s(>])(\d+)\/(\d+)(?=$|[\s.,;:)<])/g,
    (_m, pre: string, num: string, den: string) =>
      `${pre}<span class="frac" contenteditable="false" data-frac="${num}/${den}">` +
      `<sup>${num}</sup><span class="frac__bar">\u2044</span><sub>${den}</sub></span>`,
  )
}

/**
 * Turn a pasted video URL into an embeddable iframe src. Supports YouTube and
 * Vimeo; falls back to the original URL (useful for direct video files or
 * already-embeddable links). Returns null if the URL looks unusable.
 */
export function toVideoEmbedUrl(raw: string): string | null {
  const url = raw.trim()
  if (!url) return null
  // YouTube: youtu.be/ID, watch?v=ID, /embed/ID, /shorts/ID
  const yt =
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/.exec(
      url,
    )
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  // Vimeo: vimeo.com/ID
  const vimeo = /vimeo\.com\/(?:video\/)?(\d+)/.exec(url)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  // Otherwise, accept http(s) URLs as-is (e.g. a direct .mp4).
  if (/^https?:\/\//i.test(url)) return url
  return null
}

/** A short, friendly hostname label for a link (e.g. "seriouseats.com"). */
export function hostLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}