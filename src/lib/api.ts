const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
  options?: RequestInit
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

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options,
      cache: "no-store",
    });

    if (res.status === 401 || res.status === 403) {
      // Token expired or not admin — clear session and redirect
      if (typeof window !== "undefined") {
        localStorage.removeItem("lifelink_admin_session");
        window.location.href = "/login";
      }
      return { success: false, error: "Session expired. Please login again." };
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
    blood_group?: string;
    urgency?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.blood_group && params.blood_group !== "all")
      query.set("blood_group", params.blood_group);
    if (params?.urgency && params.urgency !== "all")
      query.set("urgency", params.urgency);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit || 20));
    if (params?.search) query.set("search", params.search);

    const qs = query.toString();
    return fetchFromApi<any>(`/blood-requests/feed${qs ? `?${qs}` : ""}`);
  },

  // Urgent Requests
  getUrgentRequests: async (limit: number = 6) => {
    return fetchFromApi<any[]>(`/blood-requests/urgent?limit=${limit}`);
  },

  // Single Request Details
  getRequestDetails: async (id: string) => {
    return fetchFromApi<any>(`/blood-requests/${id}`);
  },

  // Update Request Status
  updateRequestStatus: async (id: string, status: string) => {
    return fetchFromApi<any>(`/blood-requests/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  // Support FAQs
  
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
