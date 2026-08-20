import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Globe, CheckCircle } from 'lucide-react';
import { getDb } from '@/lib/prisma';
import { AdGrid } from '@/components/ads/AdGrid';

interface BrandPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}

const PAGE_SIZE = 20;

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const prisma = await getDb();
  
  // Note: If you have a specific cached helper, ensure it uses getDb()
  const brand = await prisma.brand.findUnique({ where: { slug } });
  if (!brand) return { title: 'Brand Not Found' };

  return {
    title: `${brand.name} Ads — TivoAds`,
    description: brand.description || `Browse ${brand.name} advertisements on TivoAds.`,
  };
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const { slug } = await params;
  const { page: pageParam, sort: sortParam } = await searchParams;
  
  const page = parseInt(pageParam || '1');
  const sort = sortParam || 'newest';
  const skip = (page - 1) * PAGE_SIZE;

  const prisma = await getDb();

  const brand = await prisma.brand.findUnique({ where: { slug } });

  if (!brand || !brand.isActive) notFound();

  const orderByMap: any = {
    newest: [{ publishDate: 'desc' }, { createdAt: 'desc' }],
    oldest: [{ publishDate: 'asc' }],
    views: [{ viewCount: 'desc' }],
    trending: [{ trendingScore: 'desc' }],
  };

  // Parallel execution
  const [ads, total] = await Promise.all([
    prisma.ad.findMany({
      where: { brandId: brand.id, status: 'PUBLISHED' },
      orderBy: orderByMap[sort] || orderByMap.newest,
      skip,
      take: PAGE_SIZE,
      include: {
        brand: { select: { name: true, slug: true, logoUrl: true } },
        category: { select: { name: true, slug: true, color: true } },
        tags: { include: { tag: { select: { name: true, slug: true } } } },
      },
    }),
    prisma.ad.count({ where: { brandId: brand.id, status: 'PUBLISHED' } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-background">
      {/* Brand Header */}
      <div className="bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 py-12 px-4">
        <div className="section-container">
          <div className="flex items-center gap-6">
            {brand.logoUrl ? (
              <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center p-2 flex-shrink-0">
                <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl font-bold text-brand-400">{brand.name[0]}</span>
              </div>
            )}
            <div>
              <nav className="flex items-center gap-2 text-sm mb-2">
                <Link href="/brands" className="text-white/50 hover:text-white transition-colors">Brands</Link>
                <span className="text-white/30">/</span>
                <span className="text-white font-medium">{brand.name}</span>
              </nav>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-white">{brand.name}</h1>
                {brand.isVerified && <CheckCircle className="w-6 h-6 text-blue-400" />}
              </div>
              {brand.description && (
                <p className="text-white/70 mt-3 max-w-2xl text-sm leading-relaxed line-clamp-2">
                  {brand.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-4">
                <span className="text-sm text-white/50">
                  <strong className="text-white">{total.toLocaleString()}</strong> ads archived
                </span>
                {brand.websiteUrl && (
                  <a href={brand.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-brand-400 hover:underline">
                    <Globe className="w-3.5 h-3.5" /> Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-white/5 pb-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Brand Advertisements</h2>
            <p className="text-sm text-muted-foreground">Showing {ads.length} ads on this page</p>
          </div>
          
          <div className="flex bg-dark-800 p-1 rounded-xl gap-1 self-start">
            {['newest', 'views', 'trending'].map((s) => (
              <Link
                key={s}
                href={`/brands/${slug}?sort=${s}`}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  sort === s ? 'bg-brand-500 text-white shadow-lg' : 'text-white/40 hover:text-white'
                }`}
              >
                {s.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>

        <AdGrid ads={ads} columns={4} emptyMessage={`No ads found for ${brand.name}.`} />

        {totalPages > 1 && (
          <div className="flex flex-col items-center gap-6 mt-16 pb-12">
            <div className="flex items-center gap-3">
              {page > 1 ? (
                <Link 
                  href={`/brands/${slug}?page=${page - 1}&sort=${sort}`} 
                  className="px-5 py-2 bg-dark-800 hover:bg-dark-700 text-white rounded-full text-sm border border-white/10 transition-colors"
                >
                  ← Previous
                </Link>
              ) : (
                <div className="px-5 py-2 bg-dark-900 text-white/20 rounded-full text-sm border border-white/5 cursor-not-allowed">
                  ← Previous
                </div>
              )}

              <span className="text-sm font-medium text-white/60 px-2">
                Page <span className="text-white">{page}</span> of {totalPages}
              </span>

              {page < totalPages ? (
                <Link 
                  href={`/brands/${slug}?page=${page + 1}&sort=${sort}`} 
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-full text-sm font-bold shadow-lg shadow-brand-500/20 transition-all"
                >
                  Next →
                </Link>
              ) : (
                <div className="px-5 py-2 bg-dark-900 text-white/20 rounded-full text-sm border border-white/5 cursor-not-allowed">
                  Next →
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}