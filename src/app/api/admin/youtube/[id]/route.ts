import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/utils';

interface Params { params: { id: string } }

export async function PATCH(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { action } = await req.json();

  const candidate = await prisma.youTubeCandidate.findUnique({
    where: { id: params.id },
  });

  if (!candidate) {
    return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
  }

  if (action === 'reject') {
    await prisma.youTubeCandidate.update({
      where: { id: params.id },
      data: {
        status: 'REJECTED',
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      },
    });
    return NextResponse.json({ status: 'REJECTED' });
  }

  if (action === 'import') {
    // Create ad from YouTube candidate
    let baseSlug = slugify(candidate.title).slice(0, 90);
    let slug = baseSlug;
    let attempt = 0;
    while (await prisma.ad.findUnique({ where: { slug } })) {
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    const ad = await prisma.ad.create({
      data: {
        slug,
        title: candidate.title,
        descriptionShort: candidate.description?.slice(0, 500) || null,
        embedUrl: `https://www.youtube.com/embed/${candidate.videoId}`,
        videoUrl: `https://youtube.com/watch?v=${candidate.videoId}`,
        thumbnailUrl: candidate.thumbnailUrl,
        externalVideoId: candidate.videoId,
        externalChannelId: candidate.channelId,
        externalChannelName: candidate.channelName,
        publishDate: candidate.publishedAt,
        // D1/SQLite doesn't support BigInt, ensuring duration is a standard Number
        duration: candidate.durationSeconds ? Number(candidate.durationSeconds) : null,
        sourceType: 'YOUTUBE',
        sourcePlatform: 'youtube',
        status: 'PENDING', // Requires admin review before publishing
      },
    });

    await prisma.youTubeCandidate.update({
      where: { id: params.id },
      data: {
        status: 'IMPORTED',
        importedAdId: ad.id,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({ status: 'IMPORTED', adId: ad.id });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}