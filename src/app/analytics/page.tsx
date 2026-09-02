'use client';

import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Topbar } from '@/components/layout/Topbar';
import { mockMonthlyTrends, mockBloodInventoryData } from '@/lib/mockData';
import { TrendingUp, Users, Droplet, Shield, Zap } from 'lucide-react';

export default function AnalyticsPage() {
  const cityData = [
    { city: 'Lahore', requests: 420, fulfilled: 395, donors: 560 },
    { city: 'Karachi', requests: 380, fulfilled: 350, donors: 490 },
    { city: 'Islamabad / Rawalpindi', requests: 290, fulfilled: 275, donors: 380 },
    { city: 'Multan', requests: 160, fulfilled: 145, donors: 210 },
    { city: 'Peshawar', requests: 110, fulfilled: 98, donors: 140 },
    { city: 'Faisalabad', requests: 130, fulfilled: 120, donors: 180 },
  ];

  return (
    <div className="space-y-6">
      <Topbar
        onMenuToggle={() => {}}
        title="Network Analytics & Forecasting"
        subtitle="Historical donation trends, regional fulfillment metrics, and blood type inventory velocity"
      />

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Fulfillment Velocity</span>
          <h3 className="text-2xl font-black text-white mt-1">92.4%</h3>
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +3.2% vs last quarter
          </p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Avg Response Time</span>
          <h3 className="text-2xl font-black text-white mt-1">18 Mins</h3>
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Emergency Triage SLA
          </p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Rare Blood Match Rate</span>
          <h3 className="text-2xl font-black text-white mt-1">86.1%</h3>
          <p className="text-xs text-slate-300 mt-1">O- & AB- Coverage</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Donor Retention</span>
          <h3 className="text-2xl font-black text-white mt-1">74.8%</h3>
          <p className="text-xs text-emerald-400 mt-1">Repeat donors active</p>
        </div>
      </div>

      {/* Monthly Trends Area Chart */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Monthly Request Volume vs Fulfilled Transfusions
            </h3>
            <p className="text-xs text-slate-400">Comparing incoming emergency requests with successful donations</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
            2026 Year-to-Date
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockMonthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorFulfilled" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Area 
                type="monotone" 
                dataKey="requests" 
                stroke="#f43f5e" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorRequests)" 
                name="Incoming Blood Requests" 
              />
              <Area 
                type="monotone" 
                dataKey="fulfilled" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorFulfilled)" 
                name="Fulfilled Transfusions" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Regional City Distribution */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800">
        <div className="mb-6">
          <h3 className="text-base font-bold text-white tracking-tight">
            Geographic Distribution by Major Cities
          </h3>
          <p className="text-xs text-slate-400">Total requests vs registered donor readiness per metropolitan area</p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="city" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="donors" fill="#3b82f6" name="Registered Donors" radius={[4, 4, 0, 0]} />
              <Bar dataKey="requests" fill="#e11d48" name="Total Requests" radius={[4, 4, 0, 0]} />
              <Bar dataKey="fulfilled" fill="#10b981" name="Fulfilled" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
