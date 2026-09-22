"use client";

import React, { useState } from "react";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const AVATAR_COLORS = [
  { bg: "bg-red-100 text-red-700 border-red-200" },
  { bg: "bg-blue-100 text-blue-700 border-blue-200" },
  { bg: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { bg: "bg-purple-100 text-purple-700 border-purple-200" },
  { bg: "bg-amber-100 text-amber-700 border-amber-200" },
  { bg: "bg-teal-100 text-teal-700 border-teal-200" },
  { bg: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { bg: "bg-rose-100 text-rose-700 border-rose-200" },
];

function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColorIndex(name?: string | null): number {
  if (!name) return 0;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % AVATAR_COLORS.length;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  size = "md",
  className = "",
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-9 h-9 text-xs",
    lg: "w-12 h-12 text-sm",
    xl: "w-16 h-16 text-base",
  };

  const initials = getInitials(name);
  const colorStyle = AVATAR_COLORS[getColorIndex(name)].bg;

  // Clean URL check - filter out obvious bad URLs or expired AbstractAPI links
  const isValidSrc =
    src &&
    typeof src === "string" &&
    src.trim().length > 0 &&
    src.startsWith("http") &&
    !hasError;

  if (isValidSrc) {
    return (
      <img
        src={src}
        alt={name || "User avatar"}
        onError={() => setHasError(true)}
        className={`${sizeClasses[size]} rounded-full object-cover border border-slate-200 shrink-0 ${className}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold tracking-tight select-none border shrink-0 ${colorStyle} ${className}`}
      title={name || "User"}
    >
      {initials}
    </div>
  );
};
