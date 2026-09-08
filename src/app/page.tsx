"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { BloodBadge } from "@/components/BloodBadge";
import { StatusPill } from "@/components/StatusPill";
import { api } from "@/lib/api";
import { resolveCityFromItem } from "@/lib/cityUtils";
import { ArrowRight, MapPin, Building2, Phone, ChevronRight } from "lucide-react";

export default function OverviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [urgentRequests, setUrgentRequests] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    const [feedRes, urgentRes] = await Promise.all([
      api.getFeed({ limit: 10 }),
      api.getUrgentRequests(5),
    ]);

    if (feedRes.success && feedRes.data) {
      const list = feedRes.data.requests || feedRes.data || [];
      setRequests(Array.isArray(list) ? list : []);
      setTotalCount(feedRes.data.total || list.length || 0);
    }

    if (urgentRes.success && urgentRes.data) {
      setUrgentRequests(Array.isArray(urgentRes.data) ? urgentRes.data : []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalUnits = requests.reduce((acc, r) => acc + (Number(r.units_required || r.units) || 1), 0);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header
        title="Operations Overview"
        subtitle="Live emergency blood demand and requests fetched from backend"
        onRefresh={fetchData}
        isRefreshing={loading}
      />

      <div className="p-8 max-w-6xl mx-auto w-full space-y-6">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Active Requests"
            value={totalCount || requests.length}
            subtitle="Currently open on feed"
            badge="Live Feed"
          />
          <StatCard
            label="Urgent Blood Needed"
            value={urgentRequests.length}
            subtitle="High / Critical priority"
            badge={urgentRequests.length > 0 ? "Requires Attention" : "Stable"}
          />
          <StatCard
            label="Total Units Demanded"
            value={`${totalUnits} Pints`}
            subtitle="Across top 10 requests"
          />
          <StatCard
            label="Average Triage Level"
            value={urgentRequests.length > 2 ? "Elevated" : "Normal"}
            subtitle="National response status"
            badge="Pakistan"
          />
        </div>

        {/* Live Requests Feed Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Blood Requests</h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time submissions from mobile users</p>
            </div>
            <Link
              href="/requests"
              className="text-xs font-semibold text-[#E53935] hover:underline flex items-center gap-1"
            >
              View all requests <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Group</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Hospital & City</th>
                  <th className="py-3 px-4">Units</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Fetching live data from backend...
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No open blood requests found in backend database.
                    </td>
                  </tr>
                ) : (
                  requests.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => router.push(`/requests/${item.id}`)}
                      className="hover:bg-slate-50/75 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4">
                        <BloodBadge bloodGroup={item.blood_group || item.bloodType || "O+"} size="sm" />
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 group-hover:text-[#E53935] transition-colors">
                        {item.patient_name || item.patientName || "Patient"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">{item.hospital_name || item.hospital || "Hospital"}</div>
                        <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span className="font-semibold text-slate-700">{resolveCityFromItem(item)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">{item.units_required || item.units || 1}</span>{" "}
                        <span className="text-slate-400 text-[11px]">units</span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusPill status={item.urgency || "normal"} type="urgency" />
                      </td>
                      <td className="py-3 px-4">
                        <StatusPill status={item.status || "open"} type="status" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/requests/${item.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 group-hover:bg-[#E53935] group-hover:text-white text-slate-700 font-semibold text-xs transition-all shadow-2xs inline-flex items-center gap-1"
                        >
                          <span>Details</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
