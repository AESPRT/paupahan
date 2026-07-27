"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tenant, LeaseStatus, BillStatus } from "@/src/types/tenant/tenant";
import { updateLeaseStatusAction } from "@/src/actions/tenants-actions";

interface TenantsTableProps {
  tenants: Tenant[];
  onSelectTenant: (tenant: Tenant) => void;
  onEditTenant: (tenant: Tenant) => void;
}

export function TenantsTable({ tenants, onSelectTenant, onEditTenant }: TenantsTableProps) {
  const router = useRouter();
  
  // States para sa pagination at responsive itemsPerPage (3 kapag mobile, 5 kapag desktop)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  // Gamitin ang local override states para sa instant UI feedback habang umaasa sa prop para sa main data
  const [statusOverrides, setStatusOverrides] = useState<Record<string, LeaseStatus>>({});
  const [loadingTenantId, setLoadingTenantId] = useState<string | null>(null);

  // I-detect ang screen size para i-set ang itemsPerPage (3 sa mobile, 5 sa md pataas)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint sa Tailwind (768px)
        setItemsPerPage(5);
      } else {
        setItemsPerPage(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getStatusBadge = (status: LeaseStatus) => {
    switch (status) {
      case "active":
        return "bg-forest/10 text-forest border-forest/20";
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "moving_out":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "inactive":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getPaymentBadge = (status: BillStatus) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-700";
      case "pending":
        return "bg-marigold/20 text-forest-deep";
      case "overdue":
        return "bg-coral/15 text-coral-deep font-bold";
      case "draft":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Pagsamahin ang prop data at ang local overrides para laging updated
  const displayTenants = useMemo(() => {
    return tenants.map((tenant) => ({
      ...tenant,
      leaseStatus: statusOverrides[tenant.id] ?? tenant.leaseStatus,
    }));
  }, [tenants, statusOverrides]);

  // Kalkulahin ang pagination
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

      // 1. I-update agad ang local override para sa instant real-time feedback
      setStatusOverrides((prev) => ({ ...prev, [tenantId]: newStatus }));

      // 2. Tawagin ang server action para i-save sa database
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
      <div className="rounded-2xl border border-dashed border-line bg-paper-card p-8 sm:p-12 text-center text-xs sm:text-sm text-muted">
        Walang nahanap na tenant na tumutugma sa iyong search o filter.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ----------------------------------------------------------------- */}
      {/* 1. MOBILE VIEW: Stacked Cards (Lalabas lang sa Mobile Screen < md) */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {currentTenants.map((tenant) => (
          <div
            key={tenant.id}
            onClick={() => onSelectTenant(tenant)}
            className="flex flex-col gap-3 rounded-2xl border border-line bg-paper-card p-4 shadow-sm transition-all active:scale-[0.99] cursor-pointer"
          >
            {/* Header: Avatar, Name, at Status Select */}
            <div className="flex items-center justify-between border-b border-line/60 pb-3 gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-forest/20 bg-coral/10 font-mono-brand text-xs font-bold text-coral-deep">
                  {tenant.fullName ? tenant.fullName.substring(0, 2).toUpperCase() : "TN"}
                </div>
                <div>
                  <h3 className="font-bold text-forest-deep text-sm">{tenant.fullName}</h3>
                  <p className="text-[11px] text-muted">{tenant.phone || 'Walang telepono'}</p>
                </div>
              </div>

              {/* Status Dropdown Mobile */}
              <div onClick={(e) => e.stopPropagation()}>
                <select
                  value={tenant.leaseStatus}
                  disabled={loadingTenantId === tenant.id}
                  onChange={(e) => handleStatusChange(tenant.id, e.target.value as LeaseStatus)}
                  className={`rounded-md border px-2 py-1 font-mono-brand text-[10px] font-bold uppercase outline-none cursor-pointer ${getStatusBadge(tenant.leaseStatus)} ${loadingTenantId === tenant.id ? 'opacity-50' : ''}`}
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="moving_out">Moving Out</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Details Grid (Mobile) */}
            <div className="flex flex-col gap-1 text-xs">
              <div>
                <span className="text-[10px] uppercase font-mono-brand text-muted block">Unit / Room</span>
                <span className="font-semibold text-ink">
                  {tenant.roomNumber ? `${tenant.unitName} - Room ${tenant.roomNumber}` : tenant.unitName}
                </span>
              </div>
              <div className="mt-1">
                <span className="text-[10px] uppercase font-mono-brand text-muted block">Upa (Rent)</span>
                <span className="font-bold text-forest-deep">₱{tenant.monthlyRent.toLocaleString()}/mo</span>
              </div>
            </div>

            {/* Footer: Payment Status & Action Buttons */}
            <div className="flex items-center justify-between pt-1">
              <span className={`rounded-full px-2.5 py-0.5 font-mono-brand text-[10px] font-bold uppercase ${getPaymentBadge(tenant.paymentStatus)}`}>
                Bayad: {tenant.paymentStatus}
              </span>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onEditTenant(tenant)}
                  className="rounded-lg border border-forest/30 bg-forest/5 px-3 py-1 text-[11px] font-bold text-forest hover:bg-forest/10 cursor-pointer"
                >
                  I-edit
                </button>
                <button
                  onClick={() => onSelectTenant(tenant)}
                  className="rounded-lg border border-line bg-paper px-3 py-1 text-[11px] font-bold text-forest-deep hover:bg-paper-card cursor-pointer"
                >
                  Tignan
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 2. DESKTOP/TABLET VIEW: Table Layout na may Pababang Detalye       */}
      {/* ----------------------------------------------------------------- */}
      <div className="hidden overflow-hidden rounded-2xl border border-line bg-paper-card shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-paper font-mono-brand uppercase text-muted">
              <tr>
                <th className="px-5 py-4 font-bold">Tenant</th>
                <th className="px-5 py-4 font-bold">Detalye (Unit / Upa)</th>
                <th className="px-5 py-4 font-bold">Status</th>
                <th className="px-5 py-4 font-bold">Bayad</th>
                <th className="px-5 py-4 text-right font-bold">Aksyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {currentTenants.map((tenant) => (
                <tr
                  key={tenant.id}
                  className="transition-colors hover:bg-paper/60 cursor-pointer"
                  onClick={() => onSelectTenant(tenant)}
                >
                  {/* Column 1: Tenant Info */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-forest/20 bg-coral/10 font-mono-brand text-xs font-bold text-coral-deep">
                        {tenant.fullName ? tenant.fullName.substring(0, 2).toUpperCase() : "TN"}
                      </div>
                      <div>
                        <p className="font-bold text-forest-deep">{tenant.fullName}</p>
                        <p className="text-[11px] text-muted">{tenant.phone || 'Walang telepono'}</p>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Unit / Room at Upa (Pababa / Stacked nang walang room kung unit-level) */}
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-ink">
                        {tenant.unitName}
                      </span>
                      {tenant.roomNumber && (
                        <span className="text-[11px] text-muted">Room {tenant.roomNumber}</span>
                      )}
                      <span className="font-bold text-forest-deep text-xs mt-0.5">
                        ₱{tenant.monthlyRent.toLocaleString()}/mo
                      </span>
                    </div>
                  </td>

                  {/* Column 3: Lease Status */}
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={tenant.leaseStatus}
                      disabled={loadingTenantId === tenant.id}
                      onChange={(e) => handleStatusChange(tenant.id, e.target.value as LeaseStatus)}
                      className={`rounded-md border px-2.5 py-1 font-mono-brand text-[10px] font-bold uppercase outline-none cursor-pointer ${getStatusBadge(tenant.leaseStatus)} ${loadingTenantId === tenant.id ? 'opacity-50' : ''}`}
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="moving_out">Moving Out</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>

                  {/* Column 4: Payment Status */}
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 font-mono-brand text-[10px] font-bold uppercase ${getPaymentBadge(tenant.paymentStatus)}`}>
                      {tenant.paymentStatus}
                    </span>
                  </td>

                  {/* Column 5: Actions */}
                  <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEditTenant(tenant)}
                        className="rounded-lg border border-forest/30 bg-forest/5 px-3 py-1.5 text-[11px] font-bold text-forest hover:bg-forest/10 cursor-pointer"
                      >
                        I-edit
                      </button>
                      <button
                        onClick={() => onSelectTenant(tenant)}
                        className="rounded-lg border border-line px-3 py-1.5 text-[11px] font-bold text-forest-deep hover:bg-paper cursor-pointer"
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
      {/* 3. PLAYFUL PAGINATION CONTROLS                                    */}
      {/* ----------------------------------------------------------------- */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-line bg-paper-card px-4 sm:px-6 py-3 shadow-sm">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`group flex items-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 font-mono-brand text-xs font-bold transition-all ${
              currentPage === 1
                ? "cursor-not-allowed opacity-40 bg-line/20 text-muted"
                : "bg-forest/10 text-forest hover:bg-forest hover:text-white active:scale-95"
            }`}
          >
            <span className="transition-transform group-hover:-translate-x-0.5">←</span> Nakaraan
          </button>

          <div className="flex items-center gap-2 font-mono-brand text-xs font-bold text-forest-deep">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest text-white shadow-sm">
              {currentPage}
            </span>
            <span className="text-muted">ng</span>
            <span className="rounded-lg bg-line/40 px-2 py-1 text-ink">{totalPages}</span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`group flex items-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 font-mono-brand text-xs font-bold transition-all ${
              currentPage === totalPages
                ? "cursor-not-allowed opacity-40 bg-line/20 text-muted"
                : "bg-forest/10 text-forest hover:bg-forest hover:text-white active:scale-95"
            }`}
          >
            Susunod <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </button>
        </div>
      )}
    </div>
  );
}