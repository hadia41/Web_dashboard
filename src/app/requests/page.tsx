'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Droplet, 
  Building2, 
  MapPin, 
  Phone, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User
} from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BloodTypeBadge } from '@/components/common/BloodTypeBadge';
import { getBloodRequests, updateBloodRequestStatus } from '@/lib/api';
import { BloodRequest, BloodGroup, UrgencyLevel, RequestStatus } from '@/lib/types';

export default function RequestsPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getBloodRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: RequestStatus) => {
    const ok = await updateBloodRequestStatus(id, newStatus);
    if (ok) {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest({ ...selectedRequest, status: newStatus });
      }
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch = 
      req.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requester_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBlood = selectedBloodGroup === 'ALL' || req.blood_group === selectedBloodGroup;
    const matchesUrgency = selectedUrgency === 'ALL' || req.urgency === selectedUrgency;
    const matchesStatus = selectedStatus === 'ALL' || req.status === selectedStatus;

    return matchesSearch && matchesBlood && matchesUrgency && matchesStatus;
  });

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="space-y-6">
      <Topbar
        onMenuToggle={() => {}}
        title="Blood Requests Management"
        subtitle="Track, triage, and fulfill all emergency and regular hospital blood requests"
        onRefresh={loadData}
        isLoading={loading}
      />

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by patient, hospital, city or requester..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm placeholder:text-slate-500"
            />
          </div>

          {/* Quick Filter Selects */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="glass-input px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-slate-200"
            >
              <option value="ALL">All Urgencies</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="glass-input px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-slate-200"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="FULFILLED">Fulfilled</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Blood Group Quick Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Blood Group:
          </span>
          <button
            onClick={() => setSelectedBloodGroup('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
              selectedBloodGroup === 'ALL'
                ? 'bg-red-600 text-white shadow-glow-crimson-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            All ({requests.length})
          </button>
          {bloodGroups.map((bg) => {
            const count = requests.filter(r => r.blood_group === bg).length;
            return (
              <button
                key={bg}
                onClick={() => setSelectedBloodGroup(bg)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  selectedBloodGroup === bg
                    ? 'bg-red-600 text-white shadow-glow-crimson-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <span>{bg}</span>
                {count > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 font-mono">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Requests Grid / Table */}
      <div className="grid grid-cols-1 gap-4">
        {filteredRequests.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-2xl border border-slate-800">
            <Droplet className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">No Blood Requests Found</h4>
            <p className="text-xs text-slate-400 mt-1">Try clearing filters or adjusting your search term.</p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              className={`glass-card p-5 rounded-2xl border transition-all ${
                req.urgency === 'CRITICAL' && req.status !== 'FULFILLED'
                  ? 'border-red-500/40 bg-red-950/15'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Patient & Basic info */}
                <div className="flex items-start gap-4">
                  <div className="shrink-0 pt-0.5">
                    <BloodTypeBadge type={req.blood_group} size="lg" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-base font-extrabold text-white tracking-tight">
                        {req.patient_name}
                      </h3>
                      <StatusBadge urgency={req.urgency} type="urgency" />
                      <StatusBadge status={req.status} type="status" />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {req.hospital}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-400" />
                        {req.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Req by: {req.requester_name}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        {req.contact_number}
                      </span>
                    </div>

                    {req.notes && (
                      <p className="text-xs text-slate-400 italic pt-1 bg-slate-900/40 p-2 rounded-lg border border-slate-800/80">
                        &ldquo;{req.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Progress & Status controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:border-l lg:border-slate-800 lg:pl-6 shrink-0">
                  <div className="space-y-1.5 min-w-[140px]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Units Progress</span>
                      <span className="font-bold text-white">
                        {req.units_fulfilled} / {req.units_required} Units
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 via-rose-500 to-emerald-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (req.units_fulfilled / req.units_required) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2">
                    {req.status !== 'IN_PROGRESS' && req.status !== 'FULFILLED' && (
                      <button
                        onClick={() => handleStatusUpdate(req.id, 'IN_PROGRESS')}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition-all"
                      >
                        In Progress
                      </button>
                    )}

                    {req.status !== 'FULFILLED' ? (
                      <button
                        onClick={() => handleStatusUpdate(req.id, 'FULFILLED')}
                        className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Fulfill</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusUpdate(req.id, 'OPEN')}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                      >
                        Re-open
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
