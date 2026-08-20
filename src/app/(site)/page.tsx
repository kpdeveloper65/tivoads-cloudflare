import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, TrendingUp, Sparkles, Search, Play, Youtube } from 'lucide-react';
import { getDb } from '@/lib/prisma';
import { SearchBar } from '@/components/search/SearchBar';
import { AdCard } from '@/components/ads/AdCard';
import { AdGrid } from '@/components/ads/AdGrid';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { BrandCard } from '@/components/brands/BrandCard';

export const metadata: Metadata = {
  title: 'TivoAds — The Premium Ad Discovery & Research Library',
  description: 'Search thousands of TV and video ads by brand, category, campaign, and keyword. The premier ad archive for marketers, agencies, and creative professionals.',
};

export const revalidate = 300; // 5 minutes

async function getHomepageData() {
  const prisma = await getDb();

  const count = await prisma.ad.count({
    where: { status: 'PUBLISHED' },
  });

  const today = new Date().toISOString().slice(0, 10);
  const seed = Number(today.replace(/-/g, ''));

  const skip = seed % Math.max(count - 9, 1);

  const [featuredAds, latestAds, trendingAds, categories, brands, stats] = await Promise.all([
    // Featured ads
    prisma.ad.findMany({
      where: { status: 'PUBLISHED', isFeatured: true },
      orderBy: { viewCount: 'desc' },
      take: 6,
      include: {
        brand: { select: { name: true, slug: true, logoUrl: true } },
        category: { select: { name: true, slug: true, color: true } },
        tags: { include: { tag: { select: { name: true, slug: true } } } },
      },
    }),
    // Latest ads
    prisma.ad.findMany({
      where: { status: 'PUBLISHED' },
      distinct: ['brandId'], // This ensures one ad per brand
      orderBy: { createdAt: 'desc' },
      take: 8,
      skip,
      include: {
        brand: { select: { name: true, slug: true, logoUrl: true } },
        category: { select: { name: true, slug: true, color: true } },
        tags: { include: { tag: { select: { name: true, slug: true } } } },
      },
    }),
    // Trending ads
    prisma.ad.findMany({
      where: { status: 'PUBLISHED', isTrending: true },
      orderBy: [{ trendingScore: 'desc' }, { viewCount: 'desc' }],
      take: 4,
      include: {
        brand: { select: { name: true, slug: true, logoUrl: true } },
        category: { select: { name: true, slug: true, color: true } },
        tags: { include: { tag: { select: { name: true, slug: true } } } },
      },
    }),
    // Categories with highest ad counts
    prisma.category.findMany({
      where: { isActive: true, adCount: { gt: 0 } },
      orderBy: { adCount: 'desc' },
      take: 12,
    }),
    // Brands
    prisma.brand.findMany({
      where: { isActive: true, adCount: { gt: 0 } },
      orderBy: { adCount: 'desc' },
      take: 10,
    }),
    // Stats
    Promise.all([
      prisma.ad.count({ where: { status: 'PUBLISHED' } }),
      prisma.brand.count({ where: { isActive: true } }),
      prisma.category.count({ where: { isActive: true } }),
    ]),
  ]);

  return {
    featuredAds,
    latestAds,
    trendingAds,
    categories,
    brands,
    totalAds: stats[0],
    totalBrands: stats[1],
    totalCategories: stats[2],
  };
}

async function getPopularTags() {
  try {
    const prisma = await getDb();
    // 1. Query the 50 most-viewed PUBLISHED ads and include their related tags
    const topAdsWithTags = await prisma.ad.findMany({
      where: { 
        status: 'PUBLISHED' 
      },
      orderBy: { 
        viewCount: 'desc' 
      },
      select: {
        tags: {
          select: {
            tag: {
              select: { 
                name: true 
              }
            }
          }
        }
      },
      take: 50, 
    });

    // 2. Extract, flatten, and CLEAN the tags of special characters
    const allTags = topAdsWithTags.flatMap(ad => 
      ad.tags.map(adTag => {
        return adTag.tag.name
          .replace(/[^a-zA-Z0-9\s-]/g, '') // Strips everything except letters, numbers, spaces, and hyphens
          .replace(/\s+/g, ' ')            // Collapses any accidental double spaces down to a single space
          .trim();                         // Trims whitespace from the edges
      })
    );

    // 3. Deduplicate the cleaned array
    const uniqueTags = [...new Set(allTags)];

    // 4. FILTER: Keep only tags that are 1 or 2 words long and not empty
    const filteredShortTags = uniqueTags.filter(tagName => {
      if (!tagName) return false; // Skip if cleaning left the string completely empty

      // Split the tag by spaces to count the words
      const wordCount = tagName.split(/\s+/).length;
      
      // Only allow tags that have 1 or 2 words
      return wordCount >= 1 && wordCount <= 2;
    });

    // 5. Return the top 10 short, clean tags
    return filteredShortTags.slice(0, 10);

  } catch (error) {
    console.error("Error fetching popular tags:", error);
    return []; 
  }
}

