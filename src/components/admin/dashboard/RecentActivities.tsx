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
  const [itemsPerPage, setItemsPerPage] = useState(5); // Default sa 5 (mobile view)

  // I-detect ang screen size para i-set ang itemsPerPage (5 sa mobile, 10 sa sm pataas)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) { // sm breakpoint (640px)
        setItemsPerPage(10);
      } else {
        setItemsPerPage(5);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // I-filter ang activities batay sa napiling type filter
  const filteredActivities = useMemo(() => {
    if (selectedFilter === "all") return activities;
    return activities.filter((act) => act.type === selectedFilter);
  }, [activities, selectedFilter]);

  // Pagination Logicbatay sa na-filter na listahan
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredActivities.slice(startIndex, startIndex + itemsPerPage);

  const handleFilterChange = (filterType: string) => {
    setSelectedFilter(filterType);
    setCurrentPage(1); // Bumalik sa unang pahina kapag nagpalit ng filter
  };

  const getActivityIcon = (type: ActivityNotification["type"]) => {
    switch (type) {
      case "payment":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case "tenant":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shrink-0">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        );
      case "maintenance":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700 shrink-0">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756.2924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-paper-card p-5 shadow-sm space-y-4">
      {/* Component Header with Bell SVG Icon */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest/10 text-forest shrink-0">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h3 className="font-display text-base font-bold text-forest-deep sm:text-lg">
            Huling Gawain at Notification
          </h3>
        </div>

        {/* Playful Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: "Lahat", value: "all" },
            { label: "Payment", value: "payment" },
            { label: "Tenant", value: "tenant" },
            { label: "Maintenance", value: "maintenance" },
          ].map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => handleFilterChange(filter.value)}
              className={`rounded-xl px-2.5 py-1 font-mono-brand text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedFilter === filter.value
                  ? "bg-forest text-white shadow-sm"
                  : "border border-line bg-paper text-muted hover:bg-line/30 hover:text-ink"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {currentItems.length > 0 ? (
          currentItems.map((act) => (
            <div key={act.id} className="flex items-start gap-3 border-b border-line/40 pb-3 last:border-none last:pb-0">
              {getActivityIcon(act.type)}
              <div>
                <p className="text-xs font-bold text-forest-deep">{act.title}</p>
                <p className="text-xs text-muted">{act.description}</p>
                <span className="mt-1 inline-block font-mono-brand text-[10px] text-muted/70">{act.time}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center">
            <p className="text-xs font-bold text-forest-deep">Walang nakitang aktibidad</p>
            <p className="text-[11px] text-muted mt-0.5">Walang tumutugma sa napili mong filter.</p>
          </div>
        )}
      </div>

      {/* Playful Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-line/60">
          <span className="font-mono-brand text-[11px] text-muted">
            Pahina <span className="font-bold text-forest-deep">{currentPage}</span> ng <span className="font-bold text-forest-deep">{totalPages}</span>
            <span className="text-muted/60 ml-1.5">({filteredActivities.length} kabuuan)</span>
          </span>

          <div className="flex items-center gap-1.5 bg-paper border border-line rounded-2xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded-xl font-mono-brand text-xs font-bold text-muted hover:bg-paper-card disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            >
              ←
            </button>

            <div className="flex items-center gap-1 px-1 max-w-[180px] overflow-x-auto">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`h-7 w-7 shrink-0 rounded-xl font-mono-brand text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    currentPage === page
                      ? "bg-forest text-white shadow-sm scale-105"
                      : "text-muted hover:bg-paper-card hover:text-forest-deep"
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
              className="px-2.5 py-1 rounded-xl font-mono-brand text-xs font-bold text-muted hover:bg-paper-card disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}