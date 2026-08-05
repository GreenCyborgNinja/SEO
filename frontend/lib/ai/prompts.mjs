/** German prompt for product copy. Hallucinated specs are the main risk, so the
 *  instructions forbid inventing anything that is not in the title. */

export function buildDescriptionPrompt(products) {
  const items = products.map((product) => ({
    asin: product.id,
    titel: product.name,
    marke: product.brand ?? 'unbekannt',
    kategorie: product.category ?? 'unbekannt',
    preis_eur: product.price,
    bewertung: product.rating ?? null,
    anzahl_bewertungen: product.review_count ?? 0,
  }))

  return `Du bist Produkttexter für einen deutschen Technik-Affiliate-Shop.

Schreibe für jedes Produkt unten:
- "description": 2-3 Sätze (maximal 400 Zeichen) sachlicher Fließtext auf Deutsch. Nenne den Produkttyp, die wichtigsten im Titel genannten Eigenschaften und für wen sich das Produkt eignet.
- "seo_description": eine Meta-Description, maximal 155 Zeichen, mit Produkttyp und Marke.

Strenge Regeln:
- Erfinde KEINE technischen Daten. Nutze ausschließlich Informationen aus dem Titel und den Feldern unten.
- Keine Superlative, keine Werbefloskeln ("bahnbrechend", "unglaublich"), keine Preisangaben im Text.
- Keine Garantie-, Liefer- oder Verfügbarkeitsversprechen.
- Duze den Leser.
- Falls der Titel zu wenig hergibt, bleib allgemein statt zu erfinden.

Antworte ausschließlich mit einem JSON-Array dieser Form:
[{"asin":"...","description":"...","seo_description":"..."}]

Produkte:
${JSON.stringify(items, null, 2)}`
}

export function buildSimilarityPrompt(product, candidates) {
  return `Du hilfst einem deutschen Technik-Shop, passende Produktempfehlungen auszuwählen.

Ausgangsprodukt:
${product.name} (Kategorie: ${product.category ?? 'unbekannt'}, Preis: ${product.price} €)

Kandidaten:
${candidates.map((c, i) => `${i + 1}. [${c.id}] ${c.name} (${c.category ?? '?'}, ${c.price} €)`).join('\n')}

Wähle die 4 Kandidaten aus, die ein Käufer des Ausgangsprodukts am ehesten ebenfalls interessant findet (Alternativen oder sinnvolles Zubehör). Begründe jeden in maximal 12 Wörtern auf Deutsch.

Antworte ausschließlich mit JSON:
[{"id":"ASIN","grund":"..."}]`
}
