import { NextResponse } from 'next/server';
import { searchYouTube } from '@/lib/youtube';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const maxResults = Math.min(parseInt(searchParams.get('limit') || '12'), 24);
  const pageToken = searchParams.get('pageToken') || undefined;

  if (!q) {
    return NextResponse.json({ videos: [], totalResults: 0, error: 'Query required' });
  }

  try {
    // 1. Check cache
    const queryHash = Buffer.from(q.toLowerCase().trim() + maxResults).toString('base64');
    const cached = await prisma.youTubeCache.findUnique({
      where: { queryHash },
    });

    if (cached && cached.expiresAt > new Date()) {
      return NextResponse.json({
        ...(cached.results as any),
        cached: true,
      });
    }

    // 2. Fetch from YouTube
    const result = await searchYouTube(q, { maxResults, pageToken });

    // Guard rail: If YouTube returned an error or structure is invalid, exit early safely
    if (!result || !result.videos) {
      return NextResponse.json({ videos: [], totalResults: 0, error: 'Invalid response from YouTube' }, { status: 502 });
    }

    // 3. Cache the result
    const cacheHours = 6;
    const expiresAt = new Date(Date.now() + cacheHours * 3600 * 1000);

    await prisma.youTubeCache.upsert({
      where: { queryHash },
      create: {
        query: q,
        queryHash,
        results: result as any,
        resultCount: result.videos.length,
        expiresAt,
      },
      update: {
        results: result as any,
        resultCount: result.videos.length,
        cachedAt: new Date(),
        expiresAt,
      },
    }).catch((err) => console.error('Cache upsert failed background error:', err));

    // 4. Store candidates for admin review concurrently using Promise.all
    if (result.videos.length > 0) {
      const candidatePromises = result.videos.slice(0, 5).map(async (video) => {
        try {
          const existing = await prisma.youTubeCandidate.findUnique({
            where: { videoId: video.id },
          });

          if (!existing) {
            // Check for possible duplicates in internal DB
            const possibleDuplicate = await prisma.ad.findFirst({
              where: {
                AND: [
                  { status: 'PUBLISHED' },
                  {
                    OR: [
                      { externalVideoId: video.id },
                      { title: { contains: video.title.slice(0, 30) } },
                    ],
                  },
                ],
              },
            });

            // Note: SQLite / Cloudflare D1 stores numbers natively, so we pass Number instead of BigInt
            await prisma.youTubeCandidate.create({
              data: {
                videoId: video.id,
                title: video.title,
                channelName: video.channelTitle,
                channelId: video.channelId,
                description: video.description,
                thumbnailUrl: video.thumbnailUrl,
                publishedAt: video.publishedAt ? new Date(video.publishedAt) : null,
                durationSeconds: video.durationSeconds,
                viewCount: Number(video.viewCount || 0), 
                rawData: video as any,
                status: 'CANDIDATE',
                possibleDuplicateId: possibleDuplicate?.id,
                duplicateScore: possibleDuplicate ? 0.8 : undefined,
              },
            });
          }
        } catch (innerError) {
          console.error('Failed to process individual candidate video:', innerError);
        }
      });

      Promise.all(candidatePromises).catch((err) => console.error('Promise.all candidates error:', err));
    }

    // 5. Return JSON payload safely (BigInt safely converted to string/number for SQLite/D1 compatibility)
    const sanitizedResult = JSON.parse(
      JSON.stringify(result, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );

    return NextResponse.json(sanitizedResult, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });

  } catch (error: any) {
    console.error('YouTube search API error:', error);
    
    if (error?.message?.includes('API key not valid')) {
      return NextResponse.json(
        { videos: [], totalResults: 0, error: 'Upstream authentication configuration error.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { videos: [], totalResults: 0, error: 'YouTube search failed' },
      { status: 500 }
    );
  }
}