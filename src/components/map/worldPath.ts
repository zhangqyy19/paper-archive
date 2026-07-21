/**
 * A stylised, low-detail world silhouette for an equirectangular projection
 * spanning viewBox "0 0 360 180" (x = lng + 180, y = 90 - lat).
 *
 * This is intentionally rough — soft blobby continents rather than an accurate
 * coastline — to match the app's hand-drawn, papery aesthetic. It is decorative
 * backdrop only; pins are placed with the exact projection, not this path.
 */
export const WORLD_PATH = [
  // North America
  'M62 34 q-12 6 -16 20 q-2 12 6 22 q6 8 4 18 q10 -2 16 -14 q6 -14 18 -20 q10 -6 8 -18 q-2 -10 -16 -12 q-12 -2 -20 4 Z',
  // South America
  'M96 96 q-8 6 -8 22 q0 20 10 30q8 8 12 -2 q4 -14 2 -28 q-2 -16 -8 -24 q-4 -4 -8 2 Z',
  // Africa
  'M172 74 q-10 8 -8 26 q2 22 14 32 q10 6 14 -6 q4 -16 10 -26 q6 -12 0 -22 q-6 -10 -20 -10 q-4 0 -4 6 Z',
  // Europe
  'M168 44 q-8 2 -6 12 q2 8 12 8 q10 0 14 -8 q2 -8 -6 -12 q-8 -4 -14 0 Z',
  // Asia
  'M204 34 q-6 10 4 20 q8 8 24 10 q20 2 34 -6 q14 -8 20 -2 q6 6 -2 14 q10 -2 14 -14 q4 -14 -8 -22 q-16 -10 -40 -12 q-28 -2 -50 2 q-6 2 -0 10 Z',
  // Australia
  'M286 116 q-10 4 -8 16 q2 12 16 14 q16 2 22 -8 q4 -10 -6 -18 q-12 -8 -24 -4 Z',
].join(' ')