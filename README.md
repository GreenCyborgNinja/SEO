# Daily Trends — Automated Affiliate Shop

SEO-optimized affiliate product shop with automated product syncing and dynamic advertisement banners.

> Built entirely on free tiers (Next.js, GitHub Actions, Pillow).

---

## Features

- **Automated product scraping** — Fetches Amazon products via RapidAPI every 12 hours
- **Static site generation** — ISR with daily revalidation for optimal SEO
- **Category system** — Products auto-categorized by keyword matching
- **Search functionality** — Client-side product search
- **Sorting** — Sort by price, savings, rating
- **Sidebar ads** — Curated product banners on left/right/bottom
- **Ad image generation** — Python Pillow generates social media ad creatives (5 sizes)
- **JSON-LD structured data** — Rich snippets for search engines
- **Dynamic sitemap** — Auto-generated `sitemap.xml`
- **German language** — Full German UI and content

---

## Tech Stack

| Component | Technology | Cost |
|-----------|------------|------|
| Frontend | Next.js 16 | Free |
| Hosting | Vercel / Cloudflare Pages | Free Tier |
| Product API | RapidAPI (Real-Time Amazon Data) | Free Tier (100 req/day) |
| Scraping / Ad Gen | Python 3.12 + Pillow | Free |
| Automation | GitHub Actions | Free (2000 min/month) |
| Ad Images | Pillow (no browser needed) | Free |

---

## Architecture / Data Flow

```
RapidAPI (Amazon)
    ↓  (every 12 hours via GitHub Actions)
Python Scraper (backend/scraper/)
    ↓  (fetches products + descriptions + images directly)
local JSON (latest-products.json)
    ↓  (prebuild step)
generate-mock-products.mjs
    ↓
mock-products.json  →  Next.js (SSG)
    ↓
Website with sidebar ads (CSS-rendered)
```

---

## Prerequisites

