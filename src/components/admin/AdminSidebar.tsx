'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard, Video, Building2, Grid3x3, Tag,
  Users, Download, Youtube, AlertTriangle, FileText,
  Settings, LogOut, ChevronRight, Shield, Send,
  BarChart3, Menu, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  user: {
    name?: string | null;
    email: string;
    role: string;
  };
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Ads', href: '/admin/ads', icon: Video },
  { label: 'Brands', href: '/admin/brands', icon: Building2 },
  { label: 'Categories', href: '/admin/categories', icon: Grid3x3 },
  { label: 'Tags', href: '/admin/tags', icon: Tag },
  { label: 'Users', href: '/admin/users', icon: Users, adminOnly: true },
  null, // separator
  { label: 'YouTube Queue', href: '/admin/youtube', icon: Youtube },
  { label: 'Submissions', href: '/admin/submissions', icon: Send },
  { label: 'Import Tool', href: '/admin/import', icon: Download },
  { label: 'Import Logs', href: '/admin/import/logs', icon: FileText },
  null,
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-sm">
          T
        </div>
        <div>
          <span className="text-white font-bold text-sm">TivoAds</span>
          <p className="text-white/30 text-xs">Admin Panel</p>
        </div>
      </div>

      {/* User */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
        <div className="w-8 h-8 rounded-full bg-brand-500/30 flex items-center justify-center text-brand-400 text-xs font-bold flex-shrink-0">
          {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-white truncate">{user.name || user.email}</p>
          <span className="inline-flex items-center gap-1 text-xs text-brand-400">
            <Shield className="w-2.5 h-2.5" /> {user.role}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {NAV_ITEMS.map((item, i) => {
          if (item === null) {
            return <hr key={i} className="my-2 border-white/10" />;
          }

          // Filter out admin-only items if the user is not an admin
          if (item.adminOnly && user.role !== 'ADMIN') {
            return null;
          }

          const active = isActive(item.href, item.exact);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-brand-500/20 text-brand-400'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3 h-3 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-white/40 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Video className="w-3.5 h-3.5" />
          View Public Site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 lg:hidden w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-lg"
        aria-label="Toggle admin menu"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-40 w-60 bg-dark-950 border-r border-white/10 flex flex-col transition-transform duration-300 lg:hidden',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-60 bg-dark-950 border-r border-white/10 flex-col h-screen sticky top-0 overflow-hidden flex-shrink-0">
        <SidebarContent />
      </div>
    </>
  );
}