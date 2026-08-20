import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { Heart, Search } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/prisma';
import { AdGrid } from '@/components/ads/AdGrid';

export const metadata: Metadata = {
  title: 'Saved Ads — My Account',
  robots: { index: false },
};

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login?callbackUrl=/account/favorites');

  const prisma = await getDb();

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      ad: {
        include: {
          brand: { select: { name: true, slug: true, logoUrl: true } },
          category: { select: { name: true, slug: true, color: true } },
          tags: { include: { tag: { select: { name: true, slug: true } } } },
        },
      },
    },
  });

  const ads = favorites.map((f) => f.ad);

  return (
    <div className="min-h-screen bg-background">
      <div className="section-container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link href="/account" className="hover:text-foreground">My Account</Link>
              <span>/</span>
              <span>Saved Ads</span>
            </div>
            <h1 className="heading-3 text-foreground flex items-center gap-2">
              <Heart className="w-7 h-7 text-red-500" />
              Saved Ads
            </h1>
            <p className="text-muted-foreground mt-1">{ads.length} ads saved</p>
          </div>
          <Link href="/search" className="btn btn-primary btn-md">
            <Search className="w-4 h-4" />
            Find More Ads
          </Link>
        </div>

        {ads.length > 0 ? (
          <AdGrid ads={ads} columns={4} />
        ) : (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No saved ads yet</h2>
            <p className="text-muted-foreground mb-6">Start exploring and save ads you love.</p>
            <Link href="/ads" className="btn btn-primary btn-lg">
              Browse Ads
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}