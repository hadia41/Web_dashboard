'use client';

import React from 'react';
import Link from 'next/link';
import { BloodRequest, RequestStatus } from '@/lib/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BloodTypeBadge } from '@/components/common/BloodTypeBadge';
import { MapPin, Building2, ArrowUpRight, Phone, CheckCircle2 } from 'lucide-react';

interface RecentRequestsTableProps {
  requests: BloodRequest[];
  onStatusChange?: (id: string, newStatus: RequestStatus) => void;
}

export const RecentRequestsTable: React.FC<RecentRequestsTableProps> = ({
  requests,
  onStatusChange,
}) => {
  return (
    <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Live Emergency Blood Requests
          </h3>
          <p className="text-xs text-slate-400">Latest active requests requiring urgent donor matching</p>
        </div>
        <Link
          href="/requests"
          className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
        >
          <span>View All Requests</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Patient / Requester</th>
              <th className="py-3.5 px-4">Blood Group</th>
              <th className="py-3.5 px-4">Hospital & City</th>
              <th className="py-3.5 px-4">Units (Fulfilled/Req)</th>
              <th className="py-3.5 px-4">Urgency</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Quick Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {requests.slice(0, 5).map((req) => {
              const isUrgent = req.urgency === 'CRITICAL';

              return (
                <tr 
                  key={req.id} 
                  className={`hover:bg-slate-800/40 transition-colors ${
                    isUrgent ? 'bg-red-950/10' : ''
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white text-sm">{req.patient_name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-500" />
                      {req.contact_number}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <BloodTypeBadge type={req.blood_group} size="sm" />
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-medium text-slate-200">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {req.hospital}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                      <MapPin className="w-3 h-3 text-red-400" />
                      {req.city}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">
                        {req.units_fulfilled} / {req.units_required}
                      </span>
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 to-emerald-500 rounded-full"
                          style={{ width: `${Math.min(100, (req.units_fulfilled / req.units_required) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <StatusBadge urgency={req.urgency} type="urgency" />
                  </td>

                  <td className="py-3.5 px-4">
                    <StatusBadge status={req.status} type="status" />
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {req.status !== 'FULFILLED' ? (
                      <button
                        onClick={() => onStatusChange?.(req.id, 'FULFILLED')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all"
                        title="Mark as Fulfilled"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Fulfill</span>
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-medium">Completed</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
