/**
 * Precomputes the "Ähnliche Produkte" recommendations into product_similarity.
 *
 *   npm run ai:similar              # TF-IDF content similarity (no API key)
 *   npm run ai:similar -- --llm     # additionally let the AI rerank + explain
 *   npm run ai:similar -- --llm --limit=20
 *
 * The content pass is the baseline and always runs; --llm only reorders the top
 * candidates and adds a German one-line reason. Results are cached in the DB
 * forever — no AI call ever happens while serving a request.
 */
import { migrate, nowIso, openDb } from './lib/sqlite.mjs'
import { computeSimilarities } from '../lib/recommend/similarity.mjs'
import { getProvider } from '../lib/ai/provider.mjs'
import { buildSimilarityPrompt } from '../lib/ai/prompts.mjs'

const args = process.argv.slice(2)
const useLlm = args.includes('--llm')
const limitArg = args.find((arg) => arg.startsWith('--limit='))
const llmLimit = limitArg ? Number(limitArg.split('=')[1]) : 0

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const db = openDb()
try {
  migrate(db)

  const products = db
    .prepare('SELECT id, name, brand, category, price, rating FROM products')
    .all()

  if (products.length === 0) {
    console.error('No products in the database — run `npm run db:seed` first.')
    process.exit(1)
  }

  console.log(`Computing content similarity for ${products.length} products …`)
  const started = Date.now()
  const similarities = computeSimilarities(products, 8)

  const insert = db.prepare(`
    INSERT INTO product_similarity (product_id, related_id, score, reason, source, created_at)
    VALUES (@product_id, @related_id, @score, @reason, @source, @created_at)
    ON CONFLICT(product_id, related_id) DO UPDATE SET
      score = excluded.score,
      reason = coalesce(excluded.reason, product_similarity.reason),
      source = excluded.source
  `)

  const now = nowIso()
  const writeAll = db.transaction((rows) => {
    db.prepare('DELETE FROM product_similarity').run()
    for (const row of rows) insert.run(row)
  })

  const rows = similarities.flatMap((entry) =>
    entry.neighbours.map((neighbour) => ({
      product_id: entry.product_id,
      related_id: neighbour.related_id,
      score: neighbour.score,
      reason: null,
      source: 'content',
      created_at: now,
    }))
  )

  writeAll(rows)
  const withNeighbours = similarities.filter((entry) => entry.neighbours.length > 0).length
  console.log(
    `  ✓ ${rows.length} relations for ${withNeighbours}/${products.length} products in ${Date.now() - started} ms`
  )

  if (!useLlm) {
    console.log('\nDone (content-based). Add --llm to let the AI rerank and explain the top matches.')
    process.exit(0)
  }

  const provider = getProvider()
  if (!provider) {
    console.log('\n--llm requested but no AI provider is configured — keeping the content ranking.')
    process.exit(0)
  }

  const byId = new Map(products.map((product) => [product.id, product]))
  const targets = llmLimit > 0 ? similarities.slice(0, llmLimit) : similarities
  console.log(`\nReranking ${targets.length} products via ${provider.name} …`)

  const updateReason = db.prepare(
    `UPDATE product_similarity SET score = @score, reason = @reason, source = 'llm'
     WHERE product_id = @product_id AND related_id = @related_id`
  )

  let reranked = 0
  for (const [index, entry] of targets.entries()) {
    const source = byId.get(entry.product_id)
    const candidates = entry.neighbours.map((n) => byId.get(n.related_id)).filter(Boolean)
    if (candidates.length < 2) continue

    try {
      const raw = await provider.generate(buildSimilarityPrompt(source, candidates), { json: true })
      const cleaned = raw.replace(/^```(?:json)?/gm, '').replace(/```$/gm, '').trim()
      const picks = JSON.parse(cleaned.slice(cleaned.indexOf('['), cleaned.lastIndexOf(']') + 1))

      const valid = picks.filter((pick) => entry.neighbours.some((n) => n.related_id === pick.id))
      // Highest score first, in the order the model picked them.
      valid.forEach((pick, rank) => {
        updateReason.run({
          product_id: entry.product_id,
          related_id: pick.id,
          score: 1 - rank * 0.01,
          reason: typeof pick.grund === 'string' ? pick.grund.slice(0, 160) : null,
        })
      })
      if (valid.length > 0) reranked += 1
    } catch (error) {
      console.warn(`  ! ${entry.product_id}: ${error.message} — keeping content ranking`)
    }

    if (index < targets.length - 1) await sleep(4000)
  }

  console.log(`\nDone. ${reranked} products reranked by ${provider.name}.`)
} finally {
  db.close()
}
