import type { Metadata } from 'next';
import { TrendingUp } from 'lucide-react';
import prisma from '@/lib/prisma';
import { AdCard } from '@/components/ads/AdCard';
import { AdGrid } from '@/components/ads/AdGrid';

export const metadata: Metadata = {
  title: 'Trending Ads — TivoAds',
  description: 'Discover the most popular and trending TV and video advertisements right now. See what ads are making waves.',
};

export const revalidate = 300;

export default async function TrendingPage() {
  const [trending, mostViewed, featured] = await Promise.all([
    prisma.ad.findMany({
      where: { status: 'PUBLISHED', isTrending: true },
      orderBy: [{ trendingScore: 'desc' }, { viewCount: 'desc' }],
      take: 12,
      include: {
        brand: { select: { name: true, slug: true, logoUrl: true } },
        category: { select: { name: true, slug: true, color: true } },
        tags: { include: { tag: { select: { name: true, slug: true } } } },
      },
    }),
    prisma.ad.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { viewCount: 'desc' },
      take: 8,
      include: {
        brand: { select: { name: true, slug: true, logoUrl: true } },
        category: { select: { name: true, slug: true, color: true } },
        tags: { include: { tag: { select: { name: true, slug: true } } } },
      },
    }),
    prisma.ad.findMany({
      where: { status: 'PUBLISHED', isFeatured: true },
      orderBy: { viewCount: 'desc' },
      take: 4,
      include: {
        brand: { select: { name: true, slug: true, logoUrl: true } },
        category: { select: { name: true, slug: true, color: true } },
        tags: { include: { tag: { select: { name: true, slug: true } } } },
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-950 via-dark-900 to-dark-950 py-14 px-4">
        <div className="section-container text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-400 mb-6">
            <TrendingUp className="w-4 h-4" />
            Updated Daily
          </div>
          <h1 className="heading-2 text-white mb-4">Trending Ads</h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            The most popular and trending advertisements in our library right now.
          </p>
        </div>
      </div>

      <div className="section-container py-12 space-y-14">
        {/* Top trending with numbers */}
        {trending.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-5 h-5 text-brand-500" />
              <h2 className="heading-4 text-foreground">🔥 Trending Now</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {trending.map((ad, idx) => (
                <div key={ad.id} className="relative">
                  <div className="absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                    {idx + 1}
                  </div>
                  <AdCard ad={ad} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Most viewed */}
        <section>
          <h2 className="heading-4 text-foreground mb-6">👁 Most Viewed All Time</h2>
          <AdGrid ads={mostViewed} columns={4} />
        </section>

        {/* Featured */}
        {featured.length > 0 && (
          <section>
            <h2 className="heading-4 text-foreground mb-6">⭐ Editor's Picks</h2>
            <AdGrid ads={featured} columns={4} variant="featured" />
          </section>
        )}
      </div>
    </div>
  );
}