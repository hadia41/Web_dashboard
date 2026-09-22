"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { BloodBadge } from "@/components/BloodBadge";
import { StatusPill } from "@/components/StatusPill";
import { UserAvatar } from "@/components/UserAvatar";
import { api } from "@/lib/api";
import { resolveCityFromItem, resolveRequestStatus } from "@/lib/cityUtils";
import CitiesData from "@/data/cities.json";
import { downloadCSV, generateRequestsCSV } from "@/lib/exportUtils";
import {
  Search,
  MapPin,
  Building2,
  Filter,
  Droplet,
  ChevronRight,
  Radio,
  Activity,
  HeartHandshake,
  AlertCircle,
  Clock,
  Sparkles,
  X,
  Users,
  Download,
} from "lucide-react";

const BLOOD_GROUPS = ["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"];

export default function BloodRequestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [statusCounts, setStatusCounts] = useState<{ [key: string]: number }>({});
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedUrgency, setSelectedUrgency] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");

  const fetchRequests = async () => {
    setLoading(true);
    const res = await api.getFeed({
      status: "all",
      limit: 50,
    });

    if (res.success && res.data) {
      const list = res.data.requests || res.data || [];
      setRequests(Array.isArray(list) ? list : []);
      const counts: { [key: string]: number } = { all: list.length, open: 0, expired: 0, fulfilled: 0, cancelled: 0 };
      list.forEach((item: any) => {
        const st = resolveRequestStatus(item);
        if (st === "fulfilled") counts.fulfilled++;
        else if (st === "cancelled") counts.cancelled++;
        else if (st === "expired") counts.expired++;
        else counts.open++;
      });
      setStatusCounts(counts);
    } else {
      setRequests([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Clean and enrich requests with true effective status
  const cleanedRequests = useMemo(() => {
    return requests.map((item) => {
      const bloodGroup = (item.blood_group || item.bloodType || "O+").toUpperCase();
      const city = resolveCityFromItem(item);
      const unitsReq = Number(item.units_required || item.units || 1);
      const unitsFulfilled = Number(item.fulfilled_units || 0);
      const unitsDeficit = Math.max(0, unitsReq - unitsFulfilled);
      const progressPercent = Math.min(100, Math.round((unitsFulfilled / unitsReq) * 100));
      const urgency = (item.urgency || "normal").toLowerCase();
      const status = resolveRequestStatus(item);
      const patientName = item.patient_name || item.patientName || "Emergency Patient";
      const hospitalName = item.hospital_name || item.hospital || "Medical Facility";

      return {
        ...item,
        bloodGroup,
        city,
        unitsReq,
        unitsFulfilled,
        unitsDeficit,
        progressPercent,
        urgency,
        status,
        patientName,
        hospitalName,
      };
    });
  }, [requests]);

  // Distinct cities from loaded data
  const distinctCities = useMemo(() => {
    return Array.from(new Set(cleanedRequests.map((r) => r.city))).filter(Boolean).sort();
  }, [cleanedRequests]);

  // Calculated Metrics
  const metrics = useMemo(() => {
    const totalCases = cleanedRequests.length;
    const criticalCases = cleanedRequests.filter(
      (r) => r.urgency === "critical" || r.urgency === "high"
    ).length;
    const totalDeficit = cleanedRequests.reduce((acc, r) => acc + r.unitsDeficit, 0);
    const coveredCitiesCount = new Set(cleanedRequests.map((r) => r.city)).size;

    return {
      totalCases,
      criticalCases,
      totalDeficit,
      coveredCitiesCount,
    };
  }, [cleanedRequests]);

  // Blood group breakdown counts
  const groupCounts = useMemo(() => {
    const map: Record<string, number> = {};
    BLOOD_GROUPS.forEach((bg) => (map[bg] = 0));
    cleanedRequests.forEach((r) => {
      map[r.bloodGroup] = (map[r.bloodGroup] || 0) + 1;
    });
    return map;
  }, [cleanedRequests]);

  // Filtered requests based on active filters
  const filteredRequests = useMemo(() => {
    return cleanedRequests.filter((item) => {
      if (selectedStatus !== "all" && item.status !== selectedStatus) return false;
      if (selectedGroup !== "all" && item.bloodGroup !== selectedGroup) return false;
      if (selectedUrgency !== "all" && item.urgency !== selectedUrgency) return false;
      if (selectedCity !== "all" && item.city !== selectedCity) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchPatient = item.patientName.toLowerCase().includes(q);
        const matchHospital = item.hospitalName.toLowerCase().includes(q);
        const matchCity = item.city.toLowerCase().includes(q);
        const matchGroup = item.bloodGroup.toLowerCase().includes(q);
        if (!matchPatient && !matchHospital && !matchCity && !matchGroup) {
          return false;
        }
      }
      return true;
    });
  }, [cleanedRequests, selectedStatus, selectedGroup, selectedUrgency, selectedCity, search]);

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedGroup !== "all" ||
    selectedUrgency !== "all" ||
    selectedCity !== "all";

  const clearAllFilters = () => {
    setSearch("");
    setSelectedGroup("all");
    setSelectedUrgency("all");
    setSelectedCity("all");
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#f8f9fb" }}>
      <Header
        title="Blood Requests"
        subtitle="Manage, monitor, and triage live blood requests across Pakistan"
        onRefresh={fetchRequests}
        isRefreshing={loading}
      />

      <div className="p-5 md:p-8 max-w-[1360px] mx-auto w-full space-y-7">
        {/* ─── COMMAND HERO BANNER ─── */}
        <div
          className="animate-fade-in-up rounded-3xl p-7 md:p-8 relative overflow-hidden text-white"
          style={{
            background: "linear-gradient(135deg, #1a1d23 0%, #2d1b1b 50%, #e53935 150%)",
          }}
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-ring" />
                <span className="text-emerald-400 text-xs font-semibold tracking-wide uppercase">
                  Live Emergency Feed
                </span>
                <span className="text-white/30 text-xs">•</span>
                <span className="text-white/60 text-xs font-medium">
                  {cleanedRequests.length} Active Platform Records
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Clinical Cases Command
              </h2>
              <p className="text-white/60 text-xs md:text-sm max-w-xl font-medium leading-relaxed">
                Review verified emergency cases, inspect clinical demand across hospitals, and
                expedite donor matching via instant push alerts.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <Link
                href="/broadcast"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#e53935] hover:bg-[#d32f2f] text-white text-xs font-bold transition-all shadow-lg hover:shadow-xl hover:scale-102"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Broadcast Push Alert</span>
              </Link>
            </div>
          </div>

          {/* Decorative ambient glows */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#e53935]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* ─── EXECUTIVE STAT METRICS ROW ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          {[
            {
              label: "Active Clinical Cases",
              value: metrics.totalCases,
              sub: `${metrics.criticalCases} critical triage`,
              icon: <Activity className="w-5 h-5" />,
              accent: "#e53935",
              bgAccent: "#fef2f2",
            },
            {
              label: "Critical Priority",
              value: metrics.criticalCases,
              sub: "Immediate donor required",
              icon: <AlertCircle className="w-5 h-5" />,
              accent: "#f59e0b",
              bgAccent: "#fffbeb",
            },
            {
              label: "Pints Deficit",
              value: `${metrics.totalDeficit} Units`,
              sub: "Pending donor fulfillment",
              icon: <Droplet className="w-5 h-5" />,
              accent: "#3b82f6",
              bgAccent: "#eff6ff",
            },
            {
              label: "Cities Covered",
              value: metrics.coveredCitiesCount,
              sub: "Active medical facilities",
              icon: <MapPin className="w-5 h-5" />,
              accent: "#10b981",
              bgAccent: "#ecfdf5",
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

        {/* ─── BLOOD GROUP QUICK-FILTER CAROUSEL ─── */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs space-y-2.5 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Filter By Blood Group
            </span>
            {selectedGroup !== "all" && (
              <button
                onClick={() => setSelectedGroup("all")}
                className="text-[11px] font-bold text-[#e53935] hover:underline"
              >
                Reset Group Filter
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedGroup("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedGroup === "all"
                  ? "bg-slate-900 text-white shadow-sm scale-102"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
              }`}
            >
              All Groups ({cleanedRequests.length})
            </button>

            {BLOOD_GROUPS.map((bg) => {
              const count = groupCounts[bg] || 0;
              const isSelected = selectedGroup === bg;
              return (
                <button
                  key={bg}
                  onClick={() => setSelectedGroup(isSelected ? "all" : bg)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isSelected
                      ? "bg-[#e53935] text-white shadow-sm scale-102"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60"
                  }`}
                >
                  <span className={isSelected ? "text-white" : "text-[#e53935]"}>{bg}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-slate-200/60 text-slate-600 font-semibold"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── STATUS FILTER TABS ─── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none animate-fade-in-up" style={{ animationDelay: "0.18s" }}>
          {[
            { label: "All Records", value: "all", count: statusCounts.all },
            { label: "Active / Open", value: "open", count: statusCounts.open },
            { label: "Expired", value: "expired", count: statusCounts.expired },
            { label: "Fulfilled", value: "fulfilled", count: statusCounts.fulfilled },
            { label: "Cancelled", value: "cancelled", count: statusCounts.cancelled },
          ].map((tab) => {
            const isSelected = selectedStatus === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setSelectedStatus(tab.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500 font-semibold"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ─── ADVANCED SEARCH & MULTI-FILTER CONSOLE ─── */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by patient name, hospital, city, or blood group..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl pl-9 pr-9 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#e53935] transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Urgency Segmented Pills */}
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs font-semibold">
              {[
                { label: "All", value: "all" },
                { label: "Critical", value: "critical" },
                { label: "High", value: "high" },
                { label: "Normal", value: "normal" },
              ].map((pill) => (
                <button
                  key={pill.value}
                  onClick={() => setSelectedUrgency(pill.value)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    selectedUrgency === pill.value
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* City Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Cities ({distinctCities.length})</option>
                {distinctCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-[#e53935] hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* ─── CLINICAL CASES TABLE CONTAINER ─── */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
          <div className="p-5 px-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                Live Clinical Emergency Records
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Showing {filteredRequests.length} of {cleanedRequests.length} case records
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const csv = generateRequestsCSV(filteredRequests);
                  downloadCSV(`lifelink_blood_requests_${new Date().toISOString().split("T")[0]}.csv`, csv);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                Export Cases (CSV)
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-5">Blood</th>
                  <th className="py-3 px-5">Patient & Attendant</th>
                  <th className="py-3 px-5">Hospital & City</th>
                  <th className="py-3 px-5">Fulfillment Progress</th>
                  <th className="py-3 px-5">Urgency</th>
                  <th className="py-3 px-5">Case Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      <div className="inline-block w-8 h-8 border-3 border-[#e53935] border-t-transparent rounded-full animate-spin mb-3" />
                      <p className="font-bold text-slate-700 text-sm">Retrieving Live Emergency Feed...</p>
                      <p className="text-xs text-slate-400 mt-1">Connecting to clinical backend database</p>
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      <HeartHandshake className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                      <p className="font-bold text-slate-700 text-sm">No clinical cases match your filters</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Try clearing your search query, selecting "All Groups", or clearing city and urgency filters.
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={clearAllFilters}
                          className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 transition-colors"
                        >
                          Clear All Filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((item) => {
                    const avatar = item.patientImage || item.patient_image || null;
                    const contact = item.contact_number || item.phone || null;

                    return (
                      <tr
                        key={item.id}
                        onClick={() => router.push(`/requests/${item.id}`)}
                        className="hover:bg-slate-50/75 transition-colors cursor-pointer group"
                      >
                        {/* Blood Badge */}
                        <td className="py-4 px-5">
                          <BloodBadge bloodGroup={item.bloodGroup} size="sm" />
                        </td>

                        {/* Patient & Info */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              src={avatar}
                              name={item.patientName}
                              size="sm"
                            />
                            <div>
                              <div className="font-extrabold text-slate-900 group-hover:text-[#e53935] transition-colors text-xs">
                                {item.patientName}
                              </div>
                              <div className="text-[11px] text-slate-400 font-medium">
                                {contact || "Attendant on file"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Hospital & City */}
                        <td className="py-4 px-5">
                          <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[180px]">{item.hospitalName}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{item.city}</span>
                          </div>
                        </td>

                        {/* Units Fulfilled vs Needed Progress */}
                        <td className="py-4 px-5">
                          <div className="w-36 space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-700">
                                {item.unitsFulfilled} of {item.unitsReq} units
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400">
                                {item.progressPercent}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  item.progressPercent >= 100
                                    ? "bg-emerald-500"
                                    : item.progressPercent > 0
                                    ? "bg-amber-500"
                                    : "bg-[#e53935]"
                                }`}
                                style={{ width: `${Math.max(item.progressPercent, 5)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Urgency */}
                        <td className="py-4 px-5">
                          <StatusPill status={item.urgency} type="urgency" />
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5">
                          <StatusPill status={item.status} type="status" />
                        </td>

                        {/* Action CTA */}
                        <td className="py-4 px-5 text-right">
                          <Link
                            href={`/requests/${item.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 group-hover:bg-[#e53935] group-hover:text-white text-slate-700 font-bold text-xs transition-all shadow-2xs"
                          >
                            <span>Review</span>
                            <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
