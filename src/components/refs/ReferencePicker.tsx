import { useEffect, useMemo, useRef, useState } from 'react'
import type { Book, Entry, EntryRef } from '@/models/types'
import { useLibrary } from '@/lib/LibraryContext'
import { getFormat } from '@/models/formats'
import { uid } from '@/lib/utils'
import { Icon, type IconName } from '@/components/ui/Icon'
import './ReferencePicker.css'

interface ReferencePickerProps {
  /** The book the current entry lives in — used to label "this journal". */
  currentBookId: string
  /** Entry ids already referenced, so we can dim / disable duplicates. */
  existing: EntryRef[]
  onPick: (ref: EntryRef) => void
  onClose: () => void
}

/**
 * A two-step overlay for inserting a cross-journal reference: pick a book,
 * then pick one of its entries. References are stored by IDs (see EntryRef),
 * never by copied text, so a later title change reflows automatically.
 */
export function ReferencePicker({
  currentBookId,
  existing,
  onPick,
  onClose,
}: ReferencePickerProps) {
  const { repo, books } = useLibrary()
  const [bookId, setBookId] = useState<string | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on Escape or outside click.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const onDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [onClose])

  // Load entries whenever a book is selected.
  useEffect(() => {
    if (!bookId) return
    let cancelled = false
    setLoading(true)
    ;(async () => {
      const list = await repo.listEntries(bookId)
      if (!cancelled) {
        setEntries(list)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [repo, bookId])

  const sortedBooks = useMemo<Book[]>(() => {
    // Current book first, then most recently updated.
    return [...books].sort((a, b) => {
      if (a.id === currentBookId) return -1
      if (b.id === currentBookId) return 1
      return b.updatedAt.localeCompare(a.updatedAt)
    })
  }, [books, currentBookId])

  const activeBook = bookId ? books.find((b) => b.id === bookId) : null

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return entries
    return entries.filter((e) => e.title.toLowerCase().includes(q))
  }, [entries, query])

  const alreadyRef = (entryId: string) =>
    existing.some((r) => r.entryId === entryId)

  const pickEntry = (entry: Entry) => {
    if (alreadyRef(entry.id)) return
    onPick({ id: uid(), bookId: entry.bookId, entryId: entry.id })
  }

  return (
    <div className="refpick__scrim" role="dialog" aria-modal="true">
      <div className="refpick" ref={panelRef}>
        <header className="refpick__head">
          {bookId ? (
            <button
              type="button"
              className="refpick__back"
              onClick={() => {
                setBookId(null)
                setQuery('')
              }}
            >
              <Icon name="chevronLeft" size={16} /> Books
            </button>
          ) : (
            <span className="refpick__title">Link another entry</span>
          )}
          <button
            type="button"
            className="refpick__close"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon name="close" size={16} />
          </button>
        </header>

        {!bookId ? (
          <ul className="refpick__books">
            {sortedBooks.map((b) => {
              const fmt = getFormat(b.format)
              return (
                <li key={b.id}>
                  <button
                    type="button"
                    className="refpick__book"
                    onClick={() => setBookId(b.id)}
                  >
                    <Icon name={fmt.icon as IconName} size={18} />
                    <span className="refpick__book-name">{b.title}</span>
                    {b.id === currentBookId && (
                      <span className="refpick__badge">this journal</span>
                    )}
                    <Icon name="chevronDown" size={15} />
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="refpick__entries">
            <div className="refpick__book-label">
              {activeBook?.title}
            </div>
            <div className="refpick__search">
              <Icon name="search" size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter entries…"
                aria-label="Filter entries"
                autoFocus
              />
            </div>
            {loading ? (
              <p className="refpick__empty">Loading…</p>
            ) : filtered.length === 0 ? (
              <p className="refpick__empty">No entries here yet.</p>
            ) : (
              <ul className="refpick__list">
                {filtered.map((e) => {
                  const used = alreadyRef(e.id)
                  return (
                    <li key={e.id}>
                      <button
                        type="button"
                        className="refpick__entry"
                        onClick={() => pickEntry(e)}
                        disabled={used}
                      >
                        <span className="refpick__entry-name">
                          {e.title || 'Untitled'}
                        </span>
                        {used ? (
                          <span className="refpick__linked">
                            <Icon name="check" size={14} /> linked
                          </span>
                        ) : (
                          <Icon name="plus" size={15} />
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}