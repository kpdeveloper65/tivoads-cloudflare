import type { Metadata } from 'next';
import Link from 'next/link';
import { Send, CheckCircle, XCircle, Eye } from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { SubmissionActions } from './SubmissionActions';

export const metadata: Metadata = {
  title: 'Submissions — Admin',
  robots: { index: false },
};

interface SubmissionsPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function SubmissionsPage({ searchParams }: SubmissionsPageProps) {
  const resolvedSearchParams = await searchParams;
  const status = resolvedSearchParams.status || 'PENDING';

  const [submissions, counts] = await Promise.all([
    prisma.submission.findMany({
      where: { status: status as any },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.submission.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
  ]);

  const statusCounts = counts.reduce((acc, c) => ({
    ...acc,
    [c.status]: c._count.status,
  }), {} as Record<string, number>);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Send className="w-6 h-6 text-brand-500" />
          Ad Submissions
        </h1>
        <p className="text-white/40 text-sm mt-1">User-submitted ads awaiting review</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { value: 'PENDING', label: 'Pending' },
          { value: 'APPROVED', label: 'Approved' },
          { value: 'REJECTED', label: 'Rejected' },
          { value: 'DUPLICATE', label: 'Duplicate' },
        ].map(({ value, label }) => (
          <Link
            key={value}
            href={`/admin/submissions?status=${value}`}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              status === value ? 'bg-brand-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            {label}
            <span className="bg-black/30 text-xs px-1.5 py-0.5 rounded-full">
              {statusCounts[value] || 0}
            </span>
          </Link>
        ))}
      </div>

      {/* Submissions list */}
      <div className="space-y-4">
        {submissions.map((sub) => (
          <div
            key={sub.id}
            className="rounded-2xl bg-white/5 border border-white/10 p-5 hover:border-white/20 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white mb-1">{sub.title}</h3>
                <div className="flex flex-wrap gap-3 text-sm text-white/40 mb-2">
                  {sub.brandName && (
                    <span className="flex items-center gap-1">Brand: <strong className="text-white/60">{sub.brandName}</strong></span>
                  )}
                  {sub.categoryName && (
                    <span className="flex items-center gap-1">Category: <strong className="text-white/60">{sub.categoryName}</strong></span>
                  )}
                </div>
                <a
                  href={sub.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-400 hover:text-brand-300 truncate block max-w-sm"
                >
                  {sub.videoUrl}
                </a>
                {sub.notes && (
                  <p className="text-sm text-white/40 mt-2 italic">&ldquo;{sub.notes}&rdquo;</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-xs text-white/30">
                  {sub.user ? (
                    <span>By: {sub.user.name || sub.user.email}</span>
                  ) : sub.contactEmail ? (
                    <span>Email: {sub.contactEmail}</span>
                  ) : (
                    <span>Anonymous</span>
                  )}
                  <span>{formatDate(sub.createdAt)}</span>
                </div>
              </div>

              {sub.status === 'PENDING' && (
                <SubmissionActions submissionId={sub.id} videoUrl={sub.videoUrl} title={sub.title} />
              )}

              {sub.status !== 'PENDING' && (
                <span className={`badge text-xs flex-shrink-0 ${
                  sub.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' :
                  sub.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                  'bg-white/10 text-white/40'
                }`}>
                  {sub.status}
                </span>
              )}
            </div>
          </div>
        ))}

        {submissions.length === 0 && (
          <div className="text-center py-16">
            <Send className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/30">No {status.toLowerCase()} submissions.</p>
          </div>
        )}
      </div>
    </div>
  );
}