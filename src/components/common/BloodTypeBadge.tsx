import React from 'react';
import { BloodGroup } from '@/lib/types';

interface BloodTypeBadgeProps {
  type: BloodGroup | string;
  size?: 'sm' | 'md' | 'lg';
}

export const BloodTypeBadge: React.FC<BloodTypeBadgeProps> = ({ type, size = 'md' }) => {
  const isNegative = type.includes('-');

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-bold',
    md: 'text-sm px-2.5 py-1 font-bold',
    lg: 'text-base px-3.5 py-1.5 font-extrabold tracking-wide',
  }[size];

  return (
    <span
      className={`inline-flex items-center justify-center rounded-md border font-mono ${sizeClasses} ${
        isNegative
          ? 'bg-gradient-to-r from-red-600/30 to-crimson-700/40 border-red-500/50 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.25)]'
          : 'bg-gradient-to-r from-rose-950/60 to-red-900/40 border-rose-500/30 text-rose-200'
      }`}
    >
      🩸 {type}
    </span>
  );
};
