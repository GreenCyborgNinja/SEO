import 'server-only'

import { sql } from 'drizzle-orm'
import { db } from './client'
import { adSpend } from './schema'

/**
 * Read model for the admin dashboard — our replacement for Google Analytics.
 *
 * Everything is derived from two local tables: `events` (pageviews + affiliate
 * clicks, written first-party) and `ad_spend` (manually entered ad budget). No
 * third-party tracker, no external API.
 */

export interface Kpis {
  pageviews: number
  clicks: number
  /** Affiliate clicks per pageview, in percent. */
  ctr: number
  new_customers: number
  spend: number
  /** Σ Werbekosten / Neukunden — null when there were no new customers. */
  cac: number | null
  visitors: number
}

export interface DailyPoint {
  day: string
  pageviews: number
  clicks: number
}

export interface LabelledCount {
  label: string
  value: number
  href?: string
}

function rangeStart(days: number): string {
  const from = new Date()
  from.setDate(from.getDate() - (days - 1))
  from.setHours(0, 0, 0, 0)
  return from.toISOString()
}

export async function getKpis(days: number): Promise<Kpis> {
  const from = rangeStart(days)

  const traffic = db.get<{ pageviews: number; clicks: number; visitors: number }>(sql`
    SELECT
      sum(CASE WHEN type = 'pageview' THEN 1 ELSE 0 END) AS pageviews,
      sum(CASE WHEN type = 'click' THEN 1 ELSE 0 END)    AS clicks,
      count(DISTINCT session_id)                          AS visitors
    FROM events
    WHERE created_at >= ${from}
  `)

  const customers = db.get<{ count: number }>(sql`
    SELECT count(*) AS count FROM users WHERE created_at >= ${from}
  `)

  const spendRow = db.get<{ total: number }>(sql`
    SELECT coalesce(sum(amount_eur), 0) AS total
    FROM ad_spend
    WHERE day >= ${from.slice(0, 10)}
  `)

  const pageviews = traffic?.pageviews ?? 0
  const clicks = traffic?.clicks ?? 0
  const newCustomers = customers?.count ?? 0
  const spend = spendRow?.total ?? 0

  return {
    pageviews,
    clicks,
    visitors: traffic?.visitors ?? 0,
    ctr: pageviews > 0 ? Math.round((clicks / pageviews) * 1000) / 10 : 0,
    new_customers: newCustomers,
    spend,
    // The formula from the presentation. Undefined without new customers —
    // showing 0 € or ∞ would both be lies.
    cac: newCustomers > 0 ? Math.round((spend / newCustomers) * 100) / 100 : null,
  }
}

/** One row per day in the range, including days with no traffic at all. */
export async function getDailySeries(days: number): Promise<DailyPoint[]> {
  const from = rangeStart(days)

  const rows = db.all<{ day: string; pageviews: number; clicks: number }>(sql`
    SELECT
      substr(created_at, 1, 10) AS day,
      sum(CASE WHEN type = 'pageview' THEN 1 ELSE 0 END) AS pageviews,
      sum(CASE WHEN type = 'click' THEN 1 ELSE 0 END)    AS clicks
    FROM events
    WHERE created_at >= ${from}
    GROUP BY day
    ORDER BY day
  `)

  const byDay = new Map(rows.map((row) => [row.day, row]))
  const series: DailyPoint[] = []
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date()
    date.setDate(date.getDate() - offset)
    const key = date.toISOString().slice(0, 10)
    const row = byDay.get(key)
    series.push({ day: key, pageviews: row?.pageviews ?? 0, clicks: row?.clicks ?? 0 })
  }
  return series
}

export async function getTopProducts(days: number, limit = 10): Promise<LabelledCount[]> {
  const rows = db.all<{ id: string; name: string; clicks: number }>(sql`
    SELECT p.id AS id, p.name AS name, count(*) AS clicks
    FROM events e
    JOIN products p ON p.id = e.product_id
    WHERE e.type = 'click' AND e.created_at >= ${rangeStart(days)}
    GROUP BY p.id
    ORDER BY clicks DESC
    LIMIT ${limit}
  `)

  return rows.map((row) => ({
    label: row.name.length > 46 ? `${row.name.slice(0, 45)}…` : row.name,
    value: row.clicks,
    href: `/product/${row.id}`,
  }))
}

export async function getClicksByCategory(days: number): Promise<LabelledCount[]> {
  const rows = db.all<{ label: string; value: number }>(sql`
    SELECT coalesce(c.name, e.category, 'Ohne Kategorie') AS label, count(*) AS value
    FROM events e
    LEFT JOIN categories c ON c.slug = e.category
    WHERE e.type = 'click' AND e.created_at >= ${rangeStart(days)}
    GROUP BY label
    ORDER BY value DESC
  `)
  return rows
}

const PLACEMENT_LABELS: Record<string, string> = {
  card: 'Produktkarte',
  detail: 'Produktseite',
  rail: 'Empfehlungen',
  search: 'Suchergebnis',
  'ad-skyscraper': 'Werbung: Skyscraper',
  'ad-wide-skyscraper': 'Werbung: Wide Skyscraper',
  'ad-leaderboard': 'Werbung: Leaderboard',
  'ad-rectangle': 'Werbung: Rectangle',
  'ad-square': 'Werbung: Square',
}

/** Which placement actually converts — the whole point of the ascsubtag. */
export async function getClicksBySource(days: number): Promise<LabelledCount[]> {
  const rows = db.all<{ src: string; value: number }>(sql`
    SELECT coalesce(src, 'unbekannt') AS src, count(*) AS value
    FROM events
    WHERE type = 'click' AND created_at >= ${rangeStart(days)}
    GROUP BY src
    ORDER BY value DESC
  `)

  return rows.map((row) => ({ label: PLACEMENT_LABELS[row.src] ?? row.src, value: row.value }))
}

export async function getSpendEntries(limit = 30) {
  return db.select().from(adSpend).orderBy(sql`${adSpend.day} DESC`).limit(limit).all()
}

export async function getSpendByChannel(days: number): Promise<LabelledCount[]> {
  const rows = db.all<{ label: string; value: number }>(sql`
    SELECT channel AS label, sum(amount_eur) AS value
    FROM ad_spend
    WHERE day >= ${rangeStart(days).slice(0, 10)}
    GROUP BY channel
    ORDER BY value DESC
  `)
  return rows
}

export async function addSpend(input: { day: string; channel: string; amount_eur: number; note?: string }) {
  db.insert(adSpend)
    .values({
      id: crypto.randomUUID(),
      day: input.day,
      channel: input.channel,
      amount_eur: input.amount_eur,
      note: input.note ?? null,
      created_at: new Date().toISOString(),
    })
    .run()
}

export async function deleteSpend(id: string) {
  db.delete(adSpend).where(sql`${adSpend.id} = ${id}`).run()
}
