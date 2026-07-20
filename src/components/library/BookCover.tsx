import type { CSSProperties } from 'react'
import { getCoverColor } from '@/models/colors'
import { getFormat } from '@/models/formats'
import type { Book } from '@/models/types'
import { Icon, type IconName } from '@/components/ui/Icon'
import './BookCover.css'

interface BookCoverProps {
  book: Book
  /** Visual size preset. */
  size?: 'sm' | 'md' | 'lg'
}

/**
 * A hardcover-style book cover rendered purely with CSS.
 * Uses the preset color's base/shade/edge tones to fake spine depth,
 * a page block on the right, and a foil-stamped title.
 */
export function BookCover({ book, size = 'md' }: BookCoverProps) {
  const format = getFormat(book.format)
  const colorId =
    book.cover.kind === 'color' ? book.cover.colorId : book.cover.colorId ?? 'forest'
  const color = getCoverColor(colorId)
  const isImage = book.cover.kind === 'image'

  const style = {
    '--cover-base': color.base,
    '--cover-shade': color.shade,
    '--cover-edge': color.edge,
    '--cover-ink': color.ink,
  } as CSSProperties

  return (
    <div className={`book-cover book-cover--${size}`} style={style}>
      <div className="book-cover__pages" aria-hidden="true" />
      <div className="book-cover__spine" aria-hidden="true" />
      <div className="book-cover__face">
        {isImage && book.cover.kind === 'image' && (
          <img className="book-cover__image" src={book.cover.url} alt="" />
        )}
        <div className="book-cover__sheen" aria-hidden="true" />
        <div className="book-cover__content">
          <span className="book-cover__format">
            <Icon name={format.icon as IconName} size={14} />
          </span>
          <span className="book-cover__title">{book.title || 'Untitled'}</span>
        </div>
      </div>
    </div>
  )
}