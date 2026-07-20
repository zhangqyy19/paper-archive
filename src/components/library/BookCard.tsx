import { getFormat } from '@/models/formats'
import type { Book } from '@/models/types'
import { relativeTime } from '@/lib/utils'
import { BookCover } from './BookCover'
import './BookCard.css'

interface BookCardProps {
  book: Book
  onOpen: (book: Book) => void
}

export function BookCard({ book, onOpen }: BookCardProps) {
  const format = getFormat(book.format)
  const label =
    book.format === 'custom' && book.customTerms ? book.customTerms.plural : format.plural

  return (
    <button
      type="button"
      className="book-card"
      onClick={() => onOpen(book)}
      aria-label={`Open ${book.title || 'Untitled'}`}
    >
      <div className="book-card__cover">
        <BookCover book={book} size="md" />
      </div>
      <div className="book-card__meta">
        <span className="book-card__title">{book.title || 'Untitled'}</span>
        <span className="book-card__sub">
          {format.name} · {label}
        </span>
        <span className="book-card__time">Edited {relativeTime(book.updatedAt)}</span>
      </div>
    </button>
  )
}