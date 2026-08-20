import { AdCard, AdCardData } from './AdCard';
import { cn } from '@/lib/utils';

interface AdGridProps {
  ads: AdCardData[];
  columns?: 2 | 3 | 4 | 5;
  className?: string;
  emptyMessage?: string;
  variant?: 'default' | 'compact' | 'wide' | 'featured';
  showStats?: boolean;
  loading?: boolean;
  loadingCount?: number;
}

function AdCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' | 'wide' | 'featured' }) {
  if (variant === 'compact') {
    return (
      <div className="flex gap-3 rounded-xl p-2 bg-card border border-border/40">
        <div className="w-24 h-16 rounded-lg shimmer flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2 py-1">
          <div className="h-3.5 w-full shimmer rounded-lg" />
          <div className="h-3 w-1/2 shimmer rounded-lg" />
        </div>
      </div>
    );
  }

  if (variant === 'wide') {
    return (
      <div className="flex flex-col sm:flex-row gap-4 rounded-2xl border border-border bg-card p-4">
        <div className="w-full sm:w-64 aspect-video sm:aspect-16/10 rounded-xl shimmer flex-shrink-0" />
        <div className="flex-1 py-1 space-y-3">
          <div className="flex justify-between">
            <div className="h-3 w-20 shimmer rounded-full" />
            <div className="h-3 w-24 shimmer rounded-full" />
          </div>
          <div className="h-4 w-full shimmer rounded-lg" />
          <div className="h-4 w-3/4 shimmer rounded-lg" />
          <div className="h-3 w-1/2 shimmer rounded-lg mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="aspect-video w-full shimmer" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-16 shimmer rounded-full" />
        <div className="h-4 w-full shimmer rounded-lg" />
        <div className="h-4 w-3/4 shimmer rounded-lg" />
        <div className="h-3 w-1/2 shimmer rounded-full mt-3" />
      </div>
    </div>
  );
}

export function AdGrid({
  ads,
  columns = 4,
  className,
  emptyMessage = 'No ads found.',
  variant = 'default',
  showStats = true,
  loading = false,
  loadingCount = 8,
}: AdGridProps) {
  // If variant is 'wide', override grid columns to single column stack or a wider layout
  const gridClass = variant === 'wide' 
    ? 'grid-cols-1' 
    : {
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
      }[columns];

  if (loading) {
    return (
      <div className={cn('grid gap-5', gridClass, className)}>
        {Array.from({ length: loadingCount }).map((_, i) => (
          <AdCardSkeleton key={i} variant={variant} />
        ))}
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">🎬</span>
        </div>
        <p className="text-base font-medium text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('grid gap-5', gridClass, className)}>
      {ads.map((ad, idx) => (
        <AdCard
          key={ad.id}
          ad={ad}
          priority={idx < 4}
          variant={variant}
          showStats={showStats}
        />
      ))}
    </div>
  );
}