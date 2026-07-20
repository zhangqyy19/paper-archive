import { useCallback, useEffect, useState } from 'react'
import { Icon, type IconName } from '@/components/ui/Icon'
import './RichToolbar.css'

interface RichToolbarProps {
  /** Called after a command runs so the editor can persist the new HTML. */
  onCommand: () => void
  /** The contentEditable element the commands act on (for focus + state). */
  getEditor: () => HTMLElement | null
}

type InlineCmd = 'bold' | 'italic' | 'underline' | 'strikeThrough'

interface ToolButton {
  cmd: string
  value?: string
  icon: IconName
  label: string
  /** execCommand name used for queryCommandState (active highlight). */
  stateCmd?: InlineCmd
}

const INLINE: ToolButton[] = [
  { cmd: 'bold', icon: 'bold', label: 'Bold', stateCmd: 'bold' },
  { cmd: 'italic', icon: 'italic', label: 'Italic', stateCmd: 'italic' },
  { cmd: 'underline', icon: 'underline', label: 'Underline', stateCmd: 'underline' },
  {
    cmd: 'strikeThrough',
    icon: 'strikethrough',
    label: 'Strikethrough',
    stateCmd: 'strikeThrough',
  },
]

const LISTS: ToolButton[] = [
  { cmd: 'insertUnorderedList', icon: 'listBullet', label: 'Bulleted list' },
  { cmd: 'insertOrderedList', icon: 'listOrdered', label: 'Numbered list' },
]

const ALIGN: ToolButton[] = [
  { cmd: 'justifyLeft', icon: 'alignLeft', label: 'Align left' },
  { cmd: 'justifyCenter', icon: 'alignCenter', label: 'Align center' },
  { cmd: 'justifyRight', icon: 'alignRight', label: 'Align right' },
]

const INDENT: ToolButton[] = [
  { cmd: 'outdent', icon: 'outdent', label: 'Decrease indent' },
  { cmd: 'indent', icon: 'indent', label: 'Increase indent' },
]

/** Line-height presets cycled by the spacing button, applied to the block. */
const LINE_HEIGHTS = ['1.5', '1.8', '2.15', '2.6']

export function RichToolbar({ onCommand, getEditor }: RichToolbarProps) {
  const [active, setActive] = useState<Record<string, boolean>>({})

  // Reflect the current selection's inline formatting in the button states.
  const refreshState = useCallback(() => {
    const next: Record<string, boolean> = {}
    for (const b of INLINE) {
      if (b.stateCmd) {
        try {
          next[b.cmd] = document.queryCommandState(b.stateCmd)
        } catch {
          next[b.cmd] = false
        }
      }
    }
    setActive(next)
  }, [])

  useEffect(() => {
    document.addEventListener('selectionchange', refreshState)
    return () => document.removeEventListener('selectionchange', refreshState)
  }, [refreshState])

  const run = (cmd: string, value?: string) => {
    const el = getEditor()
    if (el) el.focus()
    document.execCommand(cmd, false, value)
    refreshState()
    onCommand()
  }

  // Cycle the line-height of the block(s) touched by the current selection.
  const cycleLineHeight = () => {
    const el = getEditor()
    if (!el) return
    el.focus()
    const current = getComputedStyle(el).lineHeight
    // Find the nearest preset and advance to the next one.
    const idx = LINE_HEIGHTS.findIndex((h) => {
      const px = parseFloat(h) * parseFloat(getComputedStyle(el).fontSize)
      return Math.abs(px - parseFloat(current)) < 2
    })
    const nextIdx = idx < 0 ? 0 : (idx + 1) % LINE_HEIGHTS.length
    el.style.lineHeight = LINE_HEIGHTS[nextIdx]
    onCommand()
  }

  const clearFormat = () => {
    const el = getEditor()
    if (el) el.focus()
    document.execCommand('removeFormat')
    document.execCommand('formatBlock', false, 'div')
    refreshState()
    onCommand()
  }

  const renderGroup = (buttons: ToolButton[]) =>
    buttons.map((b) => (
      <button
        key={b.cmd}
        type="button"
        className={`rt__btn${active[b.cmd] ? ' is-active' : ''}`}
        title={b.label}
        aria-label={b.label}
        aria-pressed={active[b.cmd] || undefined}
        // Prevent the button from stealing selection focus on mousedown.
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => run(b.cmd, b.value)}
      >
        <Icon name={b.icon} size={17} />
      </button>
    ))

  return (
    <div className="rt" role="toolbar" aria-label="Formatting">
      <div className="rt__group">{renderGroup(INLINE)}</div>
      <span className="rt__sep" aria-hidden="true" />
      <div className="rt__group">{renderGroup(LISTS)}</div>
      <span className="rt__sep" aria-hidden="true" />
      <div className="rt__group">{renderGroup(ALIGN)}</div>
      <span className="rt__sep" aria-hidden="true" />
      <div className="rt__group">{renderGroup(INDENT)}</div>
      <span className="rt__sep" aria-hidden="true" />
      <div className="rt__group">
        <button
          type="button"
          className="rt__btn"
          title="Line spacing"
          aria-label="Line spacing"
          onMouseDown={(e) => e.preventDefault()}
          onClick={cycleLineHeight}
        >
          <Icon name="lineHeight" size={17} />
        </button>
        <button
          type="button"
          className="rt__btn"
          title="Clear formatting"
          aria-label="Clear formatting"
          onMouseDown={(e) => e.preventDefault()}
          onClick={clearFormat}
        >
          <Icon name="clearFormat" size={17} />
        </button>
      </div>
    </div>
  )
}