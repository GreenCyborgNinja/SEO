import { cn } from '@/lib/utils'

interface StatTileProps {
  label: string
  value: string
  hint?: string
  /** Renders larger — use for the one number the dashboard leads with. */
  hero?: boolean
  tone?: 'default' | 'accent'
}

/**
 * label · value · hint. No sparkline: the two charts below already carry the
 * trend, and a tile that repeats them adds ink without adding information.
 */
export default function StatTile({ label, value, hint, hero = false, tone = 'default' }: StatTileProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-md p-5',
        hero && 'sm:col-span-2 ring-1 ring-accent/20'
      )}
    >
      <p className="text-sm text-gray-500">{label}</p>
      <p
        className={cn(
          'font-semibold mt-1 leading-tight',
          hero ? 'text-5xl' : 'text-3xl',
          tone === 'accent' ? 'text-accent' : 'text-primary'
        )}
      >
        {value}
      </p>
      {hint && <p className="text-xs text-gray-400 mt-2">{hint}</p>}
    </div>
  )
}
