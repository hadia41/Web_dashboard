import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, subtitle, badge }) => {
  return (
    <div className="app-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-[#E53935] border border-red-100">
            {badge}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-900 tracking-tight mt-2">{value}</div>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
};
