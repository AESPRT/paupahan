"use client";

import { Invoice } from "@/src/types/admin/billing";

interface InvoicesListProps {
  invoices: Invoice[];
  onMarkAsPaid: (id: string) => void;
  onSendReminder: (invoice: Invoice) => void;
}

export function InvoicesList({
  invoices,
  onMarkAsPaid,
  onSendReminder,
}: InvoicesListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-mono-brand text-xs font-bold uppercase tracking-wider text-muted">
          Mga Inilabas na Resibo at Invoice ({invoices.length})
        </h2>
      </div>

      {/* Receipts Grid View - Responsive (1 col sa mobile, 2 cols sa tablet, 3 cols sa desktop) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {invoices.map((inv) => {
          const isPaid = inv.status === "Paid";
          const isOverdue = inv.status === "Overdue";

          return (
            <div
              key={inv.id}
              className="perforated relative flex flex-col justify-between rounded-2xl border border-line bg-paper-card p-5 pb-6 shadow-[0_8px_24px_rgba(27,58,52,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(27,58,52,0.12)]"
            >
              {/* Receipt Header */}
              <div>
                <div className="mb-3.5 flex items-start justify-between border-b-[1.5px] border-dashed border-line pb-3.5">
                  <div>
                    <div className="font-mono-brand text-[10px] font-bold tracking-wide text-muted">
                      RESIBO NG BAYARIN • {inv.invoiceNumber}
                    </div>
                    <div className="mt-1 font-display text-[15px] font-bold text-forest-deep">
                      {inv.unitRoom}
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] font-medium text-muted mt-0.5">
                      <svg className="h-3.5 w-3.5 shrink-0 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{inv.tenantName}</span>
                    </div>
                  </div>
                  <div className="font-mono-brand text-[10px] font-bold text-muted text-right">
                    <span>Due:</span>
                    <span className="block text-ink">{inv.dueDate}</span>
                  </div>
                </div>

                {/* Line Items Breakdown */}
                <div className="space-y-1.5 py-1">
                  {inv.lineItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between font-mono-brand text-[12.5px] text-ink"
                    >
                      <span className="text-muted">{item.description}</span>
                      <span className="font-semibold">
                        ₱{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Receipt Total */}
                <div className="mt-3.5 flex items-center justify-between border-t-[1.5px] border-dashed border-line pt-3 font-mono-brand font-semibold">
                  <span className="text-xs text-muted uppercase">Kabuuan</span>
                  <span className="text-[19px] font-extrabold text-forest-deep sm:text-[21px]">
                    ₱{inv.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Dynamic Animated Stamp Badge */}
              {isPaid && (
                <div className="stamp-anim pointer-events-none absolute right-[10px] top-[35%] rotate-[-8deg] rounded-[10px] border-[3px] border-coral bg-paper-card/95 px-3 py-1 font-display text-[16px] font-extrabold tracking-wide text-coral shadow-sm sm:text-[18px]">
                  BAYAD NA!
                </div>
              )}

              {isOverdue && (
                <div className="stamp-anim pointer-events-none absolute right-[10px] top-[35%] rotate-[6deg] rounded-[10px] border-[3px] border-coral bg-paper-card/95 px-3 py-1 font-display text-[15px] font-extrabold tracking-wide text-coral-deep shadow-sm sm:text-[17px]">
                  OVERDUE!
                </div>
              )}

              {/* Receipt Footer Action Buttons */}
              <div className="mt-5 border-t border-line/60 pt-3">
                {!isPaid ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSendReminder(inv)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-line bg-paper py-2 font-mono-brand text-[11px] font-bold text-forest-deep transition-colors hover:bg-line/40 active:scale-95"
                    >
                      <svg className="h-3.5 w-3.5 shrink-0 text-marigold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <span>I-remind</span>
                    </button>
                    <button
                      onClick={() => onMarkAsPaid(inv.id)}
                      className="rounded-xl bg-forest py-2 font-mono-brand text-[11px] font-bold text-white shadow-sm transition-all hover:bg-forest-deep active:scale-95"
                    >
                      Mark Paid
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1.5 text-center font-mono-brand text-[11px] font-bold text-forest">
                    <svg className="h-4 w-4 shrink-0 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Kumpleto na ang bayad</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}