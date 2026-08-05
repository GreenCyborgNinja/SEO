/**
 * prebuild hook: makes sure `next build` always finds a usable database.
 *
 * Applies pending migrations, seeds the taxonomy, and imports the product
 * snapshot when the catalogue is still empty. Fails loudly on an empty
 * catalogue — a silent build over 0 products would publish an empty shop.
 */
import { migrate, openDb, tableCount } from './lib/sqlite.mjs'
import { seedCategories, seedProducts } from './db-seed.mjs'
import { resolveDbPath } from '../lib/db/paths.mjs'

const db = openDb()
try {
  console.log(`Preparing database at ${resolveDbPath()}`)
  const applied = migrate(db)
  if (applied === 0) console.log('  ✓ schema already up to date')

  seedCategories(db)

  if (tableCount(db, 'products') === 0) {
    console.log('  · catalogue empty → importing snapshot')
    const { imported } = seedProducts(db)
    console.log(`  ✓ imported ${imported} products`)
  }

  const total = tableCount(db, 'products')
  if (total === 0) {
    console.error(
      '\nERROR: no products in the database — the build would produce an empty shop.\n' +
        'Fix: run `npm run db:seed` (imports backend/scraper/latest-products.json)\n' +
        '     or `python backend/scraper/main.py` to fetch fresh data.'
    )
    process.exit(1)
  }
  console.log(`  ✓ ready: ${total} products, ${tableCount(db, 'categories')} categories`)
} finally {
  db.close()
}
