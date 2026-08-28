import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Plus, Eye, Edit, Trash2, Search, Building2
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Brands Management — TivoAds Admin',
  robots: { index: false },
};

export const revalidate = 60;

async function getBrands(searchParams: { search?: string; page?: string }) {
  const search = searchParams.search || undefined;
  const page = parseInt(searchParams.page || '1');
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [brands, total] = await Promise.all([
    prisma.brand.findMany({
      where,
      include: {
        _count: {
          select: { ads: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    }),
    prisma.brand.count({ where }),
  ]);

  return { brands, total, page, limit };
}

export default async function BrandsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ search?: string; page?: string }> 
}) {
  const resolvedSearchParams = await searchParams;
  const { brands, total, page, limit } = await getBrands(resolvedSearchParams);
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Brands Management</h1>
          <p className="text-white/40 text-sm mt-1">Manage all brands</p>
        </div>
        <Link href="/admin/brands/new" className="btn btn-primary btn-md">
          <Plus className="w-4 h-4" />
          New Brand
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="text-2xl font-bold text-white">{total}</div>
          <div className="text-xs text-white/50 mt-1">Total Brands</div>
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="text-2xl font-bold text-white">{brands.filter(b => b._count.ads > 0).length}</div>
          <div className="text-xs text-white/50 mt-1">With Ads</div>
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="text-2xl font-bold text-white">{brands.reduce((sum, b) => sum + b._count.ads, 0)}</div>
          <div className="text-xs text-white/50 mt-1">Total Ads</div>
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="text-2xl font-bold text-white">{brands.filter(b => b._count.ads === 0).length}</div>
          <div className="text-xs text-white/50 mt-1">Inactive</div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search brands..."
            defaultValue={resolvedSearchParams.search || ''}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-500/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-3 text-left text-xs font-semibold text-white/60">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white/60">Description</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-white/60">Ads</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white/60">Created</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => (
                <tr key={brand.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {brand.logo ? (
                        <img src={brand.logo} alt={brand.name} className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-brand-400" />
                        </div>
                      )}
                      <Link
                        href={`/brands/${brand.slug}`}
                        className="text-sm text-white/80 hover:text-brand-400 transition-colors font-medium"
                      >
                        {brand.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/60 line-clamp-1">{brand.description || 'N/A'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-brand-500/20 text-brand-400">
                      {brand._count.ads}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/60">{formatDate(brand.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/brands/${brand.slug}`}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/brands/${brand.id}/edit`}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/60 hover:text-red-400 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-white/50">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} brands
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/brands?page=${page - 1}`}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 text-sm"
              >
                Previous
              </Link>
            )}
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <Link
                  key={pageNum}
                  href={`/admin/brands?page=${pageNum}`}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all ${
                    pageNum === page
                      ? 'bg-brand-500 text-white'
                      : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {pageNum}
                </Link>
              );
            })}
            {page < totalPages && (
              <Link
                href={`/admin/brands?page=${page + 1}`}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 text-sm"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}