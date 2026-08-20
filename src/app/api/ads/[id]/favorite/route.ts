import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface Params { params: { id: string } }

export async function POST(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await prisma.favorite.create({
      data: { userId: session.user.id, adId: params.id },
    });

    await prisma.ad.update({
      where: { id: params.id },
      data: { favoriteCount: { increment: 1 } },
    });

    return NextResponse.json({ favorited: true });
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Already favorited
      return NextResponse.json({ favorited: true, message: 'Already saved' });
    }
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await prisma.favorite.deleteMany({
      where: { userId: session.user.id, adId: params.id },
    });

    await prisma.ad.update({
      where: { id: params.id },
      data: { favoriteCount: { decrement: 1 } },
    });

    return NextResponse.json({ favorited: false });
  } catch {
    return NextResponse.json({ error: 'Failed to remove' }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ favorited: false });

  const fav = await prisma.favorite.findUnique({
    where: { userId_adId: { userId: session.user.id, adId: params.id } },
  });

  return NextResponse.json({ favorited: !!fav });
}
