import CitiesData from "@/data/cities.json";

/**
 * Resolves a city ID (e.g. "8504972", "13406360", "city_lahore", "city_multan")
 * or city name to a human-readable city name matching the mobile app implementation.
 */
export const normalizeCityStr = (str: string): string => {
  return str
    .replace(/^city_/i, "")
    .replace(/_/g, " ")
    .trim();
};

export const capitalizeWords = (str: string): string => {
  return str
    .split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ");
};

/**
 * Resolves a city ID or city name to a human-readable city name using cities.json.
 */
export const getCityNameById = (
  cityIdOrName?: string | number | null,
  lang: string = "en"
): string => {
  if (!cityIdOrName || cityIdOrName === "N/A" || cityIdOrName === "undefined" || cityIdOrName === "null") {
    return "Pakistan";
  }
  const rawStr = String(cityIdOrName).trim();
  if (!rawStr || rawStr === "N/A" || rawStr === "undefined") return "Pakistan";

  const normalized = normalizeCityStr(rawStr).toLowerCase();

  const city = CitiesData.cities.find(
    (c) =>
      String(c.id) === rawStr ||
      String(c.id) === normalized ||
      c.name.en.toLowerCase() === normalized ||
      c.name.en.toLowerCase() === rawStr.toLowerCase() ||
      c.name.ur === rawStr
  );

  if (city) {
    const l = lang === "ur" ? "ur" : "en";
    return city.name[l] || city.name.en || capitalizeWords(normalized);
  }

  // If input was numeric digits and not found, do not return raw numbers as a city
  if (/^\d+$/.test(rawStr)) {
    return "Other";
  }

  return capitalizeWords(normalized) || "Pakistan";
};

/**
 * Resolves a clean city name from any request, report, or profile object.
 */
export const resolveCityFromItem = (item?: any): string => {
  if (!item) return "Pakistan";
  if (typeof item === "string" || typeof item === "number") {
    return getCityNameById(item);
  }

  // 1. If city_id is provided, map it through cities.json (like mobile)
  if (item.city_id) {
    const mapped = getCityNameById(item.city_id);
    if (mapped && mapped !== "Pakistan") return mapped;
  }

  // 2. If city property is provided
  if (item.city) {
    const mapped = getCityNameById(item.city);
    if (mapped && mapped !== "Pakistan") return mapped;
  }

  // 3. If city_name is provided
  if (item.city_name) {
    const mapped = getCityNameById(item.city_name);
    if (mapped && mapped !== "Pakistan") return mapped;
  }

  // 4. Location formatted fallback
  if (item.location_formatted) {
    return item.location_formatted.split(",")[0].trim();
  }

  return "Pakistan";
};

/**
 * Resolves state/province name from a city ID or city name.
 */
export const getProvinceByCityId = (cityIdOrName?: string | number | null): string => {
  if (!cityIdOrName || cityIdOrName === "N/A" || cityIdOrName === "undefined") return "";
  const rawStr = String(cityIdOrName).trim();
  if (!rawStr) return "";

  const normalized = normalizeCityStr(rawStr).toLowerCase();

  const city = CitiesData.cities.find(
    (c) =>
      c.id === rawStr ||
      c.id === normalized ||
      c.name.en.toLowerCase() === normalized ||
      c.name.en.toLowerCase() === rawStr.toLowerCase() ||
      c.name.ur === rawStr
  );

  return city?.province || "";
};

/**
 * Resolves the true operational status of a blood request.
 * Automatically marks requests as 'expired' if their required_date is in the past.
 */
export const resolveRequestStatus = (
  item?: any
): "open" | "expired" | "fulfilled" | "cancelled" => {
  if (!item) return "open";
  const rawStatus = (item.status || "open").toLowerCase().trim();

  if (rawStatus === "fulfilled" || rawStatus === "completed") return "fulfilled";
  if (rawStatus === "cancelled") return "cancelled";
  if (rawStatus === "expired" || item.is_expired === true) return "expired";

  // Check if required_date has passed
  if (item.required_date) {
    const reqDate = new Date(item.required_date);
    if (!isNaN(reqDate.getTime()) && reqDate.getTime() < Date.now()) {
      return "expired";
    }
  }

  return "open";
};
