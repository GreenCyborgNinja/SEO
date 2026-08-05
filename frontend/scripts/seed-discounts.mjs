/**
 * Seeds example discount codes so the member area has something to show.
 *
 * These are demo vouchers: as an affiliate shop we have no checkout of our own,
 * so real codes would come from Amazon promotions or brand partnerships.
 *
 *   node scripts/seed-discounts.mjs
 */
import { migrate, newId, nowIso, openDb } from './lib/sqlite.mjs'

const in90Days = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

const CODES = [
  {
    code: 'TRENDS10',
    title: 'Willkommensrabatt für neue Mitglieder',
    description: 'Einmalig auf ausgewählte Technik-Produkte bei Amazon einlösbar.',
    value_label: '10 %',
    audience: 'member',
    valid_until: in90Days,
  },
  {
    code: 'GAMING15',
    title: 'Gaming-Wochen',
    description: 'Auf Gaming-Zubehör aus unserer Kategorie Gaming.',
    value_label: '15 %',
    audience: 'member',
    valid_until: in90Days,
  },
  {
    code: 'LAPTOP25',
    title: '25 € auf Notebooks',
    description: 'Ab einem Bestellwert von 400 € auf Laptops und Zubehör.',
    value_label: '25 €',
    audience: 'member',
    valid_until: in90Days,
  },
  {
    code: 'DEALDAYS',
    title: 'Deal-Days Aktion',
    description: 'Öffentliche Aktion – auch ohne Konto sichtbar.',
    value_label: '5 %',
    audience: 'public',
    valid_until: in90Days,
  },
]

const db = openDb()
try {
  migrate(db)

  const upsert = db.prepare(`
    INSERT INTO discount_codes (id, code, title, description, value_label, audience, valid_until, active, created_at)
    VALUES (@id, @code, @title, @description, @value_label, @audience, @valid_until, 1, @created_at)
    ON CONFLICT(code) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      value_label = excluded.value_label,
      audience = excluded.audience,
      valid_until = excluded.valid_until,
      active = 1
  `)

  const run = db.transaction((rows) =>
    rows.forEach((row) => upsert.run({ ...row, id: newId(), created_at: nowIso() }))
  )
  run(CODES)

  const total = db.prepare('SELECT count(*) AS c FROM discount_codes WHERE active = 1').get().c
  console.log(`Seeded ${CODES.length} discount codes (${total} active in total).`)
} finally {
  db.close()
}
