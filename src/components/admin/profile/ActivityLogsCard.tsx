"use client";

import { useState } from "react";
import { ActivityLog } from "@/src/types/admin/profile";

interface ActivityLogsCardProps {
  logs: ActivityLog[];
}

export function ActivityLogsCard({ logs }: ActivityLogsCardProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getBadgeStyle = (category: ActivityLog["category"]) => {
    switch (category) {
      case "Billing":
        return "bg-emerald-50/80 text-emerald-700 border-emerald-200/60";
      case "Tenant":
        return "bg-blue-50/80 text-blue-700 border-blue-200/60";
      case "Maintenance":
        return "bg-amber-50/80 text-amber-700 border-amber-200/60";
      case "Security":
        return "bg-purple-50/80 text-purple-700 border-purple-200/60";
      default:
        return "bg-gray-50/80 text-gray-700 border-gray-200/60";
    }
  };

  const getCategoryIcon = (category: ActivityLog["category"]) => {
    switch (category) {
      case "Billing":
        return (
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "Tenant":
        return (
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case "Maintenance":
        return (
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case "Security":
        return (
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      default:
        return (
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  // Kalkulahin ang mga logs para sa kasalukuyang pahina
  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLogs = logs.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="space-y-4 rounded-3xl border border-line/80 bg-paper-card p-5 sm:p-6 shadow-xs transition-all hover:border-line">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line/60 pb-3.5">
        <div>
          <h2 className="font-display text-base font-bold text-forest-deep sm:text-lg tracking-tight">
            Huling mga Gawain (Recent Activity)
          </h2>
          <p className="mt-0.5 text-[11px] text-muted sm:text-xs">
            Suriin ang mga aksyong ginawa mo kamakailan sa system.
          </p>
        </div>

        <span className="hidden sm:flex h-6 items-center justify-center rounded-full bg-paper border border-line/80 px-2.5 text-[10px] font-bold text-forest-deep font-mono-brand">
          {logs.length} Logged
        </span>
      </div>

      {/* Logs List */}
      <div className="space-y-2">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line/80 bg-paper/40 py-8 text-center">
            <svg className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-muted font-medium">Walang kamakailang aktibidad na naitala.</p>
          </div>
        ) : (
          currentLogs.map((log) => (
            <div
              key={log.id}
              className="group flex flex-col gap-2 rounded-2xl border border-line/60 bg-paper p-3 transition-all duration-200 hover:border-line hover:shadow-2xs sm:flex-row sm:items-center sm:justify-between sm:p-3.5"
            >
              {/* Mobile Top Row: Badge + Timestamp */}
              <div className="flex items-center justify-between sm:hidden">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono-brand text-[10px] font-bold ${getBadgeStyle(
                    log.category
                  )}`}
                >
                  {getCategoryIcon(log.category)}
                  {log.category}
                </span>
                <span className="font-mono-brand text-[10px] text-muted">
                  {log.timestamp}
                </span>
              </div>

              {/* Desktop Left side: Badge + Action Text */}
              <div className="flex items-center gap-3 min-w-0">
                {/* Badge (Hidden on mobile, visible on desktop) */}
                <span
                  className={`hidden shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono-brand text-[10px] font-bold sm:inline-flex ${getBadgeStyle(
                    log.category
                  )}`}
                >
                  {getCategoryIcon(log.category)}
                  {log.category}
                </span>

                {/* Action Description Text */}
                <p className="text-xs font-semibold leading-relaxed text-forest-deep break-words min-w-0">
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-line/60 text-xs">
          <span className="text-[11px] text-muted font-mono-brand">
            Pahina <span className="font-semibold text-forest-deep">{currentPage}</span> ng <span className="font-semibold text-forest-deep">{totalPages}</span>
          </span>

          <div className="flex items-center gap-1 bg-paper border border-line/80 rounded-full p-1 shadow-2xs">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-full font-mono-brand text-xs font-semibold text-muted hover:text-forest-deep disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-full font-mono-brand text-xs font-semibold text-muted hover:text-forest-deep disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}