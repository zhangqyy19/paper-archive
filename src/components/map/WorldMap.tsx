import { useState } from 'react'
import { WORLD_LAND_PATH } from './worldLand'
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

// The base map is a true Natural Earth (110m) coastline set, decoded from an
// inlined TopoJSON and rendered as a single SVG path. It uses the same
// equirectangular projection as the pins, so the full 360°×180° graticule maps
// linearly onto the viewBox — which is exactly what keeps dropped pins
// geographically accurate against the real coastlines.
const W = 360
const H = 180

// The viewBox covers the full map height. The box itself is made taller than
// the map's true 2:1 ratio and the SVG is stretched to fill it, so the map
// gains vertical room (the top no longer looks squished) without shrinking.
const VIEW_TOP = 0
const VIEW_HEIGHT = H

// The box is stretched to this height (see .worldmap aspect-ratio 360/215), so
// the SVG's Y axis is scaled by BOX_H/H. Pins counter-scale Y by the inverse so
// their dots/halos stay perfectly round instead of squashed into ellipses.
const BOX_H = 215
const PIN_Y_FIX = H / BOX_H

// The tropics sit at ±23.4366° latitude. Under the equirectangular projection
// (y = 90 − lat) that lands them symmetrically above/below the equator.
const TROPIC_LAT = 23.4366
const TROPIC_CANCER_Y = 90 - TROPIC_LAT // ≈ 66.56 (north)
const TROPIC_CAPRICORN_Y = 90 + TROPIC_LAT // ≈ 113.44 (south)

/** Equirectangular projection into the 360×180 viewBox. */
function project(lat: number, lng: number): { x: number; y: number } {
  return { x: lng + 180, y: 90 - lat }
}

export function WorldMap({ pins, activeId, onSelect }: WorldMapProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  // Always show the whole world — never zoom to the pins. A chosen place simply
  // gets a pin dropped at its geographically accurate spot, map otherwise as-is.
  // Anchor the map to the top and let any overflow clip at the bottom
  // (Antarctica), so the top never looks squished or cut off.
  const viewBox = `0 ${VIEW_TOP} ${W} ${VIEW_HEIGHT}`

  return (
    <div className="worldmap">
      <svg
        className="worldmap__svg"
        viewBox={viewBox}
        preserveAspectRatio="none"
        role="img"
        aria-label="Map of visited places"
      >
        {/* Solid sea: one flat colour, no gridlines, so the water reads clean. */}
        <rect x="0" y="0" width={W} height={H} className="worldmap__sea" />

        {/* Real Natural Earth coastlines as a vector path — crisp at any zoom.
            even-odd fill so island holes and stray connector rings don't invert
            the fill (which showed up as green-sea/blue-land horizontal bands). */}
        <path className="worldmap__land" d={WORLD_LAND_PATH} fillRule="evenodd" />

        {/* Tropics of Cancer & Capricorn — dotted reference latitudes. */}
        <line
          className="worldmap__tropic"
          x1="0"
          x2={W}
          y1={TROPIC_CANCER_Y}
          y2={TROPIC_CANCER_Y}
        />
        <line
          className="worldmap__tropic"
          x1="0"
          x2={W}
          y1={TROPIC_CAPRICORN_Y}
          y2={TROPIC_CAPRICORN_Y}
        />

        {pins.map((p) => {
          const { x, y } = project(p.lat, p.lng)
          const isActive = p.id === activeId || p.id === hovered
          return (
            <g
              key={p.id}
              className={`worldmap__pin${isActive ? ' is-active' : ''}`}
              transform={`translate(${x} ${y}) scale(1 ${PIN_Y_FIX})`}
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