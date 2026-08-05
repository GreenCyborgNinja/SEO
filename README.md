# Daily Trends

Ein vollautomatisierter **Affiliate-Shop für Technik-Deals**. Das Projekt holt sich Produktdaten von
Amazon, baut daraus einen fertigen Online-Shop mit Nutzerkonten, KI-generierten Produkttexten,
Empfehlungen und einem eigenen Analytics-Dashboard – und läuft dabei komplett auf deinem Rechner,
ohne einen einzigen bezahlten Dienst.

> **Neu hier?** Spring direkt zu [In 3 Minuten starten](#in-3-minuten-starten) und dann zu
> [Was du dir ansehen solltest](#was-du-dir-ansehen-solltest).

---

## Inhalt

- [Was ist ein Affiliate-Shop?](#was-ist-ein-affiliate-shop)
- [In 3 Minuten starten](#in-3-minuten-starten)
- [Was du dir ansehen solltest](#was-du-dir-ansehen-solltest)
- [Wie das Projekt funktioniert](#wie-das-projekt-funktioniert)
- [Eigene Daten holen (Scraper)](#eigene-daten-holen-scraper)
- [KI-Funktionen aktivieren](#ki-funktionen-aktivieren)
- [Konfiguration](#konfiguration)
- [Alle Befehle](#alle-befehle)
- [Häufige Probleme](#häufige-probleme)
- [Projektstruktur](#projektstruktur)
- [Umsetzung der Ausblick-Punkte](#umsetzung-der-ausblick-punkte)
- [Bekannte Grenzen](#bekannte-grenzen)

---

## Was ist ein Affiliate-Shop?

Ein Affiliate-Shop verkauft **nichts selbst**. Er präsentiert Produkte anderer Händler (hier: Amazon)
und verdient eine Provision, wenn jemand über einen Link dorthin klickt und kauft. Es gibt also
keinen Warenkorb, kein Lager, keine Bezahlung – nur Produktdaten, gute Präsentation und
nachvollziehbare Klicks.

Daraus ergeben sich die drei Kernaufgaben, die dieses Projekt löst:

1. **Woher kommen die Produkte?** Ein Python-Scraper holt sie über eine Amazon-API und speichert sie
   in einer Datenbank.
2. **Warum sollte Google die Seite zeigen?** Jede Produktseite ist vorgerendert, hat eine eigene
   Beschreibung, strukturierte Daten und eine saubere URL.
3. **Verdient man damit Geld?** Jeder Klick auf einen Produktlink wird gezählt und mit den
   Werbekosten verrechnet – daraus entsteht der CAC (Kosten pro gewonnenem Kunden).

---

## In 3 Minuten starten

**Voraussetzungen:** Node.js 20 oder neuer. Python brauchst du nur, wenn du selbst scrapen willst.

```bash
cd frontend
npm ci                    # Abhängigkeiten installieren
npm run db:seed           # Datenbank anlegen + 233 Produkte importieren
npm run seed:discounts    # Beispiel-Rabattcodes anlegen
npm run ai:similar        # Produktempfehlungen vorberechnen (~1 Sekunde)
npm run dev               # Entwicklungsserver starten
```

Dann [http://localhost:3000](http://localhost:3000) öffnen. **Das war's** – kein API-Key, keine
Registrierung, keine Konfigurationsdatei nötig.

### Was passiert bei diesen Befehlen?

| Befehl | Was er tut |
|---|---|
| `npm run db:seed` | Legt die SQLite-Datei unter `data/daily-trends.db` an, erzeugt alle Tabellen und importiert die 233 Produkte aus `backend/scraper/latest-products.json` (dem mitgelieferten Datenstand) |
| `npm run seed:discounts` | Vier Beispiel-Rabattcodes, damit der Mitgliederbereich nicht leer ist |
| `npm run ai:similar` | Berechnet für jedes Produkt die 8 ähnlichsten – rein rechnerisch, **ohne KI-Dienst und ohne API-Key** |
| `npm run dev` | Entwicklungsserver mit Hot Reload |

Für den „echten" Betrieb (schneller, alle Seiten vorgerendert) stattdessen:

```bash
npm run build && npm start
```

---

## Was du dir ansehen solltest

Eine kleine Führung durch das, was tatsächlich implementiert ist:

### Ohne Anmeldung

| Seite | Was daran interessant ist |
|---|---|
| **Startseite** | 233 Produkte, Kategorie-Pills mit Produktanzahl. Nur befüllte Kategorien werden angezeigt – keine toten Links |
| **Produktseite** (irgendein Produkt anklicken) | Automatisch erzeugte deutsche Beschreibung, Ähnlichkeits-Empfehlungen unten, Breadcrumb, Merken-Herz |
| **„Zum Shop"-Button** | Führt über `/go/<ASIN>` – dort wird der Klick gezählt, dann geht's zu Amazon. Schau in die Adressleiste: dort hängt der Partner-Tag dran |
| **`/deals`** | Nur Produkte mit Preisnachlass, nach Ersparnis sortiert |
| **Suche oben** | Tippen zeigt ein Dropdown, Enter führt auf `/search` |
| **`/sitemap.xml`** | 251 automatisch generierte URLs |
| **`/robots.txt`** | Sperrt Redirects, API und private Bereiche für Suchmaschinen |
| **Seitenquelltext einer Produktseite** | Suche nach `application/ld+json` – das sind die strukturierten Daten für Google |

### Mit Konto (dauert 30 Sekunden)

Auf `/register` registrieren. Danach:

- **Merkliste**: Herz-Symbol bei Produkten, gesammelt unter `/account`
- **„Für dich empfohlen"** erscheint auf der Startseite, sobald du 1–2 Produkte gemerkt hast
- **Newsletter**: Anmelden im Footer → es gibt keinen echten Mailversand, die Mail landet als
  `.eml`-Datei in `data/mail-outbox/` **und der Bestätigungslink steht in der Server-Konsole**.
  Link kopieren, öffnen, fertig – so lässt sich das Double-Opt-in komplett durchspielen
- **Rabatte**: unter `/account` einen Member-Code aufdecken

### Admin-Dashboard

1. In `frontend/.env.local` (falls nicht vorhanden: `cp .env.example .env.local`) eintragen:
   ```
   ADMIN_EMAIL=deine@adresse.de
   ```
2. Server neu starten
3. Mit **genau dieser Adresse** auf `/register` registrieren

Danach ist `/admin` freigeschaltet (der Link erscheint auch im Nutzermenü oben rechts). Dort siehst
du Seitenaufrufe, Affiliate-Klicks, Klickrate, Neukunden und den CAC. Unter `/admin/spend` kannst du
Werbekosten eintragen – trag mal 50 € ein und beobachte, wie sich der CAC ändert.

> Die Zahlen sind zunächst klein, weil noch kaum jemand geklickt hat. Klick ein paar Produkte an und
> lade das Dashboard neu.

---

## Wie das Projekt funktioniert

```
┌──────────────┐   RapidAPI    ┌────────────────────┐
│ GitHub Action│──────────────▶│ backend/scraper    │
│ (1×/Tag)     │               │ holt Produktdaten  │
└──────────────┘               └─────────┬──────────┘
                                         │ schreibt
                                         ▼
   shared/taxonomy.json ────▶  data/daily-trends.db  ◀──── frontend/scripts/*.mjs
   (Kategorien, Suchplan)         SQLite-Datei          (Import, KI-Texte, Empfehlungen)
                                         │
                        ┌────────────────┴─────────────────┐
                        │ frontend (Next.js)                │
                        │ liest die DB, rendert den Shop    │
                        └───────────────────────────────────┘
                                         │ Export
                                         ▼
                     backend/scraper/latest-products.json  (Datenstand für Git)
```

### Die vier Bausteine

**1. Der Scraper (Python).** Fragt die Amazon-API nach Produkten – welche Suchbegriffe und
Kategorien, steht in `shared/taxonomy.json`. Die Ergebnisse werden bereinigt (HTML-Sonderzeichen,
Preisformate, Bewertungsskalen) und in die Datenbank geschrieben. Läuft er ohne API-Key, beendet er
sich sauber und lässt die Datenbank in Ruhe.

**2. Die Datenbank (SQLite).** Eine einzige Datei, kein Server. Python **und** Next.js greifen
gleichzeitig darauf zu – möglich durch den WAL-Modus von SQLite. Enthält Produkte, Kategorien,
Nutzer, Merklisten, Newsletter, Rabattcodes, Empfehlungen und alle Analytics-Ereignisse.

**3. Das Frontend (Next.js).** Rendert Produkt- und Kategorieseiten vor, damit sie für
Suchmaschinen sofort lesbar und für Besucher schnell sind. Nur die persönlichen Teile
(Nutzermenü, Empfehlungen, Mitglieder-Banner) werden im Browser nachgeladen – so bleibt der Rest
zwischenspeicherbar.

**4. Die Skripte (Node).** Erzeugen Produkttexte und Empfehlungen. Sie laufen **vorher**, nicht
während ein Besucher die Seite aufruft. Deshalb kostet eine Seitenanfrage nie einen KI-Aufruf.

### Warum liegt die JSON-Datei noch im Repo?

Die Datenbank ist bewusst **nicht** in Git (sie ändert sich ständig und ist Binärformat). Damit
trotzdem jeder sofort einen befüllten Shop hat, exportiert `npm run db:export` den Katalog zurück in
`backend/scraper/latest-products.json`. Diese Datei ist der geteilte Datenstand – inklusive der
einmalig erzeugten Produkttexte. Ein frischer Clone braucht daher nur `npm run db:seed`.

---

## Eigene Daten holen (Scraper)

Optional – das Projekt läuft auch mit dem mitgelieferten Datenstand.

Du brauchst einen kostenlosen Key für die
[Real-Time Amazon Data API](https://rapidapi.com/letscrape-6bRBa3QguO5/api/real-time-amazon-data)
(Free Tier: 100 Anfragen pro Tag, ein voller Durchlauf braucht ~37).

```bash
cd backend
cp .env.example .env              # RAPIDAPI_KEY dort eintragen
pip install -r requirements.txt

python scraper/main.py            # holt Produkte in die Datenbank
python scraper/main.py --dry-run  # nur anzeigen, nichts schreiben
```

Danach im Frontend nachziehen:

```bash
cd ../frontend
npm run ai:descriptions   # Texte für die neuen Produkte
npm run ai:similar        # Empfehlungen neu berechnen
npm run db:export         # Datenstand für Git aktualisieren
npm run build             # neue Produkte werden beim Build vorgerendert
```

**Gut zu wissen:** Der Scraper überschreibt vorhandene Produkttexte und Kategorien nie mit leeren
Werten. Einmal erzeugte Beschreibungen überleben jeden weiteren Durchlauf.

---

## KI-Funktionen aktivieren

Beide KI-Funktionen laufen **auch ohne API-Key** – nur eben regelbasiert statt sprachmodellgeneriert.

### Produktbeschreibungen

```bash
npm run ai:descriptions               # alle Produkte ohne Text
npm run ai:descriptions -- --limit=20 # nur die ersten 20
npm run ai:descriptions -- --force    # alles neu erzeugen
```

**Ohne Key** entstehen deterministische deutsche Texte aus Produktname, Marke, Kategorie, Bewertung
und Ersparnis. Das ist der Standard und sieht ordentlich aus.

**Mit Key** (Google Gemini, kostenlos und ohne Kreditkarte über
[AI Studio](https://aistudio.google.com/apikey)):

```bash
# in frontend/.env.local
GEMINI_API_KEY=dein-key
```

Danach schreibt das Skript echte Fließtexte. Es arbeitet in Fünfergruppen, wartet zwischen den
Anfragen und fällt bei einem Fehler pro Produkt auf den regelbasierten Text zurück – ein
abgebrochener Lauf kann also nichts kaputt machen.

Alternativ vollständig offline mit [Ollama](https://ollama.com):

```bash
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

### Empfehlungen

```bash
npm run ai:similar          # rechnerische Ähnlichkeit, kein Key nötig
npm run ai:similar -- --llm # zusätzlich per KI neu sortieren + begründen
```

Die Basis ist ein TF-IDF-Vergleich der Produkttitel plus Aufschläge für gleiche Kategorie, gleiche
Marke und ähnliche Preisklasse. Für 233 Produkte dauert das etwa 40 Millisekunden.

---

## Konfiguration

Datei: `frontend/.env.local` (Vorlage: `frontend/.env.example`).
**Alle Einträge sind optional.** Was passiert, wenn sie fehlen:

| Variable | Fehlt → |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` für Canonicals, Sitemap und E-Mail-Links |
| `DATABASE_PATH` | `data/daily-trends.db` relativ zum Projektordner |
| `AMAZON_PARTNER_TAG` | Links ohne Partner-Tag → keine Provision. Klicks werden trotzdem gezählt |
| `AUTH_SECRET` | Fester Entwicklungsschlüssel. Für alles außer localhost mit `npx auth secret` erzeugen |
| `ADMIN_EMAIL` | Niemand kommt ins Dashboard |
| `GEMINI_API_KEY` | Produkttexte werden regelbasiert erzeugt |
| `AI_PROVIDER` | Automatik: Gemini bei vorhandenem Key, sonst Ollama, sonst Templates |
| `SMTP_HOST` & Co. | E-Mails landen als `.eml` in `data/mail-outbox/`, Links in der Konsole |
| `CONTACT_EMAIL` | Fällt auf `ADMIN_EMAIL` zurück; ohne beides wird die Nachricht nur gespeichert |

Datei: `backend/.env` (Vorlage: `backend/.env.example`)

| Variable | Fehlt → |
|---|---|
| `RAPIDAPI_KEY` | Scraper beendet sich sauber, Datenbank bleibt unverändert |
| `RAPIDAPI_COUNTRY` | `DE` |
| `MAX_API_CALLS` | `80` – schützt das Free-Tier-Limit von 100 Anfragen pro Tag |

---

## Alle Befehle

Alle im Ordner `frontend/` ausführen.

| Befehl | Zweck |
|---|---|
| `npm run dev` | Entwicklungsserver mit Hot Reload |
| `npm run build` | Produktions-Build (rendert alle Produktseiten vor) |
| `npm start` | Produktionsserver (setzt `build` voraus) |
| `npm run db:seed` | Datenbank anlegen und aus dem Datenstand befüllen |
| `npm run db:export` | Datenbank → JSON-Datenstand für Git |
| `npm run db:reset` | Lokale Datenbank löschen (Server vorher stoppen) |
| `npm run db:push` | Schemaänderungen direkt anwenden (nur beim Entwickeln) |
| `npm run db:generate` | Neue SQL-Migration aus dem Schema erzeugen |
| `npm run db:studio` | Datenbank im Browser ansehen |
| `npm run seed:discounts` | Beispiel-Rabattcodes anlegen |
| `npm run ai:descriptions` | Produkttexte erzeugen |
| `npm run ai:similar` | Empfehlungen berechnen |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript prüfen |

Datenbank direkt ansehen geht am bequemsten mit `npm run db:studio`.

---

## Häufige Probleme

**`SQLITE_BUSY` oder „database is locked"**
Der Entwicklungsserver hält die Datenbank offen. Server stoppen, Befehl wiederholen.

**`npm run db:reset` schlägt fehl**
Gleiche Ursache – die Datei ist noch in Benutzung. Server stoppen.

**Die Startseite ist leer**
Die Datenbank ist leer. `npm run db:seed` ausführen. Der Build bricht in diesem Fall bewusst mit
einer Fehlermeldung ab, statt einen leeren Shop zu veröffentlichen.

**Die Newsletter-Mail kommt nicht an**
Das ist so gewollt: ohne SMTP-Zugangsdaten wird nichts verschickt. Die Mail liegt in
`data/mail-outbox/`, der Bestätigungslink steht zusätzlich in der Server-Konsole.

**`/admin` leitet mich weiter**
Entweder ist `ADMIN_EMAIL` nicht gesetzt, oder du bist mit einer anderen Adresse angemeldet. Nach
dem Ändern der `.env.local` den Server neu starten.

**Ein neu gescraptes Produkt ist nicht sichtbar**
Produktseiten werden beim Build vorgerendert. `npm run build` ausführen.

**Port 3000 ist belegt**
`npm run dev -- -p 3001` oder den alten Prozess beenden.

**Das Projekt liegt in OneDrive/Dropbox**
SQLite verträgt sich schlecht mit Synchronisationsordnern. In `.env.local` `DATABASE_PATH` auf einen
lokalen Pfad außerhalb setzen.

---

## Projektstruktur

```
frontend/
  app/                 Seiten und Endpunkte (Next.js App Router)
    admin/             Dashboard und Werbekosten (nur für Admins)
    account/           Konto: Profil, Merkliste, Newsletter, Rabatte
    go/[id]/           Affiliate-Weiterleitung mit Klickzählung
    api/               Tracking, Suche, Favoriten, Newsletter, Auth
  components/          UI-Bausteine, inkl. charts/ (Diagramme als reines SVG)
  lib/
    db/                Datenbankschema und Abfragen
    ai/                KI-Anbindung mit Fallback
    recommend/         Ähnlichkeitsberechnung
    affiliate.ts       Partner-Tag und Klick-Zuordnung
  scripts/             Import, Export, Produkttexte, Empfehlungen
backend/
  scraper/             Amazon-Abruf und Datenbank-Schreibzugriff
  ad_generator/        Werbebanner als PNG (Pillow), 5 Formate
shared/
  taxonomy.json        Kategorien und Suchplan – von beiden Seiten gelesen
  curated-ads.json     Produktauswahl für die Werbeflächen
data/                  Datenbank und Mail-Ausgang (nicht in Git)
```

### Tech Stack

| Bereich | Technologie | Kosten |
|---|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS | kostenlos |
| Datenbank | SQLite + Drizzle ORM | kostenlos, kein Server |
| Anmeldung | Auth.js v5 mit E-Mail und Passwort | kostenlos |
| Scraper | Python 3.12, httpx, RapidAPI | Free Tier: 100 Anfragen/Tag |
| KI-Texte | Google Gemini (AI Studio) | Free Tier, ohne Kreditkarte |
| Empfehlungen | TF-IDF in reinem JavaScript | kostenlos, kein Key |
| Analytics | Eigene Tabelle + SVG-Diagramme | kostenlos |
| E-Mail | nodemailer, lokal als Datei | kostenlos |
| Werbebanner | Python + Pillow | kostenlos |
| Automatisierung | GitHub Actions, 1×/Tag | kostenlos |

---

## Umsetzung der Ausblick-Punkte

Die Projektpräsentation listete sieben offene Punkte für einen produktionsfertigen Shop:

| Punkt | Umsetzung | Dateien |
|---|---|---|
| **API mit Affiliate-Funktionalität** | Partner-Tag an jedem Link, Platzierungs-Kennung (`ascsubtag`) für die Auswertung in PartnerNet, interne Weiterleitung `/go/[id]` zählt den Klick | `lib/affiliate.ts`, `app/go/[id]/route.ts` |
| **Datenbank statt statischer JSON** | SQLite mit 15 Tabellen; die JSON ist jetzt nur noch geteilter Datenstand | `lib/db/schema.ts`, `backend/scraper/db.py` |
| **Hosting auf öffentlicher Domain** | Bewusst lokal, dazu vollständiges technisches SEO (Canonicals, robots.txt, Sitemap aus der Datenbank) | `lib/site.ts`, `app/robots.ts`, `app/sitemap.ts` |
| **Google Analytics → CAC** | Eigenes Tracking ohne externe Dienste, Dashboard mit **CAC = Σ Werbekosten ÷ Neukunden** | `lib/db/analytics.ts`, `app/admin/` |
| **KI für Produktbeschreibungen** | Gemini Free Tier, austauschbar gegen Ollama, mit regelbasiertem Fallback | `lib/ai/`, `scripts/ai-descriptions.mjs` |
| **KI für Empfehlungen** | Vorberechnete Ähnlichkeit, „Kunden sahen auch an" aus echtem Verhalten, persönliche Empfehlungen | `lib/recommend/`, `lib/db/recommendations.ts` |
| **Registrierung / User Management** | Konten, Merkliste, Newsletter mit Double-Opt-in, Mitglieder-Rabatte | `lib/auth.ts`, `app/account/` |

---

## Bekannte Grenzen

Ehrlichkeit statt Marketing – das sind die realen Einschränkungen:

- **Neue Produkte erscheinen erst nach `npm run build`.** Alle Produktseiten sind vorgerendert. Das
  ist ein bewusster Tausch: unbekannte URLs liefern dadurch einen echten HTTP-404 statt einer
  „Nicht gefunden"-Seite mit Status 200, was Google sonst indexieren würde.
- **Rabattcodes sind Amazon-Gutscheine, kein eigener Checkout.** Als Affiliate-Shop können wir
  Preise nicht selbst reduzieren. Die Codes werden bei Amazon eingelöst – die Account-Seite sagt das
  auch so.
- **Die Klickrate kann über 100 % liegen.** Klicks zählt der Server, Seitenaufrufe zählt ein
  JavaScript-Signal im Browser. Besucher ohne JavaScript klicken also, ohne einen Aufruf zu erzeugen.
  Das Dashboard weist darauf hin, wenn es passiert.
- **Kein Cookie-Banner.** Es werden nur eigene Cookies gesetzt und keine Daten an Dritte
  übermittelt. Das ist keine Rechtsberatung.
- **Die Produktdaten sind nur so frisch wie der letzte Scraper-Lauf.** Preise bei Amazon ändern sich
  laufend; deshalb steht auf jeder Produktseite ein entsprechender Hinweis.
- **Kategorien werden per Schlagwort zugeordnet.** Das funktioniert für den Großteil des Katalogs
  gut, aber Amazon-Titel sind Stichwort-Suppe – einzelne Ausreißer sind normal.
