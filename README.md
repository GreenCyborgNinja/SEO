# IT-Trends - Automated Affiliate Shop

Voll-automatischer, SEO-optimierter Affiliate-Shop mit automatischem Produkt-Sync und KI-gestützter Content-Generierung.

## 🚀 Tech Stack (0 € Budget)

| Komponente | Technologie | Kosten |
|------------|-------------|--------|
| Frontend | Next.js 14 | Free |
| Hosting | Vercel | Free Tier |
| Datenbank | PostgreSQL (Supabase) | Free Tier |
| Scraping | Python | Free |
| Automation | GitHub Actions | Free |
| AI Content | Groq (Llama 3) | Free Tier |
| Ad-Generierung | Puppeteer | Free |

## 📁 Projektstruktur

```
IT-Trends/
├── frontend/           # Next.js App
│   ├── app/           # App Router Pages
│   ├── components/    # React Components
│   └── lib/          # Supabase Client
│
├── backend/           # Python Scripts
│   ├── scraper/      # Produkt-Sync Pipeline
│   └── ad_generator/ # Puppeteer Ad-Creatives
│
└── .github/
    └── workflows/    # GitHub Actions
```

## 🛠️ Setup Anleitung

### 1. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

### 2. Supabase Datenbank

1. Supabase-Projekt erstellen (supabase.com)
2. SQL-Schema ausführen:

```sql
-- Products Tabelle
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(255) UNIQUE,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  seo_description TEXT,
  price DECIMAL(10,2),
  original_price DECIMAL(10,2),
  affiliate_url TEXT NOT NULL,
  image_url TEXT,
  category VARCHAR(100),
  brand VARCHAR(100),
  rating DECIMAL(3,2),
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Categories Tabelle
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed-Daten
INSERT INTO categories (name, slug, description) VALUES
  ('Laptops', 'laptops', 'Die besten Laptops und Notebooks'),
  ('Smartphones', 'smartphones', 'Aktuelle Smartphones und Handys'),
  ('Gaming', 'gaming', 'Gaming-Equipment und Konsolen'),
  ('Zubehör', 'zubehoer', 'Technisches Zubehör');
```

### 3. Umgebungsvariablen

**.env.local (Frontend)**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=https://it-trends.de
```

**.env (Backend)**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
GROQ_API_KEY=your_groq_key
```

### 4. GitHub Actions Secrets

Im GitHub Repository Settings:
- SUPABASE_URL
- SUPABASE_SERVICE_KEY
- GROQ_API_KEY (optional)

## 🔄 Pipeline

1. **GitHub Actions** triggert alle 12 Stunden
2. **Python Script** fetcht Produkte von Affiliate-API
3. **Groq/Llama 3** generiert SEO-Texte
4. **Supabase** speichert/updated Produkte
5. **Puppeteer** generiert Ad-Creatives
6. **Next.js** (ISR) zeigt aktualisierte Produkte

## 📊 SEO Features

- Server-Side Rendering (SSR)
- JSON-LD Structured Data
- Dynamische Meta-Tags
- Sitemap.xml
- Open Graph Tags
- Semantic HTML

## 📝 Lizenz

MIT License - Nutzung auf eigene Verantwortung.