import { defineConfig } from 'drizzle-kit'
import { resolveDbPath } from './lib/db/paths.mjs'

export default defineConfig({
  dialect: 'sqlite',
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: resolveDbPath() },
  verbose: true,
  strict: false,
})
