import { useState } from 'react'
import type { Entry, EntryRef } from '@/models/types'
import { Icon } from '@/components/ui/Icon'
import { ReferencePicker } from './ReferencePicker'
import { ReferenceList } from './ReferenceList'
import './ReferencesSection.css'

interface ReferencesSectionProps {
  currentBookId: string
  refs: EntryRef[]
  onChange: (refs: EntryRef[]) => void
  /** Navigate to a referenced entry when its card is clicked. */
  onOpen?: (ref: EntryRef, entry: Entry) => void
  /** Section heading — defaults to "Linked entries". */
  label?: string
}

/**
 * A self-contained "linked entries" block: a heading with an add button, the
 * current reference cards, and the picker overlay. Any format whose
 * capabilities declare supportsRefs can render this without extra wiring —
 * refs are owned by the parent editor and persisted through onChange.
 */
export function ReferencesSection({
  currentBookId,
  refs,
  onChange,
  onOpen,
  label = 'Linked entries',
}: ReferencesSectionProps) {
  const [picking, setPicking] = useState(false)

  const addRef = (ref: EntryRef) => {
    onChange([...refs, ref])
    setPicking(false)
  }

  const removeRef = (refId: string) => {
    onChange(refs.filter((r) => r.id !== refId))
  }

  return (
    <section className="refs">
      <div className="refs__head">
        <h2 className="refs__heading">{label}</h2>
        <button
          type="button"
          className="refs__add"
          onClick={() => setPicking(true)}
        >
          <Icon name="link" size={15} /> Link
        </button>
      </div>

      {refs.length === 0 ? (
        <p className="refs__empty">
          Connect this to a recipe, note, or entry in any journal.
        </p>
      ) : (
        <ReferenceList refs={refs} onOpen={onOpen} onRemove={removeRef} />
      )}

      {picking && (
        <ReferencePicker
          currentBookId={currentBookId}
          existing={refs}
          onPick={addRef}
          onClose={() => setPicking(false)}
        />
      )}
    </section>
  )
}