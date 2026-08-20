import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Plus, Eye, Edit, Trash2, Search, Filter, ArrowUpRight, Video
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatNumber, formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Ads Management — TivoAds Admin',
  robots: { index: false },
};

export const revalidate = 60;

async function getAds(searchParams: any) {
  const page = parseInt(searchParams.page || '1');
  const status = searchParams.status || undefined;
  const search = searchParams.search || undefined;
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { brand: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [ads, total] = await Promise.all([
    prisma.ad.findMany({
      where,
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    }),
    prisma.ad.count({ where }),
  ]);

  return { ads, total, page, limit };
}

export default async function AdsPage({ searchParams }: { searchParams: any }) {
  const { ads, total, page, limit } = await getAds(searchParams);
  const totalPages = Math.ceil(total / limit);

  const statuses = [
    { value: 'PUBLISHED', label: 'Published', color: 'emerald' },
    { value: 'PENDING', label: 'Pending', color: 'amber' },
    { value: 'REJECTED', label: 'Rejected', color: 'red' },
    { value: 'DRAFT', label: 'Draft', color: 'slate' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Ads Management</h1>
          <p className="text-white/40 text-sm mt-1">Manage all advertisements</p>
        </div>
        <Link href="/admin/ads/new" className="btn btn-primary btn-md">
          <Plus className="w-4 h-4" />
          New Ad
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="text-2xl font-bold text-white">{total}</div>
          <div className="text-xs text-white/50 mt-1">Total Ads</div>
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="text-2xl font-bold text-white">{ads.filter(a => a.status === 'PUBLISHED').length}</div>
          <div className="text-xs text-white/50 mt-1">Published</div>
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="text-2xl font-bold text-white">{ads.filter(a => a.status === 'PENDING').length}</div>
          <div className="text-xs text-white/50 mt-1">Pending</div>
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="text-2xl font-bold text-white">{ads.filter(a => a.status === 'DRAFT').length}</div>
          <div className="text-xs text-white/50 mt-1">Drafts</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search ads by title or brand..."
            defaultValue={searchParams.search || ''}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-500/50"
          />
        </div>
        <div className="flex gap-2">
          {statuses.map((status) => (
            <Link
              key={status.value}
              href={`/admin/ads?status=${status.value}`}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                searchParams.status === status.value
                  ? `bg-${status.color}-500/20 text-${status.color}-400 border border-${status.color}-500/30`
                  : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
              }`}
            >
              {status.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-3 text-left text-xs font-semibold text-white/60">Title</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white/60">Brand</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white/60">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white/60">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white/60">Created</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => (
                <tr key={ad.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/ads/${ad.id}`}
                      className="text-sm text-white/80 hover:text-brand-400 transition-colors font-medium line-clamp-1"
                    >
                      {ad.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/60">{ad.brand?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-white/60">{ad.category?.name || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      ad.status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-400' :
                      ad.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400' :
                      ad.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {ad.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/60">{formatDate(ad.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/ads/${ad.id}`}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/ads/${ad.id}/edit`}
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
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} ads
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/ads?page=${page - 1}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 text-sm"
              >
                Previous
              </Link>
            )}
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <Link
                  key={pageNum}
                  href={`/admin/ads?page=${pageNum}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
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
                href={`/admin/ads?page=${page + 1}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
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
