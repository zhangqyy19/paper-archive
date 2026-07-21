import { useEffect, useMemo, useRef, useState } from 'react'
import type { ResearchTopic } from '../../models/types'
import { searchTopics, type TopicMatch } from '../../lib/research/taxonomy'
import { cx } from '../../lib/utils'
import './TopicAutocomplete.css'

interface Props {
  /** Topics already selected, so they can be excluded from suggestions. */
  selected: ResearchTopic[]
  onAdd: (topic: ResearchTopic) => void
  placeholder?: string
  autoFocus?: boolean
}

// Highlights the matched span inside a topic label (prefix/substring hits).
function Highlight({ label, match }: { label: string; match: TopicMatch }) {
  if (match.matchStart < 0) return <>{label}</>
  const { matchStart: s, matchLength: n } = match
  return (
    <>
      {label.slice(0, s)}
      <mark className="topicac__mark">{label.slice(s, s + n)}</mark>
      {label.slice(s + n)}
    </>
  )
}

/**
 * Accessible autocomplete for picking standardized research topics. Users type
 * a prefix and choose a suggestion (never free text) so notebooks resolve to
 * stable ids. Supports keyboard nav (up/down/enter/esc), click, match
 * highlighting, and group headings.
 */
export function TopicAutocomplete({ selected, onAdd, placeholder, autoFocus }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)

  const selectedIds = useMemo(() => new Set(selected.map((t) => t.id)), [selected])
  const matches = useMemo(
    () => searchTopics(query, 8).filter((m) => !selectedIds.has(m.topic.id)),
    [query, selectedIds],
  )

  // Keep the active row in range as the list changes.
  useEffect(() => setActive(0), [query])

  // Close on outside click.
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  function choose(m: TopicMatch) {
    onAdd({ id: m.topic.id, label: m.topic.label })
    setQuery('')
    setOpen(false)
    setActive(0)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || matches.length === 0) {
      if (e.key === 'ArrowDown') setOpen(true)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % matches.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i - 1 + matches.length) % matches.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      choose(matches[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const showList = open && matches.length > 0
  let lastGroup = ''

  return (
    <div className="topicac" ref={rootRef}>
      <input
        className="topicac__input"
        type="text"
        value={query}
        placeholder={placeholder ?? 'Search topics (e.g. "mach", "poli")'}
        autoFocus={autoFocus}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => query && setOpen(true)}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-expanded={showList}
        aria-autocomplete="list"
        aria-controls="topicac-list"
      />
      {showList && (
        <ul className="topicac__list" id="topicac-list" role="listbox">
          {matches.map((m, i) => {
            const header = m.topic.group !== lastGroup ? m.topic.group : null
            lastGroup = m.topic.group
            return (
              <li key={m.topic.id} className="topicac__group-wrap">
                {header && <div className="topicac__group">{header}</div>}
                <button
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  className={cx('topicac__option', i === active && 'is-active')}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    choose(m)
                  }}
                >
                  <Highlight label={m.topic.label} match={m} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
      {open && query && matches.length === 0 && (
        <div className="topicac__list topicac__empty">No matching topics</div>
      )}
    </div>
  )
}