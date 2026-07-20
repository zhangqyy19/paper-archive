export type IconName =
  | 'calendar'
  | 'feather'
  | 'book'
  | 'compass'
  | 'moon'
  | 'bowl'
  | 'flask'
  | 'quill'
  | 'pencil'
  | 'sparkle'
  | 'search'
  | 'plus'
  | 'close'
  | 'chevronDown'
  | 'chevronLeft'
  | 'grip'
  | 'trash'
  | 'download'
  | 'upload'
  | 'check'

interface IconProps {
  name: IconName
  size?: number
  strokeWidth?: number
  className?: string
}

/**
 * A tiny, dependency-free icon set drawn as inline SVG strokes.
 * Line-based and calm to match the app's aesthetic.
 */
const PATHS: Record<string, JSX.Element> = {
  calendar: (
    <>
      <rect x="3" y="4.5" width="18" height="16" rx="3" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" />
    </>
  ),
  feather: (
    <>
      <path d="M20 5c-4 0-9 2-12 6-1.5 2-2.5 5-3 8" />
      <path d="M5 19c3-.5 6-1.5 8-3 4-3 6-8 6-11" />
      <path d="M8.5 13.5H15" />
    </>
  ),
  book: (
    <>
      <path d="M5 4.5h11a3 3 0 0 1 3 3V20a2 2 0 0 0-2-2H5z" />
      <path d="M5 4.5A1.5 1.5 0 0 0 3.5 6v13.5" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
  bowl: (
    <>
      <path d="M3 11h18a9 9 0 0 1-18 0z" />
      <path d="M12 4c1.5 1 1.5 2.5 0 3.5" />
    </>
  ),
  flask: (
    <>
      <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" />
      <path d="M7.5 15h9" />
    </>
  ),
  quill: (
    <>
      <path d="M4 20c8-1 14-6 16-16-6 1-12 4-14 10z" />
      <path d="M4 20l5-5" />
    </>
  ),
  pencil: (
    <>
      <path d="M16.5 4.5l3 3L8 19l-4 1 1-4z" />
      <path d="M14 7l3 3" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
      <path d="M12 9c0 1.5 1.5 3 3 3-1.5 0-3 1.5-3 3 0-1.5-1.5-3-3-3 1.5 0 3-1.5 3-3z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M16.5 16.5L21 21" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  chevronLeft: <path d="M15 6l-6 6 6 6" />,
  grip: (
    <>
      <circle cx="9" cy="6" r="1" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="9" cy="18" r="1" />
      <circle cx="15" cy="6" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="15" cy="18" r="1" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12M7 10l5 5 5-5" />
      <path d="M4 20h16" />
    </>
  ),
  upload: (
    <>
      <path d="M12 21V9M7 14l5-5 5 5" />
      <path d="M4 4h16" />
    </>
  ),
  check: <path d="M5 12l5 5 9-11" />,
}

export function Icon({ name, size = 20, strokeWidth = 1.6, className }: IconProps) {
  const glyph = PATHS[name] ?? PATHS.book
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {glyph}
    </svg>
  )
}