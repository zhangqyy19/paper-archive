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
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'listBullet'
  | 'listOrdered'
  | 'alignLeft'
  | 'alignCenter'
  | 'alignRight'
  | 'indent'
  | 'outdent'
  | 'lineHeight'
  | 'clearFormat'
  | 'video'
  | 'link'
  | 'clock'
  | 'users'
  | 'map'
  | 'pin'
  | 'refresh'
  | 'trending'
  | 'newspaper'


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
  bold: <path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zm0 7h7a3.5 3.5 0 0 1 0 7H7z" />,
  italic: <path d="M10 5h7M7 19h7M14 5l-4 14" />,
  underline: (
    <>
      <path d="M7 4v6a5 5 0 0 0 10 0V4" />
      <path d="M5 20h14" />
    </>
  ),
  strikethrough: (
    <>
      <path d="M4 12h16" />
      <path d="M7 8a4 3 0 0 1 8-1M8 16a4 3 0 0 0 8 0" />
    </>
  ),
  listBullet: (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.5" cy="6" r="1" />
      <circle cx="4.5" cy="12" r="1" />
      <circle cx="4.5" cy="18" r="1" />
    </>
  ),
  listOrdered: (
    <>
      <path d="M10 6h10M10 12h10M10 18h10" />
      <path d="M4 5.5h1.5V9M4 9h3" />
      <path d="M4 15.5c0-.6.5-1 1.2-1s1.3.5 1.3 1.1c0 1.2-2.5 1.7-2.5 3.4H7" />
    </>
  ),
  alignLeft: <path d="M4 6h16M4 10h10M4 14h16M4 18h10" />,
  alignCenter: <path d="M4 6h16M7 10h10M4 14h16M7 18h10" />,
  alignRight: <path d="M4 6h16M10 10h10M4 14h16M10 18h10" />,
  indent: (
    <>
      <path d="M11 6h9M11 12h9M11 18h9M4 6h5" />
      <path d="M4 9l3 3-3 3" />
    </>
  ),
  outdent: (
    <>
      <path d="M11 6h9M11 12h9M11 18h9M4 6h5" />
      <path d="M7 9l-3 3 3 3" />
    </>
  ),
  lineHeight: (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="M4 4v16M2.5 6 4 4 5.5 6M2.5 18 4 20 5.5 18" />
    </>
  ),
  clearFormat: (
    <>
      <path d="M6 5h13M9 5l-3 14M14 5l-1 5" />
      <path d="M13.5 15.5l5 5M18.5 15.5l-5 5" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="6" width="13" height="12" rx="2.5" />
      <path d="M16 10l5-3v10l-5-3z" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a4 4 0 0 0 5.7.3l3-3a4 4 0 0 0-5.7-5.7L11 6.3" />
      <path d="M14 11a4 4 0 0 0-5.7-.3l-3 3a4 4 0 0 0 5.7 5.7L13 17.7" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5a3.5 3.5 0 0 1 0 7M17 20a5.5 5.5 0 0 0-3-4.9" />
    </>
  ),
  map: (
    <>
      <path d="M9 4L3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4z" />
      <path d="M9 4v13M15 6.5v13" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21c4-4.5 6-8 6-11a6 6 0 0 0-12 0c0 3 2 6.5 6 11z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  refresh: (
    <>
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </>
  ),
  trending: (
    <>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </>
  ),
  newspaper: (
    <>
      <path d="M4 5h13v14H6a2 2 0 0 1-2-2z" />
      <path d="M17 8h3v9a2 2 0 0 1-2 2" />
      <path d="M7 8h7M7 11h7M7 14h5" />
    </>
  ),
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