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

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Left Details (Wala nang text-center, naka-align sa kaliwa) */}
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-marigold backdrop-blur-md">
              <svg className="h-3.5 w-3.5 shrink-0 text-marigold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
              </svg>
              <span>Financials & Invoicing</span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-black sm:text-3xl lg:text-4xl">
              Singilin at Invoice (Billings)
            </h1>
            <p className="mt-1 text-xs text-white/80 sm:text-sm">
              Subaybayan ang nakolekta, natitirang utang, at mag-issue ng bagong bill.
            </p>
          </div>

          {/* Button Container (Full width sa mobile, nakasentro ang icon at text sa loob) */}
          <div className="flex w-full sm:w-auto sm:justify-end">
            <button
              onClick={onCreateInvoice}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-coral px-5 py-3 font-mono-brand text-xs font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-coral-deep active:translate-y-0 sm:w-auto"
            >
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>Lumikha ng Invoice</span>
            </button>
          </div>
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