import { TenantBill } from "@/src/types/tenant-bill";

interface BillCardItemProps {
  bill: TenantBill;
  onOpenDetails: (bill: TenantBill) => void;
}

export function BillCardItem({ bill, onOpenDetails }: BillCardItemProps) {
  const getStatusBadge = (status: TenantBill["status"]) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Pending Payment":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "Draft Pending Readings":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "Overdue":
        return "bg-rose-100 text-rose-800 border-rose-300";
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-line bg-paper-card p-4 sm:p-5 transition-all hover:border-forest/40 sm:flex-row sm:items-center sm:justify-between">
      {/* Left Info */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-base font-bold text-forest-deep sm:text-lg">
            {bill.monthYear}
          </h3>
          <span
            className={`rounded-md border px-2 py-0.5 font-mono-brand text-[10px] font-bold ${getStatusBadge(
              bill.status
            )}`}
          >
            {bill.status}
          </span>
        </div>
        <p className="font-mono-brand text-xs text-muted">
          Invoice: {bill.id} • Due Date: {bill.dueDate}
        </p>
      </div>

      {/* Right Price & Trigger Action */}
      <div className="flex items-center justify-between gap-4 border-t border-line/50 pt-3 sm:border-0 sm:pt-0 sm:justify-end">
        <div className="text-left sm:text-right">
          <p className="font-mono-brand text-[10px] uppercase font-bold text-muted">
            Base / Estimated Bill
          </p>
          <p className="font-display text-lg font-black text-forest-deep sm:text-xl">
            ₱{bill.totalAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </p>
        </div>

        <button
          onClick={() => onOpenDetails(bill)}
          className="flex items-center gap-1.5 rounded-2xl bg-forest px-3.5 py-2.5 font-mono-brand text-xs font-bold text-white shadow-xs hover:bg-forest-deep transition-all active:scale-95 shrink-0"
        >
          {/* Eye SVG Icon */}
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <span>Buksan Details</span>
        </button>
      </div>
    </div>
  );
}