import { useEffect, useState } from 'react'
import type { Book, CoverColorId } from '@/models/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { BookCover } from './BookCover'
import { CoverPicker } from './CoverPicker'
import './CoverDialog.css'

interface CoverDialogProps {
  open: boolean
  book: Book | null
  onClose: () => void
  onSave: (colorId: CoverColorId) => void
}

export function CoverDialog({ open, book, onClose, onSave }: CoverDialogProps) {
  const current = book?.cover.colorId ?? 'forest'
  const [colorId, setColorId] = useState<CoverColorId>(current)

  // Reset the draft each time the dialog opens for a (possibly) different book.
  useEffect(() => {
    if (open) setColorId(current)
  }, [open, current])

  if (!book) return null

  const previewBook: Book = { ...book, cover: { kind: 'color', colorId } }
  const changed = colorId !== current

  const commit = () => {
    if (changed) onSave(colorId)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit cover">
      <div className="cover-dialog">
        <div className="cover-dialog__preview">
          <BookCover book={previewBook} size="lg" />
        </div>
        <div className="cover-dialog__picker">
          <span className="cover-dialog__label">Cover color</span>
          <CoverPicker value={colorId} onChange={setColorId} />
        </div>
        <div className="cover-dialog__actions">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={commit} disabled={!changed}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  )
}