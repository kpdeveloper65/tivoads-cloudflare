import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Building2 } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  adCount?: number;
  industry?: string | null;
  isVerified?: boolean;
}

interface BrandCardProps {
  brand: Brand;
  variant?: 'default' | 'pill' | 'card';
  className?: string;
}

export function BrandCard({ brand, variant = 'default', className }: BrandCardProps) {
  if (variant === 'pill') {
    return (
      <Link
        href={`/brands/${brand.slug}`}
        className={cn(
          'group inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 hover:border-brand-500/30 hover:bg-brand-500/5 transition-all duration-200',
          className
        )}
      >
        {brand.logoUrl ? (
          <div className="w-5 h-5 rounded-full overflow-hidden bg-muted flex-shrink-0">
            <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full bg-brand-500/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-brand-600">{brand.name[0]}</span>
          </div>
        )}
        <span className="text-sm font-medium text-foreground group-hover:text-brand-500 transition-colors">
          {brand.name}
        </span>
        {brand.adCount !== undefined && (
          <span className="text-xs text-muted-foreground ml-0.5">({brand.adCount})</span>
        )}
      </Link>
    );
  }

  if (variant === 'card') {
    return (
      <Link
        href={`/brands/${brand.slug}`}
        className={cn(
          'group flex flex-col items-center text-center rounded-2xl border border-border bg-card p-5 hover:border-brand-500/30 hover:shadow-card-hover transition-all duration-300',
          className
        )}
      >
        {brand.logoUrl ? (
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-muted mb-3 flex items-center justify-center">
            <img
              src={brand.logoUrl}
              alt={brand.name}
              className="w-full h-full object-contain p-1"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-900/20 flex items-center justify-center mb-3">
            <span className="text-2xl font-bold text-brand-500">{brand.name[0]}</span>
          </div>
        )}
        <h3 className="text-sm font-semibold text-foreground group-hover:text-brand-500 transition-colors">
          {brand.name}
        </h3>
        {brand.industry && (
          <p className="text-xs text-muted-foreground mt-0.5">{brand.industry}</p>
        )}
        <span className="text-xs text-muted-foreground mt-2">
          {brand.adCount?.toLocaleString() || 0} ads
        </span>
        {brand.isVerified && (
          <span className="mt-2 badge bg-blue-500/10 text-blue-500 text-xs">Verified</span>
        )}
      </Link>
    );
  }

  // Default
  return (
    <Link
      href={`/brands/${brand.slug}`}
      className={cn(
        'group flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:border-brand-500/30 hover:bg-accent transition-all duration-200',
        className
      )}
    >
      {brand.logoUrl ? (
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
          <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-contain" />
        </div>
      ) : (
        <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
          <span className="text-base font-bold text-brand-500">{brand.name[0]}</span>
        </div>
      )}
      <div className="min-w-0">
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-semibold text-foreground group-hover:text-brand-500 transition-colors truncate">
            {brand.name}
          </h3>
          {brand.isVerified && (
            <span className="text-blue-500 flex-shrink-0" title="Verified">✓</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {brand.adCount?.toLocaleString() || 0} ads
          {brand.industry && ` · ${brand.industry}`}
        </p>
      </div>
    </Link>
  );
}
