'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  Mail, 
  Award, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck, 
  Power,
  UserCheck
} from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { BloodTypeBadge } from '@/components/common/BloodTypeBadge';
import { getDonors, toggleDonorAvailability } from '@/lib/api';
import { DonorProfile, BloodGroup } from '@/lib/types';

export default function DonorsPage() {
  const [donors, setDonors] = useState<DonorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getDonors();
      setDonors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleAvailability = async (id: string) => {
    const success = await toggleDonorAvailability(id);
    if (success) {
      setDonors(prev => prev.map(d => d.id === id ? { ...d, is_available: !d.is_available } : d));
    }
  };

  const filteredDonors = donors.filter((donor) => {
    const matchesSearch = 
      donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.phone.includes(searchQuery);

    const matchesBlood = selectedBloodGroup === 'ALL' || donor.blood_group === selectedBloodGroup;
    const matchesAvailability = 
      availabilityFilter === 'ALL' || 
      (availabilityFilter === 'AVAILABLE' ? donor.is_available : !donor.is_available);

    return matchesSearch && matchesBlood && matchesAvailability;
  });

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="space-y-6">
      <Topbar
        onMenuToggle={() => {}}
        title="Donors & Users Registry"
        subtitle="Manage verified blood donors, check real-time availability, and coordinate dispatch"
        onRefresh={loadData}
        isLoading={loading}
      />

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search donor name, city, email or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="glass-input px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-slate-200"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available for Donation</option>
              <option value="UNAVAILABLE">Inactive / Unavailable</option>
            </select>
          </div>
        </div>

        {/* Blood Group Filter Chips */}
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
            All Donors ({donors.length})
          </button>
          {bloodGroups.map((bg) => {
            const count = donors.filter(d => d.blood_group === bg).length;
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

      {/* Donors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDonors.map((donor) => (
          <div
            key={donor.id}
            className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between"
          >
            {/* Header info */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700 flex items-center justify-center font-bold text-white text-sm">
                    {donor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-white text-sm tracking-tight">{donor.name}</h3>
                      {donor.verified && (
                        <span title="Verified Donor">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                      <MapPin className="w-3 h-3 text-red-400" />
                      <span>{donor.city}</span>
                    </div>
                  </div>
                </div>

                <BloodTypeBadge type={donor.blood_group} size="sm" />
              </div>

              {/* Stats badges */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Donations</span>
                  <span className="font-extrabold text-white text-sm flex items-center gap-1 mt-0.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    {donor.total_donations} Times
                  </span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Last Donated</span>
                  <span className="font-medium text-slate-300 text-xs mt-0.5 block truncate">
                    {donor.last_donation_date || 'Never'}
                  </span>
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-1.5 mt-3 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`tel:${donor.phone}`} className="hover:text-red-400 transition-colors">
                    {donor.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-slate-400 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{donor.email}</span>
                </div>
              </div>
            </div>

            {/* Bottom availability toggle */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${donor.is_available ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-500'}`} />
                <span className="text-xs font-semibold text-slate-300">
                  {donor.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>

              <button
                onClick={() => handleToggleAvailability(donor.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
                  donor.is_available
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20'
                }`}
              >
                <Power className="w-3 h-3" />
                <span>{donor.is_available ? 'Set Inactive' : 'Set Active'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
