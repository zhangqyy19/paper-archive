import { useMemo, useState } from 'react'
import { WORLD_PATH } from './worldPath'
import './WorldMap.css'

export interface MapPin {
  id: string
  label: string
  lat: number
  lng: number
  /** Optional secondary line, e.g. a date. */
  sub?: string
}

interface WorldMapProps {
  pins: MapPin[]
  activeId?: string | null
  onSelect?: (id: string) => void
}

const W = 360
const H = 180

/** Equirectangular projection into the 360×180 viewBox. */
function project(lat: number, lng: number): { x: number; y: number } {
  return { x: lng + 180, y: 90 - lat }
}

export function WorldMap({ pins, activeId, onSelect }: WorldMapProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  // Fit the view to the placed pins with padding, so a cluster in one region
  // fills the frame instead of floating on a tiny world. Falls back to whole
  // world when there are no pins.
  const viewBox = useMemo(() => {
    if (pins.length === 0) return `0 0 ${W} ${H}`
    const xs = pins.map((p) => project(p.lat, p.lng).x)
    const ys = pins.map((p) => project(p.lat, p.lng).y)
    let minX = Math.min(...xs)
    let maxX = Math.max(...xs)
    let minY = Math.min(...ys)
    let maxY = Math.max(...ys)
    const padX = Math.max((maxX - minX) * 0.4, 30)
    const padY = Math.max((maxY - minY) * 0.4, 24)
    minX = Math.max(0, minX - padX)
    minY = Math.max(0, minY - padY)
    maxX = Math.min(W, maxX + padX)
    maxY = Math.min(H, maxY + padY)
    return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`
  }, [pins])

  return (
    <div className="worldmap">
      <svg
        className="worldmap__svg"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Map of visited places"
      >
        <defs>
          <radialGradient id="wm-sea" cx="50%" cy="40%" r="75%">
            <stop offset="0%" className="worldmap__sea-hi" />
            <stop offset="100%" className="worldmap__sea-lo" />
          </radialGradient>
        </defs>

        <rect x="0" y="0" width={W} height={H} fill="url(#wm-sea)" />

        {/* Faint graticule for a cartographic feel */}
        <g className="worldmap__grid">
          {[30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((x) => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2={H} />
          ))}
          {[30, 60, 90, 120, 150].map((y) => (
            <line key={`h${y}`} x1="0" y1={y} x2={W} y2={y} />
          ))}
        </g>

        <path className="worldmap__land" d={WORLD_PATH} />

        {pins.map((p) => {
          const { x, y } = project(p.lat, p.lng)
          const isActive = p.id === activeId || p.id === hovered
          return (
            <g
              key={p.id}
              className={`worldmap__pin${isActive ? ' is-active' : ''}`}
              transform={`translate(${x} ${y})`}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered((h) => (h === p.id ? null : h))}
              onClick={() => onSelect?.(p.id)}
            >
              <circle className="worldmap__pin-halo" r={isActive ? 4.5 : 3} />
              <circle className="worldmap__pin-dot" r={1.6} />
              {isActive && (
                <g className="worldmap__tip" transform="translate(0 -6)">
                  <text className="worldmap__tip-label" textAnchor="middle">
                    {p.label}
                  </text>
                  {p.sub && (
                    <text
                      className="worldmap__tip-sub"
                      textAnchor="middle"
                      y="4"
                    >
                      {p.sub}
                    </text>
                  )}
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}