- **Node.js** 18+ and **npm**
- **Python** 3.11+ (for scraper + ad generator — only needed for local runs or GitHub Actions)
- A **GitHub account** (for Actions + free hosting)
- **RapidAPI key** for [Real-Time Amazon Data API](https://rapidapi.com/letscrape-6bRBa3QguO5/api/real-time-amazon-data)



---

## Getting Started

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
```

The site runs at `http://localhost:3000`. It works immediately with mock data — no external services required.

### 2. Backend (Scraper — optional for local testing)

```bash
cd backend
pip install -r requirements.txt
pip install -r ad_generator/requirements.txt
```

Run the scraper locally:

```bash
cd backend/scraper
python main.py
```

Generate ad images locally:

```bash
cd backend/ad_generator
python generate_images.py
```

---

## Environment Variables

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | No | Your production URL (e.g. `https://it-trends.de`) |
| `NEXT_PUBLIC_RAPIDAPI_KEY` | No | RapidAPI key (for live API calls from frontend) |
| `RAPIDAPI_KEY` | No | RapidAPI key (alternative env name) |

The frontend works **without any env vars** — it uses bundled mock data by default.

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `RAPIDAPI_KEY` | **Yes** | Your RapidAPI key for Amazon Data API |
| `RAPIDAPI_COUNTRY` | No | Amazon marketplace (`DE` by default) |

### GitHub Secrets (for Actions)

Set these in `Settings → Secrets and variables → Actions`:

| Secret | Required | Description |
|--------|----------|-------------|
| `RAPIDAPI_KEY` | **Yes** | RapidAPI key |
| `RAPIDAPI_COUNTRY` | No | Set as **Variable** (not secret), value: `DE` |

---

## Product Data

Products are stored as JSON files in `backend/scraper/`. The scraper outputs:
- `latest-products.json` — latest snapshot (consumed by the frontend build)
- `products_YYYYMMDD_HHMMSS.json` — timestamped backups

---

## GitHub Actions Workflows

### `scrape.yml` — Product Scraper
- Runs every 12 hours (manually triggerable)
- Fetches products from RapidAPI (searches + best sellers + deals)
- Stores in Supabase or local JSON
- Requires: `RAPIDAPI_KEY`

### `sync.yml` — Full Sync Pipeline
- Runs every 12 hours
- Scrapes products → Generates ad images → Uploads as artifacts
- Requires: `RAPIDAPI_KEY`
- Uses **Pillow** for fast, dependency-free ad generation

---

## Curated Ad Pool

15 hand-picked products used for sidebar banners and ad image generation. Products were selected for attractive discounts, high ratings, and popular brands.

Defined in:
- `backend/ad_generator/curated-ads.json` — for image generation
- `frontend/lib/ads.ts` — for website rendering

**Ad sizes generated:**
| Format | Size | Usage |
|--------|------|-------|
| Skyscraper Left | 200×700 | Website left sidebar |
| Wide Skyscraper | 350×700 | Website right sidebar |
| Leaderboard | 728×100 | Website bottom banner |
| Medium Rectangle | 350×280 | In-content ads |
| Square | 1080×1080 | Social media / Meta Ads |

---

## Project Structure

```
SEO/
├── .github/workflows/
│   ├── scrape.yml               # Scraper workflow
│   └── sync.yml                 # Full sync + ad generation
│
├── backend/
│   ├── .env                     # Backend environment variables
│   ├── requirements.txt         # Python dependencies (scraper)
│   ├── scraper/
│   │   ├── main.py              # Entry point
│   │   ├── fetcher.py           # Product fetch orchestration
│   │   ├── rapidapi_client.py   # RapidAPI HTTP client
│   │   ├── database.py          # JSON file storage
│   │   └── latest-products.json # Latest scraped output
│   └── ad_generator/
│       ├── requirements.txt     # Pillow dependency
│       ├── curated-ads.json     # Hand-picked product pool
│       ├── generate_images.py   # Pillow-based ad image generator
│       └── output/              # Generated ad images
│
├── frontend/
│   ├── .env.local               # Frontend environment variables
│   ├── package.json             # Next.js 16 + React 18
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── app/
│   │   ├── layout.tsx           # Root layout (header, footer, ads)
│   │   ├── page.tsx             # Home page (all products)
│   │   ├── globals.css          # Global styles + Tailwind
│   │   ├── sitemap.ts           # Dynamic XML sitemap
│   │   ├── deals/page.tsx       # Deals page
│   │   ├── category/[slug]/page.tsx
│   │   ├── product/[id]/page.tsx
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── impressum/page.tsx
│   │   ├── privacy/page.tsx
│   │   └── api/
│   │       ├── products/route.ts
│   │       └── search/route.ts
│   ├── components/
│   │   ├── Header.tsx           # Navigation + search
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx      # Product grid card
│   │   ├── CategoryFilter.tsx   # Category buttons
│   │   ├── SearchBar.tsx        # Client-side search
│   │   ├── AdBanner.tsx         # Reusable ad banner
│   │   ├── SidebarAds.tsx       # Left/right/bottom ad containers
│   │   └── SortableProductGrid.tsx  # Sortable product grid
│   └── lib/
│       ├── supabase.ts          # Product types + mock data layer
│       ├── ads.ts               # Curated ad product pool
│       ├── utils.ts             # formatPrice, calculateSavings, etc.
│       └── mock-products.json   # Auto-generated from scraper output
│
├── README.md
└── SPEC.md
```

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import at [vercel.com](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Build command: `npm run build`
5. Output: `.next`
6. Add environment variables (optional — mock data works without them)
7. Deploy

The prebuild script (`node scripts/generate-mock-products.mjs`) runs automatically during build and transforms the latest scraper output into the frontend mock data file. If no scraper output exists, it falls back to hardcoded sample products.

### WIP: Without Scraper (Standalone Frontend)

The frontend includes ~233 pre-scraped products as mock data. To refresh:

1. Run the scraper locally or in GitHub Actions
2. Commit the updated `latest-products.json`
3. Rebuild — the prebuild script picks it up automatically

---

## Local Development Tips

| Command | Description |
|---------|-------------|
| `cd frontend && npm run dev` | Start dev server with hot reload |
| `cd frontend && npm run build` | Production build |
| `cd backend && python scraper/main.py` | Run scraper locally |
| `cd backend && python ad_generator/generate_images.py` | Generate ad images |
| `cd frontend && node scripts/generate-mock-products.mjs` | Rebuild mock data from scraper output |

---

## Specifications

Detailed UI/UX specifications, database schema, and acceptance criteria are documented in [`SPEC.md`](./SPEC.md).

---

## License

MIT
