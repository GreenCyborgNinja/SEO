import Link from 'next/link'
import { CHART_COLORS, formatCompact, niceMax } from './tokens'
import type { LabelledCount } from '@/lib/db/analytics'

interface BarChartProps {
  title: string
  subtitle?: string
  data: LabelledCount[]
  /** Suffix for the direct value labels, e.g. ' Klicks'. */
  unit?: string
  emptyMessage?: string
}

const ROW_HEIGHT = 34
const BAR_HEIGHT = 20 // ≤ 24px: the band keeps its air
const LABEL_WIDTH = 210
const VALUE_WIDTH = 56

/**
 * Horizontal bars, single hue (magnitude → sequential). Long German category and
 * product names is exactly the case the dataviz guidance points horizontal for.
 * Values are direct-labelled at the tip, so no gridlines are needed.
 */
export default function BarChart({
  title,
  subtitle,
  data,
  unit = '',
  emptyMessage = 'Noch keine Daten für diesen Zeitraum.',
}: BarChartProps) {
  const max = niceMax(Math.max(1, ...data.map((entry) => entry.value)))
  const chartWidth = 640
  const trackWidth = chartWidth - LABEL_WIDTH - VALUE_WIDTH
  const height = Math.max(ROW_HEIGHT, data.length * ROW_HEIGHT)

  return (
    <figure className="bg-white rounded-xl shadow-md p-5 m-0">
      <figcaption className="mb-4">
        <h3 className="font-semibold text-primary">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </figcaption>

      {data.length === 0 ? (
        <p className="text-sm text-gray-500 py-6">{emptyMessage}</p>
      ) : (
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${height}`}
            width="100%"
            height={height}
            role="img"
            aria-label={`${title}: ${data.map((d) => `${d.label} ${d.value}`).join(', ')}`}
            style={{ minWidth: 520 }}
          >
            {data.map((entry, index) => {
              const y = index * ROW_HEIGHT
              const barWidth = Math.max(2, (entry.value / max) * trackWidth)
              return (
                <g key={entry.label}>
                  <title>{`${entry.label}: ${entry.value}${unit}`}</title>
                  <text
                    x={LABEL_WIDTH - 10}
                    y={y + ROW_HEIGHT / 2}
                    textAnchor="end"
                    dominantBaseline="central"
                    fontSize={12}
                    fill={CHART_COLORS.TEXT_MUTED}
                  >
                    {entry.label.length > 32 ? `${entry.label.slice(0, 31)}…` : entry.label}
                  </text>
                  {/* 4px rounded data-end, square at the baseline */}
                  <rect
                    x={LABEL_WIDTH}
                    y={y + (ROW_HEIGHT - BAR_HEIGHT) / 2}
                    width={barWidth}
                    height={BAR_HEIGHT}
                    rx={4}
                    fill={CHART_COLORS.SERIES_1}
                  />
                  <rect
                    x={LABEL_WIDTH}
                    y={y + (ROW_HEIGHT - BAR_HEIGHT) / 2}
                    width={Math.min(4, barWidth)}
                    height={BAR_HEIGHT}
                    fill={CHART_COLORS.SERIES_1}
                  />
                  <text
                    x={LABEL_WIDTH + barWidth + 8}
                    y={y + ROW_HEIGHT / 2}
                    dominantBaseline="central"
                    fontSize={12}
                    fontWeight={600}
                    fill={CHART_COLORS.TEXT_MUTED}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatCompact(entry.value)}
                  </text>
                </g>
              )
            })}
            <line
              x1={LABEL_WIDTH}
              y1={0}
              x2={LABEL_WIDTH}
              y2={height}
              stroke={CHART_COLORS.AXIS}
              strokeWidth={1}
            />
          </svg>
        </div>
      )}

      {/* Table view: the accessible path to the same numbers, and where product links live. */}
      {data.some((entry) => entry.href) && (
        <ul className="mt-4 pt-4 border-t space-y-1.5 text-sm">
          {data.slice(0, 5).map((entry) =>
            entry.href ? (
              <li key={entry.label} className="flex justify-between gap-4">
                <Link href={entry.href} className="text-accent hover:underline truncate">
                  {entry.label}
                </Link>
                <span className="text-gray-500 tabular-nums shrink-0">
                  {entry.value}
                  {unit}
                </span>
              </li>
            ) : null
          )}
        </ul>
      )}
    </figure>
  )
}
