"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
}

interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface AuthContextType {
  user: AdminUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

const API_URL = "https://life-link-backend-production-58a8.up.railway.app";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("lifelink_admin_session");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
        setSession(parsed.session);
      }
    } catch {
      // invalid stored data
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    try {
      const trimmed = identifier.trim();
      // If user inputs a username (e.g. lifelink_admin or admin), map to internal email format
      const email = trimmed.includes("@")
        ? trimmed.toLowerCase()
        : trimmed === "lifelink_admin" || trimmed === "admin"
        ? "admin@lifelink.internal"
        : `${trimmed.toLowerCase()}@lifelink.internal`;

      const res = await fetch(`${API_URL}/auth/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.message || "Login failed" };
      }

      setUser(data.user);
      setSession(data.session);

      localStorage.setItem(
        "lifelink_admin_session",
        JSON.stringify({ user: data.user, session: data.session })
      );

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setSession(null);
    localStorage.removeItem("lifelink_admin_session");
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
