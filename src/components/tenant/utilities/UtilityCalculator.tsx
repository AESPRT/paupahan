"use client";

import { useState } from "react";
import { UtilityRate } from "@/src/types/tenant-utilities";

interface UtilityCalculatorProps {
  rates: UtilityRate[];
}

export function UtilityCalculator({ rates }: UtilityCalculatorProps) {
  const elecRate = rates.find((r) => r.type === "electricity")?.ratePerUnit || 0;
  const waterRate = rates.find((r) => r.type === "water")?.ratePerUnit || 0;

  const [elecUsed, setElecUsed] = useState<string>("");
  const [waterUsed, setWaterUsed] = useState<string>("");

  const elecCost = (parseFloat(elecUsed) || 0) * elecRate;
  const waterCost = (parseFloat(waterUsed) || 0) * waterRate;
  const totalEstimate = elecCost + waterCost;

  return (
    <div className="rounded-3xl border border-line bg-paper-card p-5 sm:p-6 shadow-sm space-y-4">
      {/* Title Header */}
      <div className="border-b border-line pb-3 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest/10 text-forest shrink-0">
          {/* Calculator SVG Icon */}
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-forest-deep sm:text-lg">
            Calculator: Tantyahin ang Kuryente at Tubig
          </h2>
          <p className="text-[11px] text-muted sm:text-xs">
            Subukang i-input ang tantya mong nagamit na units para malaman ang tantyang babayaran.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Electricity Input */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 space-y-2">
          <label className="flex items-center gap-1.5 font-display text-xs font-bold text-amber-900">
            {/* Bolt / Lightning SVG Icon */}
            <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Inaasahang Nagamit sa Kuryente (kWh)
          </label>
          <input
            type="number"
            placeholder="e.g. 50"
            value={elecUsed}
            onChange={(e) => setElecUsed(e.target.value)}
            className="w-full rounded-xl border border-amber-300 bg-white px-3.5 py-2 font-mono-brand text-xs font-bold text-forest-deep outline-none focus:ring-2 focus:ring-amber-400"
          />
          <div className="flex justify-between text-[11px] font-mono-brand pt-1 text-amber-800">
            <span>Rate: ₱{elecRate.toFixed(2)} / kWh</span>
            <span className="font-bold">Tantya: ₱{elecCost.toFixed(2)}</span>
          </div>
        </div>

        {/* Water Input */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4 space-y-2">
          <label className="flex items-center gap-1.5 font-display text-xs font-bold text-blue-900">
            {/* Water Drop SVG Icon */}
            <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Inaasahang Nagamit sa Tubig (m³)
          </label>
          <input
            type="number"
            placeholder="e.g. 10"
            value={waterUsed}
            onChange={(e) => setWaterUsed(e.target.value)}
            className="w-full rounded-xl border border-blue-300 bg-white px-3.5 py-2 font-mono-brand text-xs font-bold text-forest-deep outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="flex justify-between text-[11px] font-mono-brand pt-1 text-blue-800">
            <span>Rate: ₱{waterRate.toFixed(2)} / m³</span>
            <span className="font-bold">Tantya: ₱{waterCost.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Estimated Output Total */}
      <div className="flex items-center justify-between rounded-2xl bg-forest/10 p-4 border border-forest/20">
        <span className="font-mono-brand text-xs font-bold text-forest-deep">
          Tantyang Kabuuang Utility Cost:
        </span>
        <span className="font-display text-xl font-black text-forest-deep">
          ₱{totalEstimate.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}