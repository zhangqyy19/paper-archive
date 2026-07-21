import { useEffect, useRef, useState } from 'react'
import type { Entry, EntryRef, GeoLocation, TravelData } from '@/models/types'
import { useAutoSave, type SaveStatus } from '@/lib/useAutoSave'
import { geocode, type GeocodeResult } from '@/lib/geocode'
import { Icon } from '@/components/ui/Icon'
import { DatePicker } from '@/components/ui/DatePicker'
import { RichToolbar } from './RichToolbar'
import { ReferencesSection } from '@/components/refs/ReferencesSection'
import { WorldMap } from '@/components/map/WorldMap'
import './Editor.css'
import './TravelEditor.css'

interface TravelEditorProps {
  entry: Entry
  onSave: (patch: {
    title: string
    content: string
    travel: TravelData
    entryDate?: string
    refs: EntryRef[]
  }) => Promise<void> | void
  onOpenRef?: (ref: EntryRef, entry: Entry) => void
}

function StatusLabel({ status }: { status: SaveStatus }) {
  switch (status) {
    case 'saving':
      return <span className="editor__status">Saving…</span>
    case 'saved':
      return (
        <span className="editor__status is-saved">
          <Icon name="check" size={14} /> Saved
        </span>
      )
    case 'error':
      return <span className="editor__status is-error">Couldn’t save</span>
    default:
      return <span className="editor__status is-idle">All changes saved</span>
  }
}

/** Legacy plain-text entries render safely as line-preserved HTML. */
function toInitialHtml(raw: string): string {
  if (!raw) return ''
  if (/<[a-z][\s\S]*>/i.test(raw)) return raw
  const amp = String.fromCharCode(38) + 'amp;'
  const lt = String.fromCharCode(38) + 'lt;'
  const gt = String.fromCharCode(38) + 'gt;'
  return raw
    .replace(/&/g, amp)
    .replace(/</g, lt)
    .replace(/>/g, gt)
    .split(/\n/)
    .map((line) => `<div>${line || '<br>'}</div>`)
    .join('')
}

export function TravelEditor({ entry, onSave, onOpenRef }: TravelEditorProps) {
  const [title, setTitle] = useState(entry.title)
  const [content, setContent] = useState(entry.content)
  const [dateVisited, setDateVisited] = useState(entry.travel?.dateVisited ?? '')
  const [refs, setRefs] = useState<EntryRef[]>(entry.refs ?? [])

  // The confirmed, pinned location (null until the user picks a search result).
  const [location, setLocation] = useState<GeoLocation | null>(
    entry.travel?.location ?? null,
  )
  // The free-text search query shown in the bar.
  const [query, setQuery] = useState(entry.travel?.location?.name ?? '')
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [searching, setSearching] = useState(false)
  const [open, setOpen] = useState(false)

  const bodyRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)

  // Reset all state when switching to a different entry.
  useEffect(() => {
    setTitle(entry.title)
    setContent(entry.content)
    setDateVisited(entry.travel?.dateVisited ?? '')
    setRefs(entry.refs ?? [])
    setLocation(entry.travel?.location ?? null)
    setQuery(entry.travel?.location?.name ?? '')
    setResults([])
    setOpen(false)
    if (bodyRef.current) {
      bodyRef.current.innerHTML = toInitialHtml(entry.content)
    }
  }, [entry.id])

  // Debounced geocoding: as the user types, look up matching places.
  useEffect(() => {
    const q = query.trim()
    // Don't re-search when the query already matches the pinned place.
    if (!q || (location && q === location.name)) {
      setResults([])
      setSearching(false)
      return
    }
    const controller = new AbortController()
    setSearching(true)
    const t = setTimeout(async () => {
      try {
        const found = await geocode(q, controller.signal)
        setResults(found)
        setOpen(true)
      } catch (err) {
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          setResults([])
        }
      } finally {
        setSearching(false)
      }
    }, 450)
    return () => {
      clearTimeout(t)
      controller.abort()
    }
  }, [query, location])

  // Close the suggestions when clicking away.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const { status } = useAutoSave({
    value: {
      title,
      content,
      travel: {
        location: location ?? undefined,
        dateVisited: dateVisited || undefined,
      },
      entryDate: dateVisited || undefined,
      refs,
    },
    onSave,
    delay: 700,
  })

  const syncBody = () => {
    if (bodyRef.current) setContent(bodyRef.current.innerHTML)
  }

  const pick = (r: GeocodeResult) => {
    const loc: GeoLocation = {
      name: r.shortName,
      lat: r.lat,
      lng: r.lng,
      geocoded: true,
    }
    setLocation(loc)
    setQuery(r.shortName)
    setResults([])
    setOpen(false)
  }

  const clearLocation = () => {
    setLocation(null)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  return (
    <div className="editor travel">
      <div className="editor__bar">
        <DatePicker
          value={dateVisited}
          onChange={setDateVisited}
          ariaLabel="Date visited"
        />
        <StatusLabel status={status} />
      </div>

      <RichToolbar onCommand={syncBody} getEditor={() => bodyRef.current} />

      <div className="editor__paper travel__paper">
        <input
          className="editor__title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Where did you go?"
          aria-label="Entry title"
        />

        <div className="travel__place" ref={boxRef}>
          <div className="travel__search">
            <Icon name="pin" size={16} />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                if (location) setLocation(null)
              }}
              onFocus={() => results.length > 0 && setOpen(true)}
              placeholder="Search a place — e.g. Kyoto"
              aria-label="Search a place"
            />
            {searching && <span className="travel__spinner" aria-hidden />}
            {location && (
              <button
                type="button"
                className="travel__clear"
                onClick={clearLocation}
                aria-label="Clear location"
              >
                <Icon name="close" size={14} />
              </button>
            )}

            {open && results.length > 0 && (
              <ul className="travel__results" role="listbox">
                {results.map((r, i) => (
                  <li key={`${r.lat},${r.lng},${i}`}>
                    <button
                      type="button"
                      className="travel__result"
                      onClick={() => pick(r)}
                    >
                      <Icon name="pin" size={14} />
                      <span className="travel__result-text">
                        <span className="travel__result-name">
                          {r.shortName}
                        </span>
                        <span className="travel__result-full">{r.name}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {location?.lat != null && location?.lng != null && (
            <div className="travel__pinned">
              <WorldMap
                pins={[
                  {
                    id: entry.id,
                    label: location.name,
                    lat: location.lat,
                    lng: location.lng,
                  },
                ]}
                activeId={entry.id}
              />
            </div>
          )}
        </div>

        <div
          ref={bodyRef}
          className="editor__content travel__content"
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Entry content"
          data-placeholder="What happened here…"
          onInput={syncBody}
        />

        <ReferencesSection
          currentBookId={entry.bookId}
          refs={refs}
          onChange={setRefs}
          onOpen={onOpenRef}
          label="Linked places & notes"
        />
      </div>
    </div>
  )
}