import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Book, Entry } from '@/models/types'
import { getFormat } from '@/models/formats'
import { useLibrary, useEntries } from '@/lib/LibraryContext'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { EntryList } from '@/components/editor/EntryList'
import { Editor } from '@/components/editor/Editor'
import { RecipeEditor } from '@/components/editor/RecipeEditor'
import { PoetryEditor } from '@/components/editor/PoetryEditor'
import { DreamEditor } from '@/components/editor/DreamEditor'
import './BookDetailPage.css'

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { repo, books, loading: libLoading } = useLibrary()
  const { entries, loading: entriesLoading, refresh, reorder, setEntries } = useEntries(id)

  const [book, setBook] = useState<Book | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  // Resolve the book — prefer the already-loaded list, fall back to a direct read.
  useEffect(() => {
    if (!id) return
    const known = books.find((b) => b.id === id)
    if (known) {
      setBook(known)
      return
    }
    let cancelled = false
    ;(async () => {
      const found = await repo.getBook(id)
      if (!cancelled) setBook(found ?? null)
    })()
    return () => {
      cancelled = true
    }
  }, [id, books, repo])

  // Keep a valid active entry selected.
  useEffect(()=> {
    if (entries.length === 0) {
      setActiveId(null)
      return
    }
    if (!activeId || !entries.some((e) => e.id === activeId)) {
      setActiveId(entries[0].id)
    }
  }, [entries, activeId])

  const activeEntry = useMemo(
    () => entries.find((e) => e.id === activeId) ?? null,
    [entries, activeId],
  )

  const format = book ? getFormat(book.format) : null
  const caps = format?.capabilities ?? null
  // Core UI branches on declarative capabilities, never on the format id, so a
  // new journal type is a formats.ts entry + its editor case below.
  const editorKind = caps?.editor ?? 'text'
  const datedEntries = caps?.datedEntries ?? false
  const term =
    book?.format === 'custom' && book.customTerms
      ? book.customTerms
      : format
        ? { singular: format.singular, plural: format.plural }
        : { singular: 'Entry', plural: 'Entries' }

  const handleCreateEntry = async () => {
    if (!book) return
    const entry = await repo.createEntry(book)
    await refresh()
    setActiveId(entry.id)
  }

  const handleSave = async (patch: Partial<Entry>) => {
    if (!activeEntry) return
    const updated = await repo.updateEntry(activeEntry.id, patch)
    if (updated) {
      setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
    }
  }

  const handleDelete = async () => {
    if (!activeEntry) return
    await repo.deleteEntry(activeEntry.id)
    setActiveId(null)
    await refresh()
  }

  // Dispatch to the right editor based on the format's declared editor kind.
  // Unimplemented kinds fall back to the generic text editor for now; each
  // journal type replaces its case here as it's built out. This keeps core UI
  // free of per-format id checks — a new type is a formats.ts entry + a case.
  const renderEditor = (entry: Entry) => {
    switch (editorKind) {
      case 'recipe':
        return <RecipeEditor key={entry.id} entry={entry} onSave={handleSave} />
      case 'poetry':
        return <PoetryEditor key={entry.id} entry={entry} onSave={handleSave} />
      case 'dream':
        return <DreamEditor key={entry.id} entry={entry} onSave={handleSave} />
      case 'text':
      default:
        return (
          <Editor key={entry.id} entry={entry} showDate={datedEntries} onSave={handleSave} />
        )
    }
  }

  if (libLoading && !book) {
    return <div className="book-detail__loading">Opening…</div>
  }

  if (!book) {
    return (
      <div className="book-detail__missing">
        <EmptyState
          icon="book"
          title="This book couldn’t be found"
          description="It may have been deleted."
          action={
            <Button variant="primary" icon="chevronLeft" onClick={() => navigate('/')}>
              Back to library
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="book-detail">
      <aside className="book-detail__sidebar">
        <div className="book-detail__side-head">
          <button
            type="button"
            className="book-detail__back"
            onClick={() => navigate('/')}
          >
            <span className="book-detail__back-icon">‹</span> Library
          </button>
          <h1 className="book-detail__book-title">{book.title}</h1>
          <p className="book-detail__book-meta">
            {entries.length} {entries.length === 1 ? term.singular : term.plural}
          </p>
          <Button variant="secondary" icon="plus" onClick={handleCreateEntry}>
            New {term.singular.toLowerCase()}
          </Button>
        </div>

        {entriesLoading ? (
          <div className="book-detail__side-loading">Loading…</div>
        ) : (
          <EntryList
            entries={entries}
            activeId={activeId}
            showDate={datedEntries}
            onSelect={setActiveId}
            onReorder={reorder}
          />
        )}
      </aside>

      <main className="book-detail__main">
        {activeEntry ? (
          <div className="book-detail__editor-wrap">
            <div className="book-detail__toolbar">
              <Button
                variant="ghost"
                size="sm"
                icon="trash"
                onClick={handleDelete}
                aria-label={`Delete this ${term.singular.toLowerCase()}`}
              />
            </div>
            {renderEditor(activeEntry)}
          </div>
        ) : (
          <EmptyState
            icon={format?.icon as never}
            title={`No ${term.plural.toLowerCase()} yet`}
            description={`Create your first ${term.singular.toLowerCase()} to begin writing.`}
            action={
              <Button variant="primary" icon="plus" onClick={handleCreateEntry}>
                New {term.singular.toLowerCase()}
              </Button>
            }
          />
        )}
      </main>
    </div>
  )
}