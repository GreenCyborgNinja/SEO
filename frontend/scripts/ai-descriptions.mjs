/**
 * Generates German product descriptions and meta descriptions.
 *
 * Every scraped product used to have `description: ""` — the single biggest SEO
 * gap in the shop. This fills it once and stores the result, so a page render
 * never touches an AI API.
 *
 *   npm run ai:descriptions                  # all products still missing copy
 *   npm run ai:descriptions -- --limit=20    # only the first 20
 *   npm run ai:descriptions -- --batch=5     # products per API request
 *   npm run ai:descriptions -- --force       # regenerate everything
 *   AI_PROVIDER=template npm run ai:descriptions   # offline, no API key
 *
 * Resumable by design: each batch is written immediately, and a failed batch
 * falls back to the deterministic template per product rather than aborting.
 */
import { migrate, nowIso, openDb } from './lib/sqlite.mjs'
import { getProvider } from '../lib/ai/provider.mjs'
import { buildDescriptionPrompt } from '../lib/ai/prompts.mjs'
import { templateDescription } from '../lib/ai/template.mjs'

const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const hit = args.find((arg) => arg.startsWith(`--${name}=`))
  return hit ? Number(hit.split('=')[1]) : fallback
}
const limit = flag('limit', 0)
const batchSize = Math.max(1, Math.min(flag('batch', 5), 12))
const force = args.includes('--force')
const pauseMs = flag('pause', 5000)

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** Tolerates ```json fences and stray prose around the array. */
function parseJsonArray(raw) {
  const cleaned = raw.replace(/^```(?:json)?/gm, '').replace(/```$/gm, '').trim()
  const start = cleaned.indexOf('[')
  const end = cleaned.lastIndexOf(']')
  if (start === -1 || end === -1) throw new Error('no JSON array in response')
  const parsed = JSON.parse(cleaned.slice(start, end + 1))
  if (!Array.isArray(parsed)) throw new Error('response is not an array')
  return parsed
}

function sanitize(value, maxLength) {
  if (typeof value !== 'string') return null
  const text = value.replace(/\s+/g, ' ').trim()
  if (text.length < 20) return null
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1).trimEnd()}…`
}

const db = openDb()
try {
  migrate(db)

  const where = force
    ? '1 = 1'
    : "(description IS NULL OR trim(description) = '' OR seo_description IS NULL OR trim(seo_description) = '')"
  const rows = db
    .prepare(
      `SELECT id, name, brand, category, price, original_price, rating, review_count
       FROM products WHERE ${where} ORDER BY rating DESC NULLS LAST, review_count DESC
       ${limit > 0 ? `LIMIT ${limit}` : ''}`
    )
    .all()

  if (rows.length === 0) {
    console.log('Nothing to do — every product already has a description.')
    process.exit(0)
  }

  const provider = getProvider()
  console.log(`Generating copy for ${rows.length} products via ${provider ? provider.name : 'deterministic templates'}.`)

  const update = db.prepare(
    `UPDATE products
     SET description = @description, seo_description = @seo_description,
         description_source = @source, updated_at = @updated_at
     WHERE id = @id`
  )
  const writeBatch = db.transaction((items) => items.forEach((item) => update.run(item)))

  let aiCount = 0
  let templateCount = 0
  let apiCalls = 0

  for (let offset = 0; offset < rows.length; offset += batchSize) {
    const batch = rows.slice(offset, offset + batchSize)
    const results = new Map()

    if (provider) {
      try {
        apiCalls += 1
        const raw = await provider.generate(buildDescriptionPrompt(batch), { json: true })
        for (const entry of parseJsonArray(raw)) {
          const description = sanitize(entry.description, 400)
          const seo = sanitize(entry.seo_description, 155)
          if (entry.asin && description && seo) {
            results.set(String(entry.asin), { description, seo_description: seo })
          }
        }
      } catch (error) {
        console.warn(`  ! batch ${offset / batchSize + 1} failed: ${error.message} — using templates`)
      }
    }

    const updates = batch.map((product) => {
      const ai = results.get(product.id)
      const copy = ai ?? templateDescription(product)
      if (ai) aiCount += 1
      else templateCount += 1
      return {
        id: product.id,
        description: copy.description,
        seo_description: copy.seo_description,
        source: ai ? 'ai' : 'template',
        updated_at: nowIso(),
      }
    })

    writeBatch(updates)
    console.log(`  ✓ ${Math.min(offset + batch.length, rows.length)}/${rows.length} written`)

    // Spacing keeps us comfortably inside the Gemini free-tier rate limit.
    if (provider && offset + batchSize < rows.length) await sleep(pauseMs)
  }

  console.log(`\nDone. ${aiCount} AI-generated, ${templateCount} from templates, ${apiCalls} API calls.`)
  console.log('Run `npm run db:export` to persist the copy into the git-tracked snapshot.')
} finally {
  db.close()
}
