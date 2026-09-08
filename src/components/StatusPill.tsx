import React from "react";

interface StatusPillProps {
  status: string;
  type?: "status" | "urgency";
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, type = "status" }) => {
  const normalized = status.toLowerCase();

  let colorClasses = "bg-slate-800 text-slate-300 border-slate-700 dot-slate-400";

  if (type === "urgency") {
    if (normalized === "critical") {
      colorClasses = "bg-red-500/15 text-red-400 border-red-500/30 dot-red-500";
    } else if (normalized === "urgent" || normalized === "high") {
      colorClasses = "bg-amber-500/15 text-amber-400 border-amber-500/30 dot-amber-500";
    } else {
      colorClasses = "bg-blue-500/15 text-blue-400 border-blue-500/30 dot-blue-500";
    }
  } else {
    if (normalized === "fulfilled" || normalized === "completed" || normalized === "active" || normalized === "eligible") {
      colorClasses = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 dot-emerald-500";
    } else if (normalized === "open" || normalized === "pending") {
      colorClasses = "bg-amber-500/15 text-amber-400 border-amber-500/30 dot-amber-500";
    } else if (normalized === "expired" || normalized === "cancelled" || normalized === "cooldown") {
      colorClasses = "bg-slate-800/80 text-slate-400 border-white/10 dot-slate-500";
    }
  }

  const dotColor = colorClasses.split(" ").find((c) => c.startsWith("dot-"))?.replace("dot-", "bg-") || "bg-current";

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold tracking-wide capitalize ${colorClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{status.replace("_", " ")}</span>
    </div>
  );
};
