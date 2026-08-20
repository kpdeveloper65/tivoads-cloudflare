# TivoAds v2.0 — Premium Ad Discovery & Research Platform

A complete re-development of [TivoAds.com](https://tivoads.com/) as a modern, production-ready full-stack application. This is a searchable archive and discovery library for TV/video advertisements.

---

## 🎯 Project Goal

Transform TivoAds from an outdated directory script into a **premium, modern ad discovery and research platform** — a polished media library and video intelligence tool for marketers, agencies, creative strategists, and researchers.

---

## ✅ Completed Features

### 🏠 Homepage
- Hero section with large, intelligent search bar
- Search suggestions / autocomplete dropdown
- Popular search tags
- Featured ads grid
- Trending ads section with rank numbers
- Categories browse grid (20 categories)
- Popular brands browser
- YouTube Discovery explanation section
- "Who is TivoAds for?" section (6 user types)
- CTA sections with account creation prompts
- SEO-friendly intro text block
- Stats bar (total ads, brands, categories)

### 🔍 Search System
- Full-text search across title, brand, category, slogan, campaign, description, tags
- Real-time search suggestions/autocomplete API (`/api/search/suggestions`)
- Sticky search bar on results page
- Sidebar filters: category, source, duration, sort
- Sort options: relevance, newest, oldest, views, favorites, trending
- Pagination with page numbers
- **Hybrid YouTube Discovery**: automatic fallback when < 3 internal results
- YouTube search results displayed separately with clear "External" labeling
- Zero-results UX with suggestions and exploration prompts

### 📺 Ad Detail Page
- YouTube embed player with thumbnail preview (click to play)
- Title, brand, category, year, duration, views metadata
- Campaign name and tagline/slogan highlight box
- Short and long description with "Read more" toggle
- Tags with links to tag search
- Related ads by brand/category
- Brand info sidebar card
- Ad details sidebar (category, duration, year, source)
- External YouTube link
- Favorite/Save button
- Share button (Web Share API + clipboard fallback)
- Report issue modal
- Breadcrumb navigation
- Full SEO metadata + VideoObject schema markup

### 📂 Categories
- Categories listing page with all 20 industries
- Category detail page with paginated ad grid
- Sort by newest/most viewed/trending
- Ad count display
- SEO metadata per category

### 🏢 Brands
- Brand listing page with A-Z alphabetical grouping
- Jump navigation by letter
- Brand detail page with full ad grid
- Brand info (logo, description, website, industry)
- Verified badge support
- SEO metadata per brand

### 📈 Trending
- Trending ads page with numbered rank display
- Most viewed all-time section
- Editor's picks (featured ads)

### 👤 User Accounts
- Registration with password strength indicator
- Email/password login
- Google OAuth support (via NextAuth)
- JWT session management
- User account dashboard with stats
- Saved/Favorites page
- Collections/playlists support
- Watch history tracking
- Admin role system (USER, MODERATOR, ADMIN)

### 📤 Submit Ad Form
- Title, brand, category, video URL, notes fields
- Contact email for anonymous submissions
- Success state with clear next steps
- Validation with helpful error messages

### 🎛️ Admin Dashboard
- Stats overview (ads, users, brands, pending, submissions, YouTube queue)
- Recent ads list
- Top search queries analytics
- Zero-result searches (content gap analysis)
- Quick actions panel

### 📋 Admin Ad Management
- Paginated ad table with thumbnails, status, stats
- Status filter (All, Published, Pending, Draft, Rejected)
- Search within admin
- Edit/view/delete actions
- Featured and trending flags

### 🎬 YouTube Discovery Queue
- Videos discovered via search stored as candidates
- Admin review interface (Import/Reject per video)
- Status tracking (Candidate → Imported/Rejected/Duplicate)
- Duplicate detection with similarity scoring
- Direct "Watch on YouTube" links
- Import creates ad record in PENDING status for review

### 📥 Ad Submissions Review
- Status tabs (Pending/Approved/Rejected/Duplicate)
- Submission details with video URL preview link
- Approve/Reject actions with notes

### 🔧 Import Tool (Admin)
- Drag-and-drop CSV or JSON upload
- Import settings (default status, skip duplicates)
- Real-time progress with results summary
- Error log with row-by-row details
- Auto-creates brands, categories, and tags on import
- YouTube URL detection and embed generation
- CLI import script: `npx tsx scripts/import.ts --file=ads.csv`

### 🗄️ Database & Schema
- Complete PostgreSQL schema via Prisma ORM
- Models: Ad, Brand, Category, Tag, User, Favorite, Collection, WatchHistory, Submission, YouTubeCandidate, YouTubeCache, ImportBatch, ImportLog, SearchLog, PageView, Comment
- Full-text search using PostgreSQL `ILIKE`
- Slug generation, deduplication, validation
- Soft delete support
- Search query logging for analytics

### 🔌 API Routes
- `GET /api/search?q=...&category=...&sort=...&page=...` — Internal search
- `GET /api/search/suggestions?q=...` — Autocomplete
- `GET /api/youtube/search?q=...` — YouTube with caching
- `POST /api/ads/[id]/favorite` — Favorite an ad
- `DELETE /api/ads/[id]/favorite` — Unfavorite
- `POST /api/submissions` — Submit missing ad
- `POST /api/auth/register` — User registration
- `POST /api/admin/import` — CSV/JSON import
- `POST /api/admin/youtube/import` — Queue YouTube candidate
- `PATCH /api/admin/youtube/[id]` — Import/reject candidate
- `PATCH /api/admin/submissions/[id]` — Approve/reject submission
- `GET /api/sitemap` — XML sitemap generation

### 🗺️ SEO
- Dynamic metadata via Next.js `generateMetadata`
- VideoObject structured data on ad detail pages
- Canonical URLs
- OG images and Twitter cards
- XML sitemap (`/sitemap.xml`)
- Semantic HTML (h1, h2, article, nav, main, etc.)
- Clean URL structure: `/ads/[slug]`, `/brands/[slug]`, `/categories/[slug]`

---

## 🏗️ Architecture

```
tivoads/
├── src/
│   ├── app/
│   │   ├── (site)/              # Public-facing site (Navbar + Footer layout)
│   │   │   ├── page.tsx         # Homepage
│   │   │   ├── ads/
│   │   │   │   ├── page.tsx     # Browse all ads
│   │   │   │   └── [slug]/      # Ad detail page
│   │   │   ├── search/          # Search results (hybrid)
│   │   │   ├── categories/      # Category listing + detail
│   │   │   ├── brands/          # Brand listing + detail
│   │   │   ├── trending/        # Trending ads
│   │   │   ├── login/           # Login page
│   │   │   ├── register/        # Register page
│   │   │   ├── account/         # User account area
│   │   │   └── submit/          # Submit missing ad
│   │   ├── admin/               # Admin dashboard (protected)
│   │   │   ├── page.tsx         # Admin overview
│   │   │   ├── ads/             # Ad management
│   │   │   ├── import/          # Import tool
│   │   │   ├── youtube/         # YouTube queue
│   │   │   └── submissions/     # Submission reviews
│   │   └── api/
│   │       ├── auth/            # NextAuth + register
│   │       ├── search/          # Internal search + suggestions
│   │       ├── youtube/         # YouTube search API
│   │       ├── ads/[id]/        # Ad CRUD + favorites
│   │       ├── submissions/     # Public submission
│   │       ├── reports/         # Report issue
│   │       ├── admin/           # Admin-only APIs
│   │       └── sitemap/         # XML sitemap
│   ├── components/
│   │   ├── ads/                 # AdCard, AdGrid
│   │   ├── brands/              # BrandCard
│   │   ├── categories/          # CategoryCard
│   │   ├── search/              # SearchBar, YouTubeResultCard
│   │   ├── layout/              # Navbar, Footer
│   │   ├── admin/               # AdminSidebar
│   │   ├── providers/           # ThemeProvider, SessionProvider
│   │   └── ui/                  # Toaster, etc.
│   ├── lib/
│   │   ├── prisma.ts            # Database client
│   │   ├── auth.ts              # NextAuth config
│   │   ├── search.ts            # Internal search logic
│   │   ├── youtube.ts           # YouTube API integration
│   │   └── utils.ts             # Shared utilities
│   └── hooks/
│       └── useDebounce.ts
├── prisma/
│   ├── schema.prisma            # Full database schema
│   └── seed.ts                  # Database seeder
├── scripts/
│   └── import.ts                # CLI import tool
├── index.html                   # Standalone preview/showcase
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── .env.example
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js (credentials + Google) |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Animation | Framer Motion |
| Search | PostgreSQL full-text (ILIKE) |
| YouTube | YouTube Data API v3 |
| Caching | Next.js `revalidate` + DB caching |
| Deployment | Vercel (recommended) |
| DB Hosting | Neon / Supabase / Railway |

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/yourorg/tivoads.git
cd tivoads
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/tivoads"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
YOUTUBE_API_KEY="your-youtube-api-key"   # Optional but recommended
```

### 3. Setup Database

```bash
# Push schema to database
npm run db:push

# Generate Prisma client
npm run db:generate

# Seed with sample data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)
- Email: `admin@tivoads.com`
- Password: `admin123` (change immediately in production)

---

## 📥 Importing Existing Data

### CSV Import (Recommended)

Prepare your CSV with these columns:
```csv
title,brand_name,category,description_short,video_url,thumbnail_url,duration,year,tags,slogan,campaign
```

**Via Admin UI** (http://localhost:3000/admin/import):
1. Drag and drop your CSV file
2. Choose default status (Published/Pending/Draft)
3. Enable "Skip duplicates"
4. Click "Start Import"

**Via CLI**:
```bash
# Dry run first to preview
npx tsx scripts/import.ts --file=./data/ads.csv --dry-run

# Full import
npx tsx scripts/import.ts --file=./data/ads.csv --status=PUBLISHED

# Import as pending (requires admin review)
npx tsx scripts/import.ts --file=./data/ads.csv --status=PENDING
```

### JSON Import

Your JSON should be an array of objects with the same field names as CSV columns.

### Import Pipeline Features
- ✅ Auto-creates brands and categories if they don't exist
- ✅ Detects and generates YouTube embeds from YouTube URLs
- ✅ Generates SEO slugs
- ✅ Deduplication by title
- ✅ Error logging per row
- ✅ Batch tracking for re-runs
- ✅ Auto-updates ad counts on brands/categories

---

## 🎬 YouTube Integration

### Getting a YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "YouTube Data API v3"
4. Create credentials → API Key
5. Add to `.env`: `YOUTUBE_API_KEY=your-key`

### How It Works

1. User searches on TivoAds
2. **Internal database** is searched first
3. If **< 3 results**, YouTube search is triggered automatically
4. Results shown in two labeled sections:
   - 🗄️ Internal Database Results
   - 📺 YouTube Discovery Results
5. Users can click "Watch on YouTube" to view external
6. Admins can click "📥 Import" to queue for review
7. In admin `/admin/youtube` — review candidates, import or reject
8. Imported → Creates ad in PENDING status → Publish after review

### Caching
- YouTube results cached in DB for 6 hours (reduces API calls)
- Cache stored in `youtube_cache` table with auto-expiry

---

## 🔐 Authentication & Roles

| Role | Access |
|------|--------|
| Anonymous | Browse, search, view ads |
| USER | + Save favorites, create collections, submit ads |
| MODERATOR | + Admin panel, manage ads, review submissions |
| ADMIN | + Full admin, user management, import, YouTube queue |

---

## 📊 SEO Optimization

- **Clean URLs**: `/ads/nike-dream-crazy-2018`, `/brands/nike`, `/categories/sports-fitness`
- **Dynamic metadata**: Each page has unique `title`, `description`, `og:image`
- **VideoObject schema**: Structured data on ad detail pages for Google rich results
- **Sitemap**: Auto-generated XML at `/sitemap.xml`
- **Canonical URLs**: Prevent duplicate content issues
- **ISR**: Incremental Static Regeneration with appropriate `revalidate` values
- **Core Web Vitals**: Lazy loading, optimized images, minimal JS

---

## 🎨 Design System

- **Colors**: Brand orange (`#f97316`), Dark backgrounds (`#080e1a` to `#1e293b`)
- **Dark mode**: Default dark, light mode supported via `next-themes`
- **Typography**: Inter font, strong weight hierarchy
- **Cards**: Rounded `2xl` (1rem), subtle borders, hover lift effect
- **Animations**: Slide-up, scale-in, shimmer loading states
- **Responsive**: Mobile-first, breakpoints at sm/md/lg/xl
- **Accessibility**: ARIA labels, keyboard navigation, focus rings, semantic HTML

---

## 🔌 Key API Endpoints

### Public
```
GET  /api/search?q=nike&category=sports&sort=newest&page=1
GET  /api/search/suggestions?q=nik
GET  /api/youtube/search?q=nike commercial&limit=12
POST /api/submissions { title, brandName, videoUrl, ... }
POST /api/auth/register { name, email, password }
```

### Authenticated (USER+)
```
POST   /api/ads/[id]/favorite
DELETE /api/ads/[id]/favorite
GET    /api/ads/[id]/favorite
```

### Admin Only
```
POST  /api/admin/import (multipart/form-data)
POST  /api/admin/youtube/import
PATCH /api/admin/youtube/[id] { action: "import"|"reject" }
PATCH /api/admin/submissions/[id] { action: "approve"|"reject" }
```

---

## 📈 Performance Features

- **ISR** (Incremental Static Regeneration) on all pages
- **Lazy loading** images throughout
- **Search debouncing** (300ms) for autocomplete
- **YouTube caching** in DB (6-hour TTL)
- **View count** incremented server-side (no client JS needed)
- **Ad count** caching on Brand/Category tables
- **next/image** for optimized image delivery

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

```bash
# Build test
npm run build
npm run start
```

### Database Options
- **Neon** (Serverless PostgreSQL, free tier available)
- **Supabase** (PostgreSQL with extras)
- **Railway** (Simple PostgreSQL deployment)
- **PlanetScale** (MySQL, requires schema changes)

### Environment Variables (Production)
```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://tivoads.com
NEXTAUTH_SECRET=strong-random-secret-here
YOUTUBE_API_KEY=your-key
NEXT_PUBLIC_APP_URL=https://tivoads.com
ADMIN_EMAIL=admin@tivoads.com
ADMIN_PASSWORD=super-strong-password
```

---

## 🗂️ Data Models

### Core Tables

| Table | Description |
|-------|-------------|
| `ads` | Main ad records with all metadata |
| `brands` | Brand directory |
| `categories` | Industry categories (hierarchical) |
| `tags` | Searchable tags |
| `ad_tags` | Many-to-many ads ↔ tags |
| `users` | User accounts |
| `favorites` | User ↔ ad saves |
| `collections` | User playlists/collections |
| `collection_ads` | Collection ↔ ad memberships |
| `watch_history` | Per-user watch tracking |
| `submissions` | User-submitted missing ads |
| `youtube_candidates` | YouTube videos queued for admin review |
| `youtube_cache` | Cached YouTube API responses |
| `import_batches` | Import job tracking |
| `import_logs` | Per-row import results |
| `search_logs` | Search query analytics |
| `page_views` | Page view tracking |

---

## 📝 Features Not Yet Implemented

1. **Blog / Insights** — SEO content blog (recommended for link building)
2. **Comments** — Schema exists, UI not built (avoid spam without auth)
3. **Email notifications** — For account verification, submission updates
4. **Follow brands/categories** — Schema exists, UI not built
5. **Redis caching** — Replace DB caching with Upstash Redis
6. **Algolia search** — Replace PostgreSQL ILIKE with Algolia for better fuzzy search
7. **Analytics dashboard** — Charts showing searches, ad views, trends
8. **Monetization** — Ad placements, sponsored featured sections
9. **PWA support** — Offline capability via service worker
10. **Video upload** — Allow admins to upload video files directly

---

## 🔮 Recommended Next Steps

1. **Import your existing data** using the CLI tool or admin import UI
2. **Get a YouTube API key** and add to environment variables
3. **Configure domain** and deploy to Vercel
4. **Set up Neon/Supabase** for production database
5. **Add Google Analytics** (env: `NEXT_PUBLIC_GA_ID`)
6. **Build the blog section** for SEO content marketing
7. **Add Google OAuth** for faster user registration
8. **Implement Algolia** for production-grade fuzzy search
9. **Add email** (Resend/SendGrid) for account verification
10. **Set up monitoring** (Sentry, LogRocket)

---

## 🎬 Live Preview

The `index.html` file in this repository is a **standalone interactive preview** of the TivoAds platform. It can be:
- Opened directly in any browser (no server needed)
- Deployed as a static page
- Used to demonstrate the design to stakeholders

It includes functional demos of:
- Hero search with dropdown suggestions
- Ad cards with hover effects and play overlays
- Trending ads with rank numbers
- Categories and brands grids
- Search results page with YouTube integration section
- Ad detail page with embedded YouTube player
- Admin dashboard mockup
- Login and register pages
- User account page
- Submit ad form

---

## 📄 License

Proprietary — TivoAds © 2025. All rights reserved.
