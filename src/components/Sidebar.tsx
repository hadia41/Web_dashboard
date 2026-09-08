"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  HeartHandshake,
  ShieldAlert,
  Radio,
  LogOut,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Blood Requests", href: "/requests", icon: HeartHandshake },
    { name: "Reports & Moderation", href: "/support", icon: ShieldAlert },
    { name: "Broadcast Alerts", href: "/broadcast", icon: Radio },
  ];

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 sticky top-0 h-screen">
      <div>
        {/* Brand */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="LifeLink"
            width={32}
            height={32}
            className="object-contain"
            priority
          />
          <div>
            <span className="font-bold text-base text-slate-900 tracking-tight">LifeLink</span>
            <span className="text-[10px] font-semibold text-slate-400 block -mt-0.5">
              Admin Dashboard
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-colors ${
                  isActive
                    ? "bg-red-50 text-[#E53935] font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#E53935]" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info + Logout */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        {user && (
          <div className="px-1">
            <p className="text-xs font-semibold text-slate-800 truncate">
              {user.full_name}
            </p>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors w-full"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
