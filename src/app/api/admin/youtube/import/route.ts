import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { calculateSimilarity } from '@/lib/utils';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { videoId, title, channelTitle, thumbnailUrl, publishedAt, durationSeconds, description } = body;

    if (!videoId || !title) {
      return NextResponse.json({ error: 'videoId and title required' }, { status: 400 });
    }

    // Check for existing candidate
    const existing = await prisma.youTubeCandidate.findUnique({
      where: { videoId },
    });

    // Check for possible duplicate in main DB (Removed mode: 'insensitive' for Cloudflare D1 / SQLite compatibility)
    const possibleDuplicate = await prisma.ad.findFirst({
      where: {
        OR: [
          { externalVideoId: videoId },
          {
            title: {
              contains: title.slice(0, 30),
            },
          },
        ],
        status: 'PUBLISHED',
      },
    });

    if (possibleDuplicate) {
      const score = calculateSimilarity(possibleDuplicate.title, title);
      
      // If very similar, flag as duplicate
      if (score > 0.7) {
        if (existing) {
          await prisma.youTubeCandidate.update({
            where: { id: existing.id },
            data: {
              possibleDuplicateId: possibleDuplicate.id,
              duplicateScore: score,
            },
          });
        }
        return NextResponse.json({
          duplicate: true,
          message: 'Possible duplicate detected',
          existingId: possibleDuplicate.id,
          score,
        });
      }
    }

    // Create or update candidate
    const candidate = await prisma.youTubeCandidate.upsert({
      where: { videoId },
      create: {
        videoId,
        title,
        channelName: channelTitle,
        description: description?.slice(0, 1000),
        thumbnailUrl,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        durationSeconds,
        status: 'CANDIDATE',
        possibleDuplicateId: possibleDuplicate?.id,
      },
      update: {
        status: 'CANDIDATE',
      },
    });

    return NextResponse.json({
      success: true,
      candidateId: candidate.id,
      duplicate: false,
    });
  } catch (error) {
    console.error('YouTube import error:', error);
    return NextResponse.json({ error: 'Failed to add to queue' }, { status: 500 });
  }
}