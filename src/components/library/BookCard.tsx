import { useEffect, useRef, useState } from 'react'
import { getFormat } from '@/models/formats'
import type { Book } from '@/models/types'
import { relativeTime } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'
import { BookCover } from './BookCover'
import './BookCard.css'

interface BookCardProps {
  book: Book
  onOpen: (book: Book) => void
  onRename?: (book: Book) => void
  onEditCover?: (book: Book) => void
  onDelete?: (book: Book) => void
}

export function BookCard({ book, onOpen, onRename, onEditCover, onDelete }: BookCardProps) {
  const format = getFormat(book.format)
  const label =
    book.format === 'custom' && book.customTerms ? book.customTerms.plural : format.plural

  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Dismiss the context menu on any outside click, scroll, or Escape.
  useEffect(() => {
    if (!menu) return
    const close = () => setMenu(null)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenu(null)
    }
    window.addEventListener('click', close)
    window.addEventListener('scroll', close, true)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('keydown', onKey)
    }
  }, [menu])

  const hasMenu = Boolean(onRename || onEditCover || onDelete)

  const openMenu = (e: React.MouseEvent) => {
    if (!hasMenu) return
    e.preventDefault()
    setMenu({ x: e.clientX, y: e.clientY })
  }

  return (
    <>
      <button
        type="button"
        className="book-card"
        onClick={() => onOpen(book)}
        onContextMenu={openMenu}
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

      {menu && hasMenu && (
        <div
          ref={menuRef}
          className="book-card__menu"
          role="menu"
          style={{ top: menu.y, left: menu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {onRename && (
            <button
              type="button"
              className="book-card__menu-item"
              role="menuitem"
              onClick={() => {
                setMenu(null)
                onRename(book)
              }}
            >
              <Icon name="pencil" size={16} />
              <span>Rename</span>
            </button>
          )}
          {onEditCover && (
            <button
              type="button"
              className="book-card__menu-item"
              role="menuitem"
              onClick={() => {
                setMenu(null)
                onEditCover(book)
              }}
            >
              <Icon name="sparkle" size={16} />
              <span>Edit cover</span>
            </button>
          )}
          {(onRename || onEditCover) && onDelete && (
            <div className="book-card__menu-divider" />
          )}
          {onDelete && (
            <button
              type="button"
              className="book-card__menu-item book-card__menu-item--danger"
              role="menuitem"
              onClick={() => {
                setMenu(null)
                onDelete(book)
              }}
            >
              <Icon name="trash" size={16} />
              <span>Delete</span>
            </button>
          )}
        </div>
      )}
    </>
  )
}