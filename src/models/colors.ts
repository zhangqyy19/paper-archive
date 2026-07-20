import type { CoverColorId } from './types'

/**
 * A preset cover color. `base`/`shade`/`edge` build a realistic hardcover:
 *  - base:  the main cloth/linen color
 *  - shade: a darker tone for the spine and depth
 *  - edge:  a lighter tone for the top page edge / highlight
 *  - ink:   the color of the title foil-stamped on the cover
 */
export interface CoverColor {
  id: CoverColorId
  name: string
  base: string
  shade: string
  edge: string
  ink: string
}

export const COVER_COLORS: readonly CoverColor[] = [
  { id: 'forest', name: 'Forest Green', base: '#3f5545', shade: '#2f4034', edge: '#546a58', ink: '#e9e4d4' },
  { id: 'navy', name: 'Navy', base: '#33415c', shade: '#252f45', edge: '#47567a', ink: '#e7e9f0' },
  { id: 'burgundy', name: 'Burgundy', base: '#6d3b3f', shade: '#522a2e', edge: '#864b50', ink: '#f0e2df' },
  { id: 'cream', name: 'Cream', base: '#e6ddc8', shade: '#d4c9ae', edge: '#f2ecdd', ink: '#5a5142' },
  { id: 'charcoal', name: 'Charcoal', base: '#3b3b3d', shade: '#2a2a2c', edge: '#525254', ink: '#e4e2df' },
  { id: 'dusty-blue', name: 'Dusty Blue', base: '#7c93a6', shade: '#647a8c', edge: '#95aabb', ink: '#f1f4f7' },
  { id: 'sage', name: 'Sage', base: '#98a58c', shade: '#808d74', edge: '#adb9a3', ink: '#33392c' },
  { id: 'terracotta', name: 'Terracotta', base: '#b5715a', shade: '#985a45', edge: '#c98b74', ink: '#f6e8e1' },
  { id: 'lavender', name: 'Lavender', base: '#9b8fb0', shade: '#82769a', edge: '#b0a5c4', ink: '#f2eff7' },
  { id: 'sand', name: 'Sand', base: '#cbb894', shade: '#b6a37e', edge: '#dccaa8', ink: '#4f4633' },
  { id: 'midnight', name: 'Midnight', base: '#242a3d', shade: '#171b29', edge: '#37405a', ink: '#dfe3ee' },
  { id: 'olive', name: 'Olive', base: '#6c6b3f', shade: '#57562f', edge: '#83824f', ink: '#eeead2' },
]

const COLOR_MAP = new Map(COVER_COLORS.map((c) => [c.id, c]))

export function getCoverColor(id: CoverColorId): CoverColor {
  return COLOR_MAP.get(id) ?? COVER_COLORS[0]
}

/** Whether a cover color is dark (used to pick contrasting UI text). */
export function isDarkCover(id: CoverColorId): boolean {
  return !['cream', 'sand'].includes(id)
}