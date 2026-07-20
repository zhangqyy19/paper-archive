import { useState } from'react'
import type { Entry } from '@/models/types'
import { cx, relativeTime, formatYmd } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'
import './EntryList.css'

interface EntryListProps {
  entries: Entry[]
  activeId: string | null
  showDate?: boolean
  onSelect: (id: string) => void
  onReorder: (orderedIds: string[]) => void
}

export function EntryList({ entries, activeId, showDate = false, onSelect, onReorder }: EntryListProps) {
  const [dragId, setDragId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) {
      setDragId(null)
      setOverId(null)
      return
    }
    const ids = entries.map((e) => e.id)
    const from = ids.indexOf(dragId)
    const to = ids.indexOf(targetId)
    ids.splice(to, 0, ids.splice(from, 1)[0])
    onReorder(ids)
    setDragId(null)
    setOverId(null)
  }

  return (
    <ul className="entry-list">
      {entries.map((entry) => (
        <li
          key={entry.id}
          draggable
          onDragStart={() => setDragId(entry.id)}
          onDragOver={(e) => {
            e.preventDefault()
            setOverId(entry.id)
          }}
          onDrop={() => handleDrop(entry.id)}
          onDragEnd={() => {
            setDragId(null)
            setOverId(null)
          }}
          className={cx(
            'entry-item',
            entry.id === activeId && 'is-active',
            entry.id === dragId && 'is-dragging',
            entry.id === overId && !!dragId && 'is-over',
          )}
        >
          <span className="entry-item__grip" aria-hidden="true">
            <Icon name="grip" size={16} />
          </span>
          <button
            type="button"
            className="entry-item__button"
            onClick={() => onSelect(entry.id)}
          >
            <span className="entry-item__title">{entry.title || 'Untitled'}</span>
            <span className="entry-item__time">
              {showDate && entry.entryDate
                ? formatYmd(entry.entryDate)
                : relativeTime(entry.updatedAt)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}