"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { BloodBadge } from "@/components/BloodBadge";
import { StatusPill } from "@/components/StatusPill";
import { UserAvatar } from "@/components/UserAvatar";
import { api } from "@/lib/api";
import { resolveCityFromItem } from "@/lib/cityUtils";
import {
  History,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  ExternalLink,
  MapPin,
  Building2,
  Calendar,
  X,
  HeartHandshake,
  Droplet,
} from "lucide-react";

export default function DonationsHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchDonations = async (statusOverride?: string) => {
    setLoading(true);
    const statusToQuery = statusOverride !== undefined ? statusOverride : statusFilter;
    try {
      const res = await api.getDonationHistory({
        status: statusToQuery,
        limit: 50,
      });

      if (res.success && res.data) {
        const list = res.data.donations || [];
        setDonations(Array.isArray(list) ? list : []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      } else {
        setDonations([]);
      }
    } catch (err) {
      console.error("Failed to load donation history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations(statusFilter);
  }, [statusFilter]);

  // Clean and filter donations
  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      const q = search.trim().toLowerCase();
      if (q) {
        const donorName = (d.donor?.full_name || "").toLowerCase();
        const patientName = (d.request?.patient_name || "").toLowerCase();
        const hospital = (d.request?.hospital_name || "").toLowerCase();
        const city = (d.request?.city || d.donor?.city || "").toLowerCase();
        if (
          !donorName.includes(q) &&
          !patientName.includes(q) &&
          !hospital.includes(q) &&
          !city.includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [donations, search]);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#f8f9fb" }}>
      <Header
        title="Donation Records & Audit Log"
        subtitle="Platform-wide transfusion logs, verified donor commitments, and audit trail"
        onRefresh={() => fetchDonations(statusFilter)}
        isRefreshing={loading}
      />

      <div className="p-5 md:p-8 max-w-[1360px] mx-auto w-full space-y-7">
        {/* ─── BANNER ─── */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 md:p-8 text-white shadow-xl"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          }}
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-xs font-semibold tracking-wide uppercase">
                  Audited Platform Transfusions (UC-10)
                </span>
                <span className="text-white/30 text-xs">•</span>
                <span className="text-white/60 text-xs font-medium">
                  {stats?.total ?? donations.length} Recorded Transfusions
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Donation Fulfillment Trail
              </h2>
              <p className="text-white/60 text-xs md:text-sm max-w-xl font-medium leading-relaxed">
                Review complete donation lifecycles, inspect completed hospital transfusions, verify
                active donation pledges, and audit life-saving milestones across Pakistan.
              </p>
            </div>
          </div>
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* ─── METRICS ROW ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <History className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none">
              {stats?.total ?? donations.length}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Total Records</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Audited donation events</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 tracking-tight leading-none">
              {stats?.completed ?? 0}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Completed Transfusions</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Fulfilled at medical center</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-amber-600 tracking-tight leading-none">
              {stats?.intent ?? 0}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Active Pledges</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Donor pledged / in transit</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center font-bold">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-600 tracking-tight leading-none">
              {stats?.cancelled ?? 0}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Cancelled Pledges</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Withdrawn or expired</div>
          </div>
        </div>

        {/* ─── STATUS TABS & SEARCH ─── */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs font-semibold overflow-x-auto w-full md:w-auto">
            {[
              { label: "All Records", value: "all" },
              { label: "Completed", value: "completed" },
              { label: "Pledged (Intent)", value: "intent" },
              { label: "Cancelled", value: "cancelled" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === tab.value
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search donor, patient, or hospital..."
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
        </div>

        {/* ─── DONATIONS AUDIT TABLE ─── */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
          <div className="p-5 px-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Audited Transfusion Records</h3>
              <p className="text-[11px] text-slate-400">
                Showing {filteredDonations.length} records matching current filter
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading donation records...
            </div>
          ) : filteredDonations.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <HeartHandshake className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="font-semibold text-slate-600">No donation records found</p>
              <p className="mt-1">There are no records matching your selected filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-6">Timestamp & ID</th>
                    <th className="py-3 px-4">Donor Volunteer</th>
                    <th className="py-3 px-4">Clinical Case / Patient</th>
                    <th className="py-3 px-4">Hospital & City</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-6 text-right">Associated Case</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredDonations.map((d) => {
                    const st = (d.status || "intent").toLowerCase();
                    const dateStr = d.created_at
                      ? new Date(d.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A";

                    return (
                      <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{dateStr}</span>
                          </div>
                          <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                            {d.id?.slice(0, 8)}...
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <UserAvatar
                              src={d.donor?.profile_image}
                              name={d.donor?.full_name || "Donor"}
                              size="sm"
                            />
                            <div>
                              <div className="font-bold text-slate-800">
                                {d.donor?.full_name || "Verified Donor"}
                              </div>
                              <div className="flex items-center gap-1 mt-0.5">
                                {d.donor?.blood_group && (
                                  <BloodBadge bloodGroup={d.donor.blood_group} size="sm" />
                                )}
                                {d.donor?.phone && (
                                  <span className="text-[10px] text-slate-400">
                                    • {d.donor.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {d.request ? (
                            <div>
                              <span className="font-bold text-slate-800">
                                {d.request.patient_name || "Emergency Patient"}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-slate-400">Demanded:</span>
                                <BloodBadge bloodGroup={d.request.blood_group} size="sm" />
                                <span className="text-[10px] text-slate-500 font-semibold">
                                  ({d.request.units_required || 1} Pints)
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Direct Donation</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 font-medium text-slate-700">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[160px]">
                              {d.request?.hospital_name || "Medical Facility"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-300 shrink-0" />
                            <span>{d.request?.city || d.donor?.city || "Pakistan"}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {st === "completed" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Completed
                            </span>
                          ) : st === "cancelled" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                              <XCircle className="w-3 h-3 text-slate-400" />
                              Cancelled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Pledged (Intent)
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-6 text-right">
                          {d.request?.id ? (
                            <Link
                              href={`/requests/${d.request.id}`}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline"
                            >
                              <span>View Case</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          ) : (
                            <span className="text-slate-300 text-[10px]">--</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
