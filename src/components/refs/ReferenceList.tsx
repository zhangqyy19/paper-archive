import { useEffect, useState } from 'react'
import type { Book, Entry, EntryRef } from '@/models/types'
import { useLibrary } from '@/lib/LibraryContext'
import { getFormat } from '@/models/formats'
import { Icon, type IconName } from '@/components/ui/Icon'
import './ReferenceList.css'

interface ResolvedRef {
  ref: EntryRef
  book?: Book
  entry?: Entry
}

interface ReferenceListProps {
  refs: EntryRef[]
  /** Jump to the referenced entry (same-book handled by parent). */
  onOpen?: (ref: EntryRef, entry: Entry) => void
  onRemove?: (refId: string) => void
}

/**
 * Renders reference cards by resolving each EntryRef's live book + entry from
 * storage. Titles are read fresh every time, so renaming a linked entry keeps
 * the card label in sync automatically. A ref whose target was deleted renders
 * as a dimmed "missing" card the user can clear.
 */
export function ReferenceList({ refs, onOpen, onRemove }: ReferenceListProps) {
  const { repo, books } = useLibrary()
  const [resolved, setResolved] = useState<ResolvedRef[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const out = await Promise.all(
        refs.map(async (ref) => {
          const book = books.find((b) => b.id === ref.bookId)
          const entry = await repo.getEntry(ref.entryId)
          return { ref, book, entry: entry ?? undefined }
        }),
      )
      if (!cancelled) setResolved(out)
    })()
    return () => {
      cancelled = true
    }
    // Re-resolve when the set of refs changes or the library list updates
    // (a rename bumps the book's updatedAt, refreshing `books`).
  }, [repo, books, refs])

  if (refs.length === 0) return null

  return (
    <ul className="reflist">
      {resolved.map(({ ref, book, entry }) => {
        const missing = !entry
        const fmt = book ? getFormat(book.format) : null
        return (
          <li key={ref.id} className={`refcard${missing ? ' is-missing' : ''}`}>
            <button
              type="button"
              className="refcard__body"
              disabled={missing}
              onClick={() => entry && onOpen?.(ref, entry)}
            >
              <span className="refcard__icon">
                <Icon
                  name={(fmt?.icon as IconName) ?? 'book'}
                  size={16}
               />
              </span>
              <span className="refcard__text">
                <span className="refcard__title">
                  {missing ? 'Linked entry removed' : entry!.title || 'Untitled'}
                </span>
                <span className="refcard__book">
                  {book?.title ?? 'Unknown journal'}
                </span>
              </span>
            </button>
            {onRemove && (
              <button
                type="button"
                className="refcard__remove"
                onClick={() => onRemove(ref.id)}
                aria-label="Remove reference"
              >
                <Icon name="close" size={13} />
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}