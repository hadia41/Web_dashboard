"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { api } from "@/lib/api";
import { getCityNameById } from "@/lib/cityUtils";
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Droplet,
  Users,
  CheckCircle2,
  Download,
  Printer,
  Activity,
  AlertCircle,
} from "lucide-react";

const TREND_COLORS = {
  requests: "#e53935",
  donations: "#3b82f6",
  fulfilled: "#10b981",
  critical: "#f59e0b",
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Concurrently query live data: requests, users, donations, and trends
      const [feedRes, usersRes, donRes, trendsRes] = await Promise.all([
        api.getFeed({ status: "all", limit: 50 }),
        api.getUsers({ limit: 50 }),
        api.getDonationHistory({ limit: 50 }),
        (api.getAnalyticsTrends().catch(() => ({ success: false })) as Promise<{ success: boolean; data?: any; error?: string }>),
      ]);

      const requests: any[] =
        feedRes.success && feedRes.data
          ? (feedRes.data.requests || feedRes.data || [])
          : [];
      const users: any[] =
        usersRes.success && usersRes.data
          ? (usersRes.data.donors || usersRes.data || [])
          : [];
      const donations: any[] =
        donRes.success && donRes.data
          ? (donRes.data.donations || donRes.data || [])
          : [];

      // ─── 1. 100% Real City Distribution ───
      const cityMap: {
        [cityName: string]: {
          city: string;
          requests: number;
          donors: number;
          fulfilled: number;
        };
      } = {};

      requests.forEach((r: any) => {
        const rawCity = r.city_id || r.city || r.city_name;
        const cityName = getCityNameById(rawCity);
        if (!cityMap[cityName]) {
          cityMap[cityName] = {
            city: cityName,
            requests: 0,
            donors: 0,
            fulfilled: 0,
          };
        }
        cityMap[cityName].requests++;
        if (r.status === "fulfilled") {
          cityMap[cityName].fulfilled++;
        }
      });

      users.forEach((u: any) => {
        const rawCity = u.city_id || u.city || u.city_name;
        const cityName = getCityNameById(rawCity);
        if (!cityMap[cityName]) {
          cityMap[cityName] = {
            city: cityName,
            requests: 0,
            donors: 0,
            fulfilled: 0,
          };
        }
        cityMap[cityName].donors++;
      });

      // If backend returned city_distribution and feed was empty, map and sanitize it
      if (
        Object.keys(cityMap).length === 0 &&
        trendsRes.success &&
        trendsRes.data?.city_distribution
      ) {
        (trendsRes.data.city_distribution as any[]).forEach((item: any) => {
          const cName = getCityNameById(item.city || item.city_id);
          if (!cityMap[cName]) {
            cityMap[cName] = {
              city: cName,
              requests: 0,
              donors: 0,
              fulfilled: 0,
            };
          }
          cityMap[cName].requests += Number(item.requests) || 0;
          cityMap[cName].donors += Number(item.donors) || 0;
          cityMap[cName].fulfilled += Number(item.fulfilled) || 0;
        });
      }

      const cleanCities = Object.values(cityMap)
        .filter(
          (c) =>
            c.city !== "Unknown" &&
            c.city !== "Other" &&
            (c.requests > 0 || c.donors > 0)
        )
        .sort((a, b) => b.requests - a.requests);

      setCities(cleanCities);

      // ─── 2. 100% Real Monthly Trends (Past 6 Months) ───
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const now = new Date();
      const pastMonths: {
        month: string;
        year: number;
        monthIndex: number;
        requests: number;
        donations: number;
        fulfilled: number;
        critical: number;
      }[] = [];

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        pastMonths.push({
          month: monthNames[d.getMonth()],
          year: d.getFullYear(),
          monthIndex: d.getMonth(),
          requests: 0,
          donations: 0,
          fulfilled: 0,
          critical: 0,
        });
      }

      requests.forEach((r: any) => {
        if (!r.created_at) return;
        const d = new Date(r.created_at);
        const f = pastMonths.find(
          (m) =>
            m.monthIndex === d.getMonth() && m.year === d.getFullYear()
        );
        if (f) {
          f.requests++;
          if (r.status === "fulfilled") f.fulfilled++;
          if (r.urgency === "critical" || r.urgency === "high") f.critical++;
        }
      });

      donations.forEach((d: any) => {
        if (!d.created_at) return;
        const dt = new Date(d.created_at);
        const f = pastMonths.find(
          (m) =>
            m.monthIndex === dt.getMonth() && m.year === dt.getFullYear()
        );
        if (f) {
          f.donations++;
        }
      });

      const totalRealReqs = pastMonths.reduce((s, m) => s + m.requests, 0);
      if (totalRealReqs > 0) {
        setTrends(pastMonths);
      } else if (trendsRes.success && trendsRes.data?.monthly_trends) {
        setTrends(trendsRes.data.monthly_trends);
      } else {
        setTrends(pastMonths);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Aggregate KPIs from trends
  const kpis = useMemo(() => {
    const totalRequests = trends.reduce((s, t) => s + t.requests, 0);
    const totalDonations = trends.reduce((s, t) => s + t.donations, 0);
    const totalFulfilled = trends.reduce((s, t) => s + t.fulfilled, 0);
    const totalCritical = trends.reduce((s, t) => s + t.critical, 0);
    const fulfillmentRate = totalRequests > 0 ? Math.round((totalFulfilled / totalRequests) * 100) : 0;
    const conversionRate = totalRequests > 0 ? Math.round((totalDonations / totalRequests) * 100) : 0;
    return { totalRequests, totalDonations, totalFulfilled, totalCritical, fulfillmentRate, conversionRate };
  }, [trends]);

  // Max values for chart scaling
  const maxTrendValue = useMemo(() => {
    return Math.max(...trends.map((t) => Math.max(t.requests, t.donations, t.fulfilled)), 1);
  }, [trends]);

  const maxCityRequests = useMemo(() => {
    return Math.max(...cities.map((c) => c.requests), 1);
  }, [cities]);

  // CSV Export
  const handleExportCSV = () => {
    const headers = ["Month,Year,Requests,Donations,Fulfilled,Critical"];
    const rows = trends.map((t) => `${t.month},${t.year},${t.requests},${t.donations},${t.fulfilled},${t.critical}`);

    const cityHeaders = ["\nCity,Requests,Donors,Fulfilled"];
    const cityRows = cities.map((c) => `${c.city},${c.requests},${c.donors},${c.fulfilled}`);

    const csv = [...headers, ...rows, ...cityHeaders, ...cityRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lifelink_analytics_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Print / PDF
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#f8f9fb" }}>
      <Header
        title="Analytics & System Reports"
        subtitle="Monthly trends, regional insights, and exportable intelligence reports"
        onRefresh={fetchAnalytics}
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
                  System Intelligence (UC-6)
                </span>
                <span className="text-white/30 text-xs">•</span>
                <span className="text-white/60 text-xs font-medium">
                  6 Month Rolling Window
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Operational Analytics Console
              </h2>
              <p className="text-white/60 text-xs md:text-sm max-w-xl font-medium leading-relaxed">
                Inspect monthly blood request volume, donor conversion rates, regional demand
                distributions, and export executive summary reports for stakeholder briefings.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#e53935] hover:bg-[#d32f2f] text-white text-xs font-bold transition-all shadow-lg cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>
            </div>
          </div>
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* ─── KPI METRICS ROW ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Requests",
              value: kpis.totalRequests,
              sub: "Across 6 months",
              icon: <Activity className="w-5 h-5" />,
              accent: "#e53935",
              bgAccent: "#fef2f2",
            },
            {
              label: "Donor Pledges",
              value: kpis.totalDonations,
              sub: `${kpis.conversionRate}% conversion rate`,
              icon: <Users className="w-5 h-5" />,
              accent: "#3b82f6",
              bgAccent: "#eff6ff",
            },
            {
              label: "Fulfilled",
              value: kpis.totalFulfilled,
              sub: `${kpis.fulfillmentRate}% fulfillment rate`,
              icon: <CheckCircle2 className="w-5 h-5" />,
              accent: "#10b981",
              bgAccent: "#ecfdf5",
            },
            {
              label: "Critical Cases",
              value: kpis.totalCritical,
              sub: "High urgency flagged",
              icon: <AlertCircle className="w-5 h-5" />,
              accent: "#f59e0b",
              bgAccent: "#fffbeb",
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

        {/* ─── MONTHLY TRENDS CHART ─── */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-400" />
                Monthly Volume Trends
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Requests, donations, and fulfillment over the last 6 months
              </p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: TREND_COLORS.requests }} />
                <span className="text-slate-500">Requests</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: TREND_COLORS.donations }} />
                <span className="text-slate-500">Donations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: TREND_COLORS.fulfilled }} />
                <span className="text-slate-500">Fulfilled</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: TREND_COLORS.critical }} />
                <span className="text-slate-500">Critical</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            </div>
          ) : (
            <div className="flex items-end gap-3 h-64">
              {trends.map((t, i) => {
                const reqH = (t.requests / maxTrendValue) * 100;
                const donH = (t.donations / maxTrendValue) * 100;
                const fulH = (t.fulfilled / maxTrendValue) * 100;
                const criH = (t.critical / maxTrendValue) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full flex items-end justify-center gap-1 h-52">
                      <div className="flex flex-col items-center gap-0.5 flex-1">
                        <span className="text-[9px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {t.requests}
                        </span>
                        <div
                          className="w-full max-w-[18px] rounded-t-md transition-all duration-500 hover:opacity-80"
                          style={{
                            height: `${Math.max(reqH, 4)}%`,
                            background: TREND_COLORS.requests,
                          }}
                        />
                      </div>
                      <div className="flex flex-col items-center gap-0.5 flex-1">
                        <span className="text-[9px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {t.donations}
                        </span>
                        <div
                          className="w-full max-w-[18px] rounded-t-md transition-all duration-500 hover:opacity-80"
                          style={{
                            height: `${Math.max(donH, 4)}%`,
                            background: TREND_COLORS.donations,
                          }}
                        />
                      </div>
                      <div className="flex flex-col items-center gap-0.5 flex-1">
                        <span className="text-[9px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {t.fulfilled}
                        </span>
                        <div
                          className="w-full max-w-[18px] rounded-t-md transition-all duration-500 hover:opacity-80"
                          style={{
                            height: `${Math.max(fulH, 4)}%`,
                            background: TREND_COLORS.fulfilled,
                          }}
                        />
                      </div>
                      <div className="flex flex-col items-center gap-0.5 flex-1">
                        <span className="text-[9px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {t.critical}
                        </span>
                        <div
                          className="w-full max-w-[18px] rounded-t-md transition-all duration-500 hover:opacity-80"
                          style={{
                            height: `${Math.max(criH, 4)}%`,
                            background: TREND_COLORS.critical,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{t.month}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── REGIONAL CITY DISTRIBUTION ─── */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                Regional Distribution by City
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Blood request volume, registered donors, and fulfillment across major cities
              </p>
            </div>
          </div>

          {loading ? (
            <div className="h-48 flex items-center justify-center text-xs text-slate-400">
              Loading regional data...
            </div>
          ) : (
            <div className="space-y-3">
              {cities
                .sort((a, b) => b.requests - a.requests)
                .map((city, i) => {
                  const reqPct = (city.requests / maxCityRequests) * 100;
                  const fulRate = city.requests > 0 ? Math.round((city.fulfilled / city.requests) * 100) : 0;
                  return (
                    <div key={i} className="group">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">{city.city}</span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {city.requests} requests • {city.donors} donors
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px]">
                          <span className="font-bold text-emerald-600">{fulRate}% fulfilled</span>
                          <span className="font-semibold text-slate-400">
                            {city.fulfilled}/{city.requests}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div className="h-full rounded-full relative overflow-hidden" style={{ width: `${reqPct}%` }}>
                          <div
                            className="absolute inset-0 rounded-full transition-all duration-700"
                            style={{
                              background: `linear-gradient(90deg, #e53935 0%, #ef5350 ${fulRate}%, #fca5a5 ${fulRate}%, #fecaca 100%)`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* ─── DATA TABLE ─── */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
          <div className="p-5 px-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Regional Summary Table</h3>
              <p className="text-[11px] text-slate-400">
                Tabular breakdown of city-level metrics for export
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3" />
              Download CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-6">City / Region</th>
                  <th className="py-3 px-4 text-center">Total Requests</th>
                  <th className="py-3 px-4 text-center">Registered Donors</th>
                  <th className="py-3 px-4 text-center">Fulfilled</th>
                  <th className="py-3 px-4 text-center">Fulfillment Rate</th>
                  <th className="py-3 px-4 text-center">Donor : Request Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {cities
                  .sort((a, b) => b.requests - a.requests)
                  .map((city, i) => {
                    const fulRate = city.requests > 0 ? Math.round((city.fulfilled / city.requests) * 100) : 0;
                    const ratio = city.requests > 0 ? (city.donors / city.requests).toFixed(1) : "–";
                    return (
                      <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-bold text-slate-800">{city.city}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-900">{city.requests}</td>
                        <td className="py-3 px-4 text-center font-semibold text-blue-600">{city.donors}</td>
                        <td className="py-3 px-4 text-center font-semibold text-emerald-600">{city.fulfilled}</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              fulRate >= 80
                                ? "bg-emerald-50 text-emerald-700"
                                : fulRate >= 50
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {fulRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-600">{ratio}:1</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
