/**
 * Content-based product similarity — TF-IDF over German product titles plus a
 * few domain signals.
 *
 * Pure JavaScript, no dependencies, no API key: this is what makes the
 * "Ähnliche Produkte" rail work on a fresh clone with zero configuration. The
 * expensive part runs offline (npm run ai:similar) and the result is stored, so
 * page renders only do an indexed lookup.
 */

const STOPWORDS = new Set([
  'und', 'oder', 'mit', 'ohne', 'für', 'fuer', 'der', 'die', 'das', 'ein', 'eine', 'einer', 'den',
  'dem', 'des', 'im', 'in', 'auf', 'aus', 'bei', 'bis', 'zu', 'zum', 'zur', 'von', 'vom', 'als',
  'auch', 'inkl', 'incl', 'ca', 'neu', 'set', 'stück', 'stueck', 'stk', 'st', 'inch', 'zoll',
  'cm', 'mm', 'kg', 'gramm', 'schwarz', 'weiß', 'weiss', 'grau', 'silber', 'blau', 'rot', 'grün',
  'gruen', 'the', 'and', 'for', 'with', 'plus', 'pro', 'max', 'mini', 'edition', 'version',
])

/** Folds umlauts and strips the spec noise Amazon titles are full of. */
export function tokenize(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter(
      (token) =>
        token.length >= 3 &&
        token.length <= 22 &&
        !STOPWORDS.has(token) &&
        // Drop pure numbers and model-number soup ("b0ddcsbl87", "1920x1080").
        !/^\d+$/.test(token) &&
        !/^[a-z]?\d{3,}/.test(token)
    )
}

function termFrequency(tokens) {
  const counts = new Map()
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1)
  return counts
}

/** Builds L2-normalised TF-IDF vectors for every product. */
export function buildVectors(products) {
  const documents = products.map((product) => ({
    id: product.id,
    tokens: tokenize(`${product.name} ${product.brand ?? ''}`),
  }))

  const documentFrequency = new Map()
  for (const doc of documents) {
    for (const token of new Set(doc.tokens)) {
      documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1)
    }
  }

  const total = documents.length
  return documents.map((doc) => {
    const tf = termFrequency(doc.tokens)
    const vector = new Map()
    let norm = 0
    for (const [token, count] of tf) {
      const idf = Math.log((total + 1) / ((documentFrequency.get(token) ?? 0) + 1)) + 1
      const weight = (count / doc.tokens.length) * idf
      vector.set(token, weight)
      norm += weight * weight
    }
    norm = Math.sqrt(norm) || 1
    for (const [token, weight] of vector) vector.set(token, weight / norm)
    return { id: doc.id, vector }
  })
}

function cosine(a, b) {
  // Iterate the shorter vector — most title pairs share very few terms.
  const [small, large] = a.size <= b.size ? [a, b] : [b, a]
  let sum = 0
  for (const [token, weight] of small) {
    const other = large.get(token)
    if (other) sum += weight * other
  }
  return sum
}

/** Domain bonuses on top of text similarity: same shelf, same brand, same price class. */
function contextBonus(a, b) {
  let bonus = 0
  if (a.category && a.category === b.category) bonus += 0.25
  if (a.brand && b.brand && a.brand.toLowerCase() === b.brand.toLowerCase()) bonus += 0.1

  if (a.price > 0 && b.price > 0) {
    const ratio = Math.min(a.price, b.price) / Math.max(a.price, b.price)
    // Within ~±30 % is a comparable purchase decision.
    if (ratio >= 0.7) bonus += 0.15 * ratio
  }

  if (a.rating && b.rating && Math.abs(a.rating - b.rating) <= 0.5) bonus += 0.05
  return bonus
}

/**
 * Top-N neighbours per product.
 * O(n²) on 233 products is ~27k comparisons — milliseconds, no index needed.
 */
export function computeSimilarities(products, topN = 8) {
  const vectors = buildVectors(products)
  const byId = new Map(products.map((product) => [product.id, product]))

  const results = []
  for (let i = 0; i < vectors.length; i += 1) {
    const source = byId.get(vectors[i].id)
    const scored = []

    for (let j = 0; j < vectors.length; j += 1) {
      if (i === j) continue
      const target = byId.get(vectors[j].id)
      const score = cosine(vectors[i].vector, vectors[j].vector) + contextBonus(source, target)
      if (score > 0.05) scored.push({ related_id: target.id, score })
    }

    scored.sort((a, b) => b.score - a.score)
    results.push({
      product_id: source.id,
      neighbours: scored.slice(0, topN).map((entry) => ({
        ...entry,
        score: Math.round(entry.score * 10000) / 10000,
      })),
    })
  }

  return results
}
