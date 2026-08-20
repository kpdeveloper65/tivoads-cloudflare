import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const submissionSchema = z.object({
  title: z.string().min(1).max(300),
  brandName: z.string().max(200).optional(),
  categoryName: z.string().max(200).optional(),
  videoUrl: z.string().url(),
  notes: z.string().max(2000).optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  submittedBy: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = submissionSchema.parse(body);

    const submission = await prisma.submission.create({
      data: {
        title: data.title,
        brandName: data.brandName,
        categoryName: data.categoryName,
        videoUrl: data.videoUrl,
        notes: data.notes,
        contactEmail: data.contactEmail || null,
        submittedBy: data.submittedBy || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ id: submission.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Submission error:', error);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'PENDING';

  const submissions = await prisma.submission.findMany({
    where: { status: status as any },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json(submissions);
}
