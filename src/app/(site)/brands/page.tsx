import type { Metadata } from 'next';
import { getDb } from '@/lib/prisma';
import { BrandCard } from '@/components/brands/BrandCard';
import { SearchBar } from '@/components/search/SearchBar';

export const metadata: Metadata = {
  title: 'Browse Ad Brands',
  description: 'Explore ads from the world\'s top advertising brands. Browse by company, industry, or campaign.',
};

export const revalidate = 3600;

export default async function BrandsPage() {
  const prisma = await getDb();
  
  const brands = await prisma.brand.findMany({
    where: { isActive: true, adCount: { gt: 0 } },
    orderBy: [{ adCount: 'desc' }, { name: 'asc' }],
  });

  const grouped = brands.reduce((acc, brand) => {
    const letter = brand.name[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    
    // Updated limit to 32 as requested
    if (acc[letter].length < 32) { 
      acc[letter].push(brand);
    }
    
    return acc;
  }, {} as Record<string, typeof brands>);

  const letters = Object.keys(grouped).sort();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 py-14 px-4">
        <div className="section-container text-center">
          <h1 className="heading-2 text-white mb-4">Ad Brands</h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8">
            Explore advertising campaigns from {brands.length}+ brands across all industries.
          </p>
          <div className="max-w-md mx-auto">
            <SearchBar compact placeholder="Search brands..." />
          </div>
        </div>
      </div>

      <div className="section-container py-12">
        {/* Alphabet jump */}
        <div className="flex flex-wrap gap-1.5 mb-8">
          {letters.map((letter) => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold bg-secondary hover:bg-brand-500/10 hover:text-brand-500 transition-colors"
            >
              {letter}
            </a>
          ))}
        </div>

        {/* Brand groups */}
        <div className="space-y-10">
          {letters.map((letter) => (
            <div key={letter} id={`letter-${letter}`}>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                {letter}
                <div className="flex-1 h-px bg-border" />
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {grouped[letter].map((brand) => (
                  <BrandCard key={brand.id} brand={brand} variant="default" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {brands.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No brands found. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}