import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { Heart, Bookmark, History, Settings, Video, Plus, User } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/prisma';
import { AdCard } from '@/components/ads/AdCard';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'My Account',
  robots: { index: false },
};

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login?callbackUrl=/account');

  const prisma = await getDb();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: {
          favorites: true,
          collections: true,
          watchHistory: true,
          submissions: true,
        },
      },
    },
  });

  if (!user) redirect('/login');

  const [recentFavorites, collections] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: {
        ad: {
          include: {
            brand: { select: { name: true, slug: true } },
            category: { select: { name: true, slug: true, color: true } },
            tags: { include: { tag: { select: { name: true, slug: true } } } },
          },
        },
      },
    }),
    prisma.collection.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      take: 3,
    }),
  ]);

  const stats = [
    { label: 'Saved Ads', value: user._count.favorites, icon: Heart, href: '/account/favorites', color: 'text-red-500 bg-red-500/10' },
    { label: 'Collections', value: user._count.collections, icon: Bookmark, href: '/account/collections', color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Watch History', value: user._count.watchHistory, icon: History, href: '/account/history', color: 'text-purple-500 bg-purple-500/10' },
    { label: 'Submissions', value: user._count.submissions, icon: Video, href: '/account/submissions', color: 'text-emerald-500 bg-emerald-500/10' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 py-12 px-4">
        <div className="section-container">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user.name || 'My Account'}</h1>
              <p className="text-white/50">{user.email}</p>
              <p className="text-white/30 text-sm mt-1">Member since {formatDate(user.createdAt)}</p>
            </div>
            <Link href="/account/settings" className="ml-auto btn btn-outline btn-md border-white/20 text-white hover:bg-white/10">
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </div>
        </div>
      </div>

      <div className="section-container py-8 space-y-10">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, href, color }) => (
            <Link
              key={label}
              href={href}
              className="rounded-2xl border border-border bg-card p-5 hover:border-brand-500/30 hover:shadow-card-hover transition-all duration-300 flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} flex-shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{value}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Favorites */}
        {recentFavorites.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="heading-4 text-foreground">Recently Saved</h2>
              <Link href="/account/favorites" className="btn btn-ghost btn-sm text-brand-500">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentFavorites.map(({ ad }) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          </div>
        )}

        {/* Collections */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="heading-4 text-foreground">My Collections</h2>
            <Link href="/account/collections/new" className="btn btn-primary btn-sm">
              <Plus className="w-3.5 h-3.5" />
              New Collection
            </Link>
          </div>

          {collections.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {collections.map((col) => (
                <Link
                  key={col.id}
                  href={`/account/collections/${col.id}`}
                  className="rounded-2xl border border-border bg-card p-5 hover:border-brand-500/30 hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                      <Bookmark className="w-5 h-5 text-brand-500" />
                    </div>
                    <span className={`badge text-xs ${col.visibility === 'PUBLIC' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                      {col.visibility}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{col.name}</h3>
                  {col.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{col.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-3">{col.adCount} ads</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <Bookmark className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                Create collections to organize your favorite ads
              </p>
              <Link href="/account/collections/new" className="btn btn-primary btn-sm">
                Create Your First Collection
              </Link>
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { href: '/submit', icon: Plus, label: 'Submit an Ad', desc: 'Suggest a missing ad to add to our database' },
            { href: '/account/settings', icon: Settings, label: 'Account Settings', desc: 'Update your profile and preferences' },
            { href: '/search', icon: Video, label: 'Discover Ads', desc: 'Search and explore our full ad library' },
          ].map(({ href, icon: Icon, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 hover:border-brand-500/30 hover:bg-accent transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-brand-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}