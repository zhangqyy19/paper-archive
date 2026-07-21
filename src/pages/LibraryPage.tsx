import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Book, LibrarySort } from '@/models/types'
import { useLibrary } from '@/lib/LibraryContext'
import { Button } from '@/components/ui/Button'
import { SearchBar } from '@/components/ui/SearchBar'
import { Select } from '@/components/ui/Select'
import { EmptyState } from '@/components/ui/EmptyState'
import { BookCard } from '@/components/library/BookCard'
import { BookCreatorModal } from '@/components/library/BookCreatorModal'
import { RenameDialog } from '@/components/library/RenameDialog'
import { ConfirmDialog } from '@/components/library/ConfirmDialog'
import './LibraryPage.css'

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recently edited' },
  { value: 'title', label: 'Title (A–Z)' },
  { value: 'created', label: 'Date created' },
] as const

function sortBooks(books: Book[], sort: LibrarySort): Book[] {
  const copy = [...books]
  switch (sort) {
    case 'title':
      return copy.sort((a, b) => a.title.localeCompare(b.title))
    case 'created':
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    case 'recent':
    default:
      return copy.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }
}

export function LibraryPage() {
  const { books, loading, error, createBook, updateBook, deleteBook } = useLibrary()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<LibrarySort>('recent')
  const [creating, setCreating] = useState(false)
  const [renaming, setRenaming] = useState<Book | null>(null)
  const [deleting, setDeleting] = useState<Book | null>(null)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? books.filter(
          (b) =>
            b.title.toLowerCase().includes(q) ||
            (b.description?.toLowerCase().includes(q) ?? false),
        )
      : books
    return sortBooks(filtered, sort)
  }, [books, query, sort])

  const openBook = (book: Book) => navigate(`/book/${book.id}`)

  const handleCreate = async (input: Parameters<typeof createBook>[0]) => {
    const book = await createBook(input)
    navigate(`/book/${book.id}`)
  }

  return (
    <div className="library">
      <header className="library__header">
        <div className="library__title-row">
          <div>
            <h1 className="library__title">Your Library</h1>
            <p className="library__subtitle">
              {books.length === 0
                ? 'A quiet shelf, waiting for its first book.'
                : `${books.length} ${books.length === 1 ? 'book' : 'books'} on your shelf`}
            </p>
          </div>
          <Button variant="primary" icon="plus" size="lg" onClick={() => setCreating(true)}>
            New book
          </Button>
        </div>

        {books.length > 0 && (
          <div className="library__controls">
            <SearchBar value={query} onChange={setQuery} />
            <Select
              value={sort}
              options={SORT_OPTIONS}
              onChange={(v) => setSort(v)}
              aria-label="Sort books"
            />
          </div>
        )}
      </header>

      {error && <div className="library__error">{error}</div>}

      {loading ? (
        <div className="library__loading">Opening your library…</div>
      ) : books.length === 0 ? (
        <EmptyState
          icon="book"
          title="Start your first book"
          description="Diaries, novels, recipe collections, dream journals — anything you'd like to keep and return to."
          action={
            <Button variant="primary" icon="plus" onClick={() => setCreating(true)}>
              Create a book
            </Button>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon="search"
          title="No books match"
          description="Try a different search."
        />
      ) : (
        <div className="library__grid fade-in">
          {visible.map((book) => (
            <BookCard key={book.id} book={book} onOpen={openBook} onRename={setRenaming} onDelete={setDeleting} />
          ))}
        </div>
      )}

      <BookCreatorModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreate={handleCreate}
      />

      <RenameDialog
        open={renaming !== null}
        currentTitle={renaming?.title ?? ''}
        onClose={() => setRenaming(null)}
        onRename={(title) => {
          if (renaming) void updateBook(renaming.id, { title })
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete book"
        message={`Delete “${deleting?.title || 'Untitled'}”? This will permanently remove the book and all of its entries. This can't be undone.`}
        confirmLabel="Delete"
        danger
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) void deleteBook(deleting.id)
        }}
      />
    </div>
  )
}