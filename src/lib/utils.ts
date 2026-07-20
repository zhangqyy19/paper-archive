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