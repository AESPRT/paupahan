"use client";

import { useState, useMemo, useEffect } from "react";
import { AuditLog } from "@/src/types/admin/dashboard";

interface AdminAuditLogsProps {
  logs?: AuditLog[];
}

export function AdminAuditLogs({ logs = [] }: AdminAuditLogsProps) {
  const [searchQuery, setSearchQuery] = useState("");
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

  // I-extract ang mga natatanging action categories/keywords para sa dynamic filters galing sa logs
  const actionFilters = useMemo(() => {
    // Halimbawa: Kunin ang mga unang salita o keywords ng action kung maaari, o magbigay ng standard filters
    return ["all", "create", "update", "delete", "login"];
  }, []);

  // I-filter ang logs batay sa search query (adminName, action, target) at filter
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.target.toLowerCase().includes(searchQuery.toLowerCase());

      if (selectedFilter === "all") return matchesSearch;
      return matchesSearch && log.action.toLowerCase().includes(selectedFilter.toLowerCase());
    });
  }, [logs, searchQuery, selectedFilter]);

  // Pagination Logic batay sa na-filter na listahan
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setCurrentPage(1);
  };

  return (
    <div className="rounded-2xl border border-line bg-paper-card p-5 shadow-sm space-y-4">
      {/* Header with Document / Clipboard SVG Icon */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest/10 text-forest shrink-0">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="font-display text-base font-bold text-forest-deep sm:text-lg">
            Admin Audit Logs
          </h3>
        </div>

        {logs.length > 0 && (
          <span className="font-mono-brand text-[11px] text-muted">
            Kabuuang Logs: <span className="font-bold text-forest-deep">{logs.length}</span>
          </span>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted pointer-events-none">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Hanapin ang admin o action..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full rounded-xl border border-line bg-paper py-1.5 pl-8 pr-3 font-mono-brand text-[11px] text-ink placeholder:text-muted/60 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest shadow-2xs"
          />
        </div>

        {/* Playful Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {actionFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => handleFilterChange(filter)}
              className={`rounded-xl px-2.5 py-1.5 font-mono-brand text-[10px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                selectedFilter === filter
                  ? "bg-forest text-white shadow-sm"
                  : "border border-line bg-paper text-muted hover:bg-line/30 hover:text-ink"
              }`}
            >
              {filter === "all" ? "Lahat" : filter}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {currentLogs && currentLogs.length > 0 ? (
          currentLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between rounded-lg bg-paper p-2.5 text-xs transition-colors hover:bg-paper-card">
              <div>
                <span className="font-bold text-forest">{log.adminName}</span>{" "}
                <span className="text-muted">{log.action}</span>{" "}
                <span className="font-semibold text-ink">({log.target})</span>
              </div>
              <span className="font-mono-brand text-[10px] text-muted shrink-0 ml-2">{log.timestamp}</span>
            </div>
          ))
        ) : (
          <div className="py-8 text-center">
            <p className="text-xs font-bold text-forest-deep">Walang nakitang audit logs</p>
            <p className="text-[11px] text-muted mt-0.5">Walang tumutugma sa iyong hinahanap o napiling filter.</p>
          </div>
        )}
      </div>

      {/* Playful Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-line/60">
          <span className="font-mono-brand text-[11px] text-muted">
            Pahina <span className="font-bold text-forest-deep">{currentPage}</span> ng <span className="font-bold text-forest-deep">{totalPages}</span>
            <span className="text-muted/60 ml-1.5">({filteredLogs.length} na resulta)</span>
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

            <div className="flex items-center gap-1 px-1 max-w-[150px] overflow-x-auto">
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