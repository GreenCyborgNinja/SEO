# Daily Trends - Automated Affiliate Shop

SEO-optimized affiliate product shop with automated product syncing and AI-generated content.

## Tech Stack (Zero Cost)

| Component | Technology | Cost |
|-----------|------------|------|
| Frontend | Next.js 14 | Free |
| Hosting | Vercel / Cloudflare Pages | Free Tier |
| Database | PostgreSQL (Supabase) | Free Tier |
| Scraping | Python | Free |
| Automation | GitHub Actions | Free |
| AI Content | Groq (Llama 3) | Free Tier |

## Quick Start

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend (Python scraper)
cd backend
pip install -r requirements.txt
```

## Environment Setup

Create `.env.local` in `/frontend`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Create `.env` in `/backend`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
GROQ_API_KEY=your_groq_key
```

## Database Setup

Run this SQL in Supabase SQL Editor:

```sql
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

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy

### Cloudflare Pages
1. Connect GitHub repository
2. Build command: `npm run build`
3. Output directory: `.next`

## Project Structure

```
SEO/
├── frontend/           # Next.js app
│   ├── app/           # Pages
│   ├── components/    # React components
│   └── lib/           # Utilities
├── backend/           # Python scripts
│   ├── scraper/      # Product sync
│   └── ad_generator/ # Ad creatives
└── .github/workflows/ # CI/CD
```

## Features

- Server-side rendering for SEO
- Incremental Static Regeneration (ISR)
- JSON-LD structured data
- Sitemap generation
- Category filtering
- Search functionality
- Mobile responsive

## License

MIT