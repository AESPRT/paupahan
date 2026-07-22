"use client";

import { Tenant } from "@/src/types/tenant";

interface TenantsTableProps {
  tenants: Tenant[];
  onSelectTenant: (tenant: Tenant) => void;
}

export function TenantsTable({ tenants, onSelectTenant }: TenantsTableProps) {
  const getStatusBadge = (status: Tenant["status"]) => {
    switch (status) {
      case "Active":
        return "bg-forest/10 text-forest border-forest/20";
      case "Pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "Moving Out":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "Inactive":
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getPaymentBadge = (status: Tenant["paymentStatus"]) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-100 text-emerald-700";
      case "Pending":
        return "bg-marigold/20 text-forest-deep";
      case "Overdue":
        return "bg-coral/15 text-coral-deep font-bold";
    }
  };

  if (tenants.length === 0) {
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
        {tenants.map((tenant) => (
          <div
            key={tenant.id}
            onClick={() => onSelectTenant(tenant)}
            className="flex flex-col gap-3 rounded-2xl border border-line bg-paper-card p-4 shadow-sm transition-all active:scale-[0.99]"
          >
            {/* Header: Avatar, Name, at Action */}
            <div className="flex items-center justify-between border-b border-line/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-forest/20 bg-coral/10 font-mono-brand text-xs font-bold text-coral-deep">
                  {tenant.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-forest-deep text-sm">{tenant.name}</h3>
                  <p className="text-[11px] text-muted">{tenant.phone}</p>
                </div>
              </div>

              <span className={`rounded-md border px-2 py-0.5 font-mono-brand text-[10px] font-bold ${getStatusBadge(tenant.status)}`}>
                {tenant.status}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] uppercase font-mono-brand text-muted block">Unit / Room</span>
                <span className="font-semibold text-ink">{tenant.unit} - {tenant.room}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono-brand text-muted block">Upa (Rent)</span>
                <span className="font-bold text-forest-deep">₱{tenant.rentAmount.toLocaleString()}/mo</span>
              </div>
            </div>

            {/* Footer: Payment Status & Button */}
            <div className="flex items-center justify-between pt-1">
              <span className={`rounded-full px-2.5 py-0.5 font-mono-brand text-[10px] font-bold ${getPaymentBadge(tenant.paymentStatus)}`}>
                Bayad: {tenant.paymentStatus}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTenant(tenant);
                }}
                className="rounded-lg border border-line bg-paper px-3 py-1 text-[11px] font-bold text-forest-deep hover:bg-paper-card"
              >
                Tignan Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 2. DESKTOP/TABLET VIEW: Table Layout (Lalabas sa ≥ md screens)    */}
      {/* ----------------------------------------------------------------- */}
      <div className="hidden overflow-hidden rounded-2xl border border-line bg-paper-card shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-paper font-mono-brand uppercase text-muted">
              <tr>
                <th className="px-5 py-4 font-bold">Tenant</th>
                <th className="px-5 py-4 font-bold">Unit / Kwarto</th>
                <th className="px-5 py-4 font-bold">Upa (Rent)</th>
                <th className="px-5 py-4 font-bold">Status</th>
                <th className="px-5 py-4 font-bold">Bayad</th>
                <th className="px-5 py-4 text-right font-bold">Aksyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {tenants.map((tenant) => (
                <tr
                  key={tenant.id}
                  className="transition-colors hover:bg-paper/60 cursor-pointer"
                  onClick={() => onSelectTenant(tenant)}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-forest/20 bg-coral/10 font-mono-brand text-xs font-bold text-coral-deep">
                        {tenant.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-forest-deep">{tenant.name}</p>
                        <p className="text-[11px] text-muted">{tenant.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-ink">
                    {tenant.unit} - <span className="text-muted">{tenant.room}</span>
                  </td>
                  <td className="px-5 py-4 font-bold text-forest-deep">
                    ₱{tenant.rentAmount.toLocaleString()}/mo
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-md border px-2.5 py-1 font-mono-brand text-[10px] font-bold ${getStatusBadge(tenant.status)}`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 font-mono-brand text-[10px] font-bold ${getPaymentBadge(tenant.paymentStatus)}`}>
                      {tenant.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectTenant(tenant)}
                      className="rounded-lg border border-line px-3 py-1.5 text-[11px] font-bold text-forest-deep hover:bg-paper"
                    >
                      Tignan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}