"use client";

import { PaidBillHistory } from "@/src/types/tenant/tenant-history";
import { useState } from "react";

interface PaidBillsListProps {
  bills: PaidBillHistory[];
}

export function PaidBillsList({ bills }: PaidBillsListProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  if (bills.length === 0) {
    return (
      <div className="rounded-3xl border border-line bg-paper-card p-8 text-center shadow-sm">
        <p className="text-xs text-muted">Wala pang nakatalang kasaysayan ng bayad.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-base font-bold text-forest-deep sm:text-lg">
        Listahan ng mga Na-settle na Buwan
      </h2>

      <div className="space-y-3">
        {bills.map((bill) => (
          <div
            key={bill.id}
            className="rounded-3xl border border-line bg-paper-card p-5 sm:p-6 shadow-sm transition-all hover:shadow-md space-y-4"
          >
            {/* Top row: Month & Status Badge */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-3">
              <div>
                <span className="font-mono-brand text-[11px] font-bold text-muted uppercase">Billing Month</span>
                <h3 className="font-display text-base font-bold text-forest-deep sm:text-lg">
                  {bill.billingMonth}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 font-mono-brand text-xs font-bold text-emerald-800">
                  <svg className="h-3.5 w-3.5 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Paid
                </span>
              </div>
            </div>

            {/* Middle row: Breakdown & Payment Details */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Amounts Breakdown */}
              <div className="rounded-2xl border border-line bg-paper p-4 space-y-1.5 md:col-span-2">
                <p className="font-display text-xs font-bold text-forest-deep mb-2">Breakdown ng Halaga</p>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-forest/5">
                    <p className="text-[10px] text-muted">Rent</p>
                    <p className="font-mono-brand font-bold text-forest-deep">₱{bill.rentAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50">
                    <p className="text-[10px] text-amber-800">Kuryente</p>
                    <p className="font-mono-brand font-bold text-amber-900">₱{bill.electricityAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-blue-50">
                    <p className="text-[10px] text-blue-800">Tubig</p>
                    <p className="font-mono-brand font-bold text-blue-900">₱{bill.waterAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>

              {/* Payment Meta Info */}
              <div className="rounded-2xl border border-line bg-paper p-4 space-y-1.5 flex flex-col justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] text-muted flex items-center justify-between">
                    <span>Paraan:</span> <strong className="text-forest-deep">{bill.paymentMethod}</strong>
                  </p>
                  <p className="text-[11px] text-muted flex items-center justify-between">
                    <span>Ref No:</span> <strong className="font-mono-brand text-forest-deep">{bill.referenceNumber}</strong>
                  </p>
                  <p className="text-[11px] text-muted flex items-center justify-between">
                    <span>Petsa ng Bayad:</span> <strong className="text-forest-deep">{bill.paidDate}</strong>
                  </p>
                </div>

                {bill.receiptUrl && (
                  <button
                    onClick={() => setSelectedReceipt(bill.receiptUrl!)}
                    className="w-full mt-2 rounded-xl border border-forest/30 bg-forest/5 py-2 font-mono-brand text-xs font-bold text-forest hover:bg-forest hover:text-white transition-all text-center"
                  >
                    Tingnan ang Resibo
                  </button>
                )}
              </div>
            </div>

            {/* Total Footer Row */}
            <div className="flex items-center justify-between pt-2 border-t border-line/60">
              <span className="text-xs text-muted">Kabuuan ng Binayaran</span>
              <span className="font-display text-lg font-black text-forest-deep">
                ₱{bill.totalAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para sa Resibo Preview kung sakaling i-click */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative max-w-lg w-full rounded-3xl bg-paper-card p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h4 className="font-display text-base font-bold text-forest-deep">Resibo ng Pagbabayad</h4>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="rounded-full bg-paper p-1.5 text-muted hover:text-forest-deep"
              >
                ✕
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedReceipt} alt="Proof of Payment" className="max-h-[60vh] w-full rounded-2xl object-contain border border-line" />
          </div>
        </div>
      )}
    </div>
  );
}