"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Tenant, LeaseStatus, BillStatus } from "@/src/types/tenant/tenant";
import { updateLeaseStatusAction } from "@/src/actions/tenants-actions";

interface TenantsTableProps {
  tenants: Tenant[];
  onSelectTenant: (tenant: Tenant) => void;
  onEditTenant: (tenant: Tenant) => void;
}

const STATUS_OPTIONS: { label: string; value: LeaseStatus }[] = [
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Moving Out", value: "moving_out" },
  { label: "Inactive", value: "inactive" },
];

export function TenantsTable({ tenants, onSelectTenant, onEditTenant }: TenantsTableProps) {
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  const [statusOverrides, setStatusOverrides] = useState<Record<string, LeaseStatus>>({});
  const [loadingTenantId, setLoadingTenantId] = useState<string | null>(null);
  
  // State para sa nakabukang Custom Dropdown
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setItemsPerPage(5);
      } else {
        setItemsPerPage(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Isara ang pop-up kapag nag-click sa labas
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tableRef.current && !tableRef.current.contains(event.target as Node)) {
        setActiveDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStatusBadgeStyle = (status: LeaseStatus) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200/60";
      case "moving_out":
        return "bg-purple-50 text-purple-700 border-purple-200/60";
      case "inactive":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getPaymentBadge = (status: BillStatus) => {
    switch (status) {
      case "paid":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200/50";
      case "pending":
        return "bg-amber-50 text-amber-700 border border-amber-200/50";
      case "overdue":
        return "bg-rose-50 text-rose-700 border border-rose-200/50 font-bold";
      case "draft":
        return "bg-slate-100 text-slate-600 border border-slate-200";
      default:
        return "bg-slate-100 text-slate-600 border border-slate-200";
    }
  };

  const displayTenants = useMemo(() => {
    return tenants.map((tenant) => ({
      ...tenant,
      leaseStatus: statusOverrides[tenant.id] ?? tenant.leaseStatus,
    }));
  }, [tenants, statusOverrides]);

  const totalPages = Math.ceil(displayTenants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTenants = displayTenants.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleStatusChange = async (tenantId: string, newStatus: LeaseStatus) => {
    try {
      setLoadingTenantId(tenantId);
      setActiveDropdownId(null);

      setStatusOverrides((prev) => ({ ...prev, [tenantId]: newStatus }));

      const result = await updateLeaseStatusAction(tenantId, newStatus);
      
      if (!result.success) {
        alert(result.error || "Nabigo sa pag-update ng status.");
        setStatusOverrides((prev) => {
          const copy = { ...prev };
          delete copy[tenantId];
          return copy;
        });
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Nagkaroon ng hindi inaasahang problema.");
      setStatusOverrides((prev) => {
        const copy = { ...prev };
        delete copy[tenantId];
        return copy;
      });
    } finally {
      setLoadingTenantId(null);
    }
  };

  if (displayTenants.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-paper-card p-8 sm:p-12 text-center text-xs sm:text-sm text-muted">
        Walang nahanap na tenant na tumutugma sa iyong search o filter.
      </div>
    );
  }

  return (
    <div className="space-y-4" ref={tableRef}>
      {/* ----------------------------------------------------------------- */}
      {/* 1. MOBILE VIEW: Modern Cards (< md)                               */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-3.5 md:hidden">
        {currentTenants.map((tenant) => (
          <div
            key={tenant.id}
            onClick={() => onSelectTenant(tenant)}
            className="flex flex-col gap-3.5 rounded-3xl border border-line/80 bg-paper-card p-4 shadow-sm transition-all hover:border-line active:scale-[0.99] cursor-pointer"
          >
            {/* Header: Avatar, Name, at Custom Pop-up Status */}
            <div className="flex items-center justify-between border-b border-line/60 pb-3 gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-line bg-paper text-xs font-bold text-ink shadow-xs">
                  {tenant.fullName ? tenant.fullName.substring(0, 2).toUpperCase() : "TN"}
                </div>
                <div>
                  <h3 className="font-bold text-ink text-sm">{tenant.fullName}</h3>
                  <p className="text-[11px] text-muted">{tenant.phone || 'Walang telepono'}</p>
                </div>
              </div>

              {/* Mobile Custom Status Pop-up */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  disabled={loadingTenantId === tenant.id}
                  onClick={() => setActiveDropdownId(activeDropdownId === tenant.id ? null : tenant.id)}
                  className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${getStatusBadgeStyle(tenant.leaseStatus)} ${loadingTenantId === tenant.id ? 'opacity-50' : ''}`}
                >
                  <span className="capitalize">{tenant.leaseStatus.replace("_", " ")}</span>
                  <svg className="h-3 w-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Pop-up Options */}
                {activeDropdownId === tenant.id && (
                  <div className="absolute right-0 z-30 mt-1.5 w-36 rounded-2xl border border-line bg-paper p-1.5 shadow-xl transition-all animate-in fade-in zoom-in-95 duration-150">
                    {STATUS_OPTIONS.map((opt) => {
                      const isSelected = tenant.leaseStatus === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleStatusChange(tenant.id, opt.value)}
                          className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-line/40 text-ink font-semibold"
                              : "text-ink/80 hover:bg-line/20 hover:text-ink"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && (
                            <svg className="h-3.5 w-3.5 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            {/* Details */}
            <div className="flex flex-col gap-1 text-xs">
              <div>
                <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">Unit / Room</span>
                <span className="font-semibold text-ink">
                  {tenant.roomNumber ? `${tenant.unitName} - Room ${tenant.roomNumber}` : tenant.unitName}
                </span>
              </div>
              <div className="mt-1">
                <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">Upa (Rent)</span>
                <span className="font-bold text-ink">₱{tenant.monthlyRent.toLocaleString()}/mo</span>
              </div>
            </div>

            {/* Footer: Payment Status & Modern Actions */}
            <div className="flex items-center justify-between pt-1">
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${getPaymentBadge(tenant.paymentStatus)}`}>
                Bayad: {tenant.paymentStatus}
              </span>

              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onEditTenant(tenant)}
                  className="rounded-xl border border-line bg-paper px-3 py-1.5 text-[11px] font-medium text-ink transition-all hover:bg-line/30 active:scale-95 cursor-pointer"
                >
                  I-edit
                </button>
                <button
                  onClick={() => onSelectTenant(tenant)}
                  className="rounded-xl border border-ink/20 bg-ink px-3 py-1.5 text-[11px] font-medium text-paper transition-all hover:bg-ink/90 active:scale-95 cursor-pointer"
                >
                  Tignan
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 2. DESKTOP VIEW: Modern Minimalist Table Layout                    */}
      {/* ----------------------------------------------------------------- */}
      <div className="hidden rounded-3xl border border-line/80 bg-paper-card shadow-sm md:block">
        <div className="overflow-x-visible">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line/80 bg-paper/50 text-[11px] font-semibold text-muted">
              <tr>
                <th className="px-6 py-4">Tenant</th>
                <th className="px-6 py-4">Detalye (Unit / Upa)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Bayad</th>
                <th className="px-6 py-4 text-right">Aksyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {currentTenants.map((tenant) => (
                <tr
                  key={tenant.id}
                  className="transition-colors hover:bg-paper/40 cursor-pointer"
                  onClick={() => onSelectTenant(tenant)}
                >
                  {/* Column 1: Tenant Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-line bg-paper text-xs font-bold text-ink shadow-xs">
                        {tenant.fullName ? tenant.fullName.substring(0, 2).toUpperCase() : "TN"}
                      </div>
                      <div>
                        <p className="font-bold text-ink">{tenant.fullName}</p>
                        <p className="text-[11px] text-muted">{tenant.phone || 'Walang telepono'}</p>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Unit & Rent */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-ink">
                        {tenant.unitName}
                      </span>
                      {tenant.roomNumber && (
                        <span className="text-[11px] text-muted">Room {tenant.roomNumber}</span>
                      )}
                      <span className="font-bold text-ink text-xs mt-0.5">
                        ₱{tenant.monthlyRent.toLocaleString()}/mo
                      </span>
                    </div>
                  </td>

                  {/* Column 3: Custom Pop-up Lease Status */}
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="relative inline-block text-left">
                      <button
                        type="button"
                        disabled={loadingTenantId === tenant.id}
                        onClick={() => setActiveDropdownId(activeDropdownId === tenant.id ? null : tenant.id)}
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-semibold transition-all cursor-pointer ${getStatusBadgeStyle(tenant.leaseStatus)} ${loadingTenantId === tenant.id ? 'opacity-50' : ''}`}
                      >
                        <span className="capitalize">{tenant.leaseStatus.replace("_", " ")}</span>
                        <svg className="h-3.5 w-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Desktop Pop-up Menu */}
                      {activeDropdownId === tenant.id && (
                        <div className="absolute left-0 z-30 mt-1.5 w-40 rounded-2xl border border-line/80 bg-paper p-1.5 shadow-xl transition-all animate-in fade-in zoom-in-95 duration-150">
                          {STATUS_OPTIONS.map((opt) => {
                            const isSelected = tenant.leaseStatus === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleStatusChange(tenant.id, opt.value)}
                                className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                                  isSelected
                                    ? "bg-line/40 text-ink font-semibold"
                                    : "text-ink/80 hover:bg-line/20 hover:text-ink"
                                }`}
                              >
                                <span>{opt.label}</span>
                                {isSelected && (
                                  <svg className="h-3.5 w-3.5 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Column 4: Payment Status */}
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${getPaymentBadge(tenant.paymentStatus)}`}>
                      {tenant.paymentStatus}
                    </span>
                  </td>

                  {/* Column 5: Modern Action Buttons */}
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEditTenant(tenant)}
                        className="rounded-xl border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink transition-all hover:border-ink/30 hover:bg-line/30 active:scale-95 cursor-pointer"
                      >
                        I-edit
                      </button>
                      <button
                        onClick={() => onSelectTenant(tenant)}
                        className="rounded-xl border border-ink/20 bg-ink px-3 py-1.5 text-xs font-medium text-paper transition-all hover:bg-ink/90 active:scale-95 cursor-pointer shadow-xs"
                      >
                        Tignan
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 3. MODERN MINIMALIST PAGINATION                                   */}
      {/* ----------------------------------------------------------------- */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-3xl border border-line/80 bg-paper-card px-4 sm:px-6 py-3 shadow-sm">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`group flex items-center gap-1.5 rounded-2xl border border-line bg-paper px-3.5 py-2 text-xs font-medium transition-all ${
              currentPage === 1
                ? "cursor-not-allowed opacity-40 text-muted"
                : "text-ink hover:border-ink/30 hover:bg-line/30 active:scale-95 cursor-pointer"
            }`}
          >
            <span className="transition-transform group-hover:-translate-x-0.5">←</span>
            <span>Nakaraan</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-ink text-paper shadow-xs">
              {currentPage}
            </span>
            <span className="text-muted text-[11px] px-1">ng</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-xl border border-line bg-paper text-muted">
              {totalPages}
            </span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`group flex items-center gap-1.5 rounded-2xl border border-line bg-paper px-3.5 py-2 text-xs font-medium transition-all ${
              currentPage === totalPages
                ? "cursor-not-allowed opacity-40 text-muted"
                : "text-ink hover:border-ink/30 hover:bg-line/30 active:scale-95 cursor-pointer"
            }`}
          >
            <span>Susunod</span>
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </button>
        </div>
      )}
    </div>
  );
}