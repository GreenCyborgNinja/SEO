/**
 * Exports the product catalogue back into the git-tracked snapshot
 * (backend/scraper/latest-products.json).
 *
 * The database file itself is gitignored, so this is how work that lives only in
 * the DB — AI-generated descriptions, fixed categories, fresh prices — becomes
 * shareable and survives a `db:reset`.
 */
import fs from 'node:fs'
import { snapshotPath } from '../lib/db/paths.mjs'
import { openDb } from './lib/sqlite.mjs'

const db = openDb()
try {
  const rows = db
    .prepare(
      `SELECT id, external_id, name, description, seo_description, description_source,
              price, original_price, affiliate_url, image_url, category, brand,
              rating, review_count, created_at, updated_at
       FROM products
       ORDER BY id`
    )
    .all()

  if (rows.length === 0) {
    console.error('Refusing to export: the products table is empty (this would wipe the snapshot).')
    process.exit(1)
  }

  fs.writeFileSync(snapshotPath, `${JSON.stringify(rows, null, 2)}\n`, 'utf8')
  const withCopy = rows.filter((r) => r.description || r.seo_description).length
  console.log(`Exported ${rows.length} products → ${snapshotPath}`)
  console.log(`  ${withCopy} of them carry descriptions.`)
} finally {
  db.close()
}
