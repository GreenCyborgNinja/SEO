import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))

/** Repo root — `frontend/lib/db` → up three levels. */
export const repoRoot = path.resolve(here, '..', '..', '..')

/**
 * Absolute path of the SQLite file. Override with DATABASE_PATH (relative paths
 * resolve against the repo root) — useful when the repo lives in a synced folder
 * like OneDrive, where SQLite's file locking is unreliable.
 */
export function resolveDbPath() {
  const configured = process.env.DATABASE_PATH
  const target = configured
    ? path.isAbsolute(configured)
      ? configured
      : path.resolve(repoRoot, configured)
    : path.join(repoRoot, 'data', 'daily-trends.db')
  fs.mkdirSync(path.dirname(target), { recursive: true })
  return target
}

export const snapshotPath = path.join(repoRoot, 'backend', 'scraper', 'latest-products.json')
export const taxonomyPath = path.join(repoRoot, 'shared', 'taxonomy.json')
export const curatedAdsPath = path.join(repoRoot, 'shared', 'curated-ads.json')
export const mailOutboxDir = path.join(repoRoot, 'data', 'mail-outbox')

/** Reads a JSON file from the shared/ directory at runtime. */
export function readSharedJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}
