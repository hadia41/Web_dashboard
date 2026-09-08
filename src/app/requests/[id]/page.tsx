"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { BloodBadge } from "@/components/BloodBadge";
import { StatusPill } from "@/components/StatusPill";
import { api } from "@/lib/api";
import { resolveCityFromItem, getProvinceByCityId } from "@/lib/cityUtils";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  MessageCircle,
  Radio,
  Copy,
  Check,
  Clock,
  Calendar,
  User,
  Users,
  ShieldCheck,
  Droplet,
  HeartHandshake,
  AlertTriangle,
  CheckCircle2,
  Share2,
  ExternalLink,
  Activity,
  FileText,
  AlertCircle,
  Stethoscope,
  Navigation,
  Sparkles,
  Info,
} from "lucide-react";

const BLOOD_COMPATIBILITY: Record<string, { donateTo: string; receiveFrom: string }> = {
  "O+": { donateTo: "O+, A+, B+, AB+", receiveFrom: "O+, O-" },
  "O-": { donateTo: "Universal Donor (All Types)", receiveFrom: "O- only" },
  "A+": { donateTo: "A+, AB+", receiveFrom: "A+, A-, O+, O-" },
  "A-": { donateTo: "A+, A-, AB+, AB-", receiveFrom: "A-, O-" },
  "B+": { donateTo: "B+, AB+", receiveFrom: "B+, B-, O+, O-" },
  "B-": { donateTo: "B+, B-, AB+, AB-", receiveFrom: "B-, O-" },
  "AB+": { donateTo: "AB+ only", receiveFrom: "Universal Recipient (All Types)" },
  "AB-": { donateTo: "AB+, AB-", receiveFrom: "AB-, A-, B-, O-" },
};

