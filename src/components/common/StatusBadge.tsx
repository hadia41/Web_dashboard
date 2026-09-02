import React from 'react';
import { RequestStatus, UrgencyLevel } from '@/lib/types';

interface StatusBadgeProps {
  status?: RequestStatus;
  urgency?: UrgencyLevel;
  type?: 'status' | 'urgency';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, urgency, type = 'status' }) => {
  if (type === 'urgency' && urgency) {
    const config = {
      CRITICAL: {
        label: 'Critical',
        bg: 'bg-red-500/15 border-red-500/30 text-red-400 animate-pulse',
        dot: 'bg-red-500',
      },
      HIGH: {
        label: 'High',
        bg: 'bg-orange-500/15 border-orange-500/30 text-orange-400',
        dot: 'bg-orange-500',
      },
      MEDIUM: {
        label: 'Medium',
        bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
        dot: 'bg-amber-400',
      },
      LOW: {
        label: 'Low',
        bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
        dot: 'bg-emerald-400',
      },
    }[urgency] || {
      label: urgency,
      bg: 'bg-slate-500/15 border-slate-500/30 text-slate-400',
      dot: 'bg-slate-400',
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {config.label}
      </span>
    );
  }

  const statusConfig = {
    OPEN: {
      label: 'Open',
      bg: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
      dot: 'bg-blue-400',
    },
    IN_PROGRESS: {
      label: 'In Progress',
      bg: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
      dot: 'bg-purple-400',
    },
    FULFILLED: {
      label: 'Fulfilled',
      bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      dot: 'bg-emerald-400',
    },
    CANCELLED: {
      label: 'Cancelled',
      bg: 'bg-slate-500/15 border-slate-500/30 text-slate-400',
      dot: 'bg-slate-500',
    },
  }[status || 'OPEN'] || {
    label: status,
    bg: 'bg-slate-500/15 border-slate-500/30 text-slate-400',
    dot: 'bg-slate-400',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
      {statusConfig.label}
    </span>
  );
};
