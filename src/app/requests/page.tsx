"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { BloodBadge } from "@/components/BloodBadge";
import { StatusPill } from "@/components/StatusPill";
import { api } from "@/lib/api";
import { resolveCityFromItem } from "@/lib/cityUtils";
import {
  Search,
  MapPin,
  Building2,
  Filter,
  ExternalLink,
  Droplet,
  ChevronRight,
  Radio,
} from "lucide-react";

export default function BloodRequestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedUrgency, setSelectedUrgency] = useState("all");

  const fetchRequests = async () => {
    setLoading(true);
    const res = await api.getFeed({
      blood_group: selectedGroup,
      urgency: selectedUrgency,
      search: search.trim() || undefined,
      limit: 50,
    });

    if (res.success && res.data) {
      const list = res.data.requests || res.data || [];
      setRequests(Array.isArray(list) ? list : []);
    } else {
      setRequests([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [selectedGroup, selectedUrgency]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequests();
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header
        title="Blood Requests"
        subtitle="Manage, monitor, and triage live blood requests from across Pakistan"
        onRefresh={fetchRequests}
        isRefreshing={loading}
      />

      <div className="p-8 max-w-6xl mx-auto w-full space-y-6">
        {/* Search & Filters Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patient, hospital, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
            />
          </form>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Blood Group Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
              <Droplet className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 font-medium">Group:</span>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Groups</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            {/* Urgency Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 font-medium">Urgency:</span>
              <select
                value={selectedUrgency}
                onChange={(e) => setSelectedUrgency(e.target.value)}
                className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Urgencies</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests Table Container */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">
              Active Blood Requests ({requests.length})
            </h3>
            <span className="text-xs text-slate-400">
              Click any row to open clinical case record
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Group</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Hospital Facility</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Units Needed</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <div className="inline-block w-6 h-6 border-2 border-[#E53935] border-t-transparent rounded-full animate-spin mb-2" />
                      <p>Loading blood requests...</p>
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No blood requests match your selected filters.
                    </td>
                  </tr>
                ) : (
                  requests.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => router.push(`/requests/${item.id}`)}
                      className="hover:bg-slate-50/75 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <BloodBadge bloodGroup={item.blood_group || item.bloodType || "O+"} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 group-hover:text-[#E53935] transition-colors">
                        {item.patient_name || item.patientName || "Patient"}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {item.hospital_name || item.hospital || "Hospital"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {resolveCityFromItem(item)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {item.units_required || item.units || 1} unit(s)
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusPill status={item.urgency || "normal"} type="urgency" />
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusPill status={item.status || "open"} type="status" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/requests/${item.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 group-hover:bg-[#E53935] group-hover:text-white text-slate-700 font-semibold text-xs transition-all shadow-2xs inline-flex items-center gap-1"
                        >
                          <span>View Details</span>
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
