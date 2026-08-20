'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, TrendingUp, Tag, Building2, Grid3x3, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchSuggestions {
  ads: Array<{ id: string; title: string; slug: string; thumbnailUrl: string | null }>;
  brands: Array<{ id: string; name: string; slug: string }>;
  categories: Array<{ id: string; name: string; slug: string }>;
  tags: Array<{ id: string; name: string; slug: string }>;
}

const POPULAR_SEARCHES = [
  'Super Bowl ads', 'Nike', 'Apple', 'Coca-Cola', 'emotional ads',
  'viral commercials', 'holiday ads', 'funny ads',
];

interface SearchBarProps {
  compact?: boolean;
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  initialValue?: string;
  heroMode?: boolean; 
  focus?: boolean;
}

export function SearchBar({
  compact = false,
  placeholder = 'Search ads, brands, campaigns...',
  className,
  onSearch,
  initialValue = '',
  heroMode = false,
  focus=false
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialValue || searchParams.get('q') || '');
  const [suggestions, setSuggestions] = useState<SearchSuggestions | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);
  useEffect(() => {
  if (focus) {
    setIsOpen(true);
    inputRef.current?.focus();
  }
}, [focus]);

  // Fetch suggestions
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions(null);
      return;
    }

    setIsLoading(true);
    fetch(`/api/search/suggestions?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data) => {
        setSuggestions(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [debouncedQuery]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!query.trim()) return;
      setIsOpen(false);
      if (onSearch) {
        onSearch(query.trim());
      } else {
		window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
        //router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    },
    [query, router, onSearch]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const hasSuggestions =
    suggestions &&
    (suggestions.ads.length > 0 ||
      suggestions.brands.length > 0 ||
      suggestions.categories.length > 0 ||
      suggestions.tags.length > 0);

  const showDropdown = isOpen && (hasSuggestions || !query || query.length < 2);

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <form onSubmit={handleSubmit} role="search">
        <div className="relative flex items-center">
          <Search
            className={cn(
              'absolute left-4 pointer-events-none z-10',
              heroMode
                ? 'w-6 h-6 text-white/60'
                : 'w-4 h-4 text-muted-foreground'
            )}
          />

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            aria-label="Search ads"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            className={cn(
              'w-full transition-all duration-200',
              heroMode
                ? 'search-input pl-14 pr-14 text-lg h-16'
                : compact
                  ? 'search-input-desktop pl-10 pr-10 h-10 text-sm'
                  : 'search-input-desktop pl-12 pr-12 h-12'
            )}
          />

          {/* Loading / Clear */}
          <div className="absolute right-4 flex items-center gap-2">
            {isLoading && (
              <Loader2
                className={cn(
                  'animate-spin',
                  heroMode ? 'w-5 h-5 text-white/60' : 'w-4 h-4 text-muted-foreground'
                )}
              />
            )}
            {query && !isLoading && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSuggestions(null);
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className={cn(
                  'rounded-full p-0.5 transition-colors',
                  heroMode
                    ? 'text-white/60 hover:text-white hover:bg-white/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {heroMode && (
              <button
                type="submit"
                className="btn btn-primary btn-md ml-1"
                aria-label="Search"
              >
                Search
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-border bg-card shadow-xl z-50 overflow-hidden animate-scale-in">
          {/* Has suggestions */}
          {hasSuggestions ? (
            <div className="p-2">
              {/* Ads */}
              {suggestions!.ads.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Ads
                  </div>
                  {suggestions!.ads.map((ad) => (
                    <Link
                      key={ad.id}
                      href={`/ads/${ad.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-accent transition-colors"
                    >
                      <div className="w-12 h-8 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {ad.thumbnailUrl ? (
                          <img
                            src={ad.thumbnailUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Search className="w-3 h-3 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-foreground line-clamp-1">{ad.title}</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Brands */}
              {suggestions!.brands.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Brands
                  </div>
                  {suggestions!.brands.map((brand) => (
                    <Link
                      key={brand.id}
                      href={`/brands/${brand.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-accent transition-colors"
                    >
                      <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-foreground">{brand.name}</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Categories */}
              {suggestions!.categories.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Categories
                  </div>
                  {suggestions!.categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-accent transition-colors"
                    >
                      <Grid3x3 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-foreground">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Tags */}
              {suggestions!.tags.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Tags
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-3 py-2">
                    {suggestions!.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/search?tag=${tag.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="badge badge-brand hover:bg-brand-500/20 transition-colors"
                      >
                        <Tag className="w-3 h-3" />
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Full search link */}
              <div className="border-t border-border mt-2 pt-2 px-1">
                <button
                  onClick={() => handleSubmit()}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-brand-600 dark:text-brand-400 hover:bg-brand-500/5 transition-colors font-medium"
                >
                  <Search className="w-4 h-4" />
                  Search for &ldquo;{query}&rdquo;
                </button>
              </div>
            </div>
          ) : (
            /* Empty state - show popular searches */
            <div className="p-3">
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Popular Searches
              </div>
              <div className="flex flex-wrap gap-1.5 px-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term);
                      setIsOpen(false);
                      window.location.href = `/search?q=${encodeURIComponent(term)}`;
                    }}
                    className="badge bg-secondary text-secondary-foreground hover:bg-accent cursor-pointer transition-colors text-xs py-1 px-2.5"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
