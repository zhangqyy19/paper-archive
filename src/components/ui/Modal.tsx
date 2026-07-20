import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cx } from '@/lib/utils'
import { Icon } from './Icon'
import './Modal.css'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'md' | 'lg'
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    // Prevent background scroll while the modal is open.
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="modal__overlay" onMouseDown={onClose} role="presentation">
      <div
        className={cx('modal', `modal--${size}`)}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {title && (
          <header className="modal__header">
            <h2 className="modal__title">{title}</h2>
            <button className="modal__close" onClick={onClose} aria-label="Close">
              <Icon name="close" size={18} />
            </button>
          </header>
        )}
        <div className="modal__body">{children}</div>
      </div>
    </div>,
    document.body,
  )
}