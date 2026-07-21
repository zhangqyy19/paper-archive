/**
 * Lightweight geocoding via the Open-Meteo Geocoding API.
 *
 * Chosen over OpenStreetMap/Nominatim because Open-Meteo is free, needs no API
 * key, and — crucially — sends permissive CORS headers, so browser requests
 * actually succeed instead of being blocked. We ask for a short list of
 * candidates so the search bar can suggest "Kyoto → Kyoto, Japan".
 *
 * Docs: https://open-meteo.com/en/docs/geocoding-api
 */

export interface GeocodeResult {
  /** Canonical, human-readable name, e.g. "Kyoto, Kyoto Prefecture, Japan". */
  name: string
  /** A shorter label good for pins/inputs, e.g. "Kyoto, Japan". */
  shortName: string
  lat: number
  lng: number
}

const ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search'

interface OpenMeteoPlace {
  name: string
  latitude: number
  longitude: number
  country?: string
  admin1?: string
}

/** Assemble a friendly "City, Region, Country" full name from API fields. */
function toFullName(p: OpenMeteoPlace): string {
  return [p.name, p.admin1, p.country].filter(Boolean).join(', ')
}

/** A concise "City, Country" label for pins and the input. */
function toShortName(p: OpenMeteoPlace): string {
  return [p.name, p.country].filter(Boolean).join(', ')
}

/**
 * Search for places matching a free-text query.
 * Pass an AbortSignal to cancel stale in-flight requests as the user types.
 */
export async function geocode(
  query: string,
  signal?: AbortSignal,
): Promise<GeocodeResult[]> {
  const q = query.trim()
  if (q.length < 2) return []

  const url = new URL(ENDPOINT)
  url.searchParams.set('name', q)
  url.searchParams.set('count', '5')
  url.searchParams.set('language', 'en')
  url.searchParams.set('format', 'json')

  // Guarantee the request never hangs forever: abort after 8s even if the
  // caller's signal never fires. We race the caller's signal with our timeout.
  const timeout = new AbortController()
  const timer = setTimeout(() => timeout.abort(), 8000)
  const onAbort = () => timeout.abort()
  signal?.addEventListener('abort', onAbort)

  let res: Response
  try {
    res = await fetch(url.toString(), {
      signal: timeout.signal,
      headers: { Accept: 'application/json' },
    })
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onAbort)
  }
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`)

  const data: { results?: OpenMeteoPlace[] } = await res.json()
  const results = data.results ?? []

  return results
    .map((p) => {
      const lat = Number(p.latitude)
      const lng = Number(p.longitude)
      if (Number.isNaN(lat) || Number.isNaN(lng)) return null
      return {
        name: toFullName(p),
        shortName: toShortName(p),
        lat,
        lng,
      } satisfies GeocodeResult
    })
    .filter((r): r is GeocodeResult => r !== null)
}