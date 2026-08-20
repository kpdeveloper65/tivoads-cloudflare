'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Youtube, ExternalLink, Play, Clock, Eye,
  Download, AlertTriangle, X, CheckCircle
} from 'lucide-react';
import { cn, formatDuration, formatNumber, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toaster';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  thumbnailUrl: string;
  publishedAt: string;
  durationSeconds: number;
  viewCount: number;
  embedUrl: string;
  watchUrl: string;
  source: 'youtube';
}

interface YouTubeResultCardProps {
  video: YouTubeVideo;
  searchQuery?: string;
  showImport?: boolean;
}

export function YouTubeResultCard({
  video,
  searchQuery,
  showImport = true,
}: YouTubeResultCardProps) {
  const { data: session } = useSession();
  const { success, error, info } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'duplicate' | 'error'>('idle');

  const isAdmin = session?.user.role === 'ADMIN' || session?.user.role === 'MODERATOR';

  const handleImport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session) {
      error('Sign in required', 'You must be signed in to import videos.');
      return;
    }
    if (!isAdmin) {
      info('Admin only', 'Only admins can import YouTube videos to the database.');
      return;
    }

    setIsImporting(true);
    try {
      const res = await fetch('/api/admin/youtube/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: video.id,
          title: video.title,
          channelTitle: video.channelTitle,
          thumbnailUrl: video.thumbnailUrl,
          publishedAt: video.publishedAt,
          durationSeconds: video.durationSeconds,
          description: video.description,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.duplicate) {
          setImportStatus('duplicate');
          info('Possible Duplicate', 'This video may already exist in the database. Check the admin queue.');
        } else {
          setImportStatus('success');
          success('Added to Import Queue!', 'The video has been added to the admin review queue.');
        }
      } else {
        setImportStatus('error');
        error('Import Failed', data.error || 'Could not add video to import queue.');
      }
    } catch {
      setImportStatus('error');
      error('Import Failed', 'An error occurred. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className={cn(
      'group relative rounded-2xl border bg-card overflow-hidden transition-all duration-300',
      'border-red-500/10 hover:border-red-500/30 hover:shadow-card-hover',
    )}>
      {/* YouTube Source Indicator */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-red-500 to-red-600 opacity-60" />

      {/* Thumbnail / Player */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {isPlaying ? (
          <iframe
            src={`${video.embedUrl}?autoplay=1&rel=0&modestbranding=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : (
          <>
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
              }}
            />

            {/* Play overlay */}
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors duration-300 cursor-pointer"
              onClick={() => setIsPlaying(true)}
            >
              <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
              </div>
            </div>

            {/* YouTube badge */}
            <div className="absolute top-2 left-2">
              <span className="badge badge-youtube backdrop-blur-sm">
                <Youtube className="w-3 h-3" /> YouTube
              </span>
            </div>

            {/* Duration */}
            {video.durationSeconds > 0 && (
              <span className="absolute bottom-2 right-2 ad-card-duration">
                {formatDuration(video.durationSeconds)}
              </span>
            )}
          </>
        )}

        {/* Close player button */}
        {isPlaying && (
          <button
            onClick={(e) => { e.stopPropagation(); setIsPlaying(false); }}
            className="absolute top-2 right-2 z-10 p-1 rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug mb-2 group-hover:text-red-500 transition-colors">
          {video.title}
        </h3>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1 truncate">
            <Youtube className="w-3 h-3 text-red-500 flex-shrink-0" />
            {video.channelTitle}
          </span>
          {video.viewCount > 0 && (
            <span className="flex items-center gap-1 flex-shrink-0">
              <Eye className="w-3 h-3" />
              {formatNumber(video.viewCount)}
            </span>
          )}
        </div>

        {video.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
            {video.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href={video.watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm border border-red-500/30 text-red-500 hover:bg-red-500/10 flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Watch on YouTube
          </a>

          {showImport && isAdmin && (
            <button
              onClick={handleImport}
              disabled={isImporting || importStatus === 'success'}
              className={cn(
                'btn btn-sm transition-colors',
                importStatus === 'success'
                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                  : importStatus === 'duplicate'
                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                    : 'btn-outline'
              )}
              title="Add to admin import queue"
            >
              {importStatus === 'success' ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : importStatus === 'duplicate' ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
