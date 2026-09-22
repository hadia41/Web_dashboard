import { getCityNameById, resolveRequestStatus } from "./cityUtils";

/**
 * Escapes a field for standard RFC 4180 CSV format.
 * Wraps values containing commas, quotes, or newlines in double quotes.
 */
export function escapeCSV(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).trim();
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Triggers browser download of a CSV file with UTF-8 BOM so Excel opens cleanly.
 */
export function downloadCSV(filename: string, content: string): void {
  // \uFEFF is the UTF-8 Byte Order Mark (BOM) for Excel compatibility on Windows/Mac
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 1. Users & Donors Directory CSV
 */
export function generateUsersCSV(users: any[]): string {
  const headers = [
    "User ID",
    "Full Name",
    "Blood Group",
    "Contact Phone",
    "Email Address",
    "City",
    "Province / Region",
    "Availability Status",
    "Total Donations",
    "Account Role",
    "Registered Date",
  ];

  const rows = users.map((u, idx) => {
    const rawCity = u.city_id || u.city || u.city_name;
    const cityName = getCityNameById(rawCity);
    const dateStr = u.created_at
      ? new Date(u.created_at).toISOString().split("T")[0]
      : "N/A";

    return [
      escapeCSV(u.id || `USR-${idx + 1}`),
      escapeCSV(u.full_name || "Anonymous User"),
      escapeCSV(u.blood_group || "Unknown"),
      escapeCSV(u.phone || "—"),
      escapeCSV(u.email || "—"),
      escapeCSV(cityName),
      escapeCSV(u.province || "Punjab"),
      escapeCSV(u.is_available !== false ? "Available (Active)" : "In Cooldown / Resting"),
      escapeCSV(u.total_donations || 0),
      escapeCSV(u.role || "Donor / Volunteer"),
      escapeCSV(dateStr),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\r\n");
}

/**
 * 2. Clinical Blood Requests Registry CSV
 */
export function generateRequestsCSV(requests: any[]): string {
  const headers = [
    "Case ID",
    "Patient Name",
    "Blood Group Needed",
    "Units Required",
    "Urgency Level",
    "Hospital / Facility",
    "City",
    "Required By Date",
    "Current Case Status",
    "Attendant Name",
    "Attendant Phone",
    "Created Date",
  ];

  const rows = requests.map((r, idx) => {
    const rawCity = r.city_id || r.city || r.city_name;
    const cityName = getCityNameById(rawCity);
    const resolvedStatus = resolveRequestStatus(r);
    const reqDate = r.required_date
      ? new Date(r.required_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
      : "Immediate";
    const createdDate = r.created_at
      ? new Date(r.created_at).toISOString().split("T")[0]
      : "N/A";

    return [
      escapeCSV(r.id || `REQ-${idx + 1}`),
      escapeCSV(r.patient_name || r.patientName || "Emergency Patient"),
      escapeCSV(r.blood_group || r.bloodGroup || "—"),
      escapeCSV(r.units_needed || r.units || 1),
      escapeCSV((r.urgency || "normal").toUpperCase()),
      escapeCSV(r.hospital_name || r.hospitalName || "Regional Medical Center"),
      escapeCSV(cityName),
      escapeCSV(reqDate),
      escapeCSV(resolvedStatus.toUpperCase()),
      escapeCSV(r.requester?.full_name || r.requester_name || "Attendant"),
      escapeCSV(r.contact_number || r.phone || r.requester?.phone || "—"),
      escapeCSV(createdDate),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\r\n");
}

/**
 * 3. Verified Donations Log CSV
 */
export function generateDonationsCSV(donations: any[]): string {
  const headers = [
    "Donation ID",
    "Donor Name",
    "Donor Blood Group",
    "Recipient Patient",
    "Hospital / Clinic",
    "City",
    "Donation Status",
    "Units Transferred",
    "Recorded Date",
  ];

  const rows = donations.map((d, idx) => {
    const rawCity = d.city_id || d.request?.city_id || d.city;
    const cityName = getCityNameById(rawCity);
    const dateStr = d.created_at
      ? new Date(d.created_at).toISOString().split("T")[0]
      : "N/A";

    return [
      escapeCSV(d.id || `DON-${idx + 1}`),
      escapeCSV(d.donor?.full_name || d.user?.full_name || "Verified Donor"),
      escapeCSV(d.donor?.blood_group || d.blood_group || "—"),
      escapeCSV(d.request?.patient_name || d.patient_name || "Emergency Patient"),
      escapeCSV(d.request?.hospital_name || d.hospital_name || "Central Hospital"),
      escapeCSV(cityName),
      escapeCSV((d.status || "completed").toUpperCase()),
      escapeCSV(d.units || 1),
      escapeCSV(dateStr),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\r\n");
}

/**
 * 4. Regional City Distribution CSV
 */
export function generateCityDistributionCSV(cities: any[]): string {
  const headers = [
    "City Name",
    "Total Blood Requests",
    "Registered Donors",
    "Fulfilled Cases",
    "Fulfillment Rate (%)",
    "Demand Priority Status",
  ];

  const rows = cities.map((c) => {
    const rate = c.requests > 0 ? Math.round((c.fulfilled / c.requests) * 100) : 100;
    let priority = "Optimal Supply";
    if (c.requests > 5 && rate < 30) priority = "High Deficit Alert";
    else if (c.requests > 2 && rate < 50) priority = "Moderate Deficit";

    return [
      escapeCSV(c.city),
      escapeCSV(c.requests),
      escapeCSV(c.donors),
      escapeCSV(c.fulfilled),
      escapeCSV(`${rate}%`),
      escapeCSV(priority),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\r\n");
}

/**
 * 5. Consolidated Master Executive Audit Report CSV
 * Multi-section workbook format with metadata, KPIs, city breakdown, requests, and donors.
 */
export function generateMasterAuditCSV(params: {
  kpis: any;
  trends: any[];
  cities: any[];
  users: any[];
  requests: any[];
  donations: any[];
}): string {
  const { kpis, cities, users, requests, donations } = params;
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const sections: string[] = [];

  // ── Header Block ──
  sections.push([
    "LIFELINK NATIONAL BLOOD TRANSFUSION & EMERGENCY NETWORK",
    "OFFICIAL COMPREHENSIVE SYSTEM AUDIT & ANALYTICS REPORT",
    `Generated On: ${dateStr}`,
    "Security Classification: CONFIDENTIAL HEALTH INFORMATICS",
  ].map(escapeCSV).join("\r\n"));

  sections.push(""); // empty row

  // ── Section 1: Executive KPI Metrics ──
  sections.push("SECTION 1: EXECUTIVE PLATFORM METRICS");
  sections.push([
    "Metric Name",
    "Total Value",
    "Status / Target",
  ].join(","));
  sections.push([escapeCSV("Total Emergency Blood Requests"), escapeCSV(requests.length || kpis.totalRequests), escapeCSV("Active Database Records")].join(","));
  sections.push([escapeCSV("Registered Donors & Volunteers"), escapeCSV(users.length), escapeCSV("Registered Profiles")].join(","));
  sections.push([escapeCSV("Verified Donations & Pledges"), escapeCSV(donations.length || kpis.totalDonations), escapeCSV("Audit Logged")].join(","));
  sections.push([escapeCSV("Critical / High Urgency Cases"), escapeCSV(kpis.totalCritical), escapeCSV("Priority 1 Cases")].join(","));
  sections.push([escapeCSV("Platform Fulfillment Rate"), escapeCSV(`${kpis.fulfillmentRate}%`), escapeCSV("Overall Rate")].join(","));

  sections.push(""); // empty row

  // ── Section 2: Regional Demand Summary ──
  sections.push("SECTION 2: REGIONAL CITY DISTRIBUTION & SUPPLY");
  sections.push(generateCityDistributionCSV(cities));

  sections.push(""); // empty row

  // ── Section 3: Registered Donors Registry ──
  sections.push(`SECTION 3: REGISTERED DONORS & VOLUNTEERS DIRECTORY (${users.length} Total)`);
  sections.push(generateUsersCSV(users));

  sections.push(""); // empty row

  // ── Section 4: Clinical Blood Requests Registry ──
  sections.push(`SECTION 4: CLINICAL BLOOD REQUESTS REGISTRY (${requests.length} Total Cases)`);
  sections.push(generateRequestsCSV(requests));

  sections.push(""); // empty row

  // ── Section 5: Completed Donations Audit Log ──
  sections.push(`SECTION 5: VERIFIED DONATIONS AUDIT LOG (${donations.length} Records)`);
  sections.push(generateDonationsCSV(donations));

  return sections.join("\r\n");
}
