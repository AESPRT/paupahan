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
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // I-detect ang screen size para i-set ang itemsPerPage (5 sa mobile, 10 sa sm pataas)
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

  // Filter options
  const actionFilters = useMemo(() => {
    return ["all", "create", "update", "delete", "login"];
  }, []);

  // Filter logic para sa searchQuery at selectedFilter
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

  // Pagination Logic
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
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

  // Helper para sa Action Badges
  const getActionBadgeStyle = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes("create") || act.includes("add")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
    }
    if (act.includes("update") || act.includes("edit")) {
      return "bg-blue-50 text-blue-700 border-blue-200/60";
    }
    if (act.includes("delete") || act.includes("remove")) {
      return "bg-rose-50 text-rose-700 border-rose-200/60";
    }
    if (act.includes("login") || act.includes("auth")) {
      return "bg-purple-50 text-purple-700 border-purple-200/60";
    }
    return "bg-slate-50 text-slate-700 border-slate-200/60";
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xs backdrop-blur-xl transition-all duration-300">
      {/* Component Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-forest/10 text-forest">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
              Admin Audit Logs
            </h3>
            <p className="text-xs text-slate-500">
              Talaan ng mga operasyon at pagbabago ng admin
            </p>
          </div>
        </div>

        {logs.length > 0 && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            <span>Kabuuang Logs:</span>
            <span className="font-semibold text-slate-900">{logs.length}</span>
          </div>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs">
          <svg
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Hanapin ang admin o action..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full rounded-full border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none transition-all"
          />
        </div>

        {/* Minimalist Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {actionFilters.map((filter) => {
            const isActive = selectedFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => handleFilterChange(filter)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap uppercase ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
                }`}
              >
                {filter === "all" ? "Lahat" : filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Logs List */}
      <div className="divide-y divide-slate-100 mt-2">
        {currentLogs && currentLogs.length > 0 ? (
          currentLogs.map((log) => (
            <div
              key={log.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 transition-colors hover:bg-slate-50/50 rounded-2xl px-2 -mx-2"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Admin Avatar Circle */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 font-mono text-xs font-semibold text-white">
                  {log.adminName ? log.adminName.charAt(0).toUpperCase() : "A"}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-900">
                      {log.adminName}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize ${getActionBadgeStyle(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate sm:whitespace-normal">
                    Target: <span className="font-medium text-slate-700">{log.target}</span>
                  </p>
                </div>
              </div>

              {/* Timestamp */}
              <div className="shrink-0 text-right sm:text-right text-[11px] font-medium text-slate-400 font-mono">
                {log.timestamp}
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-900">Walang nakitang audit logs</p>
            <p className="text-xs text-slate-500 mt-1">
              Walang tumutugma sa iyong hinahanap o napiling filter.
            </p>
          </div>
        )}
      </div>

      {/* Minimalist Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-2">
          <p className="text-xs text-slate-500">
            Pahina <span className="font-semibold text-slate-900">{currentPage}</span> ng{" "}
            <span className="font-semibold text-slate-900">{totalPages}</span>{" "}
            <span className="text-slate-400">({filteredLogs.length} na resulta)</span>
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