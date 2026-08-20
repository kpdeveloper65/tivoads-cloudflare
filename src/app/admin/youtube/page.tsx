import type { Metadata } from 'next';
import Link from 'next/link';
import { Youtube, Download, CheckCircle, XCircle, AlertTriangle, Eye, ExternalLink } from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatDate, formatDuration, formatNumber } from '@/lib/utils';
import { YouTubeAdminActions } from './YouTubeAdminActions';

export const metadata: Metadata = {
  title: 'YouTube Queue — Admin',
  robots: { index: false },
};

interface YouTubeQueueProps {
  searchParams: { status?: string; page?: string };
}

const PAGE_SIZE = 20;

export default async function YouTubeQueuePage({ searchParams }: YouTubeQueueProps) {
  const status = searchParams.status || 'CANDIDATE';
  const page = parseInt(searchParams.page || '1');
  const skip = (page - 1) * PAGE_SIZE;

  const [candidates, total, counts] = await Promise.all([
    prisma.youTubeCandidate.findMany({
      where: { status },
      orderBy: { discoveredAt: 'desc' },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.youTubeCandidate.count({ where: { status } }),
    prisma.youTubeCandidate.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
  ]);

  const statusCounts = counts.reduce((acc, c) => ({
    ...acc,
    [c.status]: c._count.status,
  }), {} as Record<string, number>);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Youtube className="w-6 h-6 text-red-500" />
          YouTube Discovery Queue
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Review videos discovered via YouTube and import them to the database
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { value: 'CANDIDATE', label: 'Candidates' },
          { value: 'IMPORTED', label: 'Imported' },
          { value: 'REJECTED', label: 'Rejected' },
          { value: 'DUPLICATE', label: 'Duplicates' },
        ].map(({ value, label }) => (
          <Link
            key={value}
            href={`/admin/youtube?status=${value}`}
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

      {/* Candidates grid */}
      {candidates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-200"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-dark-900">
                {candidate.thumbnailUrl ? (
                  <img
                    src={candidate.thumbnailUrl}
                    alt={candidate.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Youtube className="w-8 h-8 text-white/20" />
                  </div>
                )}

                {/* Duration */}
                {candidate.durationSeconds && (
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                    {formatDuration(candidate.durationSeconds)}
                  </span>
                )}

                {/* Duplicate flag */}
                {candidate.possibleDuplicateId && (
                  <div className="absolute top-2 left-2 badge bg-amber-500/20 text-amber-400">
                    <AlertTriangle className="w-3 h-3" />
                    Possible Duplicate
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-sm font-medium text-white/80 line-clamp-2 mb-1">
                  {candidate.title}
                </h3>
                <p className="text-xs text-white/40 mb-3">
                  {candidate.channelName}
                  {candidate.viewCount && ` · ${formatNumber(Number(candidate.viewCount))} views`}
                </p>

                {/* Actions */}
                {status === 'CANDIDATE' && (
                  <YouTubeAdminActions candidateId={candidate.id} videoId={candidate.videoId} title={candidate.title} />
                )}

                {status === 'IMPORTED' && candidate.importedAdId && (
                  <Link
                    href={`/admin/ads/${candidate.importedAdId}`}
                    className="btn btn-sm bg-emerald-500/20 text-emerald-400 w-full"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    View Imported Ad
                  </Link>
                )}

                {status === 'REJECTED' && (
                  <p className="text-xs text-white/30 text-center">Rejected</p>
                )}

                <div className="mt-2 flex justify-center">
                  <a
                    href={`https://youtube.com/watch?v=${candidate.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Watch on YouTube
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Youtube className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/30">No {status.toLowerCase()} videos in the queue.</p>
          {status === 'CANDIDATE' && (
            <p className="text-white/20 text-sm mt-2">
              YouTube videos appear here when users search and results are submitted for review.
            </p>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {page > 1 && (
            <Link href={`/admin/youtube?status=${status}&page=${page - 1}`} className="btn btn-sm border border-white/10 text-white hover:bg-white/10">← Prev</Link>
          )}
          <span className="text-sm text-white/30">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={`/admin/youtube?status=${status}&page=${page + 1}`} className="btn btn-sm border border-white/10 text-white hover:bg-white/10">Next →</Link>
          )}
        </div>
      )}
    </div>
  );
}
