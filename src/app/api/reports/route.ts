import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { adId, reason } = await req.json();
    
    if (!adId || !reason) {
      return NextResponse.json({ error: 'adId and reason required' }, { status: 400 });
    }

    // Log as a simple search log for now (can extend to a reports table)
    await prisma.searchLog.create({
      data: {
        query: `REPORT:${adId}:${reason}`,
        resultCount: 0,
        source: 'report',
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Report failed' }, { status: 500 });
  }
}
