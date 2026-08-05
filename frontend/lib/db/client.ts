import 'server-only'

import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import { resolveDbPath } from './paths.mjs'

function createConnection() {
  const sqlite = new Database(resolveDbPath())
  // WAL is what makes concurrent access safe: the Python scraper writes while
  // Next keeps reading. busy_timeout absorbs the short write locks.
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('busy_timeout = 5000')
  sqlite.pragma('foreign_keys = ON')
  return drizzle(sqlite, { schema })
}

// Next's dev server re-evaluates modules on every HMR pass; without the cache we
// would leak a file handle per edit.
const globalForDb = globalThis as unknown as { __dailyTrendsDb?: ReturnType<typeof createConnection> }

export const db = globalForDb.__dailyTrendsDb ?? createConnection()

if (process.env.NODE_ENV !== 'production') globalForDb.__dailyTrendsDb = db

export { schema }