export default async function HomePage() {
  const data = await getHomepageData();
  const popularTags = await getPopularTags();

  return (
    <div className="flex flex-col">
      {/* ============================================================
          HERO SECTION
      ============================================================ */}
      <section className="relative min-h-[580px] flex items-center justify-center overflow-hidden bg-hero-dark dark:bg-hero-dark">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950" />
          {/* Glow orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-brand-700/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 section-container text-center py-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-400 mb-6 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            The Premier Ad Discovery & Research Library
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6">
            Discover the World&apos;s
            <br />
            <span className="text-gradient">Best Advertisements</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-white/70 max-w-3xl mx-auto mb-10 leading-relaxed">
            Search{' '}
            <strong className="text-white font-semibold">
              {data.totalAds.toLocaleString()}+ ads
            </strong>{' '}
            from{' '}
            <strong className="text-white font-semibold">
              {data.totalBrands}+ brands
            </strong>{' '}
            across{' '}
            <strong className="text-white font-semibold">
              {data.totalCategories} categories
            </strong>
            . The go-to research library for marketers, agencies, and creative strategists.
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-8">
            <SearchBar
              heroMode
              placeholder="Search brands, campaigns, slogans, industries..."
            />
          </div>

          {/* Popular searches */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-white/40">Popular:</span>
            {popularTags.map((tag) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 hover:border-brand-500/40 hover:text-brand-400 hover:bg-brand-500/10 transition-all duration-200 backdrop-blur-sm"
              >
                {tag}
              </Link>
            ))}
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-12 text-sm text-white/50">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              <span>{data.totalAds.toLocaleString()}+ Ads Archived</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              <span>{data.totalBrands}+ Brands</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              <span>+ YouTube Discovery</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span>Free to Browse</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURED ADS
      ============================================================ */}
      {data.featuredAds.length > 0 && (
        <section className="section-padding bg-background">
          <div className="section-container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="heading-3 text-foreground">Featured Ads</h2>
                <p className="text-muted-foreground text-sm mt-1">Handpicked exceptional advertisements</p>
              </div>
              <Link href="/ads?featured=true" className="btn btn-ghost btn-sm text-brand-500">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <AdGrid ads={data.featuredAds} columns={3} />
          </div>
        </section>
      )}

      {/* ============================================================
          TRENDING ADS
      ============================================================ */}
      {data.trendingAds.length > 0 && (
        <section className="section-padding bg-muted/30 dark:bg-dark-900/50">
          <div className="section-container">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-500/10">
                  <TrendingUp className="w-5 h-5 text-brand-500" />
                </div>
                <div>
                  <h2 className="heading-4 text-foreground">Trending Now</h2>
                  <p className="text-muted-foreground text-sm">Most popular ads this week</p>
                </div>
              </div>
              <Link href="/trending" className="btn btn-ghost btn-sm text-brand-500">
                See trending <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {data.trendingAds.map((ad, idx) => (
                <div key={ad.id} className="relative">
                  <div className="absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                    {idx + 1}
                  </div>
                  <AdCard ad={ad} variant="featured" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
          LATEST ADS
      ============================================================ */}
      <section className="section-padding bg-background">
        <div className="section-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="heading-3 text-foreground">Latest Ads</h2>
              <p className="text-muted-foreground text-sm mt-1">Recently added to our archive</p>
            </div>
            <Link href="/ads" className="btn btn-ghost btn-sm text-brand-500">
              Browse all ads <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <AdGrid ads={data.latestAds} columns={4} />
        </div>
      </section>

      {/* ============================================================
          CATEGORIES
      ============================================================ */}
      {data.categories.length > 0 && (
        <section className="section-padding bg-muted/30 dark:bg-dark-900/50">
          <div className="section-container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="heading-3 text-foreground">Browse by Category</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Explore ads across {data.totalCategories} industries
                </p>
              </div>
              <Link href="/categories" className="btn btn-ghost btn-sm text-brand-500">
                All categories <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {data.categories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
          BRANDS
      ============================================================ */}
      {data.brands.length > 0 && (
        <section className="section-padding bg-background">
          <div className="section-container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="heading-3 text-foreground">Popular Brands</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Explore campaigns from the world&apos;s top advertisers
                </p>
              </div>
              <Link href="/brands" className="btn btn-ghost btn-sm text-brand-500">
                All brands <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-3">
              {data.brands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} variant="pill" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
          YOUTUBE DISCOVERY SECTION
      ============================================================ */}
      <section className="section-padding bg-gradient-to-br from-red-950/30 via-dark-900/50 to-dark-950/30 dark:from-red-950/20">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-sm text-red-400 mb-6">
              <Youtube className="w-4 h-4" />
              YouTube Discovery
            </div>
            <h2 className="heading-3 text-foreground mb-4">
              Can&apos;t Find the Ad You&apos;re Looking For?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Our hybrid search automatically scans YouTube for ads not yet in our database.
              Get instant results from both our curated archive and YouTube&apos;s vast library.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                {
                  icon: '🔍',
                  title: 'Internal First',
                  desc: 'We search our curated database of verified ads',
                },
                {
                  icon: '🎯',
                  title: 'YouTube Fallback',
                  desc: 'If no strong matches, we fetch YouTube results automatically',
                },
                {
                  icon: '📥',
                  title: 'Import to Library',
                  desc: 'Admins can review and import YouTube finds to our database',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border bg-card/50 p-5 text-left backdrop-blur-sm"
                >
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>

            <Link href="/search" className="btn btn-primary btn-lg">
              <Search className="w-5 h-5" />
              Try Hybrid Search
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          WHO IS TIVOADS FOR
      ============================================================ */}
      <section className="section-padding bg-background">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="heading-3 text-foreground mb-4">Built for Ad Professionals</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether you&apos;re researching competitors, seeking creative inspiration, or studying advertising history,
              TivoAds is your go-to resource.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: '📊', title: 'Marketers', desc: 'Research trends & strategies' },
              { icon: '🎨', title: 'Creatives', desc: 'Find inspiration & references' },
              { icon: '🏢', title: 'Agencies', desc: 'Client research & pitches' },
              { icon: '🏪', title: 'Business Owners', desc: 'Learn from the best' },
              { icon: '🎓', title: 'Students', desc: 'Study advertising history' },
              { icon: '📺', title: 'Media Buyers', desc: 'Analyze ad performance' },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center text-center rounded-2xl border border-border bg-card p-4 hover:border-brand-500/30 hover:shadow-card-hover transition-all duration-300"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          CTA SECTION
      ============================================================ */}
      <section className="section-padding bg-gradient-to-br from-brand-950 via-dark-900 to-dark-950">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Start Discovering Amazing Ads Today
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Create a free account to save favorites, build collections, and get personalized ad recommendations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="btn btn-primary btn-xl w-full sm:w-auto">
                <Sparkles className="w-5 h-5" />
                Create Free Account
              </Link>
              <Link href="/submit" className="btn btn-lg border border-white/20 text-white hover:bg-white/10 w-full sm:w-auto">
                Submit an Ad
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SEO TEXT BLOCK
      ============================================================ */}
      <section className="py-10 bg-background">
        <div className="section-container">
          <div className="max-w-4xl mx-auto prose prose-sm dark:prose-invert">
            <h2 className="text-lg font-semibold text-foreground mb-3">
              About TivoAds — Your Premier Advertising Archive
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              TivoAds is the most comprehensive searchable archive of television and video advertisements on the web.
              Our platform hosts thousands of ads spanning decades of advertising history, from iconic Super Bowl
              commercials to cutting-edge digital campaigns. Whether you&apos;re a marketing professional looking for
              creative inspiration, an agency researcher analyzing competitor strategies, a brand manager studying
              industry trends, or a student learning advertising history, TivoAds provides unparalleled access to
              the world&apos;s most memorable and effective advertisements.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed mt-3">
              Search our database by brand name, product category, campaign name, advertising slogan, or keyword.
              Our advanced hybrid search system also queries YouTube in real-time when no strong internal matches
              are found, ensuring you always get relevant results. Discover ads from automotive, food & beverage,
              technology, healthcare, finance, entertainment, and dozens more categories. Filter by year, duration,
              source, and more to find exactly what you&apos;re looking for.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}