import { Icon } from './Icon'
import './SearchBar.css'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search your library…' }: SearchBarProps) {
  return (
    <div className="searchbar">
      <Icon name="search" size={18} className="searchbar__icon" />
      <input
        className="searchbar__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
      />
      {value && (
        <button className="searchbar__clear" onClick={() => onChange('')} aria-label="Clear search">
          <Icon name="close" size={15} />
        </button>
      )}
    </div>
  )
}