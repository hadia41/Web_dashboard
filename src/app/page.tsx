"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { BloodBadge } from "@/components/BloodBadge";
import { StatusPill } from "@/components/StatusPill";
import { api } from "@/lib/api";
import { resolveCityFromItem } from "@/lib/cityUtils";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Clock,
  Droplet,
  HeartHandshake,
  MapPin,
  Search,
  Users,
  X,
} from "lucide-react";

const BLOOD_GROUPS = ["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"];

export default function OverviewPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [rawRequests, setRawRequests] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState("all");
  const [selectedCityFilter, setSelectedCityFilter] = useState("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [feedRes, statsRes] = await Promise.all([
        api.getFeed({ limit: 50 }),
        api.getDashboardStats(),
      ]);

      if (feedRes.success && feedRes.data) {
        const list = feedRes.data.requests || feedRes.data || [];
        setRawRequests(Array.isArray(list) ? list : []);
      } else {
        setRawRequests([]);
      }

      if (statsRes.success && statsRes.data) {
        setDashboardStats(statsRes.data);
      }
    } catch (err) {
      console.error("Failed to load overview data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ---------------------------------------------------------------------------
  // CLIENT-SIDE DATA CLEANING & CALCULATION
  // ---------------------------------------------------------------------------
  const cleanedRequests = useMemo(() => {
    return rawRequests.map((r) => {
      const unitsReq = Number(r.units_required || r.units || 1);
      const unitsFulfilled = Number(r.fulfilled_units || 0);
      const unitsDeficit = Math.max(0, unitsReq - unitsFulfilled);
      const city = resolveCityFromItem(r);
      const group = r.blood_group || "O+";
      const urgency = (r.urgency || "normal").toLowerCase();
      const status = (r.status || "open").toLowerCase();

      return {
        ...r,
        cleanedCity: city,
        unitsReq,
        unitsFulfilled,
        unitsDeficit,
        progressPercent: Math.min(100, Math.round((unitsFulfilled / unitsReq) * 100)),
        bloodGroup: group,
        urgencyClean: urgency,
        statusClean: status,
      };
    });
  }, [rawRequests]);

  const calculatedTotals = useMemo(() => {
    const totalDemanded = cleanedRequests.reduce((acc, r) => acc + r.unitsReq, 0);
    const totalFulfilled = cleanedRequests.reduce((acc, r) => acc + r.unitsFulfilled, 0);
    const totalDeficit = cleanedRequests.reduce((acc, r) => acc + r.unitsDeficit, 0);
    const fulfillmentRate = totalDemanded > 0 ? Math.round((totalFulfilled / totalDemanded) * 100) : 0;
    const criticalCount = cleanedRequests.filter((r) => r.urgencyClean === "critical" || r.urgencyClean === "high").length;
    const openCount = cleanedRequests.filter((r) => r.statusClean === "open").length;
    const fulfilledCount = cleanedRequests.filter((r) => r.statusClean === "fulfilled").length;

    return { totalDemanded, totalFulfilled, totalDeficit, fulfillmentRate, criticalCount, openCount, fulfilledCount };
  }, [cleanedRequests]);

  // Blood group summary for the donut
  const bloodGroupSummary = useMemo(() => {
    const map: Record<string, number> = {};
    BLOOD_GROUPS.forEach((bg) => (map[bg] = 0));
    cleanedRequests.forEach((r) => {
      map[r.bloodGroup] = (map[r.bloodGroup] || 0) + r.unitsReq;
    });
    return map;
  }, [cleanedRequests]);

  const distinctCities = useMemo(() => {
    return Array.from(new Set(cleanedRequests.map((r) => r.cleanedCity))).sort();
  }, [cleanedRequests]);

  // Filtered Requests
  const filteredRequests = useMemo(() => {
    return cleanedRequests.filter((r) => {
      if (selectedGroupFilter !== "all" && r.bloodGroup !== selectedGroupFilter) return false;
      if (selectedCityFilter !== "all" && r.cleanedCity !== selectedCityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          (r.patient_name || "").toLowerCase().includes(q) ||
          (r.hospital_name || "").toLowerCase().includes(q) ||
          (r.cleanedCity || "").toLowerCase().includes(q) ||
          (r.bloodGroup || "").toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [cleanedRequests, selectedGroupFilter, selectedCityFilter, searchQuery]);

  const hasActiveFilters = searchQuery.trim() !== "" || selectedGroupFilter !== "all" || selectedCityFilter !== "all";

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedGroupFilter("all");
    setSelectedCityFilter("all");
  };

  // SVG donut chart helper
  const totalDemanded = calculatedTotals.totalDemanded || 1;
  const donutSegments = useMemo(() => {
    const colors: Record<string, string> = {
      "O+": "#ef4444", "A+": "#f97316", "B+": "#eab308",
      "AB+": "#84cc16", "O-": "#06b6d4", "A-": "#3b82f6",
      "B-": "#8b5cf6", "AB-": "#ec4899",
    };
    let cumulative = 0;
    return BLOOD_GROUPS.filter((bg) => (bloodGroupSummary[bg] || 0) > 0).map((bg) => {
      const value = bloodGroupSummary[bg] || 0;
      const pct = (value / totalDemanded) * 100;
      const offset = cumulative;
      cumulative += pct;
      return { bg, value, pct, offset, color: colors[bg] || "#94a3b8" };
    });
  }, [bloodGroupSummary, totalDemanded]);

  // Fulfillment ring percentage
  const ringPct = calculatedTotals.fulfillmentRate;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#f8f9fb" }}>
      <Header
        title="Dashboard"
        subtitle="LifeLink operations overview"
        onRefresh={fetchData}
        isRefreshing={loading}
      />

      <div className="p-5 md:p-8 max-w-[1360px] mx-auto w-full space-y-7">

        {/* ─── WELCOME HERO ─── */}
        <div
          className="animate-fade-in-up rounded-3xl p-7 md:p-9 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1a1d23 0%, #2d1b1b 50%, #e53935 150%)",
          }}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-ring" />
              <span className="text-emerald-400 text-xs font-semibold tracking-wide uppercase">
                Live System
              </span>
            </div>
            <h2 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
              LifeLink Command Center
            </h2>
            <p className="text-white/50 text-sm mt-1 max-w-xl font-medium">
              Real-time blood emergency coordination across Pakistan. Monitor active cases, donor network, and fulfillment status.
            </p>
          </div>
          {/* Decorative blobs */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#e53935]/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-12 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        </div>

        {/* ─── KEY STATS ROW ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          {[
            {
              label: "Active Cases",
              value: dashboardStats?.active_requests ?? cleanedRequests.length,
              sub: `${calculatedTotals.criticalCount} urgent`,
              icon: <Activity className="w-5 h-5" />,
              accent: "#e53935",
              bgAccent: "#fef2f2",
            },
            {
              label: "Lives Saved",
              value: dashboardStats?.lives_saved ?? calculatedTotals.totalFulfilled * 3,
              sub: `${dashboardStats?.fulfilled_donations ?? calculatedTotals.totalFulfilled} units donated`,
              icon: <HeartHandshake className="w-5 h-5" />,
              accent: "#10b981",
              bgAccent: "#ecfdf5",
            },
            {
              label: "Donor Network",
              value: dashboardStats?.total_donors ?? 0,
              sub: "Verified volunteers",
              icon: <Users className="w-5 h-5" />,
              accent: "#3b82f6",
              bgAccent: "#eff6ff",
            },
            {
              label: "Avg Response",
              value: dashboardStats?.response_time_avg ?? "—",
              sub: "Donor match speed",
              icon: <Clock className="w-5 h-5" />,
              accent: "#8b5cf6",
              bgAccent: "#f5f3ff",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group cursor-default"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: stat.bgAccent, color: stat.accent }}
                >
                  {stat.icon}
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1">{stat.label}</div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-medium">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* ─── FULFILLMENT + BLOOD GROUP SPLIT ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>

          {/* Fulfillment Ring Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 flex flex-col items-center justify-center">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 self-start">
              Fulfillment Progress
            </h3>

            <div className="relative w-44 h-44">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                {/* Background ring */}
                <circle
                  cx="60" cy="60" r="50"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="10"
                />
                {/* Progress ring */}
                <circle
                  cx="60" cy="60" r="50"
                  fill="none"
                  stroke={ringPct >= 80 ? "#10b981" : ringPct >= 40 ? "#f59e0b" : "#e53935"}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(ringPct / 100) * 314.16} 314.16`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-slate-900">{ringPct}%</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Fulfilled</span>
              </div>
            </div>

            <div className="mt-5 w-full grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-base font-extrabold text-slate-900">{calculatedTotals.totalDemanded}</div>
                <div className="text-[10px] font-semibold text-slate-400">Demanded</div>
              </div>
              <div>
                <div className="text-base font-extrabold text-emerald-600">{calculatedTotals.totalFulfilled}</div>
                <div className="text-[10px] font-semibold text-slate-400">Fulfilled</div>
              </div>
              <div>
                <div className="text-base font-extrabold text-[#e53935]">{calculatedTotals.totalDeficit}</div>
                <div className="text-[10px] font-semibold text-slate-400">Deficit</div>
              </div>
            </div>
          </div>

          {/* Blood Group Demand Distribution */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Blood Group Demand
              </h3>
              {selectedGroupFilter !== "all" && (
                <button
                  onClick={() => setSelectedGroupFilter("all")}
                  className="text-xs font-bold text-[#e53935] hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            <div className="grid grid-cols-4 gap-3">
              {BLOOD_GROUPS.map((bg) => {
                const demanded = bloodGroupSummary[bg] || 0;
                const isSelected = selectedGroupFilter === bg;
                const maxDemand = Math.max(...Object.values(bloodGroupSummary), 1);
                const barPct = demanded > 0 ? Math.max(8, Math.round((demanded / maxDemand) * 100)) : 0;

                return (
                  <button
                    key={bg}
                    onClick={() => setSelectedGroupFilter(isSelected ? "all" : bg)}
                    className={`relative rounded-xl border p-3 text-left transition-all duration-200 ${
                      isSelected
                        ? "bg-red-50 border-[#e53935] shadow-sm"
                        : "bg-slate-50/60 border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <BloodBadge bloodGroup={bg} size="sm" />
                      <span className="text-xs font-bold text-slate-700">{demanded}</span>
                    </div>
                    <div className="w-full bg-slate-200/60 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full transition-all duration-700"
                        style={{
                          width: `${barPct}%`,
                          background: isSelected ? "#e53935" : "#94a3b8",
                        }}
                      />
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400 mt-1.5">units needed</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── RECENT REQUESTS TABLE ─── */}
        <div
          className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          {/* Table Header */}
          <div className="p-5 pb-4 border-b border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Emergency Cases
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  {filteredRequests.length} of {cleanedRequests.length} cases
                  {hasActiveFilters && " (filtered)"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#e53935]/20 focus:border-[#e53935] w-48 transition-all"
                  />
                </div>

                {/* Group Filter */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium">
                  <Droplet className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={selectedGroupFilter}
                    onChange={(e) => setSelectedGroupFilter(e.target.value)}
                    className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Groups</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                {/* City Filter */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={selectedCityFilter}
                    onChange={(e) => setSelectedCityFilter(e.target.value)}
                    className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Cities</option>
                    {distinctCities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition-colors flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-5">Blood</th>
                  <th className="py-3 px-5">Patient</th>
                  <th className="py-3 px-5">Hospital & City</th>
                  <th className="py-3 px-5">Progress</th>
                  <th className="py-3 px-5">Urgency</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="inline-block w-6 h-6 border-2 border-[#e53935] border-t-transparent rounded-full animate-spin mb-3" />
                      <p className="font-semibold text-sm text-slate-500">Loading cases...</p>
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-sm text-slate-500">No cases found</p>
                      {hasActiveFilters && (
                        <button
                          onClick={clearAllFilters}
                          className="mt-3 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
                        >
                          Clear Filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((item) => {

                    return (
                      <tr
                        key={item.id}
                        onClick={() => router.push(`/requests/${item.id}`)}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-5">
                          <BloodBadge bloodGroup={item.bloodGroup} size="sm" />
                        </td>

                        <td className="py-3.5 px-5">
                          <div className="font-bold text-slate-900 group-hover:text-[#e53935] transition-colors">
                            {item.patient_name || item.patientName || "Emergency Patient"}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {item.id.slice(0, 8)}...
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          <div className="text-slate-700 font-semibold truncate max-w-[180px]">
                            {item.hospital_name || item.hospital || "Hospital"}
                          </div>
                          <div className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5 font-medium">
                            <MapPin className="w-3 h-3 text-[#e53935] shrink-0" />
                            {item.cleanedCity}
                          </div>
                        </td>

                        <td className="py-3.5 px-5 min-w-[120px]">
                          <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                            <span>{item.unitsFulfilled}/{item.unitsReq}</span>
                            <span className={item.unitsDeficit > 0 ? "text-[#e53935]" : "text-emerald-600"}>
                              {item.unitsDeficit > 0 ? `-${item.unitsDeficit}` : "✓"}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-500 ${
                                item.progressPercent >= 100
                                  ? "bg-emerald-500"
                                  : item.progressPercent > 0
                                  ? "bg-amber-500"
                                  : "bg-[#e53935]"
                              }`}
                              style={{ width: `${Math.max(item.progressPercent, 6)}%` }}
                            />
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          <StatusPill status={item.urgencyClean} type="urgency" />
                        </td>

                        <td className="py-3.5 px-5">
                          <StatusPill status={item.statusClean} type="status" />
                        </td>



                        <td className="py-3.5 px-5 text-right">
                          <Link
                            href={`/requests/${item.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 group-hover:bg-[#e53935] group-hover:text-white text-slate-600 font-semibold text-xs transition-all inline-flex items-center gap-1"
                          >
                            View <ChevronRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 px-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>
              {filteredRequests.length} of {cleanedRequests.length} cases
            </span>
            <Link
              href="/requests"
              className="text-[#e53935] hover:underline font-bold flex items-center gap-1"
            >
              All Requests <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
