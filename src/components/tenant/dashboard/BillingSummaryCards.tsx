"use client";

import { TenantDashboardData } from "@/src/types/tenant/tenant-dashboard";

interface BillingSummaryProps {
  data: TenantDashboardData;
}

export function BillingSummaryCards({ data }: BillingSummaryProps) {
  const getStatusBadge = (status: TenantDashboardData["paymentStatus"]) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Pending":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "Overdue":
        return "bg-rose-100 text-rose-800 border-rose-300";
    }
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* Total Bill Card */}
      <div className="rounded-3xl border border-line bg-paper-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted">
            Babayaran Ngayong Buwan
          </span>
          {/* Receipt / Invoice SVG Icon */}
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-forest/10 text-forest shrink-0">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        <div className="mt-2 font-display text-2xl sm:text-3xl font-black text-forest-deep">
          ₱{data.totalBillThisMonth.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
        </div>
        <p className="mt-1 text-[11px] text-muted">Kasama na ang kuryente at tubig</p>
      </div>

      {/* Pending Balance / Status Card */}
      <div className="rounded-3xl border border-line bg-paper-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted">
            Status ng Bayad
          </span>
          <span
            className={`rounded-full border px-2.5 py-0.5 font-mono-brand text-[10px] font-bold ${getStatusBadge(
              data.paymentStatus
            )}`}
          >
            {data.paymentStatus}
          </span>
        </div>
        <div className="mt-2 font-display text-2xl sm:text-3xl font-black text-coral-deep">
          ₱{data.pendingBalance.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
        </div>
        <p className="mt-1 text-[11px] text-muted">
          {data.pendingBalance > 0 ? "Kailangang bayaran bago mag-due" : "Walang natitirang utang"}
        </p>
      </div>

      {/* Due Date Card */}
      <div className="rounded-3xl border border-line bg-paper-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted">
            Huling Araw ng Bayad (Due Date)
          </span>
          {/* Clock / Due Date SVG Icon */}
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-100 text-amber-700 shrink-0">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="mt-2 font-mono-brand text-2xl sm:text-3xl font-bold text-forest-deep">
          {data.dueDate}
        </div>
        <p className="mt-[2px] text-[11px] text-coral-deep font-semibold">
          i-settle ang bayad bago ang nakatakdang petsa
        </p>
      </div>
    </div>
  );
}