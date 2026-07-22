"use client";

import { RoomUtilityBill } from "@/src/types/utility";

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
      case "electricity": return "⚡";
      case "water": return "💧";
      case "internet": return "🌐";
      case "amenities": return "🧹";
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
              <div className="flex items-center gap-2">
                <span className="text-xl">{getIcon(bill.type)}</span>
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
                  <span className="mr-1.5">{getIcon(bill.type)}</span>
                  <span className="capitalize">{bill.type}</span>
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