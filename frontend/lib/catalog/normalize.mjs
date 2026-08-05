import fs from 'node:fs'
import { taxonomyPath } from '../db/paths.mjs'

/**
 * Catalog normalisation shared by the app (TS imports this module directly) and
 * the Node scripts. Keep it dependency-free so `node scripts/*.mjs` works with
 * nothing installed but better-sqlite3.
 */

const NAMED_ENTITIES = {
  amp: '&',
  quot: '"',
  apos: "'",
  lt: '<',
  gt: '>',
  nbsp: ' ',
  euro: '€',
  szlig: 'ß',
  auml: 'ä',
  ouml: 'ö',
  uuml: 'ü',
  Auml: 'Ä',
  Ouml: 'Ö',
  Uuml: 'Ü',
  eacute: 'é',
  deg: '°',
  hellip: '…',
  ndash: '–',
  mdash: '—',
  laquo: '«',
  raquo: '»',
  bdquo: '„',
  ldquo: '“',
  rdquo: '”',
  trade: '™',
  reg: '®',
  copy: '©',
  times: '×',
  middot: '·',
  shy: '',
}

/**
 * Decodes the HTML entities the Amazon API leaves in product titles. 73 of the
 * 233 scraped names contain at least one (`15,6&quot;` etc.) and they used to be
 * rendered literally on every card.
 */
export function decodeEntities(input) {
  if (!input) return input ?? ''
  let out = String(input)
  // Numeric first, so &#38;quot; style double-encoding collapses correctly.
  out = out.replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  out = out.replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
  out = out.replace(/&([a-z]+);/gi, (match, name) =>
    Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, name) ? NAMED_ENTITIES[name] : match
  )
  return out
}

/** decodeEntities + strip stray tags + collapse whitespace. */
export function cleanText(input) {
  if (input == null) return null
  const cleaned = decodeEntities(String(input))
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned.length > 0 ? cleaned : null
}

let cachedTaxonomy = null

export function loadTaxonomy() {
  if (!cachedTaxonomy) {
    const raw = JSON.parse(fs.readFileSync(taxonomyPath, 'utf8'))
    cachedTaxonomy = [...raw.categories].sort((a, b) => a.order - b.order)
  }
  return cachedTaxonomy
}

export function fallbackCategorySlug() {
  const taxonomy = loadTaxonomy()
  return (taxonomy.find((c) => c.fallback) ?? taxonomy[taxonomy.length - 1]).slug
}

/** A keyword in the product-type part of the title counts far more than one buried in the spec soup. */
const HEAD_LENGTH = 45
const HEAD_WEIGHT = 3
const TAIL_WEIGHT = 1

/**
 * Maps a product onto a taxonomy slug by scoring keyword hits: Amazon titles are
 * keyword soup ("Gaming PC ... RGB ... 1TB SSD ... für Tastatur"), so a plain
 * first-match scan mislabels most of the catalogue. Hits in the first
 * HEAD_LENGTH characters — where the actual product type lives — outweigh later
 * ones; ties fall back to taxonomy order (specific before broad).
 * An explicit slug from the scraper always wins.
 */
export function assignCategory(name, brand = null, explicitSlug = null) {
  const taxonomy = loadTaxonomy()
  if (explicitSlug && taxonomy.some((c) => c.slug === explicitSlug)) return explicitSlug

  const title = decodeEntities(`${name ?? ''} ${brand ?? ''}`).toLowerCase()
  const head = title.slice(0, HEAD_LENGTH)

  let best = null
  let bestScore = 0
  for (const category of taxonomy) {
    let score = 0
    for (const keyword of category.keywords) {
      const pattern = keywordPattern(keyword)
      if (pattern.test(head)) score += HEAD_WEIGHT
      else if (pattern.test(title)) score += TAIL_WEIGHT
    }
    if (score > bestScore) {
      bestScore = score
      best = category.slug
    }
  }
  return best ?? fallbackCategorySlug()
}

const patternCache = new Map()

/**
 * A keyword must END on a word boundary, optionally followed by a German plural
 * ending. Leading characters are allowed so compounds still match in head
 * position ("Ladekabel" → kabel, "Monitorhalterung" → halterung), while prefix
 * collisions no longer fire ("kabellos" ↛ kabel, "Mauspad" ↛ maus) — those cost
 * us a wireless-headphone-in-accessories bug on the first pass.
 */
function keywordPattern(keyword) {
  const key = keyword.toLowerCase()
  let pattern = patternCache.get(key)
  if (!pattern) {
    pattern = new RegExp(`${escapeRegex(key)}(?:en|e|n|s)?(?![a-zäöüß])`, 'i')
    patternCache.set(key, pattern)
  }
  return pattern
}

/** The API mixes 0–5 and 0–50 rating scales. */
export function normalizeRating(value) {
  if (value == null) return null
  const num = Number(value)
  if (!Number.isFinite(num) || num <= 0) return null
  const scaled = num > 10 ? num / 10 : num
  return Math.round(Math.min(scaled, 5) * 10) / 10
}

const KNOWN_BRANDS = [
  'Lenovo', 'HP', 'Dell', 'Acer', 'ASUS', 'Asus', 'Apple', 'Samsung', 'Xiaomi', 'Huawei',
  'MSI', 'Razer', 'Logitech', 'Corsair', 'SteelSeries', 'HyperX', 'Sony', 'Bose', 'JBL',
  'Anker', 'Ugreen', 'UGREEN', 'Belkin', 'Sandisk', 'SanDisk', 'Seagate', 'Crucial',
  'Kingston', 'Western Digital', 'WD', 'Intenso', 'TP-Link', 'AVM', 'FRITZ!Box', 'Netgear',
  'Canon', 'Epson', 'Brother', 'Nintendo', 'Microsoft', 'Google', 'Motorola', 'Nokia',
  'OnePlus', 'Oppo', 'Realme', 'Nothing', 'Medion', 'LG', 'Philips', 'AOC', 'BenQ',
  'Iiyama', 'Sennheiser', 'Beats', 'Soundcore', 'Garmin', 'Fitbit', 'Amazfit', 'Trust',
  'Sharkoon', 'be quiet!', 'Cooler Master', 'Thermaltake', 'NZXT', 'Gigabyte', 'AMD', 'Intel',
]

/**
 * The /search endpoint does not return a brand, so we recover it from the title:
 * a known brand anywhere in the name, else the first word if it looks like a name.
 */
export function extractBrand(name, existing = null) {
  const cleanedExisting = cleanText(existing)
  if (cleanedExisting) return cleanedExisting
  const cleaned = decodeEntities(name ?? '')
  const hit = KNOWN_BRANDS.find((brand) => new RegExp(`(^|[^a-z])${escapeRegex(brand)}([^a-z]|$)`, 'i').test(cleaned))
  if (hit) return hit
  const first = cleaned.trim().split(/[\s,|–-]+/)[0]
  if (first && first.length >= 2 && first.length <= 18 && /^[A-Za-zÄÖÜäöü][A-Za-z0-9ÄÖÜäöü!.&+]*$/.test(first)) {
    return first
  }
  return null
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\!]/g, '\\$&')
}
