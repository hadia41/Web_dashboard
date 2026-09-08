"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { api } from "@/lib/api";
import { resolveCityFromItem } from "@/lib/cityUtils";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  User,
  Droplet,
  X,
  ShieldCheck,
  Ban,
  UserX,
  FileWarning,
  Activity,
  ChevronRight,
  Filter,
  Sparkles,
} from "lucide-react";

interface ReportItem {
  id: string;
  reporter_id?: string;
  target_type: "request" | "user";
  target_id: string;
  reason: string;
  description?: string;
  category?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  action_taken?: string;
  admin_notes?: string;
  created_at: string;
  reporter?: {
    id?: string;
    full_name?: string;
    phone?: string;
    profile_image?: string;
  };
  target?: {
    id?: string;
    full_name?: string;
    phone?: string;
    blood_group?: string;
    patient_name?: string;
    hospital_name?: string;
    city_id?: string;
    city?: string;
    urgency?: string;
  };
}

interface ReportStats {
  total_reports: number;
  pending_reports: number;
  reviewed_reports: number;
  resolved_reports: number;
  dismissed_reports: number;
  request_reports: number;
  user_reports: number;
  urgent_pending_reports: number;
}

export default function SupportAndModerationPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [stats, setStats] = useState<ReportStats>({
    total_reports: 0,
    pending_reports: 0,
    reviewed_reports: 0,
    resolved_reports: 0,
    dismissed_reports: 0,
    request_reports: 0,
    user_reports: 0,
    urgent_pending_reports: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [targetFilter, setTargetFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Action Modal State
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [actionType, setActionType] = useState<string>("user_suspended");
  const [adminNotes, setAdminNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchReportsAndStats = async () => {
    setIsRefreshing(true);
    try {
      const [reportsRes, statsRes] = await Promise.all([
        api.getReports({
          status: statusFilter === "all" ? undefined : statusFilter,
          target_type: targetFilter === "all" ? undefined : targetFilter,
          search: searchQuery.trim() || undefined,
        }),
        api.getReportStats(),
      ]);

      if (reportsRes.success && reportsRes.data) {
        const list = reportsRes.data.reports || reportsRes.data;
        setReports(Array.isArray(list) ? list : []);
      }

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchReportsAndStats();
  }, [statusFilter, targetFilter]);

  const handleApplyAction = async () => {
    if (!selectedReport) return;
    setIsSubmitting(true);
    try {
      const res = await api.takeReportAction(selectedReport.id, {
        action_taken: actionType,
        admin_notes: adminNotes || undefined,
        status: actionType === "dismissed" ? "dismissed" : "resolved",
      });

      if (res.success) {
        setActionNotice("Disciplinary action applied successfully!");
        setTimeout(() => {
          setSelectedReport(null);
          setActionNotice(null);
          setAdminNotes("");
          fetchReportsAndStats();
        }, 1200);
      } else {
        alert(res.error || "Failed to execute disciplinary action.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to connect to backend server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchReason = item.reason?.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        const matchReporter = item.reporter?.full_name?.toLowerCase().includes(q);
        const matchUser = item.target?.full_name?.toLowerCase().includes(q);
        const matchPatient = item.target?.patient_name?.toLowerCase().includes(q);
        const matchHospital = item.target?.hospital_name?.toLowerCase().includes(q);
        if (
          !matchReason &&
          !matchDesc &&
          !matchReporter &&
          !matchUser &&
          !matchPatient &&
          !matchHospital
        ) {
          return false;
        }
      }
      return true;
    });
  }, [reports, searchQuery]);

  const complianceRate = useMemo(() => {
    if (!stats.total_reports) return 100;
    return Math.round(((stats.resolved_reports + stats.dismissed_reports) / stats.total_reports) * 100);
  }, [stats]);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#f8f9fb" }}>
      <Header
        title="Reports & Moderation"
        subtitle="Review incident reports, take disciplinary actions on users, and moderate blood requests"
        onRefresh={fetchReportsAndStats}
        isRefreshing={isRefreshing}
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
                  Trust & Safety Command
                </span>
                <span className="text-white/30 text-xs">•</span>
                <span className="text-white/60 text-xs font-medium">
                  {stats.pending_reports} Incidents Pending Triage
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Community Integrity & Moderation
              </h2>
              <p className="text-white/60 text-xs md:text-sm max-w-xl font-medium leading-relaxed">
                Investigate safety infractions, enforce platform rules, revoke rogue sessions, and
                de-list fraudulent emergency requests to protect patients and donors.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center min-w-[130px]">
                <div className="text-2xl font-black text-white leading-none">
                  {complianceRate}%
                </div>
                <div className="text-[11px] font-bold text-white/60 mt-1 uppercase tracking-wider">
                  Resolved Rate
                </div>
              </div>
            </div>
          </div>

          {/* Decorative ambient glows */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#e53935]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* ─── EXECUTIVE TRIAGE KPI CARDS ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          {[
            {
              label: "Pending Review",
              value: stats.pending_reports,
              sub: "Requires moderator action",
              icon: <ShieldAlert className="w-5 h-5" />,
              accent: "#e53935",
              bgAccent: "#fef2f2",
            },
            {
              label: "Urgent Escalations",
              value: stats.urgent_pending_reports,
              sub: "Fraud or harassment flags",
              icon: <AlertTriangle className="w-5 h-5" />,
              accent: "#f59e0b",
              bgAccent: "#fffbeb",
            },
            {
              label: "Penalties Enforced",
              value: stats.resolved_reports,
              sub: "Banned, suspended, cancelled",
              icon: <CheckCircle2 className="w-5 h-5" />,
              accent: "#10b981",
              bgAccent: "#ecfdf5",
            },
            {
              label: "All-Time Reports",
              value: stats.total_reports,
              sub: "Platform community audit log",
              icon: <ShieldCheck className="w-5 h-5" />,
              accent: "#64748b",
              bgAccent: "#f8fafc",
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

        {/* ─── FILTERS & SEARCH CONSOLE ─── */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs font-semibold overflow-x-auto w-full md:w-auto scrollbar-none">
            {[
              { label: "All", value: "all", count: stats.total_reports },
              { label: "Pending", value: "pending", count: stats.pending_reports },
              { label: "Reviewed", value: "reviewed", count: stats.reviewed_reports },
              { label: "Resolved", value: "resolved", count: stats.resolved_reports },
              { label: "Dismissed", value: "dismissed", count: stats.dismissed_reports },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all shrink-0 ${
                  statusFilter === tab.value
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    statusFilter === tab.value
                      ? "bg-slate-100 text-slate-800 font-bold"
                      : "bg-slate-200/50 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Target Filter Segmented Chips */}
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs font-semibold">
              {[
                { label: "All Targets", value: "all" },
                { label: "Users", value: "user" },
                { label: "Requests", value: "request" },
              ].map((chip) => (
                <button
                  key={chip.value}
                  onClick={() => setTargetFilter(chip.value)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    targetFilter === chip.value
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reason, reporter, violator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#e53935] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── INCIDENTS QUEUE TABLE CONTAINER ─── */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="p-5 px-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                Reported Safety Incidents & Evidence
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Showing {filteredReports.length} flagged cases in queue
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              Select "Moderate" on any item to open disciplinary enforcement options
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-5">Target Entity</th>
                  <th className="py-3 px-5">Reported Violation</th>
                  <th className="py-3 px-5">Reporter</th>
                  <th className="py-3 px-5">Priority</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Action Taken</th>
                  <th className="py-3 px-5">Timestamp</th>
                  <th className="py-3 px-5 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400">
                      <div className="inline-block w-8 h-8 border-3 border-[#e53935] border-t-transparent rounded-full animate-spin mb-3" />
                      <p className="font-bold text-slate-700 text-sm">Retrieving Moderation Records...</p>
                      <p className="text-xs text-slate-400 mt-1">Inspecting safety queue and platform reports</p>
                    </td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400">
                      <ShieldCheck className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                      <p className="font-bold text-slate-700 text-sm">Safety Queue Clear</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        No flagged incidents match your selected filters. All platform reports are currently reviewed.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => {
                    const isUser = report.target_type === "user";
                    const targetName = isUser
                      ? report.target?.full_name || "User Account"
                      : report.target?.patient_name || "Blood Request";
                    const targetSub = isUser
                      ? report.target?.phone || `ID: ${report.target_id.slice(0, 10)}...`
                      : `${report.target?.hospital_name || "Hospital"} • ${resolveCityFromItem(report.target)}`;

                    return (
                      <tr
                        key={report.id}
                        className="hover:bg-slate-50/75 transition-colors group"
                      >
                        {/* Target Entity */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            {isUser ? (
                              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                                <User className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-red-50 border border-red-200 text-[#e53935] flex items-center justify-center font-black text-xs shrink-0">
                                <Droplet className="w-4 h-4" />
                              </div>
                            )}
                            <div>
                              <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                                <span>{targetName}</span>
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 uppercase">
                                  {report.target_type}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 font-medium truncate max-w-[180px]">
                                {targetSub}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Reported Violation */}
                        <td className="py-4 px-5 max-w-xs">
                          <div className="font-bold text-slate-900 text-xs">
                            {report.reason}
                          </div>
                          {report.description && (
                            <div className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                              "{report.description}"
                            </div>
                          )}
                        </td>

                        {/* Reporter */}
                        <td className="py-4 px-5">
                          <div className="font-bold text-slate-800 text-xs">
                            {report.reporter?.full_name || "Anonymous Donor"}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            {report.reporter?.phone || "Verified User"}
                          </div>
                        </td>

                        {/* Priority */}
                        <td className="py-4 px-5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide ${
                              report.priority === "urgent"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : report.priority === "high"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {report.priority || "normal"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold capitalize ${
                              report.status === "pending"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : report.status === "resolved"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : report.status === "dismissed"
                                ? "bg-slate-100 text-slate-500 border border-slate-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {report.status}
                          </span>
                        </td>

                        {/* Action Taken */}
                        <td className="py-4 px-5">
                          {report.action_taken && report.action_taken !== "none" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200/80">
                              {report.action_taken === "user_banned" ? (
                                <>
                                  <Ban className="w-3 h-3 text-red-600" /> Banned
                                </>
                              ) : report.action_taken === "user_suspended" ? (
                                <>
                                  <UserX className="w-3 h-3 text-amber-600" /> Suspended
                                </>
                              ) : report.action_taken === "request_cancelled" ? (
                                <>
                                  <FileWarning className="w-3 h-3 text-red-600" /> Cancelled
                                </>
                              ) : (
                                report.action_taken
                              )}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px] font-medium">—</span>
                          )}
                        </td>

                        {/* Timestamp */}
                        <td className="py-4 px-5 text-slate-500 font-medium whitespace-nowrap">
                          {new Date(report.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>

                        {/* Moderation Button */}
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => {
                              setSelectedReport(report);
                              setActionType(
                                report.target_type === "user"
                                  ? "user_suspended"
                                  : "request_cancelled"
                              );
                              setAdminNotes("");
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#e53935] hover:bg-[#d32f2f] text-white font-bold text-xs transition-all shadow-xs"
                          >
                            <span>Moderate</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
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

      {/* ─── DISCIPLINARY ENFORCEMENT MODAL ─── */}
      {selectedReport && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 z-50 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200/80 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-50/80 via-slate-50 to-white p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center text-[#e53935] shadow-2xs shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 tracking-tight">
                    Trust & Safety Moderation Review
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="font-mono font-bold text-slate-700">
                      Case #{selectedReport.id.slice(0, 8)}
                    </span>
                    <span>•</span>
                    <span>
                      {selectedReport.created_at
                        ? new Date(selectedReport.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Recent Incident"}
                    </span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors shadow-2xs shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Evidence & Target Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Reported Entity
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200/80 text-slate-700 uppercase">
                      {selectedReport.target_type === "user" ? "User Profile" : "Blood Request"}
                    </span>
                    {selectedReport.priority && (
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                          selectedReport.priority === "urgent"
                            ? "bg-red-100 text-red-700"
                            : selectedReport.priority === "high"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {selectedReport.priority} Priority
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  {selectedReport.target_type === "user" ? (
                    <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-red-100 border border-red-200 text-[#e53935] flex items-center justify-center font-black text-xs shrink-0">
                      {selectedReport.target?.blood_group || "O+"}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h4 className="font-extrabold text-slate-900 text-sm truncate">
                      {selectedReport.target_type === "user"
                        ? selectedReport.target?.full_name || "User Account"
                        : selectedReport.target?.patient_name || "Blood Request"}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">
                      {selectedReport.target_type === "user"
                        ? selectedReport.target?.phone || `ID: ${selectedReport.target_id.slice(0, 16)}`
                        : `${selectedReport.target?.hospital_name || "Hospital"} • ${resolveCityFromItem(
                            selectedReport.target
                          )}`}
                    </p>
                  </div>
                </div>

                {/* Violation Statement */}
                <div className="pt-2 border-t border-slate-200/60 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700">Reported Violation:</span>
                    <span className="text-slate-400">
                      Reported by {selectedReport.reporter?.full_name || "Community Member"}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#e53935]">
                    "{selectedReport.reason}"
                  </p>
                  {selectedReport.description && (
                    <div className="bg-white border-l-3 border-[#e53935] p-2.5 rounded-r-xl text-xs text-slate-600 leading-relaxed font-medium mt-1">
                      {selectedReport.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Selection (Interactive Cards) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Select Disciplinary Action
                </label>

                <div className="space-y-2">
                  {selectedReport.target_type === "user" ? (
                    <>
                      {/* Suspend */}
                      <div
                        onClick={() => setActionType("user_suspended")}
                        className={`cursor-pointer rounded-2xl p-3.5 border transition-all flex items-start gap-3 ${
                          actionType === "user_suspended"
                            ? "border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20 shadow-2xs"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            actionType === "user_suspended"
                              ? "bg-amber-500 text-white"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          <UserX className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900">
                              Temporary Account Suspension
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                              Reversible
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Temporarily disables user profile and hides from all donor searches.
                          </p>
                        </div>
                      </div>

                      {/* Permanent Ban */}
                      <div
                        onClick={() => setActionType("user_banned")}
                        className={`cursor-pointer rounded-2xl p-3.5 border transition-all flex items-start gap-3 ${
                          actionType === "user_banned"
                            ? "border-red-500 bg-red-50/60 ring-2 ring-red-500/20 shadow-2xs"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            actionType === "user_banned"
                              ? "bg-red-600 text-white"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          <Ban className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900">
                              Permanent Account Ban
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                              High Severity
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Permanently bans account, revokes sessions, and cancels open blood requests.
                          </p>
                        </div>
                      </div>

                      {/* Warning */}
                      <div
                        onClick={() => setActionType("warning_issued")}
                        className={`cursor-pointer rounded-2xl p-3.5 border transition-all flex items-start gap-3 ${
                          actionType === "warning_issued"
                            ? "border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-2xs"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            actionType === "warning_issued"
                              ? "bg-blue-600 text-white"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <span className="font-bold text-xs text-slate-900 block">
                            Issue Official Warning Notice
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Logs infraction in records and pushes a disciplinary warning alert to the user.
                          </p>
                        </div>
                      </div>

                      {/* Dismiss */}
                      <div
                        onClick={() => setActionType("dismissed")}
                        className={`cursor-pointer rounded-2xl p-3.5 border transition-all flex items-start gap-3 ${
                          actionType === "dismissed"
                            ? "border-slate-500 bg-slate-100 ring-2 ring-slate-400/20 shadow-2xs"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            actionType === "dismissed"
                              ? "bg-slate-700 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <span className="font-bold text-xs text-slate-900 block">
                            Dismiss Report (Unfounded or Invalid)
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Marks report as resolved without penalizing the user.
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Cancel Request */}
                      <div
                        onClick={() => setActionType("request_cancelled")}
                        className={`cursor-pointer rounded-2xl p-3.5 border transition-all flex items-start gap-3 ${
                          actionType === "request_cancelled"
                            ? "border-red-500 bg-red-50/60 ring-2 ring-red-500/20 shadow-2xs"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            actionType === "request_cancelled"
                              ? "bg-red-600 text-white"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          <FileWarning className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900">
                              Cancel & Take Down Request
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                              Immediate Takedown
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Immediately marks request as cancelled and removes it from the donor feed.
                          </p>
                        </div>
                      </div>

                      {/* Requester Warning */}
                      <div
                        onClick={() => setActionType("warning_issued")}
                        className={`cursor-pointer rounded-2xl p-3.5 border transition-all flex items-start gap-3 ${
                          actionType === "warning_issued"
                            ? "border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20 shadow-2xs"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            actionType === "warning_issued"
                              ? "bg-amber-500 text-white"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <span className="font-bold text-xs text-slate-900 block">
                            Issue Requester Warning
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Pushes formal warning to the patient or hospital contact number.
                          </p>
                        </div>
                      </div>

                      {/* Dismiss Request */}
                      <div
                        onClick={() => setActionType("dismissed")}
                        className={`cursor-pointer rounded-2xl p-3.5 border transition-all flex items-start gap-3 ${
                          actionType === "dismissed"
                            ? "border-slate-500 bg-slate-100 ring-2 ring-slate-400/20 shadow-2xs"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            actionType === "dismissed"
                              ? "bg-emerald-600 text-white"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <span className="font-bold text-xs text-slate-900 block">
                            Dismiss Report (Verified Genuine)
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Keep blood request live and active on platform.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Internal Admin Audit Note */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Internal Administrative Audit Note
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">Optional</span>
                </div>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record rationale for decision (visible only in platform audit logs)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#e53935] transition-all resize-none"
                />

                {/* Quick chip shortcuts */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    "+ Confirmed fraud",
                    "+ Fake contact number",
                    "+ Inappropriate communication",
                    "+ Duplicate spam",
                    "+ Verified genuine",
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() =>
                        setAdminNotes((prev) =>
                          prev ? `${prev}, ${chip.replace("+ ", "")}` : chip.replace("+ ", "")
                        )
                      }
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-600 transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback toast */}
              {actionNotice && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{actionNotice}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleApplyAction}
                className={`px-5 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-md transition-all flex items-center gap-2 ${
                  actionType === "user_banned" || actionType === "request_cancelled"
                    ? "bg-red-600 hover:bg-red-700"
                    : actionType === "user_suspended"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : actionType === "warning_issued"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-slate-800 hover:bg-slate-900"
                }`}
              >
                {isSubmitting && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>
                  {actionType === "user_banned"
                    ? "Confirm Permanent Ban"
                    : actionType === "user_suspended"
                    ? "Confirm Account Suspension"
                    : actionType === "request_cancelled"
                    ? "Confirm Request Cancellation"
                    : actionType === "warning_issued"
                    ? "Send Official Warning"
                    : "Dismiss Incident Report"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
