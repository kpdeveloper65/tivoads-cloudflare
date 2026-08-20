import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  color?: string | null;
  adCount?: number;
  description?: string | null;
}

interface CategoryCardProps {
  category: Category;
  variant?: 'default' | 'compact' | 'large';
  className?: string;
}

export function CategoryCard({ category, variant = 'default', className }: CategoryCardProps) {
  const color = category.color || '#f97316';

  if (variant === 'large') {
    return (
      <Link
        href={`/categories/${category.slug}`}
        className={cn(
          'group flex flex-col rounded-2xl border border-border bg-card p-6 hover:border-brand-500/30 hover:shadow-card-hover transition-all duration-300',
          className
        )}
      >
        <div
          className="flex items-center justify-center w-14 h-14 rounded-2xl text-2xl mb-4 transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${color}15` }}
        >
          {category.icon || '📁'}
        </div>
        <h3 className="font-semibold text-foreground group-hover:text-brand-500 transition-colors">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {category.description}
          </p>
        )}
        <div className="mt-auto pt-4">
          <span className="text-xs text-muted-foreground">
            {category.adCount?.toLocaleString() || 0} ads
          </span>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link
        href={`/categories/${category.slug}`}
        className={cn(
          'group flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2.5 hover:border-brand-500/30 hover:bg-accent transition-all duration-200',
          className
        )}
      >
        <span
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base"
          style={{ backgroundColor: `${color}15` }}
        >
          {category.icon || '📁'}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground group-hover:text-brand-500 transition-colors truncate">
            {category.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {category.adCount?.toLocaleString() || 0} ads
          </p>
        </div>
      </Link>
    );
  }

  // Default: compact pill/card for homepage grid
  return (
    <Link
      href={`/categories/${category.slug}`}
      className={cn(
        'group flex flex-col items-center text-center rounded-2xl border border-border bg-card p-4 hover:border-brand-500/30 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5',
        className
      )}
    >
      <div
        className="flex items-center justify-center w-12 h-12 rounded-xl text-xl mb-2.5 transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: `${color}15` }}
      >
        {category.icon || '📁'}
      </div>
      <h3 className="text-xs font-semibold text-foreground group-hover:text-brand-500 transition-colors leading-tight">
        {category.name}
      </h3>
      <span className="text-xs text-muted-foreground mt-1">
        {category.adCount?.toLocaleString() || 0}
      </span>
    </Link>
  );
}