export default function BloodRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<any | null>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const [detailRes, donationsRes] = await Promise.all([
        api.getRequestDetails(id),
        api.getDonationsForRequest(id),
      ]);

      if (detailRes.success && detailRes.data) {
        setRequest(detailRes.data);
      } else {
        setRequest(null);
      }

      if (donationsRes.success && donationsRes.data) {
        const donationsList = donationsRes.data.donations || donationsRes.data || [];
        setDonations(Array.isArray(donationsList) ? donationsList : []);
      } else {
        setDonations([]);
      }
    } catch (err) {
      console.error("Failed to load request details:", err);
      setRequest(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!request) return;
    setUpdatingStatus(true);
    setStatusFeedback(null);
    try {
      const res = await api.updateRequestStatus(request.id, newStatus);
      if (res.success) {
        setRequest((prev: any) => ({ ...prev, status: newStatus }));
        setStatusFeedback(`Emergency record status successfully updated to "${newStatus.replace("_", " ").toUpperCase()}".`);
        setTimeout(() => setStatusFeedback(null), 3500);
      } else {
        alert(res.error || "Failed to update request status.");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to connect to backend server.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header
          title="Clinical Case Command"
          subtitle="Loading emergency medical record..."
        />
        <div className="p-16 text-center text-slate-500">
          <div className="inline-block w-8 h-8 border-3 border-[#E53935] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="font-bold text-slate-700 text-sm">Retrieving Live Emergency Case...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header
          title="Blood Request Details"
          subtitle="Case record not found"
        />
        <div className="p-16 max-w-md mx-auto text-center space-y-4">
          <div className="w-14 h-14 rounded-3xl bg-red-100 border border-red-200 flex items-center justify-center mx-auto text-[#E53935]">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Request Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The requested emergency blood case record does not exist or has been removed by the administration.
          </p>
          <Link
            href="/requests"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Requests
          </Link>
        </div>
      </div>
    );
  }

  // Format clean data
  const unitsReq = Number(request.units_required || request.units || 1);
  const completedDonationsCount = donations.filter((d: any) => d.status === "completed").length;
  // If donor records exist, keep progress in sync with the completed donors list
  const unitsFulfilled = donations.length > 0
    ? completedDonationsCount
    : Number(request.fulfilled_units || 0);
  const unitsRemaining = Math.max(0, unitsReq - unitsFulfilled);
  const progressPercent = Math.min(100, Math.round((unitsFulfilled / unitsReq) * 100));

  // Format clean city name using cities.json (matching mobile app)
  const displayCity = resolveCityFromItem(request);
  const displayProvince = request.state || getProvinceByCityId(request.city_id || displayCity) || "Pakistan";

  // Contact phones
  const emergencyPhone = request.contact_number;
  const emergencyClean = emergencyPhone ? emergencyPhone.replace(/\s+/g, "") : null;
  const emergencyWa = emergencyPhone ? emergencyPhone.replace(/[^0-9]/g, "") : null;

  const requesterPhone = request.requester?.phone;
  const requesterClean = requesterPhone ? requesterPhone.replace(/\s+/g, "") : null;
  const requesterWa = requesterPhone ? requesterPhone.replace(/[^0-9]/g, "") : null;

  // Requester & Patient Info
  const requesterName = request.requester?.full_name || request.requester?.name || "Community Member";
  const patientName = request.patient_name || request.patientName || "Emergency Patient";
  const bloodGroup = request.blood_group || "O+";
  const compatibility = BLOOD_COMPATIBILITY[bloodGroup] || { donateTo: "Compatible types", receiveFrom: "Compatible types" };

  const createdDate = new Date(request.created_at);
  const formattedCreatedDate = `${createdDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  })}, ${createdDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })}`;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header
        title="Clinical Case Command"
        subtitle={`Live Emergency Record • ${patientName} • ${displayCity}`}
        onRefresh={fetchDetails}
      />

      <div className="p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
        {/* Navigation Breadcrumbs & Top Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/requests"
              className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-bold bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Requests
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-400 font-medium">Cases</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-900 truncate max-w-[220px]">
              {patientName}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleCopy(window.location.href)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors shadow-2xs"
            >
              {copiedId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Share Case</span>
                </>
              )}
            </button>

            <Link
              href={`/broadcast?city=${encodeURIComponent(displayCity)}&blood_group=${encodeURIComponent(
                bloodGroup
              )}&title=${encodeURIComponent(`URGENT: ${bloodGroup} Blood Needed for ${patientName}`)}`}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#E53935] hover:bg-[#D32F2F] text-white font-bold text-xs transition-colors shadow-sm"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Broadcast Push Alert</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Status Feedback Toast */}
        {statusFeedback && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-4 rounded-2xl flex items-center gap-3 font-bold shadow-2xs animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{statusFeedback}</span>
          </div>
        )}

        {/* Hero Clinical Banner Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative">
            <div className="flex items-start gap-5">
              <div className="relative shrink-0">
                <BloodBadge bloodGroup={bloodGroup} size="lg" />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center shadow-xs">
                  <Droplet className="w-2.5 h-2.5 text-white fill-white" />
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                    {patientName}
                  </h1>
                  <StatusPill status={request.urgency || "normal"} type="urgency" />
                  <StatusPill status={request.status || "open"} type="status" />
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Building2 className="w-4 h-4 text-[#E53935]" />
                    {request.hospital_name || "Hospital Facility"}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-red-500" />
                    {displayCity}, {displayProvince}
                  </span>
                  {request.hospital_address && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">{request.hospital_address}</span>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                  <button
                    onClick={() => handleCopy(request.id)}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-mono bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>ID: {request.id.slice(0, 8)}...</span>
                  </button>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formattedCreatedDate}
                  </span>
                  {request.time_left && (
                    <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md font-bold">
                      <Clock className="w-3 h-3" /> {request.time_left}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Direct Administrative Controls */}
            <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-4 flex flex-col gap-2 shrink-0 w-full lg:w-auto shadow-2xs">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Direct Administrative Status
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Syncs to mobile app</span>
              </div>
              <div className="flex items-center gap-2">
                {["open", "fulfilled", "cancelled"].map((st) => {
                  const isActive = request.status === st;
                  return (
                    <button
                      key={st}
                      disabled={updatingStatus || isActive}
                      onClick={() => handleStatusChange(st)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-all flex items-center gap-1.5 ${
                        isActive
                          ? st === "fulfilled"
                            ? "bg-emerald-600 text-white shadow-xs"
                            : st === "cancelled"
                            ? "bg-slate-700 text-white shadow-xs"
                            : "bg-[#E53935] text-white shadow-xs"
                          : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {isActive && <Check className="w-3.5 h-3.5" />}
                      <span>{st}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* KPI Clinical Metric Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Units Required
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {unitsReq} <span className="text-sm font-semibold text-slate-400">Pints</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Target blood volume</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Units Received
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {unitsFulfilled} <span className="text-sm font-semibold text-slate-400">Fulfilled</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{progressPercent}% of target reached</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Remaining Deficit
            </span>
            <div className="text-2xl font-black text-[#E53935] mt-1">
              {unitsRemaining} <span className="text-sm font-semibold text-slate-400">Needed</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {unitsRemaining === 0 ? "Goal fully satisfied" : "⚠️ Urgent donors required"}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Urgency Level
            </span>
            <div className="text-2xl font-black capitalize text-slate-900 mt-1">
              {request.urgency || "Normal"}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Triaged medical priority</p>
          </div>
        </div>

        {/* Donation Milestone Progress Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-[#E53935]" />
              <h3 className="font-bold text-sm text-slate-900">Donation Progress</h3>
            </div>
            <span className="font-black text-sm text-slate-900">
              {unitsFulfilled} of {unitsReq} Units Fulfilled ({progressPercent}%)
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200/60">
            <div
              className={`h-2.5 rounded-full transition-all duration-700 ${
                progressPercent >= 100
                  ? "bg-emerald-500"
                  : progressPercent > 0
                  ? "bg-amber-500"
                  : "bg-[#E53935]"
              }`}
              style={{ width: `${Math.max(progressPercent, 4)}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
            <span>
              {unitsRemaining > 0 ? (
                <span className="text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                  ⚠️ {unitsRemaining} unit{unitsRemaining === 1 ? "" : "s"} still required
                </span>
              ) : (
                <span className="text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                  ✅ Emergency Target Fulfilled
                </span>
              )}
            </span>
            <span className="font-semibold text-slate-600">Target: {unitsReq} units</span>
          </div>
        </div>

        {/* Donors / Fulfilled By Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#E53935]" />
              Donors & Respondents
            </h3>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {donations.length} Response{donations.length !== 1 ? "s" : ""}
            </span>
          </div>

          {donations.length === 0 ? (
            <div className="text-center py-8">
              <HeartHandshake className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-400">No donor responses yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Donors will appear here once they accept this blood request from the mobile app.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {donations.map((donation: any, idx: number) => {
                const donor = donation.donor || donation.user || {};
                const donorName = donor.full_name || donor.name || `Donor ${idx + 1}`;
                const donorPhone = donor.phone || null;
                const donorBlood = donor.blood_group || "—";
                const donorCity = donor.city || "—";
                const donorAvatar = donor.profile_image || null;
                const donationStatus = (donation.status || "intent").toLowerCase();
                const donationDate = donation.created_at
                  ? new Date(donation.created_at).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "";

                const statusColors: Record<string, string> = {
                  intent: "bg-blue-50 text-blue-700 border-blue-200",
                  confirmed: "bg-amber-50 text-amber-700 border-amber-200",
                  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
                  cancelled: "bg-slate-100 text-slate-500 border-slate-200",
                };

                return (
                  <div
                    key={donation.id || idx}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {donorAvatar ? (
                        <img
                          src={donorAvatar}
                          alt={donorName}
                          className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold border-2 border-white shadow-sm">
                          {donorName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-sm text-slate-900">{donorName}</div>
                        <div className="text-[11px] text-slate-400 font-medium flex items-center gap-2 mt-0.5">
                          <span className="font-semibold text-[#E53935]">{donorBlood}</span>
                          {donorCity !== "—" && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span>{donorCity}</span>
                            </>
                          )}
                          {donationDate && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span>{donationDate}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border capitalize ${
                        statusColors[donationStatus] || statusColors.intent
                      }`}
                    >
                      {donationStatus}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Core Intelligence Grid: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (8 cols): Clinical Diagnosis, Logistics, Compatibility */}
          <div className="lg:col-span-8 space-y-6">
            {/* Clinical Diagnosis & Notes */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-[#E53935]" /> Clinical Notes & Description
                </h3>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Medical Record
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-slate-800 text-xs leading-relaxed font-medium">
                {request.description || "No specific clinical notes provided for this case."}
              </div>

              {/* Clinical Metadata Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Blood Product
                  </span>
                  <span className="font-bold text-slate-900 mt-0.5 block">Whole Blood / PRBC</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Required Deadline
                  </span>
                  <span className="font-bold text-slate-900 mt-0.5 block">
                    {request.required_date
                      ? new Date(request.required_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Immediate"}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Verification Status
                  </span>
                  <span className="font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Case
                  </span>
                </div>
              </div>
            </div>

            {/* Blood Compatibility Guide */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-[#E53935]" /> Blood Group Compatibility ({bloodGroup})
                </h3>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Transfusion Protocol
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Compatible Donors (Can Receive From)
                  </span>
                  <p className="font-black text-sm text-emerald-950">
                    {compatibility.receiveFrom}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Recipient Compatibility (Can Donate To)
                  </span>
                  <p className="font-bold text-sm text-slate-900">
                    {compatibility.donateTo}
                  </p>
                </div>
              </div>
            </div>

            {/* Hospital Facility & Logistics */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#E53935]" /> Hospital & Logistics
                </h3>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {displayCity}
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Medical Facility
                  </span>
                  <p className="font-black text-base text-slate-900 mt-0.5">
                    {request.hospital_name || "Hospital Facility"}
                  </p>
                </div>

                {request.hospital_address && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Address & Location
                    </span>
                    <p className="font-medium text-slate-700 mt-0.5">
                      {request.hospital_address}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    City & Region
                  </span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {displayCity}, {displayProvince}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {request.latitude && request.longitude ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${request.latitude},${request.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors shadow-2xs"
                    >
                      <Navigation className="w-3.5 h-3.5 text-blue-600" />
                      <span>Open in Google Maps ({request.latitude}, {request.longitude})</span>
                    </a>
                  ) : (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${request.hospital_name || ""} ${displayCity}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors shadow-2xs"
                    >
                      <Navigation className="w-3.5 h-3.5 text-blue-600" />
                      <span>Search Hospital on Google Maps</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Contacts, Attendant, Emergency Broadcast */}
          <div className="lg:col-span-4 space-y-6">
            {/* Requester & Attendant Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <User className="w-4 h-4 text-[#E53935]" /> Requester Contact
              </h3>

              <div className="flex items-center gap-3.5">
                {request.requester?.profile_image ? (
                  <img
                    src={request.requester.profile_image}
                    alt={requesterName}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-200 text-[#E53935] flex items-center justify-center font-black text-sm shrink-0 shadow-2xs">
                    {requesterName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="font-black text-slate-900 text-sm truncate flex items-center gap-1">
                    {requesterName}
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  </h4>
                  <p className="text-xs text-slate-400">Primary Attendant</p>
                </div>
              </div>

              {/* Emergency Contact Number */}
              <div className="space-y-3 pt-2 text-xs border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Primary Phone Number
                  </span>
                  <p className="font-mono font-black text-base text-slate-900 mt-0.5">
                    {emergencyPhone || "Private / Hidden"}
                  </p>
                </div>

                {emergencyPhone && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {emergencyClean && (
                      <a
                        href={`tel:${emergencyClean}`}
                        className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Call</span>
                      </a>
                    )}
                    {emergencyWa && (
                      <a
                        href={`https://wa.me/${emergencyWa}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-green-50 hover:bg-green-100 text-green-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Additional Requester Phone if different */}
                {requesterPhone && requesterPhone !== emergencyPhone && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Account Registered Phone
                    </span>
                    <p className="font-mono font-bold text-xs text-slate-700 mt-0.5">
                      {requesterPhone}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Broadcast Dispatcher Card */}
            <div className="bg-gradient-to-br from-[#E53935] via-red-600 to-[#D32F2F] rounded-3xl p-6 text-white shadow-lg space-y-3 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
                <Radio className="w-32 h-32" />
              </div>

              <div className="relative space-y-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider inline-block">
                  Push Alert Dispatcher
                </span>
                <h4 className="font-black text-lg tracking-tight">
                  Mobilize {bloodGroup} Donors
                </h4>
                <p className="text-xs text-white/85 leading-relaxed">
                  Directly alert verified {bloodGroup} donors in {displayCity} via OneSignal push broadcast to their lock screens.
                </p>

                <div className="pt-2">
                  <Link
                    href={`/broadcast?city=${encodeURIComponent(displayCity)}&blood_group=${encodeURIComponent(
                      bloodGroup
                    )}&title=${encodeURIComponent(
                      `URGENT: ${bloodGroup} Blood Needed for ${patientName}`
                    )}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-white text-[#D32F2F] hover:bg-white/95 font-black text-xs text-center flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-98"
                  >
                    <Radio className="w-4 h-4 text-[#D32F2F]" />
                    <span>Broadcast Push Alert</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Audit & System Meta Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs text-xs space-y-2.5">
              <div className="flex items-center gap-2 text-slate-700 font-bold pb-2 border-b border-slate-100">
                <ShieldCheck className="w-4 h-4 text-[#E53935]" />
                <span>LifeLink Command Center</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-500">
                <div className="flex justify-between">
                  <span>Record Type:</span>
                  <span className="font-semibold text-slate-700">Verified Emergency</span>
                </div>
                <div className="flex justify-between">
                  <span>Database ID:</span>
                  <span className="font-mono text-slate-700">{request.id.slice(0, 16)}...</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Synchronized:</span>
                  <span className="text-slate-700">Live Backend Stream</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
