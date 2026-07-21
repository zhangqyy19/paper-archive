import { useEffect, useRef, useState } from 'react'
import type { Entry, PoemStyleId, PoetryData } from '@/models/types'
import { POEM_STYLES, getPoemStyle } from '@/models/poetryStyles'
import { useAutoSave, type SaveStatus } from '@/lib/useAutoSave'
import { formatDate } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'
import { RichToolbar } from './RichToolbar'
import './Editor.css'
import './PoetryEditor.css'

interface PoetryEditorProps {
  entry: Entry
  onSave: (patch: {
    title: string
    content: string
    poetry: PoetryData
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

/** Legacy plain text → safe HTML, preserving line breaks. */
function toInitialHtml(raw: string): string {
  if (!raw) return ''
  const looksLikeHtml = /<[a-z][\s\S]*>/i.test(raw)
  if (looksLikeHtml) return raw
  const amp = String.fromCharCode(38) + 'amp;'
  const lt = String.fromCharCode(38) + 'lt;'
  const gt = String.fromCharCode(38) + 'gt;'
  const escaped = raw.replace(/&/g, amp).replace(/</g, lt).replace(/>/g, gt)
  return escaped
    .split(/\n/)
    .map((line) => `<div>${line || '<br>'}</div>`)
    .join('')
}

export function PoetryEditor({ entry, onSave }: PoetryEditorProps) {
  const [title, setTitle] = useState(entry.title)
  const [content, setContent] = useState(entry.content)
  const [styleId, setStyleId] = useState<PoemStyleId | ''>(entry.poetry?.styleId ?? '')
  const [guideOpen, setGuideOpen] = useState(true)
  const [pickerOpen, setPickerOpen] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTitle(entry.title)
    setContent(entry.content)
    setStyleId(entry.poetry?.styleId ?? '')
    if (bodyRef.current) {
      bodyRef.current.innerHTML = toInitialHtml(entry.content)
    }
  }, [entry.id])

  // Close the form picker on outside click or Escape.
  useEffect(() => {
    if (!pickerOpen) return
    const onDown = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPickerOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [pickerOpen])

  const selectStyle = (id: PoemStyleId | '') => {
    setStyleId(id)
    setPickerOpen(false)
  }

  const { status } = useAutoSave({
    value: {
      title,
      content,
      poetry: { styleId: styleId || undefined },
    },
    onSave,
    delay: 700,
  })

  const syncBody = () => {
    if (bodyRef.current) setContent(bodyRef.current.innerHTML)
  }

  const style = styleId ? getPoemStyle(styleId) : undefined

  return (
    <div className="editor poetry">
      <div className="editor__bar">
        <span className="editor__date">{formatDate(entry.updatedAt)}</span>
        <StatusLabel status={status} />
      </div>

      <RichToolbar onCommand={syncBody} getEditor={() => bodyRef.current} />

      <div className="editor__paper poetry__paper">
        <input
          className="editor__title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Poem title"
          aria-label="Poem title"
        />

        {/* Optional form selection — writing assistance, never enforced. */}
        <div className="poetry__form-row">
          <span className="poetry__form-label">Form</span>
          <div className="poetry__picker" ref={pickerRef}>
            <button
              type="button"
              className="poetry__picker-trigger"
              onClick={() => setPickerOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={pickerOpen}
            >
              <span className="poetry__picker-current">
                <span className="poetry__picker-name">
                  {style ? style.name : 'Unspecified'}
                </span>
              </span>
              <Icon name="chevronDown" size={16} className="poetry__picker-caret" />
            </button>

            {pickerOpen && (
              <div className="poetry__picker-menu" role="listbox">
                <button
                  type="button"
                  role="option"
                  aria-selected={!styleId}
                  className={
                    'poetry__picker-option' + (!styleId ? ' is-selected' : '')
                  }
                  onClick={() => selectStyle('')}
                >
                  <span className="poetry__picker-name">Unspecified</span>
                </button>
                {POEM_STYLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="option"
                    aria-selected={styleId === s.id}
                    className={
                      'poetry__picker-option' +
                      (styleId === s.id ? ' is-selected' : '')
                    }
                    onClick={() => selectStyle(s.id)}
                  >
                    <span className="poetry__picker-name">{s.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {style && (
          <section className="poetry__guide">
            <button
              type="button"
              className="poetry__guide-head"
              onClick={() => setGuideOpen((v) => !v)}
              aria-expanded={guideOpen}
            >
              <span className="poetry__guide-title">
                <Icon name="quill" size={15} /> {style.name}
              </span>
              <span className="poetry__guide-tagline">{style.tagline}</span>
              <Icon
                name="chevronDown"
                size={16}
                className={
                  guideOpen
                    ? 'poetry__guide-caret is-open'
                    : 'poetry__guide-caret'
                }
              />
            </button>

            {guideOpen && (
              <div className="poetry__guide-body">
                <dl className="poetry__facts">
                  <div className="poetry__fact">
                    <dt>Structure</dt>
                    <dd>{style.structure}</dd>
                  </div>
                  {style.meter && (
                    <div className="poetry__fact">
                      <dt>Metre</dt>
                      <dd>{style.meter}</dd>
                    </div>
                  )}
                  {style.rhyme && (
                    <div className="poetry__fact">
                      <dt>Rhyme</dt>
                      <dd>{style.rhyme}</dd>
                    </div>
                  )}
                  <div className="poetry__fact">
                    <dt>History</dt>
                    <dd>{style.history}</dd>
                  </div>
                </dl>
                <div className="poetry__tips">
                  <span className="poetry__tips-label">Tips</span>
                  <ul>
                    {style.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </section>
        )}

        <div
          ref={bodyRef}
          className="editor__content poetry__content"
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Poem text"
          data-placeholder="Begin your poem…"
          onInput={syncBody}
        />
      </div>
    </div>
  )
}