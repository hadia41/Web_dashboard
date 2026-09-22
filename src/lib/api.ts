const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "https://life-link-backend-production-58a8.up.railway.app";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("lifelink_admin_session");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.session?.access_token || null;
    }
  } catch {
    // ignore
  }
  return null;
}

export async function fetchFromApi<T>(
  endpoint: string,
  options?: RequestInit & { skipAuthRedirect?: boolean }
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options?.headers as Record<string, string> || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const { skipAuthRedirect, ...fetchOptions } = options || {};

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...fetchOptions,
      cache: "no-store",
    });

    if (res.status === 401) {
      if (!skipAuthRedirect) {
        // Token expired or not authenticated — clear session and redirect
        if (typeof window !== "undefined") {
          localStorage.removeItem("lifelink_admin_session");
          window.location.href = "/login";
        }
      }
      return { success: false, error: "Unauthorized" };
    }

    if (res.status === 403) {
      return { success: false, error: "Forbidden: insufficient permissions" };
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { success: false, error: errorData.message || `HTTP ${res.status}` };
    }

    const json = await res.json();
    return { success: true, data: json.data || json };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to connect to backend" };
  }
}

export const api = {
  // Blood Requests Feed
  getFeed: async (params?: {
    status?: string;
    blood_group?: string;
    urgency?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== "default") {
      query.set("status", params.status);
    }
    if (params?.blood_group && params.blood_group !== "all")
      query.set("blood_group", params.blood_group);
    if (params?.urgency && params.urgency !== "all")
      query.set("urgency", params.urgency);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) {
      // Backend validates: limit must not be greater than 50
      const safeLimit = Math.min(Math.max(Number(params.limit) || 20, 1), 50);
      query.set("limit", String(safeLimit));
    }
    if (params?.search) query.set("search", params.search);

    const qs = query.toString();
    return fetchFromApi<any>(`/blood-requests/feed${qs ? `?${qs}` : ""}`);
  },

  // Urgent Requests
  getUrgentRequests: async (limit: number = 6) => {
    return fetchFromApi<any[]>(`/blood-requests/urgent?limit=${limit}`);
  },

  // Overview Dashboard Statistics
  getDashboardStats: async () => {
    return fetchFromApi<{
      total_donors: number;
      active_requests: number;
      critical_requests: number;
      fulfilled_donations: number;
      lives_saved: number;
      response_time_avg: string;
    }>("/dashboard/stats");
  },

  // Single Request Details
  getRequestDetails: async (id: string) => {
    return fetchFromApi<any>(`/blood-requests/${id}`);
  },

  // Get donations/donors for a specific request (may 401 for admin — don't logout)
  getDonationsForRequest: async (requestId: string) => {
    return fetchFromApi<any>(`/donations/request/${requestId}`, { skipAuthRedirect: true });
  },

  // Update Request Status
  updateRequestStatus: async (id: string, status: string) => {
    return fetchFromApi<any>(`/blood-requests/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  // User Management (FR-9 / UC-9)
  getUsers: async (params?: {
    search?: string;
    blood_group?: string;
    city_id?: string;
    is_available?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.blood_group && params.blood_group !== "all") query.set("blood_group", params.blood_group);
    if (params?.city_id && params.city_id !== "all") query.set("city_id", params.city_id);
    if (params?.is_available !== undefined) query.set("is_available", String(params.is_available));
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return fetchFromApi<any>(`/profile/donors${qs ? "?" + qs : ""}`);
  },

  toggleUserAvailability: async (id: string, is_available: boolean) => {
    return fetchFromApi<any>(`/profile/${id}/availability`, {
      method: "PATCH",
      body: JSON.stringify({ is_available }),
    });
  },

  // Donation Records & Audit Trail (UC-10)
  getDonationHistory: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.status && params.status !== "all") query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    const qs = query.toString();
    return fetchFromApi<any>(`/donations/history${qs ? "?" + qs : ""}`);
  },

  // Analytics & Trends (UC-6)
  getAnalyticsTrends: async () => {
    return fetchFromApi<any>("/analytics/trends");
  },

  // Moderation & Reports Center
  getReports: async (params?: {
    status?: string;
    target_type?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== "all") query.set("status", params.status);
    if (params?.target_type && params.target_type !== "all") query.set("target_type", params.target_type);
    if (params?.priority && params.priority !== "all") query.set("priority", params.priority);
    if (params?.search) query.set("search", params.search);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return fetchFromApi<any>(`/support/reports${qs ? "?" + qs : ""}`);
  },

  getReportStats: async () => {
    return fetchFromApi<any>("/support/stats");
  },

  takeReportAction: async (
    id: string,
    body: { action_taken: string; admin_notes?: string; status?: string }
  ) => {
    return fetchFromApi<any>(`/support/reports/${id}/action`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  // Emergency Broadcast Alerts
  sendBroadcast: async (payload: {
    title: string;
    message: string;
    city?: string;
    blood_group?: string;
    urgency?: string;
  }) => {
    return fetchFromApi<any>("/dashboard/broadcast", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
