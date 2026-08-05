/**
 * Deletes the local database file (plus WAL sidecars) so the next
 * `npm run db:seed` rebuilds it from scratch.
 *
 * Only touches local state; the shareable data lives in the JSON snapshot.
 * Stop `next dev` / `next start` first — an open connection blocks the delete.
 */
import fs from 'node:fs'
import { resolveDbPath } from '../lib/db/paths.mjs'

const file = resolveDbPath()
let removed = 0
for (const target of [file, `${file}-wal`, `${file}-shm`]) {
  if (fs.existsSync(target)) {
    fs.rmSync(target)
    removed += 1
    console.log(`  removed ${target}`)
  }
}
console.log(
  removed === 0
    ? 'Nothing to do — no database file found.'
    : 'Database reset. Run `npm run db:seed` to rebuild it from the snapshot.'
)
