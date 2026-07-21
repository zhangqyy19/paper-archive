/**
 * Lightweight geocoding via OpenStreetMap's Nominatim service.
 *
 * No API key is required. We ask for a short list of candidates so the search
 * bar can suggest "Kyoto → Kyoto, Japan" and pin the chosen result.
 *
 * Nominatim asks callers to keep request volume modest and to identify the
 * app; we debounce in the UI and send a descriptive Referer via the browser.
 */

export interface GeocodeResult {
  /** Canonical, human-readable name, e.g. "Kyoto, Kyoto Prefecture, Japan". */
  name: string
  /** A shorter label good for pins/inputs, e.g. "Kyoto, Japan". */
  shortName: string
  lat: number
  lng: number
}

const ENDPOINT = 'https://nominatim.openstreetmap.org/search'

/** Build a concise "City, Country" label from a verbose display name. */
function toShortName(display: string): string {
  const parts = display.split(',').map((p) => p.trim())
  if (parts.length <= 2) return display
  const city = parts[0]
  const country = parts[parts.length - 1]
  return `${city}, ${country}`
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
  url.searchParams.set('q', q)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '5')
  url.searchParams.set('addressdetails', '0')

  const res = await fetch(url.toString(), {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`)

  const raw: Array<{
    display_name: string
    lat: string
    lon: string
  }> = await res.json()

  return raw
    .map((r) => {
      const lat = Number(r.lat)
      const lng = Number(r.lon)
      if (Number.isNaN(lat) || Number.isNaN(lng)) return null
      return {
        name: r.display_name,
        shortName: toShortName(r.display_name),
        lat,
        lng,
      } satisfies GeocodeResult
    })
    .filter((r): r is GeocodeResult => r !== null)
}