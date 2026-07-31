"use client";

import { useState, useRef, useEffect } from "react";
import { LeaseStatus, BillStatus } from "@/src/types/tenant/tenant";

interface TenantsFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: LeaseStatus | "All";
  onStatusFilterChange: (status: LeaseStatus | "All") => void;
  paymentFilter: BillStatus | "All";
  onPaymentFilterChange: (status: BillStatus | "All") => void;
}

const STATUS_OPTIONS: { label: string; value: LeaseStatus | "All" }[] = [
  { label: "Lahat ng Status", value: "All" },
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Moving Out", value: "moving_out" },
  { label: "Inactive", value: "inactive" },
];

const PAYMENT_OPTIONS: { label: string; value: BillStatus | "All" }[] = [
  { label: "Lahat ng Bayad", value: "All" },
  { label: "Paid", value: "paid" },
  { label: "Pending", value: "pending" },
  { label: "Overdue", value: "overdue" },
  { label: "Draft", value: "draft" },
];

export function TenantsFilter({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  paymentFilter,
  onPaymentFilterChange,
}: TenantsFilterProps) {
  const [openStatus, setOpenStatus] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);

  const statusRef = useRef<HTMLDivElement>(null);
  const paymentRef = useRef<HTMLDivElement>(null);

  const hasActiveFilters =
    searchTerm !== "" || statusFilter !== "All" || paymentFilter !== "All";

  const handleReset = () => {
    onSearchChange("");
    onStatusFilterChange("All");
    onPaymentFilterChange("All");
  };

  // Isara ang pop-up kapag nag-click sa labas
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setOpenStatus(false);
      }
      if (paymentRef.current && !paymentRef.current.contains(event.target as Node)) {
        setOpenPayment(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentStatusLabel =
    STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label || "Lahat ng Status";

  const currentPaymentLabel =
    PAYMENT_OPTIONS.find((o) => o.value === paymentFilter)?.label || "Lahat ng Bayad";

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-line/80 bg-paper-card p-3.5 shadow-sm sm:p-4 md:flex-row md:items-center md:justify-between">
      {/* 1. Modern Neutral Search Input Field */}
      <div className="group relative flex-1">
        <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within:text-ink">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Maghanap ng pangalan, unit, o contact..."
          className="w-full rounded-2xl border border-line bg-paper py-2.5 pl-10 pr-9 text-xs font-medium text-ink placeholder:text-muted/70 outline-none transition-all duration-200 hover:border-ink/30 focus:border-ink focus:ring-2 focus:ring-ink/10"
        />

        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted transition-colors hover:bg-line hover:text-ink cursor-pointer"
            aria-label="Clear search"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* 2. Custom Pop-up Dropdowns */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          
          {/* CUSTOM POPUP 1: Status Filter */}
          <div className="relative" ref={statusRef}>
            <button
              type="button"
              onClick={() => {
                setOpenStatus(!openStatus);
                setOpenPayment(false);
              }}
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-3.5 py-2.5 text-xs font-semibold text-ink outline-none transition-all duration-200 hover:border-ink/30 focus:ring-2 focus:ring-ink/10 sm:w-auto cursor-pointer"
            >
              <span>{currentStatusLabel}</span>
              <svg
                className={`h-3.5 w-3.5 text-muted transition-transform duration-200 ${
                  openStatus ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Pop-up Menu Options */}
            {openStatus && (
              <div className="absolute left-0 z-30 mt-2 w-48 rounded-2xl border border-line/80 bg-paper p-1.5 shadow-xl transition-all animate-in fade-in zoom-in-95 duration-150">
                {STATUS_OPTIONS.map((option) => {
                  const isSelected = statusFilter === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onStatusFilterChange(option.value);
                        setOpenStatus(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-line/40 text-ink font-semibold"
                          : "text-ink/80 hover:bg-line/20 hover:text-ink"
                      }`}
                    >
                      <span>{option.label}</span>
                      {isSelected && (
                        <svg className="h-4 w-4 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* CUSTOM POPUP 2: Payment Filter */}
          <div className="relative" ref={paymentRef}>
            <button
              type="button"
              onClick={() => {
                setOpenPayment(!openPayment);
                setOpenStatus(false);
              }}
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-3.5 py-2.5 text-xs font-semibold text-ink outline-none transition-all duration-200 hover:border-ink/30 focus:ring-2 focus:ring-ink/10 sm:w-auto cursor-pointer"
            >
              <span>{currentPaymentLabel}</span>
              <svg
                className={`h-3.5 w-3.5 text-muted transition-transform duration-200 ${
                  openPayment ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Pop-up Menu Options */}
            {openPayment && (
              <div className="absolute left-0 z-30 mt-2 w-48 rounded-2xl border border-line/80 bg-paper p-1.5 shadow-xl transition-all animate-in fade-in zoom-in-95 duration-150 sm:right-0 sm:left-auto">
                {PAYMENT_OPTIONS.map((option) => {
                  const isSelected = paymentFilter === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onPaymentFilterChange(option.value);
                        setOpenPayment(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-line/40 text-ink font-semibold"
                          : "text-ink/80 hover:bg-line/20 hover:text-ink"
                      }`}
                    >
                      <span>{option.label}</span>
                      {isSelected && (
                        <svg className="h-4 w-4 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* 3. Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="group flex items-center justify-center gap-1.5 rounded-2xl border border-line bg-paper px-3.5 py-2 text-[11px] font-semibold text-muted transition-all duration-200 hover:border-ink/30 hover:text-ink cursor-pointer"
          >
            <svg className="h-3 w-3 transition-transform duration-300 group-hover:-rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}