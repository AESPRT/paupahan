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
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-xl font-bold text-blue-600">
              📱
            </span>
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
                <span className="block text-[10px] font-bold text-forest">✓ {item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}