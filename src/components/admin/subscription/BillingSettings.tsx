"use client";

interface InvoiceHistory {
  id: string;
  date: string;
  amount: number;
  plan: string;
  status: string;
}

const HISTORY: InvoiceHistory[] = [
  { id: "INV-2026-07", date: "July 01, 2026", amount: 499, plan: "Starter Plan", status: "Paid" },
  { id: "INV-2026-06", date: "June 01, 2026", amount: 499, plan: "Starter Plan", status: "Paid" },
];

export function BillingSettings() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Payment Method Section */}
      <div className="rounded-3xl border border-line bg-paper-card p-5 shadow-sm">
        <h3 className="font-mono-brand text-xs font-bold uppercase tracking-wider text-muted mb-4">
          Paraan ng Pagbabayad (Payment Method)
        </h3>

        <div className="flex items-center justify-between rounded-2xl border border-line/80 bg-paper p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-forest-deep text-xs sm:text-sm">GCash Auto-Debit</h4>
              <p className="text-[11px] text-muted font-mono-brand">•••• •••• 0917</p>
            </div>
          </div>

          <button
            onClick={() => alert("Baguhin ang payment method")}
            className="rounded-xl border border-line bg-paper-card px-3 py-1.5 font-mono-brand text-[11px] font-bold text-forest-deep hover:bg-line/40"
          >
            Palitan
          </button>
        </div>
      </div>

      {/* Subscription Invoice History */}
      <div className="rounded-3xl border border-line bg-paper-card p-5 shadow-sm">
        <h3 className="font-mono-brand text-xs font-bold uppercase tracking-wider text-muted mb-4">
          Kasaysayan ng Bayad (SaaS Receipts)
        </h3>

        <div className="space-y-2.5">
          {HISTORY.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl border border-line/60 bg-paper/50 p-3 text-xs"
            >
              <div>
                <span className="font-mono-brand font-bold text-forest-deep">{item.id}</span>
                <p className="text-[10px] text-muted">{item.date} • {item.plan}</p>
              </div>

              <div className="text-right">
                <span className="font-mono-brand font-bold text-forest-deep">
                  ₱{item.amount.toLocaleString()}
                </span>
                <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-forest mt-0.5">
                  <svg className="h-3 w-3 shrink-0 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{item.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}