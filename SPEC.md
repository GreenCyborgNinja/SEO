# Daily Trends – Technische Spezifikation

Stand: Juli 2026. Beschreibt den umgesetzten Zustand, nicht den ursprünglichen Entwurf.

## 1. Überblick

Automatisierter Affiliate-Shop für Technik-Produkte. Produktdaten werden per Scraper aus der
RapidAPI „Real-Time Amazon Data" in eine lokale SQLite-Datenbank geschrieben; Next.js rendert daraus
einen SEO-optimierten Shop mit Nutzerkonten, KI-generierten Produkttexten, Empfehlungen und einem
eigenen Analytics-Dashboard zur CAC-Berechnung.

Leitprinzip: **Betrieb ohne laufende Kosten und ohne Pflicht-Konfiguration.** Jede Komponente hat
einen kostenlosen Pfad und einen funktionierenden Fallback ohne API-Key.

## 2. Tech Stack

| Bereich | Technologie | Kosten |
|---|---|---|
| Frontend | Next.js 16 (App Router, ISR), React 19, Tailwind CSS 3 | kostenlos |
| Datenbank | SQLite (`better-sqlite3`) + Drizzle ORM | kostenlos, serverlos |
| Auth | Auth.js v5 (Credentials, JWT-Session), bcryptjs | kostenlos |
| Scraper | Python 3.12, httpx | kostenlos |
| Produkt-API | RapidAPI Real-Time Amazon Data | Free Tier: 100 Req./Tag |
| KI-Texte | Google Gemini `gemini-2.5-flash`, alternativ Ollama, sonst Templates | Free Tier |
| Empfehlungen | TF-IDF in reinem JavaScript (kein Modell, kein Key) | kostenlos |
| Analytics | Eigene `events`-Tabelle, Inline-SVG-Charts | kostenlos |
| Mail | nodemailer (Datei-Transport lokal, optional SMTP) | kostenlos |
| Werbemittel | Python + Pillow | kostenlos |
| Automatisierung | GitHub Actions (1×/Tag) | kostenlos |

## 3. Datenmodell (SQLite)

15 Tabellen, definiert in `frontend/lib/db/schema.ts`, Migrationen in `frontend/drizzle/`.

### Katalog
- **`categories`** — `slug` (PK), `name`, `description`, `sort_order`. Gespeist aus
  `shared/taxonomy.json`.
- **`products`** — `id` (PK, = ASIN), `external_id` (unique), `name`, `description`,
  `seo_description`, `description_source` (`ai` | `template` | NULL), `price`, `original_price`,
  `affiliate_url`, `image_url`, `category` (FK), `brand`, `rating`, `review_count`, `created_at`,
  `updated_at`. Indizes auf `category`, `price`, `original_price`.
- **`product_similarity`** — `(product_id, related_id)` (PK), `score`, `reason`, `source`
  (`content` | `llm`). Vorberechnete Empfehlungen.

### Nutzer (Auth.js-Adapter-Schema + eigene Felder)
- **`users`** — `id` (PK), `name`, `email` (unique), `emailVerified`, `image`, `password_hash`,
  `role` (`user` | `admin`), `newsletter_opt_in`, `created_at`.
- **`accounts`**, **`sessions`**, **`verificationToken`** — vom Drizzle-Adapter benötigt.
- **`favourites`** — `(user_id, product_id)` (PK), `created_at`.

### Shop-Funktionen
- **`newsletter_subscribers`** — `id`, `email` (unique), `status` (`pending` | `confirmed` |
  `unsubscribed`), `token`, `user_id`, `created_at`, `confirmed_at`, `unsubscribed_at`.
- **`discount_codes`** — `id`, `code` (unique), `title`, `description`, `value_label`, `audience`
  (`member` | `public`), `valid_until`, `active`.
- **`discount_redemptions`** — `(user_id, code_id)` (PK), `revealed_at`.
- **`contact_messages`** — `id`, `name`, `email`, `subject`, `message`, `created_at`.

