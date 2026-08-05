/**
 * Seeds the SQLite database from the tracked JSON snapshot
 * (backend/scraper/latest-products.json).
 *
 * The snapshot is the portable, git-tracked backup of the database: the scraper
 * refreshes it, `npm run db:export` writes it back out, and a fresh clone gets a
 * fully populated shop — including AI descriptions — with `db:push && db:seed`.
 *
 *   node scripts/db-seed.mjs [--force]
 *
 * Without --force, existing products are updated but locally generated copy
 * (description / seo_description) is never clobbered by empty snapshot values.
 */
import fs from 'node:fs'
import { pathToFileURL } from 'node:url'
import { snapshotPath } from '../lib/db/paths.mjs'
import { assignCategory, cleanText, extractBrand, loadTaxonomy, normalizeRating } from '../lib/catalog/normalize.mjs'
import { migrate, nowIso, openDb, tableCount } from './lib/sqlite.mjs'

const force = process.argv.includes('--force')

export function seedCategories(db) {
  const taxonomy = loadTaxonomy()
  const upsert = db.prepare(`
    INSERT INTO categories (slug, name, description, sort_order)
    VALUES (@slug, @name, @description, @sort_order)
    ON CONFLICT(slug) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      sort_order = excluded.sort_order
  `)
  const run = db.transaction((rows) => rows.forEach((row) => upsert.run(row)))
  run(
    taxonomy.map((category) => ({
      slug: category.slug,
      name: category.name,
      description: category.description ?? null,
      sort_order: category.order ?? 999,
    }))
  )
  return taxonomy.length
}

export function seedProducts(db, { force: overwrite = false } = {}) {
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Snapshot not found: ${snapshotPath}\nRun the scraper first (python backend/scraper/main.py).`)
  }

  const raw = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'))
  const now = nowIso()

  const upsert = db.prepare(`
    INSERT INTO products (
      id, external_id, name, description, seo_description, description_source,
      price, original_price, affiliate_url, image_url, category, brand,
      rating, review_count, created_at, updated_at
    ) VALUES (
      @id, @external_id, @name, @description, @seo_description, @description_source,
      @price, @original_price, @affiliate_url, @image_url, @category, @brand,
      @rating, @review_count, @created_at, @updated_at
    )
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      price = excluded.price,
      original_price = excluded.original_price,
      affiliate_url = excluded.affiliate_url,
      image_url = excluded.image_url,
      category = excluded.category,
      brand = excluded.brand,
      rating = excluded.rating,
      review_count = excluded.review_count,
      -- Keep locally generated copy unless the snapshot actually carries text
      -- (or --force is passed): AI descriptions must survive a re-seed.
      description = CASE WHEN ${overwrite ? '1' : '0'} = 1 THEN excluded.description
                         ELSE coalesce(products.description, excluded.description) END,
      seo_description = CASE WHEN ${overwrite ? '1' : '0'} = 1 THEN excluded.seo_description
                         ELSE coalesce(products.seo_description, excluded.seo_description) END,
      description_source = CASE WHEN ${overwrite ? '1' : '0'} = 1 THEN excluded.description_source
                         ELSE coalesce(products.description_source, excluded.description_source) END,
      updated_at = excluded.updated_at
  `)

  const rows = []
  const seen = new Set()
  for (const item of raw) {
    const id = item.id ?? item.external_id
    if (!id || seen.has(id)) continue
    seen.add(id)

    const name = cleanText(item.name)
    if (!name || item.price == null) continue

    const brand = extractBrand(name, item.brand)
    rows.push({
      id,
      external_id: item.external_id ?? id,
      name,
      description: cleanText(item.description),
      seo_description: cleanText(item.seo_description),
      description_source: item.description_source ?? null,
      price: Number(item.price),
      original_price:
        item.original_price != null && Number(item.original_price) > Number(item.price)
          ? Number(item.original_price)
          : null,
      affiliate_url: item.affiliate_url ?? `https://www.amazon.de/dp/${id}`,
      image_url: item.image_url ?? null,
      category: assignCategory(name, brand, item.category),
      brand,
      rating: normalizeRating(item.rating),
      review_count: Number(item.review_count ?? 0),
      created_at: item.created_at ?? now,
      updated_at: item.updated_at ?? now,
    })
  }

  const run = db.transaction((items) => items.forEach((item) => upsert.run(item)))
  run(rows)
  return { imported: rows.length, skipped: raw.length - rows.length }
}

function main() {
  const db = openDb()
  try {
    migrate(db)
    const categoryCount = seedCategories(db)
    const { imported, skipped } = seedProducts(db, { force })

    const total = tableCount(db, 'products')
    console.log(`\nSeed complete: ${categoryCount} categories, ${imported} products imported${skipped ? ` (${skipped} skipped)` : ''}.`)
    console.log(`Database now holds ${total} products.`)

    const distribution = db
      .prepare(`SELECT coalesce(category, '(none)') AS category, count(*) AS c FROM products GROUP BY 1 ORDER BY c DESC`)
      .all()
    for (const row of distribution) console.log(`  ${row.category.padEnd(20)} ${row.c}`)
  } finally {
    db.close()
  }
}

// Windows-safe "is this the entry point?" check (drive letters + backslashes).
if (import.meta.url === pathToFileURL(process.argv[1]).href) main()
