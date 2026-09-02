'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Droplet, 
  Users, 
  HeartHandshake, 
  BarChart3, 
  Settings, 
  ShieldAlert, 
  Activity,
  Heart
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Overview',
      href: '/',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: 'Blood Requests',
      href: '/requests',
      icon: Droplet,
      badge: 'Live',
      badgeColor: 'bg-red-500 text-white animate-pulse',
    },
    {
      label: 'Donors & Users',
      href: '/donors',
      icon: Users,
      badge: null,
    },
    {
      label: 'Donation Records',
      href: '/donations',
      icon: HeartHandshake,
      badge: null,
    },
    {
      label: 'Analytics & Supply',
      href: '/analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      label: 'Settings & DB',
      href: '/settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 glass-panel border-r border-slate-800/80 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 via-crimson-600 to-rose-700 flex items-center justify-center shadow-glow-crimson group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 text-white fill-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-white tracking-tight">LifeLink</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">Emergency Blood System</p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 mb-2">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Management
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-crimson-600 text-white shadow-[0_4px_20px_rgba(225,29,72,0.35)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${item.badgeColor || 'bg-slate-700 text-slate-300'}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Emergency System Status footer */}
        <div className="p-4 border-t border-slate-800/60">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">System Live & Connected</p>
              <p className="text-[11px] text-slate-400 truncate">Supabase DB Sync Ready</p>
            </div>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </aside>
    </>
  );
};
