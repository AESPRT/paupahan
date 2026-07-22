"use client";

import { ActivityLog } from "@/src/types/profile";

interface ActivityLogsCardProps {
  logs: ActivityLog[];
}

export function ActivityLogsCard({ logs }: ActivityLogsCardProps) {
  const getBadgeStyle = (category: ActivityLog["category"]) => {
    switch (category) {
      case "Billing":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Tenant":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Maintenance":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Security":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-4 rounded-3xl border border-line bg-paper-card p-4 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="border-b border-line pb-3">
        <h2 className="font-display text-base font-bold text-forest-deep sm:text-lg">
          Huling mga Gawain (Recent Activity)
        </h2>
        <p className="mt-0.5 text-[11px] text-muted sm:text-xs">
          Suriin ang mga aksyong ginawa mo kamakailan sa system.
        </p>
      </div>

      {/* Logs List */}
      <div className="space-y-2.5">
        {logs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line p-6 text-center text-xs text-muted">
            Walang kamakailang aktibidad na naitala.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex flex-col gap-1.5 rounded-2xl border border-line/60 bg-paper p-3 transition-colors hover:bg-paper/80 sm:flex-row sm:items-center sm:justify-between sm:p-3.5"
            >
              {/* Mobile Top Row: Badge + Timestamp */}
              <div className="flex items-center justify-between sm:hidden">
                <span
                  className={`rounded-md border px-2 py-0.5 font-mono-brand text-[10px] font-bold leading-none ${getBadgeStyle(
                    log.category
                  )}`}
                >
                  {log.category}
                </span>
                <span className="font-mono-brand text-[10px] text-muted">
                  {log.timestamp}
                </span>
              </div>

              {/* Desktop Left side: Badge + Action Text */}
              <div className="flex items-center gap-2.5">
                {/* Badge (Hidden on mobile, visible on desktop) */}
                <span
                  className={`hidden shrink-0 rounded-md border px-2 py-0.5 font-mono-brand text-[10px] font-bold leading-none sm:inline-block ${getBadgeStyle(
                    log.category
                  )}`}
                >
                  {log.category}
                </span>

                {/* Action Description Text */}
                <p className="text-xs font-semibold leading-snug text-forest-deep break-words">
                  {log.action}
                </p>
              </div>

              {/* Desktop Right side: Timestamp (Hidden on mobile) */}
              <span className="hidden font-mono-brand text-[11px] text-muted shrink-0 sm:inline-block">
                {log.timestamp}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}