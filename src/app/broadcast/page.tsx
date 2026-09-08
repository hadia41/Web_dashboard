"use client";

import React, { useState, useEffect } from "react";
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

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      alert("Please fill in both headline and message body.");
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
        setDispatchResult({
          success: true,
          message: res.data?.message || "Emergency broadcast dispatched successfully!",
          recipients: res.data?.recipients_count ?? 0,
          city: selectedCity === "all" ? "All Pakistan" : selectedCity,
          blood_group: selectedGroup === "all" ? "All Groups" : selectedGroup,
        });
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
  const distinctCities = Array.from(
    new Set(CitiesData.cities.map((c) => c.name.en))
  ).sort();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header
        title="Broadcast Alert Dispatcher"
        subtitle="Push instant emergency push notifications to verified donors via OneSignal"
      />

      <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Status / Success Alert Banner */}
        {dispatchResult && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3.5 shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-emerald-900">
                {dispatchResult.message}
              </h4>
              <p className="text-xs text-emerald-700">
                OneSignal notification dispatched to registered mobile devices.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-800 pt-1">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {dispatchResult.recipients} Device(s) Tagged
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {dispatchResult.city}
                </span>
                <span className="flex items-center gap-1">
                  <Droplet className="w-3.5 h-3.5 text-[#E53935]" /> {dispatchResult.blood_group}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert Banner */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3.5 shadow-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-red-900">Broadcast Failed</h4>
              <p className="text-xs text-red-700">{errorMsg}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Dispatch Form Card */}
          <div className="md:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Radio className="w-4 h-4 text-[#E53935]" />
              <h3 className="font-bold text-sm text-slate-900">Dispatch Push Alert</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Target City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935]"
                >
                  <option value="all">All Pakistan</option>
                  {distinctCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Blood Group
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935]"
                >
                  <option value="all">All Blood Groups</option>
                  {["O-", "A-", "B-", "AB-", "O+", "A+", "B+", "AB+"].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Alert Headline
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Alert title..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Message Body
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Emergency message..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-[#E53935] focus:ring-1 focus:ring-[#E53935]"
              />
            </div>

            <button
              onClick={handleSend}
              disabled={sending}
              className="w-full py-2.5 rounded-xl bg-[#E53935] hover:bg-[#D32F2F] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {sending ? "Dispatching Broadcast..." : "Dispatch Broadcast Now"}
            </button>
          </div>

          {/* Device Preview Card */}
          <div className="md:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Smartphone className="w-4 h-4 text-slate-400" />
              <h3 className="font-bold text-sm text-slate-900">Mobile Device Preview</h3>
            </div>

            <p className="text-xs text-slate-400">
              Live preview of lock-screen push banner delivered to donor devices.
            </p>

            <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-bold text-[#E53935] flex items-center gap-1">
                  <BellRing className="w-3.5 h-3.5" /> LifeLink Emergency
                </span>
                <span>Just Now</span>
              </div>
              <h4 className="font-bold text-xs text-white leading-tight">
                {title || "Alert Headline"}
              </h4>
              <p className="text-[11px] text-slate-300 leading-snug">
                {message || "Message body will appear here..."}
              </p>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span>📍 {selectedCity === "all" ? "Nationwide" : selectedCity}</span>
                <span>🩸 {selectedGroup === "all" ? "All Groups" : selectedGroup}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
