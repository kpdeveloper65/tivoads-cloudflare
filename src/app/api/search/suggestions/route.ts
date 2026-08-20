import { NextResponse } from 'next/server';
import { getSearchSuggestions } from '@/lib/search';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';

  if (!q || q.length < 2) {
    return NextResponse.json({ ads: [], brands: [], categories: [], tags: [] });
  }

  try {
    const suggestions = await getSearchSuggestions(q);
    return NextResponse.json(suggestions, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    return NextResponse.json({ ads: [], brands: [], categories: [], tags: [] });
  }
}
