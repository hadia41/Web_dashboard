"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { api } from "@/lib/api";
import CitiesData from "@/data/cities.json";
import {
  Radio,
  Send,
  Smartphone,
  Droplet,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Users,
  BellRing,
  Sparkles,
  Zap,
  Clock,
  ShieldAlert,
  Flame,
} from "lucide-react";

export default function BroadcastPage() {
  const [title, setTitle] = useState("URGENT: Blood Donation Needed");
  const [message, setMessage] = useState(
    "Emergency whole blood units needed at hospital. If you are eligible, please tap to respond."
  );
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [sending, setSending] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<{
    success: boolean;
    message: string;
    recipients?: number;
    city?: string;
    blood_group?: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dispatchHistory, setDispatchHistory] = useState<any[]>([]);

  // Pre-populate from query params if dispatched from a case record
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlCity = params.get("city");
      const urlGroup = params.get("blood_group");
      const urlTitle = params.get("title");

      if (urlCity) setSelectedCity(urlCity);
      if (urlGroup) setSelectedGroup(urlGroup);
      if (urlTitle) setTitle(urlTitle);
    }
  }, []);

  // Quick Preset Handlers
  const applyPreset = (presetTitle: string, presetMessage: string, group?: string) => {
    setTitle(presetTitle);
    setMessage(presetMessage);
    if (group) setSelectedGroup(group);
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      alert("Please enter both headline and emergency message body.");
      return;
    }
    setSending(true);
    setDispatchResult(null);
    setErrorMsg(null);

    try {
      const res = await api.sendBroadcast({
        title: title.trim(),
        message: message.trim(),
        city: selectedCity,
        blood_group: selectedGroup,
        urgency: "critical",
      });

      if (res.success) {
        const resultPayload = {
          success: true,
          message: res.data?.message || "Emergency broadcast dispatched successfully!",
          recipients: res.data?.recipients_count ?? 0,
          city: selectedCity === "all" ? "All Pakistan" : selectedCity,
          blood_group: selectedGroup === "all" ? "All Groups" : selectedGroup,
          timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          title: title.trim(),
        };

        setDispatchResult(resultPayload);
        setDispatchHistory((prev) => [resultPayload, ...prev.slice(0, 4)]);
      } else {
        setErrorMsg(res.error || "Failed to dispatch broadcast alert.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to connect to backend server.");
    } finally {
      setSending(false);
    }
  };

  // Distinct sorted cities from official dictionary
  const distinctCities = useMemo(() => {
    return Array.from(new Set(CitiesData.cities.map((c) => c.name.en))).sort();
  }, []);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#f8f9fb" }}>
      <Header
        title="Broadcast Alert Dispatcher"
        subtitle="Push instant emergency push notifications to verified donors via OneSignal"
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
                  OneSignal Gateway Live
                </span>
                <span className="text-white/30 text-xs">•</span>
                <span className="text-white/60 text-xs font-medium">Priority Level 10 Push</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Mass Emergency Alert Dispatcher
              </h2>
              <p className="text-white/60 text-xs md:text-sm max-w-xl font-medium leading-relaxed">
                Dispatch targeted push notifications directly to donor lock screens across Pakistan.
                Target by geographical city and compatible blood group within seconds.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center min-w-[130px]">
                <div className="text-2xl font-black text-white leading-none flex items-center justify-center gap-1">
                  <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span>&lt; 3s</span>
                </div>
                <div className="text-[11px] font-bold text-white/60 mt-1 uppercase tracking-wider">
                  Push Latency SLA
                </div>
              </div>
            </div>
          </div>

          {/* Decorative ambient glows */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#e53935]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* ─── DISPATCH CAPACITY METRICS ROW ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          {[
            {
              label: "Audience Target",
              value: "Total Subscribed",
              sub: "All verified mobile donor devices",
              icon: <Users className="w-5 h-5" />,
              accent: "#e53935",
              bgAccent: "#fef2f2",
            },
            {
              label: "Emergency Priority",
              value: "Level 10 Critical",
              sub: "Bypasses mobile notification batching",
              icon: <Flame className="w-5 h-5" />,
              accent: "#f59e0b",
              bgAccent: "#fffbeb",
            },
            {
              label: "Delivery Channel",
              value: "Direct Lockscreen",
              sub: "Native iOS & Android push banners",
              icon: <Smartphone className="w-5 h-5" />,
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
              <div className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1">{stat.label}</div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-medium">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* ─── ONE-CLICK EMERGENCY PRESETS ─── */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs space-y-2.5 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#e53935]" />
              One-Click Clinical Emergency Presets
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Click to auto-populate template</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              {
                label: "🚨 Urgent O- Trauma Deficit",
                title: "CRITICAL: Urgent O- Negative Donors Required",
                message: "High-priority surgical trauma case in critical condition. Universal donor O- urgently requested.",
                group: "O-",
              },
              {
                label: "🩸 Multiple Whole Blood Pints",
                title: "EMERGENCY: Multiple Blood Units Needed Immediately",
                message: "Multiple units needed for ongoing emergency clinical care. Verified donors please report to hospital.",
                group: "all",
              },
              {
                label: "🏥 Surgical Operation Emergency",
                title: "SURGERY ALERT: Immediate Blood Donors Required",
                message: "Patient undergoing urgent emergency surgery. If you are eligible and nearby, please tap to respond.",
                group: "all",
              },
              {
                label: "⚠️ Rare Blood Group Deficit",
                title: "RARE GROUP ALERT: Compatible Donors Needed",
                message: "Urgent shortage for rare blood category. Your single donation will save this patient's life.",
                group: "AB-",
              },
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset.title, preset.message, preset.group)}
                className="text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 hover:border-red-200 transition-all text-xs group"
              >
                <div className="font-bold text-slate-800 group-hover:text-[#e53935] transition-colors truncate">
                  {preset.label}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {preset.message}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ─── STATUS / SUCCESS / ERROR FEEDBACK ─── */}
        {dispatchResult && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <h4 className="font-extrabold text-sm text-emerald-900">
                {dispatchResult.message}
              </h4>
              <p className="text-xs text-emerald-700">
                High-priority alert dispatched through OneSignal to registered mobile devices.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-emerald-800 pt-1">
                <span className="flex items-center gap-1.5 bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                  <Users className="w-3.5 h-3.5 text-emerald-700" /> {dispatchResult.recipients} Device(s) Tagged
                </span>
                <span className="flex items-center gap-1.5 bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" /> {dispatchResult.city}
                </span>
                <span className="flex items-center gap-1.5 bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                  <Droplet className="w-3.5 h-3.5 text-[#e53935]" /> {dispatchResult.blood_group}
                </span>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm animate-in fade-in">
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-red-900">Broadcast Dispatch Failed</h4>
              <p className="text-xs text-red-700">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* ─── TWO-COLUMN CONSOLE & SMARTPHONE PREVIEW ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          {/* Left: Dispatch Form Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#e53935]" />
                <h3 className="font-extrabold text-sm text-slate-900">Alert Dispatch Parameters</h3>
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Emergency Grade
              </span>
            </div>

            {/* Geographical & Blood Group Targets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Target City / Region</span>
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#e53935] focus:ring-2 focus:ring-red-100 transition-all cursor-pointer"
                >
                  <option value="all">Nationwide (All Pakistan)</option>
                  {distinctCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
                  <Droplet className="w-3.5 h-3.5 text-[#e53935]" />
                  <span>Blood Group Required</span>
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#e53935] focus:ring-2 focus:ring-red-100 transition-all cursor-pointer"
                >
                  <option value="all">All Blood Groups (General Emergency)</option>
                  {["O-", "A-", "B-", "AB-", "O+", "A+", "B+", "AB+"].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Alert Headline */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Alert Headline</label>
                <span className="text-[10px] text-slate-400 font-semibold">{title.length}/80 chars</span>
              </div>
              <input
                type="text"
                maxLength={80}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Alert title..."
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-[#e53935] focus:ring-2 focus:ring-red-100 transition-all"
              />
            </div>

            {/* Message Body */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Emergency Message Body</label>
                <span className="text-[10px] text-slate-400 font-semibold">{message.length}/240 chars</span>
              </div>
              <textarea
                rows={3}
                maxLength={240}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write message body..."
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-[#e53935] focus:ring-2 focus:ring-red-100 transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Dispatch Action CTA */}
            <button
              onClick={handleSend}
              disabled={sending}
              className="w-full py-3 rounded-xl bg-[#e53935] hover:bg-[#d32f2f] text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Transmitting Alert via OneSignal Gateway...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Emergency Broadcast Now</span>
                </>
              )}
            </button>
          </div>

          {/* Right: Realistic Smartphone Lockscreen Preview */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex-1 flex flex-col justify-between">
              <div className="space-y-1 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                  <Smartphone className="w-4 h-4 text-[#e53935]" />
                  <span>Real-Time Mobile Lockscreen</span>
                </div>
                <p className="text-xs text-slate-400">
                  Exact visual banner rendering delivered to donor smartphones.
                </p>
              </div>

              {/* Smartphone Frame Container */}
              <div className="py-6 flex justify-center">
                <div className="w-full max-w-[310px] bg-slate-900 rounded-[2.5rem] p-3.5 border-4 border-slate-800 shadow-2xl relative">
                  {/* Speaker / Camera Notch */}
                  <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-4" />

                  {/* Lockscreen Time */}
                  <div className="text-center text-white/90 space-y-0.5 mb-6">
                    <div className="text-3xl font-black tracking-tight">09:41</div>
                    <div className="text-[11px] font-semibold text-white/50">Tuesday, September 8</div>
                  </div>

                  {/* Native Push Notification Card */}
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-white/40 space-y-2 animate-fade-in-up">
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5 font-black text-slate-900">
                        <div className="w-4 h-4 rounded bg-[#e53935] flex items-center justify-center text-white font-black text-[9px]">
                          L
                        </div>
                        <span>LifeLink Emergency</span>
                      </div>
                      <span className="text-slate-400 font-semibold">now</span>
                    </div>

                    <div className="space-y-1">
                      <div className="font-extrabold text-xs text-slate-900 leading-tight">
                        {title || "Alert Headline"}
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium leading-snug line-clamp-3">
                        {message || "Emergency message body will appear here..."}
                      </div>
                    </div>

                    {/* Meta tags inside push banner */}
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-slate-400" />
                        <span>{selectedCity === "all" ? "Nationwide" : selectedCity}</span>
                      </span>
                      <span className="text-[#e53935] font-black">
                        {selectedGroup === "all" ? "All Groups" : `${selectedGroup} Blood`}
                      </span>
                    </div>
                  </div>

                  {/* Home Bar Indicator */}
                  <div className="w-28 h-1 bg-white/40 rounded-full mx-auto mt-8" />
                </div>
              </div>

              {/* Delivery info footer */}
              <div className="bg-slate-50 rounded-xl p-3 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Target Channel: Push Alert</span>
                <span className="font-bold text-slate-700">Encrypted AES-256</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── RECENT DISPATCH AUDIT LOG ─── */}
        {dispatchHistory.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs animate-fade-in-up">
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                Session Dispatch History
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">Logged this session</span>
            </div>

            <div className="divide-y divide-slate-100">
              {dispatchHistory.map((item, idx) => (
                <div key={idx} className="p-4 px-6 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="font-extrabold text-slate-900">{item.title}</div>
                    <div className="text-[11px] text-slate-400 font-medium flex items-center gap-3">
                      <span>📍 {item.city}</span>
                      <span>🩸 {item.blood_group}</span>
                      <span>👥 {item.recipients} devices</span>
                    </div>
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">{item.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
