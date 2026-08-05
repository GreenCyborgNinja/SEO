/**
 * Chart palette. Validated with the dataviz palette validator against a white
 * card surface (light mode): lightness band, chroma floor, CVD separation
 * (worst adjacent ΔE 26.5 protan), normal-vision floor (34.8) and 3:1 contrast
 * all pass.
 *
 * Note SERIES_1 is one step darker than the brand accent #F97316: the brand
 * orange only reaches 2.8:1 on white, which would force the relief rule on every
 * chart. #EA580C keeps the brand feel and clears contrast outright.
 */
export const CHART_COLORS = {
  /** Primary series / all single-series bars. */
  SERIES_1: '#EA580C',
  /** Second series (pageviews vs clicks). */
  SERIES_2: '#2a78d6',
  GRID: '#E2E8F0',
  AXIS: '#C3C2B7',
  TEXT_MUTED: '#64748B',
  SURFACE: '#FFFFFF',
} as const

/** Compact German number formatting for axis ticks and stat tiles. */
export function formatCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.', ',')} Mio.`
  if (Math.abs(value) >= 10_000) return `${Math.round(value / 1000)}K`
  return new Intl.NumberFormat('de-DE').format(value)
}

export function formatEuro(value: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value)
}

/** Nice round upper bound so ticks land on clean numbers. */
export function niceMax(value: number): number {
  if (value <= 5) return 5
  const magnitude = 10 ** Math.floor(Math.log10(value))
  for (const step of [1, 2, 2.5, 5, 10]) {
    const candidate = step * magnitude
    if (candidate >= value) return candidate
  }
  return 10 * magnitude
}
