import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'
import { resolveDbPath, repoRoot } from '../../lib/db/paths.mjs'

/**
 * Script-side database access. The scripts talk raw SQL on purpose: Drizzle's
 * schema lives in TypeScript, and shelling a TS loader into every `node
 * scripts/*.mjs` call buys nothing — the migrations below are generated *from*
 * that schema, so there is still a single source of truth.
 */
export function openDb() {
  const file = resolveDbPath()
  const db = new Database(file)
  db.pragma('journal_mode = WAL')
  db.pragma('busy_timeout = 5000')
  db.pragma('foreign_keys = ON')
  return db
}

const MIGRATIONS_DIR = path.join(repoRoot, 'frontend', 'drizzle')

/** Applies every not-yet-applied file from drizzle/*.sql. Idempotent. */
export function migrate(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS _migrations (
    name TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL
  )`)

  const applied = new Set(db.prepare('SELECT name FROM _migrations').all().map((r) => r.name))
  const files = fs.existsSync(MIGRATIONS_DIR)
    ? fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort()
    : []

  // `drizzle-kit push` creates the schema directly without touching our
  // migration log. Without this baseline step the runner would then try to
  // CREATE TABLE again and die with "table already exists".
  if (applied.size === 0 && files.length > 0 && hasSchema(db)) {
    const baseline = db.transaction(() => {
      for (const file of files) {
        db.prepare('INSERT INTO _migrations (name, applied_at) VALUES (?, ?)').run(file, new Date().toISOString())
      }
    })
    baseline()
    console.log(`  ✓ existing schema adopted as baseline (${files.length} migration(s) marked applied)`)
    return 0
  }

  let count = 0
  for (const file of files) {
    if (applied.has(file)) continue
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
    const statements = sql
      .split('--> statement-breakpoint')
      .map((s) => s.trim())
      .filter(Boolean)

    const run = db.transaction(() => {
      for (const statement of statements) db.exec(statement)
      db.prepare('INSERT INTO _migrations (name, applied_at) VALUES (?, ?)').run(file, new Date().toISOString())
    })
    run()
    count += 1
    console.log(`  ✓ migration applied: ${file}`)
  }
  return count
}

/** True when the core tables already exist (schema created by drizzle-kit push). */
function hasSchema(db) {
  const rows = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('products', 'users', 'events')")
    .all()
  return rows.length === 3
}

export function tableCount(db, table) {
  try {
    return db.prepare(`SELECT count(*) AS c FROM ${table}`).get().c
  } catch {
    return 0
  }
}

export const nowIso = () => new Date().toISOString()

/** Stable, dependency-free id for rows we create ourselves. */
export const newId = () => crypto.randomUUID()
