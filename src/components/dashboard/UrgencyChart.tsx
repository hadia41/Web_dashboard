'use client';

import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { BloodRequest } from '@/lib/types';

interface UrgencyChartProps {
  requests: BloodRequest[];
}

export const UrgencyChart: React.FC<UrgencyChartProps> = ({ requests }) => {
  const urgencyCounts = requests.reduce(
    (acc, req) => {
      acc[req.urgency] = (acc[req.urgency] || 0) + 1;
      return acc;
    },
    { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 } as Record<string, number>
  );

  const data = [
    { name: 'Critical', value: urgencyCounts.CRITICAL || 1, color: '#ef4444' },
    { name: 'High Urgency', value: urgencyCounts.HIGH || 1, color: '#f97316' },
    { name: 'Medium', value: urgencyCounts.MEDIUM || 1, color: '#f59e0b' },
    { name: 'Low / Standard', value: urgencyCounts.LOW || 1, color: '#10b981' },
  ].filter(d => d.value > 0);

  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Requests by Urgency
          </h3>
          <p className="text-xs text-slate-400">Triage level of active blood requests</p>
        </div>
        <span className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-semibold">
          Live Triage
        </span>
      </div>

      <div className="h-64 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(15, 23, 42, 0.8)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(value: any) => [`${value} Requests`, 'Count']}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
