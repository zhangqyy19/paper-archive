import { useEffect, useRef, useState } from 'react'
import type { Entry } from '@/models/types'
import { useAutoSave, type SaveStatus } from '@/lib/useAutoSave'
import { formatDate } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'
import { DatePicker } from '@/components/ui/DatePicker'
import { RichToolbar } from './RichToolbar'
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

/**
 * Older entries stored plain text. If the content has no HTML tags, escape it
 * and preserve line breaks so it renders correctly in the rich editor.
 */
function toInitialHtml(raw: string): string {
  if (!raw) return ''
  const looksLikeHtml = /<[a-z][\s\S]*>/i.test(raw)
  if (looksLikeHtml) return raw
  const amp = String.fromCharCode(38) + 'amp;'
  const lt = String.fromCharCode(38) + 'lt;'
  const gt = String.fromCharCode(38) + 'gt;'
  const escaped = raw
    .replace(/&/g, amp)
    .replace(/</g, lt)
    .replace(/>/g, gt)
  return escaped
    .split(/\n/)
    .map((line) => `<div>${line || '<br>'}</div>`)
    .join('')
}

export function Editor({ entry, showDate = false, onSave }: EditorProps) {
  const [title, setTitle] = useState(entry.title)
  const [content, setContent] = useState(entry.content)
  const [entryDate, setEntryDate] = useState(entry.entryDate ?? '')
  const bodyRef = useRef<HTMLDivElement>(null)

  // Reset local state and re-seed the editable body when switching entries.
  useEffect(() => {
    setTitle(entry.title)
    setContent(entry.content)
    setEntryDate(entry.entryDate ?? '')
    if (bodyRef.current) {
      bodyRef.current.innerHTML = toInitialHtml(entry.content)
    }
  }, [entry.id])

  const { status } = useAutoSave({
    value: { title, content, entryDate: showDate ? entryDate : undefined },
    onSave,
    delay: 700,
  })

  // Pull the current HTML out of the editable body into state (debounced-saved).
  const syncBody = () => {
    if (bodyRef.current) setContent(bodyRef.current.innerHTML)
  }

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

      <RichToolbar onCommand={syncBody} getEditor={() => bodyRef.current} />

      <div className="editor__paper">
        <input
          className="editor__title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          aria-label="Entry title"
        />
        <div
          ref={bodyRef}
          className="editor__content"
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Entry content"
          data-placeholder="Begin writing…"
          onInput={syncBody}
        />
      </div>
    </div>
  )
}