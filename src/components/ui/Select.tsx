import { Icon } from './Icon'
import './Select.css'

export interface SelectOption<T extends string> {
  value: T
  label: string
}

interface SelectProps<T extends string> {
  value: T
  options: ReadonlyArray<SelectOption<T>>
  onChange: (value: T) => void
  'aria-label'?: string
}

export function Select<T extends string>({
  value,
  options,
  onChange,
  'aria-label': ariaLabel,
}: SelectProps<T>) {
  return (
    <div className="select">
      <select
        className="select__native"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        aria-label={ariaLabel}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon name="chevronDown" size={16} className="select__chevron" />
    </div>
  )
}