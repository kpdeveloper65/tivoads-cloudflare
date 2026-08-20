import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Plus, Eye, Edit, Trash2, Search, Users as UsersIcon, Mail, Shield
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Users Management — TivoAds Admin',
  robots: { index: false },
};

export const revalidate = 60;

async function getUsers(searchParams: any) {
  const search = searchParams.search || undefined;
  const page = parseInt(searchParams.page || '1');
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { submissions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, limit };
}

export default async function UsersPage({ searchParams }: { searchParams: any }) {
  const { users, total, page, limit } = await getUsers(searchParams);
  const totalPages = Math.ceil(total / limit);

  const roles = [
    { value: 'ADMIN', label: 'Admin', color: 'purple' },
    { value: 'MODERATOR', label: 'Moderator', color: 'blue' },
    { value: 'USER', label: 'User', color: 'slate' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-white/40 text-sm mt-1">Manage all users and permissions</p>
        </div>
        <Link href="/admin/users/new" className="btn btn-primary btn-md">
          <Plus className="w-4 h-4" />
          Add User
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="text-2xl font-bold text-white">{total}</div>
          <div className="text-xs text-white/50 mt-1">Total Users</div>
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="text-2xl font-bold text-white">{users.filter(u => u.role === 'ADMIN').length}</div>
          <div className="text-xs text-white/50 mt-1">Admins</div>
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="text-2xl font-bold text-white">{users.filter(u => u.role === 'MODERATOR').length}</div>
          <div className="text-xs text-white/50 mt-1">Moderators</div>
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="text-2xl font-bold text-white">{users.filter(u => u.role === 'USER').length}</div>
          <div className="text-xs text-white/50 mt-1">Regular Users</div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            defaultValue={searchParams.search || ''}
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-white/60">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white/60">Email</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-white/60">Role</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-white/60">Submissions</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white/60">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-sm text-white/80 hover:text-brand-400 transition-colors font-medium"
                    >
                      {user.name || 'Unnamed'}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' :
                      user.role === 'MODERATOR' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-brand-500/20 text-brand-400">
                      {user._count.submissions}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/60">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/users/${user.id}/edit`}
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
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} users
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/users?page=${page - 1}`}
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
                  href={`/admin/users?page=${pageNum}`}
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
                href={`/admin/users?page=${page + 1}`}
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
