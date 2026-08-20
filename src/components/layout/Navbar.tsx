'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import {
  Search, Menu, X, Sun, Moon, User, Heart, Bookmark,
  Settings, LogOut, ChevronDown, TrendingUp, Grid3x3,
  Building2, Plus, Video, Shield
} from 'lucide-react';
import { SearchBar } from '@/components/search/SearchBar';

const NAV_LINKS = [
  { href: '/ads', label: 'Browse Ads', icon: Video },
  { href: '/trending', label: 'Trending', icon: TrendingUp },
  { href: '/categories', label: 'Categories', icon: Grid3x3 },
  { href: '/brands', label: 'Brands', icon: Building2 },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  const isHomePage = pathname === '/';

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 w-full transition-all duration-300',
          isScrolled || !isHomePage
            ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
            : 'bg-transparent'
        )}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            
            <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6950484744639563" crossorigin="anonymous"></script>
            
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 flex-shrink-0"
              aria-label="TivoAds Home"
            >
              <Image
                src="/images/icon.png"
                alt="TivoAds Icon"
                width={25}
                height={25}
                className="object-contain"
                priority
              />
              <Image
                src="/images/logo.png"
                alt="TivoAds Logo"
                width={85}
                height={20}
                className="object-contain"
                priority
              />
            </Link>

            {/* Desktop Search (hidden on home page hero) */}
            {!isHomePage && (
              <div className="flex-1 max-w-xl hidden md:block">
                <SearchBar compact />
              </div>
            )}

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'nav-link px-3 py-2 rounded-lg hover:bg-accent',
                    pathname === href || pathname.startsWith(href + '/')
                      ? 'active text-brand-500 bg-brand-500/5'
                      : isScrolled || !isHomePage
                        ? 'text-muted-foreground'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                  )}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Mobile search toggle */}
              {isHomePage && (
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className={cn(
                    'md:hidden p-2 rounded-lg transition-colors',
                    isScrolled ? 'text-foreground hover:bg-accent' : 'text-white hover:bg-white/10'
                  )}
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}

              {/* Theme toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    isScrolled || !isHomePage
                      ? 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  )}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>
              )}

              {/* Submit Ad */}
              <Link
                href="/submit"
                className={cn(
                  'hidden sm:flex btn btn-sm',
                  isScrolled || !isHomePage
                    ? 'btn-outline'
                    : 'border border-white/30 text-white hover:bg-white/10'
                )}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden md:inline">Submit Ad</span>
              </Link>

              {/* User Menu */}
              {session ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={cn(
                      'flex items-center gap-2 rounded-xl p-1.5 pr-3 transition-colors',
                      isScrolled || !isHomePage
                        ? 'hover:bg-accent text-foreground'
                        : 'hover:bg-white/10 text-white'
                    )}
                    aria-expanded={isUserMenuOpen}
                    aria-label="User menu"
                  >
                    <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-semibold">
                      {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {isUserMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border bg-card shadow-xl z-20 overflow-hidden animate-scale-in">
                        <div className="px-4 py-3 border-b border-border">
                          <p className="text-sm font-semibold text-foreground">
                            {session.user.name || 'User'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                        </div>
                        <nav className="p-1">
                          <Link href="/account" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-accent text-foreground transition-colors">
                            <User className="w-4 h-4" /> My Account
                          </Link>
                          <Link href="/account/favorites" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-accent text-foreground transition-colors">
                            <Heart className="w-4 h-4" /> Saved Ads
                          </Link>
                          {/*<Link href="/account/collections" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-accent text-foreground transition-colors">
                            <Bookmark className="w-4 h-4" /> Collections
                          </Link>*/}
                          {(session.user.role === 'ADMIN' || session.user.role === 'MODERATOR') && (
                            <Link href="/admin" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-brand-500/10 text-brand-600 dark:text-brand-400 transition-colors">
                              <Shield className="w-4 h-4" /> Admin Panel
                            </Link>
                          )}
                          <hr className="my-1 border-border" />
                          <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </nav>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className={cn(
                      'btn btn-sm btn-ghost hidden sm:flex',
                      isScrolled || !isHomePage ? '' : 'text-white/80 hover:text-white hover:bg-white/10'
                    )}
                  >
                    Sign In
                  </Link>
                  <Link href="/register" className="btn btn-sm btn-primary">
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={cn(
                  'lg:hidden p-2 rounded-lg transition-colors',
                  isScrolled || !isHomePage
                    ? 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                )}
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isSearchOpen && (
            <div className="md:hidden pb-3 animate-slide-down">
              <SearchBar compact />
            </div>
          )}
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-background/98 backdrop-blur-md border-t border-border animate-slide-down">
            <div className="px-4 py-3 space-y-1">
              {!isHomePage && (
                <div className="pb-3">
                  <SearchBar compact />
                </div>
              )}
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    pathname === href
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
              <Link
                href="/submit"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Plus className="w-4 h-4" />
                Submit an Ad
              </Link>
              {!session && (
                <div className="pt-3 border-t border-border flex gap-2">
                  <Link href="/login" className="btn btn-md btn-outline flex-1">
                    Sign In
                  </Link>
                  <Link href="/register" className="btn btn-md btn-primary flex-1">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