### Analytics
- **`events`** — `id`, `type` (`pageview` | `click` | `search`), `product_id`, `category`, `path`,
  `src` (Platzierung), `session_id`, `user_id`, `created_at`. Indizes auf `(type, created_at)`,
  `product_id`, `(session_id, created_at)`.
- **`ad_spend`** — `id`, `day`, `channel`, `amount_eur`, `note`. Zähler der CAC-Formel.
- **`sync_runs`** — Protokoll jedes Scraper-Laufs: `products_upserted`, `api_calls`,
  `rate_limit_remaining`, `status`, `error`.

### Nebenläufigkeit
Beide Prozesse öffnen dieselbe Datei mit `journal_mode=WAL`, `busy_timeout=5000`,
`foreign_keys=ON`. Python hält Transaktionen kurz (ein `executemany`-Upsert pro Lauf). Der Scraper
überschreibt `description`, `seo_description` und eine vorhandene `category` **nie** mit leeren
Werten – KI-Texte überleben jeden Re-Scrape.

## 4. Routen

| Route | Rendering | Zweck |
|---|---|---|
| `/` | ISR (600 s) | Katalog, Kategorie-Filter, personalisierte Rail |
| `/deals` | ISR (600 s) | Produkte mit Preisnachlass, nach Ersparnis sortiert |
| `/category/[slug]` | SSG + ISR, `dynamicParams=false` | Kategorieseite; unbekannte Slugs → 404 |
| `/product/[id]` | SSG + ISR (86400 s), `dynamicParams=false` | Detailseite, JSON-LD, Empfehlungen |
| `/search` | dynamisch, `noindex` | Volltextsuche |
| `/login`, `/register` | statisch, `noindex` | Auth-Formulare |
| `/account` | dynamisch, geschützt | Profil, Merkliste, Newsletter, Rabatte |
| `/admin`, `/admin/spend` | dynamisch, Rolle `admin` | Analytics + Werbekosten |
| `/newsletter/confirm`, `/unsubscribe` | dynamisch | Double-Opt-in |
| `/go/[id]` | dynamisch | Klick zählen → 302 auf getaggte Amazon-URL |
| `/api/*` | dynamisch | Tracking, Suche, Favoriten, Newsletter, Rabatte, Admin, Auth |

**Warum kein `force-static` mehr:** Es friert DB-Lesevorgänge auf die Build-Zeit ein und verbietet
`cookies()`/`headers()`, die Auth, `/go` und Tracking brauchen. Stattdessen ISR für Inhalte, während
nutzerspezifische Teile (Session-Menü, Member-Banner, persönliche Empfehlungen) Client-Komponenten
sind – so bleibt das Layout cachebar.

## 5. SEO

- `metadataBase` + `alternates.canonical` auf allen Inhaltsseiten.
- JSON-LD: `Product` (mit `offers.url` auf die **getaggte Amazon-URL**, nicht den Redirect) und
  `BreadcrumbList` auf Detailseiten.
- `app/sitemap.ts`: statische Seiten, befüllte Kategorien, alle Produkte (`lastModified` aus
  `updated_at`).
- `app/robots.ts`: sperrt `/go/`, `/api/`, `/admin`, `/account`, `/login`, `/register`,
  `/newsletter/`.
- Unbekannte Produkt-/Kategorie-URLs liefern echtes HTTP 404 (kein Soft-404).
- Alle Affiliate-Links tragen `rel="nofollow sponsored noopener"`.
- HTML-Entities werden beim Import dekodiert (`15,6"` statt `15,6&quot;`).

## 6. Affiliate-Kette

1. UI verlinkt auf `/go/<ASIN>?src=<placement>`.
2. Der Route-Handler lädt das Produkt, schreibt ein `click`-Event (Session, Platzierung, ggf.
   Nutzer) und antwortet mit 302.
3. Ziel ist `amazon.de/dp/<ASIN>?tag=<AMAZON_PARTNER_TAG>&linkCode=ogi&ascsubtag=dt-<placement>-<YYYYMMDD>`.
4. `ascsubtag` erscheint in den PartnerNet-Berichten → Zuordnung von Umsatz zu Platzierung.

