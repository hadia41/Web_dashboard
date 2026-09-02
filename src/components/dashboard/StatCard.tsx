import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  color?: 'red' | 'blue' | 'emerald' | 'purple' | 'amber';
  isLive?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  trendType = 'up',
  color = 'red',
  isLive = false,
}) => {
  const colorMap = {
    red: {
      border: 'border-red-500/20 hover:border-red-500/40',
      glow: 'shadow-[0_4px_25px_rgba(225,29,72,0.12)]',
      iconBg: 'bg-red-500/10 text-red-400 border border-red-500/20',
      accent: 'text-red-400',
    },
    blue: {
      border: 'border-blue-500/20 hover:border-blue-500/40',
      glow: 'shadow-[0_4px_25px_rgba(59,130,246,0.12)]',
      iconBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      accent: 'text-blue-400',
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      glow: 'shadow-[0_4px_25px_rgba(16,185,129,0.12)]',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      accent: 'text-emerald-400',
    },
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      glow: 'shadow-[0_4px_25px_rgba(168,85,247,0.12)]',
      iconBg: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      accent: 'text-purple-400',
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      glow: 'shadow-[0_4px_25px_rgba(245,158,11,0.12)]',
      iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      accent: 'text-amber-400',
    },
  }[color];

  return (
    <div className={`glass-card p-5 rounded-2xl ${colorMap.border} ${colorMap.glow} relative overflow-hidden transition-all duration-300 group`}>
      {/* Background ambient gradient glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/[0.03] to-transparent rounded-full pointer-events-none -mr-8 -mt-8" />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
            {isLive && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </div>
          <div className="text-2xl lg:text-3xl font-black text-white tracking-tight pt-1">
            {value}
          </div>
        </div>

        <div className={`p-3 rounded-xl ${colorMap.iconBg} group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtext || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
          {subtext && <span className="text-slate-400">{subtext}</span>}
          {trend && (
            <span className={`font-semibold ${trendType === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
