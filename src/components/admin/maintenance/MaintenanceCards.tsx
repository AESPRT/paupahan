"use client";

import { MaintenanceRequest, PriorityLevel, MaintenanceStatus } from "@/src/types/admin/maintenance";

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
      case "Plumbing":
        return (
          <svg className="h-5 w-5 shrink-0 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case "Electrical":
        return (
          <svg className="h-5 w-5 shrink-0 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case "Appliance":
        return (
          <svg className="h-5 w-5 shrink-0 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        );
      case "Structural":
        return (
          <svg className="h-5 w-5 shrink-0 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 shrink-0 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-mono-brand text-xs font-bold uppercase tracking-wider text-muted">
        Mga Nakatalang Ulat ng Sira ({requests.length})
      </h2>

      {requests.length === 0 ? (
        <div className="flex items-center justify-center gap-2 rounded-3xl border border-dashed border-line bg-paper-card p-8 text-center text-xs text-muted">
          <svg className="h-4 w-4 shrink-0 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Walang natagpuang maintenance request sa kategoryang ito.</span>
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
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-paper border border-line/60">
                      {getCategoryIcon(req.category)}
                    </span>
                    <div>
                      <span className="font-mono-brand text-[10px] font-bold text-muted block">
                        {req.ticketNumber} • {req.dateReported}
                      </span>
                      <h3 className="font-bold text-forest-deep text-xs sm:text-sm">
                        {req.unitName} - {req.roomNumber}
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] text-muted mt-0.5">
                        <svg className="h-3 w-3 shrink-0 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{req.tenantName}</span>
                      </div>
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
                    <option value="Pending">Mark as Pending</option>
                    <option value="In Progress">Mark as In Progress</option>
                    <option value="Resolved">Mark as Resolved</option>
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