Platzierungen: `card`, `detail`, `rail`, `search`, `ad-skyscraper`, `ad-wide-skyscraper`,
`ad-leaderboard`, `ad-rectangle`, `ad-square`.

## 7. CAC-Berechnung

```
CAC = Σ Werbekosten (ad_spend im Zeitraum) ÷ Neukunden (users.created_at im Zeitraum)
```

Ohne Neukunden ist der Wert nicht definiert und wird als `n/a` ausgewiesen – nicht als 0 €.
Zeiträume: 7 / 30 / 90 Tage. Weitere Kennzahlen: Seitenaufrufe, Sitzungen, Affiliate-Klicks, CTR,
Klicks je Neukunde, Klicks nach Produkt/Kategorie/Platzierung, Werbekosten nach Kanal.

## 8. KI-Pipeline

**Produkttexte** (`npm run ai:descriptions`): Auswahl nur der Produkte ohne Text, 5 ASINs pro
Request, JSON-Antwortformat, Backoff bei 429/5xx, sofortiges Schreiben pro Batch (resumierbar).
Validierung von Form und Länge; pro Produkt Fallback auf ein deterministisches deutsches Template.
Der Prompt verbietet erfundene technische Daten.

**Empfehlungen** (`npm run ai:similar`): TF-IDF über deutsch-normalisierte Titel-Tokens
(Umlaut-Folding, Stopwords, Filter für Modellnummern) + Cosinus-Ähnlichkeit, plus Boni für gleiche
Kategorie (+0,25), gleiche Marke (+0,1), Preisband ±30 % (bis +0,15) und ähnliche Bewertung (+0,05).
Top 8 pro Produkt. Optionales `--llm` lässt die Top-Kandidaten neu sortieren und speichert eine
Begründung. 233 Produkte ≈ 35 ms.

Beide Skripte laufen offline und schreiben in die Datenbank – zur Request-Zeit wird nie ein
KI-Dienst aufgerufen.

## 9. Kategorie-Taxonomie

`shared/taxonomy.json` ist die einzige Quelle: gelesen von TypeScript
(`frontend/lib/catalog/normalize.mjs`) **und** Python (`backend/scraper/taxonomy.py`). Enthält pro
Kategorie Slug, Name, Beschreibung, Keywords, Suchbegriffe (mit Seitenzahl) und die
Amazon-Bestseller-Kategorie.

**Zuordnung per Scoring:** Ein Keyword-Treffer in den ersten 45 Zeichen des Titels zählt 3, ein
späterer 1; höchste Summe gewinnt, bei Gleichstand entscheidet die Reihenfolge. Keywords müssen an
einer Wortgrenze enden (optionale deutsche Pluralendung), dürfen aber Präfixe haben – so trifft
„Ladekabel" auf `kabel`, „kabellos" hingegen nicht.

Vorher existierte diese Liste sechsfach in unterschiedlichen Varianten; 20 von 25 Kategorie-Links
führten auf leere Seiten.

## 10. Fallback-Verhalten

| Fehlt | Verhalten |
|---|---|
| `RAPIDAPI_KEY` | Scraper beendet sich mit Exit 0, DB unverändert |
| RapidAPI-Quota erschöpft | Lauf bricht nach dem ersten 429 mit `remaining=0` ab, bereits geholte Produkte werden gespeichert |
| `GEMINI_API_KEY` | Deterministische Template-Texte |
| `SMTP_HOST` | `.eml`-Dateien in `data/mail-outbox/`, Links in der Konsole |
| `AMAZON_PARTNER_TAG` | Links ohne Tag, Klicks werden weiter gezählt |
| `AUTH_SECRET` | Fester Entwicklungsschlüssel (mit Warnung in Produktion) |
| Leere `product_similarity` | „Ähnliche Produkte" fällt auf Kategorie + Bewertung zurück |
| Leere `events` | „Kunden sahen auch an" wird ausgeblendet |
