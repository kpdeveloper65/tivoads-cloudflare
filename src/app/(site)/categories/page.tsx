import type { Metadata } from 'next';
import Link from 'next/link';
import { getDb } from '@/lib/prisma';
import { CategoryCard } from '@/components/categories/CategoryCard';

export const metadata: Metadata = {
  title: 'Browse Ad Categories',
  description: 'Browse TV and video ads by category and industry. Find ads in automotive, food, technology, healthcare, entertainment, and more.',
};

export const revalidate = 3600;

export default async function CategoriesPage() {
  const prisma = await getDb();
  
  // Fetch categories and count their published ads dynamically
  const categoriesData = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: {
          ads: {
            where: { status: 'PUBLISHED' },
          },
        },
      },
    },
  });

  // Map the dynamic count to a clean property and sort by active ads desc
  const categories = categoriesData.map((cat) => ({
    ...cat,
    realAdCount: cat._count.ads,
  })).sort((a, b) => b.realAdCount - a.realAdCount || a.name.localeCompare(b.name));

  const activeCategories = categories.filter((c) => c.realAdCount > 0);
  const emptyCategories = categories.filter((c) => c.realAdCount === 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 dark:from-dark-950 dark:to-dark-900 py-14 px-4">
        <div className="section-container text-center">
          <h1 className="heading-2 text-white mb-4">Browse by Category</h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Explore ads from {categories.length} industries. From automotive to tech,
            find the advertising inspiration you need.
          </p>
        </div>
      </div>

      <div className="section-container py-12">
        {/* Categories with ads */}
        {activeCategories.length > 0 && (
          <div className="mb-12">
            <h2 className="heading-4 text-foreground mb-6">
              Popular Categories
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {activeCategories.map((cat) => (
                <CategoryCard 
                  key={cat.id} 
                  category={{ ...cat, adCount: cat.realAdCount }} 
                  variant="large" 
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty categories */}
        {emptyCategories.length > 0 && (
          <div>
            <h2 className="heading-4 text-foreground mb-4 text-muted-foreground">
              Coming Soon
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {emptyCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex flex-col items-center text-center rounded-2xl border border-dashed border-border p-4 opacity-50"
                >
                  <div className="text-2xl mb-2">{cat.icon || '📁'}</div>
                  <h3 className="text-xs font-medium text-muted-foreground">{cat.name}</h3>
                  <span className="text-xs text-muted-foreground mt-1">No ads yet</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}