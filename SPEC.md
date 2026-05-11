# Daily Trends Affiliate Shop - Specification

## 1. Project Overview

**Project Name:** Daily Trends - Automated Affiliate Product Shop
**Project Type:** SEO-optimized affiliate website with automated product syncing
**Core Functionality:** An automatically generated online shop that displays IT/tech products with affiliate links, regularly syncs products from external sources, and generates AI-optimized SEO content
**Target Users:** Tech-savvy online shoppers looking for IT products and deals

---

## 2. Tech Stack

| Component | Technology | Cost |
|-----------|------------|------|
| Frontend | Next.js 14 (App Router) | Free |
| Hosting | Vercel | Free Tier |
| Database | PostgreSQL (Supabase) | Free Tier |
| Backend/Scraping | Python | Free |
| Automation | GitHub Actions | Free |
| AI Content | Groq (Llama 3) | Free Tier |
| Image Generation | Puppeteer/HTML-to-Image | Free |

---

## 3. UI/UX Specification

### Layout Structure

**Header**
- Logo: "Daily Trends" with tech-inspired icon
- Navigation: Categories, Deals, About
- Search bar with autocomplete

**Hero Section**
- Featured deal of the day
- Rotating banner with current promotions

**Product Grid**
- 4 columns desktop, 2 tablet, 1 mobile
- Product cards with hover effects

**Product Card Components**
- Product image (lazy loaded)
- Product name
- Original price (strikethrough)
- Current/Affiliate price
- Savings percentage badge
- "Zum Shop" CTA button
- Rating stars

**Footer**
- Affiliate disclosure
- Navigation links
- Newsletter signup

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Visual Design

**Color Palette**
- Primary: `#0F172A` (Dark navy)
- Secondary: `#1E293B` (Slate)
- Accent: `#F97316` (Orange - for CTAs and deals)
- Success: `#22C55E` (Green - for savings)
- Background: `#F8FAFC` (Light gray)
- Text Primary: `#1E293B`
- Text Secondary: `#64748B`

**Typography**
- Headings: "Inter", bold
- Body: "Inter", regular
- Prices: "JetBrains Mono" (monospace)

**Spacing System**
- Base unit: 4px
- Section padding: 64px vertical
- Card padding: 16px
- Grid gap: 24px

**Visual Effects**
- Card shadow: `0 4px 6px -1px rgba(0,0,0,0.1)`
- Card hover: translateY(-4px) with shadow increase
- Button hover: brightness(1.1)
- Page load: staggered fade-in animation

### Components

1. **ProductCard** - Individual product display
2. **CategoryFilter** - Filter by product categories
3. **PriceRangeSlider** - Filter by price
4. **SearchBar** - Product search with suggestions
5. **DealBadge** - Animated discount badge
6. **SEOContentBlock** - AI-generated product descriptions
7. **AffiliateDisclaimer** - Legal disclosure

---

## 4. Database Schema (Supabase/PostgreSQL)

```sql
-- Products table
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

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Settings table (for scraping config)
CREATE TABLE settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 5. Functionality Specification

### Core Features

**1. Product Display**
- Fetch products from Supabase on build/runtime
- Server-side rendering for SEO
- Dynamic metadata generation
- Structured data (JSON-LD) for products

**2. Category System**
- Dynamic category pages (/category/[slug])
- Category-specific meta descriptions
- Filter products by category

**3. Search Functionality**
- Full-text search on product names/descriptions
- Debounced search input
- Search results page with filters

**4. SEO Optimization**
- Automatic meta tags per page
- Sitemap.xml generation
- robots.txt
- Canonical URLs
- Open Graph tags
- JSON-LD structured data

**5. Product Sync Pipeline (Python)**
- Source: Simulated affiliate API (configurable)
- Fetch new products
- Compare with existing (upsert)
- Generate SEO descriptions via Groq
- Update database

**6. Ad Creative Generation**
- HTML template for product ads
- Puppeteer screenshot capture
- Output: 1080x1080 images for Meta/Google Ads

### User Interactions
- Click product → redirect to affiliate URL (tracked)
- Filter products by category/price
- Search products
- Newsletter signup (future)

### Data Handling
- Static generation for category pages
- ISR (Incremental Static Regeneration) for product pages
- API routes for dynamic filtering

---

## 6. File Structure

```
Daily Trends/
├── frontend/                 # Next.js app
│   ├── app/
│   │   ├── page.tsx          # Home page
│   │   ├── layout.tsx        # Root layout
│   │   ├── category/
│   │   │   └── [slug]/
│   │   │       └── page.tsx  # Category page
│   │   ├── product/
│   │   │   └── [id]/
│   │   │       └── page.tsx  # Product detail
│   │   ├── api/
│   │   │   ├── products/     # Products API
│   │   │   └── search/       # Search API
│   │   └── sitemap.ts        # Sitemap
│   ├── components/
│   │   ├── ProductCard.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── CategoryFilter.tsx
│   │   └── SearchBar.tsx
│   ├── lib/
│   │   ├── supabase.ts       # Supabase client
│   │   └── utils.ts
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                  # Python scraping scripts
│   ├── scraper/
│   │   ├── main.py           # Entry point
│   │   ├── fetcher.py        # Product fetching
│   │   ├── seo_generator.py  # AI SEO content
│   │   └── database.py      # DB operations
│   ├── ad_generator/
│   │   ├── template.html     # Ad template
│   │   └── generate.py      # Puppeteer generation
│   └── requirements.txt
│
├── .github/
│   └── workflows/
│       └── sync.yml          # GitHub Actions workflow
│
└── README.md
```

---

## 7. Acceptance Criteria

### Visual Checkpoints
- [ ] Header displays logo, nav, and search
- [ ] Product cards show image, name, prices, badge
- [ ] Category pages filter correctly
- [ ] Responsive layout works on all breakpoints
- [ ] Animations are smooth and not jarring

### Functional Checkpoints
- [ ] Products load from Supabase
- [ ] Category routing works (/category/laptops)
- [ ] Product detail pages render with SEO meta
- [ ] Search returns relevant results
- [ ] Sitemap.xml generates correctly
- [ ] Python sync script runs without errors

### SEO Checkpoints
- [ ] Each page has unique meta title/description
- [ ] JSON-LD structured data present
- [ ] Open Graph tags on all pages
- [ ] Semantic HTML structure (header, main, footer)
- [ ] Images have alt text

---

## 8. Implementation Priority

1. **Phase 1:** Next.js frontend setup + Supabase connection
2. **Phase 2:** Product display components + pages
3. **Phase 3:** Category system + filtering
4. **Phase 4:** SEO optimization (meta, sitemap, structured data)
5. **Phase 5:** Python scraping pipeline
6. **Phase 6:** Ad creative generation script