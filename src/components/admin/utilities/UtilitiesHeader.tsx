"use client";

import { UtilityRate } from "@/src/types/utility";

interface UtilitiesHeaderProps {
  rates: UtilityRate[];
  onUpdateRate: (id: string, newRate: number) => void;
  onAssignBill: () => void;
}

export function UtilitiesHeader({
  rates,
  onUpdateRate,
  onAssignBill,
}: UtilitiesHeaderProps) {
  const getIcon = (type: UtilityRate["type"]) => {
    switch (type) {
      case "electricity": return "⚡";
      case "water": return "💧";
      case "internet": return "🌐";
      case "amenities": return "🧹";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-forest/20 bg-gradient-to-r from-forest via-forest-deep to-forest p-6 text-white shadow-md sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-marigold/20 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-marigold backdrop-blur-md">
              <span>💡</span> Utility Management & Metering
            </div>
            <h1 className="mt-2 font-display text-2xl font-black sm:text-3xl lg:text-4xl">
              Utilities at Kuryente/Tubig
            </h1>
            <p className="mt-1 text-xs text-white/80 sm:text-sm">
              I-set ang rates at mag-assign ng bill o sub-meter reading sa bawat kwarto.
            </p>
          </div>

          <button
            onClick={onAssignBill}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-coral px-5 py-3 font-mono-brand text-xs font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-coral-deep active:translate-y-0"
          >
            <span className="text-base font-black">+</span> Mag-assign ng Bill
          </button>
        </div>
      </div>

      {/* Global Rates Quick Config */}
      <div>
        <h2 className="font-mono-brand text-xs font-bold uppercase tracking-wider text-muted mb-3">
          Kasalukuyang Utility Rates (Per Unit / Fixed)
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {rates.map((rate) => (
            <div
              key={rate.id}
              className="flex items-center justify-between rounded-2xl border border-line bg-paper-card p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getIcon(rate.type)}</span>
                <div>
                  <h3 className="font-bold text-forest-deep text-xs sm:text-sm">
                    {rate.name}
                  </h3>
                  <p className="text-[10px] text-muted font-mono-brand">
                    per {rate.unitLabel}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 font-mono-brand font-bold text-forest-deep text-sm">
                <span>₱</span>
                <input
                  type="number"
                  value={rate.ratePerUnit}
                  onChange={(e) => onUpdateRate(rate.id, Number(e.target.value))}
                  className="w-16 rounded-lg border border-line bg-paper px-2 py-1 text-right text-xs font-bold outline-none focus:border-forest"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}