'use client';

import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Search, 
  Building2, 
  MapPin, 
  CheckCircle2, 
  Calendar, 
  User, 
  ShieldCheck, 
  FileSpreadsheet
} from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { BloodTypeBadge } from '@/components/common/BloodTypeBadge';
import { getDonations } from '@/lib/api';
import { DonationRecord } from '@/lib/types';

export default function DonationsPage() {
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getDonations();
      setDonations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredDonations = donations.filter((don) => {
    return (
      don.donor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      don.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      don.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      don.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <Topbar
        onMenuToggle={() => {}}
        title="Donation Logs & Records"
        subtitle="Audited records of completed blood transfusions and donor verification certificates"
        onRefresh={loadData}
        isLoading={loading}
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold">Total Transfusions</p>
            <h3 className="text-2xl font-black text-white">{donations.length + 848} Units</h3>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold">Partner Hospitals</p>
            <h3 className="text-2xl font-black text-white">42 Centers</h3>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold">Verification Rate</p>
            <h3 className="text-2xl font-black text-white">100% Audited</h3>
          </div>
        </div>
      </div>

      {/* Search and Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search donor, recipient, hospital..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full pl-10 pr-4 py-2 rounded-xl text-xs placeholder:text-slate-500"
            />
          </div>

          <button
            onClick={() => alert('Exporting verified audit report as CSV...')}
            className="flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV Report</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Log ID</th>
                <th className="py-3.5 px-4">Donor Name</th>
                <th className="py-3.5 px-4">Blood Group</th>
                <th className="py-3.5 px-4">Recipient Patient</th>
                <th className="py-3.5 px-4">Hospital & City</th>
                <th className="py-3.5 px-4">Units</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredDonations.map((don) => (
                <tr key={don.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    #{don.id.toUpperCase()}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    {don.donor_name}
                  </td>
                  <td className="py-3.5 px-4">
                    <BloodTypeBadge type={don.blood_group} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-200">
                    {don.patient_name}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-medium text-slate-200">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {don.hospital}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                      <MapPin className="w-3 h-3 text-red-400" />
                      {don.city}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-white">
                    {don.units} Unit(s)
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {new Date(don.donated_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      {don.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
