import React from "react";

interface BloodBadgeProps {
  bloodGroup: string;
  size?: "sm" | "md" | "lg";
}

export const BloodBadge: React.FC<BloodBadgeProps> = ({ bloodGroup, size = "md" }) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs rounded-lg",
    md: "w-11 h-11 text-sm rounded-xl",
    lg: "w-14 h-14 text-lg rounded-2xl",
  };

  return (
    <div
      className={`${sizeClasses[size]} bg-red-500/15 border border-red-500/30 flex items-center justify-center font-black text-red-500 tracking-tight shrink-0 select-none shadow-sm`}
    >
      {bloodGroup}
    </div>
  );
};
