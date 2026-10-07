import type { Metadata } from 'next';
import Link from 'next/link';
import { unstable_cache } from 'next/cache';
import { getDb } from '@/lib/prisma';
import { AdGrid } from '@/components/ads/AdGrid';
import { AdsFilter } from './AdsFilter';

export const metadata: Metadata = {
  title: 'Browse All Ads',
  description: 'Browse the complete TivoAds library. Thousands of TV and video ads organized by brand, category, and year.',
};

interface AdsPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

const PAGE_SIZE = 24;

// Cache the count per unique filter combination for 1 hour to prevent D1 row read spikes
const getCachedTotalCount = unstable_cache(
  async (whereStr: string) => {
    const prisma = await getDb();
    const where = JSON.parse(whereStr);
    return await prisma.ad.count({ where });
  },
  ['ads-filter-count'],
  { revalidate: 3600 }
);

export default async function AdsPage({ searchParams }: AdsPageProps) {
  const resolvedParams = await searchParams;
  
  const page = parseInt(resolvedParams.page || '1');
  const sort = resolvedParams.sort || 'newest';
  const featured = resolvedParams.featured === 'true';
  const year = resolvedParams.year ? parseInt(resolvedParams.year) : undefined;
  const source = resolvedParams.source;

  // 1. Filter Criteria
  const where: any = { status: 'PUBLISHED' };
  if (featured) where.isFeatured = true;
  if (year) where.year = year;
  if (source) where.sourceType = source.toUpperCase();

  const prisma = await getDb();

  // 2. Get Cached Total Count (Bypasses D1 table scan on repeat requests)
  const total = await getCachedTotalCount(JSON.stringify(where));

  // 3. Standard Safe Offset Pagination
  const skip = (page - 1) * PAGE_SIZE;

  const orderByMap: any = {
    newest: [{ createdAt: 'desc' }],
    oldest: [{ createdAt: 'asc' }],
    views: [{ viewCount: 'desc' }],
    trending: [{ trendingScore: 'desc' }, { viewCount: 'desc' }],
    favorites: [{ favoriteCount: 'desc' }],
  };

  // 4. Database Query (Optimized without heavy distinct/memory traps)
  const [ads, availableYears] = await Promise.all([
    prisma.ad.findMany({
      where,
      orderBy: orderByMap[sort] || orderByMap.newest,
      skip,
      take: PAGE_SIZE,
      include: {
        brand: { select: { name: true, slug: true, logoUrl: true } },
        category: { select: { name: true, slug: true, color: true } },
        tags: { include: { tag: { select: { name: true, slug: true } } } },
      },
    }),
    prisma.ad.findMany({
      where: { status: 'PUBLISHED', year: { not: null } },
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'desc' },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const years = availableYears.map((a) => a.year).filter(Boolean) as number[];

  const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'trending', label: 'Trending' },
    { value: 'views', label: 'Most Viewed' },
    { value: 'favorites', label: 'Most Saved' },
    { value: 'oldest', label: 'Oldest' },
  ];

  const SOURCE_OPTIONS = [
    { value: '', label: 'All Sources' },
    { value: 'INTERNAL', label: 'Internal' },
    { value: 'YOUTUBE', label: 'YouTube' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 border-b border-border">
        <div className="section-container py-8">
          <h1 className="heading-3 text-foreground mb-1">Browse All Ads</h1>
          <p className="text-muted-foreground">
            {total.toLocaleString()} ads available
          </p>
        </div>
      </div>

      <div className="section-container py-8">
        {/* Filters Header */}
        <div className="flex flex-wrap items-center gap-3 mb-8 pb-6 border-b border-border">
          <div className="flex gap-1 flex-wrap">
            {SORT_OPTIONS.map((opt) => (
              <Link
                key={opt.value}
                href={`/ads?sort=${opt.value}${featured ? '&featured=true' : ''}${year ? `&year=${year}` : ''}`}
                className={`btn btn-sm ${sort === opt.value ? 'btn-primary' : 'btn-outline'}`}
              >
                {opt.label}
              </Link>
            ))}
          </div>

          <div className="w-px h-6 bg-border hidden sm:block" />

          <Link
            href={`/ads?sort=${sort}${featured ? '' : '&featured=true'}`}
            className={`btn btn-sm ${featured ? 'btn-primary' : 'btn-outline'}`}
          >
            ⭐ Featured
          </Link>

          {years.length > 0 && (
            <AdsFilter years={years} currentYear={year} />
          )}

          <div className="flex gap-1 ml-auto">
            {SOURCE_OPTIONS.map((opt) => (
              <Link
                key={opt.value}
                href={`/ads?sort=${sort}${opt.value ? `&source=${opt.value}` : ''}`}
                className={`btn btn-sm ${(source || '') === opt.value ? 'btn-primary' : 'btn-outline'}`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>

        {/* The Grid */}
        <AdGrid ads={ads as any} columns={4} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            {page > 1 && (
              <Link href={`/ads?page=${page - 1}&sort=${sort}`} className="btn btn-outline btn-md">
                ← Previous
              </Link>
            )}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                const p = i + 1;
                return (
                  <Link
                    key={p}
                    href={`/ads?page=${p}&sort=${sort}`}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      page === p ? 'bg-brand-500 text-white' : 'hover:bg-accent text-muted-foreground'
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
            {page < totalPages && (
              <Link href={`/ads?page=${page + 1}&sort=${sort}`} className="btn btn-outline btn-md">
                Next →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}