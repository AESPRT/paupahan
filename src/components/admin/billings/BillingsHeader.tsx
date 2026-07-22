"use client";

interface BillingsHeaderProps {
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  onCreateInvoice: () => void;
}

export function BillingsHeader({
  totalCollected,
  totalPending,
  totalOverdue,
  onCreateInvoice,
}: BillingsHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-forest/20 bg-gradient-to-r from-forest via-forest-deep to-forest p-6 text-white shadow-md sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-marigold/20 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-marigold backdrop-blur-md">
              <span>🧾</span> Financials & Invoicing
            </div>
            <h1 className="mt-2 font-display text-2xl font-black sm:text-3xl lg:text-4xl">
              Singilin at Invoice (Billings)
            </h1>
            <p className="mt-1 text-xs text-white/80 sm:text-sm">
              Subaybayan ang nakolekta, natitirang utang, at mag-issue ng bagong bill.
            </p>
          </div>

          <button
            onClick={onCreateInvoice}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-coral px-5 py-3 font-mono-brand text-xs font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-coral-deep active:translate-y-0"
          >
            <span className="text-base font-black">+</span> Lumikha ng Invoice
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-paper-card p-4 shadow-sm">
          <span className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted">
            Nakolekta Ngayong Buwan
          </span>
          <div className="mt-1 font-display text-2xl font-bold text-forest">
            ₱{totalCollected.toLocaleString()}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-paper-card p-4 shadow-sm">
          <span className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted">
            Pending / Aasahan Pa
          </span>
          <div className="mt-1 font-display text-2xl font-bold text-forest-deep">
            ₱{totalPending.toLocaleString()}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-paper-card p-4 shadow-sm">
          <span className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted">
            Overdue / May Huli
          </span>
          <div className="mt-1 font-display text-2xl font-bold text-coral-deep">
            ₱{totalOverdue.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}