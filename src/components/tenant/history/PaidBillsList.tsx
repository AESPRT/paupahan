/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { PaidBillHistory } from "@/src/types/tenant/tenant-history";
import Image from "next/image";
import { useState } from "react";
import { Zap, Droplets, ExternalLink } from "lucide-react";

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
        {bills.map((bill) => {
          // Kunin ang mga submeter/utility items kung available sa bill data
          const electricityAmount = bill.electricityAmount || (bill as any).electricity?.amount || 0;
          const waterAmount = bill.waterAmount || (bill as any).water?.amount || 0;
          const rentAmount = bill.rentAmount || (bill as any).rent?.amount || 0;

          // Utility readings breakdown kung meron man
          const electricityItem = (bill as any).electricity;
          const waterItem = (bill as any).water;

          return (
            <div
              key={bill.id}
              className="perforated relative flex flex-col justify-between rounded-2xl border border-line bg-paper-card p-5 pb-6 shadow-[0_8px_24px_rgba(27,58,52,0.08)] transition-all hover:-translate-y-1 overflow-hidden"
            >
              {/* ✨ Watermark Stamp sa Gitna (Mababa ang transparency, mukhang tunay na tatak) */}
              <div className="stamp-anim pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                <div className="rotate-[-14deg] rounded-3xl border-[4px] border-[var(--coral)] bg-transparent px-7 py-3 font-display text-[34px] font-black tracking-widest text-[var(--coral)] shadow-none select-none opacity-30">
                  BAYAD NA!
                </div>
              </div>

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
                      ₱{rentAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {electricityAmount > 0 && (
                    <div className="flex justify-between font-mono-brand text-[12.5px] text-ink">
                      <span className="text-muted">Kuryente (Electricity)</span>
                      <span className="font-semibold">
                        ₱{electricityAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  {waterAmount > 0 && (
                    <div className="flex justify-between font-mono-brand text-[12.5px] text-ink">
                      <span className="text-muted">Tubig (Water)</span>
                      <span className="font-semibold">
                        ₱{waterAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>

                {/* SUBMETER READINGS BREAKDOWN (Kung may readings data) */}
                {(electricityItem?.consumed !== undefined || waterItem?.consumed !== undefined) && (
                  <div className="mt-3 rounded-xl bg-forest/5 p-3 border border-forest/10 space-y-2.5">
                    <div className="font-mono-brand text-[10px] font-bold text-forest-deep uppercase tracking-wider flex items-center gap-1.5 border-b border-forest/10 pb-1.5">
                      <span>Submeter Readings Breakdown</span>
                    </div>

                    {/* Kuryente Breakdown */}
                    {electricityItem && electricityItem.consumed !== undefined && (
                      <div className="space-y-1 font-mono-brand text-[11px]">
                        <div className="flex items-center justify-between font-bold text-ink">
                          <span className="flex items-center gap-1 text-amber-600">
                            <Zap className="w-3.5 h-3.5" /> Kuryente ({electricityItem.unitLabel || 'kWh'}):
                          </span>
                          <span className="text-forest-deep font-extrabold">
                            {Number(electricityItem.consumed).toLocaleString()} {electricityItem.unitLabel || 'kWh'} consumed
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10.5px] text-muted bg-paper p-1.5 rounded-lg border border-line/40">
                          <div>Prev: <span className="text-ink font-bold">{Number(electricityItem.previousReading || 0).toLocaleString()}</span></div>
                          <div className="text-right">Curr: <span className="text-ink font-bold">{Number(electricityItem.currentReading || 0).toLocaleString()}</span></div>
                        </div>
                      </div>
                    )}

                    {/* Tubig Breakdown */}
                    {waterItem && waterItem.consumed !== undefined && (
                      <div className="space-y-1 font-mono-brand text-[11px] pt-1">
                        <div className="flex items-center justify-between font-bold text-ink">
                          <span className="flex items-center gap-1 text-sky-600">
                            <Droplets className="w-3.5 h-3.5" /> Tubig ({waterItem.unitLabel || 'm³'}):
                          </span>
                          <span className="text-forest-deep font-extrabold">
                            {Number(waterItem.consumed).toLocaleString()} {waterItem.unitLabel || 'm³'} consumed
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10.5px] text-muted bg-paper p-1.5 rounded-lg border border-line/40">
                          <div>Prev: <span className="text-ink font-bold">{Number(waterItem.previousReading || 0).toLocaleString()}</span></div>
                          <div className="text-right">Curr: <span className="text-ink font-bold">{Number(waterItem.currentReading || 0).toLocaleString()}</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
                        className="relative group rounded-xl overflow-hidden border border-line bg-paper h-32 w-full flex items-center justify-center cursor-pointer transition-all hover:border-forest"
                      >
                        <Image 
                          src={bill.receiptUrl} 
                          alt="Payment Proof" 
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover rounded-lg transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white font-bold text-xs z-10">
                          Tignan nang Buo <ExternalLink className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer status text */}
              <div className="mt-5 border-t border-line/60 pt-3 text-center font-mono-brand text-[11px] font-bold text-forest">
                <span>Kumpleto na ang bayad sa buwang ito</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para sa Resibo Preview */}
      {selectedReceipt && (
        <div 
          onClick={() => setSelectedReceipt(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative w-full max-w-2xl rounded-3xl border border-line/80 bg-paper-card p-5 sm:p-6 shadow-2xl flex flex-col space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-line/60 pb-3">
              <h4 className="font-display text-sm font-bold text-forest-deep tracking-wide">
                Resibo ng Pagbabayad (Payment Proof)
              </h4>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="group flex h-8 w-8 items-center justify-center rounded-full bg-paper text-muted hover:bg-coral/10 hover:text-coral-deep transition-all border border-line/60"
              >
                ✕
              </button>
            </div>
            <div className="relative h-[65vh] w-full rounded-2xl overflow-hidden border border-line/40 bg-forest-deep/5 flex items-center justify-center">
              <Image 
                src={selectedReceipt} 
                alt="Proof of Payment Full" 
                fill
                sizes="(max-width: 1024px) 100vw, 700px"
                className="object-contain p-2"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}