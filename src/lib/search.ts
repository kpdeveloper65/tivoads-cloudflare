import { getDb } from './prisma';
import { Prisma } from '@prisma/client';

export interface SearchFilters {
  query?: string;
  category?: string;
  brand?: string;
  year?: number;
  minDuration?: number;
  maxDuration?: number;
  sourceType?: string;
  language?: string;
  sort?: 'newest' | 'oldest' | 'views' | 'favorites' | 'trending' | 'relevance';
  page?: number;
  limit?: number;
  tags?: string[];
}

export interface SearchResult {
  ads: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export async function searchAds(filters: SearchFilters): Promise<SearchResult> {
  const prisma = await getDb();
  const {
    query,
    category,
    brand,
    year,
    minDuration,
    maxDuration,
    sourceType,
    sort = 'relevance',
    page = 1,
    limit = 20,
    tags,
  } = filters;

  const skip = (page - 1) * limit;

  // Build WHERE conditions
  const where: Prisma.AdWhereInput = {
    status: 'PUBLISHED',
  };

  // Text search across multiple fields
  if (query && query.trim()) {
    const q = query.trim();
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { descriptionShort: { contains: q, mode: 'insensitive' } },
      { descriptionLong: { contains: q, mode: 'insensitive' } },
      { campaign: { contains: q, mode: 'insensitive' } },
      { slogan: { contains: q, mode: 'insensitive' } },
      { brand: { name: { contains: q, mode: 'insensitive' } } },
      { category: { name: { contains: q, mode: 'insensitive' } } },
      { tags: { some: { tag: { name: { contains: q, mode: 'insensitive' } } } } },
    ];
  }

  // Category filter
  if (category) {
    where.category = {
      OR: [
        { slug: category },
        { name: { equals: category, mode: 'insensitive' } },
      ],
    };
  }

  // Brand filter
  if (brand) {
    where.brand = {
      OR: [
        { slug: brand },
        { name: { equals: brand, mode: 'insensitive' } },
      ],
    };
  }

  // Year filter
  if (year) {
    where.year = year;
  }

  // Duration filters
  if (minDuration !== undefined || maxDuration !== undefined) {
    where.duration = {};
    if (minDuration !== undefined) where.duration.gte = minDuration;
    if (maxDuration !== undefined) where.duration.lte = maxDuration;
  }

  // Source type filter
  if (sourceType) {
    where.sourceType = sourceType.toUpperCase() as any;
  }

  // Tags filter
  if (tags && tags.length > 0) {
    where.tags = {
      some: {
        tag: {
          slug: { in: tags },
        },
      },
    };
  }

  // Build ORDER BY
  let orderBy: Prisma.AdOrderByWithRelationInput[] = [];
  switch (sort) {
    case 'newest':
      orderBy = [{ publishDate: 'desc' }, { createdAt: 'desc' }];
      break;
    case 'oldest':
      orderBy = [{ publishDate: 'asc' }, { createdAt: 'asc' }];
      break;
    case 'views':
      orderBy = [{ viewCount: 'desc' }];
      break;
    case 'favorites':
      orderBy = [{ favoriteCount: 'desc' }];
      break;
    case 'trending':
      orderBy = [{ trendingScore: 'desc' }, { viewCount: 'desc' }];
      break;
    case 'relevance':
    default:
      if (query) {
        // For relevance, prioritize featured, then trending, then views
        orderBy = [{ isFeatured: 'desc' }, { trendingScore: 'desc' }, { viewCount: 'desc' }];
      } else {
        orderBy = [{ createdAt: 'desc' }];
      }
      break;
  }

  const [ads, total] = await Promise.all([
    prisma.ad.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
        category: { select: { id: true, name: true, slug: true, color: true, icon: true } },
        tags: {
          include: {
            tag: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    }),
    prisma.ad.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    ads,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export async function getSearchSuggestions(query: string): Promise<{
  ads: Array<{ id: string; title: string; slug: string; thumbnailUrl: string | null }>;
  brands: Array<{ id: string; name: string; slug: string }>;
  categories: Array<{ id: string; name: string; slug: string }>;
  tags: Array<{ id: string; name: string; slug: string }>;
}> {
  if (!query || query.length < 2) {
    return { ads: [], brands: [], categories: [], tags: [] };
  }

  const prisma = await getDb();
  const q = query.trim();

  const [ads, brands, categories, tags] = await Promise.all([
    prisma.ad.findMany({
      where: {
        status: 'PUBLISHED',
        title: { contains: q, mode: 'insensitive' },
      },
      select: { id: true, title: true, slug: true, thumbnailUrl: true },
      take: 5,
      orderBy: { viewCount: 'desc' },
    }),
    prisma.brand.findMany({
      where: {
        isActive: true,
        name: { contains: q, mode: 'insensitive' },
      },
      select: { id: true, name: true, slug: true },
      take: 3,
    }),
    prisma.category.findMany({
      where: {
        isActive: true,
        name: { contains: q, mode: 'insensitive' },
      },
      select: { id: true, name: true, slug: true },
      take: 3,
    }),
    prisma.tag.findMany({
      where: {
        name: { contains: q, mode: 'insensitive' },
      },
      select: { id: true, name: true, slug: true },
      take: 3,
    }),
  ]);

  return { ads, brands, categories, tags };
}

export async function logSearch(
  query: string,
  resultCount: number,
  source: string = 'internal',
  userId?: string
): Promise<void> {
  try {
    const prisma = await getDb();
    await prisma.searchLog.create({
      data: {
        query,
        resultCount,
        source,
        userId,
      },
    });
  } catch (error) {
    // Don't fail the search if logging fails
    console.error('Search logging error:', error);
  }
}