'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import {
  Heart, Bookmark, Share2, Play, ExternalLink,
  Clock, Eye, Calendar, Youtube
} from 'lucide-react';
import { cn, formatDuration, formatNumber, formatDate, truncate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toaster';

export interface AdCardData {
  id: string;
  slug: string;
  title: string;
  descriptionShort?: string | null;
  thumbnailUrl?: string | null;
  duration?: number | null;
  year?: number | null;
  viewCount?: number;
  favoriteCount?: number;
  sourceType?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  publishDate?: Date | string | null;
  brand?: { name: string; slug: string; logoUrl?: string | null } | null;
  category?: { name: string; slug: string; color?: string | null } | null;
  tags?: Array<{ tag: { name: string; slug: string } }>;
}

interface AdCardProps {
  ad: AdCardData;
  priority?: boolean;
  showBrand?: boolean;
  showCategory?: boolean;
  showStats?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'wide' | 'featured';
}

export function AdCard({
  ad,
  priority = false,
  showBrand = true,
  showCategory = true,
  showStats = true,
  className,
  variant = 'default',
}: AdCardProps) {
  const { data: session } = useSession();
  const { success, error } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(ad.favoriteCount || 0);
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isYouTube = ad.sourceType === 'YOUTUBE';
  const thumbnail = imgError ? null : ad.thumbnailUrl;

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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
        success(
          newState ? 'Saved to favorites!' : 'Removed from favorites',
          newState ? `"${truncate(ad.title, 40)}" added to your saved ads.` : undefined
        );
      }
    } catch (err) {
      error('Error', 'Could not update favorites. Please try again.');
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/ads/${ad.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: ad.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        success('Link copied!', 'Ad link has been copied to clipboard.');
      }
    } catch {
      // User cancelled share
    }
  };

  if (variant === 'compact') {
    return (
      <Link href={`/ads/${ad.slug}`} className={cn('group flex gap-3 rounded-xl p-2 hover:bg-accent transition-colors', className)}>
        <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={ad.title}
              fill
              sizes="96px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImgError(true)}
              loading="lazy"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-500/20 to-brand-900/20">
              <Play className="w-4 h-4 text-brand-400" />
            </div>
          )}
          {ad.duration && (
            <span className="absolute bottom-1 right-1 text-[10px] font-medium bg-black/70 text-white px-1 py-0.5 rounded">
              {formatDuration(ad.duration)}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-brand-500 transition-colors">
            {ad.title}
          </h3>
          {ad.brand && (
            <p className="text-xs text-muted-foreground mt-0.5">{ad.brand.name}</p>
          )}
        </div>
      </Link>
    );
  }

  if (variant === 'wide') {
    return (
      <Link
        href={`/ads/${ad.slug}`}
        className={cn(
          'group flex flex-col sm:flex-row gap-4 rounded-2xl border border-border bg-card p-4 hover:border-brand-500/30 hover:shadow-card-hover transition-all duration-300',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Thumbnail container */}
        <div className="relative w-full sm:w-64 aspect-video sm:aspect-16/10 rounded-xl overflow-hidden bg-muted flex-shrink-0">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={ad.title}
              fill
              sizes="(max-width: 640px) 100vw, 256px"
              priority={priority}
              unoptimized
              className={cn(
                'object-cover transition-transform duration-500',
                isHovered ? 'scale-105' : 'scale-100'
              )}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-800 to-dark-950">
              <Play className="w-8 h-8 text-brand-400" />
            </div>
          )}

          {/* Play Overlay */}
          <div className={cn(
            'absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}>
            <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center shadow-md">
              <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
            </div>
          </div>

          {/* Badges / Duration */}
          <div className="absolute top-2 left-2 flex gap-1">
            {isYouTube && (
              <span className="badge badge-youtube backdrop-blur-sm text-[10px] px-1.5 py-0.5">
                <Youtube className="w-3 h-3 inline mr-0.5" /> YT
              </span>
            )}
          </div>

          {ad.duration && (
            <span className="absolute bottom-2 right-2 text-xs font-medium bg-black/70 text-white px-1.5 py-0.5 rounded">
              {formatDuration(ad.duration)}
            </span>
          )}
        </div>

        {/* Content details */}
        <div className="flex flex-col justify-between flex-1 min-w-0 py-1">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
              {showCategory && ad.category && (
                <span
                  className="badge text-xs font-medium"
                  style={{
                    backgroundColor: `${ad.category.color}20` || 'rgba(249,115,22,0.1)',
                    color: ad.category.color || '#f97316',
                  }}
                >
                  {ad.category.name}
                </span>
              )}
              {showBrand && ad.brand && (
                <span className="text-xs text-muted-foreground font-medium">
                  {ad.brand.name}
                </span>
              )}
            </div>

            <h3 className="text-base font-semibold text-foreground group-hover:text-brand-500 transition-colors line-clamp-2">
              {ad.title}
            </h3>

            {ad.descriptionShort && (
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                {ad.descriptionShort}
              </p>
            )}
          </div>

          {/* Footer stats */}
          {showStats && (
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground pt-3 border-t border-border/50">
              {ad.viewCount !== undefined && ad.viewCount > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> {formatNumber(ad.viewCount)} views
                </span>
              )}
              {ad.year && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {ad.year}
                </span>
              )}
              {favoriteCount > 0 && (
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5" /> {formatNumber(favoriteCount)}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link
        href={`/ads/${ad.slug}`}
        className={cn('group relative rounded-2xl overflow-hidden bg-card border border-border block', className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Large thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={ad.title}
              fill
              sizes="(max-width: 1200px) 100vw, 1200px"
              priority={priority}
              unoptimized
              className={cn(
                'object-cover transition-transform duration-500',
                isHovered ? 'scale-105' : 'scale-100'
              )}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-900 via-dark-800 to-dark-950 flex items-center justify-center">
              <div className="text-center">
                <Play className="w-12 h-12 text-brand-400 mx-auto mb-2" />
                <p className="text-sm text-brand-300">Watch Ad</p>
              </div>
            </div>
          )}

          {/* Overlay */}
          <div className={cn(
            'absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300',
            isHovered ? 'opacity-100' : 'opacity-70'
          )} />

          {/* Play button */}
          <div className={cn(
            'absolute inset-0 flex items-center justify-center transition-opacity duration-300',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}>
            <div className="w-14 h-14 rounded-full bg-brand-500/90 flex items-center justify-center backdrop-blur-sm shadow-lg">
              <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {ad.isFeatured && (
              <span className="badge bg-brand-500 text-white text-xs">Featured</span>
            )}
            {isYouTube && (
              <span className="badge badge-youtube">
                <Youtube className="w-3 h-3" /> YouTube
              </span>
            )}
          </div>

          {/* Duration */}
          {ad.duration && (
            <span className="absolute bottom-3 right-3 ad-card-duration">
              {formatDuration(ad.duration)}
            </span>
          )}

          {/* Bottom content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {ad.category && showCategory && (
              <span
                className="badge text-white text-xs mb-2"
                style={{ backgroundColor: ad.category.color || '#f97316' }}
              >
                {ad.category.name}
              </span>
            )}
            <h3 className="text-lg font-semibold text-white line-clamp-2 group-hover:text-brand-300 transition-colors">
              {ad.title}
            </h3>
            {ad.brand && showBrand && (
              <p className="text-sm text-white/70 mt-1">{ad.brand.name}</p>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      href={`/ads/${ad.slug}`}
      className={cn('ad-card group block', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className="ad-card-thumbnail">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={ad.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
            unoptimized
            className={cn(
              'object-cover transition-transform duration-500',
              isHovered ? 'scale-105' : 'scale-100'
            )}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-800 to-dark-950 dark:from-dark-850 dark:to-dark-950">
            <div className="text-center">
              <Play className="w-8 h-8 text-brand-400 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Watch Ad</p>
            </div>
          </div>
        )}

        {/* Play overlay on hover */}
        <div className={cn(
          'absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}>
          <div className="w-12 h-12 rounded-full bg-brand-500/90 flex items-center justify-center backdrop-blur-sm">
            <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
          </div>
        </div>

        {/* Badges */}
        <div className="ad-card-source flex gap-1">
          {isYouTube && (
            <span className="badge badge-youtube backdrop-blur-sm">
              <Youtube className="w-3 h-3" /> YT
            </span>
          )}
          {ad.isTrending && (
            <span className="badge bg-brand-500/90 text-white backdrop-blur-sm">
              🔥 Trending
            </span>
          )}
        </div>

        {/* Duration */}
        {ad.duration && (
          <span className="ad-card-duration">
            {formatDuration(ad.duration)}
          </span>
        )}

        {/* Action buttons - show on hover */}
        <div className={cn(
          'absolute top-2 right-2 flex gap-1 transition-opacity duration-300',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}>
          <button
            onClick={handleFavorite}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            className={cn(
              'p-1.5 rounded-lg backdrop-blur-sm transition-colors',
              isFavorited
                ? 'bg-red-500/90 text-white'
                : 'bg-black/50 text-white hover:bg-red-500/90'
            )}
          >
            <Heart className={cn('w-3.5 h-3.5', isFavorited && 'fill-current')} />
          </button>
          <button
            onClick={handleShare}
            aria-label="Share"
            className="p-1.5 rounded-lg bg-black/50 text-white hover:bg-brand-500/90 backdrop-blur-sm transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="ad-card-body">
        {/* Category + Brand row */}
        {(showCategory || showBrand) && (
          <div className="flex items-center justify-between gap-2 mb-2">
            {showCategory && ad.category && (
              <span
                className="badge text-xs font-medium"
                style={{
                  backgroundColor: `${ad.category.color}20` || 'rgba(249,115,22,0.1)',
                  color: ad.category.color || '#f97316',
                }}
              >
                {ad.category.name}
              </span>
            )}
            {!showCategory && showBrand && ad.brand && (
              <span className="text-xs text-muted-foreground">{ad.brand.name}</span>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-brand-500 transition-colors duration-200 leading-snug">
          {ad.title}
        </h3>

        {/* Brand (below title) */}
        {showBrand && ad.brand && showCategory && (
          <p className="text-xs text-muted-foreground mt-1 truncate">{ad.brand.name}</p>
        )}

        {/* Description */}
        {ad.descriptionShort && (
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
            {ad.descriptionShort}
          </p>
        )}

        {/* Stats */}
        {showStats && (
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            {ad.viewCount !== undefined && ad.viewCount > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {formatNumber(ad.viewCount)}
              </span>
            )}
            {/*{ad.year && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {ad.year}
              </span>
            )}*/}
            {favoriteCount > 0 && (
              <span className="flex items-center gap-1 ml-auto">
                <Heart className="w-3 h-3" />
                {formatNumber(favoriteCount)}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}