import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'
import { formatYmd } from '@/lib/utils'
import './DatePicker.css'

interface DatePickerProps {
  /** Selected date as "YYYY-MM-DD" (empty string means unset). */
  value: string
  onChange: (ymd: string) => void
  ariaLabel?: string
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May','June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

/** Parse "YYYY-MM-DD" into a local Date, avoiding UTC drift. */
function parseYmd(ymd: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(d.getTime()) ? null : d
}

function toYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/**
 * A calm, English-only calendar popover. Replaces the native <input type="date">
 * so the trigger and popup render consistently (YYYY/MM/DD) regardless of the
 * browser or OS locale.
 */
export function DatePicker({ value, onChange, ariaLabel }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = parseYmd(value)
  const today = new Date()
  const [view, setView] = useState(() => selected ?? today)
  const rootRef = useRef<HTMLDivElement>(null)

  // Keep the visible month in sync when the selected value changes externally.
  useEffect(() => {
    if (selected) setView(selected)
  }, [value])

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const year = view.getFullYear()
  const month = view.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const pick = (day: number) => {
    onChange(toYmd(new Date(year, month, day)))
    setOpen(false)
  }

  return (
    <div className="datepicker" ref={rootRef}>
      <button
        type="button"
        className="datepicker__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-label={ariaLabel ?? 'Choose date'}
        aria-expanded={open}
      >
        <Icon name="calendar" size={14} />
        <span className="datepicker__value">{value ? formatYmd(value) : 'Set date'}</span>
      </button>

      {open && (
        <div className="datepicker__popover" role="dialog" aria-label="Calendar">
          <div className="datepicker__head">
            <button
              type="button"
              className="datepicker__nav"
              onClick={() => setView(new Date(year, month - 1, 1))}
              aria-label="Previous month"
            >
              <Icon name="chevronLeft" size={16} />
            </button>
            <span className="datepicker__month">{MONTHS[month]} {year}</span>
            <button
              type="button"
              className="datepicker__nav datepicker__nav--next"
              onClick={() => setView(new Date(year, month + 1, 1))}
              aria-label="Next month"
            >
              <Icon name="chevronLeft" size={16} />
            </button>
          </div>

          <div className="datepicker__weekdays">
            {WEEKDAYS.map((w) => (
              <span key={w} className="datepicker__weekday">{w}</span>
            ))}
          </div>

          <div className="datepicker__grid">
            {cells.map((day, i) =>
              day === null ? (
                <span key={`e${i}`} className="datepicker__cell is-empty" />
              ) : (
                <button
                  key={day}
                  type="button"
              className={[
                    'datepicker__cell',
                    selected && isSameDay(selected, new Date(year, month, day))
                      ? 'is-selected'
                      : '',
                    isSameDay(today, new Date(year, month, day)) ? 'is-today' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => pick(day)}
                >
                  {day}
                </button>
              ),
            )}
          </div>

          <div className="datepicker__foot">
            <button
              type="button"
              className="datepicker__today-btn"
              onClick={() => {
                onChange(toYmd(new Date()))
                setOpen(false)
              }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}