import { useMemo } from 'react'
import type { Entry } from '@/models/types'
import { formatDate } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'
import { WorldMap, type MapPin } from './WorldMap'
import './PlacesMap.css'

interface PlacesMapProps {
  entries: Entry[]
  activeId?: string | null
  onSelect: (id: string) => void
}

/** A located entry ready to plot: has a name + resolved coordinates. */
interface Located {
  entry: Entry
  name: string
  lat: number
  lng: number
  when?: string
}

export function PlacesMap({ entries, activeId, onSelect }: PlacesMapProps) {
  const located = useMemo<Located[]>(() => {
    return entries
      .map((entry): Located | null => {
        const loc = entry.travel?.location
        if (!loc || loc.lat == null || loc.lng == null) return null
        return {
          entry,
          name: loc.name,
          lat: loc.lat,
          lng: loc.lng,
          when: entry.travel?.dateVisited,
        }
      })
      .filter((x): x is Located => x !== null)
      .sort((a, b) => (b.when ?? '').localeCompare(a.when ?? ''))
  }, [entries])

  const pins = useMemo<MapPin[]>(
    () =>
      located.map((l) => ({
        id: l.entry.id,
        label: l.entry.title || l.name,
        lat: l.lat,
        lng: l.lng,
        sub: l.when ? formatDate(l.when) : undefined,
      })),
    [located],
  )

  if (located.length === 0) {
    return (
      <div className="placesmap">
        <header className="placesmap__head">
          <h2 className="placesmap__title">Places I’ve been</h2>
          <p className="placesmap__count">No places pinned yet</p>
        </header>

        <div className="placesmap__body placesmap__body--empty">
          <div className="placesmap__map">
            <WorldMap pins={[]} />
          </div>
          <div className="placesmap__hint">
            <Icon name="pin" size={18} />
            <p>
              Add a location to a travel entry and it’ll appear on your map.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="placesmap">
      <header className="placesmap__head">
        <h2 className="placesmap__title">Places I’ve been</h2>
        <p className="placesmap__count">
          {located.length} {located.length === 1 ? 'place' : 'places'} on the map
        </p>
      </header>

      <div className="placesmap__body">
        <div className="placesmap__map">
          <WorldMap pins={pins} activeId={activeId} onSelect={onSelect} />
        </div>

        <ul className="placesmap__list">
          {located.map((l) => (
            <li key={l.entry.id}>
              <button
                type="button"
                className={`placesmap__item${l.entry.id === activeId ? ' is-active' : ''}`}
                onClick={() => onSelect(l.entry.id)}
              >
                <span className="placesmap__item-icon">
                  <Icon name="pin" size={15} />
                </span>
                <span className="placesmap__item-text">
                  <span className="placesmap__item-title">
                    {l.entry.title || 'Untitled'}
                  </span>
                  <span className="placesmap__item-place">{l.name}</span>
                </span>
                {l.when && (
                  <span className="placesmap__item-date">
                    {formatDate(l.when)}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}