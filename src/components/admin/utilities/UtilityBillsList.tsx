"use client";

import { RoomUtilityBill } from "@/src/types/admin/utility";

interface UtilityBillsListProps {
  bills: RoomUtilityBill[];
  onMarkAsPaid: (id: string) => void;
}

export function UtilityBillsList({ bills, onMarkAsPaid }: UtilityBillsListProps) {
  const getBadge = (status: RoomUtilityBill["status"]) => {
    switch (status) {
      case "Paid":
        return "bg-forest/10 text-forest border-forest/20";
      case "Pending":
        return "bg-marigold/20 text-forest-deep border-marigold/30";
      case "Overdue":
        return "bg-coral/15 text-coral-deep border-coral/30 font-bold";
    }
  };

  const getIcon = (type: RoomUtilityBill["type"]) => {
    switch (type) {
      case "electricity":
        return (
          <svg className="h-4 w-4 text-marigold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case "water":
        return (
          <svg className="h-4 w-4 text-sky-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case "internet":
        return (
          <svg className="h-4 w-4 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
        );
      case "amenities":
        return (
          <svg className="h-4 w-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-mono-brand text-xs font-bold uppercase tracking-wider text-muted">
        Naka-assign na Utility Bills
      </h2>

      {/* 1. Mobile Cards (< md screens) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {bills.map((bill) => (
          <div
            key={bill.id}
            className="flex flex-col gap-3 rounded-2xl border border-line bg-paper-card p-4 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-line/60 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-forest/5 border border-forest/10">
                  {getIcon(bill.type)}
                </div>
                <div>
                  <h3 className="font-bold text-forest-deep text-xs">{bill.tenantName}</h3>
                  <p className="text-[10px] text-muted">{bill.unitName} • {bill.roomNumber}</p>
                </div>
              </div>
              <span className={`rounded-md border px-2 py-0.5 font-mono-brand text-[10px] ${getBadge(bill.status)}`}>
                {bill.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-muted block font-mono-brand">DUE DATE</span>
                <span className="font-medium text-ink">{bill.dueDate}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted block font-mono-brand">HALAGA</span>
                <span className="font-bold text-forest-deep text-sm">₱{bill.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {bill.status !== "Paid" && (
              <button
                onClick={() => onMarkAsPaid(bill.id)}
                className="w-full rounded-xl bg-forest/10 border border-forest/20 py-2 font-mono-brand text-xs font-bold text-forest hover:bg-forest hover:text-white transition-all"
              >
                I-mark bilang Bayad na
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 2. Desktop Table (≥ md screens) */}
      <div className="hidden overflow-hidden rounded-2xl border border-line bg-paper-card shadow-sm md:block">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-line bg-paper font-mono-brand uppercase text-muted">
            <tr>
              <th className="px-5 py-4 font-bold">Room & Tenant</th>
              <th className="px-5 py-4 font-bold">Uri ng Bill</th>
              <th className="px-5 py-4 font-bold">Due Date</th>
              <th className="px-5 py-4 font-bold">Halaga</th>
              <th className="px-5 py-4 font-bold">Status</th>
              <th className="px-5 py-4 text-right font-bold">Aksyon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {bills.map((bill) => (
              <tr key={bill.id} className="hover:bg-paper/60 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-bold text-forest-deep">{bill.tenantName}</p>
                  <p className="text-[11px] text-muted">{bill.unitName} - {bill.roomNumber}</p>
                </td>
                <td className="px-5 py-4 font-semibold text-ink">
                  <div className="inline-flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-forest/5 border border-forest/10">
                      {getIcon(bill.type)}
                    </div>
                    <span className="capitalize">{bill.type}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-muted font-medium">{bill.dueDate}</td>
                <td className="px-5 py-4 font-bold text-forest-deep">₱{bill.totalAmount.toLocaleString()}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-md border px-2.5 py-1 font-mono-brand text-[10px] ${getBadge(bill.status)}`}>
                    {bill.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  {bill.status !== "Paid" && (
                    <button
                      onClick={() => onMarkAsPaid(bill.id)}
                      className="rounded-lg border border-forest/30 bg-forest/5 px-3 py-1.5 font-mono-brand text-[11px] font-bold text-forest hover:bg-forest hover:text-white transition-colors"
                    >
                      Mark as Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}