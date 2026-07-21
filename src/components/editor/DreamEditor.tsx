import { useEffect, useMemo, useRef, useState } from 'react'
import type { DreamData, Entry } from '@/models/types'
import {
  DREAM_SYMBOLS,
  getDreamSymbol,
  searchDreamSymbols,
} from '@/models/dreamSymbols'
import { useAutoSave, type SaveStatus } from '@/lib/useAutoSave'
import { formatDate } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'
import { RichToolbar } from './RichToolbar'
import './Editor.css'
import './DreamEditor.css'

interface DreamEditorProps {
  entry: Entry
  onSave: (patch: {
    title: string
    content: string
    dream: DreamData
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

export function DreamEditor({ entry, onSave }: DreamEditorProps) {
  const [title, setTitle] = useState(entry.title)
  const [content, setContent] = useState(entry.content)
  const [symbols, setSymbols] = useState<string[]>(entry.dream?.symbols ?? [])
  const [query, setQuery] = useState('')
  const [openSymbol, setOpenSymbol] = useState<string | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTitle(entry.title)
    setContent(entry.content)
    setSymbols(entry.dream?.symbols ?? [])
    setQuery('')
    setOpenSymbol(null)
    if (bodyRef.current) {
      bodyRef.current.innerHTML = toInitialHtml(entry.content)
    }
  }, [entry.id])

  const { status } = useAutoSave({
    value: {
      title,
      content,
      dream: { symbols: symbols.length ? symbols : undefined },
    },
    onSave,
    delay: 700,
  })

  const syncBody = () => {
    if (bodyRef.current) setContent(bodyRef.current.innerHTML)
  }

  const toggleSymbol = (id: string) => {
    setSymbols((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    )
  }

  const results = useMemo(() => searchDreamSymbols(query), [query])
  const flagged = symbols
    .map((id) => getDreamSymbol(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))

  return (
    <div className="editor dream">
      <div className="editor__bar">
        <span className="editor__date">{formatDate(entry.updatedAt)}</span>
        <StatusLabel status={status} />
      </div>

      <RichToolbar onCommand={syncBody} getEditor={() => bodyRef.current} />

      <div className="dream__layout">
        <div className="editor__paper dream__paper">
          <input
            className="editor__title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Dream title"
            aria-label="Dream title"
          />

          {flagged.length > 0 && (
            <div className="dream__flagged">
              {flagged.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="dream__chip"
                  onClick={() => toggleSymbol(s.id)}
                  title={`Remove ${s.name}`}
                >
                  <Icon name="moon" size={13} />
                  {s.name}
                  <Icon name="close" size={12} className="dream__chip-x" />
                </button>
              ))}
            </div>
          )}

          <div
            ref={bodyRef}
            className="editor__content dream__content"
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-label="Dream text"
            data-placeholder="What did you dream…"
            onInput={syncBody}
          />
        </div>

        <aside className="dream__panel" aria-label="Dream symbol reference">
          <div className="dream__panel-head">
            <Icon name="sparkle" size={15} />
            <span>Symbol Reference</span>
          </div>
          <p className="dream__panel-note">
            Common symbolic interpretations — a lens for reflection, never a
            fact.
          </p>

          <div className="dream__search">
            <Icon name="search" size={15} className="dream__search-icon" />
            <input
              className="dream__search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search symbols…"
              aria-label="Search dream symbols"
            />
          </div>

          <ul className="dream__symbols">
            {results.length === 0 && (
              <li className="dream__empty">No symbols match “{query}”.</li>
            )}
            {results.map((s) => {
              const isFlagged = symbols.includes(s.id)
              const isOpen = openSymbol === s.id
              return (
                <li
                  key={s.id}
                  className={
                    'dream__symbol' + (isFlagged ? ' is-flagged' : '')
                  }
                >
                  <div className="dream__symbol-row">
                    <button
                      type="button"
                      className="dream__symbol-head"
                      onClick={() => setOpenSymbol(isOpen ? null : s.id)}
                      aria-expanded={isOpen}
                    >
                      <span className="dream__symbol-name">{s.name}</span>
                      <span className="dream__symbol-tagline">
                        {s.tagline}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="dream__flag"
                      onClick={() => toggleSymbol(s.id)}
                      title={isFlagged ? 'Remove from dream' : 'Flag in dream'}
                      aria-pressed={isFlagged}
                    >
                      <Icon name={isFlagged ? 'check' : 'plus'} size={15} />
                    </button>
                  </div>

                  {isOpen && (
                    <div className="dream__symbol-body">
                      <p className="dream__symbol-meaning">{s.meaning}</p>
                      <ul className="dream__interps">
                        {s.interpretations.map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ul>
                      <div className="dream__themes">
                        {s.themes.map((t) => (
                          <span key={t} className="dream__theme">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
          <p className="dream__panel-foot">
            {DREAM_SYMBOLS.length} symbols in the library
          </p>
        </aside>
      </div>
    </div>
  )
}