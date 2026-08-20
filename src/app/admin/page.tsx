import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Video, Users, Building2, Search, TrendingUp,
  Youtube, Send, Download, AlertTriangle, Eye, Plus, ArrowUpRight
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatNumber, formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Admin Dashboard — TivoAds',
  robots: { index: false },
};

export const revalidate = 60;

async function getDashboardStats() {
  const [
    totalAds, publishedAds, pendingAds,
    totalBrands, totalCategories, totalUsers,
    totalSubmissions, pendingSubmissions,
    totalYouTubeCandidates, pendingCandidates,
    recentSearches, recentAds,
  ] = await Promise.all([
    prisma.ad.count(),
    prisma.ad.count({ where: { status: 'PUBLISHED' } }),
    prisma.ad.count({ where: { status: 'PENDING' } }),
    prisma.brand.count(),
    prisma.category.count(),
    prisma.user.count(),
    prisma.submission.count(),
    prisma.submission.count({ where: { status: 'PENDING' } }),
    prisma.youTubeCandidate.count(),
    prisma.youTubeCandidate.count({ where: { status: 'CANDIDATE' } }),
    prisma.searchLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { query: true, resultCount: true, source: true, createdAt: true },
    }),
    prisma.ad.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true } },
      },
    }),
  ]);

  // Top searches
  const topSearches = await prisma.searchLog.groupBy({
    by: ['query'],
    _count: { query: true },
    orderBy: { _count: { query: 'desc' } },
    take: 10,
  });

  // Zero-result searches
  const zeroResultSearches = await prisma.searchLog.findMany({
    where: { resultCount: 0 },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { query: true, createdAt: true },
  });

  return {
    totalAds, publishedAds, pendingAds,
    totalBrands, totalCategories, totalUsers,
    totalSubmissions, pendingSubmissions,
    totalYouTubeCandidates, pendingCandidates,
    recentSearches, recentAds,
    topSearches, zeroResultSearches,
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const statCards = [
    { label: 'Total Ads', value: stats.totalAds, sub: `${stats.publishedAds} published`, icon: Video, href: '/admin/ads', color: 'text-brand-500 bg-brand-500/10' },
    { label: 'Users', value: stats.totalUsers, icon: Users, href: '/admin/users', color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Brands', value: stats.totalBrands, icon: Building2, href: '/admin/brands', color: 'text-purple-500 bg-purple-500/10' },
    { label: 'Pending Ads', value: stats.pendingAds, icon: AlertTriangle, href: '/admin/ads?status=PENDING', color: 'text-amber-500 bg-amber-500/10', urgent: stats.pendingAds > 0 },
    { label: 'Submissions', value: stats.pendingSubmissions, sub: 'awaiting review', icon: Send, href: '/admin/submissions', color: 'text-emerald-500 bg-emerald-500/10', urgent: stats.pendingSubmissions > 0 },
    { label: 'YouTube Queue', value: stats.pendingCandidates, sub: 'to review', icon: Youtube, href: '/admin/youtube', color: 'text-red-500 bg-red-500/10', urgent: stats.pendingCandidates > 0 },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">TivoAds Admin Panel</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/ads/new" className="btn btn-primary btn-md">
            <Plus className="w-4 h-4" />
            Add Ad
          </Link>
          <Link href="/admin/import" className="btn btn-md border border-white/20 text-white hover:bg-white/5">
            <Download className="w-4 h-4" />
            Import
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map(({ label, value, sub, icon: Icon, href, color, urgent }) => (
          <Link
            key={label}
            href={href}
            className={`rounded-2xl bg-white/5 border p-5 hover:bg-white/10 transition-all duration-200 group ${
              urgent ? 'border-brand-500/30 bg-brand-500/5' : 'border-white/10'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-white">{formatNumber(value)}</div>
            <div className="text-xs text-white/50 mt-0.5">{label}</div>
            {sub && <div className="text-xs text-white/30 mt-0.5">{sub}</div>}
            <ArrowUpRight className="w-3 h-3 text-white/20 group-hover:text-white/50 mt-2 transition-colors" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Recent Ads */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Recent Ads</h3>
            <Link href="/admin/ads" className="text-xs text-brand-400 hover:text-brand-300">View all</Link>
          </div>
          <div className="space-y-3">
            {stats.recentAds.map((ad) => (
              <Link
                key={ad.id}
                href={`/admin/ads/${ad.id}`}
                className="flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Video className="w-4 h-4 text-white/30" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 truncate group-hover:text-white transition-colors">{ad.title}</p>
                  <p className="text-xs text-white/30 truncate">{ad.brand?.name} · {ad.category?.name}</p>
                </div>
                <span className={`badge text-xs ${ad.status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {ad.status}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Searches */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Top Searches</h3>
            <Link href="/admin/analytics" className="text-xs text-brand-400 hover:text-brand-300">Analytics</Link>
          </div>
          <div className="space-y-2">
            {stats.topSearches.slice(0, 8).map((s, i) => (
              <div key={s.query} className="flex items-center gap-3">
                <span className="w-5 text-xs text-white/30 text-center">{i + 1}</span>
                <Link
                  href={`/search?q=${encodeURIComponent(s.query)}`}
                  target="_blank"
                  className="flex-1 text-sm text-white/70 hover:text-brand-400 transition-colors truncate"
                >
                  {s.query}
                </Link>
                <span className="text-xs text-white/30">{s._count.query}×</span>
              </div>
            ))}
          </div>
        </div>

        {/* Zero-Result Searches */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              No-Result Searches
            </h3>
          </div>
          <p className="text-xs text-white/40 mb-4">Searches that returned 0 results (potential content gaps)</p>
          <div className="space-y-2">
            {stats.zeroResultSearches.map((s) => (
              <div key={s.query + s.createdAt} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                <span className="flex-1 text-sm text-white/70 truncate">{s.query}</span>
                <Link
                  href={`/admin/ads/new?title=${encodeURIComponent(s.query)}`}
                  className="text-xs text-brand-400 hover:text-brand-300 flex-shrink-0"
                >
                  + Add
                </Link>
              </div>
            ))}
          </div>
          {stats.zeroResultSearches.length === 0 && (
            <p className="text-sm text-white/30 text-center py-4">No zero-result searches! 🎉</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 col-span-1 lg:col-span-2 xl:col-span-3">
          <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { href: '/admin/ads/new', icon: Plus, label: 'Add Ad' },
              { href: '/admin/import', icon: Download, label: 'Import Data' },
              { href: '/admin/youtube', icon: Youtube, label: 'YouTube Queue' },
              { href: '/admin/submissions', icon: Send, label: 'Submissions' },
              { href: '/admin/brands/new', icon: Building2, label: 'Add Brand' },
              { href: '/admin/categories', icon: TrendingUp, label: 'Categories' },
            ].map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center text-center gap-2 rounded-xl p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all duration-200"
              >
                <Icon className="w-5 h-5 text-brand-400" />
                <span className="text-xs text-white/60">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
