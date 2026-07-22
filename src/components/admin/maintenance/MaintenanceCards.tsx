"use client";

import { MaintenanceRequest, PriorityLevel, MaintenanceStatus } from "@/src/types/maintenance";

interface MaintenanceCardsProps {
  requests: MaintenanceRequest[];
  onUpdateStatus: (id: string, newStatus: MaintenanceStatus) => void;
}

export function MaintenanceCards({ requests, onUpdateStatus }: MaintenanceCardsProps) {
  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case "Emergency":
        return "bg-coral-deep text-white font-bold border-coral-deep";
      case "High":
        return "bg-coral/15 text-coral-deep border-coral/30 font-bold";
      case "Medium":
        return "bg-marigold/20 text-forest-deep border-marigold/30";
      case "Low":
        return "bg-paper text-muted border-line";
    }
  };

  const getStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case "Resolved":
        return "bg-forest/10 text-forest border-forest/20";
      case "In Progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Pending":
        return "bg-amber-50 text-amber-800 border-amber-200";
    }
  };

  const getCategoryIcon = (category: MaintenanceRequest["category"]) => {
    switch (category) {
      case "Plumbing": return "🚰";
      case "Electrical": return "⚡";
      case "Appliance": return "🧺";
      case "Structural": return "🧱";
      default: return "🔧";
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-mono-brand text-xs font-bold uppercase tracking-wider text-muted">
        Mga Nakatalang Ulat ng Sira ({requests.length})
      </h2>

      {requests.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-paper-card p-8 text-center text-xs text-muted">
          🎉 Walang natagpuang maintenance request sa kategoryang ito.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="flex flex-col justify-between rounded-3xl border border-line bg-paper-card p-5 shadow-sm transition-all hover:shadow-md"
            >
              {/* Top Details */}
              <div>
                <div className="flex items-start justify-between border-b border-line/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getCategoryIcon(req.category)}</span>
                    <div>
                      <span className="font-mono-brand text-[10px] font-bold text-muted block">
                        {req.ticketNumber} • {req.dateReported}
                      </span>
                      <h3 className="font-bold text-forest-deep text-xs sm:text-sm">
                        {req.unitName} - {req.roomNumber}
                      </h3>
                      <p className="text-[11px] text-muted">👤 {req.tenantName}</p>
                    </div>
                  </div>

                  <span
                    className={`rounded-md border px-2 py-0.5 font-mono-brand text-[10px] ${getPriorityBadge(
                      req.priority
                    )}`}
                  >
                    {req.priority}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="mt-3 space-y-1">
                  <h4 className="font-display font-bold text-forest-deep text-sm">
                    {req.issueTitle}
                  </h4>
                  <p className="text-xs leading-relaxed text-muted line-clamp-3">
                    {req.description}
                  </p>
                </div>
              </div>

              {/* Status Update & Footer */}
              <div className="mt-5 border-t border-line/60 pt-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono-brand text-[10px] text-muted uppercase">Status:</span>
                  <span
                    className={`rounded-md border px-2.5 py-0.5 font-mono-brand text-[10px] font-bold ${getStatusBadge(
                      req.status
                    )}`}
                  >
                    {req.status}
                  </span>
                </div>

                {/* Quick Action Selector */}
                <div className="flex items-center gap-2">
                  <select
                    value={req.status}
                    onChange={(e) =>
                      onUpdateStatus(req.id, e.target.value as MaintenanceStatus)
                    }
                    className="w-full rounded-xl border border-line bg-paper px-3 py-2 font-mono-brand text-xs font-bold text-forest-deep outline-none focus:border-forest"
                  >
                    <option value="Pending">📌 Mark as Pending</option>
                    <option value="In Progress">🛠️ Mark as In Progress</option>
                    <option value="Resolved">✅ Mark as Resolved</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}