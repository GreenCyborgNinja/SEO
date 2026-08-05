import { CHART_COLORS, formatCompact, niceMax } from './tokens'
import type { DailyPoint } from '@/lib/db/analytics'

interface LineChartProps {
  title: string
  subtitle?: string
  data: DailyPoint[]
}

const WIDTH = 720
const HEIGHT = 260
const PAD = { top: 16, right: 56, bottom: 28, left: 44 }

/**
 * Two series (pageviews + affiliate clicks) on ONE axis — both are event counts,
 * so a shared scale is honest and a second y-axis would be a lie. Legend plus
 * end-labels carry identity, never colour alone.
 */
export default function LineChart({ title, subtitle, data }: LineChartProps) {
  const plotWidth = WIDTH - PAD.left - PAD.right
  const plotHeight = HEIGHT - PAD.top - PAD.bottom

  const max = niceMax(Math.max(1, ...data.flatMap((point) => [point.pageviews, point.clicks])))
  const stepX = data.length > 1 ? plotWidth / (data.length - 1) : 0
  const x = (index: number) => PAD.left + index * stepX
  const y = (value: number) => PAD.top + plotHeight - (value / max) * plotHeight

  const path = (key: 'pageviews' | 'clicks') =>
    data.map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(point[key])}`).join(' ')

  const ticks = [0, max / 2, max]
  const last = data[data.length - 1]
  const labelEvery = Math.max(1, Math.ceil(data.length / 7))

  const series = [
    { key: 'pageviews' as const, label: 'Seitenaufrufe', color: CHART_COLORS.SERIES_2 },
    { key: 'clicks' as const, label: 'Affiliate-Klicks', color: CHART_COLORS.SERIES_1 },
  ]

  return (
    <figure className="bg-white rounded-xl shadow-md p-5 m-0">
      <figcaption className="mb-1 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h3 className="font-semibold text-primary">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex gap-4 text-xs text-gray-500">
          {series.map((entry) => (
            <span key={entry.key} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="inline-block w-3 h-[2px] rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.label}
            </span>
          ))}
        </div>
      </figcaption>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          width="100%"
          height={HEIGHT}
          role="img"
          aria-label={`${title}. Seitenaufrufe und Affiliate-Klicks pro Tag über ${data.length} Tage.`}
          style={{ minWidth: 560 }}
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.left}
                y1={y(tick)}
                x2={WIDTH - PAD.right}
                y2={y(tick)}
                stroke={CHART_COLORS.GRID}
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={y(tick)}
                textAnchor="end"
                dominantBaseline="central"
                fontSize={11}
                fill={CHART_COLORS.TEXT_MUTED}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {formatCompact(tick)}
              </text>
            </g>
          ))}

          {series.map((entry) => (
            <path
              key={entry.key}
              d={path(entry.key)}
              fill="none"
              stroke={entry.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}

          {/* Markers get a surface ring so they stay legible where the lines cross. */}
          {series.map((entry) =>
            data.map((point, index) => (
              <circle
                key={`${entry.key}-${point.day}`}
                cx={x(index)}
                cy={y(point[entry.key])}
                r={4}
                fill={entry.color}
                stroke={CHART_COLORS.SURFACE}
                strokeWidth={2}
              >
                <title>{`${new Date(point.day).toLocaleDateString('de-DE')}: ${point[entry.key]} ${entry.label}`}</title>
              </circle>
            ))
          )}

          {/* Direct end-labels — only on the last point, never on every point. */}
          {last &&
            series.map((entry) => (
              <text
                key={`label-${entry.key}`}
                x={WIDTH - PAD.right + 8}
                y={y(last[entry.key])}
                dominantBaseline="central"
                fontSize={12}
                fontWeight={600}
                fill={CHART_COLORS.TEXT_MUTED}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {formatCompact(last[entry.key])}
              </text>
            ))}

          {data.map((point, index) =>
            index % labelEvery === 0 || index === data.length - 1 ? (
              <text
                key={`x-${point.day}`}
                x={x(index)}
                y={HEIGHT - 8}
                textAnchor="middle"
                fontSize={11}
                fill={CHART_COLORS.TEXT_MUTED}
              >
                {new Date(point.day).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
              </text>
            ) : null
          )}

          <line
            x1={PAD.left}
            y1={PAD.top + plotHeight}
            x2={WIDTH - PAD.right}
            y2={PAD.top + plotHeight}
            stroke={CHART_COLORS.AXIS}
            strokeWidth={1}
          />
        </svg>
      </div>
    </figure>
  )
}
