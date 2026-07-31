"use client";

import { ActivityNotification } from "@/src/types/admin/dashboard";
import { useState, useMemo, useEffect } from "react";

interface RecentActivitiesProps {
  activities?: ActivityNotification[];
}

export function RecentActivities({ activities = [] }: RecentActivitiesProps) {
  // State para sa search/filters at pagination
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // I-detect ang screen size para i-set ang itemsPerPage
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setItemsPerPage(10);
      } else {
        setItemsPerPage(5);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // I-filter ang activities
  const filteredActivities = useMemo(() => {
    if (selectedFilter === "all") return activities;
    return activities.filter((act) => act.type === selectedFilter);
  }, [activities, selectedFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredActivities.slice(startIndex, startIndex + itemsPerPage);

  const handleFilterChange = (filterType: string) => {
    setSelectedFilter(filterType);
    setCurrentPage(1);
  };

  const getActivityIcon = (type: ActivityNotification["type"]) => {
    switch (type) {
      case "payment":
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case "tenant":
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        );
      case "maintenance":
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756.2924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getBadgeStyle = (type: ActivityNotification["type"]) => {
    switch (type) {
      case "payment":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      case "tenant":
        return "bg-blue-50 text-blue-700 border-blue-200/60";
      case "maintenance":
        return "bg-amber-50 text-amber-700 border-amber-200/60";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200/60";
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xs backdrop-blur-xl transition-all duration-300">
      {/* Component Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-forest/10 text-forest">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
              Huling Gawain at Notification
            </h3>
            <p className="text-xs text-slate-500">
              Suriin ang mga real-time na update sa paupahan
            </p>
          </div>
        </div>

        {/* Minimalist Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {[
            { label: "Lahat", value: "all" },
            { label: "Payment", value: "payment" },
            { label: "Tenant", value: "tenant" },
            { label: "Maintenance", value: "maintenance" },
          ].map((filter) => {
            const isActive = selectedFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => handleFilterChange(filter.value)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Activity Item List */}
      <div className="divide-y divide-slate-100">
        {currentItems.length > 0 ? (
          currentItems.map((act) => (
            <div
              key={act.id}
              className="group flex items-start justify-between gap-4 py-4 transition-colors hover:bg-slate-50/50 rounded-2xl px-2 -mx-2"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                {getActivityIcon(act.type)}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-900 leading-snug">
                      {act.title}
                    </p>
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize ${getBadgeStyle(
                        act.type
                      )}`}
                    >
                      {act.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed truncate sm:whitespace-normal">
                    {act.description}
                  </p>
                </div>
              </div>

              {/* Timestamp */}
              <div className="shrink-0 text-right">
                <span className="text-[11px] font-medium text-slate-400">
                  {act.time}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-900">Walang nakitang aktibidad</p>
            <p className="text-xs text-slate-500 mt-1">
              Subukang palitan ang napili mong filter.
            </p>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-2">
          <p className="text-xs text-slate-500">
            Ipinapakita ang pahina{" "}
            <span className="font-semibold text-slate-900">{currentPage}</span> ng{" "}
            <span className="font-semibold text-slate-900">{totalPages}</span>{" "}
            <span className="text-slate-400">({filteredActivities.length} kabuuan)</span>
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
            >
              Atras
            </button>

            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${
                    currentPage === page
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all cursor-pointer"
            >
              Sulong
            </button>
          </div>
        </div>
      )}
    </div>
  );
}