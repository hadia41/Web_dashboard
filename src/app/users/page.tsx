"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { BloodBadge } from "@/components/BloodBadge";
import { UserAvatar } from "@/components/UserAvatar";
import { api } from "@/lib/api";
import { resolveCityFromItem } from "@/lib/cityUtils";
import {
  Users,
  UserCheck,
  Clock,
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Eye,
  Power,
  X,
  Droplet,
  Heart,
  UserX,
} from "lucide-react";

const BLOOD_GROUPS = ["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"];

export default function UsersManagementPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all"); // all, available, cooldown
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers({
        limit: 50,
      });
      if (res.success && res.data) {
        const list = res.data.donors || res.data || [];
        setUsers(Array.isArray(list) ? list : []);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Enrich user profiles
  const cleanedUsers = useMemo(() => {
    return users.map((u) => {
      const bloodGroup = (u.blood_group || "O+").toUpperCase();
      const city = resolveCityFromItem(u);
      const donationsCount = Number(u.stats?.donations_count ?? u.donations_count ?? 0);
      const livesSaved = Number(u.stats?.lives_saved ?? donationsCount * 3);
      const isEligible = u.stats?.is_eligible ?? u.is_eligible ?? true;
      const isAvailable = u.is_available !== false;
      const isAdmin = Boolean(u.is_admin);

      return {
        ...u,
        bloodGroup,
        city,
        donationsCount,
        livesSaved,
        isEligible,
        isAvailable,
        isAdmin,
      };
    });
  }, [users]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return cleanedUsers.filter((u) => {
      const q = search.trim().toLowerCase();
      if (q) {
        const nameMatch = (u.full_name || "").toLowerCase().includes(q);
        const emailMatch = (u.email || "").toLowerCase().includes(q);
        const phoneMatch = (u.phone || "").toLowerCase().includes(q);
        const cityMatch = (u.city || "").toLowerCase().includes(q);
        if (!nameMatch && !emailMatch && !phoneMatch && !cityMatch) return false;
      }

      if (selectedGroup !== "all" && u.bloodGroup !== selectedGroup) return false;

      if (selectedAvailability === "available") {
        if (!u.isAvailable || !u.isEligible) return false;
      } else if (selectedAvailability === "cooldown") {
        if (u.isEligible) return false;
      } else if (selectedAvailability === "inactive") {
        if (u.isAvailable) return false;
      }

      return true;
    });
  }, [cleanedUsers, search, selectedGroup, selectedAvailability]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = cleanedUsers.length;
    const available = cleanedUsers.filter((u) => u.isAvailable && u.isEligible).length;
    const cooldown = cleanedUsers.filter((u) => !u.isEligible).length;
    const admins = cleanedUsers.filter((u) => u.isAdmin).length;
    return { total, available, cooldown, admins };
  }, [cleanedUsers]);

  // Toggle availability action
  const handleToggleAvailability = async (user: any) => {
    setUpdatingId(user.id);
    const newStatus = !user.isAvailable;
    try {
      const res = await api.toggleUserAvailability(user.id, newStatus);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, is_available: newStatus } : u))
        );
      }
    } catch (err) {
      console.error("Failed to toggle availability:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#f8f9fb" }}>
      <Header
        title="User & Donor Directory"
        subtitle="Manage registered donors, oversee verification, and control account availability"
        onRefresh={fetchUsers}
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
                  User Management Console (FR-9)
                </span>
                <span className="text-white/30 text-xs">•</span>
                <span className="text-white/60 text-xs font-medium">
                  {metrics.total} Registered Profiles
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Donor & Volunteer Network
              </h2>
              <p className="text-white/60 text-xs md:text-sm max-w-xl font-medium leading-relaxed">
                Oversee donor availability, verify credentials, monitor donation cooldown cycles,
                and maintain platform safety across Pakistan.
              </p>
            </div>
          </div>
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* ─── METRICS ROW ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none">
              {metrics.total}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Total Users</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Registered donors & patients</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 tracking-tight leading-none">
              {metrics.available}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Ready to Donate</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Eligible & active status</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-amber-600 tracking-tight leading-none">
              {metrics.cooldown}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">In 90-Day Cooldown</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Recent donation cooldown</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-purple-600 tracking-tight leading-none">
              {metrics.admins}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Administrators</div>
            <div className="text-[11px] text-slate-400 mt-0.5">System access privilege</div>
          </div>
        </div>

        {/* ─── FILTERS CONSOLE ─── */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or city..."
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
            {/* Availability Filter */}
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs font-semibold">
              {[
                { label: "All Users", value: "all" },
                { label: "Available", value: "available" },
                { label: "Cooldown", value: "cooldown" },
                { label: "Inactive", value: "inactive" },
              ].map((pill) => (
                <button
                  key={pill.value}
                  onClick={() => setSelectedAvailability(pill.value)}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedAvailability === pill.value
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Blood Group Select */}
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">All Blood Groups</option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ─── USERS DIRECTORY TABLE ─── */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
          <div className="p-5 px-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">User Accounts</h3>
              <p className="text-[11px] text-slate-400">
                Showing {filteredUsers.length} of {cleanedUsers.length} registered accounts
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading user directory...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <UserX className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="font-semibold text-slate-600">No users found</p>
              <p className="mt-1">Try adjusting your search query or filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-6">User Details</th>
                    <th className="py-3 px-4">Blood Group</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Donation Impact</th>
                    <th className="py-3 px-4">Status & Eligibility</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            src={u.profile_image}
                            name={u.full_name}
                            size="md"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-800">
                                {u.full_name || "Anonymous User"}
                              </span>
                              {u.isAdmin && (
                                <span className="bg-purple-100 text-purple-700 text-[9px] font-bold px-1.5 py-0.2 rounded">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              {u.email && <span>{u.email}</span>}
                              {u.phone && <span>• {u.phone}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <BloodBadge bloodGroup={u.bloodGroup} size="sm" />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{u.city}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-bold text-slate-800">{u.donationsCount}</span>
                          <span className="text-slate-400 text-[11px]"> donations</span>
                        </div>
                        <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                          <Heart className="w-2.5 h-2.5 fill-emerald-600" />
                          <span>~{u.livesSaved} Lives Saved</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {!u.isAvailable ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                            <XCircle className="w-3 h-3 text-slate-400" />
                            Unavailable
                          </span>
                        ) : !u.isEligible ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-500" />
                            In Cooldown
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Ready to Donate
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                            title="Inspect User Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleAvailability(u)}
                            disabled={updatingId === u.id}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              u.isAvailable
                                ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                : "border-slate-200 text-slate-400 hover:bg-slate-100"
                            }`}
                            title={u.isAvailable ? "Set to Unavailable" : "Set to Available"}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ─── USER DETAIL MODAL ─── */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <UserAvatar
                  src={selectedUser.profile_image}
                  name={selectedUser.full_name}
                  size="lg"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedUser.full_name || "User Profile"}</h3>
                  <p className="text-xs text-slate-400">{selectedUser.email || "No email on record"}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Blood Group</span>
                  <div className="mt-1">
                    <BloodBadge bloodGroup={selectedUser.bloodGroup} size="sm" />
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Location</span>
                  <span className="font-bold text-slate-800 mt-1 block">{selectedUser.city}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Phone Contact</span>
                  <span className="font-bold text-slate-800 mt-1 block">{selectedUser.phone || "N/A"}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Total Donations</span>
                  <span className="font-bold text-slate-800 mt-1 block">{selectedUser.donationsCount} Completed</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between py-1 text-slate-600">
                  <span className="text-slate-400">Account ID:</span>
                  <span className="font-mono text-[10px]">{selectedUser.id}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span className="text-slate-400">Admin Role:</span>
                  <span className="font-bold">{selectedUser.isAdmin ? "System Administrator" : "Standard Donor/User"}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span className="text-slate-400">Availability:</span>
                  <span className="font-bold">{selectedUser.isAvailable ? "Active (Visible in donor search)" : "Inactive"}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span className="text-slate-400">Medical Cooldown:</span>
                  <span className="font-bold">{selectedUser.isEligible ? "Eligible to Donate" : "Within 90-day Cooldown Period"}</span>
                </div>
              </div>
            </div>

            <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
