import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/prisma';
import { AdDetailClient } from './AdDetailClient';
import { getAbsoluteUrl } from '@/lib/utils';

// Force Cloudflare Workers to evaluate this page dynamically per request
export const dynamic = 'force-dynamic';

interface AdPageProps {
  params: Promise<{ slug: string }>;
}

async function getAd(slug: string) {
  try {
    const prisma = await getDb();
    const ad = await prisma.ad.findUnique({
      where: { slug, status: 'PUBLISHED' },
      include: {
        brand: true,
        category: true,
        tags: { include: { tag: true } },
      },
    });
    return ad;
  } catch (error) {
    console.warn(`Error fetching ad [${slug}]:`, error);
    return null;
  }
}

async function getRelatedAds(ad: Awaited<ReturnType<typeof getAd>>) {
  if (!ad) return [];
  try {
    const prisma = await getDb();

    const related = await prisma.ad.findMany({
      where: {
        status: 'PUBLISHED',
        id: { not: ad.id },
        OR: [
          { brandId: ad.brandId || undefined },
          { categoryId: ad.categoryId || undefined },
        ],
      },
      take: 6,
      orderBy: { viewCount: 'desc' },
      include: {
        brand: { select: { name: true, slug: true, logoUrl: true } },
        category: { select: { name: true, slug: true, color: true } },
        tags: { include: { tag: { select: { name: true, slug: true } } } },
      },
    });

    return related;
  } catch (error) {
    console.warn('Error fetching related ads:', error);
    return [];
  }
}

export async function generateMetadata({ params }: AdPageProps): Promise<Metadata> {
  const { slug } = await params;
  const ad = await getAd(slug);
  if (!ad) {
    return { title: 'Ad Not Found' };
  }

  const title = ad.metaTitle || `${ad.title} — ${ad.brand?.name || 'TivoAds'}`;
  const description =
    ad.metaDescription ||
    ad.descriptionShort ||
    `Watch "${ad.title}" by ${ad.brand?.name}. Ad archived on TivoAds — the premier ad discovery library.`;
  const canonical = getAbsoluteUrl(`/ads/${ad.slug}`);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'video.other',
      url: canonical,
      images: ad.thumbnailUrl ? [{ url: ad.thumbnailUrl, width: 1280, height: 720, alt: ad.title }] : [],
      siteName: 'TivoAds',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ad.thumbnailUrl ? [ad.thumbnailUrl] : [],
    },
    other: {
      ...(ad.embedUrl
        ? {
            'og:video': ad.embedUrl,
            'og:video:type': 'text/html',
            'og:video:width': '1280',
            'og:video:height': '720',
          }
        : {}),
    },
  };
}

export default async function AdPage({ params }: AdPageProps) {
  const { slug } = await params;
  const ad = await getAd(slug);
  if (!ad) notFound();

  // Track view inside try-catch block so write failures don't crash the page view
  try {
    const prisma = await getDb();
    await prisma.ad.update({
      where: { id: ad.id },
      data: { viewCount: { increment: 1 } },
    });
  } catch (error) {
    console.warn(`Failed to increment view count for ad ID ${ad.id}:`, error);
  }

  const related = await getRelatedAds(ad);

  // Generate structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: ad.title,
    description: ad.descriptionShort || ad.descriptionLong || '',
    thumbnailUrl: ad.thumbnailUrl || '',
    embedUrl: ad.embedUrl || '',
    uploadDate: ad.publishDate?.toISOString() || ad.createdAt.toISOString(),
    duration: ad.duration ? `PT${Math.floor(ad.duration / 60)}M${ad.duration % 60}S` : undefined,
    author: {
      '@type': 'Organization',
      name: ad.brand?.name || 'Unknown',
    },
    publisher: {
      '@type': 'Organization',
      name: 'TivoAds',
      url: 'https://tivoads.com',
    },
    keywords: ad.tags.map((t) => t.tag.name).join(', '),
    url: getAbsoluteUrl(`/ads/${ad.slug}`),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <AdDetailClient ad={ad} relatedAds={related} />
    </>
  );
}

export async function generateStaticParams() {
  try {
    const prisma = await getDb();
    const ads = await prisma.ad.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true },
      take: 1000,
    });
    return ads.map((ad) => ({ slug: ad.slug }));
  } catch (error) {
    // Return empty array during build step when Cloudflare D1 environment bindings are unavailable
    console.warn('generateStaticParams skipped DB query during static compilation phase.');
    return [];
  }
}