/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { PaidBillHistory } from "@/src/types/tenant/tenant-history";
import Image from "next/image";
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
        Listahan ng mga Na-settle na Buwan ({bills.length})
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {bills.map((bill) => (
          <div
            key={bill.id}
            className="perforated relative flex flex-col justify-between rounded-2xl border border-line bg-paper-card p-5 pb-6 shadow-[0_8px_24px_rgba(27,58,52,0.08)] transition-all hover:-translate-y-1"
          >
            <div>
              {/* Header: Resibo Code at Billing Month / Due */}
              <div className="mb-3.5 flex items-start justify-between border-b-[1.5px] border-dashed border-line pb-3.5">
                <div>
                  <div className="font-mono-brand text-[10px] font-bold tracking-wide text-muted">
                    RESIBO NG BAYARIN • {bill.id}
                  </div>
                  <div className="mt-1 font-display text-[15px] font-bold text-forest-deep">
                    {bill.billingMonth}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted mt-0.5">
                    <span>Petsa ng Bayad:</span>
                    <span className="text-ink font-semibold">{bill.paidDate}</span>
                  </div>
                </div>
              </div>

              {/* Line Items Breakdown */}
              <div className="space-y-1.5 py-1">
                <div className="flex justify-between font-mono-brand text-[12.5px] text-ink">
                  <span className="text-muted">Buwanang Renta</span>
                  <span className="font-semibold">
                    ₱{bill.rentAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {bill.electricityAmount > 0 && (
                  <div className="flex justify-between font-mono-brand text-[12.5px] text-ink">
                    <span className="text-muted">Kuryente (Electricity)</span>
                    <span className="font-semibold">
                      ₱{bill.electricityAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                {bill.waterAmount > 0 && (
                  <div className="flex justify-between font-mono-brand text-[12.5px] text-ink">
                    <span className="text-muted">Tubig (Water)</span>
                    <span className="font-semibold">
                      ₱{bill.waterAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>

              {/* Total Amount */}
              <div className="mt-3.5 flex items-center justify-between border-t-[1.5px] border-dashed border-line pt-3 font-mono-brand font-semibold">
                <span className="text-xs text-muted uppercase">Kabuuan</span>
                <span className="text-[19px] font-extrabold text-forest-deep sm:text-[21px]">
                  ₱{bill.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Payment Details & Receipt Preview */}
              <div className="mt-3 rounded-xl bg-forest/5 p-3 border border-forest/15 space-y-2 font-mono-brand text-[11px]">
                <div className="font-bold text-forest-deep flex items-center justify-between">
                  <span>💳 Paraan ng Bayad:</span>
                  <span className="uppercase bg-forest/10 px-2 py-0.5 rounded text-forest font-extrabold">
                    {bill.paymentMethod}
                  </span>
                </div>
                
                {bill.referenceNumber && bill.referenceNumber !== "N/A" && (
                  <div className="text-muted">
                    Reference No: <span className="text-ink font-bold">{bill.referenceNumber}</span>
                  </div>
                )}

                {bill.receiptUrl && (
                  <div className="space-y-1 pt-1 border-t border-forest/10">
                    <span className="text-muted block">Larawan ng Resibo / Proof:</span>
                    <div 
                      onClick={() => setSelectedReceipt(bill.receiptUrl!)}
                      className="relative group rounded-lg overflow-hidden border border-line bg-paper h-28 w-full flex items-center justify-center cursor-pointer"
                    >
                      <Image 
                        src={bill.receiptUrl} 
                        alt="Payment Proof" 
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover rounded-md transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs z-10">
                        Tignan nang Buo ↗
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Stamp: Animated BAYAD NA! */}
            <div className="stamp-anim pointer-events-none absolute right-[10px] top-[32%] rotate-[-8deg] rounded-[10px] border-[3px] border-coral bg-paper-card/95 px-3 py-1 font-display text-[16px] font-extrabold tracking-wide text-coral shadow-sm">
              BAYAD NA!
            </div>

            {/* Footer status text */}
            <div className="mt-5 border-t border-line/60 pt-3 text-center font-mono-brand text-[11px] font-bold text-forest">
              <span>Kumpleto na ang bayad sa buwang ito</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para sa Resibo Preview */}
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
            <div className="relative h-[60vh] w-full rounded-2xl overflow-hidden border border-line bg-paper">
              <Image 
                src={selectedReceipt} 
                alt="Proof of Payment Full" 
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}