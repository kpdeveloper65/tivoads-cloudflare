'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Heart, Share2, Bookmark, Flag, ExternalLink, Play,
  Calendar, Clock, Eye, Tag, Building2, Grid3x3,
  Youtube, ChevronRight, Plus, CheckCircle, X
} from 'lucide-react';
import { cn, formatDuration, formatNumber, formatDate, truncate } from '@/lib/utils';
import { AdCard } from '@/components/ads/AdCard';
import { useToast } from '@/components/ui/Toaster';

interface AdDetailProps {
  ad: {
    id: string;
    slug: string;
    title: string;
    brand?: { id: string; name: string; slug: string; logoUrl?: string | null; description?: string | null } | null;
    category?: { id: string; name: string; slug: string; color?: string | null } | null;
    descriptionShort?: string | null;
    descriptionLong?: string | null;
    campaign?: string | null;
    slogan?: string | null;
    embedUrl?: string | null;
    thumbnailUrl?: string | null;
    duration?: number | null;
    year?: number | null;
    publishDate?: Date | null;
    sourceType: string;
    sourcePlatform?: string | null;
    externalVideoId?: string | null;
    externalChannelName?: string | null;
    viewCount: number;
    favoriteCount: number;
    tags: Array<{ tag: { id: string; name: string; slug: string } }>;
    createdAt: Date;
  };
  relatedAds: any[];
}

