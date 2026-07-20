import { useMemo, useState } from 'react'
import type { Book, BookFormatId, CoverColorId } from '@/models/types'
import type { NewBookInput } from '@/lib/repository'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, TextField, TextArea } from '@/components/ui/Field'
import { BookCover } from './BookCover'
import { FormatSelector } from './FormatSelector'
import { CoverPicker } from './CoverPicker'
import './BookCreatorModal.css'

interface BookCreatorModalProps {
  open: boolean
  onClose: () => void
  onCreate: (input: NewBookInput) => void | Promise<void>
}

const DEFAULT_COLOR: CoverColorId = 'forest'

export function BookCreatorModal({ open, onClose, onCreate }: BookCreatorModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [format, setFormat] = useState<BookFormatId>('diary')
  const [colorId, setColorId] = useState<CoverColorId>(DEFAULT_COLOR)
  const [singular, setSingular] = useState('')
  const [plural, setPlural] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // A live preview book for the cover.
  const previewBook = useMemo<Book>(
    () => ({
      id: 'preview',
      title: title || 'Untitled',
      format,
      cover: { kind: 'color' as const, colorId },
      createdAt: '',
      updatedAt: '',
    }),
    [title, format, colorId],
  )

  const reset = () => {
    setTitle('')
    setDescription('')
    setFormat('diary')
    setColorId(DEFAULT_COLOR)
    setSingular('')
    setPlural('')
  }

  const handleClose = () => {
    if (submitting) return
    reset()
    onClose()
  }

  const handleCreate = async () => {
    setSubmitting(true)
    try {
      await onCreate({
        title,
        description,
        format,
        cover: { kind: 'color', colorId },
        customTerms:
          format === 'custom'
            ? {
                singular: singular.trim() || 'Entry',
                plural: plural.trim() || 'Entries',
              }
            : undefined,
      })
      reset()
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Create a new book" size="lg">
      <div className="book-creator">
        <div className="book-creator__preview">
          <BookCover book={previewBook} size="lg" />
        </div>

        <div className="book-creator__form">
          <Field label="Title">
            <TextField
              value={title}
              autoFocus
              placeholder="Name your book"
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>

          <Field label="Description" optional>
            <TextArea
              value={description}
              rows={2}
              placeholder="A line about what lives inside"
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>

          <Field label="Format">
            <FormatSelector value={format} onChange={setFormat} />
          </Field>

          {format === 'custom' && (
            <div className="book-creator__terms">
              <Field label="One entry is called">
                <TextField
                  value={singular}
                  placeholder="Entry"
                 onChange={(e) => setSingular(e.target.value)}
                />
              </Field>
              <Field label="Many are called">
                <TextField
                  value={plural}
                  placeholder="Entries"
                  onChange={(e) => setPlural(e.target.value)}
                />
              </Field>
            </div>
          )}

          <Field label="Cover">
            <CoverPicker value={colorId} onChange={setColorId} />
          </Field>
        </div>
      </div>

      <footer className="book-creator__footer">
        <Button variant="ghost" onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="primary" icon="check" onClick={handleCreate} disabled={submitting}>
          Create book
        </Button>
      </footer>
    </Modal>
  )
}