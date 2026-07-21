// Real world coastlines derived from Natural Earth 110m (world-atlas land-110m).
// The raw TopoJSON is inlined in `worldTopology.ts` so the map renders true
// coastlines with zero runtime/network dependencies. Here we decode the arcs
// and project them onto the same equirectangular grid used for the pins,
// guaranteeing that land shapes and pin placements stay geographically aligned.
import { LAND_TOPOLOGY } from './worldTopology'

type Point = [number, number]

// The map spans a full 360° of longitude; a horizontal jump wider than half of
// that means a ring wrapped across the ±180° antimeridian.
const W = 360

interface Topology {
  arcs: number[][][]
  transform: { scale: [number, number]; translate: [number, number] }
  objects: {
    land: {
      geometries: { arcs: number[][][] }[]
    }
  }
}

const topo = LAND_TOPOLOGY as unknown as Topology

// Decode a single arc: undo delta-encoding and apply the quantization transform
// to recover absolute [lng, lat] coordinates.
function decodeArc(arc: number[][]): Point[] {
  const { scale, translate } = topo.transform
  const points: Point[] = []
  let x = 0
  let y = 0
  for (const [dx, dy] of arc) {
    x += dx
    y += dy
    points.push([x * scale[0] + translate[0], y * scale[1] + translate[1]])
  }
  return points
}

const decodedArcs: Point[][] = topo.arcs.map(decodeArc)

// A TopoJSON arc index may be negative, meaning "use arc ~i reversed".
function arcPoints(index: number): Point[] {
  if (index >= 0) return decodedArcs[index]
  return decodedArcs[~index].slice().reverse()
}

// Equirectangular projection matching WorldMap's `project`: lng -> x, lat -> y
// on a 360x180 grid with (0,0) at the top-left (lng -180, lat +90).
function toXY(lng: number, lat: number): Point {
  return [lng + 180, 90 - lat]
}

function ringToPath(arcIndexes: number[]): string {
  // Stitch all arc points into one continuous ring, dropping near-duplicate
  // shared endpoints.
  const ring: Point[] = []
  const EPS = 1e-6
  for (const idx of arcIndexes) {
    for (const [lng, lat] of arcPoints(idx)) {
      const [x, y] = toXY(lng, lat)
      const prev = ring[ring.length - 1]
      if (prev && Math.abs(prev[0] - x) < EPS && Math.abs(prev[1] - y) < EPS) {
        continue
      }
      ring.push([x, y])
    }
  }
  if (ring.length< 3) return ''

  // Some polygons (Antarctica, and landmasses straddling the ±180° antimeridian
  // near Alaska/Siberia) wrap around the map. In an equirectangular projection
  // that makes two consecutive points jump the full map width — drawing a stray
  // horizontal line across the map and inverting the fill. When we detect such
  // a jump (dx > half the map width), lift the pen and start a new sub-path
  // instead of connecting straight across.
  const HALF = W / 2
  let d = ''
  let penDown = false
  for (let i = 0; i < ring.length; i++) {
    const [x, y] = ring[i]
    const prev = ring[i - 1]
    const wraps = prev && Math.abs(x - prev[0]) > HALF
    if (!penDown || wraps) {
      d += `M${x.toFixed(2)} ${y.toFixed(2)}`
      penDown = true
    } else {
      d += `L${x.toFixed(2)} ${y.toFixed(2)}`
    }
  }
  return d ? `${d}Z` : ''
}

// Build one big path string covering every landmass polygon (outer rings and
// holes alike — the browser's default nonzero fill rule handles holes fine for
// this coarse coastline set).
function buildLandPath(): string {
  let d = ''
  for (const geom of topo.objects.land.geometries) {
    // geom.arcs is a list of polygons; each polygon is a list of rings.
    for (const polygon of geom.arcs) {
      for (const ring of polygon as unknown as number[][]) {
        d += ringToPath(ring as unknown as number[])
      }
    }
  }
  return d
}

export const WORLD_LAND_PATH = buildLandPath()