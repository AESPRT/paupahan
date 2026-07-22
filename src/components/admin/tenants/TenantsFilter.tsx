"use client";

import { TenantStatus, PaymentStatus } from "@/src/types/tenant";

interface TenantsFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: TenantStatus | "All";
  onStatusFilterChange: (status: TenantStatus | "All") => void;
  paymentFilter: PaymentStatus | "All";
  onPaymentFilterChange: (status: PaymentStatus | "All") => void;
}

export function TenantsFilter({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  paymentFilter,
  onPaymentFilterChange,
}: TenantsFilterProps) {
  // Check kung may active filters para ipakita ang Reset button
  const hasActiveFilters =
    searchTerm !== "" || statusFilter !== "All" || paymentFilter !== "All";

  const handleReset = () => {
    onSearchChange("");
    onStatusFilterChange("All");
    onPaymentFilterChange("All");
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-paper-card p-3.5 shadow-sm sm:p-4 md:flex-row md:items-center md:justify-between">
      {/* 1. Search Input Bar */}
      <div className="relative w-full flex-1">
        <svg
          className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Maghanap ng pangalan, unit, o contact..."
          className="w-full rounded-xl border border-line bg-paper py-2.5 pl-10 pr-9 text-xs font-medium text-ink placeholder:text-muted outline-none transition-all focus:border-forest focus:ring-1 focus:ring-forest"
        />

        {/* Clear Search Icon Button (Lalabas lang kung may nilagay na text) */}
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted hover:bg-line/50 hover:text-ink"
            aria-label="Clear search"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* 2. Filter Dropdowns Section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          {/* Tenant Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) =>
                onStatusFilterChange(e.target.value as TenantStatus | "All")
              }
              className="w-full appearance-none rounded-xl border border-line bg-paper py-2.5 pl-3 pr-8 text-xs font-semibold text-forest-deep outline-none transition-all focus:border-forest sm:w-auto"
            >
              <option value="All">Lahat ng Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Moving Out">Moving Out</option>
              <option value="Inactive">Inactive</option>
            </select>
            {/* Custom Arrow Down Icon */}
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Payment Status Filter */}
          <div className="relative">
            <select
              value={paymentFilter}
              onChange={(e) =>
                onPaymentFilterChange(e.target.value as PaymentStatus | "All")
              }
              className="w-full appearance-none rounded-xl border border-line bg-paper py-2.5 pl-3 pr-8 text-xs font-semibold text-forest-deep outline-none transition-all focus:border-forest sm:w-auto"
            >
              <option value="All">Lahat ng Bayad</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
            {/* Custom Arrow Down Icon */}
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* 3. Optional: Reset Button (Lalabas lang kapag may kahit anong binago sa filter) */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-1 rounded-xl border border-dashed border-line bg-paper px-3 py-2 text-[11px] font-semibold text-muted transition-colors hover:border-coral hover:text-coral-deep"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}