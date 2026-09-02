'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Droplet, 
  Heart, 
  Activity, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { StatCard } from '@/components/dashboard/StatCard';
import { UrgencyChart } from '@/components/dashboard/UrgencyChart';
import { BloodGroupDistribution } from '@/components/dashboard/BloodGroupDistribution';
import { RecentRequestsTable } from '@/components/dashboard/RecentRequestsTable';
import { getDashboardStats, getBloodRequests, updateBloodRequestStatus } from '@/lib/api';
import { DashboardStats, BloodRequest, RequestStatus } from '@/lib/types';
import Link from 'next/link';

export default function OverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, reqsData] = await Promise.all([
        getDashboardStats(),
        getBloodRequests(),
      ]);
      setStats(statsData);
      setRequests(reqsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: RequestStatus) => {
    const success = await updateBloodRequestStatus(id, newStatus);
    if (success) {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      if (stats) {
        setStats({
          ...stats,
          fulfilledDonations: stats.fulfilledDonations + 1,
          livesSaved: stats.livesSaved + 1,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <Topbar
        onMenuToggle={() => {}}
        title="Command Center Overview"
        subtitle="Live monitoring, emergency triage, and real-time blood network statistics"
        onRefresh={loadData}
        isLoading={loading}
      />

      {/* Emergency Alert Banner if critical requests exist */}
      {stats && stats.criticalRequests > 0 && (
        <div className="glass-card bg-gradient-to-r from-red-950/60 via-red-900/30 to-slate-900/50 p-4 rounded-2xl border border-red-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pulse-critical">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <AlertCircle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                Emergency Alert: {stats.criticalRequests} Critical Blood Requests Pending
              </h4>
              <p className="text-xs text-slate-300">
                Patients in ICU and Emergency surgeries requiring immediate donor matching.
              </p>
            </div>
          </div>
          <Link
            href="/requests"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-glow-crimson transition-all"
          >
            Review Urgent Triage
          </Link>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <StatCard
          title="Active Blood Requests"
          value={stats?.activeRequests ?? '...'}
          subtext="Requiring urgent donor matching"
          icon={Droplet}
          color="red"
          isLive={true}
          trend="+4 new today"
          trendType="down"
        />
        <StatCard
          title="Available Donors"
          value={stats?.totalDonors ?? '...'}
          subtext="Ready for dispatch"
          icon={Users}
          color="emerald"
          trend="82% active rate"
          trendType="up"
        />
        <StatCard
          title="Donations Completed"
          value={stats?.fulfilledDonations ?? '...'}
          subtext="Verified across all hospitals"
          icon={ShieldCheck}
          color="blue"
          trend="+18 this week"
          trendType="up"
        />
        <StatCard
          title="Lives Impacted & Saved"
          value={stats?.livesSaved ?? '...'}
          subtext="Calculated clinical impact"
          icon={Heart}
          color="purple"
          trend="99.4% success"
          trendType="up"
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4">
          <UrgencyChart requests={requests} />
        </div>
        <div className="lg:col-span-8">
          <BloodGroupDistribution />
        </div>
      </div>

      {/* Live Emergency Requests Stream */}
      <RecentRequestsTable 
        requests={requests} 
        onStatusChange={handleStatusChange} 
      />
    </div>
  );
}
