import { NextResponse } from 'next/server';
import { searchAds, logSearch } from '@/lib/search';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const query = searchParams.get('q') || undefined;
  const category = searchParams.get('category') || undefined;
  const brand = searchParams.get('brand') || undefined;
  const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
  const sort = (searchParams.get('sort') as any) || 'relevance';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const source = searchParams.get('source') || undefined;
  const minDuration = searchParams.get('minDuration') ? parseInt(searchParams.get('minDuration')!) : undefined;
  const maxDuration = searchParams.get('maxDuration') ? parseInt(searchParams.get('maxDuration')!) : undefined;
  const tag = searchParams.get('tag') || undefined;

  try {
    // 1. Fetch main search results using your helper function
    const result = await searchAds({
      query,
      category,
      brand,
      year,
      sort,
      page,
      limit,
      sourceType: source,
      minDuration,
      maxDuration,
      tags: tag ? [tag] : undefined,
    });

    let categories: any[] = [];
    let brands: any[] = [];

    // 2. Fetch sidebar filters safely based on whether a query exists
    if (query) {
      // Optimized Category Facets for Active Searches (Removed mode: 'insensitive' for Cloudflare D1 / SQLite compatibility)
      categories = await prisma.category.findMany({
        where: {
          isActive: true,
          ads: {
            some: {
              status: 'PUBLISHED',
              title: { contains: query },
            },
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        take: 30, // Safeguard to prevent oversized payload processing
      });

      // Optimized Brand Facets for Active Searches (Removed mode: 'insensitive' for Cloudflare D1 / SQLite compatibility)
      brands = await prisma.brand.findMany({
        where: {
          isActive: true,
          ads: {
            some: {
              status: 'PUBLISHED',
              title: { contains: query },
            },
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        take: 15,
      });
    } else {
      // Static Fallback Facets when no search query is present
      categories = await prisma.category.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        take: 50,
      });

      brands = await prisma.brand.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        take: 20,
      });
    }

    // 3. Log search in the background (Non-blocking)
    if (query) {
      getServerSession(authOptions)
        .then((session) => {
          logSearch(query, result.total, 'internal', session?.user?.id).catch(console.error);
        })
        .catch(() => {
          logSearch(query, result.total, 'internal').catch(console.error);
        });
    }

    return NextResponse.json({
      ...result,
      categories,
      brands,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}