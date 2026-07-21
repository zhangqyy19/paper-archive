import { useEffect, useRef, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import './RenameDialog.css'

interface RenameDialogProps {
  open: boolean
  currentTitle: string
  onClose: () => void
  onRename: (title: string) => void
}

export function RenameDialog({ open, currentTitle, onClose, onRename }: RenameDialogProps) {
  const [draft, setDraft] = useState(currentTitle)
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset the draft each time the dialog opens for a (possibly) different book,
  // then focus and select so the user can immediately overwrite the title.
  useEffect(() => {
    if (!open) return
    setDraft(currentTitle)
    const id = window.setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)
    return () => window.clearTimeout(id)
  }, [open, currentTitle])

  const trimmed = draft.trim()
  const canSave = trimmed.length > 0 && trimmed !== currentTitle.trim()

  const commit = () => {
    if (!canSave) {
      onClose()
      return
    }
    onRename(trimmed)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Rename book">
      <form
        className="rename-dialog"
        onSubmit={(e) => {
          e.preventDefault()
          commit()
        }}
      >
        <label className="rename-dialog__label" htmlFor="rename-dialog-input">
          Title
        </label>
        <input
          id="rename-dialog-input"
          ref={inputRef}
          className="rename-dialog__input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Untitled"
          autoComplete="off"
        />
        <div className="rename-dialog__actions">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!canSave}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  )
}