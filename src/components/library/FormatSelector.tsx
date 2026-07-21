import { selectableFormats } from '@/models/formats'
import type { BookFormatId } from '@/models/types'
import { Icon, type IconName } from '@/components/ui/Icon'
import { cx } from '@/lib/utils'
import './FormatSelector.css'

interface FormatSelectorProps {
  value: BookFormatId
  onChange: (id: BookFormatId) => void
}

export function FormatSelector({ value, onChange }: FormatSelectorProps) {
  return (
    <div className="format-selector" role="radiogroup" aria-label="Book format">
      {selectableFormats().map((f) => (
        <button
          key={f.id}
          type="button"
          role="radio"
          aria-checked={value === f.id}
          className={cx('format-card', value === f.id && 'is-selected')}
          onClick={() => onChange(f.id)}
        >
          <span className="format-card__icon" style={{ color: f.accent }}>
            <Icon name={f.icon as IconName} size={20} />
          </span>
          <span className="format-card__text">
            <span className="format-card__name">{f.name}</span>
            <span className="format-card__sub">{f.subtitle}</span>
          </span>
        </button>
      ))}
    </div>
  )
}