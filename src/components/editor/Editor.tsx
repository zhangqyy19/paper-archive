import { useEffect, useRef, useState } from 'react'
import type { Entry } from '@/models/types'
import { useAutoSave, type SaveStatus } from '@/lib/useAutoSave'
import { formatDate } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'
import { DatePicker } from '@/components/ui/DatePicker'
import './Editor.css'

interface EditorProps {
  entry: Entry
  showDate?: boolean
  onSave: (patch: {
    title: string
    content: string
    entryDate?: string
  }) => Promise<void> | void
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

export function Editor({ entry, showDate = false, onSave }: EditorProps) {
  const [title, setTitle] = useState(entry.title)
  const [content, setContent] = useState(entry.content)
  const [entryDate, setEntryDate] = useState(entry.entryDate ?? '')
  const areaRef = useRef<HTMLTextAreaElement>(null)

  // Reset local state when switching to a different entry.
  useEffect(() => {
    setTitle(entry.title)
    setContent(entry.content)
    setEntryDate(entry.entryDate ?? '')
  }, [entry.id])

  // Auto-grow the textarea to fit content.
  useEffect(() => {
    const el = areaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [content])

  const { status } = useAutoSave({
    value: { title, content, entryDate: showDate ? entryDate : undefined },
    onSave,
    delay: 700,
  })

  return (
    <div className="editor">
      <div className="editor__bar">
        {showDate ? (
          <DatePicker
            value={entryDate}
            onChange={setEntryDate}
            ariaLabel="Entry date"
          />
        ) : (
          <span className="editor__date">{formatDate(entry.updatedAt)}</span>
        )}
        <StatusLabel status={status} />
      </div>

      <div className="editor__paper">
        <input
          className="editor__title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          aria-label="Entry title"
        />
        <textarea
          ref={areaRef}
          className="editor__content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Begin writing…"
          aria-label="Entry content"
        />
      </div>
    </div>
  )
}