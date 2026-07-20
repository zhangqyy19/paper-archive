import { COVER_COLORS } from '@/models/colors'
import type { CoverColorId } from '@/models/types'
import { Icon } from '@/components/ui/Icon'
import { cx } from '@/lib/utils'
import './CoverPicker.css'

interface CoverPickerProps {
  value: CoverColorId
  onChange: (id: CoverColorId) => void
}

export function CoverPicker({ value, onChange }: CoverPickerProps) {
  return (
    <div className="cover-picker" role="radiogroup" aria-label="Cover color">
      {COVER_COLORS.map((c) => (
        <button
          key={c.id}
          type="button"
          role="radio"
          aria-checked={value === c.id}
          aria-label={c.name}
          title={c.name}
          className={cx('cover-picker__swatch', value === c.id && 'is-selected')}
          style={{ background: c.base, borderColor: c.shade }}
          onClick={() => onChange(c.id)}
        >
          {value === c.id && (
            <span className="cover-picker__check" style={{ color: c.ink }}>
              <Icon name="check" size={14} />
            </span>
          )}
        </button>
      ))}
    </div>
  )
}