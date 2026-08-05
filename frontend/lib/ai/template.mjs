/**
 * Deterministic German product copy built purely from the data we already have.
 *
 * This is the reason the shop never depends on an API key: with no provider
 * configured (or when a single AI batch fails), every product still gets a
 * readable description and a valid meta description.
 */

const CATEGORY_PHRASES = {
  laptops: { noun: 'Laptop', use: 'für Arbeit, Studium und Alltag' },
  computer: { noun: 'PC-System', use: 'für den Schreibtisch' },
  smartphones: { noun: 'Smartphone', use: 'für den täglichen Begleiter' },
  tablets: { noun: 'Tablet', use: 'für unterwegs und auf dem Sofa' },
  audio: { noun: 'Audio-Produkt', use: 'für Musik, Calls und Gaming' },
  wearables: { noun: 'Smartwatch', use: 'für Training und Benachrichtigungen' },
  beleuchtung: { noun: 'Beleuchtungs-Produkt', use: 'für Schreibtisch und Setup' },
  monitore: { noun: 'Display', use: 'für Office, Medien und Gaming' },
  peripherie: { noun: 'Arbeitsplatz-Zubehör', use: 'für den Schreibtisch' },
  'speicher-netzwerk': { noun: 'Speicher- und Netzwerkprodukt', use: 'für mehr Platz und stabileres Netz' },
  gaming: { noun: 'Gaming-Produkt', use: 'für dein Setup' },
  zubehoer: { noun: 'Zubehör', use: 'für den Alltag' },
}

/** Keeps the first meaningful part of an Amazon keyword-soup title. */
function shortTitle(name) {
  const cut = name.split(/\s[|–-]\s|,\s/)[0].trim()
  return cut.length >= 12 ? cut : name.slice(0, 70).trim()
}

function ratingSentence(product) {
  if (!product.rating || !product.review_count) return ''
  const rating = String(product.rating).replace('.', ',')
  if (product.review_count >= 50) {
    return ` Käufer bewerten es im Schnitt mit ${rating} von 5 Sternen (${product.review_count} Bewertungen).`
  }
  return ` Die Bewertung liegt bei ${rating} von 5 Sternen.`
}

function savingsSentence(product) {
  if (!product.original_price || product.original_price <= product.price) return ''
  const percent = Math.round(((product.original_price - product.price) / product.original_price) * 100)
  if (percent < 5) return ''
  return ` Aktuell ist es ${percent} % günstiger als der zuvor gelistete Preis.`
}

export function templateDescription(product) {
  const phrase = CATEGORY_PHRASES[product.category] ?? { noun: 'Produkt', use: 'für den Alltag' }
  const brand = product.brand ? `${product.brand} ` : ''
  const title = shortTitle(product.name)

  const description = [
    `${title} ist ein ${brand}${phrase.noun} ${phrase.use}.`,
    ratingSentence(product),
    savingsSentence(product),
    ' Alle Angaben stammen aus den aktuellen Händlerdaten – Preis und Verfügbarkeit können sich ändern.',
  ]
    .join('')
    .replace(/\s+/g, ' ')
    .trim()

  const seoBase = `${title} – ${brand}${phrase.noun} im Preisvergleich bei Daily Trends.`
  const seo_description = seoBase.length <= 155 ? seoBase : `${seoBase.slice(0, 152).trimEnd()}…`

  return { description, seo_description }
}
