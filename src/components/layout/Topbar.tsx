'use client';

import React, { useState } from 'react';
import { Menu, Bell, Search, Shield, Droplets, RefreshCw } from 'lucide-react';

interface TopbarProps {
  onMenuToggle: () => void;
  title?: string;
  subtitle?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ 
  onMenuToggle, 
  title = 'Overview Dashboard', 
  subtitle = 'Real-time monitoring and emergency blood request management',
  onRefresh,
  isLoading = false
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page Title & Subtitle */}
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            {title}
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">{subtitle}</p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all disabled:opacity-50"
            title="Refresh live data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-red-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60 relative hover:bg-slate-700/60 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 glass-card p-4 rounded-xl border border-slate-700/80 shadow-2xl z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/60">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Live Alerts</span>
                <span className="text-[11px] text-red-400 font-semibold">2 Urgent</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-200">
                  <p className="font-semibold text-white">Emergency Request: O- Negative</p>
                  <p className="text-slate-400 text-[11px]">Services Hospital, Lahore (Surgery)</p>
                </div>
                <div className="p-2 rounded bg-orange-500/10 border border-orange-500/20 text-orange-200">
                  <p className="font-semibold text-white">Critical: B+ 4 Units</p>
                  <p className="text-slate-400 text-[11px]">Aga Khan Hospital, Karachi</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Chip */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-crimson-600 to-rose-500 flex items-center justify-center font-bold text-xs text-white shadow-glow-crimson-sm">
            LA
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-white leading-tight">LifeLink Admin</p>
            <p className="text-[10px] text-emerald-400 font-medium">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
};