export function AdDetailClient({ ad, relatedAds }: AdDetailProps) {
  const { data: session } = useSession();
  const { success, error, info } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(ad.favoriteCount);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const isYouTube = ad.sourceType === 'YOUTUBE' || ad.sourcePlatform === 'youtube';

  const handleFavorite = async () => {
    if (!session) {
      error('Sign in required', 'Please sign in to save ads to your favorites.');
      return;
    }
    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const res = await fetch(`/api/ads/${ad.id}/favorite`, { method });
      if (res.ok) {
        const newState = !isFavorited;
        setIsFavorited(newState);
        setFavoriteCount((prev) => newState ? prev + 1 : prev - 1);
        success(newState ? 'Saved!' : 'Removed', newState ? 'Added to your favorites.' : 'Removed from favorites.');
      }
    } catch {
      error('Error', 'Could not update favorites.');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: ad.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        success('Copied!', 'Link copied to clipboard.');
      }
    } catch {}
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId: ad.id, reason: reportReason }),
      });
      setIsReportOpen(false);
      info('Report submitted', 'Thank you for helping us maintain quality.');
    } catch {
      error('Error', 'Could not submit report. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="section-container py-3">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/ads" className="hover:text-foreground transition-colors">Ads</Link>
            {ad.category && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link href={`/categories/${ad.category.slug}`} className="hover:text-foreground transition-colors">
                  {ad.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground truncate max-w-xs">{truncate(ad.title, 40)}</span>
          </nav>
        </div>
      </div>

      <div className="section-container py-8">
        <div className="flex gap-8 flex-col lg:flex-row">
          {/* ============================================================
              MAIN CONTENT
          ============================================================ */}
          <div className="flex-1 min-w-0">
            {/* Video Player */}
            <div className="rounded-2xl overflow-hidden bg-black shadow-2xl mb-6">
              {ad.embedUrl ? (
                <div className="video-container">
                  {isVideoLoaded ? (
                    <iframe
                      src={ad.embedUrl}
                      title={ad.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="border-0"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                      onClick={() => setIsVideoLoaded(true)}
                    >
                      {ad.thumbnailUrl && (
                        <img
                          src={ad.thumbnailUrl}
                          alt={ad.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                      <button
                        className="relative z-10 flex items-center gap-3 bg-brand-500/90 hover:bg-brand-500 text-white rounded-2xl px-6 py-4 shadow-xl transition-all duration-300 group-hover:scale-105"
                        aria-label="Play video"
                      >
                        <Play className="w-8 h-8" fill="white" />
                        <span className="text-lg font-semibold">Play Ad</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video flex items-center justify-center bg-dark-900">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-brand-400 mx-auto mb-3" />
                    <p className="text-white/50">Video not available</p>
                    {ad.externalVideoId && (
                      <a
                        href={`https://youtube.com/watch?v=${ad.externalVideoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-primary mt-4"
                      >
                        <Youtube className="w-4 h-4" />
                        Watch on YouTube
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Source labels */}
            {isYouTube && (
              <div className="flex items-center gap-2 mb-4">
                <span className="badge badge-youtube">
                  <Youtube className="w-3 h-3" /> Sourced from YouTube
                </span>
                {ad.externalChannelName && (
                  <span className="text-sm text-muted-foreground">
                    Channel: {ad.externalChannelName}
                  </span>
                )}
              </div>
            )}

            {/* Title & Actions */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight flex-1">
                {ad.title}
              </h1>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleFavorite}
                  className={cn(
                    'btn btn-md transition-all',
                    isFavorited
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'btn-outline hover:border-red-500/30 hover:text-red-500'
                  )}
                  aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={cn('w-4 h-4', isFavorited && 'fill-current')} />
                  <span className="hidden sm:inline">
                    {isFavorited ? 'Saved' : 'Save'}
                  </span>
                  {favoriteCount > 0 && (
                    <span className="ml-1 text-xs opacity-70">({formatNumber(favoriteCount)})</span>
                  )}
                </button>
                <button onClick={handleShare} className="btn btn-md btn-outline" aria-label="Share">
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
              {ad.brand && (
                <Link href={`/brands/${ad.brand.slug}`} className="flex items-center gap-1.5 hover:text-brand-500 transition-colors">
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="font-medium text-foreground">{ad.brand.name}</span>
                </Link>
              )}
              {ad.category && (
                <Link href={`/categories/${ad.category.slug}`} className="flex items-center gap-1.5 hover:text-brand-500 transition-colors">
                  <Grid3x3 className="w-3.5 h-3.5" />
                  {ad.category.name}
                </Link>
              )}
              {ad.duration && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDuration(ad.duration)}
                </span>
              )}
              {/*{ad.year && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {ad.year}
                </span>
              )}*/}
              {ad.viewCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  {formatNumber(ad.viewCount)} views
                </span>
              )}
            </div>

            {/* Campaign / Slogan */}
            {(ad.campaign || ad.slogan) && (
              <div className="rounded-2xl border border-brand-500/20 bg-brand-500/5 p-5 mb-6">
                {ad.campaign && (
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">Campaign</span>
                    <p className="text-foreground font-medium mt-0.5">{ad.campaign}</p>
                  </div>
                )}
                {ad.slogan && (
                  <div>
                    <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">Tagline / Slogan</span>
                    <p className="text-foreground italic text-lg mt-0.5">&ldquo;{ad.slogan}&rdquo;</p>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {(ad.descriptionShort || ad.descriptionLong) && (
              <div className="mb-6">
                <h2 className="text-base font-semibold text-foreground mb-3">About This Ad</h2>
                {ad.descriptionShort && (
                  <p className="text-muted-foreground leading-relaxed mb-3">{ad.descriptionShort}</p>
                )}
                {ad.descriptionLong && (
                  <>
                    <div
                      className={cn(
                        'text-muted-foreground leading-relaxed text-sm',
                        !showFullDesc && 'line-clamp-4'
                      )}
                    >
                      {ad.descriptionLong}
                    </div>
                    {ad.descriptionLong.length > 400 && (
                      <button
                        onClick={() => setShowFullDesc(!showFullDesc)}
                        className="text-sm text-brand-500 hover:text-brand-600 mt-2 font-medium"
                      >
                        {showFullDesc ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Tags */}
            {ad.tags.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {ad.tags.map(({ tag }) => (
                    <Link
                      key={tag.id}
                      href={`/search?tag=${tag.slug}`}
                      className="badge bg-secondary text-secondary-foreground hover:bg-brand-500/10 hover:text-brand-600 transition-colors"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Report button */}
            <div className="flex items-center justify-between py-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Found an issue with this listing?
              </p>
              <button
                onClick={() => setIsReportOpen(true)}
                className="btn btn-ghost btn-sm text-muted-foreground hover:text-red-500"
              >
                <Flag className="w-3.5 h-3.5" />
                Report Issue
              </button>
            </div>
          </div>

          {/* ============================================================
              SIDEBAR
          ============================================================ */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            {/* Brand card */}
            {ad.brand && (
              <div className="rounded-2xl border border-border bg-card p-5 mb-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">About the Brand</h3>
                <div className="flex items-center gap-3 mb-3">
                  {ad.brand.logoUrl ? (
                    <img
                      src={ad.brand.logoUrl}
                      alt={ad.brand.name}
                      className="w-12 h-12 rounded-xl object-contain bg-muted"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-brand-500">{ad.brand.name[0]}</span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-foreground">{ad.brand.name}</p>
                  </div>
                </div>
                {ad.brand.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{ad.brand.description}</p>
                )}
                <Link
                  href={`/brands/${ad.brand.slug}`}
                  className="btn btn-outline btn-sm w-full"
                >
                  View all {ad.brand.name} ads
                </Link>
              </div>
            )}

            {/* Quick info */}
            <div className="rounded-2xl border border-border bg-card p-5 mb-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Ad Details</h3>
              <dl className="space-y-3">
                {[
                  { label: 'Category', value: ad.category?.name, href: ad.category ? `/categories/${ad.category.slug}` : undefined },
                  { label: 'Duration', value: ad.duration ? formatDuration(ad.duration) : null },
                  // { label: 'Year', value: ad.year?.toString() },
                  { label: 'Source', value: ad.sourceType },
                  { label: 'Added', value: formatDate(ad.createdAt) },
                ].filter(item => item.value).map(({ label, value, href }) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="text-xs font-medium text-foreground text-right">
                      {href ? (
                        <Link href={href} className="hover:text-brand-500 transition-colors">
                          {value}
                        </Link>
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* External links */}
            {ad.externalVideoId && (
              <div className="mb-5">
                <a
                  href={`https://youtube.com/watch?v=${ad.externalVideoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-md border border-red-500/30 text-red-500 hover:bg-red-500/10 w-full"
                >
                  <Youtube className="w-4 h-4" />
                  Watch on YouTube
                  <ExternalLink className="w-3.5 h-3.5 ml-auto" />
                </a>
              </div>
            )}

            {/* Collections CTA */}
            {session && (
              <div className="rounded-2xl border border-dashed border-border p-4 mb-5">
                <p className="text-sm text-muted-foreground mb-3">Save to a collection</p>
                <Link href="/account/collections" className="btn btn-outline btn-sm w-full">
                  <Bookmark className="w-4 h-4" />
                  Add to Collection
                </Link>
              </div>
            )}
          </aside>
        </div>

        {/* ============================================================
            RELATED ADS
        ============================================================ */}
        {relatedAds.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="heading-4 text-foreground mb-6">Related Ads</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {relatedAds.map((relAd) => (
                <AdCard key={relAd.id} ad={relAd} variant="default" showStats={false} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsReportOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Report an Issue</h3>
              <button onClick={() => setIsReportOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleReport}>
              <div className="mb-4">
                <label className="label mb-1.5 block">Reason</label>
                <select
                  className="input-base"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                >
                  <option value="">Select reason...</option>
                  <option value="broken_video">Broken video</option>
                  <option value="wrong_info">Incorrect information</option>
                  <option value="duplicate">Duplicate entry</option>
                  <option value="copyright">Copyright issue</option>
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsReportOpen(false)} className="btn btn-outline btn-md flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-md flex-1">
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
